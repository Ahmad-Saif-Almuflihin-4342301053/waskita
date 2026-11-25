# 🛠️ Instruksi Eksekusi Worker (Mode B): Pembersihan Dead Code (Prinsip Ponytail), Perbaikan 10 Celah Logika Algoritma, & Implementasi 3 Log JSONL Produksi WASKITA

> **Target Pelaksana:** Model Worker Hemat Kuota (Mode B — Flash / Flash Lite / Coder Agent)  
> **Arsitek Perancang:** Ahmad Saif Almuflihin (NIM: 4342301053) & Lead AI System Architect  
> **Tanggal Spesifikasi:** Jumat, 20 November 2026  
> **Repositori Target:** `/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset`  
> **Dokumen Analisis Acuan:** [[Audit_DeadCode_Celah_Algoritma_dan_Arsitektur_Logging_WASKITA]], [[Daftar_60_Teks_Uji_Manual_Out_of_The_Box_WASKITA]]

---

## 📌 ATURAN MUTLAK UNTUK MODEL WORKER (WAJIB DIPATUHI!)
1. **ZERO IMPROVISATION:** Ikuti spesifikasi perubahan kode di bawah ini secara presisi karakter demi karakter. Jangan mengubah tanda tangan fungsi (*function signatures*) publik agar tidak merusak kontrak API atau memicu efek berantai (*Domino Effect*).
2. **PRINSIP PONYTAIL & ANTI-HARDCODE:**
   - Hapus *dead code* dan lipat duplikasi kode menjadi pemanggilan fungsi tunggal (*Single Source of Truth*).
   - Jangan pernah menggunakan daftar kata topik kaku untuk menghukum draf; gunakan metrik kepadatan struktural (*Structural Layout Density*) dan perbandingan konsensus SERP (`consensus_serp_stems`).
3. **VERIFIKASI WAJIB 100% LULUS:** Setelah seluruh perubahan diterapkan, jalankan *test suite* Backend (`pytest`) dan Frontend (`npm test`) sesuai perintah di bagian akhir dokumen ini.

---

## 🎯 RINGKASAN 12 PAKET TUGAS EKSEKUSI

| Kode Tugas | Berkas Target | Masalah yang Diselesaikan |
| :--- | :--- | :--- |
| **T-01** | `backend/app/services/nlp_pipeline.py` | **(1) Dead Code:** Hapus `DISPLAY_CONTEXT_KEYWORDS` yang tidak terpakai.<br>**(2) Celah #4 (Negation Blindness):** Keluarkan kata negasi (`tidak`, `bukan`, `jangan`, `tanpa`, `belum`, `dilarang`) dari `_sastrawi_stopwords` dan ikat menjadi bigram negasi (`tidak_boleh`, `jangan_oles`) di `_sync_preprocess_corpus()`.<br>**(3) Celah #9 (Blog Comments Pollution):** Tambahkan `truncate_blog_comments_section(text)` untuk memangkas seksi komentar pembaca WordPress/Disqus/Blogger sebelum ekstraksi NLP.<br>**(4) Generalisasi Morfologi Serapan:** Tambahkan normalisasi akhiran `-isasi`/`-ization`, `-ism`/`-isme`/`-is` secara universal di `stem_word()`. |
| **T-02** | `backend/app/services/information_gain.py` | **Duplikasi 95% (Ponytail):** Lipat fungsi `_find_competitor_snippet()` (42 baris) menjadi pemanggilan 6 baris ke `find_snippet_and_domain()`. |
| **T-03** | `backend/app/services/gatekeeper.py` | **(1) Celah #10 (Anti-Hardcode Structural Web Chrome Detector):** Perkuat `detect_web_chrome_noise()` dengan metrik kepadatan struktural (*Short Line Ratio > 0.45* & *Markdown Link/Price Line Ratio > 0.35*) agar dump direktori/marketplace tertangkap tanpa bergantung pada nama domain hardcode.<br>**(2) Celah #7 (Format WA Internasional):** Perluas regex `TRANSACTIONAL_SOLICITATION_PATTERNS` agar menangkap `wa.me/628...` dan `api.whatsapp.com/send?phone=628...`.<br>**(3) Celah #3 (Dynamic Word Budget):** Perbaiki rumus *word budget* di `generate_overview_and_remediation()` untuk naskah pendek bermedia (`< 300` kata) dan artikel pilar (`> 1500` kata).<br>**(4) Celah #1 (Prompt Frankenstein Jilid 2):** Tambahkan cabang `bullets` dan instruksi remediasi spesifik untuk 3 vonis veto (`Residu Elemen Website`, `Promosi Komersial Terselubung`, `Teks Percakapan AI`). |
| **T-04** | `backend/app/api/v1/endpoints/audit_endpoints.py` | **(1) Celah #2 (Veto Tertimpa Mode Demo):** Gunakan `.startswith("Perlu Revisi - ")` agar semua vonis veto tetap tampil meskipun `serp_source == "offline_synthetic"`.<br>**(2) Celah #5 & Duplikasi Rumus CDS:** Simpan `c_vsm`, `c_ig`, `c_mattr`, `c_hko` skala 0–100 secara konsisten di `build_audit_execute_response()` dan hitung `consensus_target_count` serta `consensus_total_count` secara dinamis dari `serp_items` dan `deficit_items` (bukan hardcode `20` dan `25`). |
| **T-05** | `backend/app/core/logging_config.py`, `serp_scraper.py`, `audit_endpoints.py`, `nlp_pipeline.py` | **Arsitektur 3 Log JSONL Produksi Baru:** Tambahkan helper pencatat JSONL terstruktur untuk:<br>1. `backend/logs/serp_waterfall_telemetry.jsonl`<br>2. `backend/logs/audit_decision_forensics.jsonl`<br>3. `backend/logs/nlp_oov_and_disambiguation.jsonl` |
| **T-06** | `frontend/src/utils/draftSanitizer.ts` & `frontend/src/components/*` | **(1) Celah #8 (Polusi URL & Markdown Link):** Bersihkan baris URL pembuka dan sintaks Markdown link `[anchor](url)` di `extractSmartKeyword()`, serta tambahkan pemotong komentar blog.<br>**(2) Dead Code UI:** Hapus `IconPrinter` yang tidak terpakai di `shared-ui.tsx`.<br>**(3) Celah #6 (Gembok 300 Kata Frontend):** Buka slider `min_draft_words` hingga `min="30"` di `AuditOptionsOverlay.tsx` dan tambahkan preset `30 (Multimedia / Pendek)` serta sinkronkan `schemas/audit.py` (`ge=30`). |

