"""
Unit Tests Matematis & Algoritma IR Engine WASKITA
Fokus: VSM TF-IDF, Cosine Similarity, Euclidean Distance, MATTR (L=50), TTR, HKO,
       Information Gain (Δ_gain & Δ_deficit), Composite CDS, dan Anotasi Stabilo 4-Warna.
Landasan: Bab 2.1 - 2.5 dan NFR-03 (Determinisme Matematis).
"""

import pytest
import numpy as np

from app.schemas.audit import ThresholdConfig, EntityGapsGroup, EntityGapItem
from app.services.ir_engine import (
    compute_vsm_similarity,
    calculate_information_gain,
    calculate_stylometrics,
    calculate_stylometry,
    calculate_ttr,
    calculate_mattr,
    calculate_hko,
    extract_headings_from_markdown_or_text,
    _tokenize_words,
    calculate_composite_cds,
    aggregate_gatekeeper_decision,
    generate_annotated_spans,
    CLICHE_PHRASES,
)


# =====================================================================
# 1. UJI DETERMINISME VSM, TF-IDF, COSINE & EUCLIDEAN (NFR-03)
# =====================================================================

class TestVsmDeterminism:
    """
    NFR-03: Memastikan input yang sama selalu menghasilkan skor identik
    hingga 4 desimal pada 100% eksekusi tanpa fluktuasi acak.
    """

    @pytest.fixture
    def sample_texts(self):
        draft = "kopi tubruk robusta dampit diseduh dengan air panas suhu optimal sembilan puluh derajat celcius"
        comp1 = "panduan membuat kopi tubruk tradisional menggunakan bubuk kopi dan air panas mendidih"
        comp2 = "kopi robusta dampit memiliki aroma cokelat pekat dan tingkat keasaman yang rendah"
        comp3 = "teknik seduhan kopi manual khas nusantara tanpa saringan kertas filter"
        return draft, [comp1, comp2, comp3]

    def test_vsm_determinism_50_iterations(self, sample_texts):
        draft, comps = sample_texts
        baseline = compute_vsm_similarity(draft, comps)

        for _ in range(50):
            result = compute_vsm_similarity(draft, comps)
            assert result["avg_cosine_similarity"] == baseline["avg_cosine_similarity"]
            assert result["max_cosine_similarity"] == baseline["max_cosine_similarity"]
            assert result["euclidean_distance"] == baseline["euclidean_distance"]
            assert len(result["cosine_similarities"]) == len(baseline["cosine_similarities"])
            for r_sim, b_sim in zip(result["cosine_similarities"], baseline["cosine_similarities"]):
                assert round(r_sim, 4) == round(b_sim, 4)

    def test_vsm_identical_texts(self):
        """Teks identik harus memiliki cosine similarity = 1.0000 dan euclidean distance = 0.0000."""
        text = "biji kopi arabika gayo disangrai medium roast menghasilkan cita rasa buah segar"
        result = compute_vsm_similarity(text, [text])
        assert round(result["max_cosine_similarity"], 4) == 1.0000
        assert round(result["avg_cosine_similarity"], 4) == 1.0000
        assert round(result["euclidean_distance"], 4) == 0.0000

    def test_vsm_completely_disjoint_texts(self):
        """Teks yang sama sekali tidak memiliki irisan kata harus memiliki kemiripan 0.0000."""
        draft = "pesawat terbang komersial mendarat darurat di landasan pacu bandara internasional"
        comp = "budidaya tanaman hias monstera variegata memerlukan kelembaban media tanam tinggi"
        result = compute_vsm_similarity(draft, [comp])
        assert result["max_cosine_similarity"] == 0.0000
        assert result["avg_cosine_similarity"] == 0.0000
        # Euclidean distance pada 2 vektor orthogonal ternormalisasi L2 adalah sqrt(1^2 + 1^2) = sqrt(2) ≈ 1.4142
        assert round(result["euclidean_distance"], 4) == round(np.sqrt(2), 4)

    def test_vsm_empty_competitors(self):
        """Menangani korpus kompetitor kosong secara defensif."""
        draft = "artikel informasional pengujian"
        result = compute_vsm_similarity(draft, [])
        assert result["avg_cosine_similarity"] == 0.0
        assert result["max_cosine_similarity"] == 0.0
        assert result["euclidean_distance"] == 0.0


# =====================================================================
# 2. UJI STILOMETRI: TTR, MATTR (w=50), DAN HKO
# =====================================================================

class TestStylometrics:
    """
    Pengujian metrik gaya bahasa:
    - TTR (Type-Token Ratio klasik)
    - MATTR (Moving-Average TTR dengan L=50)
    - HKO (Heading-Keyword Overlap %)
    """

    def test_ttr_repetitive_vs_diverse(self):
        # Teks repetitif: 50 token yang hanya mengulang 2 kata ("kopi", "enak")
        repetitive_tokens = ["kopi", "enak"] * 25
        ttr_rep = calculate_ttr(repetitive_tokens)
        assert ttr_rep == round(2 / 50, 4)  # 0.0400

        # Teks kaya kosakata: 50 token unik
        diverse_tokens = [f"kata_{i}" for i in range(50)]
        ttr_div = calculate_ttr(diverse_tokens)
        assert ttr_div == 1.0000

    def test_mattr_window_size_50(self):
        # Kasus 1: Teks lebih pendek dari ukuran jendela L=50 -> fallback ke TTR
        short_tokens = ["satu", "dua", "tiga", "empat", "lima"]
        assert calculate_mattr(short_tokens, window_size=50) == calculate_ttr(short_tokens)

        # Kasus 2: Teks repetitif panjang (100 token) tapi setiap jendela 50 token hanya punya 5 kata unik
        words_pool = ["kopi", "tubruk", "panas", "manis", "enak"]
        repetitive_100 = [words_pool[i % len(words_pool)] for i in range(100)]
        mattr_rep = calculate_mattr(repetitive_100, window_size=50)
        assert mattr_rep == round(5 / 50, 4)  # 0.1000
        assert mattr_rep < 0.50

        # Kasus 3: Teks 100 token yang seluruhnya unik
        unique_100 = [f"istilah_unik_{i}" for i in range(100)]
        mattr_div = calculate_mattr(unique_100, window_size=50)
        assert mattr_div == 1.0000
        assert mattr_div > 0.55

    def test_mattr_empty_and_single_token(self):
        assert calculate_mattr([]) == 0.0
        assert calculate_mattr(["halo"]) == 1.0

    def test_extract_headings_from_markdown(self):
        text = """
        # Judul Utama Artikel
        Paragraf pendahuluan artikel informasional.
        ## Sub-Judul Pertama yang Penting
        Isi pembahasan pertama.
        ### Sub-Sub Judul Tambahan
        Isi pembahasan kedua.
        #### Heading 4 Diabaikan
        Teks penutup.
        """
        headings = extract_headings_from_markdown_or_text(text)
        assert headings == [
            "Judul Utama Artikel",
            "Sub-Judul Pertama yang Penting",
            "Sub-Sub Judul Tambahan",
        ]

    def test_hko_calculation_and_stopwords(self):
        target_query = "cara merawat tanaman monstera"
        
        # Skenario 1: 0% HKO (tidak ada heading memuat kata kunci non-stopword)
        headings_zero = [
            "Kebutuhan Intensitas Radiasi Surya",
            "Formulasi Substrat Tumbuh Porous",
            "Pola Hidrasi Terjadwal Berkala",
        ]
        assert calculate_hko(headings_zero, target_query) == 0.0

        # Skenario 2: 50% HKO (2 dari 4 heading memuat kata kunci 'tanaman' atau 'monstera')
        headings_half = [
            "Panduan Memilih Tanaman Hias",       # Cocok ('tanaman')
            "Tips Merawat Monstera Hijau",       # Cocok ('rawat' / 'monstera')
            "Formulasi Substrat Bebas Hama",      # Tidak cocok
            "Pencahayaan Terfilter Sempurna",     # Tidak cocok
        ]
        assert calculate_hko(headings_half, target_query) == 50.0

        # Skenario 3: 100% HKO (Keyword stuffing agresif)
        headings_full = [
            "Cara Merawat Tanaman Monstera di Kamar",
            "Tips Cara Merawat Tanaman Monstera Murah",
            "Langkah Cara Merawat Tanaman Monstera Cepat",
            "Rahasia Cara Merawat Tanaman Monstera Subur",
        ]
        assert calculate_hko(headings_full, target_query) == 100.0

    def test_calculate_stylometry_alias(self):
        """Memverifikasi alias calculate_stylometry kompatibel dengan calculate_stylometrics."""
        content = "## Judul Utama\nKopi tubruk robusta dampit diseduh air panas."
        res1 = calculate_stylometrics(content, "kopi tubruk")
        res2 = calculate_stylometry(content, "kopi tubruk")
        assert res1 == res2
        assert "ttr_score" in res1
        assert "mattr_score" in res1
        assert "hko_percentage" in res1


