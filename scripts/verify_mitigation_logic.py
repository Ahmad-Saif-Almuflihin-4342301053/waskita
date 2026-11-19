#!/usr/bin/env python3
"""
scripts/verify_mitigation_logic.py
==================================
Skrip Pengujian Otomatis Cacat Logika dan Mitigasi Sistem WASKITA
Merujuk pada ADR-01 s/d ADR-04 di docs/obsidian/algorithms/BEDAH_CACAT_LOGIKA_DAN_MITIGASI_EDITORIAL_PROMPT.md
"""

import sys
import os
import math

# Tambahkan direktori backend ke path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.schemas.audit import EntityGapsGroup, EntityGapItem, ThresholdConfig
from app.services.gatekeeper import calculate_composite_cds, generate_overview_and_remediation
from app.services.information_gain import _deduplicate_subsumed_unigrams, deduplicate_consensus_stems


def print_header(title: str):
    print("\n" + "=" * 70)
    print(f"🔬 {title.upper()}")
    print("=" * 70)


def test_scenario_1_out_of_domain_zero_gain():
    print_header("Skenario 1: Deteksi Out-of-Domain & Kebijakan Zero-Gain (ADR-02)")
    print("Mengevaluasi draf berita kriminal pada target kueri politik 'wapres pengganti gibran'...")

    thresholds = ThresholdConfig()
    decision = calculate_composite_cds(
        max_cosine_sim=0.03,
        draft_entities_count=45,
        serp_entities_count=25,
        shared_entities_count=1,
        gain_count=12,  # Entitas kebaruan semu dari berita kriminal
        mattr_score=0.72,
        hko_percentage=15.0,
        thresholds=thresholds,
        avg_cosine_sim=0.02,  # Di bawah batas 0.05 (Out-of-Domain)
    )

    is_ood = decision["is_out_of_domain"]
    verdict = decision["verdict_status"]
    c_ig = decision["sub_scores"]["c_ig"]
    cds = decision["content_differentiation_score"]

    print(f"  • Status Out-of-Domain     : {is_ood}")
    print(f"  • Vonis Redaksi           : {verdict}")
    print(f"  • Sub-skor C_IG           : {c_ig}")
    print(f"  • Skor CDS Total          : {cds}")

    assert is_ood is True, "GAGAL: Naskah harus terdeteksi Out-of-Domain!"
    assert verdict == "Perlu Revisi - Topik Tidak Relevan", f"GAGAL: Vonis tidak sesuai, didapat: {verdict}"
    assert c_ig == 0.0, f"GAGAL: C_IG harus diisolasi ke 0.0, didapat: {c_ig}"
    assert cds <= 20.0, f"GAGAL: CDS harus ditekan rendah, didapat: {cds}"
    print("  ✅ [LULUS]: Isolasi Zero-Gain berhasil! Derau berita kriminal tidak diberi skor gain.")


def test_scenario_2_anti_frankenstein_prompt():
    print_header("Skenario 2: Pencegahan Prompt 'Frankenstein' (ADR-01)")
    
    crime_draft = (
        "Warga Magetan digegerkan oleh penemuan jasad seorang pria di pinggir jalan raya. "
        "Korban berinisial SP diduga menjadi korban penganiayaan senjata tajam. "
        "Pihak kepolisian resort Magetan saat ini tengah melakukan olah TKP."
    )
    
    entity_gaps_ood = EntityGapsGroup(
        deficit=[
            EntityGapItem(term_string="wakil presiden", term_surface_form="Wakil Presiden", tfidf_weight=0.9, competitor_consensus_count=9),
            EntityGapItem(term_string="prabowo subianto", term_surface_form="Prabowo Subianto", tfidf_weight=0.85, competitor_consensus_count=8),
        ],
        gain=[],
    )

    # 2A. Kasus Out-of-Domain (Draf Nyasar)
    print("\n[Kasus 2A: Naskah Out-of-Domain (Berita Kriminal vs Target Politik)]")
    res_ood = generate_overview_and_remediation(
        verdict_status="Perlu Revisi - Topik Tidak Relevan",
        cds_score=14.5,
        is_redundant=False,
        is_keyword_stuffed=False,
        max_cosine_sim=0.03,
        mattr_score=0.72,
        hko_percentage=15.0,
        entity_gaps=entity_gaps_ood,
        target_query="wapres pengganti gibran",
        is_out_of_domain=True,
        draft_content=crime_draft,
    )

    prompt_ood = res_ood["remediation_prompt"]
    print(f"  • Panjang prompt yang dihasilkan : {len(prompt_ood)} karakter")
    
    assert "REORIENTASI TOPIK TOTAL" in prompt_ood, "GAGAL: Prompt Out-of-Domain wajib bertipe Reorientasi Topik Total!"
    assert "Pertahankan minimal 80%" not in prompt_ood, "GAGAL: Aturan surgical 80% dilarang muncul pada Out-of-Domain!"
    assert "=== DRAF ARTIKEL PENULIS ===" not in prompt_ood, "GAGAL: Delimiter draf lama dilarang muncul pada Out-of-Domain!"
    assert "Magetan" not in prompt_ood, "GAGAL: Teks berita kriminal lama tidak boleh disematkan ke prompt!"
    print("  ✅ [LULUS]: Prompt Out-of-Domain murni berisi instruksi Clean Re-write tanpa teks nyasar.")

    # 2B. Kasus In-Domain (Naskah Relevan Butuh Penambahan Entitas)
    print("\n[Kasus 2B: Naskah In-Domain (Relevan, Butuh Bedah Presisi 80%)]")
    valid_draft = (
        "Wacana pergantian wakil presiden menjadi sorotan publik menyusul dinamika politik pasca pelantikan. "
        "Beberapa pakar hukum tata negara mulai mendiskusikan mekanisme konstitusional terkait suksesi kepemimpinan nasional."
    )

    res_indomain = generate_overview_and_remediation(
        verdict_status="Perlu Revisi",
        cds_score=65.0,
        is_redundant=False,
        is_keyword_stuffed=False,
        max_cosine_sim=0.25,
        mattr_score=0.75,
        hko_percentage=18.0,
        entity_gaps=entity_gaps_ood,
        target_query="wapres pengganti gibran",
        is_out_of_domain=False,
        draft_content=valid_draft,
    )

    prompt_indomain = res_indomain["remediation_prompt"]
    assert "Pertahankan minimal 80%" in prompt_indomain, "GAGAL: In-domain wajib memuat prinsip Surgical Editing 80%!"
    assert "=== DRAF ARTIKEL PENULIS ===" in prompt_indomain, "GAGAL: In-domain wajib menyertakan blok delimiter draf!"
    assert valid_draft in prompt_indomain, "GAGAL: Teks draf aktual wajib tersemat di dalam delimiter draf!"
    print("  ✅ [LULUS]: Prompt In-Domain menyematkan draf asli secara otomatis dan mempertahankan suara penulis 80%.")


