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

# Stopwords tambahan khusus derau web, kata tugas, protokol, dan elemen navigasi (Sprint 4.0 & 4.1)
WEB_NOISE_STOPWORDS: Set[str] = {
    # Kata navigasi & derau web dasar
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
    # Protokol web, ekstensi berkas, & atribut teknis
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
    # Sprint 4.1: Derau Media, Agensi Foto, & Elemen CMS
    "bbc",
    "cnn",
    "cnbc",
    "kompasiana",
    "idntimes",
    "liputan6",
    "tempo",
    "tirto",
    "antara",
    "reuters",
    "getty",
    "shutterstock",
    "unsplash",
    "pixabay",
    "freepik",
    "pinterest",
    "instagram",
    "youtube",
    "tiktok",
    "facebook",
    "twitter",
    "whatsapp",
    "telegram",
    "caption",
    "foto",
    "gambar",
    "ilustrasi",
    "video",
    "platform",
    "highweb",
    "berita",
    "kanal",
    "rubrik",
    "edisi",
    "publikasi",
    # Sprint 4.1: Kata Pengantar Ekspositori & Kata Umum Non-Topik
    "mengenal",
    "kenal",
    "pengertian",
    "arti",
    "definisi",
    "makna",
    "istilah",
    "ciri",
    "contoh",
    "jenis",
    "macam",
    "bentuk",
    "bagian",
    "tingkat",
    "proses",
    "hasil",
    "cara",
    "langkah",
    "tips",
    "trik",
    "panduan",
    "manfaat",
    "fungsi",
    "tujuan",
    "alasan",
    "faktor",
    "dampak",
    "efek",
    "ulasan",
    "pembahasan",
    "penjelasan",
    "detail",
    "utama",
    "umum",
    "besar",
    "kecil",
    "baru",
    "lama",
    "tinggi",
    "rendah",
    "mudah",
    "sulit",
    "penting",
    "menarik",
    "populer",
    "terkenal",
    "berbagai",
    "tahun",
    "abad",
    "bulan",
    "hari",
    "minggu",
    "zaman",
    "masa",
    "era",
    "orang",
    "masyarakat",
    "dunia",
    "negara",
    "kota",
    "tempat",
    "lokasi",
    "bahasa",
    "konsep",
    "model",
    "gaya",
    "sistem",
    "struktur",
    "pilihan",
    "warna",
    "ukuran",
    "jumlah",
    "keseluruhan",
    "aliran",
    "karya",
    "bahan",
    "debat",
    "kesan",
}

ALL_INDONESIAN_STOPWORDS: Set[str] = _sastrawi_stopwords.union(WEB_NOISE_STOPWORDS)

# Peta kanonikalisasi serapan teknis & ejaan dwibahasa (Sprint 4.1)
LOANWORD_CANONICAL_MAP: Dict[str, str] = {
    "exposed": "ekspos",
    "ekspose": "ekspos",
    "brutalist": "brutalis",
    "brutalism": "brutalis",
    "brutalisme": "brutalis",
    "minimalist": "minimalis",
    "minimalism": "minimalis",
    "minimalisme": "minimalis",
    "modernist": "modernis",
    "modernism": "modernis",
    "modernisme": "modernis",
    "architecture": "arsitektur",
    "architectural": "arsitektur",
    "architect": "arsitek",
}


@functools.lru_cache(maxsize=100_000)
def stem_word(word: str) -> str:
    """
    Stemming kata tunggal Bahasa Indonesia dengan LRU Cache + normalisasi serapan teknis (Sprint 4.1).
    Menyatukan variasi sufiks '-isme' / '-ist' / '-is' dan padanan istilah serapan.
    """
    if not word or len(word) <= 2:
        return word
    w_low = word.lower().strip()
    if w_low in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[w_low]

    stemmed = _sastrawi_stemmer.stem(w_low)
    if stemmed in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[stemmed]

    # Normalisasi akhiran '-isme' -> '-is' untuk kata serapan panjang (misal 'fungsionalisme' -> 'fungsionalis')
    if len(stemmed) > 7 and stemmed.endswith("isme"):
        stemmed = stemmed[:-2]
    elif len(stemmed) > 6 and stemmed.endswith("ist"):
        stemmed = stemmed[:-1]

    return stemmed


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


def extract_full_stem_set(text: str) -> Set[str]:
    """
    Mengekstrak 100% himpunan seluruh stem unigram dan stem bigram dari teks
    TANPA pemotongan top_n. Digunakan untuk uji eksistensi himpunan yang akurat
    pada Information Gain (mencegah tuduhan defisit palsu & klaim gain palsu).
    """
    tokens = _sync_clean_and_tokenize(text)
    if not tokens:
        return set()

    stems_list: List[str] = []
    full_stems: Set[str] = set()

    for tok in tokens:
        if len(tok) > 2 and tok not in ALL_INDONESIAN_STOPWORDS and not tok.isdigit():
            st = stem_word(tok)
            if st and len(st) > 2 and st not in ALL_INDONESIAN_STOPWORDS:
                full_stems.add(st)
                stems_list.append(st)
            else:
                stems_list.append("")
        else:
            stems_list.append("")

    # Tambahkan seluruh bigram bermakna yang bersebelahan
    for i in range(len(stems_list) - 1):
        s1, s2 = stems_list[i], stems_list[i + 1]
        if s1 and s2 and s1 != s2:
            full_stems.add(f"{s1} {s2}")

    return full_stems


def extract_candidate_entities(text: str, top_n: int = 40) -> List[Tuple[str, str, int]]:
    """
    Mengekstrak kandidat entitas informasional berupa unigram dan bigram bermakna (Sprint 4.1).
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
            if stem and len(stem) > 2 and stem not in ALL_INDONESIAN_STOPWORDS:
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
            if (
                stem1
                and len(stem1) > 2
                and stem1 not in ALL_INDONESIAN_STOPWORDS
                and stem2
                and len(stem2) > 2
                and stem2 not in ALL_INDONESIAN_STOPWORDS
                and stem1 != stem2
            ):
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

    # Urutkan: beri bobot 1.35x pada bigram yang muncul >= 2 kali agar frasa spesifik lebih diutamakan
    candidates.sort(
        key=lambda x: (x[2] * 1.35 if (" " in x[0] and x[2] >= 2) else float(x[2])),
        reverse=True,
    )
    return candidates[:top_n]
