import re
from typing import Any, Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.audit import AnnotatedSpan, EntityGapsGroup, ThresholdConfig
from app.services.nlp_pipeline import (
    ALL_INDONESIAN_STOPWORDS,
    NON_TOPICAL_VERBS_AND_ADJECTIVES,
    normalize_text_ascii,
    stem_word,
)
from app.services.stylometrics import extract_headings_from_markdown_or_text

# Pola AI Klise dan Frasa Generik Bahasa Indonesia (FR-11 & Sprint 4.3)
CLICHE_PHRASES = [
    "di era digital saat ini",
    "di era globalisasi",
    "pada era digital",
    "tidak dapat dipungkiri",
    "seperti yang kita ketahui",
    "dalam artikel kali ini",
    "banyak orang menyukai",
    "banyak orang yang bertanya",
    "menjadi salah satu hal yang paling",
    "sangat penting untuk kita ketahui",
    "mari kita simak pembahasannya",
    "tak heran jika",
    "sebagaimana telah disebutkan",
    "kesimpulannya adalah",
    "sebagai kesimpulan",
    "tak ayal",
    "hingga saat ini",
    "tidak terlepas dari",
    "seiring perkembangan zaman",
    "bukan sekadar",
    "memainkan peran penting",
    "perlu diketahui bahwa",
    "dapat disimpulkan bahwa",
]

# Daftar Kata Kunci / Merek Sponsor & Komersial Non-Substantif (Sprint 3.3)
COMMERCIAL_SPONSOR_KEYWORDS = {
    "colorbond",
    "bluescope",
    "dulux",
    "nippon",
    "nippon paint",
    "toto",
    "ikea",
    "propan",
    "holcim",
    "semen gresik",
    "mowilex",
    "roman",
    "roman ceramic",
    "onduline",
    "alustar",
    "shopee",
    "tokopedia",
    "lazada",
    "blibli",
    "whatsapp",
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "hubungi",
    "kontak",
    "promo",
    "diskon",
    "harga",
    "jual",
    "beli",
    "distributor",
    "supplier",
}


def is_commercial_or_sponsor(term: str) -> bool:
    """Filter untuk mendeteksi entitas sponsor/komersial/merek dagang non-substantif."""
    if not term:
        return False
    t_lower = term.lower().strip()
    words = set(re.findall(r"\b\w+\b", t_lower))
    for brand in COMMERCIAL_SPONSOR_KEYWORDS:
        if brand in words or brand == t_lower:
            return True
    return False


PROMPT_DRAFT_DELIMITER = (
    "\n\n--------------------------------------------------\n"
    "[NASKAH ARTIKEL YANG AKAN DIPROSES]:\n"
    '"""\n'
    "(Tempelkan naskah draf artikel Anda di sini sebelum dikirim ke AI)\n"
    '"""'
)


def _split_into_sentences(text: str) -> List[str]:
    """
    Memecah naskah menjadi daftar segmen/kalimat utuh.
    Memecah berdasarkan baris baru terlebih dahulu agar sub-judul tidak menyatu
    dengan kalimat pembuka paragraf di bawahnya (Sprint 4.1 & 4.2).
    """
    sentences: List[str] = []
    for line in re.split(r"\n+", text):
        line_clean = line.strip()
        if not line_clean:
            continue
        # Jika satu baris adalah heading Markdown atau sub-judul mandiri (Sprint 4.1, 4.2 & 4.3)
        is_numbered_heading = bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", line_clean))
        is_heading_line = (
            bool(re.match(r"^#{1,4}\s+", line_clean))
            or is_numbered_heading
            or (len(line_clean.split()) <= 14 and (line_clean.endswith("?") or not line_clean.endswith((".", "!", ":", ";"))))
        )
        if is_heading_line and len(line_clean.split()) <= 14:
            sentences.append(line_clean)
            continue

        parts = re.split(r"(?<=[.!?])\s+", line_clean)
        for p in parts:
            p_clean = p.strip()
            if p_clean:
                sentences.append(p_clean)
    return sentences