# =====================================================================
# 3. UJI EKSTRAKSI INFORMATION GAIN (Δ_gain & Δ_deficit)
# =====================================================================

class TestInformationGain:
    r"""
    Persamaan 2.4 & 2.5:
    Δ_gain = E_draft \ E_SERP (Kebaruan unik draf)
    Δ_deficit = { e in E_SERP \ E_draft | consensus(e) >= 2 atau tfidf(e) >= P75 }
    """

    def test_set_difference_gain_and_deficit(self):
        # Format entitas: (stem, surface_form, count)
        draft_entities = [
            ("kopi", "kopi", 5),
            ("tubruk", "tubruk", 4),
            ("robusta", "robusta", 3),
            ("dampit", "dampit", 3),  # Unik di draf -> Gain
            ("suhu", "suhu", 2),
        ]

        # Kompetitor 1
        comp1 = [
            ("kopi", "kopi", 8),
            ("tubruk", "tubruk", 6),
            ("rasio", "rasio", 4),     # Ada di comp1 & comp2 -> Defisit (konsensus 2)
            ("gula", "gula", 3),       # Ada di comp1 saja -> Defisit (konsensus 1)
        ]

        # Kompetitor 2
        comp2 = [
            ("kopi", "kopi", 7),
            ("tubruk", "tubruk", 5),
            ("rasio", "rasio", 3),     # Konsensus 2
            ("saring", "saring", 2),
        ]

        gaps = calculate_information_gain(
            draft_entities=draft_entities,
            competitor_entities_list=[comp1, comp2],
            draft_tfidf_weights={"dampit": 0.88, "suhu": 0.55},
        )

        assert isinstance(gaps, EntityGapsGroup)

        # Verifikasi Delta Gain: "dampit" wajib muncul sebagai gain
        gain_stems = [g.term_string for g in gaps.gain]
        assert "dampit" in gain_stems
        # "kopi" dan "tubruk" ada di kompetitor, jadi BUKAN gain
        assert "kopi" not in gain_stems
        assert "tubruk" not in gain_stems

        # Verifikasi Delta Deficit: "rasio" (konsensus 2) wajib muncul, "gula" (konsensus 1) terfilter (Sprint 4.1 Persamaan 2.5)
        deficit_stems = [d.term_string for d in gaps.deficit]
        assert "rasio" in deficit_stems
        assert "gula" not in deficit_stems
        # "dampit" ada di draft, jadi BUKAN defisit
        assert "dampit" not in deficit_stems

        # Konsensus: "rasio" muncul di 2 kompetitor -> consensus_count = 2
        rasio_item = next(d for d in gaps.deficit if d.term_string == "rasio")
        assert rasio_item.competitor_consensus_count == 2

    def test_identical_entities_empty_diffs(self):
        """Jika entitas draf dan kompetitor persis sama, gain dan deficit harus kosong."""
        entities = [("kata_a", "Kata A", 2), ("kata_b", "Kata B", 3)]
        gaps = calculate_information_gain(
            draft_entities=entities,
            competitor_entities_list=[entities],
        )
        assert len(gaps.gain) == 0
        assert len(gaps.deficit) == 0


# =====================================================================
# 4. UJI COMPOSITE CDS & KEPUTUSAN GATEKEEPER (FR-10)
# =====================================================================

