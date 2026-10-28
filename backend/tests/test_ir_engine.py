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

        # Verifikasi Delta Deficit: "rasio" dan "gula" wajib muncul sebagai defisit
        deficit_stems = [d.term_string for d in gaps.deficit]
        assert "rasio" in deficit_stems
        assert "gula" in deficit_stems
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
    Anotasi 4-Warna Resmi:
    - yellow: Klise/Generik/TTR Lokal Rendah
    - red: Redundansi VSM lokal terhadap kompetitor
    - blue: Saran Celah Topik Defisit
    - green: Orisinalitas Kuat (Delta Gain)
    """

    def test_stabilo_four_colors_detection(self):
        draft_text = (
            "Di era digital saat ini kopi tubruk disukai banyak orang. "
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

        # Wajib ada injeksi warna biru untuk saran defisit
        assert "blue" in colors_present
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