def generate_annotated_spans(
    draft_content: str,
    competitor_clean_texts: List[str],
    entity_gaps: EntityGapsGroup,
    hko_percentage: float,
    threshold_hko: float = 40.0,
) -> List[AnnotatedSpan]:
    """
    Algoritma Anotasi Stabilo 4-Warna Resmi (Proposal TA Tabel 3.6, Sprint 3.10 & Sprint 4.1 & 4.2):
    Urutan Prioritas:
    1. 'is_heading': Sub-Judul / Heading teks polos atau Markdown (display: block)
    2. 'red': Redundansi VSM lokal / Plagiarisme Kalimat (Jaccard >= 0.50 atau Containment >= 0.72)
    3. 'yellow': Frasa Klise / Generik (CLICHE_PHRASES)
    4. 'blue': Kosakata Monoton (local_ttr < 0.40 atau repetisi leksikal tinggi)
    5. 'green': Orisinalitas Kuat / Nilai Tambah Unik (memuat Delta gain)
    
    Catatan: Naskah stabilo annotated_spans HANYA BERISI KALIMAT ASLI MILIK PENGGUNA.
    """
    sentences = _split_into_sentences(draft_content)
    spans: List[AnnotatedSpan] = []

    # Ekstraksi heading resmi
    detected_headings = set(extract_headings_from_markdown_or_text(draft_content))

    # Himpunan stem entitas gain unik
    gain_stems = {item.term_string for item in entity_gaps.gain}

    # Pra-komputasi himpunan stem kalimat kompetitor satu kali (Sprint 4.1)
    competitor_sentence_stems_list: List[Set[str]] = []
    for c_text in competitor_clean_texts:
        for s in _split_into_sentences(c_text):
            comp_words = re.findall(r"\b\w+\b", s.lower())
            if len(comp_words) >= 6:
                c_stems = {
                    stem_word(w)
                    for w in comp_words
                    if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2
                }
                if len(c_stems) >= 4:
                    competitor_sentence_stems_list.append(c_stems)

    for sentence in sentences:
        # Cek apakah segmen merupakan token slot visual media [gambar N: ...] (Sprint 4.3)
        if re.match(r"^\[gambar\s+\d+", sentence, re.IGNORECASE):
            spans.append(AnnotatedSpan(text=sentence, color=None, label="Slot Visual Media", is_heading=False))
            continue

        # Cek apakah segmen merupakan sub-judul / heading (Sprint 4.2 & 4.3)
        is_numbered_heading = bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", sentence))
        is_heading = (
            sentence in detected_headings
            or is_numbered_heading
            or bool(re.match(r"^#{1,4}\s+", sentence))
            or any(h in sentence for h in detected_headings)
        )
        if is_heading:
            spans.append(AnnotatedSpan(text=sentence, color=None, label="Sub-Judul / Heading", is_heading=True))
            continue

        s_lower = sentence.lower()
        words = re.findall(r"\b\w+\b", s_lower)
        word_count = len(words)

        if word_count < 4:
            spans.append(AnnotatedSpan(text=sentence, color=None, label=None, is_heading=False))
            continue

        local_ttr = len(set(words)) / word_count if word_count > 0 else 1.0

        # Prioritas #1: Cek Merah (Red - Sprint 4.1): Redundansi VSM Kalimat Lokal terhadap Kalimat Kompetitor
        is_redundant = False
        if competitor_sentence_stems_list and word_count >= 6:
            sentence_stems = {
                stem_word(w)
                for w in words
                if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2
            }
            if len(sentence_stems) >= 4:
                for comp_stems in competitor_sentence_stems_list:
                    overlap = len(sentence_stems.intersection(comp_stems))
                    jaccard = overlap / len(sentence_stems.union(comp_stems))
                    containment = overlap / min(len(sentence_stems), len(comp_stems))
                    if jaccard >= 0.50 or (containment >= 0.72 and overlap >= 4):
                        is_redundant = True
                        break

        if is_redundant:
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color="red",
                    label="Redundansi VSM Tinggi",
                )
            )
            continue

        # Prioritas #2: Cek Kuning (Yellow): Frasa Klise / Generik
        is_cliche = any(cliche in s_lower for cliche in CLICHE_PHRASES)
        if is_cliche:
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color="yellow",
                    label="Frasa Klise",
                )
            )
            continue

        # Prioritas #3: Cek Biru (Blue - Sprint 4.3): Kosakata Monoton / Repetisi Leksikal Tinggi
        content_words = [w for w in words if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2]
        word_freq = {}
        for cw in content_words:
            word_freq[cw] = word_freq.get(cw, 0) + 1
        has_repetitive_words = any(cnt >= 3 for cnt in word_freq.values())
        content_ttr = len(set(content_words)) / len(content_words) if len(content_words) >= 6 else 1.0

        if has_repetitive_words or (len(words) >= 10 and content_ttr < 0.60) or local_ttr < 0.40:
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color="blue",
                    label="Kosakata Monoton",
                )
            )
            continue

        # Prioritas #4: Cek Hijau (Green - Sprint 4.1 & 4.3): Memuat entitas Delta Gain unik
        # Syarat: word_count >= 7 dan kalimat diakhiri tanda baca (.!?) agar sub-judul pendek tidak diwarnai hijau
        ends_with_punct = sentence.endswith((".", "!", "?"))
        if word_count >= 7 and ends_with_punct:
            sentence_clean = normalize_text_ascii(s_lower)
            words_for_gain = re.findall(r"\b[\w\-]+\b", sentence_clean)
            sentence_stems_all = {stem_word(w) for w in words_for_gain if len(w) > 2}
            sentence_stems_list = [stem_word(w) for w in words_for_gain if len(w) > 2]
            for i in range(len(sentence_stems_list) - 1):
                sentence_stems_all.add(f"{sentence_stems_list[i]} {sentence_stems_list[i+1]}")
            for i in range(len(sentence_stems_list) - 2):
                sentence_stems_all.add(f"{sentence_stems_list[i]} {sentence_stems_list[i+1]} {sentence_stems_list[i+2]}")

            gain_surfaces = [
                normalize_text_ascii(item.term_surface_form.lower())
                for item in entity_gaps.gain
                if item.term_surface_form
            ]
            has_gain_entity = any(gs in sentence_stems_all for gs in gain_stems) or any(
                len(surf) > 3 and surf in sentence_clean for surf in gain_surfaces
            )
            if has_gain_entity:
                spans.append(
                    AnnotatedSpan(
                        text=sentence,
                        color="green",
                        label="Orisinalitas Kuat",
                    )
                )
                continue

        # Normal text tanpa stabilo
        spans.append(AnnotatedSpan(text=sentence, color=None, label=None))

    return spans