---

## 🔧 DETAIL IMPLEMENTASI KODE LANGKAH DEMI LANGKAH

### 📦 TUGAS 1 (`T-01`): `backend/app/services/nlp_pipeline.py`

#### 1A. Tambahkan Pemotong Komentar Blog (`truncate_blog_comments_section`) di sekitar baris 54:
Di bawah fungsi `is_web_chrome_noise_line(line: str) -> bool:`, tambahkan regex dan fungsi pemotong seksi komentar blog:

```python
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
```

Lalu di dalam `strip_web_chrome_noise(text: str) -> str:`, panggil `truncate_blog_comments_section(text)` terlebih dahulu:
```python
def strip_web_chrome_noise(text: str) -> str:
    """Membersihkan seksi komentar blog dan residu baris web chrome dari naskah sebelum diekstraksi."""
    if not text:
        return ""
    truncated = truncate_blog_comments_section(text)
    clean_lines = [line for line in truncated.split("\n") if not is_web_chrome_noise_line(line)]
    return "\n".join(clean_lines)
```

#### 1B. Lindungi Kata Negasi dari Penghapusan Stopword (`Celah #4 Fix`) di sekitar baris 94 & 319:
Ubah definisi `ALL_INDONESIAN_STOPWORDS` agar **tidak** menghapus kata negasi (`tidak`, `tak`, `bukan`, `jangan`, `tanpa`, `belum`, `dilarang`, `anti`, `non`):

```python
NEGATION_CUES: Set[str] = {
    "tidak", "tak", "bukan", "jangan", "tanpa", "belum", "dilarang", "anti", "non", "enggak", "gak", "ga"
}

ALL_INDONESIAN_STOPWORDS: Set[str] = (
    _sastrawi_stopwords.union(WEB_NOISE_STOPWORDS).union(COLLOQUIAL_INDONESIAN_STOPWORDS) - NEGATION_CUES
)
```

#### 1C. Hapus Dead Code `DISPLAY_CONTEXT_KEYWORDS` & Perkuat `stem_word()` (baris 401–443):
1. **Hapus** variabel `DISPLAY_CONTEXT_KEYWORDS` di baris 402–404.
2. Di dalam `stem_word(word: str) -> str`, tambahkan normalisasi morfologi serapan universal sebelum `return stemmed`:
```python
    # Normalisasi morfologi serapan Indo-Eropa universal (-isme/-ism -> -is, -ist -> -is, -ization -> -isasi)
    if len(stemmed) > 7 and (stemmed.endswith("isme") or stemmed.endswith("ism")):
        stemmed = re.sub(r"(?:isme|ism)$", "is", stemmed)
    elif len(stemmed) > 6 and stemmed.endswith("ist"):
        stemmed = stemmed[:-1]
    elif len(stemmed) > 7 and stemmed.endswith("ization"):
        stemmed = stemmed[:-7] + "isasi"
```

