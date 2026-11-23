import asyncio
import functools
import re
import unicodedata
from typing import Any, Dict, List, Set, Tuple
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

from app.core.cache import get_nlp_preproc_cache, set_nlp_preproc_cache

# Regex pembersih placeholder media dengan preservasi alt-text / figcaption deskriptif (E-E-A-T Visual Experience)
MEDIA_WITH_CAPTION_REGEX = re.compile(
    r"\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*\s*:\s*(?:Ilustrasi\s+)?([^\]]+)\]",
    re.IGNORECASE,
)
MEDIA_PLAIN_REGEX = re.compile(
    r"\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*[^\]]*\]",
    re.IGNORECASE,
)

# Pola penyaring residu elemen tata letak web mentah (Ctrl+A Web Chrome: Kumparan, Detik, Kompas, dll.)
WEB_CHROME_LINE_PATTERNS: List[re.Pattern] = [
    re.compile(r"^\s*(?:baca|simak|lihat)\s+(?:juga|video|selengkapnya)", re.IGNORECASE),
    re.compile(r"^\s*(?:berita|artikel)\s+terpopuler", re.IGNORECASE),
    re.compile(r"^\s*trending\s+(?:sekarang|hari ini|topik)", re.IGNORECASE),
    re.compile(r"^\s*tags?\s*:\s*#", re.IGNORECASE),
    re.compile(r"^\s*komentar\s+pembaca\s*(?:\(\d+\)|:)", re.IGNORECASE),
    re.compile(r"^\s*(?:penulis|editor|reporter|kontributor|writer)\s*:\s*[A-Za-z]", re.IGNORECASE),
    re.compile(r"(?:tentang kami|redaksi|pedoman media siber|kebijakan privasi|all rights reserved)", re.IGNORECASE),
    re.compile(r"hak cipta\s+\d{4}", re.IGNORECASE),
    re.compile(r"^\s*bagikan\s*:\s*(?:whatsapp|facebook|twitter|salin tautan)", re.IGNORECASE),
    re.compile(r"^\s*kumparan\s*(?:news|bisnis|bola|mom|travel|tech|hits|otomotif)?\b", re.IGNORECASE),
    re.compile(r"^\s*detik\s*(?:news|finance|hot|sport|inet|food|health|travel)?\b", re.IGNORECASE),
    re.compile(r"^\s*(?:kompas\.com|tribunnews|tribun network|idn times|cnn indonesia|cnbc indonesia)\b", re.IGNORECASE),
    re.compile(r"^\s*perbesar\s*$", re.IGNORECASE),
    re.compile(r"^\s*(?:foto|video|ilustrasi)\s*:\s*.+", re.IGNORECASE),
    re.compile(r"^\s*(?:advertisement|scroll to (?:resume|continue) (?:with )?content)\s*$", re.IGNORECASE),
    re.compile(r"^\s*(?:pilihan editor|pilihan redaksi)\s*:\s*", re.IGNORECASE),
    re.compile(r"ikuti (?:kabar|berita) (?:terkini|terbaru).+di whatsapp channel", re.IGNORECASE),
    re.compile(r"konten ini diproduksi oleh", re.IGNORECASE),
    re.compile(r"\b\d{1,2}\s+(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}.+wib", re.IGNORECASE),
    re.compile(r"^\s*(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu),\s+\d{1,2}\s+[a-z]{3,9}\s+\d{4}.*wib", re.IGNORECASE),
]


def is_web_chrome_noise_line(line: str) -> bool:
    """Mengecek apakah satu baris teks merupakan residu elemen tata letak web (Ctrl+A)."""
    l_strip = line.strip()
    if not l_strip:
        return False
    return any(p.search(l_strip) for p in WEB_CHROME_LINE_PATTERNS)