def calculate_composite_cds(
    max_cosine_sim: float,
    draft_entities_count: int,
    serp_entities_count: int,
    shared_entities_count: int,
    gain_count: int,
    mattr_score: float,
    hko_percentage: float,
    thresholds: ThresholdConfig,
    avg_cosine_sim: Optional[float] = None,
    red_span_ratio: float = 0.0,
) -> Dict[str, any]:
    """
    Rumus Komposit Content Differentiation Score (CDS 0-100%) & Keputusan Gatekeeper (Bab 2.4 & FR-10):
    1. C_VSM (35%)
    2. C_IG (30%)
    3. C_MATTR (20%)
    4. C_HKO (15%)
    CDS = round(0.35 * C_VSM + 0.30 * C_IG + 0.20 * C_MATTR + 0.15 * C_HKO, 1)

    Ditambah Topic Relevance Gate (Sprint 3.1 & 3.4):
    Jika avg_cosine_sim < 0.05, naskah ditandai Out-of-Domain (Perlu Revisi - Topik Tidak Relevan).

    Sprint 4.0: Red-Span Density Veto Gate:
    Jika red_span_ratio >= 0.20 (≥ 20% kalimat naskah menjiplak kompetitor),
    Vonis WAJIB menjadi "Perlu Revisi - Redundansi Kalimat Tinggi" dan CDS dipangkas maksimal 58.0%.
    """
    # 1. Skor Diferensiasi Vektor C_VSM (35%)
    # Penalti linier jika S_cos_max > 0.25 dan integrasi red_span_ratio (Sprint 4.1)
    c_vsm_doc = 100.0 * (1.0 - max(0.0, (max_cosine_sim - 0.25) / 0.75))
    c_vsm_sent = 100.0 * (1.0 - min(1.0, red_span_ratio * 1.5))
    if red_span_ratio >= 0.20:
        c_vsm_raw = min(c_vsm_doc, 0.45 * c_vsm_doc + 0.55 * c_vsm_sent)
    else:
        c_vsm_raw = c_vsm_doc
    c_vsm = max(0.0, min(100.0, c_vsm_raw))

    # 2. Skor Cakupan & Kebaruan Entitas C_IG (30%)
    # Ambang jenuh cakupan pasar 80% (Sprint 4.3)
    saturated_serp_target = max(1, int(serp_entities_count * 0.80))
    coverage_ratio = min(1.0, shared_entities_count / saturated_serp_target)
    gain_ratio = min(1.0, gain_count / 5.0)
    c_ig_raw = 100.0 * (0.6 * coverage_ratio + 0.4 * gain_ratio)
    c_ig = max(0.0, min(100.0, c_ig_raw))

    # 3. Skor Kekayaan Leksikal MATTR C_MATTR (20%)
    tau_mattr = max(0.1, thresholds.min_mattr)
    c_mattr_raw = 100.0 * min(1.0, mattr_score / tau_mattr)
    c_mattr = max(0.0, min(100.0, c_mattr_raw))

    # 4. Skor Kendali Anti-Spam Heading HKO C_HKO (15%)
    tau_hko = thresholds.max_hko_percentage
    if hko_percentage <= tau_hko:
        c_hko = 100.0
    else:
        c_hko_raw = 100.0 * (1.0 - (hko_percentage - tau_hko) / max(1.0, (100.0 - tau_hko)))
        c_hko = max(0.0, min(100.0, c_hko_raw))

    # CDS Akhir
    cds = round(0.35 * c_vsm + 0.30 * c_ig + 0.20 * c_mattr + 0.15 * c_hko, 1)
    cds = max(0.0, min(100.0, cds))

    # Bendera Diagnostik
    is_redundant = max_cosine_sim > thresholds.max_cosine_similarity
    is_keyword_stuffed = (hko_percentage > thresholds.max_hko_percentage) or (mattr_score < thresholds.min_mattr)

    # Topic Relevance Gate (Sprint 3.1 & 3.4)
    is_out_of_domain = (avg_cosine_sim is not None) and (avg_cosine_sim < 0.05)

    # Sprint 4.0: Red-Span Density Veto Gate (ambang batas >= 20% kalimat redundan)
    is_sentence_redundant = red_span_ratio >= 0.20

    # Non-Compensatory Pillar Floor (Sprint 4.1): C_IG wajib >= 45.0% untuk lolos Siap Terbit jika ada >= 3 entitas SERP
    is_superficial_content = (serp_entities_count >= 3) and (c_ig < 45.0)

    # Aturan Vonis & Penalti Skor
    if is_out_of_domain:
        verdict_status = "Perlu Revisi - Topik Tidak Relevan"
        cds = min(cds, 20.0)
    elif is_sentence_redundant:
        verdict_status = "Perlu Revisi - Redundansi Kalimat Tinggi"
        # Skor CDS tidak boleh melebihi 58.0% jika lebih dari seperlima draf menjiplak kompetitor
        cds = min(cds, round(58.0 * (1.0 - (red_span_ratio - 0.20)), 1))
    elif (
        (cds >= thresholds.min_cds_score)
        and (not is_redundant)
        and (not is_keyword_stuffed)
        and (not is_superficial_content)
    ):
        verdict_status = "Siap Terbit"
    else:
        verdict_status = "Perlu Revisi"

    cds = max(0.0, min(100.0, cds))

    return {
        "content_differentiation_score": cds,
        "is_redundant": is_redundant,
        "is_sentence_redundant": is_sentence_redundant,
        "red_span_ratio": round(red_span_ratio, 3),
        "is_keyword_stuffed": is_keyword_stuffed,
        "is_out_of_domain": is_out_of_domain,
        "verdict_status": verdict_status,
        "sub_scores": {
            "c_vsm": round(c_vsm, 1),
            "c_ig": round(c_ig, 1),
            "c_mattr": round(c_mattr, 1),
            "c_hko": round(c_hko, 1),
        },
    }