#### 1D. Ikat Bigram Negasi di `_sync_preprocess_corpus(text: str) -> str` (baris 455–468):
Agar kalimat *"boleh dialiri air"* vs *"tidak boleh dialiri air"* memiliki representasi vektor yang berbeda secara kontras:
```python
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
```

---

### 📦 TUGAS 2 (`T-02`): Lipat Duplikasi Kode di `backend/app/services/information_gain.py`

Buka `backend/app/services/information_gain.py` baris 56–98. Ganti seluruh isi fungsi `_find_competitor_snippet` (42 baris) menjadi pemanggilan langsung ke `find_snippet_and_domain`:

```python
def _find_competitor_snippet(
    term_stem: str, term_surface: str, competitor_docs: Optional[List[Any]]
) -> Optional[str]:
    """
    Ekstrak 1 kalimat cuplikan nyata dari artikel kompetitor yang memuat kata defisit (Sprint 4.4).
    Menggunakan find_snippet_and_domain (DRY / Prinsip Ponytail).
    """
    s_clean, domain = find_snippet_and_domain(term_stem, term_surface, competitor_docs)
    if not s_clean:
        return None
    return f'"{s_clean}" ({domain})' if domain else f'"{s_clean}"'
```

---

### 📦 TUGAS 3 (`T-03`): Perbaikan 4 Celah di `backend/app/services/gatekeeper.py`

#### 3A. Celah #10 Fix — Perkuat `detect_web_chrome_noise(text: str)` dengan Heuristik Kepadatan Struktural (baris 105–114):
Agar dump direktori/marketplace/komentar mentah tertangkap secara matematis meskipun tidak ada nama portal berita hardcode:

```python
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
```

#### 3B. Celah #7 Fix — Perluas Regex Nomor WA `wa.me/628...` di `TRANSACTIONAL_SOLICITATION_PATTERNS` (baris 116–122):
Ganti elemen pertama `TRANSACTIONAL_SOLICITATION_PATTERNS` menjadi:
```python
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
```

#### 3C. Celah #3 Fix — Perbaiki Rumus *Word Budget* Dinamis di `generate_overview_and_remediation()` (baris 659–668):
Jangan memaksa artikel pendek bermedia (`< 300` kata) menjadi `900–1200` kata, dan jangan memotong artikel panjang (`> 1400` kata) dengan plafon statis `min(1400, ...)`:
```python
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
```

#### 3D. Celah #1 Fix — Tambahkan Penjelasan & Instruksi Spesifik untuk 3 Vonis Veto Baru di `generate_overview_and_remediation()` (baris 759–766):
Tepat di bawah `if verdict_status == "Perlu Revisi - Redundansi Kalimat Tinggi":`, tambahkan cabang untuk ke-3 vonis veto baru:
```python
        if verdict_status == "Perlu Revisi - Residu Elemen Website Terdeteksi":
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
```

---

### 📦 TUGAS 4 (`T-04`): Perbaikan Celah #2 dan #5 di `backend/app/api/v1/endpoints/audit_endpoints.py`

#### 4A. Celah #2 Fix — Jangan Timpa Vonis Veto Menjadi `"Mode Demo"` (baris 623–631):
Ganti blok `if/elif` penentu `final_verdict_status` di baris 623–631 menjadi:
```python
    serp_source = determine_serp_source(competitor_docs)
    if cds_decision["verdict_status"].startswith("Perlu Revisi - "):
        final_verdict_status = cds_decision["verdict_status"]
    elif serp_source == "offline_synthetic":
        final_verdict_status = "Mode Demo"
    else:
        final_verdict_status = cds_decision["verdict_status"]
```

#### 4B. Celah #5 Fix — Konsistensi Skala Sub-Skor & Hitungan Konsensus Dinamis Saat Reload Riwayat (`build_audit_execute_response`, baris 175–203):
Di `build_audit_execute_response()`:
1. Pastikan `c_vsm`, `c_ig`, `c_mattr`, `c_hko` berisi nilai skala `0–100` (sama persis dengan output `calculate_composite_cds()` di `gatekeeper.py`), sedangkan `vsm`, `ig`, `mattr`, `hko` berisi poin terbobot:
```python
        c_ig_100 = max(0.0, min(100.0, round((ig_pts / 0.30), 1))) if ig_pts > 0 else 0.0
        sub_scores = {
            "vsm": vsm_pts,
            "ig": ig_pts,
            "mattr": mattr_pts,
            "hko": hko_pts,
            "c_vsm": round(c_vsm_100, 1),
            "c_ig": c_ig_100,
            "c_mattr": round(c_mattr_100, 1),
            "c_hko": round(c_hko_100, 1),
        }
```
2. Hitung `consensus_target_count` dan `consensus_total_count` secara dinamis (tidak hardcode `20` dan `25`):
```python
    total_entity_pool = len(deficit_items) + len(gain_items)
    dynamic_target = max(1, min(20, total_entity_pool)) if total_entity_pool > 0 else 10
    dynamic_total = max(dynamic_target, total_entity_pool)
    priority_deficits_count = sum(1 for d in deficit_items if d.is_consensus_priority)
    consensus_matched = max(0, dynamic_target - priority_deficits_count)
```
Lalu masukkan `consensus_target_count=dynamic_target` dan `consensus_total_count=dynamic_total` ke `MetricResultSchema`.