class TestCompositeCdsAndGatekeeper:
    """
    Pengujian formula komposit:
    CDS = round(0.35 * C_VSM + 0.30 * C_IG + 0.20 * C_MATTR + 0.15 * C_HKO, 1)
    dan penentuan verdict_status ("Siap Terbit" vs "Perlu Revisi").
    """

    def test_layak_terbit_scenario(self):
        thresholds = ThresholdConfig(
            max_cosine_similarity=0.60,
            min_mattr=0.55,
            max_hko_percentage=40.0,
            min_cds_score=75.0,
        )

        decision = calculate_composite_cds(
            max_cosine_sim=0.40,        # Tidak redundant (< 0.60)
            draft_entities_count=30,
            serp_entities_count=35,
            shared_entities_count=25,   # Coverage tinggi
            gain_count=5,               # Gain penuh (5/5)
            mattr_score=0.85,           # Kaya leksikal (> 0.55)
            hko_percentage=15.0,        # Struktur heading wajar (<= 40%)
            thresholds=thresholds,
        )

        assert decision["is_redundant"] is False
        assert decision["is_keyword_stuffed"] is False
        assert decision["content_differentiation_score"] >= 75.0
        assert decision["verdict_status"] == "Siap Terbit"

    def test_perlu_revisi_due_to_redundancy(self):
        """Kemiripan kosinus > 0.60 memicu is_redundant=True -> Perlu Revisi."""
        thresholds = ThresholdConfig(max_cosine_similarity=0.60, min_cds_score=75.0)

        decision = calculate_composite_cds(
            max_cosine_sim=0.78,        # Terlalu mirip kompetitor!
            draft_entities_count=30,
            serp_entities_count=30,
            shared_entities_count=28,
            gain_count=2,
            mattr_score=0.80,
            hko_percentage=20.0,
            thresholds=thresholds,
        )

        assert decision["is_redundant"] is True
        assert decision["verdict_status"] == "Perlu Revisi"

    def test_perlu_revisi_due_to_keyword_stuffing_hko(self):
        """HKO > 40% memicu is_keyword_stuffed=True -> Perlu Revisi."""
        thresholds = ThresholdConfig(max_hko_percentage=40.0)

        decision = calculate_composite_cds(
            max_cosine_sim=0.35,
            draft_entities_count=30,
            serp_entities_count=35,
            shared_entities_count=20,
            gain_count=5,
            mattr_score=0.80,
            hko_percentage=80.0,        # Spam heading!
            thresholds=thresholds,
        )

        assert decision["is_keyword_stuffed"] is True
        assert decision["verdict_status"] == "Perlu Revisi"

    def test_perlu_revisi_due_to_low_mattr(self):
        """MATTR < 0.55 memicu is_keyword_stuffed=True (repetisi leksikal) -> Perlu Revisi."""
        thresholds = ThresholdConfig(min_mattr=0.55)

        decision = calculate_composite_cds(
            max_cosine_sim=0.35,
            draft_entities_count=25,
            serp_entities_count=35,
            shared_entities_count=15,
            gain_count=4,
            mattr_score=0.42,           # Repetitif parah (< 0.55)!
            hko_percentage=20.0,
            thresholds=thresholds,
        )

        assert decision["is_keyword_stuffed"] is True
        assert decision["verdict_status"] == "Perlu Revisi"

    def test_out_of_domain_topic_relevance_gate(self):
        """avg_cosine_sim < 0.05 memicu is_out_of_domain=True -> Perlu Revisi - Topik Tidak Relevan (Sprint 3.1 & Temuan T8)."""
        thresholds = ThresholdConfig(min_cds_score=75.0)

        # Kasus draf out-of-domain (resep nasi goreng untuk kueri arsitektur):
        # max_cosine rendah, MATTR tinggi, HKO rendah, CDS ~ 82%, namun avg_cosine < 0.05
        decision = calculate_composite_cds(
            max_cosine_sim=0.03,
            draft_entities_count=30,
            serp_entities_count=30,
            shared_entities_count=0,
            gain_count=5,
            mattr_score=0.88,
            hko_percentage=0.0,
            thresholds=thresholds,
            avg_cosine_sim=0.02,  # < 0.05 Out-of-Domain!
        )

        assert decision["is_out_of_domain"] is True
        assert decision["verdict_status"] == "Perlu Revisi - Topik Tidak Relevan"

    def test_aggregate_gatekeeper_decision_alias(self):
        """Memverifikasi alias aggregate_gatekeeper_decision kompatibel dengan calculate_composite_cds."""
        thresholds = ThresholdConfig()
        d1 = calculate_composite_cds(0.35, 20, 20, 15, 4, 0.75, 10.0, thresholds)
        d2 = aggregate_gatekeeper_decision(0.35, 20, 20, 15, 4, 0.75, 10.0, thresholds)
        assert d1 == d2


# =====================================================================
# 5. UJI ANOTASI STABILO 4-WARNA (TABEL 3.6 PROPOSAL TA)
# =====================================================================

class TestAnnotatedSpans:
    """
    Anotasi 4-Warna Resmi (Proposal TA & Sprint 3.10):
    - yellow: Klise / Frasa Pasaran
    - blue: Kosakata Monoton (local_ttr < 0.40)
    - red: Redundansi VSM lokal terhadap kompetitor
    - green: Orisinalitas Kuat (Delta Gain)
    """

    def test_stabilo_four_colors_detection(self):
        draft_text = (
            "Di era digital saat ini kopi tubruk disukai banyak orang. "
            "Kopi kopi kopi robusta kopi kopi robusta kopi robusta. "
            "Kopi tubruk tradisional khas Nusantara diseduh dengan air mendidih bersuhu 90-95 derajat celcius tanpa saringan. "
            "Biji kopi Robusta Dampit memberikan keunikan aroma rempah manis alami."
        )

        competitor_texts = [
            "Kopi tubruk tradisional khas Nusantara diseduh dengan air mendidih bersuhu 90-95 derajat celcius tanpa saringan."
        ]

        entity_gaps = EntityGapsGroup(
            deficit=[EntityGapItem(term_string="suhu air", term_surface_form="Suhu Air 90C", tfidf_weight=0.8, competitor_consensus_count=2)],
            gain=[EntityGapItem(term_string="dampit", term_surface_form="Robusta Dampit", tfidf_weight=0.9, competitor_consensus_count=0)],
        )

        spans = generate_annotated_spans(
            draft_content=draft_text,
            competitor_clean_texts=competitor_texts,
            entity_gaps=entity_gaps,
            hko_percentage=10.0,
        )

        colors_present = {s.color for s in spans if s.color is not None}

        # Sprint 3.10: Naskah HANYA berisi kalimat asli milik pengguna (bebas teks sintetis)
        assert all(not s.text.startswith("[Saran Celah Defisit") for s in spans)
        assert all(s.text in draft_text for s in spans)

        # Wajib ada biru untuk kalimat berkosakata monoton (local_ttr < 0.40)
        assert "blue" in colors_present
        blue_spans = [s for s in spans if s.color == "blue"]
        assert any(s.label == "Kosakata Monoton" for s in blue_spans)

        # Wajib ada kuning untuk frasa klise 'di era digital saat ini'
        assert "yellow" in colors_present
        # Wajib ada merah untuk kalimat yang identik dengan kompetitor
        assert "red" in colors_present
        # Wajib ada hijau untuk kalimat yang memuat entitas gain 'dampit'
        assert "green" in colors_present


# =====================================================================
# 6. UJI SPRINT 3.3: REMEDIATION PROMPT & FILTER SPONSOR KOMERSIAL
# =====================================================================

