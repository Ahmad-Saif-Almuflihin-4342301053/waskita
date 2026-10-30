import asyncio
import functools
import re
from typing import Any, Dict, List, Set, Tuple
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

from app.core.cache import get_nlp_preproc_cache, set_nlp_preproc_cache

# Regex pembersih placeholder media [gambar 1], [video 2], [tabel 1], dsb.
MEDIA_PLACEHOLDER_REGEX = re.compile(
    r"\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*[^\]]*\]",
    re.IGNORECASE,
)


def strip_media_placeholders(text: str) -> str:
    """Hapus placeholder media seperti [gambar 1], [video 2], [tabel 1], dsb. dari naskah."""
    if not text:
        return ""
    return MEDIA_PLACEHOLDER_REGEX.sub(" ", text)

# Inisialisasi pabrik Sastrawi sekali secara singleton di modul
_stemmer_factory = StemmerFactory()
_sastrawi_stemmer = _stemmer_factory.create_stemmer()

_stopword_factory = StopWordRemoverFactory()
_sastrawi_stopwords = set(_stopword_factory.get_stop_words())

# Stopwords tambahan khusus derau web, kata tugas, protokol, dan elemen navigasi (Sprint 4.0)
WEB_NOISE_STOPWORDS: Set[str] = {
    "baca",
    "juga",
    "halaman",
    "berikut",
    "klik",
    "komentar",
    "iklan",
    "copyright",
    "artikel",
    "konten",
    "sumber",
    "terkait",
    "simak",
    "selengkapnya",
    "dilansir",
    "dikutip",
    "redaksi",
    "editor",
    "penulis",
    "tribun",
    "kompas",
    "detik",
    # Sprint 4.0: Stopwords protokol web, ekstensi berkas, dan elemen navigasi
    "www",
    "http",
    "https",
    "html",
    "htm",
    "php",
    "asp",
    "aspx",
    "jsp",
    "com",
    "org",
    "net",
    "gov",
    "edu",
    "mil",
    "co",
    "id",
    "io",
    "ai",
    "url",
    "uri",
    "link",
    "download",
    "pdf",
    "file",
    "doc",
    "docx",
    "web",
    "website",
    "portal",
    "site",
    "view",
    "share",
    "tag",
    "tags",
    "admin",
    "posted",
    "author",
    "post",
    "posts",
    "comment",
    "search",
    "cari",
    "menu",
    "home",
    "beranda",
    "navigasi",
    "navigation",
    "undefined",
    "null",
    "true",
    "false",
}

ALL_INDONESIAN_STOPWORDS: Set[str] = _sastrawi_stopwords.union(WEB_NOISE_STOPWORDS)


@functools.lru_cache(maxsize=100_000)
def stem_word(word: str) -> str:
    """Stemming kata tunggal Bahasa Indonesia dengan LRU Cache untuk kecepatan komputasi tinggi."""
    if not word or len(word) <= 2:
        return word
    return _sastrawi_stemmer.stem(word)


def _sync_clean_and_tokenize(text: str) -> List[str]:
    """Tokenisasi dan pembersihan regex sederhana (huruf kecil dan alfanumerik) setelah menghapus placeholder media."""
    text_without_media = strip_media_placeholders(text)
    text_clean = re.sub(r"[^\w\s]", " ", text_without_media.lower())
    tokens = [t.strip() for t in text_clean.split() if t.strip()]
    return tokens


def _sync_preprocess_corpus(text: str) -> str:
    """
    Operasi CPU berat #2: Pipa normalisasi dan stemming teks korpus penuh oleh PySastrawi.
    Membersihkan stopwords dan melakukan stemming pada setiap token.
    """
    tokens = _sync_clean_and_tokenize(text)
    filtered_stems = []
    for token in tokens:
        if len(token) > 2 and token not in ALL_INDONESIAN_STOPWORDS and not token.isdigit():
            stemmed = stem_word(token)
            if stemmed and stemmed not in ALL_INDONESIAN_STOPWORDS:
                filtered_stems.append(stemmed)
    return " ".join(filtered_stems)


async def preprocess_text_async(text: str) -> str:
    """
    Operasi CPU berat #2 dibungkus dengan asyncio.to_thread untuk mencegah event-loop blocking,
    dilengkapi Multi-Tier Cache-Aside (Fase 1 Production Roadmap) untuk eliminasi redundansi stemming.
    """
    if not text:
        return ""
    cached = await get_nlp_preproc_cache(text)
    if cached is not None:
        return cached

    result = await asyncio.to_thread(_sync_preprocess_corpus, text)
    await set_nlp_preproc_cache(text, result)
    return result


def extract_candidate_entities(text: str, top_n: int = 30) -> List[Tuple[str, str, int]]:
    """
    Mengekstrak kandidat entitas informasional berupa unigram dan bigram bermakna.
    Mengembalikan list tuple: (term_stem, term_surface_form, count)
    term_stem: bentuk dasar/stem untuk pencocokan himpunan set-difference
    term_surface_form: bentuk asli naskah untuk tampilan antarmuka
    """
    tokens = _sync_clean_and_tokenize(text)
    if not tokens:
        return []

    # 1. Unigram
    unigram_counts: Dict[str, Dict[str, Any]] = {}
    for tok in tokens:
        if len(tok) > 2 and tok not in ALL_INDONESIAN_STOPWORDS and not tok.isdigit():
            stem = stem_word(tok)
            if stem and stem not in ALL_INDONESIAN_STOPWORDS:
                if stem not in unigram_counts:
                    unigram_counts[stem] = {"surface": tok, "count": 0}
                unigram_counts[stem]["count"] += 1

    # 2. Bigram bermakna (kedua kata bukan stopword murni)
    bigram_counts: Dict[str, Dict[str, Any]] = {}
    for i in range(len(tokens) - 1):
        t1, t2 = tokens[i], tokens[i + 1]
        if (
            len(t1) > 2
            and len(t2) > 2
            and t1 not in ALL_INDONESIAN_STOPWORDS
            and t2 not in ALL_INDONESIAN_STOPWORDS
            and not t1.isdigit()
            and not t2.isdigit()
        ):
            stem1 = stem_word(t1)
            stem2 = stem_word(t2)
            if stem1 and stem2:
                bigram_stem = f"{stem1} {stem2}"
                bigram_surface = f"{t1} {t2}"
                if bigram_stem not in bigram_counts:
                    bigram_counts[bigram_stem] = {"surface": bigram_surface, "count": 0}
                bigram_counts[bigram_stem]["count"] += 1

    candidates: List[Tuple[str, str, int]] = []
    for s, data in unigram_counts.items():
        candidates.append((s, data["surface"], data["count"]))
    for s, data in bigram_counts.items():
        candidates.append((s, data["surface"], data["count"]))

    # Urutkan berdasarkan frekuensi kemunculan
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates[:top_n]
