#!/usr/bin/env python3
"""
Evaluasi Akurasi Deterministik & Confusion Matrix 30 Draf Uji WASKITA
Landasan: Bab 2.4.1 (Tabel Kontingensi) & Bab 3.5.1 (Pengujian Black-Box & Metrik Ilmiah)
Metrik Ilmiah:
- Precision  (Persamaan 2.6): TP / (TP + FP)
- Recall     (Persamaan 2.7): TP / (TP + FN)
- F1-Score   (Persamaan 2.8): 2 * (Precision * Recall) / (Precision + Recall)
- Accuracy   : (TP + TN) / (TP + TN + FP + FN)

Eksekusi jujur end-to-end tanpa mocking fungsi matematis!
"""

import asyncio
import json
import os
import sys
from typing import Any, Dict, List, Tuple

# Tambahkan direktori root backend ke PYTHONPATH
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from app.schemas.audit import ThresholdConfig
from app.services.gatekeeper import calculate_composite_cds
from app.services.information_gain import calculate_information_gain
from app.services.nlp_pipeline import extract_candidate_entities, preprocess_text_async
from app.services.serp_scraper import search_and_scrape_competitors
from app.services.stylometrics import calculate_stylometrics
from app.services.vsm_calculator import compute_vsm_similarity


async def evaluate_draft(draft: Dict[str, Any], thresholds: ThresholdConfig) -> Dict[str, Any]:
    """Mengeksekusi pipa IR Engine secara jujur end-to-end pada satu draf artikel."""
    query = draft["target_query"]
    content = draft["draft_content"]
    title = draft["draft_title"]
    ground_truth = draft["ground_truth_label"]

    # 1. Akuisisi kompetitor SERP (Fallback offline benchmark deterministik jika tanpa Serper API Key)
    competitor_docs = await search_and_scrape_competitors(query)

    # 2. Preprocessing & Stemming korpus via PySastrawi (async)
    prep_draft = await preprocess_text_async(content)
    prep_competitors = [
        await preprocess_text_async(c.get("clean_text", ""))
        for c in competitor_docs
    ]

    # 3. VSM Sublinear TF-IDF, Cosine Similarity & Euclidean Distance
    vsm_results = compute_vsm_similarity(prep_draft, prep_competitors)

    # 4. Ekstraksi Entitas & Information Gain
    draft_entities = extract_candidate_entities(content, top_n=30)
    competitor_entities_list = [
        extract_candidate_entities(c.get("clean_text", ""), top_n=25)
        for c in competitor_docs
    ]
    entity_gaps = calculate_information_gain(
        draft_entities=draft_entities,
        competitor_entities_list=competitor_entities_list,
        draft_tfidf_weights=vsm_results["draft_tfidf_weights"],
    )

    # 5. Analisis Stilometri (TTR, MATTR w=50, HKO %)
    stylometrics = calculate_stylometrics(content, query)

    # 6. Himpunan Irisan Entitas
    draft_stems = {e[0] for e in draft_entities}
    serp_stems = {e[0] for ce in competitor_entities_list for e in ce}
    shared_entities = draft_stems.intersection(serp_stems)

    # 7. Gatekeeper Composite CDS & Aturan Vonis
    decision = calculate_composite_cds(
        max_cosine_sim=vsm_results["max_cosine_similarity"],
        draft_entities_count=len(draft_stems),
        serp_entities_count=len(serp_stems),
        shared_entities_count=len(shared_entities),
        gain_count=len(entity_gaps.gain),
        mattr_score=stylometrics["mattr_score"],
        hko_percentage=stylometrics["hko_percentage"],
        thresholds=thresholds,
    )

    predicted_verdict = decision["verdict_status"]

    # Pemetaan status kecocokan
    # Ground Truth: 'Layak Terbit' (Positif) atau 'Perlu Revisi' (Negatif)
    # Sistem Prediksi: 'Siap Terbit' / 'Layak Terbit' (Positif) atau 'Perlu Revisi' (Negatif)
    is_positive_gt = (ground_truth == "Layak Terbit")
    is_positive_pred = (predicted_verdict in ("Siap Terbit", "Layak Terbit"))

    if is_positive_gt and is_positive_pred:
        category = "TP"  # True Positive
        is_match = True
    elif not is_positive_gt and not is_positive_pred:
        category = "TN"  # True Negative
        is_match = True
    elif not is_positive_gt and is_positive_pred:
        category = "FP"  # False Positive
        is_match = False
    else:
        category = "FN"  # False Negative
        is_match = False

    return {
        "id": draft["id"],
        "title": title,
        "query": query,
        "word_count": draft.get("word_count", len(content.split())),
        "ground_truth": ground_truth,
        "predicted_verdict": predicted_verdict,
        "cds_score": decision["content_differentiation_score"],
        "mattr_score": stylometrics["mattr_score"],
        "hko_percentage": stylometrics["hko_percentage"],
        "max_cosine_sim": vsm_results["max_cosine_similarity"],
        "is_redundant": decision["is_redundant"],
        "is_keyword_stuffed": decision["is_keyword_stuffed"],
        "confusion_category": category,
        "is_match": is_match,
    }