def generate_overview_and_remediation(
    verdict_status: str,
    cds_score: float,
    is_redundant: bool,
    is_keyword_stuffed: bool,
    max_cosine_sim: float,
    mattr_score: float,
    hko_percentage: float,
    entity_gaps: EntityGapsGroup,
    target_query: str,
    is_out_of_domain: bool = False,
    highest_competitor: Optional[Dict[str, any]] = None,
    redundant_snippets: Optional[List[str]] = None,
    competitor_count: int = 5,
    serp_competitors: Optional[List[Dict[str, any]]] = None,
    draft_word_count: int = 0,
    word_budget_min: Optional[int] = None,
    word_budget_max: Optional[int] = None,
) -> Dict[str, any]:
    """
    Menghasilkan poin ringkasan overview_bullets dan instruksi kurasi remediation_prompt (Sprint 4.2).
    Mendukung Dual-Mode Prompt (CMS Pack & Perfectionist Micro-Tuning) untuk Siap Terbit,
    serta 4-Pilar Prompt Presisi Multi-Kompetitor dengan Batasan Word Budget untuk Perlu Revisi.
    """
    bullets: List[str] = []
    remediation_points: List[str] = []

    # 1. Format sitasi kompetitor tertinggi jika ada (Sprint 3.3, 4.1 & 4.2)
    comp_citation = ""
    highest_domain = ""
    if highest_competitor:
        comp_title = (
            highest_competitor.get("page_title")
            or highest_competitor.get("title")
            or "Artikel Kompetitor Teratas"
        )
        comp_domain = (
            highest_competitor.get("domain_name")
            or highest_competitor.get("domain")
            or ""
        )
        comp_url = highest_competitor.get("source_url") or highest_competitor.get("url") or ""
        if not comp_domain and comp_url:
            from urllib.parse import urlparse
            comp_domain = urlparse(comp_url).netloc.replace("www.", "")

        highest_domain = comp_domain.lower()
        sim_val = highest_competitor.get("cosine_similarity", max_cosine_sim)
        sim_pct = round(sim_val * 100.0, 1)
        if comp_domain:
            comp_citation = f"Artikel '{comp_title}' ({comp_domain}) dengan kemiripan {sim_pct}%"
        else:
            comp_citation = f"Artikel '{comp_title}' dengan kemiripan {sim_pct}%"

    # 2. Himpun domain kompetitor acuan lainnya untuk matriks konsensus pasar
    other_domains: List[str] = []
    if serp_competitors:
        for c in serp_competitors:
            d = (c.get("domain_name") or c.get("domain") or "").lower()
            if d and d != highest_domain and d not in other_domains and "example" not in d:
                other_domains.append(d)
    other_domains_str = ", ".join(other_domains[:3]) if other_domains else "kompetitor teratas lainnya"

    # 3. Hitung Plafon & Batasan Kata Ketat (Word Budget Enforcement - Sprint 4.4 Dynamic Budget)
    if word_budget_min and word_budget_max and word_budget_max > word_budget_min:
        min_target_words = word_budget_min
        max_target_words = word_budget_max
    elif draft_word_count >= 300:
        min_target_words = max(800, int(draft_word_count * 0.85))
        max_target_words = max(min_target_words + 150, min(1400, int(draft_word_count * 1.05)))
    else:
        min_target_words = 900
        max_target_words = 1200

    # 4. Filter entitas defisit dari noise komersial/sponsor dan verba/adjektiva non-topikal (Sprint 4.2)
    valid_deficits = [
        d for d in entity_gaps.deficit
        if not is_commercial_or_sponsor(d.term_string)
        and not is_commercial_or_sponsor(d.term_surface_form)
        and d.term_string not in NON_TOPICAL_VERBS_AND_ADJECTIVES
        and d.term_surface_form.lower() not in NON_TOPICAL_VERBS_AND_ADJECTIVES
    ]
    valid_deficits_str = ", ".join([d.term_surface_form for d in valid_deficits[:4]]) if valid_deficits else "aspek teknis penting yang relevan"

    # 5. Entitas gain draf
    if entity_gaps.gain:
        gain_terms = ", ".join([g.term_surface_form for g in entity_gaps.gain[:4]])
    else:
        gain_terms = "konten orisinal naskah"

    remediation_prompt_cms: Optional[str] = None
    remediation_prompt_perfectionist: Optional[str] = None

    if verdict_status in ("Siap Terbit", "Layak Terbit"):
        bullets.append(f"Skor diferensiasi semantik draf sangat baik ({cds_score}%), melampaui ambang batas.")
        bullets.append("Variasi leksikal tinggi dan struktur sub-judul proporsional tanpa repetisi berlebih.")
        if entity_gaps.gain:
            bullets.append(f"Draf berhasil menyajikan nilai tambah informasi orisinal: {gain_terms}.")

        # Tab 1: Paket Pra-Publikasi CMS & SEO Actionable (Sprint 3.5 & 3.6 & 4.1 & 4.2)
        cms_pack_prompt = (
            f"Draf artikel ini telah lolos audit orisinalitas WASKITA dengan skor tinggi ({cds_score}%) untuk topik '{target_query}'.\n"
            f"Berdasarkan analisis perbandingan terhadap {competitor_count} artikel kompetitor teratas di Google SERP, draf ini memiliki diferensiasi dan nilai kebaruan materi yang kuat ({gain_terms}).\n\n"
            "Tolong siapkan paket materi pra-publikasi CMS & SEO untuk artikel ini tanpa mengubah isi naskah pokoknya:\n"
            f"1. Meta Title SEO: Buatkan judul menarik maksimal 60 karakter yang memuat kata kunci '{target_query}'.\n"
            "2. Meta Description: Buatkan deskripsi 140–155 karakter yang persuasif dan memicu CTR tinggi di Google.\n"
            f"3. Taksonomi & Tag: Ekstrak 3–5 tag kategori paling relevan untuk pengelompokan artikel di CMS.\n"
            "4. Ringkasan Eksekutif (Lead): Tuliskan cuplikan pembuka 2 kalimat untuk teaser media sosial dan newsletter.\n"
            f"5. Pertahankan Nilai Orisinal: Pastikan poin-poin kebaruan materi draf berikut tetap terjaga: {gain_terms}."
            f"{PROMPT_DRAFT_DELIMITER}"
        )

        # Tab 2: Micro-Tuning Menuju 100% (Perfeksionis - Sprint 4.2)
        perfectionist_prompt = (
            f"Draf artikel ini telah mencapai skor {cds_score}% untuk topik '{target_query}'.\n"
            "Jika Anda ingin melakukan penyempurnaan mikro (micro-tuning) menuju kesempurnaan 100%, terapkan instruksi berikut:\n\n"
            "1. Perkaya Kosakata & Variasi Leksikal (MATTR):\n"
            "   - Variasikan kosakata pada kalimat yang monoton untuk meningkatkan kekayaan diksi artikel.\n"
            "2. Lengkapi Celah Topik Minor:\n"
            f"   - Sisipkan sedikit ulasan kontekstual mengenai aspek berikut tanpa memanjangkan artikel: {valid_deficits_str}.\n"
            "3. Pertahankan Nilai Orisinalitas Unggul:\n"
            f"   - Jaga agar entitas nilai tambah unik berikut tetap dominan di naskah: {gain_terms}.\n"
            "4. Disiplin Panjang Naskah:\n"
            f"   - Pertahankan panjang artikel di rentang {min_target_words} – {max_target_words} kata tanpa menambah kalimat klise."
            f"{PROMPT_DRAFT_DELIMITER}"
        )

        remediation_prompt = cms_pack_prompt
        remediation_prompt_cms = cms_pack_prompt
        remediation_prompt_perfectionist = perfectionist_prompt

    else:
        bullets.append(f"Draf memerlukan kurasi editorial (Skor CDS: {cds_score}%).")
        if is_out_of_domain:
            bullets.append("Naskah terindikasi di luar topik utama (Out-of-Domain): kemiripan semantik rata-rata dengan acuan SERP sangat rendah (< 0.05). Skor CDS dipangkas menjadi maksimal 20.0%.")
            remediation_points.append(f"Topik naskah tidak relevan dengan sesi/kueri '{target_query}'. Mulai sesi analisis baru jika naskah ini membahas topik yang berbeda agar dievaluasi terhadap kompetitor SERP yang sesuai.")
        if verdict_status == "Perlu Revisi - Redundansi Kalimat Tinggi":
            bullets.append("Naskah terdeteksi memiliki kepadatan kalimat redundan langsung yang tinggi (≥ 20% kalimat naskah mirip kompetitor). Skor CDS dipangkas secara proporsional.")
        elif is_redundant:
            if comp_citation:
                bullets.append(f"Tingkat kemiripan semantik tinggi terhadap {comp_citation} (melampaui ambang batas).")
            else:
                bullets.append(f"Tingkat kemiripan semantik dengan artikel kompetitor terlalu tinggi ({max_cosine_sim:.2f} > ambang batas).")

        if is_keyword_stuffed:
            if hko_percentage > 40.0:
                bullets.append(f"Sub-judul terindikasi keyword stuffing ({hko_percentage:.1f}% memuat kata kunci).")
            if mattr_score < 0.55:
                bullets.append(f"Kosakata artikel cenderung repetitif (MATTR: {mattr_score:.2f} < 0.55).")

        if valid_deficits:
            bullets.append(f"Terdapat celah topik penting SERP yang belum dicakup: {valid_deficits_str}.")

        # Cuplikan kalimat plagiasi jika ada (Sprint 3.3 & 4.2)
        snippets_block = ""
        if redundant_snippets:
            unique_snippets = []
            for s in redundant_snippets:
                s_clean = s.strip()
                if s_clean and s_clean not in unique_snippets:
                    unique_snippets.append(s_clean)
                if len(unique_snippets) >= 3:
                    break
            if unique_snippets:
                snippets_block = "\n   - Cuplikan kalimat naskah yang terindikasi parafrase/jiplak langsung:\n" + "\n".join([f'     > "{s}"' for s in unique_snippets])

        # Prompt Terstruktur 4-Pilar Multi-Kompetitor Presisi & Word Budget (Sprint 4.2)
        remediation_prompt = (
            f"Tolong sempurnakan draf artikel ini untuk topik '{target_query}' dengan panduan kurasi berdasarkan perbandingan {competitor_count} artikel kompetitor acuan Google SERP berikut:\n\n"
            f"1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA:\n"
            f"   - Draf memiliki kemiripan struktur tinggi dengan {comp_citation or 'artikel kompetitor utama'}. Rombak total struktur kalimat dan susunan paragrafnya agar terbebas dari penalti plagiasi semantik.{snippets_block}\n\n"
            f"2. LENGKAPI CELAH KONSENSUS DARI KOMPETITOR LAIN:\n"
            f"   - Sebagaimana dibahas oleh kompetitor SERP lainnya ({other_domains_str}), sertakan pembahasan aspek penting yang masih absen di naskah Anda: {valid_deficits_str}.\n\n"
            f"3. CIPTAKAN NILAI TAMBAH BARU (KALAHKAN {competitor_count} KOMPETITOR SERP):\n"
            f"   - Ke-{competitor_count} kompetitor acuan belum mengulas sudut pandang spesifik ini secara mendalam. Sertakan minimal 2 pembahasan baru atau studi kasus kontekstual yang bernilai tinggi bagi pembaca.\n\n"
            f"4. BATASAN PANJANG KATA KETAT (SERP WORD BUDGET):\n"
            f"   - Target panjang artikel: {min_target_words} – {max_target_words} kata (DILARANG melebihi {max_target_words} kata).\n"
            f"   - Hapus basa-basi pembuka dan pengantar klise. Langsung bahas substansi pokok secara padat dan lugas."
            f"{PROMPT_DRAFT_DELIMITER}"
        )

    return {
        "overview_bullets": bullets,
        "remediation_prompt": remediation_prompt,
        "remediation_prompt_cms": remediation_prompt_cms,
        "remediation_prompt_perfectionist": remediation_prompt_perfectionist,
    }
