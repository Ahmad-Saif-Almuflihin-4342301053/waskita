import asyncio
import functools
import re
import unicodedata
from typing import Any, Dict, List, Optional, Set, Tuple
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


def normalize_text_ascii(text: str) -> str:
    """Normalisasi karakter beraksen (é -> e, ü -> u, d' -> d ) dengan NFKD (Sprint 4.2)."""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    folded = "".join(c for c in nfkd if not unicodedata.combining(c))
    folded = folded.replace("'", " ").replace("’", " ").replace("`", " ")
    return folded

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
    # Sprint 4.1: Derau Media, Agensi Foto, & Elemen CMS
    "bbc",
    "cnn",
    "cnbc",
    "kompasiana",
    "idntimes",
    "liputan6",
    "kompasiana",
    "tirto",
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

ALL_INDONESIAN_STOPWORDS: Set[str] = _sastrawi_stopwords.union(WEB_NOISE_STOPWORDS).union(COLLOQUIAL_INDONESIAN_STOPWORDS)

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

# Pola akhiran klitik naratif dan kata sambung ekspositori (Sprint 4.4)
NARRATIVE_CLITIC_SUFFIXES = ("nya", "kah", "lah", "pun")
NARRATIVE_PASSIVE_VERB_PREFIXES = ("di", "ter")


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

# Konteks monitor/display yang jika muncul di dekat 'berlayar', kata tersebut memang merujuk pada layar display
DISPLAY_CONTEXT_KEYWORDS: Set[str] = {
    "oled", "amoled", "ips", "lcd", "monitor", "resolusi", "hz", "inci", "display", "refresh", "piksel"
}


@functools.lru_cache(maxsize=100_000)
def stem_word(word: str) -> str:
    """
    Stemming kata tunggal Bahasa Indonesia dengan LRU Cache + normalisasi serapan teknis (Sprint 4.1)
    serta perlindungan homograf (DOM-01 Hybrid Disambiguation).
    Menyatukan variasi sufiks '-isme' / '-ist' / '-is' dan padanan istilah serapan.
    """
    if not word or len(word) <= 2:
        return word
    w_low = word.lower().strip()
    if w_low in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[w_low]

    # Perlindungan homograf independen (DOM-01)
    if w_low in HOMOGRAPH_PROTECTED_LEMMAS:
        return HOMOGRAPH_PROTECTED_LEMMAS[w_low]

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
    """Tokenisasi dan pembersihan regex sederhana setelah normalisasi aksen ASCII dan penghapusan media (Sprint 4.2)."""
    text_without_media = strip_media_placeholders(text)
    text_folded = normalize_text_ascii(text_without_media)
    text_clean = re.sub(r"[^\w\s]", " ", text_folded.lower())
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

    text_without_media = strip_media_placeholders(text)
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