async def run_accuracy_evaluation(fixtures_path: str = None) -> Dict[str, Any]:
    """Mengevaluasi seluruh 30 draf pada dataset fixture dan menyusun Confusion Matrix."""
    if fixtures_path is None:
        fixtures_path = os.path.join(BASE_DIR, "tests", "fixtures", "dataset_30_drafts.json")

    with open(fixtures_path, "r", encoding="utf-8") as f:
        drafts = json.load(f)

    thresholds = ThresholdConfig(
        max_cosine_similarity=0.60,
        min_mattr=0.55,
        max_hko_percentage=40.0,
        min_cds_score=75.0,
    )

    results: List[Dict[str, Any]] = []
    print("=" * 110)
    print("   EVALUASI AKURASI DETERMINISTIK 30 DRAF ARTIKEL WEB (IR ENGINE WASKITA - BAB 2.4 & 3.5 TA)")
    print("=" * 110)
    print(f"{'ID':<10} | {'Judul Artikel':<32} | {'Words':<5} | {'MATTR':<6} | {'HKO%':<6} | {'CDS%':<6} | {'Ground Truth':<12} | {'Prediksi':<12} | {'Status'}")
    print("-" * 110)

    tp = tn = fp = fn = 0

    for d in drafts:
        res = await evaluate_draft(d, thresholds)
        results.append(res)

        cat = res["confusion_category"]
        if cat == "TP":
            tp += 1
        elif cat == "TN":
            tn += 1
        elif cat == "FP":
            fp += 1
        elif cat == "FN":
            fn += 1

        match_str = "MATCH" if res["is_match"] else "MISMATCH"
        print(f"{res['id']:<10} | {res['title'][:32]:<32} | {res['word_count']:<5} | {res['mattr_score']:<6.4f} | {res['hko_percentage']:<5.1f}% | {res['cds_score']:<5.1f}% | {res['ground_truth']:<12} | {res['predicted_verdict']:<12} | {match_str} ({cat})")

    total = len(results)
    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print("=" * 110)
    print("\n" + "=" * 55)
    print("           TABEL CONFUSION MATRIX (2x2)")
    print("=" * 55)
    print(f"{'':<20} | {'Pred: Layak Terbit':<17} | {'Pred: Perlu Revisi':<17}")
    print("-" * 55)
    print(f"{'Aktual: Layak Terbit':<20} | {f'TP = {tp}':<17} | {f'FN = {fn}':<17}")
    print(f"{'Aktual: Perlu Revisi':<20} | {f'FP = {fp}':<17} | {f'TN = {tn}':<17}")
    print("=" * 55)

    print("\n" + "=" * 55)
    print("       METRIK KINERJA & AKURASI ILMIAH (BAB 3.5 TA)")
    print("=" * 55)
    print(f"Total Sampel Uji      : {total} Draf Artikel Riil")
    print(f"True Positive  (TP)   : {tp} Draf")
    print(f"True Negative  (TN)   : {tn} Draf")
    print(f"False Positive (FP)   : {fp} Draf")
    print(f"False Negative (FN)   : {fn} Draf")
    print("-" * 55)
    print(f"Accuracy              : {accuracy * 100:.2f}% ({accuracy:.4f})")
    print(f"Precision (Pers. 2.6) : {precision * 100:.2f}% ({precision:.4f})")
    print(f"Recall    (Pers. 2.7) : {recall * 100:.2f}% ({recall:.4f})")
    print(f"F1-Score  (Pers. 2.8) : {f1_score * 100:.2f}% ({f1_score:.4f})")
    print("=" * 55 + "\n")

    summary = {
        "total_samples": total,
        "confusion_matrix": {
            "TP": tp,
            "TN": tn,
            "FP": fp,
            "FN": fn,
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1_score, 4),
            "accuracy_percentage": f"{accuracy * 100:.2f}%",
            "precision_percentage": f"{precision * 100:.2f}%",
            "recall_percentage": f"{recall * 100:.2f}%",
            "f1_score_percentage": f"{f1_score * 100:.2f}%",
        },
        "detailed_results": results,
    }

    # Simpan hasil evaluasi ke fixtures sebagai bukti laporan Tugas Akhir
    report_file = os.path.join(BASE_DIR, "tests", "fixtures", "accuracy_evaluation_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary


# Integrasi Pytest untuk eksekusi via pytest test suite
def test_accuracy_evaluation():
    """Test suite otomatis pytest yang memverifikasi metrik akurasi >= 90%."""
    summary = asyncio.run(run_accuracy_evaluation())
    metrics = summary["metrics"]
    cm = summary["confusion_matrix"]

    assert summary["total_samples"] == 30
    assert cm["TP"] + cm["TN"] + cm["FP"] + cm["FN"] == 30
    assert metrics["precision"] >= 0.90
    assert metrics["recall"] >= 0.90
    assert metrics["f1_score"] >= 0.90
    assert metrics["accuracy"] >= 0.90


if __name__ == "__main__":
    asyncio.run(run_accuracy_evaluation())