BLOG_COMMENT_SECTION_BOUNDARY_PATTERNS: List[re.Pattern] = [
    re.compile(r"^\s*\d+\s+thoughts?\s+on\s+[“\"'‘]", re.IGNORECASE),
    re.compile(r"^\s*(?:leave\s+a\s+reply|leave\s+a\s+comment|tinggalkan\s+balasan|tinggalkan\s+komentar)\s*$", re.IGNORECASE),
    re.compile(r"^\s*(?:\d+\s+komentar|komentar\s+pembaca)\s*$", re.IGNORECASE),
]


def truncate_blog_comments_section(text: str) -> str:
    """
    Celah #9 Fix: Memangkas seksi komentar blog (WordPress/Blogger/Disqus) yang ikut tersalin
    saat pengguna melakukan Ctrl+A, tetapi hanya jika pembatas tersebut muncul setelah >= 40 kata naskah utama.
    """
    if not text:
        return ""
    lines = text.split("\n")
    kept_lines: List[str] = []
    accumulated_words = 0
    for line in lines:
        l_strip = line.strip()
        if accumulated_words >= 40 and any(p.search(l_strip) for p in BLOG_COMMENT_SECTION_BOUNDARY_PATTERNS):
            break
        kept_lines.append(line)
        accumulated_words += len(l_strip.split())
    return "\n".join(kept_lines)


def strip_web_chrome_noise(text: str) -> str:
    """Membersihkan seksi komentar blog dan residu baris web chrome dari naskah sebelum diekstraksi."""
    if not text:
        return ""
    truncated = truncate_blog_comments_section(text)
    clean_lines = [line for line in truncated.split("\n") if not is_web_chrome_noise_line(line)]
    return "\n".join(clean_lines)


def strip_media_placeholders(text: str, keep_captions: bool = True) -> str:
    """
    Hapus placeholder media seperti [gambar 1], [video 2], [tabel 1], dsb. dari naskah.
    Jika keep_captions=True, teks deskripsi caption/alt ([gambar 1: Ilustrasi X]) dipertahankan sebagai teks analitis.
    """
    if not text:
        return ""
    if keep_captions:
        text = MEDIA_WITH_CAPTION_REGEX.sub(r" \1 ", text)
    return MEDIA_PLAIN_REGEX.sub(" ", text)


def normalize_text_ascii(text: str) -> str:
    """Normalisasi karakter beraksen (é -> e, ü -> u, d' -> d ) dengan NFKD (Sprint 4.2)."""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    folded = "".join(c for c in nfkd if not unicodedata.combining(c))
    folded = folded.replace("'", " ").replace("’", " ").replace("`", " ")
    return folded

# Inisialisasi pabrik Sastrawi & Kumparan nlp-id sekali secara singleton di modul
_stemmer_factory = StemmerFactory()
_sastrawi_stemmer = _stemmer_factory.create_stemmer()

try:
    from nlp_id.lemmatizer import Lemmatizer as KumparanLemmatizer
    _kumparan_lemmatizer = KumparanLemmatizer()
except Exception:
    _kumparan_lemmatizer = None

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
    # Catatan Revisi Sempro: Kata 'kompas', 'detik', 'tempo', 'antara' dihapus dari stopword
    # leksikal untuk mencegah ambiguitas polisemi (alat navigasi kompas / satuan detik / preposisi antara).
    # Penyaringan derau publisher diserahkan pada DOM cleaner HTML dan pembobotan IDF.
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
    # Sprint 4.1: Derau Media, Agensi Foto, Portal Berita & Elemen CMS
    "bbc",
    "cnn",
    "cnbc",
    "kompasiana",
    "idntimes",
    "liputan6",
    "tirto",
    "reuters",
    "kumparan",
    "kumparannews",
    "detikcom",
    "detiknews",
    "kompascom",
    "tribunnews",
    "tempoco",
    "antaranews",
    "suaracom",
    "perbesar",
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

