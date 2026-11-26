import re
from typing import Dict, List, Optional, Set, Tuple
from datasketch import MinHash

from app.schemas.audit import AnnotatedSpan, EntityGapsGroup, ThresholdConfig
from app.services.nlp_pipeline import (
    ALL_INDONESIAN_STOPWORDS,
    NON_TOPICAL_VERBS_AND_ADJECTIVES,
    is_web_chrome_noise_line,
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
    "hubungi",
    "kontak",
    "promo",
    "diskon",
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


def _build_sentence_minhash(words: List[str], num_perm: int = 64) -> MinHash:
    """Membangun representasi MinHash berbasis 3-shingles kata untuk mendeteksi redundansi urutan frasa."""
    m = MinHash(num_perm=num_perm)
    if len(words) >= 3:
        for i in range(len(words) - 2):
            shingle = f"{words[i]} {words[i+1]} {words[i+2]}"
            m.update(shingle.encode("utf-8"))
    else:
        for w in words:
            m.update(w.encode("utf-8"))
    return m


def detect_web_chrome_noise(text: str) -> Tuple[bool, int, List[str]]:
    """
    Mendeteksi apakah naskah memuat sampah elemen tata letak web hasil copas mentah (Ctrl+A).
    Menggabungkan:
    1. Pola baris navigasi/footer eksplisit (is_web_chrome_noise_line).
    2. Analisis Kepadatan Struktural Tata Letak Web (Structural Layout Density - Anti-Hardcode):
       - Rasio baris sangat pendek (<= 3 kata) yang ekstrem (> 45% pada dokumen >= 15 baris).
       - Kepadatan baris tautan Markdown `[anchor](url)` (> 35% baris) atau baris daftar harga/direktori.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    matched_noise: List[str] = []
    for line in lines:
        if is_web_chrome_noise_line(line):
            matched_noise.append(line[:60])

    # Heuristik Kepadatan Struktural (Structural Layout Density) untuk dokumen >= 15 baris
    if len(lines) >= 15:
        short_lines = sum(1 for l in lines if len(l.split()) <= 3)
        md_link_lines = sum(1 for l in lines if re.search(r"\[[^\]]+\]\(https?://", l))
        short_ratio = short_lines / len(lines)
        link_ratio = md_link_lines / len(lines)
        if short_ratio > 0.45 and link_ratio > 0.30:
            matched_noise.append(
                f"[Structural Layout Density: {short_ratio:.0%} short-lines, {link_ratio:.0%} link-lines]"
            )
            matched_noise.append("[Directory/Portal Listing Dump Structure Detected]")

    has_noise = len(matched_noise) >= 2
    return has_noise, len(matched_noise), matched_noise


TRANSACTIONAL_SOLICITATION_PATTERNS = [
    re.compile(
        r"(?:https?://(?:wa\.me/|api\.whatsapp\.com/send\?phone=))?(?:\+?62|08)\d{8,12}\b",
        re.IGNORECASE,
    ),
    re.compile(r"\b(?:kode\s+voucher|voucher\s+diskon|tebus\s+murah|diskon\s+spesial)\b", re.IGNORECASE),
    re.compile(r"\b(?:promo\s+terbatas|hubungi\s+admin|pemesanan\s+agen|beli\s+sekarang|order\s+sekarang|transfer\s+mahar)\b", re.IGNORECASE),
    re.compile(r"\b(?:sembuh\s+total\s+tanpa\s+operasi|dijamin\s+sembuh\s+dalam\s+\w+\s+hari|obat\s+ajaib)\b", re.IGNORECASE),
    re.compile(r"\b(?:slot\s+gacor|jackpot\s+sensational|deposit\s+pulsa|tanpa\s+potongan)\b", re.IGNORECASE),
]


def detect_commercial_drift(
    text: str,
    consensus_serp_stems: Optional[Set[str]] = None,
    target_query: str = "",
) -> Tuple[bool, List[str]]:
    """
    Mendeteksi Bait-and-Switch (Kuda Troya) secara kontekstual dan SERP-Relative (Tanpa Hardcode Topik):
    1. Tidak pernah menghukum topik cerita mistis/klenik/budaya/hiburan selama konsisten dengan kueri/SERP.
    2. Hanya memicu veto apabila naskah memuat >= 2 sinyal ajakan transaksi/kontak komersial eksplisit
       YANG TIDAK ADA di dalam target_query maupun konsensus SERP (Tail Semantic Drift).
    """
    if not text:
        return False, []

    q_lower = (target_query or "").lower()
    matches: List[str] = []
    for pat in TRANSACTIONAL_SOLICITATION_PATTERNS:
        found = pat.findall(text)
        for item in found[:2]:
            item_low = item.lower().strip()
            # Jika frasa tersebut memang bagian dari kueri yang dicari pengguna, jangan anggap penyimpangan
            if item_low and item_low in q_lower:
                continue
            matches.append(item)

    if len(matches) < 2:
        return False, matches

    # Jika consensus_serp_stems tersedia, cek apakah paragraf akhir (tail) mengalami penyimpangan dari konsensus SERP
    if consensus_serp_stems:
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip().split()) >= 6]
        if len(paragraphs) >= 2:
            tail_text = " ".join(paragraphs[-2:]).lower()
            tail_tokens = set(re.findall(r"\b[a-z]{3,}\b", tail_text))
            # Jika tail masih sangat padat dengan istilah konsensus SERP (>= 5 irisan) dan tidak memuat spam judi/klaim medis palsu, izinkan
            overlap_with_serp = len(tail_tokens.intersection(consensus_serp_stems))
            has_hard_scam = any(
                re.search(r"slot\s+gacor|jackpot\s+sensational|sembuh\s+total\s+tanpa\s+operasi|obat\s+ajaib", m, re.IGNORECASE)
                for m in matches
            )
            if overlap_with_serp >= 5 and not has_hard_scam:
                return False, matches

    return True, matches


AI_PROMPT_LEAK_PATTERNS = [
    re.compile(r"^\s*(?:tentu(?:lah)?|tentu saja|pasti|baiklah)[!,.]?\s*(?:sebagai asisten ai|berikut (?:adalah )?(?:draf|artikel|panduan))", re.IGNORECASE),
    re.compile(r"\b(?:sebagai model bahasa ai|sebagai asisten virtual|sebagai asisten cerdas)\b", re.IGNORECASE),
    re.compile(r"\b(?:apakah ada hal lain yang (?:bisa|dapat) saya bantu|silakan beri tahu saya jika (?:anda|kamu) ingin)\b", re.IGNORECASE),
    re.compile(r"\b(?:semoga (?:draf\s+)?artikel ini (?:membantu|bermanfaat) (?:untuk|dalam) mendongkrak)\b", re.IGNORECASE),
    re.compile(r"^\s*meta title\s*:", re.IGNORECASE),
    re.compile(r"^\s*meta description\s*:", re.IGNORECASE),
]


def detect_ai_prompt_leak(text: str) -> Tuple[bool, List[str]]:
    """Mendeteksi apakah naskah menyisakan teks pembuka/penutup percakapan chatbot AI."""
    matches = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines:
        for pat in AI_PROMPT_LEAK_PATTERNS:
            if pat.search(line):
                matches.append(line[:60])
                break
    has_leak = len(matches) >= 1
    return has_leak, matches


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

    # Ekstraksi rentang kutipan sah (markdown blockquotes '>' atau tanda kutip ganda "...")
    quoted_texts = set()
    for m in re.finditer(r'[\"“]([^\"”]{15,})[\"”]', draft_content):
        q_clean = m.group(1).strip().lower()
        if any(w in q_clean for w in ["menurut", "berdasarkan", "dikutip", "ujar", "kata", "melansir", "penelitian", "studi"]):
            for s in re.split(r"(?<=[.!?])\s+", m.group(1)):
                if len(s.strip().split()) >= 4:
                    quoted_texts.add(s.strip(" \"“”'").lower())
    for line in draft_content.split("\n"):
        if line.strip().startswith(">"):
            for s in re.split(r"(?<=[.!?])\s+", line.strip().lstrip(">")):
                if len(s.strip().split()) >= 4:
                    quoted_texts.add(s.strip(" \"“”'").lower())

    # Himpunan stem entitas gain unik
    gain_stems = {item.term_string for item in entity_gaps.gain}

    # Pra-komputasi himpunan stem dan MinHash kalimat kompetitor (Sprint 4.5)
    competitor_sentence_stems_list: List[Set[str]] = []
    competitor_sentence_minhashes: List[MinHash] = []
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
                    competitor_sentence_minhashes.append(_build_sentence_minhash(comp_words))

    for sentence in sentences:
        # Cek apakah segmen merupakan residu web chrome (Ctrl+A Liar)
        if is_web_chrome_noise_line(sentence):
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color="yellow",
                    label="Residu Elemen Web (Ctrl+A)",
                    is_heading=False,
                )
            )
            continue

        # Cek apakah segmen merupakan token slot visual media [gambar N: ...] (Sprint 4.3)
        if re.match(r"^\[gambar\s+\d+", sentence, re.IGNORECASE):
            spans.append(AnnotatedSpan(text=sentence, color=None, label="Slot Visual Media", is_heading=False))
            continue

        # Cek apakah segmen merupakan sub-judul / heading (Sprint 4.2 & 4.3; DOM-03 heading substring fix)
        is_numbered_heading = bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", sentence))
        clean_heading_cand = sentence.lstrip("#").strip()
        is_heading = (
            sentence in detected_headings
            or clean_heading_cand in detected_headings
            or is_numbered_heading
            or bool(re.match(r"^#{1,4}\s+", sentence))
            or any(
                len(h.split()) >= 3 and h in sentence
                for h in detected_headings
                if len(h.strip()) >= 10
            )
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

        # Cek Kutipan Beretika Sah (Fair-Use Quotation with Attribution)
        s_clean_quote = s_lower.strip(" \"“”'")
        is_quote = (
            s_clean_quote in quoted_texts
            or any(s_clean_quote in qt or qt in s_clean_quote for qt in quoted_texts)
            or (
                (sentence.startswith('"') or sentence.startswith('“') or sentence.startswith("'"))
                and any(w in s_lower for w in ["menurut", "berdasarkan", "dikutip", "ujar", "kata", "melansir", "penelitian"])
            )
        )
        if is_quote:
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color=None,
                    label="Kutipan Beretika / Rujukan",
                    is_heading=False,
                )
            )
            continue

        # Prioritas #1: Cek Merah (Red - Sprint 4.1 & 4.5): Redundansi VSM & MinHash Kalimat Lokal terhadap Kalimat Kompetitor
        is_redundant = False
        if competitor_sentence_stems_list and word_count >= 6:
            sent_minhash = _build_sentence_minhash(words)
            sentence_stems = {
                stem_word(w)
                for w in words
                if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2
            }
            if len(sentence_stems) >= 4:
                for idx_comp, comp_stems in enumerate(competitor_sentence_stems_list):
                    overlap = len(sentence_stems.intersection(comp_stems))
                    jaccard = overlap / len(sentence_stems.union(comp_stems))
                    containment = overlap / min(len(sentence_stems), len(comp_stems))
                    minhash_sim = sent_minhash.jaccard(competitor_sentence_minhashes[idx_comp]) if idx_comp < len(competitor_sentence_minhashes) else 0.0
                    if jaccard >= 0.50 or (containment >= 0.72 and overlap >= 4) or (minhash_sim >= 0.45 and overlap >= 4):
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
    max_consecutive_red: int = 0,
    has_web_chrome_noise: bool = False,
    is_commercial_drift: bool = False,
    has_ai_prompt_leak: bool = False,
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

    # 3. Skor Kekayaan Leksikal MATTR C_MATTR (20% - DOM-04 Piecewise Scaling)
    tau_mattr = max(0.1, thresholds.min_mattr)
    # Titik jenuh ideal tercapai pada ambang target min_mattr
    if mattr_score <= 0.40:
        c_mattr_raw = 0.0
    else:
        c_mattr_raw = 100.0 * min(1.0, (mattr_score - 0.40) / max(0.01, tau_mattr - 0.40))
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

    # ADR-02 Zero-Gain Policy: Isolasi mutlak jika naskah di luar domain (C_IG = 0.0)
    if is_out_of_domain:
        c_ig = 0.0

    # Sprint 4.0 & 4.4: Red-Span Density Veto Gate (ambang batas >= 20% kalimat redundan atau >= 3 kalimat merah beruntun)
    is_sentence_redundant = (red_span_ratio >= 0.20) or (max_consecutive_red >= 3)

    # Non-Compensatory Pillar Floor (Sprint 4.1): C_IG wajib >= 45.0% untuk lolos Siap Terbit jika ada >= 3 entitas SERP
    is_superficial_content = (serp_entities_count >= 3) and (c_ig < 45.0)

    # Aturan Vonis & Penalti Skor
    if is_out_of_domain:
        verdict_status = "Perlu Revisi - Topik Tidak Relevan"
        cds = min(cds, 20.0)
    elif is_sentence_redundant:
        verdict_status = "Perlu Revisi - Redundansi Kalimat Tinggi"
        # Skor CDS tidak boleh melebihi 58.0% jika ada redundansi kalimat signifikan / jiplakan beruntun
        effective_penalty_ratio = max(red_span_ratio, 0.20 if max_consecutive_red >= 3 else 0.0)
        cds = min(cds, round(58.0 * (1.0 - (effective_penalty_ratio - 0.20)), 1))
    elif has_web_chrome_noise:
        verdict_status = "Perlu Revisi - Residu Elemen Website Terdeteksi"
        cds = min(cds, 48.0)
    elif is_commercial_drift:
        verdict_status = "Perlu Revisi - Promosi Komersial Terselubung"
        cds = min(cds, 42.0)
    elif has_ai_prompt_leak:
        verdict_status = "Perlu Revisi - Teks Percakapan AI Terdeteksi"
        cds = min(cds, 45.0)
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
        "has_web_chrome_noise": has_web_chrome_noise,
        "is_commercial_drift": is_commercial_drift,
        "has_ai_prompt_leak": has_ai_prompt_leak,
        "verdict_status": verdict_status,
        "sub_scores": {
            "vsm": round(0.35 * c_vsm, 1),
            "ig": round(0.30 * c_ig, 1),
            "mattr": round(0.20 * c_mattr, 1),
            "hko": round(0.15 * c_hko, 1),
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
    draft_content: Optional[str] = None,
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

    # Deteksi kehadiran platform sosial / UGC / multi-modal di lanskap kompetitor SERP (Sprint 4.6)
    MULTIMODAL_UGC_DOMAINS = (
        "tiktok.com", "instagram.com", "youtube.com", "youtu.be",
        "linkedin.com", "quora.com", "medium.com", "reddit.com",
        "x.com", "twitter.com", "pinterest.com", "kompasiana.com",
    )
    multimodal_competitor_domains: List[str] = []
    if serp_competitors:
        for c in serp_competitors:
            d = (c.get("domain_name") or c.get("domain") or "").lower()
            if any(m_dom in d for m_dom in MULTIMODAL_UGC_DOMAINS) and d not in multimodal_competitor_domains:
                multimodal_competitor_domains.append(d)

    # 3. Hitung Plafon & Batasan Kata Ketat (Word Budget Enforcement - Sprint 4.4 Dynamic Budget)
    if word_budget_min and word_budget_max and word_budget_max > word_budget_min:
        min_target_words = word_budget_min
        max_target_words = word_budget_max
    elif 0 < draft_word_count < 300:
        min_target_words = max(50, int(draft_word_count * 0.90))
        max_target_words = max(min_target_words + 60, int(draft_word_count * 1.35))
    elif draft_word_count >= 300:
        min_target_words = max(300, int(draft_word_count * 0.85))
        max_target_words = max(min_target_words + 150, int(draft_word_count * 1.15))
    else:
        min_target_words = 800
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

    # ADR-01 & Langkah 4: Format Delimiter Naskah Dinamis
    if is_out_of_domain:
        draft_delimiter_block = ""
    elif draft_content and draft_content.strip():
        draft_delimiter_block = (
            f"\n\n=== DRAF ARTIKEL PENULIS ===\n"
            f"[NASKAH ARTIKEL YANG AKAN DIPROSES]:\n"
            f'"""\n'
            f"{draft_content.strip()}\n"
            f'"""\n'
            f"============================="
        )
    else:
        draft_delimiter_block = PROMPT_DRAFT_DELIMITER

    remediation_prompt_cms: Optional[str] = None
    remediation_prompt_perfectionist: Optional[str] = None

    if verdict_status in ("Siap Terbit", "Layak Terbit"):
        bullets.append(f"Skor diferensiasi semantik draf sangat baik ({cds_score}%), melampaui ambang batas.")
        bullets.append("Variasi leksikal tinggi dan struktur sub-judul proporsional tanpa repetisi berlebih.")
        if entity_gaps.gain:
            bullets.append(f"Draf berhasil menyajikan nilai tambah informasi orisinal: {gain_terms}.")

        # Tab 1: Paket Pra-Publikasi CMS & SEO Actionable (Sprint 3.5 & 3.6 & 4.1 & 4.2 & Anti-Slop)
        cms_pack_prompt = (
            f"Anda adalah Editor Distribusi & Metadata Digital.\n"
            f"Draf artikel ini telah lolos audit orisinalitas WASKITA dengan skor tinggi ({cds_score}%) untuk topik '{target_query}'.\n"
            f"Berdasarkan analisis perbandingan terhadap {competitor_count} artikel kompetitor teratas di Google SERP, draf ini memiliki diferensiasi dan nilai kebaruan materi yang kuat ({gain_terms}).\n\n"
            f"<larangan_keras_anti_slop>\n"
            f"- Hindari judul dan deskripsi 'clickbait' murahan atau jargon klise AI ('Mengejutkan!', 'Solusi Inovatif', 'Wajib Tahu!').\n"
            f"- Sesuaikan nada bahasa metadata dengan persona naskah asli agar selaras saat dibaca audiens target.\n"
            f"- DILARANG menambahkan basa-basi prolog/epilog AI.\n"
            f"</larangan_keras_anti_slop>\n\n"
            "Tolong siapkan paket materi pra-publikasi CMS & SEO untuk artikel ini tanpa mengubah isi naskah pokoknya:\n"
            f"1. Meta Title SEO: Buatkan judul menarik maksimal 60 karakter yang memuat kata kunci '{target_query}'.\n"
            "2. Meta Description: Buatkan deskripsi 140–155 karakter yang persuasif dan memicu CTR tinggi di Google.\n"
            f"3. Taksonomi & Tag: Ekstrak 3–5 tag kategori paling relevan untuk pengelompokan artikel di CMS.\n"
            "4. Ringkasan Eksekutif (Lead): Tuliskan cuplikan pembuka 2 kalimat untuk teaser media sosial dan newsletter.\n"
            f"5. Pertahankan Nilai Orisinal: Pastikan poin-poin kebaruan materi draf berikut tetap terjaga: {gain_terms}."
            f"{draft_delimiter_block}"
        )

        # Tab 2: Micro-Tuning Menuju 100% (Perfeksionis - Sprint 4.2 & Anti-Slop)
        perfectionist_prompt = (
            f"Anda adalah Redaktur Khusus Micro-Tuning dan Polishing Editorial.\n"
            f"Draf artikel ini telah mencapai skor {cds_score}% untuk topik '{target_query}'.\n"
            "Jika Anda ingin melakukan penyempurnaan mikro (micro-tuning) menuju kesempurnaan 100%, terapkan instruksi berikut:\n\n"
            f"<prinsip_editorial_anti_slop>\n"
            f"- ATURAN BEDAH PRESISI (SURGICAL EDITING): Draf ini sudah memiliki kualitas tinggi. DILARANG menulis ulang seluruh naskah. Pertahankan minimal 90% struktur dan kalimat yang sudah sangat baik ini kata demi kata.\n"
            f"- PRINSIP TONE MIRRORING: Jaga otentisitas suara dan register bahasa khas naskah asli (formal, kasual, santai, atau naratif) tanpa memaksakan kekakuan bahasa korporat.\n"
            f"- HINDARI KLISE AI: Jangan memasukkan kata penghubung klise ('tentunya', 'tidak dapat dipungkiri', 'hadir sebagai solusi').\n"
            f"- KELUARAN MURNI: Keluarkan naskah akhir secara utuh tanpa prolog atau epilog basa-basi AI.\n"
            f"</prinsip_editorial_anti_slop>\n\n"
            "1. Perkaya Kosakata & Variasi Leksikal (MATTR):\n"
            "   - Variasikan kosakata pada kalimat yang monoton untuk meningkatkan kekayaan diksi artikel.\n"
            "2. Lengkapi Celah Topik Minor:\n"
            f"   - Sisipkan sedikit ulasan kontekstual mengenai aspek berikut tanpa memanjangkan artikel: {valid_deficits_str}.\n"
            "3. Pertahankan Nilai Orisinalitas Unggul:\n"
            f"   - Jaga agar entitas nilai tambah unik berikut tetap dominan di naskah: {gain_terms}.\n"
            "4. Disiplin Panjang Naskah:\n"
            f"   - Pertahankan panjang artikel di rentang {min_target_words} – {max_target_words} kata tanpa menambah kalimat klise."
            f"{draft_delimiter_block}"
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
        elif verdict_status == "Perlu Revisi - Residu Elemen Website Terdeteksi":
            bullets.append(
                "Naskah terdeteksi memuat residu elemen tata letak website (navigasi, footer, daftar tautan direktori, atau hasil salin tempel Ctrl+A). Skor CDS dibatasi maksimal 48.0%."
            )
        elif verdict_status == "Perlu Revisi - Promosi Komersial Terselubung":
            bullets.append(
                "Naskah terindikasi mengalami pembelokan muatan transaksi/promosi komersial terselubung (Commercial Drift / kontak transaksi langsung di luar konsensus SERP). Skor CDS dibatasi maksimal 42.0%."
            )
        elif verdict_status == "Perlu Revisi - Teks Percakapan AI Terdeteksi":
            bullets.append(
                "Naskah masih memuat kebocoran teks percakapan asisten AI (prolog/epilog chatbot seperti 'Tentu, berikut artikelnya...'). Skor CDS dibatasi maksimal 45.0%."
            )
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

        if is_out_of_domain:
            # ADR-01: Prompt Khusus Out-of-Domain: Reorientasi Total (Clean Re-write tanpa Delimiter Draf Lama)
            remediation_prompt = (
                f"Anda adalah Kurator dan Redaktur Editorial Ahli.\n"
                f"PERINGATAN KURASI: Draf artikel ini terdeteksi berada di luar domain topik utama (Out-of-Domain, kemiripan semantik < 5%) untuk kueri target '{target_query}'.\n"
                f"Naskah sebelumnya memuat materi atau cuplikan berita acak yang menyimpang dari topik ini.\n\n"
                f"<instruksi_reorientasi_topik>\n"
                f"1. ELIMINASI KONTEN NON-TOPIKAL (BERSIHKAN NOISE):\n"
                f"   - Buang seluruh paragraf dan materi acak yang tidak berhubungan dengan '{target_query}'. DILARANG mempertahankan teks yang menyimpang dari topik utama.\n\n"
                f"2. REORIENTASI TOPIK TOTAL (TULIS ULANG BERFOKUS PENUH PADA KONSENSUS SERP):\n"
                f"   - Tulis ulang artikel 100% baru berfokus pada topik target '{target_query}' secara koheren dan berbobot.\n"
                f"   - Sebagaimana disepakati oleh {competitor_count} artikel acuan Google SERP ({other_domains_str}), wajib mengulas aspek penting berikut: {valid_deficits_str}.\n\n"
                f"3. LARANGAN KERAS FRASA KLISE AI (ANTI-SLOP):\n"
                f"   - Tulis dengan gaya jurnalistik profesional yang lugas, padat informasi, dan langsung ke inti persoalan (straight lead).\n"
                f"   - Dilarang menggunakan frasa klise AI seperti: 'Di era digital saat ini', 'Di era modern yang serba cepat ini', 'Tidak dapat dipungkiri bahwa', 'Hadir sebagai solusi inovatif', 'Mari kita simak', 'Seperti yang kita ketahui bersama', 'Bukan rahasia lagi', 'Dalam kesimpulannya', atau 'Semoga artikel ini bermanfaat'.\n\n"
                f"4. BATASAN PANJANG KATA (SERP WORD BUDGET):\n"
                f"   - Target panjang artikel: {min_target_words} – {max_target_words} kata (DILARANG melebihi {max_target_words} kata).\n"
                f"- FORMAT KELUARAN MURNI: Keluarkan HANYA naskah artikel hasil kurasi akhir tanpa salam pembuka, prolog, atau epilog basa-basi AI.\n"
                f"</instruksi_reorientasi_topik>"
            )
        else:
            # Prompt Terstruktur 4-Pilar Anti-Slop & Bedah Presisi (Sprint 4.2 & Fabric Anti-Slop)
            remediation_prompt = (
                f"Anda adalah Kurator dan Redaktur Editorial Ahli.\n"
                f"Tolong sempurnakan draf artikel ini untuk topik '{target_query}' dengan panduan kurasi berdasarkan perbandingan {competitor_count} artikel kompetitor acuan Google SERP berikut:\n\n"
                f"<prinsip_editorial_anti_slop>\n"
                f"- ATURAN BEDAH PRESISI (SURGICAL EDITING): Draf ini adalah naskah asli manusia. DILARANG merombak total dari nol. Pertahankan minimal 80% kalimat asli yang tidak bermasalah kata demi kata (verbatim) demi menjaga otentisitas suara penulis.\n"
                f"- PRINSIP TONE & PERSONA MIRRORING: Hormati dan tiru gaya tutur khas naskah asli penulis (baik bergaya jurnalistik, kasual/santai, naratif-bercerita, teknis, maupun esoteris/khas). Jangan mengubah kepribadian tulisan menjadi bahasa korporat yang kaku.\n"
                f"- LARANGAN KERAS FRASA KLISE AI (ANTI-SLOP):\n"
                f"  Dilarang menggunakan frasa pembuka/penghubung klise AI seperti: 'Di era digital saat ini', 'Di era modern yang serba cepat ini', 'Tidak dapat dipungkiri bahwa', 'Hadir sebagai solusi inovatif', 'Mari kita simak', 'Seperti yang kita ketahui bersama', 'Bukan rahasia lagi', 'Dalam kesimpulannya', atau 'Semoga artikel ini bermanfaat'.\n"
                f"- NADA BAHASA: Lugas, objektif, padat informasi, tanpa basa-basi marketing, dan langsung menuju inti bahasan (straight lead).\n"
                f"- FORMAT KELUARAN MURNI: Keluarkan HANYA naskah artikel hasil kurasi akhir. DILARANG menyertakan salam pembuka, prolog ('Berikut revisi artikel...'), atau epilog penjelasan dari AI.\n"
                f"</prinsip_editorial_anti_slop>\n\n"
                f"<instruksi_kurasi_4_pilar>\n"
                f"1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA:\n"
                f"   - Draf memiliki kemiripan struktur tinggi dengan {comp_citation or 'artikel kompetitor utama'}. Parafrase secara bedah presisi hanya pada kalimat-kalimat yang terindikasi plagiasi berikut tanpa mengubah data faktualnya:{snippets_block or ' Parafrase kalimat yang terlalu mirip acuan.'}\n\n"
                f"2. LENGKAPI CELAH KONSENSUS DARI KOMPETITOR LAIN:\n"
                f"   - Sebagaimana dibahas oleh kompetitor SERP lainnya ({other_domains_str}), sertakan pembahasan aspek penting yang masih absen di naskah Anda: {valid_deficits_str}. Sisipkan aspek ini secara organik ke dalam 1–2 paragraf terkait tanpa memanjangkan artikel secara berlebihan.\n\n"
                f"3. CIPTAKAN NILAI TAMBAH BARU (KALAHKAN {competitor_count} KOMPETITOR SERP):\n"
                f"   - Ke-{competitor_count} kompetitor acuan belum mengulas sudut pandang spesifik ini secara mendalam. Sertakan minimal 2 pembahasan baru atau studi kasus kontekstual yang bernilai tinggi bagi pembaca.\n"
                f"   - PENTING: Jangan hanya menaruh istilah nilai tambah baru ini sebagai judul atau sub-judul. Uraikan dan sebutkan istilah pembeda tersebut di dalam 2–3 kalimat penjelasan naratif pada badan paragraf agar terbaca jelas oleh pembaca dan algoritma mesin pencari.\n\n"
                f"4. BATASAN PANJANG KATA KETAT (SERP WORD BUDGET):\n"
                f"   - Target panjang artikel: {min_target_words} – {max_target_words} kata (DILARANG melebihi {max_target_words} kata).\n"
                f"   - Hapus basa-basi pembuka dan pengantar klise. Langsung bahas substansi pokok secara padat dan lugas.\n"
                f"</instruksi_kurasi_4_pilar>"
                f"{draft_delimiter_block}"
            )

    if multimodal_competitor_domains:
        mm_str = ", ".join(multimodal_competitor_domains[:3])
        bullets.append(
            f"Sinyal Lanskap Multi-Modal & UGC SERP: Kompetitor halaman pertama memuat platform sosial/komunitas ({mm_str}). "
            "Perkuat narasi pengalaman praktis (first-hand experience) dan sertakan elemen visual/multimedia ([gambar: ...] atau [video: ...]) agar selaras dengan intensi pencarian pengguna."
        )

    return {
        "overview_bullets": bullets,
        "remediation_prompt": remediation_prompt,
        "remediation_prompt_cms": remediation_prompt_cms,
        "remediation_prompt_perfectionist": remediation_prompt_perfectionist,
    }
