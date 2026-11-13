#!/usr/bin/env python3
"""
Evaluasi Akurasi Deterministik & Confusion Matrix 60 Draf Multi-Strata WASKITA
Landasan: Bab 2.4.1 (Tabel Kontingensi) & Bab 3.5.1 (Pengujian Black-Box & Metrik Ilmiah)
Mencakup 15 Topik Lintas Disiplin x 4 Varian Kontras (30 Positif vs 30 Negatif)
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

from app.fixtures.benchmark_corpus import get_fallback_corpus
from app.schemas.audit import ThresholdConfig
from app.services.gatekeeper import calculate_composite_cds, generate_annotated_spans
from app.services.information_gain import calculate_information_gain
from app.services.nlp_pipeline import extract_candidate_entities, extract_full_stem_set, preprocess_text_async
from app.services.serp_scraper import search_and_scrape_competitors
from app.services.stylometrics import calculate_stylometrics
from app.services.vsm_calculator import compute_vsm_similarity


async def evaluate_draft(draft: Dict[str, Any], thresholds: ThresholdConfig) -> Dict[str, Any]:
    """Mengeksekusi pipa IR Engine secara jujur end-to-end pada satu draf artikel."""
    query = draft["target_query"]
    content = draft["draft_content"]
    title = draft["draft_title"]
    ground_truth = draft["ground_truth_label"]
    stratum = draft.get("stratum", "P1" if ground_truth == "Layak Terbit" else "N5")

    # 1. Akuisisi kompetitor SERP (Gunakan korpus benchmark deterministik offline untuk reproduktibilitas ilmiah)
    competitor_docs = get_fallback_corpus(query)
    if not competitor_docs:
        competitor_docs = await search_and_scrape_competitors(query)

    # 2. Preprocessing & Stemming korpus via PySastrawi (async)
    prep_draft = await preprocess_text_async(content)
    prep_competitors = [
        await preprocess_text_async(c.get("clean_text", ""))
        for c in competitor_docs
    ]

    # 3. VSM Sublinear TF-IDF, Cosine Similarity & Euclidean Distance
    vsm_results = compute_vsm_similarity(prep_draft, prep_competitors)

    # 4. Ekstraksi Entitas & Information Gain (Sprint 4.1 Full-Set & Consensus)
    full_draft_stems = extract_full_stem_set(content)
    full_comp_stems_list = [
        extract_full_stem_set(c.get("clean_text", ""))
        for c in competitor_docs
    ]

    draft_entities = extract_candidate_entities(content, top_n=40)
    competitor_entities_list = [
        extract_candidate_entities(c.get("clean_text", ""), top_n=35)
        for c in competitor_docs
    ]
    entity_gaps = calculate_information_gain(
        draft_entities=draft_entities,
        competitor_entities_list=competitor_entities_list,
        draft_tfidf_weights=vsm_results["draft_tfidf_weights"],
        full_draft_stems=full_draft_stems,
        full_competitor_stems_list=full_comp_stems_list,
    )

    # 5. Analisis Stilometri (TTR, MATTR w=50, HKO %)
    stylometrics = calculate_stylometrics(content, query)

    # 6. Analisis Stabilo Kalimat & Deteksi Red-Span (Sprint 4.0 & 4.4)
    annotated_spans = generate_annotated_spans(
        draft_content=content,
        competitor_clean_texts=[c.get("clean_text", "") for c in competitor_docs],
        entity_gaps=entity_gaps,
        hko_percentage=stylometrics["hko_percentage"],
        threshold_hko=thresholds.max_hko_percentage,
    )

    red_spans = [span for span in annotated_spans if span.color == "red"]
    red_span_ratio = len(red_spans) / max(1, len(annotated_spans))

    max_consecutive_red = 0
    curr_consecutive_red = 0
    for span in annotated_spans:
        if span.is_heading or not span.text.strip():
            continue
        if span.color == "red":
            curr_consecutive_red += 1
            if curr_consecutive_red > max_consecutive_red:
                max_consecutive_red = curr_consecutive_red
        else:
            curr_consecutive_red = 0

    # 7. Himpunan Irisan Entitas Konsensus (Sprint 4.1 & 4.3 80% Saturation)
    serp_candidate_stems = {e[0] for ce in competitor_entities_list for e in ce}
    consensus_serp_stems = set()
    if len(full_comp_stems_list) >= 2:
        for st in serp_candidate_stems:
            doc_freq = sum(1 for c_set in full_comp_stems_list if st in c_set)
            if doc_freq >= 2:
                consensus_serp_stems.add(st)
    if not consensus_serp_stems:
        consensus_serp_stems = serp_candidate_stems

    shared_consensus = consensus_serp_stems.intersection(full_draft_stems)

    # 8. Gatekeeper Composite CDS & Aturan Vonis (Sprint 3.1 Topic Relevance & Sprint 4.0 Red-Span Veto)
    decision = calculate_composite_cds(
        max_cosine_sim=vsm_results["max_cosine_similarity"],
        draft_entities_count=len(full_draft_stems),
        serp_entities_count=len(consensus_serp_stems),
        shared_entities_count=len(shared_consensus),
        gain_count=len(entity_gaps.gain),
        mattr_score=stylometrics["mattr_score"],
        hko_percentage=stylometrics["hko_percentage"],
        thresholds=thresholds,
        avg_cosine_sim=vsm_results["avg_cosine_similarity"],
        red_span_ratio=red_span_ratio,
        max_consecutive_red=max_consecutive_red,
    )

    predicted_verdict = decision["verdict_status"]

    # Pemetaan status kecocokan
    # Ground Truth: 'Layak Terbit' (Positif) atau 'Perlu Revisi' (Negatif)
    # Sistem Prediksi: 'Siap Terbit' / 'Layak Terbit' (Positif) atau 'Perlu Revisi*' (Negatif)
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
        "stratum": stratum,
        "title": title,
        "query": query,
        "word_count": draft.get("word_count", len(content.split())),
        "ground_truth": ground_truth,
        "predicted_verdict": predicted_verdict,
        "cds_score": decision["content_differentiation_score"],
        "mattr_score": stylometrics["mattr_score"],
        "hko_percentage": stylometrics["hko_percentage"],
        "max_cosine_sim": vsm_results["max_cosine_similarity"],
        "avg_cosine_sim": vsm_results["avg_cosine_similarity"],
        "red_span_ratio": round(red_span_ratio, 3),
        "max_consecutive_red": max_consecutive_red,
        "is_redundant": decision["is_redundant"],
        "is_keyword_stuffed": decision["is_keyword_stuffed"],
        "is_out_of_domain": decision["is_out_of_domain"],
        "confusion_category": category,
        "is_match": is_match,
    }


async def run_accuracy_evaluation(fixtures_path: str = None) -> Dict[str, Any]:
    """Mengevaluasi seluruh draf pada dataset fixture (default 60 draf multi-strata) dan menyusun Confusion Matrix."""
    if fixtures_path is None:
        f60 = os.path.join(BASE_DIR, "tests", "fixtures", "dataset_60_drafts.json")
        f30 = os.path.join(BASE_DIR, "tests", "fixtures", "dataset_30_drafts.json")
        fixtures_path = f60 if os.path.exists(f60) else f30

    with open(fixtures_path, "r", encoding="utf-8") as f:
        drafts = json.load(f)

    thresholds = ThresholdConfig(
        max_cosine_similarity=0.60,
        min_mattr=0.55,
        max_hko_percentage=40.0,
        min_cds_score=75.0,
    )

    results: List[Dict[str, Any]] = []
    print("=" * 120)
    print(f"   EVALUASI AKURASI DETERMINISTIK {len(drafts)} DRAF ARTIKEL WEB (IR ENGINE WASKITA - BAB 2.4 & 3.5 TA)")
    print("=" * 120)
    print(f"{'ID':<15} | {'Str':<3} | {'Judul Artikel':<30} | {'Words':<5} | {'MATTR':<6} | {'HKO%':<5} | {'CDS%':<5} | {'Ground Truth':<12} | {'Prediksi':<22} | {'Status'}")
    print("-" * 120)

    tp = tn = fp = fn = 0
    strata_performance: Dict[str, Dict[str, int]] = {}

    for d in drafts:
        res = await evaluate_draft(d, thresholds)
        results.append(res)

        st = res["stratum"]
        if st not in strata_performance:
            strata_performance[st] = {"total": 0, "correct": 0}
        strata_performance[st]["total"] += 1

        cat = res["confusion_category"]
        if cat == "TP":
            tp += 1
            strata_performance[st]["correct"] += 1
        elif cat == "TN":
            tn += 1
            strata_performance[st]["correct"] += 1
        elif cat == "FP":
            fp += 1
        elif cat == "FN":
            fn += 1

        match_str = "MATCH" if res["is_match"] else "MISMATCH"
        print(f"{res['id']:<15} | {st:<3} | {res['title'][:30]:<30} | {res['word_count']:<5} | {res['mattr_score']:<6.4f} | {res['hko_percentage']:<4.1f}% | {res['cds_score']:<5.1f}% | {res['ground_truth']:<12} | {res['predicted_verdict'][:22]:<22} | {match_str} ({cat})")

    total = len(results)
    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print("=" * 120)
    print("\n" + "=" * 60)
    print("           TABEL CONFUSION MATRIX (2x2)")
    print("=" * 60)
    print(f"{'':<20} | {'Pred: Layak Terbit':<17} | {'Pred: Perlu Revisi':<17}")
    print("-" * 60)
    print(f"{'Aktual: Layak Terbit':<20} | {f'TP = {tp}':<17} | {f'FN = {fn}':<17}")
    print(f"{'Aktual: Perlu Revisi':<20} | {f'FP = {fp}':<17} | {f'TN = {tn}':<17}")
    print("=" * 60)

    print("\n" + "=" * 60)
    print("       METRIK KINERJA & AKURASI ILMIAH (BAB 3.5 TA)")
    print("=" * 60)
    print(f"Total Sampel Uji      : {total} Draf Artikel Riil")
    print(f"True Positive  (TP)   : {tp} Draf")
    print(f"True Negative  (TN)   : {tn} Draf")
    print(f"False Positive (FP)   : {fp} Draf")
    print(f"False Negative (FN)   : {fn} Draf")
    print("-" * 60)
    print(f"Accuracy              : {accuracy * 100:.2f}% ({accuracy:.4f})")
    print(f"Precision (Pers. 2.6) : {precision * 100:.2f}% ({precision:.4f})")
    print(f"Recall    (Pers. 2.7) : {recall * 100:.2f}% ({recall:.4f})")
    print(f"F1-Score  (Pers. 2.8) : {f1_score * 100:.2f}% ({f1_score:.4f})")
    print("=" * 60)

    print("\n" + "=" * 60)
    print("      PERFORMA DETAIL PER STRATA (EVALUASI MULTI-STRATA)")
    print("=" * 60)
    for st, data in sorted(strata_performance.items()):
        pct = (data["correct"] / data["total"]) * 100 if data["total"] > 0 else 0
        print(f"Strata {st:<3} : {data['correct']:>2}/{data['total']:>2} Sukses ({pct:>5.1f}%)")
    print("=" * 60 + "\n")

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
        "strata_performance": strata_performance,
        "detailed_results": results,
    }

    report_file = os.path.join(BASE_DIR, "tests", "fixtures", "accuracy_evaluation_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary


# Integrasi Pytest untuk eksekusi via pytest test suite
def test_accuracy_evaluation():
    """Test suite otomatis pytest yang memverifikasi metrik akurasi >= 90% pada 60 draf multi-strata."""
    summary = asyncio.run(run_accuracy_evaluation())
    metrics = summary["metrics"]
    cm = summary["confusion_matrix"]

    assert summary["total_samples"] >= 30
    assert cm["TP"] + cm["TN"] + cm["FP"] + cm["FN"] == summary["total_samples"]
    assert metrics["precision"] >= 0.90
    assert metrics["recall"] >= 0.90
    assert metrics["f1_score"] >= 0.90
    assert metrics["accuracy"] >= 0.90


if __name__ == "__main__":
    asyncio.run(run_accuracy_evaluation())