---

### 📦 TUGAS 5 (`T-05`): Implementasi 3 Log JSONL Produksi di `backend/app/core/logging_config.py`

Buka `backend/app/core/logging_config.py` dan tambahkan fungsi helper pencatat JSONL terstruktur (`append_structured_jsonl_log`) yang thread-safe di bagian bawah file:

```python
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

LOGS_DIR = Path("backend/logs") if Path("backend").exists() else Path("logs")


def append_structured_jsonl_log(filename: str, payload: Dict[str, Any]) -> None:
    """
    Mencatat telemetri produksi & forensik Bab 4 DSRM ke berkas JSONL terstruktur:
    - serp_waterfall_telemetry.jsonl
    - audit_decision_forensics.jsonl
    - nlp_oov_and_disambiguation.jsonl
    """
    try:
        LOGS_DIR.mkdir(parents=True, exist_ok=True)
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **payload,
        }
        target_path = LOGS_DIR / filename
        with target_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as exc:
        logger.debug(f"Gagal menulis structured JSONL log {filename}: {exc}")
```

1. **Panggil `serp_waterfall_telemetry.jsonl` di `backend/app/services/serp_scraper.py`:**
   Di akhir `search_and_scrape_competitors()`, catat `query`, `tier_used`, `candidates_found`, `valid_docs_returned`, dan `elapsed_ms`.
2. **Panggil `audit_decision_forensics.jsonl` di `backend/app/api/v1/endpoints/audit_endpoints.py`:**
   Di akhir `execute_audit_pipeline()`, catat `session_id`, `target_query`, `word_count`, `verdict_status`, `cds_score`, `sub_scores`, bendera veto (`is_out_of_domain`, `has_web_chrome_noise`, `is_commercial_drift`, `has_ai_prompt_leak`), dan `elapsed_ms`.
3. **Panggil `nlp_oov_and_disambiguation.jsonl` di `backend/app/services/nlp_pipeline.py`:**
   Ketika `stem_word()` mendeteksi kata `HOMOGRAPH_PROTECTED_LEMMAS` atau ketika Kumparan `nlp-id` melakukan fallback ke `PySastrawi` (dan menghasilkan stem berbeda), catat sampelnya secara ringan.

---

### 📦 TUGAS 6 (`T-06`): Perbaikan Frontend (`draftSanitizer.ts`, `shared-ui.tsx`, `AuditOptionsOverlay.tsx`, `schemas/audit.py`)

1. **Celah #8 Fix di `frontend/src/utils/draftSanitizer.ts`:**
   - Di dalam `extractSmartKeyword(text: string)`:
     - Bersihkan sintaks Markdown link `[anchor](https://...)` menjadi `$1` dan hapus baris yang murni berisi URL (`/^https?:\/\/\S+$/i`).
     - Pangkas seksi komentar blog jika bertemu baris `/^\s*\d+\s+thoughts?\s+on\b/i` atau `/^\s*(?:leave a reply|tinggalkan balasan)\s*$/i`.
2. **Hapus Dead Code `IconPrinter` di `frontend/src/components/shared-ui.tsx`:**
   - Hapus deklarasi `export const IconPrinter` yang tidak pernah dipanggil di mana pun.
3. **Celah #6 Fix — Buka Gembok Minimal 30 Kata di `backend/app/schemas/audit.py` & `frontend/src/components/AuditOptionsOverlay.tsx`:**
   - Di `backend/app/schemas/audit.py` baris 31, 42, 43: ubah `ge=100` menjadi `ge=30` pada `min_draft_words` dan `word_budget_min`.
   - Di `frontend/src/components/AuditOptionsOverlay.tsx` baris 762: ubah `min="100"` pada slider `min_draft_words` menjadi `min="30"`, dan tambahkan tombol preset cepat `{ label: '30 (Multimedia)', val: 30 }` di baris 774.

---

## ✅ PERINTAH VERIFIKASI WAJIB (JALANKAN OLEH WORKER)

Setelah menyelesaikan ke-6 paket tugas di atas, jalankan perintah berikut dan pastikan seluruhnya hijau (**0 Failed**):

```bash
# 1. Jalankan seluruh unit & integration test Backend
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset/backend"
pytest -q

# 2. Jalankan seluruh unit test Frontend & TypeScript check
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset/frontend"
npm test
```