class TestRemediationPromptAndCommercialFilter:
    """Verifikasi sitasi kompetitor eksplisit, cuplikan teks jiplak, dan filter merk komersial."""

    def test_remediation_prompt_cites_highest_competitor_and_snippets(self):
        from app.services.gatekeeper import generate_overview_and_remediation

        highest_comp = {
            "title": "Mengenal Arsitektur Klasik Lebih Dekat",
            "domain": "arsitag.com",
            "url": "https://www.arsitag.com/article/mengenal-arsitektur-klasik",
            "cosine_similarity": 0.9712,
        }

        snippets = [
            "Aturan proporsi ordo Dorik, Ionik, dan Korintia mengatur setiap elemen dari pedestal.",
            "Rasio ketinggian kolom terhadap diameter bawah tiang sangat presisi.",
        ]

        entity_gaps = EntityGapsGroup(
            deficit=[
                EntityGapItem(term_string="colorbond", term_surface_form="Colorbond", tfidf_weight=0.85, competitor_consensus_count=2),
                EntityGapItem(term_string="kolom ionik", term_surface_form="Kolom Ionik", tfidf_weight=0.80, competitor_consensus_count=2),
            ],
            gain=[],
        )

        res = generate_overview_and_remediation(
            verdict_status="Perlu Revisi",
            cds_score=42.5,
            is_redundant=True,
            is_keyword_stuffed=False,
            max_cosine_sim=0.9712,
            mattr_score=0.62,
            hko_percentage=20.0,
            entity_gaps=entity_gaps,
            target_query="ordo klasik arsitektur",
            highest_competitor=highest_comp,
            redundant_snippets=snippets,
        )

        prompt = res["remediation_prompt"]

        # 1. Wajib menyebut nama kompetitor arsitag.com dan judul artikel
        assert "arsitag.com" in prompt
        assert "Mengenal Arsitektur Klasik" in prompt
        assert "97.1%" in prompt

        # 2. Wajib menyertakan cuplikan kalimat yang terindikasi plagiasi
        assert "Aturan proporsi ordo Dorik" in prompt
        assert "Rasio ketinggian kolom" in prompt

        # 3. Wajib memfilter merk komersial Colorbond dari celah defisit
        assert "Colorbond" not in prompt
        assert "Kolom Ionik" in prompt

        # 4. Sprint 3.6: Konteks 5 kompetitor dan kontainer delimiter naskah
        assert "5 artikel kompetitor acuan Google SERP" in prompt
        assert "[NASKAH ARTIKEL YANG AKAN DIPROSES]:" in prompt
        assert "(Tempelkan naskah draf artikel Anda di sini sebelum dikirim ke AI)" in prompt

    def test_remediation_prompt_actionable_cms_seo_when_siap_terbit(self):
        """Sprint 3.5: Draf Siap Terbit menghasilkan paket materi pra-publikasi CMS & SEO."""
        from app.services.gatekeeper import generate_overview_and_remediation

        entity_gaps = EntityGapsGroup(
            deficit=[],
            gain=[
                EntityGapItem(term_string="arsitektur berkelanjutan", term_surface_form="Arsitektur Berkelanjutan", tfidf_weight=0.9, competitor_consensus_count=0),
                EntityGapItem(term_string="sirkulasi pejalan kaki", term_surface_form="Sirkulasi Pejalan Kaki", tfidf_weight=0.85, competitor_consensus_count=0),
            ],
        )

        res = generate_overview_and_remediation(
            verdict_status="Siap Terbit",
            cds_score=88.5,
            is_redundant=False,
            is_keyword_stuffed=False,
            max_cosine_sim=0.35,
            mattr_score=0.82,
            hko_percentage=15.0,
            entity_gaps=entity_gaps,
            target_query="tata letak kampus universitas",
        )

        prompt = res["remediation_prompt"]

        assert "Meta Title SEO" in prompt
        assert "Meta Description" in prompt
        assert "Taksonomi & Tag" in prompt
        assert "Ringkasan Eksekutif (Lead)" in prompt
        assert "Arsitektur Berkelanjutan" in prompt
        assert "tata letak kampus universitas" in prompt
        assert "88.5%" in prompt

        # Sprint 3.6: Konteks 5 kompetitor dan kontainer delimiter naskah
        assert "5 artikel kompetitor teratas di Google SERP" in prompt
        assert "[NASKAH ARTIKEL YANG AKAN DIPROSES]:" in prompt
        assert "(Tempelkan naskah draf artikel Anda di sini sebelum dikirim ke AI)" in prompt

    def test_information_gain_filters_commercial_sponsor_brands(self):
        from app.services.information_gain import calculate_information_gain

        draft_entities = [("ordo", "ordo", 5)]
        comp_entities = [
            [("ordo", "ordo", 4), ("colorbond", "Colorbond", 3), ("entablatur", "Entablatur", 2)]
        ]

        gaps = calculate_information_gain(
            draft_entities=draft_entities,
            competitor_entities_list=comp_entities,
        )

        deficit_stems = [d.term_string for d in gaps.deficit]
        assert "colorbond" not in deficit_stems
        assert "entablatur" in deficit_stems


# =====================================================================
# 7. UJI SPRINT 3.4: TOPIC SHIFT & PENALTI OUT-OF-DOMAIN CDS <= 20%
# =====================================================================

class TestTopicShiftAndOutOfDomainPenalty:
    """Verifikasi penalti CDS <= 20% dan vonis Topic Shift / Out of Domain."""

    def test_out_of_domain_caps_cds_to_20_percent(self):
        from app.services.gatekeeper import calculate_composite_cds
        from app.schemas.audit import ThresholdConfig

        thresholds = ThresholdConfig(min_cds_score=75.0, min_mattr=0.55, max_hko_percentage=40.0)

        # Kondisi metrik bagus TETAPI avg_cosine_sim < 0.05 (Out-of-Domain)
        decision = calculate_composite_cds(
            max_cosine_sim=0.04,
            draft_entities_count=20,
            serp_entities_count=10,
            shared_entities_count=1,
            gain_count=5,
            mattr_score=0.70,
            hko_percentage=10.0,
            thresholds=thresholds,
            avg_cosine_sim=0.02,  # < 0.05
        )

        assert decision["is_out_of_domain"] is True
        assert decision["verdict_status"] == "Perlu Revisi - Topik Tidak Relevan"
        assert decision["content_differentiation_score"] <= 20.0


# =====================================================================
# 8. UJI SPRINT 4.1: FULL ALGORITHMIC OVERHAUL (8 IR FIXES)
# =====================================================================