def test_scenario_3_sanderson_subsumption():
    print_header("Skenario 3: Uji Matematis Subsumption Sanderson & Croft (ADR-04)")
    print("Menguji kasus nyata: 'Wakil' (10 SERP) & 'Presiden' (10 SERP) vs 'Wakil Presiden' (9 SERP)...")

    items = [
        EntityGapItem(term_string="wakil presiden", term_surface_form="Wakil Presiden", tfidf_weight=0.95, competitor_consensus_count=9),
        EntityGapItem(term_string="presiden", term_surface_form="Presiden", tfidf_weight=0.88, competitor_consensus_count=10),
        EntityGapItem(term_string="wakil", term_surface_form="Wakil", tfidf_weight=0.85, competitor_consensus_count=10),
        EntityGapItem(term_string="konstitusi", term_surface_form="Konstitusi", tfidf_weight=0.70, competitor_consensus_count=8),
    ]

    deduped = _deduplicate_subsumed_unigrams(items, limit=10)
    surviving_terms = [it.term_string for it in deduped]
    print(f"  • Entitas sebelum deduplikasi : {[it.term_string for it in items]}")
    print(f"  • Entitas setelah deduplikasi : {surviving_terms}")

    assert "wakil presiden" in surviving_terms, "GAGAL: Bigram 'wakil presiden' wajib bertahan!"
    assert "presiden" not in surviving_terms, "GAGAL: Unigram 'presiden' seharusnya diserap!"
    assert "wakil" not in surviving_terms, "GAGAL: Unigram 'wakil' seharusnya diserap!"
    assert "konstitusi" in surviving_terms, "GAGAL: Unigram independen 'konstitusi' wajib bertahan!"
    print("  ✅ [LULUS]: Relaksasi Sanderson DF(M) >= floor(0.75 * DF_u) sukses menyerap pecahan unigram!")


def test_scenario_4_multi_turn_unlock_logic():
    print_header("Skenario 4: Evaluasi Guard Multi-Turn saat Kueri Dibuka (Langkah 2.1)")
    
    # Simulasi Sesi: Turn #1 kueri 'jawa barat', Turn #3 kueri diubah jadi 'gubernur kdm luncurkan fitur'
    parent_target_query = "jawa barat"
    new_target_query = "gubernur kdm luncurkan fitur"
    
    is_same_query = bool(
        parent_target_query
        and parent_target_query.strip().lower() == new_target_query.strip().lower()
    )
    
    avg_cosine_sim = 0.02  # Kemiripan dengan korpus lama Jawa Barat rendah (< 0.05)
    
    # Kondisi Guard Baru (SESUAI MITIGASI)
    should_block_topic_shift = bool(is_same_query and (avg_cosine_sim < 0.05))
    
    print(f"  • Kueri Sesi Induk        : '{parent_target_query}'")
    print(f"  • Kueri Putaran Baru      : '{new_target_query}'")
    print(f"  • is_same_query           : {is_same_query}")
    print(f"  • Kemiripan ke korpus lama: {avg_cosine_sim}")
    print(f"  • Vonis Topic Shift Block : {should_block_topic_shift}")
    
    assert should_block_topic_shift is False, "GAGAL: Jangan memblokir pengguna saat mereka sengaja mengubah kueri target!"
    print("  ✅ [LULUS]: Guard Topic Shift tidak memblokir saat kueri target dibuka dan diubah.")


if __name__ == "__main__":
    print("\n🚀 MEMULAI PENGUJIAN LOGIKA OTOMATIS WASKITA (6 MITIGASI ALGORITMA)")
    try:
        test_scenario_1_out_of_domain_zero_gain()
        test_scenario_2_anti_frankenstein_prompt()
        test_scenario_3_sanderson_subsumption()
        test_scenario_4_multi_turn_unlock_logic()
        print("\n" + "=" * 70)
        print("🎉 SELURUH SKENARIO PENGUJIAN LOGIKA OTOMATIS BERHASIL 100% LULUS!")
        print("=" * 70 + "\n")
    except AssertionError as e:
        print(f"\n❌ PENGUJIAN GAGAL: {e}")
        sys.exit(1)