# Stopwords ragam percakapan / bahasa gaul (lo-gue, partikel kasual, & singkatan chat)
COLLOQUIAL_INDONESIAN_STOPWORDS: Set[str] = {
    # Pronomina persona gaul
    "gue", "gua", "gw", "lu", "lo", "elo", "elu", "doi",
    # Partikel, kata tugas, & interjeksi gaul
    "banget", "bgt", "sih", "deh", "dong", "nih", "tuh", "lah", "kan", "kok",
    "nggak", "gak", "ga", "ngga", "kaga", "kagak", "ndak",
    "udah", "udh", "dah",
    "kalo", "klo", "kl",
    "gitu", "gini", "kayak", "kyk", "kek",
    "aja", "aj", "doang",
    "emang", "emg", "beneran", "cuma", "cm", "cuman",
    "padahal", "pdhl", "terus", "trs", "biar",
    "tau", "gimana", "gmn", "kenapa", "knp",
    "makanya", "malah", "nah", "tapi", "tp",
    "yah", "yaudah", "ywdh", "mulu", "lagian",
    "bikin", "bakal", "bakalan",
}

NEGATION_CUES: Set[str] = {
    "tidak", "tak", "bukan", "jangan", "tanpa", "belum", "dilarang", "anti", "non", "enggak", "gak", "ga"
}

ALL_INDONESIAN_STOPWORDS: Set[str] = (
    _sastrawi_stopwords.union(WEB_NOISE_STOPWORDS).union(COLLOQUIAL_INDONESIAN_STOPWORDS) - NEGATION_CUES
)

# Peta kanonikalisasi serapan teknis & ejaan dwibahasa (Sprint 4.1 & 4.2)
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
    "perancis": "prancis",
    "prancis": "prancis",
    "unite": "unite",
    "habitation": "habitation",
}

# Verba dan Adjektiva Non-Topikal yang wajib dibersihkan dari celah defisit (Sprint 4.2 & 4.3)
NON_TOPICAL_VERBS_AND_ADJECTIVES: Set[str] = {
    "sederhana", "muncul", "selesai", "pandangan", "garis", "berbeda",
    "dikaitkan", "namanya", "perubahan", "memiliki", "menjadi", "terdapat",
    "menggunakan", "merupakan", "dikenal", "membantu", "membuat", "terlihat",
    "diperkuat", "indah", "elemen", "seni", "menciptakan", "milik",
    "cipta", "bentuk", "kait", "satu", "dua", "tiga", "berbagai",
    # Penambahan Sprint 4.3 (verba proses & adjektiva non-substantif)
    "pengaruh", "dasar", "tonjol", "kembang", "tekan", "anggap",
    "khas", "cepat", "salah", "letak", "akses", "padu", "hidup",
    "mempengaruhi", "berdasarkan", "penonjolan", "perkembangan", "penekanan",
    "dianggap", "khasnya", "kehidupan",
}

# Kata hubung/depan yang dilarang berada di dalam frasa Bigram/Trigram Information Gain (Sprint 4.3)
FORBIDDEN_GAIN_CONNECTOR_WORDS: Set[str] = {
    "di", "ke", "dari", "dan", "atau", "yaitu", "tanpa", "karya", "untuk", "dengan",
}


def is_narrative_noise(word: str) -> bool:
    """
    Morphological Narrative Filter (Sprint 4.4):
    Mendeteksi kata transisi naratif, unigram klitik '-nya', dan verba pasif non-substantif
    agar tidak mencemari daftar konsensus SERP dan celah defisit.
    """
    if not word:
        return True
    w = word.lower().strip()
    if len(w) <= 3:
        return True
    # Cek kata transisi berakhiran -nya (misal: kecintaannya, menariknya, umumnya, tampaknya, rupanya)
    if w.endswith("nya") and len(w) >= 6:
        root = w[:-3]
        if root in ALL_INDONESIAN_STOPWORDS or root in NON_TOPICAL_VERBS_AND_ADJECTIVES or len(root) <= 3:
            return True
        if w in {
            "kecintaannya", "menariknya", "sebenarnya", "khususnya", "akhirnya",
            "awalnya", "umumnya", "tampaknya", "biasanya", "rupanya", "pastinya",
        }:
            return True
    # Verba pasif non-substantif
    if w in {
        "tersebar", "dikritik", "dibangun", "dibuat", "diterapkan", "dikenal",
        "disebut", "dilihat", "terdapat", "terletak",
    }:
        return True
    return False