class TestSprint41AlgorithmicOverhaul:
    """Pengujian verifikasi mandatori untuk 8 perbaikan algoritma IR pada Sprint 4.1."""

    def test_extract_full_stem_set(self):
        from app.services.nlp_pipeline import extract_full_stem_set
        text = "Arsitektur brutalisme menampilkan struktur beton ekspos yang kokoh dan berkarakter kuat."
        full_stems = extract_full_stem_set(text)
        assert "arsitektur" in full_stems
        assert "brutalis" in full_stems  # Sprint 4.1: LOANWORD_CANONICAL_MAP normalizes brutalisme -> brutalis
        assert "beton" in full_stems
        assert "ekspos" in full_stems
        assert "beton ekspos" in full_stems
        assert "arsitektur brutalis" in full_stems

    def test_no_false_deficit_with_full_stem_set(self):
        """Kata yang ada di naskah (arsitek, menara, unit) atau kata derau (tahun, mengenal, bbc) TIDAK boleh jadi defisit."""
        from app.services.nlp_pipeline import extract_candidate_entities, extract_full_stem_set
        from app.services.information_gain import calculate_information_gain

        draft = (
            "Mengenal arsitektur brutalisme dan karya arsitek terkenal pada tahun 1950-an. "
            "Bangunan menara apartemen Unité d'Habitation menjadi bukti otentik desain beton ekspos."
        )
        comp1 = (
            "Arsitek legendaris merancang menara Unité d'Habitation pada era 1950-an dengan beton ekspos. "
            "Gaya ini menampilkan fasad monumental yang megah di berbagai kota Eropa."
        )
        comp2 = (
            "Ulasan bbc mengenai arsitek pelopor brutalisme yang mendirikan menara perkotaan. "
            "Struktur fasad beton menampilkan karakter kokoh dan fasad monumental."
        )

        d_ent = extract_candidate_entities(draft, top_n=40)
        c1_ent = extract_candidate_entities(comp1, top_n=35)
        c2_ent = extract_candidate_entities(comp2, top_n=35)

        full_d = extract_full_stem_set(draft)
        full_c = [extract_full_stem_set(comp1), extract_full_stem_set(comp2)]

        gaps = calculate_information_gain(
            draft_entities=d_ent,
            competitor_entities_list=[c1_ent, c2_ent],
            full_draft_stems=full_d,
            full_competitor_stems_list=full_c,
        )

        deficit_stems = [d.term_string for d in gaps.deficit]
        # Pastikan kata yang ada di draf tidak dituduh defisit
        assert "arsitek" not in deficit_stems
        assert "menara" not in deficit_stems
        assert "unit" not in deficit_stems
        # Pastikan kata ekspositori & media terfilter
        assert "tahun" not in deficit_stems
        assert "mengenal" not in deficit_stems
        assert "bbc" not in deficit_stems

    def test_no_false_gain_on_plagiarized_text(self):
        """Jika draf menjiplak artikel kompetitor, kata milik kompetitor tidak boleh diklaim sebagai gain baru."""
        from app.services.nlp_pipeline import extract_candidate_entities, extract_full_stem_set
        from app.services.information_gain import calculate_information_gain

        comp1_text = (
            "Gaya arsitektur brutalisme menonjolkan beton ekspos dan beton mentah secara jujur. "
            "Bangunan brutalis dibangun dengan material semen masif tanpa polesan cat warna-warni."
        )
        # Draf adalah jiplakan langsung dari kalimat kompetitor
        draft_text = (
            "Arsitektur brutalisme memakai beton ekspos dan beton mentah. "
            "Bangunan brutalis ini mengusung semen masif."
        )

        d_ent = extract_candidate_entities(draft_text, top_n=40)
        c1_ent = extract_candidate_entities(comp1_text, top_n=35)

        full_d = extract_full_stem_set(draft_text)
        full_c = [extract_full_stem_set(comp1_text)]

        gaps = calculate_information_gain(
            draft_entities=d_ent,
            competitor_entities_list=[c1_ent],
            full_draft_stems=full_d,
            full_competitor_stems_list=full_c,
        )

        gain_stems = [g.term_string for g in gaps.gain]
        # Tidak boleh ada istilah dari comp1 yang masuk ke gain
        assert "beton ekspos" not in gain_stems
        assert "beton mentah" not in gain_stems
        assert "bangun brutalis" not in gain_stems
        assert "beton" not in gain_stems

    def test_colloquial_stopwords_filtered_from_entities(self):
        """Memastikan kata-kata gaul/percakapan (lo, gue, banget, udah, gitu) tidak bocor jadi entitas kandidat."""
        from app.services.nlp_pipeline import extract_candidate_entities
        text = "kalo menurut gue pribadi sih ya emang beneran sakit pinggang tuh bikin lo mager banget"
        entities = extract_candidate_entities(text, top_n=20)
        extracted_stems = [e[0] for e in entities]
        for slang in ["gue", "lo", "banget", "beneran", "emang", "bikin", "gitu", "sih"]:
            assert slang not in extracted_stems, f"Kata gaul '{slang}' tidak boleh lolos jadi entitas kandidat"

    def test_sliding_window_passage_cosine_similarity(self):
        """Draf pendek 50 kata yang menjiplak bagian artikel kompetitor 200 kata mendapat similarity tinggi via sliding-window."""
        from app.services.vsm_calculator import compute_vsm_similarity

        plagiarized_passage = " ".join([
            "karakteristik", "utama", "brutalisme", "terletak", "pada", "kejujuran",
            "material", "beton", "ekspos", "struktur", "monumental", "geometri",
            "tegas", "tanpa", "elemen", "dekorasi", "ornamen", "tambahan",
        ] * 3)  # ~54 kata stem

        other_content = " ".join(["sejarah", "perkembangan", "kota", "modern", "industri"] * 30)  # 150 kata
        competitor_text = f"{other_content} {plagiarized_passage} {other_content}"

        res = compute_vsm_similarity(
            preprocessed_draft=plagiarized_passage,
            preprocessed_competitors=[competitor_text],
        )

        assert res["max_cosine_similarity"] >= 0.60

    def test_plain_text_subheading_heuristic_detection(self):
        """Deteksi sub-judul teks polos tanpa simbol # Markdown."""
        from app.services.stylometrics import extract_headings_from_markdown_or_text, calculate_hko

        text = (
            "Sejarah Perkembangan Arsitektur Brutalisme\n"
            "Arsitektur brutalisme mulai berkembang pesat setelah Perang Dunia Kedua ketika rekonstruksi kota membutuhkan material murah dan kokoh.\n\n"
            "Karakteristik Utama Beton Ekspos\n"
            "Ciri paling menonjol adalah penggunaan permukaan beton mentah yang dibiarkan terlihat teksturnya tanpa lapisan plesteran halus.\n\n"
            "Kritik dan Penerimaan Publik Modern\n"
            "Meskipun sempat dianggap dingin dan kaku oleh masyarakat umum, kini banyak kalangan arsitek mulai mengapresiasi keaslian strukturnya."
        )

        headings = extract_headings_from_markdown_or_text(text)
        assert len(headings) >= 2
        assert "Sejarah Perkembangan Arsitektur Brutalisme" in headings
        assert "Karakteristik Utama Beton Ekspos" in headings

        hko = calculate_hko(headings, "arsitektur brutalisme beton ekspos")
        assert hko > 0.0

    def test_gatekeeper_span_priority_red_over_yellow_and_blue(self):
        """Kalimat yang mirip kompetitor wajib diwarnai MERAH meskipun memiliki kata klise atau TTR rendah."""
        from app.services.gatekeeper import generate_annotated_spans
        from app.schemas.audit import EntityGapsGroup

        comp_text = "Sebagaimana kita ketahui bersama arsitektur brutalisme dibangun menggunakan beton mentah tanpa cat hiasan."
        # Kalimat draf memiliki frasa klise ("sebagaimana kita ketahui bersama") DAN mirip kompetitor
        draft = "Sebagaimana kita ketahui bersama arsitektur brutalisme dibangun menggunakan beton mentah tanpa cat hiasan."

        spans = generate_annotated_spans(
            draft_content=draft,
            competitor_clean_texts=[comp_text],
            entity_gaps=EntityGapsGroup(deficit=[], gain=[]),
            hko_percentage=20.0,
        )

        assert len(spans) == 1
        assert spans[0].color == "red"
        assert spans[0].label == "Redundansi VSM Tinggi"

    def test_dynamic_competitor_citation_in_remediation(self):
        """Prompt remediasi menampilkan page_title, domain_name asli, dan jumlah artikel kompetitor dinamis."""
        from app.services.gatekeeper import generate_overview_and_remediation
        from app.schemas.audit import EntityGapsGroup

        highest_comp = {
            "page_title": "Mengenal Arsitektur Brutalisme Modern",
            "domain_name": "sipil.uma.ac.id",
            "source_url": "https://sipil.uma.ac.id/arsitektur-brutalisme/",
            "cosine_similarity": 0.78,
        }

        res = generate_overview_and_remediation(
            verdict_status="Perlu Revisi",
            cds_score=52.0,
            is_redundant=True,
            is_keyword_stuffed=False,
            max_cosine_sim=0.78,
            mattr_score=0.62,
            hko_percentage=25.0,
            entity_gaps=EntityGapsGroup(deficit=[], gain=[]),
            target_query="arsitektur brutalisme",
            highest_competitor=highest_comp,
            competitor_count=8,
        )

        prompt = res["remediation_prompt"]
        assert "sipil.uma.ac.id" in prompt or "sipil.uma.ac.id" in str(res["overview_bullets"])
        assert "8 artikel kompetitor" in prompt

    def test_three_tier_relevance_guard(self):
        """Uji 3-Tier Relevance Guard: menyaring halaman jualan dan semantic drift."""
        from app.services.serp_scraper import passes_three_tier_relevance_guard

        # Test Lapis 3: Halaman jualan terfilter
        assert passes_three_tier_relevance_guard(
            title="Daftar Harga Jual Beton Ekspos Murah Diskon",
            clean_text="Promo harga beton ekspos terbaik beli sekarang hubungi whatsapp toko online diskon besar.",
            target_query="arsitektur brutalisme",
            candidate_index=1,
            anchor_stems={"arsitektur", "brutalisme", "beton"},
        ) is False

        # Test Lapis 1: Halaman 2 ke atas tanpa kata kunci inti terfilter
        assert passes_three_tier_relevance_guard(
            title="Resep Masakan Tradisional Padang",
            clean_text="Rendang daging sapi lezat bumbu rempah kelapa santan gurih mantap khas minang.",
            target_query="arsitektur brutalisme",
            candidate_index=6,
            anchor_stems={"arsitektur", "brutalisme", "beton"},
        ) is False

        # Test Lapis 1 & 2: Artikel relevan lolos
        assert passes_three_tier_relevance_guard(
            title="Karakteristik Beton Ekspos pada Arsitektur Brutalisme",
            clean_text="Arsitektur brutalisme menampilkan kejujuran konstruksi material beton ekspos yang kokoh monumental di ruang kota.",
            target_query="arsitektur brutalisme",
            candidate_index=6,
            anchor_stems={"arsitektur", "brutalisme", "beton", "ekspos", "konstruksi", "material", "bangunan", "struktur", "kota", "ruang"},
        ) is True


