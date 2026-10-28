import re
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.audit import AnnotatedSpan, EntityGapsGroup, ThresholdConfig
from app.services.nlp_pipeline import ALL_INDONESIAN_STOPWORDS, stem_word

# Pola AI Klise dan Frasa Generik Bahasa Indonesia (FR-11)
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


def _split_into_sentences(text: str) -> List[str]:
    """Memecah paragraf/teks menjadi daftar kalimat yang utuh."""
    # Pecah berdasarkan tanda titik, tanda tanya, tanda seru atau newline ganda
    raw_sentences = re.split(r"(?<=[.!?])\s+|\n{2,}", text)
    sentences = [s.strip() for s in raw_sentences if s.strip()]
    return sentences


def generate_annotated_spans(
    draft_content: str,
    competitor_clean_texts: List[str],
    entity_gaps: EntityGapsGroup,
    hko_percentage: float,
    threshold_hko: float = 40.0,
) -> List[AnnotatedSpan]:
    """
    Algoritma Anotasi Stabilo 4-Warna Resmi (Proposal TA Tabel 3.6):
    - 'yellow': Klise / Generik / Repetisi HKO / TTR lokal < 0.50
    - 'red': Redundansi VSM lokal (kemiripan kosinus terhadap kompetitor >= 0.65)
    - 'blue': Rekomendasi celah topik defisit (Delta deficit penting)
    - 'green': Orisinalitas Kuat / Nilai Tambah Unik (memuat Delta gain)
    """
    sentences = _split_into_sentences(draft_content)
    spans: List[AnnotatedSpan] = []

    # Himpunan stem entitas gain dan deficit (filter entitas komersial/sponsor)
    gain_stems = {item.term_string for item in entity_gaps.gain}
    valid_deficits = [
        d for d in entity_gaps.deficit
        if not is_commercial_or_sponsor(d.term_string) and not is_commercial_or_sponsor(d.term_surface_form)
    ]
    top_deficit_items = valid_deficits[:3]

    # Gabungan kalimat dari artikel kompetitor untuk deteksi redundansi lokal
    competitor_sentences = []
    for c_text in competitor_clean_texts:
        for s in _split_into_sentences(c_text):
            if len(s.split()) >= 6:
                competitor_sentences.append(s)

    # Injeksi saran defisit di awal jika ada celah signifikan
    if top_deficit_items:
        deficits_str = ", ".join([d.term_surface_form for d in top_deficit_items])
        spans.append(
            AnnotatedSpan(
                text=f"[Saran Celah Defisit SERP: Naskah belum mengulas materi penting: {deficits_str}]",
                color="blue",
                label="Saran Celah Defisit",
            )
        )

    for sentence in sentences:
        s_lower = sentence.lower()
        words = re.findall(r"\b\w+\b", s_lower)
        word_count = len(words)

        if word_count < 4:
            spans.append(AnnotatedSpan(text=sentence, color=None, label=None))
            continue

        # 1. Cek Kuning (Yellow): Klise / Generik / TTR Lokal Sangat Rendah
        is_cliche = any(cliche in s_lower for cliche in CLICHE_PHRASES)
        local_ttr = len(set(words)) / word_count if word_count > 0 else 1.0

        if is_cliche or local_ttr < 0.45:
            spans.append(
                AnnotatedSpan(
                    text=sentence,
                    color="yellow",
                    label="Klise/Generik" if is_cliche else "Repetisi Leksikal Rendah",
                )
            )
            continue

        # 2. Cek Merah (Red): Redundansi VSM Kalimat Lokal terhadap Kalimat Kompetitor
        # Cek kesamaan string/n-gram sederhana terlebih dahulu jika kalimat kompetitor tersedia
        is_redundant = False
        if competitor_sentences and word_count >= 8:
            # Bandingkan overlap kata non-stopword
            sentence_stems = {
                stem_word(w) for w in words if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2
            }
            if len(sentence_stems) >= 4:
                for comp_s in competitor_sentences:
                    comp_words = re.findall(r"\b\w+\b", comp_s.lower())
                    comp_stems = {
                        stem_word(w)
                        for w in comp_words
                        if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2
                    }
                    if comp_stems:
                        overlap = len(sentence_stems.intersection(comp_stems))
                        jaccard = overlap / len(sentence_stems.union(comp_stems))
                        if jaccard >= 0.65:
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

        # 3. Cek Hijau (Green): Memuat entitas Delta Gain unik
        sentence_stems_all = {stem_word(w) for w in words if len(w) > 2}
        has_gain_entity = any(gs in sentence_stems_all for gs in gain_stems)
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
) -> Dict[str, any]:
    """
    Rumus Komposit Content Differentiation Score (CDS 0-100%) & Keputusan Gatekeeper (Bab 2.4 & FR-10):
    1. C_VSM (35%)
    2. C_IG (30%)
    3. C_MATTR (20%)
    4. C_HKO (15%)
    CDS = round(0.35 * C_VSM + 0.30 * C_IG + 0.20 * C_MATTR + 0.15 * C_HKO, 1)

    Ditambah Topic Relevance Gate (Sprint 3.1 & Temuan T8):
    Jika avg_cosine_sim < 0.05, naskah ditandai Out-of-Domain (Perlu Revisi - Topik Tidak Relevan).
    """
    # 1. Skor Diferensiasi Vektor C_VSM (35%)
    # Penalti linier jika S_cos_max > 0.25
    c_vsm_raw = 100.0 * (1.0 - max(0.0, (max_cosine_sim - 0.25) / 0.75))
    c_vsm = max(0.0, min(100.0, c_vsm_raw))

    # 2. Skor Cakupan & Kebaruan Entitas C_IG (30%)
    coverage_ratio = shared_entities_count / max(1, serp_entities_count)
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

    # Topic Relevance Gate (Sprint 3.1 & Bukti Empiris T8 Fase C)
    is_out_of_domain = (avg_cosine_sim is not None) and (avg_cosine_sim < 0.05)

    # Aturan Vonis
    if is_out_of_domain:
        verdict_status = "Perlu Revisi - Topik Tidak Relevan"
    elif (cds >= thresholds.min_cds_score) and (not is_redundant) and (not is_keyword_stuffed):
        verdict_status = "Siap Terbit"
    else:
        verdict_status = "Perlu Revisi"

    return {
        "content_differentiation_score": cds,
        "is_redundant": is_redundant,
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
) -> Dict[str, any]:
    """Menghasilkan poin ringkasan overview_bullets dan instruksi kurasi remediation_prompt."""
    bullets: List[str] = []
    remediation_points: List[str] = []

    # Format sitasi kompetitor tertinggi jika ada (Sprint 3.3)
    comp_citation = ""
    if highest_competitor:
        comp_title = highest_competitor.get("title") or "Artikel Kompetitor Teratas"
        comp_domain = highest_competitor.get("domain") or ""
        if not comp_domain and highest_competitor.get("url"):
            from urllib.parse import urlparse
            comp_domain = urlparse(highest_competitor["url"]).netloc.replace("www.", "")

        sim_val = highest_competitor.get("cosine_similarity", max_cosine_sim)
        sim_pct = round(sim_val * 100.0, 1)
        if comp_domain:
            comp_citation = f"Artikel '{comp_title}' ({comp_domain}) dengan kemiripan {sim_pct}%"
        else:
            comp_citation = f"Artikel '{comp_title}' dengan kemiripan {sim_pct}%"

    if verdict_status == "Siap Terbit":
        bullets.append(f"Skor diferensiasi semantik draf sangat baik ({cds_score}%), melampaui ambang batas.")
        bullets.append("Variasi leksikal tinggi dan struktur sub-judul proporsional tanpa repetisi berlebih.")
        if entity_gaps.gain:
            gain_terms = ", ".join([g.term_surface_form for g in entity_gaps.gain[:3]])
            bullets.append(f"Draf berhasil menyajikan nilai tambah informasi orisinal: {gain_terms}.")
        remediation_prompt = (
            f"Draf untuk kueri '{target_query}' telah memenuhi standar kurasi pra-publikasi WASKITA (Skor: {cds_score}%). "
            "Artikel siap dipublikasikan ke CMS dengan tetap mempertahankan kebaruan materi yang ada."
        )
    else:
        bullets.append(f"Draf memerlukan kurasi editorial (Skor CDS: {cds_score}%).")
        if is_out_of_domain:
            bullets.append("Naskah terindikasi di luar topik utama (Out-of-Domain): kemiripan semantik rata-rata dengan acuan SERP sangat rendah (< 0.05).")
            remediation_points.append(f"Pastikan naskah benar-benar mengulas topik target '{target_query}'. Naskah saat ini tidak memiliki relevansi semantik yang memadai dengan korpus acuan.")
        if is_redundant:
            if comp_citation:
                bullets.append(f"Tingkat kemiripan semantik tinggi terhadap {comp_citation} (melampaui ambang batas).")
                remediation_points.append(
                    f"Tulis ulang paragraf naskah yang memiliki kemiripan tinggi dengan {comp_citation} agar struktur kalimat dan sudut pandang menjadi orisinal."
                )
            else:
                bullets.append(f"Tingkat kemiripan semantik dengan artikel kompetitor terlalu tinggi ({max_cosine_sim:.2f} > ambang batas).")
                remediation_points.append("Tulis ulang paragraf yang ditandai merah agar tidak menjiplak struktur kalimat kompetitor.")

            # Sertakan cuplikan naskah yang terindikasi plagiasi/parafrase langsung (Sprint 3.3)
            if redundant_snippets:
                unique_snippets = []
                for s in redundant_snippets:
                    s_clean = s.strip()
                    if s_clean and s_clean not in unique_snippets:
                        unique_snippets.append(s_clean)
                    if len(unique_snippets) >= 3:
                        break
                if unique_snippets:
                    snippets_block = "\n".join([f'   > "{s}"' for s in unique_snippets])
                    remediation_points.append(
                        f"Cuplikan kalimat naskah yang terindikasi parafrase/jiplak langsung:\n{snippets_block}"
                    )

        if is_keyword_stuffed:
            if hko_percentage > 40.0:
                bullets.append(f"Sub-judul terindikasi keyword stuffing ({hko_percentage:.1f}% memuat kata kunci).")
                remediation_points.append("Variasikan teks sub-judul (H2/H3) agar lebih deskriptif dan natural tanpa mengulang kata kunci utama secara monoton.")
            if mattr_score < 0.55:
                bullets.append(f"Kosakata artikel cenderung repetitif (MATTR: {mattr_score:.2f} < 0.55).")
                remediation_points.append("Gunakan sinonim kata yang lebih bervariasi untuk memperkaya stilometri teks.")

        # Filter entitas defisit dari noise komersial/sponsor seperti Colorbond (Sprint 3.3)
        valid_deficits = [
            d for d in entity_gaps.deficit
            if not is_commercial_or_sponsor(d.term_string) and not is_commercial_or_sponsor(d.term_surface_form)
        ]
        if valid_deficits:
            deficit_terms = ", ".join([d.term_surface_form for d in valid_deficits[:3]])
            bullets.append(f"Terdapat celah topik penting SERP yang belum dicakup: {deficit_terms}.")
            remediation_points.append(f"Sertakan pembahasan topik berikut untuk melengkapi draf: {deficit_terms}.")

        points_text = "\n".join([f"{idx+1}. {pt}" for idx, pt in enumerate(remediation_points)])
        remediation_prompt = (
            f"Tolong sempurnakan draf artikel ini untuk topik '{target_query}' dengan panduan kurasi berikut:\n"
            f"{points_text}\n"
            "Pertahankan keunikan sudut pandang tulisan dan hindari frasa pembuka yang klise."
        )

    return {
        "overview_bullets": bullets,
        "remediation_prompt": remediation_prompt,
    }