# Homograf rawan over-stemming dengan aturan preservasi lema dasar (Sprint 4.5 / DOM-01)
HOMOGRAPH_PROTECTED_LEMMAS: Dict[str, str] = {
    "berlayar": "berlayar",  # Mencegah reduksi ke 'layar' (display/monitor)
    "pelajar": "pelajar",    # Mencegah reduksi ke 'ajar'
    "pejabat": "pejabat",    # Mencegah reduksi ke 'jabat'
    "perawat": "perawat",    # Mencegah reduksi ke 'awat'
}


@functools.lru_cache(maxsize=100_000)
def stem_word(word: str) -> str:
    """
    Hybrid Dual-Engine Morphological Normalizer (Kumparan nlp-id + PySastrawi Fallback + DOM-01 Homograph Guard).
    Menggunakan kamus 778.514 entri lemma_dict dari Kumparan nlp-id sebagai mesin utama (O(1) lookup,
    4.4x lebih cepat dari Sastrawi, dan akurat pada afiks kompleks seperti 'berkesinambungan' -> 'sinambung'),
    dengan fallback ke algoritma Nazief-Adriani (PySastrawi) untuk kata di luar kamus (OOV).
    """
    if not word or len(word) <= 2:
        return word
    w_low = word.lower().strip()
    if w_low in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[w_low]

    # Perlindungan homograf independen (DOM-01)
    if w_low in HOMOGRAPH_PROTECTED_LEMMAS:
        try:
            from app.core.logging_config import append_structured_jsonl_log
            append_structured_jsonl_log("nlp_oov_and_disambiguation.jsonl", {
                "type": "homograph_protected",
                "word": w_low,
                "lemma": HOMOGRAPH_PROTECTED_LEMMAS[w_low],
            })
        except Exception:
            pass
        return HOMOGRAPH_PROTECTED_LEMMAS[w_low]

    # Primary Engine: Kumparan nlp-id Lemmatizer (778.514 lemma dictionary) + Fallback PySastrawi
    fallback_used = False
    if _kumparan_lemmatizer is not None:
        stemmed = _kumparan_lemmatizer.lemmatize(w_low)
        if not stemmed or stemmed == w_low:
            s_res = _sastrawi_stemmer.stem(w_low)
            if s_res and s_res != stemmed:
                fallback_used = True
                stemmed = s_res
    else:
        stemmed = _sastrawi_stemmer.stem(w_low)

    if fallback_used:
        try:
            from app.core.logging_config import append_structured_jsonl_log
            append_structured_jsonl_log("nlp_oov_and_disambiguation.jsonl", {
                "type": "oov_fallback_sastrawi",
                "word": w_low,
                "stemmed": stemmed,
            })
        except Exception:
            pass

    if stemmed in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[stemmed]

    # Normalisasi morfologi serapan Indo-Eropa universal (-isme/-ism -> -is, -ist -> -is, -ization -> -isasi)
    if len(stemmed) > 7 and (stemmed.endswith("isme") or stemmed.endswith("ism")):
        stemmed = re.sub(r"(?:isme|ism)$", "is", stemmed)
    elif len(stemmed) > 6 and stemmed.endswith("ist"):
        stemmed = stemmed[:-1]
    elif len(stemmed) > 7 and stemmed.endswith("ization"):
        stemmed = stemmed[:-7] + "isasi"

    return stemmed


def _sync_clean_and_tokenize(text: str) -> List[str]:
    """Tokenisasi dan pembersihan regex sederhana setelah pembersihan web noise dan pemrosesan media."""
    text_without_chrome = strip_web_chrome_noise(text)
    text_without_media = strip_media_placeholders(text_without_chrome, keep_captions=True)
    text_folded = normalize_text_ascii(text_without_media)
    text_clean = re.sub(r"[^\w\s]", " ", text_folded.lower())
    tokens = [t.strip() for t in text_clean.split() if t.strip()]
    return tokens


