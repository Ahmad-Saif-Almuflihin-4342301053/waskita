import re
from typing import Dict, List, Optional
from app.services.nlp_pipeline import ALL_INDONESIAN_STOPWORDS, stem_word


def _tokenize_words(text: str) -> List[str]:
    """Mengambil token alfanumerik huruf kecil."""
    return re.findall(r"\b[a-zA-Z0-9_-]+\b", text.lower())


def calculate_ttr(tokens: List[str]) -> float:
    """Type-Token Ratio Klasik (Persamaan 2.2.5)."""
    if not tokens:
        return 0.0
    unique_tokens = set(tokens)
    return round(len(unique_tokens) / len(tokens), 4)


def calculate_mattr(tokens: List[str], window_size: int = 50) -> float:
    """
    Moving-Average Type-Token Ratio (MATTR) dengan jendela L = 50 kata.
    Menghilangkan bias panjang dokumen sesuai Bab 2.2.5.
    """
    n = len(tokens)
    if n == 0:
        return 0.0
    if n < window_size:
        return calculate_ttr(tokens)

    window_ttrs = []
    for i in range(n - window_size + 1):
        window = tokens[i : i + window_size]
        unique_count = len(set(window))
        window_ttrs.append(unique_count / window_size)

    return round(float(sum(window_ttrs) / len(window_ttrs)), 4)


def extract_headings_from_markdown_or_text(text: str) -> List[str]:
    """Mengekstrak baris heading Markdown (# Judul) atau baris berformat judul."""
    headings = []
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip()
        if re.match(r"^#{1,3}\s+", line_clean):
            heading_text = re.sub(r"^#{1,3}\s+", "", line_clean).strip()
            if heading_text:
                headings.append(heading_text)
    return headings


def calculate_hko(headings: List[str], target_query: str) -> float:
    """
    Heading-Keyword Overlap (HKO %):
    Proporsi sub-judul yang memuat minimal 1 token kata kunci target (Persamaan Bab 2.3).
    """
    if not headings:
        return 0.0

    query_tokens = [
        stem_word(t)
        for t in _tokenize_words(target_query)
        if t not in ALL_INDONESIAN_STOPWORDS and len(t) > 2
    ]
    if not query_tokens:
        query_tokens = _tokenize_words(target_query)

    if not query_tokens:
        return 0.0

    matching_headings_count = 0
    for h in headings:
        h_tokens = [stem_word(t) for t in _tokenize_words(h)]
        # Cek apakah ada minimal 1 token kueri yang muncul di heading
        if any(qt in h_tokens for qt in query_tokens):
            matching_headings_count += 1

    percentage = (matching_headings_count / len(headings)) * 100.0
    return round(percentage, 2)


def calculate_stylometrics(
    draft_content: str,
    target_query: str,
    headings: Optional[List[str]] = None,
) -> Dict[str, float]:
    """Kalkulasi lengkap metrik stilometri: TTR, MATTR (w=50), dan HKO %."""
    tokens = _tokenize_words(draft_content)
    ttr = calculate_ttr(tokens)
    mattr = calculate_mattr(tokens, window_size=50)

    if headings is None:
        headings = extract_headings_from_markdown_or_text(draft_content)

    hko = calculate_hko(headings, target_query)

    return {
        "ttr_score": ttr,
        "mattr_score": mattr,
        "hko_percentage": hko,
        "headings": headings,
    }