# =====================================================================
# 11. UJI SPRINT 4.2: MULTI-COMPETITOR REMEDIATION & LONG-TAIL GAIN
# =====================================================================
class TestSprint42PrecisionMultiCompetitorAndLongtailGain:
    def test_faq_question_heading_detection(self):
        """Sprint 4.2: Sub-judul berakhiran tanda tanya '?' terdeteksi sebagai sub-judul valid."""
        text = """
        Pengantar arsitektur brutalisme di masa pascaperang dunia kedua yang sarat eksperimen material.

        Apa Itu Arsitektur Brutalisme?
        Arsitektur brutalisme adalah salah satu aliran desain modern yang mengutamakan kejujuran bahan beton mentah tanpa polesan plesteran dekoratif.

        ## Apakah Cocok Diterapkan pada Hunian Tropis?
        Penerapan pada rumah tinggal membutuhkan ventilasi silang yang sangat baik demi mencegah akumulasi panas berlebih di siang hari.
        """
        headings = extract_headings_from_markdown_or_text(text)
        assert len(headings) >= 2
        # Cek apakah heading bertanda tanya terdeteksi
        assert any("Apa Itu Arsitektur Brutalisme?" in h for h in headings)
        assert any("Apakah Cocok Diterapkan" in h for h in headings)

        # Hitung HKO terhadap kueri arsitektur brutalisme
        hko = calculate_hko(headings, "arsitektur brutalisme")
        assert hko >= 50.0

    def test_ascii_folding_and_canonical_normalization(self):
        """Sprint 4.2: Normalisasi aksen Unité -> Unite dan Perancis -> Prancis."""
        from app.services.nlp_pipeline import normalize_text_ascii, stem_word

        raw = "Gedung apartemen monumental Unité d'Habitation di Marseille, Perancis."
        folded = normalize_text_ascii(raw)
        assert "Unite" in folded
        assert "Habitation" in folded

        # Canonical mapping
        assert stem_word("perancis") == "prancis"
        assert stem_word("prancis") == "prancis"
        assert stem_word("unite") == "unite"

    def test_extract_candidate_gain_entities_longtail(self):
        """Sprint 4.2: Mengekstrak proper noun dan entitas teknis langka dari draf."""
        from app.services.nlp_pipeline import extract_candidate_gain_entities

        text = """
        Arsitek Alison Smithson dan Peter Smithson merancang kompleks perumahan Robin Hood Gardens.
        Kritikus Reyner Banham memperkenalkan istilah New Brutalism untuk menggambarkan etos kejujuran desain ini.
        Menara Trellick Tower karya Erno Goldfinger menjadi salah satu contoh paling ikonik di London.
        Penerapan konsep Kenyamanan Termal pasif di daerah tropis menjadi fokus modern.
        """
        gain_cands = extract_candidate_gain_entities(text)
        stems = [c[0] for c in gain_cands]
        surfaces = [c[1] for c in gain_cands]

        assert any("alison smithson" in s for s in stems)
        assert any("peter smithson" in s for s in stems)
        assert any("reyner banham" in s for s in stems)
        assert any("trellick tower" in s for s in stems)

    def test_deficit_cleans_non_topical_verbs_and_adjectives(self):
        """Sprint 4.2: Verba proses dan adjektiva non-topikal difilter dari celah defisit."""
        from app.services.information_gain import calculate_information_gain

        draft_entities = [("brutalis", "Brutalis", 5)]
        comp_entities = [
            [
                ("brutalis", "Brutalis", 5),
                ("sederhana", "Sederhana", 4),
                ("muncul", "Muncul", 3),
                ("memiliki", "Memiliki", 3),
                ("fasad modular", "Fasad Modular", 3),
            ],
            [
                ("brutalis", "Brutalis", 4),
                ("sederhana", "Sederhana", 3),
                ("muncul", "Muncul", 3),
                ("memiliki", "Memiliki", 3),
                ("fasad modular", "Fasad Modular", 2),
            ]
        ]

        gaps = calculate_information_gain(draft_entities, comp_entities)
        def_stems = [d.term_string for d in gaps.deficit]

        assert "sederhana" not in def_stems
        assert "muncul" not in def_stems
        assert "memiliki" not in def_stems
        assert "fasad modular" in def_stems

    def test_four_pillar_remediation_prompt_and_word_budget(self):
        """Sprint 4.2: Prompt remediasi 4-pilar terstruktur dengan SERP Word Budget."""
        from app.services.gatekeeper import generate_overview_and_remediation

        highest_comp = {
            "title": "Mengenal Arsitektur Brutalisme dan Contoh Bangunannya",
            "domain_name": "sipil.uma.ac.id",
            "cosine_similarity": 0.985,
        }
        other_comps = [
            {"domain_name": "student-activity.binus.ac.id"},
            {"domain_name": "detik.com"},
            {"domain_name": "setiapgedung.id"},
        ]
        gaps = EntityGapsGroup(
            deficit=[
                EntityGapItem(term_string="fasad modular", term_surface_form="Fasad Modular", tfidf_weight=0.8, competitor_consensus_count=3),
            ],
            gain=[],
        )

        res = generate_overview_and_remediation(
            verdict_status="Perlu Revisi - Redundansi Kalimat Tinggi",
            cds_score=38.5,
            is_redundant=True,
            is_keyword_stuffed=False,
            max_cosine_sim=0.985,
            mattr_score=0.58,
            hko_percentage=25.0,
            entity_gaps=gaps,
            target_query="arsitektur brutalisme",
            highest_competitor=highest_comp,
            serp_competitors=other_comps,
            competitor_count=10,
            draft_word_count=1170,
        )

        prompt = res["remediation_prompt"]

        # Cek 4 pilar terstruktur
        assert "1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA:" in prompt
        assert "sipil.uma.ac.id" in prompt
        assert "2. LENGKAPI CELAH KONSENSUS DARI KOMPETITOR LAIN:" in prompt
        assert "binus.ac.id" in prompt or "detik.com" in prompt
        assert "Fasad Modular" in prompt
        assert "3. CIPTAKAN NILAI TAMBAH BARU (KALAHKAN 10 KOMPETITOR SERP):" in prompt
        assert "4. BATASAN PANJANG KATA KETAT (SERP WORD BUDGET):" in prompt
        assert "DILARANG melebihi" in prompt

    def test_dual_mode_prompt_when_siap_terbit(self):
        """Sprint 4.2: Draf Siap Terbit menghasilkan dual-mode prompt (CMS Pack & Perfectionist)."""
        from app.services.gatekeeper import generate_overview_and_remediation

        gaps = EntityGapsGroup(
            deficit=[],
            gain=[
                EntityGapItem(term_string="alison smithson", term_surface_form="Alison Smithson", tfidf_weight=0.85, competitor_consensus_count=0),
            ],
        )

        res = generate_overview_and_remediation(
            verdict_status="Siap Terbit",
            cds_score=94.5,
            is_redundant=False,
            is_keyword_stuffed=False,
            max_cosine_sim=0.12,
            mattr_score=0.78,
            hko_percentage=10.0,
            entity_gaps=gaps,
            target_query="arsitektur brutalisme",
            competitor_count=10,
            draft_word_count=980,
        )

        assert res["remediation_prompt_cms"] is not None
        assert "Meta Title SEO" in res["remediation_prompt_cms"]
        assert "Alison Smithson" in res["remediation_prompt_cms"]

        assert res["remediation_prompt_perfectionist"] is not None
        assert "micro-tuning" in res["remediation_prompt_perfectionist"].lower()
        assert "Alison Smithson" in res["remediation_prompt_perfectionist"]