def _sync_preprocess_corpus(text: str) -> str:
    """
    Operasi CPU berat #2: Pipa normalisasi dan stemming teks korpus penuh.
    Mengikat kata negasi (tidak/bukan/jangan/tanpa/belum) dengan kata di depannya (Negation Bigram Binding)
    agar kalimat kontradiktif tidak dianggap identik oleh BM25/VSM.
    """
    tokens = _sync_clean_and_tokenize(text)
    filtered_stems: List[str] = []
    pending_negation: Optional[str] = None

    for token in tokens:
        if token in NEGATION_CUES:
            pending_negation = "tidak" if token in {"tak", "enggak", "gak", "ga", "tidak"} else token
            continue
        if len(token) > 2 and token not in ALL_INDONESIAN_STOPWORDS and not token.isdigit():
            stemmed = stem_word(token)
            if stemmed and stemmed not in ALL_INDONESIAN_STOPWORDS:
                if pending_negation:
                    filtered_stems.append(f"{pending_negation}_{stemmed}")
                    pending_negation = None
                else:
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
        if (
            len(tok) > 2
            and tok not in ALL_INDONESIAN_STOPWORDS
            and not tok.isdigit()
            and not is_narrative_noise(tok)
        ):
            stem = stem_word(tok)
            if (
                stem
                and len(stem) > 2
                and stem not in ALL_INDONESIAN_STOPWORDS
                and not is_narrative_noise(stem)
            ):
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
            and not is_narrative_noise(t1)
            and not is_narrative_noise(t2)
        ):
            stem1 = stem_word(t1)
            stem2 = stem_word(t2)
            if (
                stem1
                and len(stem1) > 2
                and stem1 not in ALL_INDONESIAN_STOPWORDS
                and not is_narrative_noise(stem1)
                and stem2
                and len(stem2) > 2
                and stem2 not in ALL_INDONESIAN_STOPWORDS
                and not is_narrative_noise(stem2)
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


def extract_candidate_gain_entities(text: str) -> List[Tuple[str, str, int]]:
    """
    Ekstraksi Long-Tail Gain Entities & Proper Noun Phrases (Sprint 4.2):
    Mengekstrak frasa berhuruf kapital (Title Case Bigram / Trigram non-awal kalimat)
    serta entitas nama tokoh / konsep teknis spesifik (contoh: Alison Smithson,
    Reyner Banham, Trellick Tower, Kenyamanan Termal, Unite d Habitation)
    agar tidak terpotong oleh batas Top-TF draf.
    """
    if not text:
        return []

    text_without_chrome = strip_web_chrome_noise(text)
    text_without_media = strip_media_placeholders(text_without_chrome, keep_captions=True)
    text_folded = normalize_text_ascii(text_without_media)

    lines = [l.strip() for l in text_folded.split("\n") if l.strip()]
    candidates_map: Dict[str, Tuple[str, int]] = {}

    for line in lines:
        cleaned_line = re.sub(r"^#{1,4}\s+", "", line).strip()
        # Pecah baris menjadi klausa-klausa berdasarkan tanda baca (Sprint 4.3 Clause-Bound Gain)
        # Ekstraksi n-gram dilarang melompati tanda koma, titik koma, titik dua, kurung, dan dash pemisah
        clauses = re.split(r"[,;:()\[\]{}—–]|\s+-\s+", cleaned_line)

        for clause in clauses:
            clause_clean = clause.strip()
            if not clause_clean:
                continue
            sentences = re.split(r"(?<=[.!?])\s+", clause_clean)

            for sent in sentences:
                words = [w.strip(".,;:!?\"'()[]{}") for w in sent.split() if w.strip(".,;:!?\"'()[]{}")]
                n_words = len(words)
                if n_words < 2:
                    continue

                # 1. Ekstraksi Bigram Title Case
                for i in range(n_words - 1):
                    w1, w2 = words[i], words[i + 1]
                    if not (w1 and w2 and len(w1) > 2 and len(w2) > 2):
                        continue
                    if not (w1[0].isupper() and w2[0].isupper()):
                        continue

                    low1, low2 = w1.lower(), w2.lower()
                    if low1 in FORBIDDEN_GAIN_CONNECTOR_WORDS or low2 in FORBIDDEN_GAIN_CONNECTOR_WORDS:
                        continue
                    if low1 in ALL_INDONESIAN_STOPWORDS and low1 not in ("le", "van", "de"):
                        continue
                    if low2 in ALL_INDONESIAN_STOPWORDS:
                        continue

                    st1 = stem_word(low1)
                    st2 = stem_word(low2)
                    if not st1 or not st2 or st1 == st2:
                        continue

                    bigram_stem = f"{st1} {st2}"
                    bigram_surface = f"{w1} {w2}"

                    if bigram_stem not in candidates_map:
                        candidates_map[bigram_stem] = (bigram_surface, 0)
                    surf, cnt = candidates_map[bigram_stem]
                    candidates_map[bigram_stem] = (surf, cnt + 1)

                # 2. Ekstraksi Trigram Proper Noun (misal: Robin Hood Gardens, Unite d Habitation)
                for i in range(n_words - 2):
                    w1, w2, w3 = words[i], words[i + 1], words[i + 2]
                    if not (w1 and w3 and len(w1) > 2 and len(w3) > 2):
                        continue
                    if not (w1[0].isupper() and w3[0].isupper()):
                        continue
                    low1, low2, low3 = w1.lower(), w2.lower(), w3.lower()
                    if (
                        low1 in FORBIDDEN_GAIN_CONNECTOR_WORDS
                        or low2 in FORBIDDEN_GAIN_CONNECTOR_WORDS
                        or low3 in FORBIDDEN_GAIN_CONNECTOR_WORDS
                    ):
                        continue
                    if low1 in ALL_INDONESIAN_STOPWORDS and low1 not in ("le", "van", "de"):
                        continue
                    if low3 in ALL_INDONESIAN_STOPWORDS:
                        continue
                    st1 = stem_word(low1)
                    st2 = stem_word(low2)
                    st3 = stem_word(low3)
                    if not st1 or not st3:
                        continue

                    trigram_stem = f"{st1} {st2} {st3}"
                    trigram_surface = f"{w1} {w2} {w3}"
                    if trigram_stem not in candidates_map:
                        candidates_map[trigram_stem] = (trigram_surface, 0)
                    surf, cnt = candidates_map[trigram_stem]
                    candidates_map[trigram_stem] = (surf, cnt + 1)

                # 3. Unigram Proper Noun non-awal kalimat (i >= 1) yang spesifik (panjang >= 5 dan berawalan kapital)
                for i in range(1, n_words):
                    w = words[i]
                    if len(w) >= 5 and w[0].isupper() and w[1:].islower():
                        low_w = w.lower()
                        if (
                            low_w in ALL_INDONESIAN_STOPWORDS
                            or low_w in FORBIDDEN_GAIN_CONNECTOR_WORDS
                            or low_w in NON_TOPICAL_VERBS_AND_ADJECTIVES
                            or is_narrative_noise(low_w)
                        ):
                            continue
                        st = stem_word(low_w)
                        if (
                            st
                            and len(st) >= 4
                            and st not in ALL_INDONESIAN_STOPWORDS
                            and st not in FORBIDDEN_GAIN_CONNECTOR_WORDS
                            and st not in NON_TOPICAL_VERBS_AND_ADJECTIVES
                            and not is_narrative_noise(st)
                        ):
                            if st not in candidates_map:
                                candidates_map[st] = (w, 0)
                            surf, cnt = candidates_map[st]
                            candidates_map[st] = (surf, cnt + 1)

    return [(stem, surf, count) for stem, (surf, count) in candidates_map.items()]