# =====================================================================
# 12. UJI SPRINT 4.3: STABILO PRECISION, CLAUSE-BOUND GAIN & VISUAL SLOTS
# =====================================================================
class TestSprint43StabiloPrecisionAndVisualSlots:
    def test_numbered_heading_detection_and_red_immunity(self):
        """Sprint 4.3: Sub-judul bernomor (1. Unité d'Habitation, 5. Kyoto...) diakui sebagai heading dan kebal stabilo merah."""
        from app.services.stylometrics import extract_headings_from_markdown_or_text
        from app.services.gatekeeper import generate_annotated_spans
        from app.schemas.audit import EntityGapsGroup

        text = (
            "1. Unité d'Habitation (Marseille, Prancis)\n"
            "Gedung hunian masif ini dirancang oleh Le Corbusier dengan menggunakan material beton mentah.\n\n"
            "5) Kyoto International Conference Center (Kyoto, Jepang)\n"
            "Bangunan ini memadukan struktur beton brutalist yang tegas dengan filosofi arsitektur tradisional Jepang."
        )

        headings = extract_headings_from_markdown_or_text(text)
        assert len(headings) >= 2
        assert any("Unité d'Habitation" in h for h in headings)
        assert any("Kyoto International" in h for h in headings)

        # Uji kebal stabilo merah walaupun mirip kompetitor
        comp_text = "1. Unité d'Habitation (Marseille, Prancis) dirancang oleh Le Corbusier menggunakan material beton mentah."
        spans = generate_annotated_spans(
            draft_content=text,
            competitor_clean_texts=[comp_text],
            entity_gaps=EntityGapsGroup(deficit=[], gain=[]),
            hko_percentage=20.0,
        )

        heading_spans = [s for s in spans if s.is_heading]
        assert len(heading_spans) >= 2
        for hs in heading_spans:
            assert hs.color is None  # Bebas dari stabilo merah!
            assert hs.label == "Sub-Judul / Heading"

    def test_clause_bound_gain_prevents_frankenstein_trigrams(self):
        """Sprint 4.3: Ekstraksi gain dilarang melompati koma dan dilarang menyerap kata penghubung (karya, dan, yaitu)."""
        from app.services.nlp_pipeline import extract_candidate_gain_entities

        text = """
        Di Austria, karya Fritz Wotruba menjadi simbol arsitektur religius yang radikal.
        Kompleks perumahan Robin Hood Gardens di London dirancang oleh Alison Smithson dan Peter Smithson.
        Eksplorasi di Prancis, yaitu Beton Mentah yang dipadukan dengan geometri asimetris.
        """

        candidates = extract_candidate_gain_entities(text)
        stems = [c[0] for c in candidates]

        # Frankenstein trigram yang menabrak koma atau kata hubung TIDAK boleh muncul
        assert not any("austria karya fritz" in s.lower() for s in stems)
        assert not any("prancis yaitu beton" in s.lower() for s in stems)
        assert not any("smithson dan peter" in s.lower() for s in stems)

        # Entitas valid yang berada dalam satu klausa HARUS muncul
        assert any("robin hood garden" in s.lower() for s in stems)
        assert any("fritz wotruba" in s.lower() for s in stems)
        assert any("alison smithson" in s.lower() for s in stems)

    def test_trigram_and_hyphenated_gain_triggers_green_stabilo(self):
        """Sprint 4.3: Trigram dan surface form beraksen/hyphen menyalakan stabilo hijau."""
        from app.services.gatekeeper import generate_annotated_spans
        from app.schemas.audit import EntityGapsGroup, EntityGapItem

        draft = (
            "Kompleks perumahan Robin Hood Gardens memperlihatkan konsep streets in the sky yang unik di kawasan perkotaan.\n"
            "Bangunan gereja Saint-Pierre di Firminy mengedepankan geometri kerucut beton yang sangat berani.\n"
            "Sebagian besar gedung bergaya brutalis di Eropa mengadopsi bahan semen tanpa plesteran dekoratif."
        )

        gaps = EntityGapsGroup(
            deficit=[],
            gain=[
                EntityGapItem(term_string="robin hood garden", term_surface_form="Robin Hood Gardens", tfidf_weight=0.9, competitor_consensus_count=0),
                EntityGapItem(term_string="saint-pierre", term_surface_form="Saint-Pierre", tfidf_weight=0.85, competitor_consensus_count=0),
            ],
        )

        spans = generate_annotated_spans(
            draft_content=draft,
            competitor_clean_texts=[],
            entity_gaps=gaps,
            hko_percentage=10.0,
        )

        green_spans = [s for s in spans if s.color == "green"]
        assert len(green_spans) >= 2
        assert any("Robin Hood Gardens" in s.text for s in green_spans)
        assert any("Saint-Pierre" in s.text for s in green_spans)

    def test_repetitive_content_words_trigger_blue_stabilo(self):
        """Sprint 4.3: Pengulangan kata konten >= 3x per kalimat memicu stabilo biru (Kosakata Monoton)."""
        from app.services.gatekeeper import generate_annotated_spans
        from app.schemas.audit import EntityGapsGroup

        # Kalimat mengulang kata konten "beton" sebanyak 3 kali
        repetitive_sentence = (
            "Penggunaan material beton ekspos dipadukan dengan struktur beton pracetak dan elemen beton bertulang secara masif di seluruh sudut bangunan."
        )

        spans = generate_annotated_spans(
            draft_content=repetitive_sentence,
            competitor_clean_texts=[],
            entity_gaps=EntityGapsGroup(deficit=[], gain=[]),
            hko_percentage=0.0,
        )

        assert len(spans) == 1
        assert spans[0].color == "blue"
        assert spans[0].label == "Kosakata Monoton"

    def test_saturation_80_percent_allows_100_percent_cds(self):
        """Sprint 4.3: Ambang jenuh cakupan 80% memungkinkan CDS mencapai 100.0%."""
        from app.services.gatekeeper import calculate_composite_cds
        from app.schemas.audit import ThresholdConfig

        thresholds = ThresholdConfig(min_mattr=0.65, max_hko_percentage=40.0)

        res = calculate_composite_cds(
            max_cosine_sim=0.10,
            draft_entities_count=30,
            serp_entities_count=25,
            shared_entities_count=20,
            gain_count=5,
            mattr_score=0.75,
            hko_percentage=20.0,
            thresholds=thresholds,
            avg_cosine_sim=0.08,
            red_span_ratio=0.0,
        )

        assert res["content_differentiation_score"] == 100.0
        assert res["sub_scores"]["c_ig"] == 100.0
        assert res["verdict_status"] == "Siap Terbit"

    def test_slideshare_and_ocr_domains_filtered(self):
        """Sprint 4.3: Domain slideshare, scribd, academia, dan researchgate diklasifikasikan sebagai pdf_doc."""
        from app.services.serp_scraper import classify_url_skip_reason

        assert classify_url_skip_reason("https://www.slideshare.net/john/arsitektur-brutalisme") == "pdf_doc"
        assert classify_url_skip_reason("https://slideshare.net/slides/12345") == "pdf_doc"
        assert classify_url_skip_reason("https://www.scribd.com/document/987/makalah-brutalisme") == "pdf_doc"
        assert classify_url_skip_reason("https://www.academia.edu/4567/Brutalist_Design") == "pdf_doc"
        assert classify_url_skip_reason("https://www.researchgate.net/publication/789") == "pdf_doc"
        assert classify_url_skip_reason("https://www.studocu.com/id/document/arsitektur") == "pdf_doc"

    def test_visual_media_slot_immunity_in_gatekeeper(self):
        """Sprint 4.3: Token slot visual media [gambar 1: ...] diabaikan dari penalti redundansi."""
        from app.services.gatekeeper import generate_annotated_spans
        from app.schemas.audit import EntityGapsGroup

        text = (
            "[gambar 1: Ilustrasi Fasad Beton Menara Trellick]\n"
            "Menara apartemen ini menjulang tinggi di London barat dengan fasad beton ekspos yang kokoh."
        )

        spans = generate_annotated_spans(
            draft_content=text,
            competitor_clean_texts=["Menara apartemen ini menjulang tinggi di London barat dengan fasad beton ekspos."],
            entity_gaps=EntityGapsGroup(deficit=[], gain=[]),
            hko_percentage=0.0,
        )

        slot_spans = [s for s in spans if "[gambar 1" in s.text]
        assert len(slot_spans) == 1
        assert slot_spans[0].color is None
        assert slot_spans[0].label == "Slot Visual Media"

    def test_consecutive_red_spans_triggers_veto_gate(self):
        """Sprint 4.4: 3 kalimat merah beruntun memicu Red-Span Veto Gate meski rasio total < 20%."""
        from app.services.gatekeeper import calculate_composite_cds
        thresholds = ThresholdConfig(min_cds_score=75.0)

        # Rasio merah hanya 12.6% (13/103), tapi ada 3 kalimat merah berturut-turut (jiplak 1 paragraf)
        decision = calculate_composite_cds(
            max_cosine_sim=0.17,
            draft_entities_count=100,
            serp_entities_count=25,
            shared_entities_count=22,
            gain_count=5,
            mattr_score=0.78,
            hko_percentage=25.0,
            thresholds=thresholds,
            red_span_ratio=0.126,
            max_consecutive_red=3,
        )

        assert decision["is_sentence_redundant"] is True
        assert decision["verdict_status"] == "Perlu Revisi - Redundansi Kalimat Tinggi"
        assert decision["content_differentiation_score"] <= 58.0
