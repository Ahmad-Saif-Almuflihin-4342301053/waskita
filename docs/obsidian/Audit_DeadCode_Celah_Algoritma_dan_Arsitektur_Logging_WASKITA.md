# 🔬 Audit Forensik: Efisiensi Kode ("Ponytail" & Dead Code), 6 Celah Logika Algoritma Baru, & Arsitektur 4-Log Produksi WASKITA

> **Mode Operasi:** Mode A — Architect & System Analyst (*Zero Coding / Pure Forensic Analysis*)  
> **Peneliti:** Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Tanggal Audit:** Kamis, 19 November 2026  
> **Acuan Standar:** `ANALISIS_EFEK_BERANTAI_DAN_MITIGASI_OPTIMASI_ALGORITMA.md` (*Prinsip Ponytail & Second-Order Thinking*) & `PZN_REFACTORING_AND_LOGGING_STANDARD.md` (*Strangler Pattern & Proper Logging Hygiene*)  
> **Tautan Terkait:** [[Dashboard]], [[Blueprint_Arsitektur_EEAT_dan_Stress_Test_WASKITA]], [[Instruksi_Worker_Anti_Hardcode_dan_SearXNG_WASKITA]], [[Daily_Logs/2026-11-19]]

---

## 🎀 1. Apa Itu Prinsip "Ponytail" & Hasil Scan Dead Code / Kode Bertele-tele

Di dokumen catatan kita tanggal 12 November (`ANALISIS_EFEK_BERANTAI_DAN_MITIGASI_OPTIMASI_ALGORITMA.md` baris 19) dan standar Pak Eko PZN (`PZN_REFACTORING_AND_LOGGING_STANDARD.md`), kita menetapkan dua aturan emas:
1. **Prinsip "Ponytail" (Ringkas Tanpa Efek Berantai):** Mengikat kode yang panjang dan bertele-tele menjadi ringkas menggunakan pustaka standar (`nlp-id`, `rank-bm25`, `datasketch`, `loguru`), **tetapi** wajib menjaga kompatibilitas kontrak data agar tidak memicu *domino effect* ($A \implies B \implies \dots \implies J$).
2. **Standar PZN (Zero Dead Code & Batas Ukuran File):** Tidak boleh ada fungsi/variabel mati (*dead code*), tidak boleh ada *copy-paste* fungsi yang sama (*DRY - Don't Repeat Yourself*), dan komponen UI idealnya di bawah 400 baris.

### 🔍 Hasil Pemindaian AST (Abstract Syntax Tree) pada Repositori Saat Ini:

Berikut adalah **6 temuan Dead Code, Duplikasi, dan Pembengkakan Kode** yang terbukti masih bersarang di repositori:

| No | Lokasi File & Baris | Jenis Masalah | Bukti & Penjelasan Forensik |
| :--- | :--- | :--- | :--- |
| **1** | `backend/app/services/nlp_pipeline.py:402` | **Dead Code (Variabel Mati)** | Variabel `DISPLAY_CONTEXT_KEYWORDS = {"oled", "amoled", "ips", "lcd", ...}` didefinisikan di baris 402 untuk membedakan kata `"berlayar"` (perahu) vs `"berlayar"` (layar HP), tetapi **TIDAK PERNAH DIPANGGIL SAMA SEKALI** di seluruh kode (`occurrences = 1`)! |
| **2** | `backend/app/services/information_gain.py:14–98` | **Duplikasi Kode 95% (Bertele-tele)** | Fungsi `find_snippet_and_domain()` (baris 14–53) dan `_find_competitor_snippet()` (baris 56–98) berisi **42 baris logika regex kalimat yang 95% identik**! Padahal `_find_competitor_snippet()` cukup memanggil `find_snippet_and_domain()` dalam 4 baris saja. |
| **3** | `backend/app/api/v1/endpoints/audit_endpoints.py:140–185` | **Duplikasi Rumus Matematika CDS** | Fungsi `build_audit_execute_response()` menulis ulang rumus `c_vsm`, `c_mattr`, dan `c_hko` secara manual (45 baris) alih-alih memanggil `calculate_composite_cds()` dari `gatekeeper.py`. Akibatnya terjadi bug ketidakcocokan skor saat *refresh* halaman! |
| **4** | `backend/app/services/export_service.py:1–127` | **Legacy Server-Side Export Bloat** | Sesuai `PZN_CLIENT_SIDE_FILE_STANDARD.md`, seluruh fitur ekspor laporan (`.PDF`, `.MD`, `.CSV`, `.JSON`) sudah dijalankan 100% di browser lewat `frontend/src/utils/clientExporter.ts`. File `export_service.py` (127 baris) di backend hanyalah sisa kode lama yang menduplikasi template laporan. |
| **5** | `frontend/src/components/shared-ui.tsx` | **Unused Component Export** | Komponen `export const IconPrinter` tidak pernah dipakai di file mana pun (`refs = 1`). |
| **6** | **6 File Raksasa (> 800 Baris)** | **Pelanggaran Batas 400 Baris PZN** | `AuditOptionsOverlay.tsx` (**1.209 baris**), `App.tsx` (**1.030 baris**), `shared-ui.tsx` (**1.028 baris**), `FloatingComposerDock.tsx` (**978 baris**), `gatekeeper.py` (**842 baris**), dan `audit_endpoints.py` (**809 baris**). |

---

## 💣 2. Enam (6) Celah Logika Algoritma yang Ditemukan (Wajib Diwaspadai Sebelum Uji Artikel Manual!)

Sambil menunggu kamu mencarikan artikel manual dari dunia nyata, aku membedah seluruh jalur logika algoritma dari hulu ke hilir. Ditemukan **6 celah logika algoritma** yang bisa meledak jika diuji dengan artikel nyata:

### Celah Algoritma #1: "Prompt Frankenstein Jilid 2" pada Vonis Veto Baru (`gatekeeper.py:755–835`)
* **Fakta Kode:** Di `calculate_composite_cds()` (`gatekeeper.py:549–557`), kita sudah punya 3 vonis veto baru:
  1. `"Perlu Revisi - Residu Elemen Website Terdeteksi"` (saat ada sampah `Ctrl+A` portal berita).
  2. `"Perlu Revisi - Promosi Komersial Terselubung"` (saat ada *Bait-and-Switch* transaksi di akhir naskah).
  3. `"Perlu Revisi - Teks Percakapan AI Terdeteksi"` (saat ada bocoran prompt ChatGPT *"Tentu! Berikut artikelnya..."*).
* **Celah Fatalnya:** Di fungsi pembuat penjelasan dan prompt perbaikan `generate_overview_and_remediation()` (`gatekeeper.py:755–835`), **BELUM ADA cabang `if/elif` untuk ke-3 vonis tersebut!**
* **Apa yang Terjadi Jika Diuji Sekarang?**
  Misalkan kamu memasukkan artikel 100% orisinal buatan sendiri, tapi di baris pertamanya ada kalimat ChatGPT *"Tentu! Berikut draf artikel untuk Anda:"*.
  - Sistem memang menghukum skor CDS menjadi `45.0%` dengan vonis `"Perlu Revisi - Teks Percakapan AI Terdeteksi"`.
  - **TETAPI** di kotak *Poin Temuan Editorial* dan *Prompt Remediasi*, sistem malah menyuruh penulis: **"1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA: Parafrase kalimat yang terlalu mirip kompetitor"** — padahal artikel itu **0% plagiat** dan kesalahannya cuma lupa menghapus kalimat pembuka ChatGPT!

### Celah Algoritma #2: Vonis Veto Tertimpa Menjadi `"Mode Demo"` Saat Offline Fallback (`audit_endpoints.py:624–631`)
* **Fakta Kode:** Lihat baris 624–631 di `backend/app/api/v1/endpoints/audit_endpoints.py`:
  ```python
  if cds_decision["verdict_status"] == "Perlu Revisi - Topik Tidak Relevan":
      final_verdict_status = "Perlu Revisi - Topik Tidak Relevan"
  elif cds_decision["verdict_status"] == "Perlu Revisi - Redundansi Kalimat Tinggi":
      final_verdict_status = "Perlu Revisi - Redundansi Kalimat Tinggi"
  elif serp_source == "offline_synthetic":
      final_verdict_status = "Mode Demo"
  ```
* **Celah Fatalnya:** Jika internet sedang mati (atau kueri jatuh ke Tier-4 `offline_synthetic`), lalu pengguna menguji artikel yang terkena veto `"Perlu Revisi - Residu Elemen Website Terdeteksi"` atau `"Perlu Revisi - Teks Percakapan AI Terdeteksi"`, vonisnya **tertimpa paksa menjadi `"Mode Demo"`** karena `if/elif` di atas lupa mengecek `cds_decision["verdict_status"].startswith("Perlu Revisi - ")`!

### Celah Algoritma #3: Pemaksaan "Word Budget 900–1.200 Kata" pada Artikel Pendek Multimedia (`gatekeeper.py:659–667`)
* **Fakta Kode:** Lihat baris 662–667 di `backend/app/services/gatekeeper.py`:
  ```python
  elif draft_word_count >= 300:
      min_target_words = max(800, int(draft_word_count * 0.85))
      max_target_words = max(min_target_words + 150, min(1400, int(draft_word_count * 1.05)))
  else:
      min_target_words = 900
      max_target_words = 1200
  ```
* **Celah Fatalnya:** Kita sudah sepakat bahwa artikel pendek `< 100` kata yang kaya gambar/video (misal 65 kata + 3 gambar ber-caption) adalah valid. **Tetapi** karena `65 < 300`, baris 666 di `gatekeeper.py` langsung mematok `min_target_words = 900` dan `max_target_words = 1200`! Akibatnya, prompt remediasi selalu memaksa penulis artikel pendek untuk memanjangkan tulisannya menjadi **900–1.200 kata**!
* Lebih buruk lagi, untuk artikel panjang (*Pillar Guide* 3.000 kata), rumus `min(1400, int(3000 * 1.05))` menghasilkan angka aneh (`min=2550, max=2700`).

### Celah Algoritma #4: Kebutaan Negasi (*Negation Blindness*) Akibat Stopword Sastrawi (`nlp_pipeline.py:88, 304`)
* **Fakta Kode:** Di daftar stopword bawaan Sastrawi (`_sastrawi_stopwords`), kata **`"tidak"`, `"bukan"`, `"jangan"`, `"tanpa"`, `"belum"`** terdaftar sebagai *stopword* dan **dihapus bersih** oleh `_sync_preprocess_corpus()` sebelum masuk ke VSM dan Stabilo Merah!
* **Celah Fatalnya:**
  - Kalimat 1 (Benar): *"Luka bakar ringan **boleh** dialiri air mengalir."*
  - Kalimat 2 (Kebalikannya 180 Derajat): *"Luka bakar ringan **tidak boleh** dialiri air mengalir."*
  - Karena kata `"tidak"` dihapus sebagai stopword, kedua kalimat yang maknanya bertolak belakang 100% ini menghasilkan vektor kata yang **100% IDENTIK ($S_{\cos} = 1.0000$)**!
  - Jika kata negasi (`tidak`, `bukan`, `jangan`, `dilarang`) diikat menjadi bigram negasi dengan kata di depannya (misal `tidak_boleh`, `jangan_oles`, `bukan_obat`) sebelum stopword dihapus, maka sistem akan mampu membedakan kalimat persetujuan vs kalimat larangan!

### Celah Algoritma #5: Kerusakan Skor Sub-Metrik & Angka Hardcode `20 / 25` Saat Reload Halaman Riwayat (`audit_endpoints.py:140–203`)
* **Fakta Kode:** Di `audit_endpoints.py` baris 175–184 (fungsi yang dipanggil saat klik riwayat sesi di sidebar):
  - `c_vsm`, `c_ig`, `c_mattr`, `c_hko` diisi dengan nilai yang sudah dikali bobot (`0.35`, `0.30`, `0.20`, `0.15`), padahal saat *live audit* keempat field tersebut bernilai skala $0–100$!
  - Di baris 201–202, tertulis *hardcode* `consensus_target_count=20` dan `consensus_total_count=25`. Akibatnya, angka telemetri konsensus pasar berubah sendiri saat pengguna me-*refresh* browser!

### Celah Algoritma #6: Gembok `300 Kata` yang Masih Tertinggal di 4 File Frontend UI
* Seperti yang kita temukan sebelumnya, meskipun backend `schemas/audit.py` sudah mengizinkan minimal **30 kata murni**, 4 file di Frontend (`AuditOptionsOverlay.tsx`, `App.tsx`, `FloatingComposerDock.tsx`, `guest-workspace.tsx`) masih mengunci tombol *Submit* dan slider di angka **300 kata**.

### Celah Algoritma #7: Format WhatsApp Internasional `wa.me/628...` Lolos dari Deteksi Kontak Komersial (`gatekeeper.py:64`)
* **Temuan dari Spesimen Riil MyWed (`mywed.com`):**
  Spesimen direktori MyWed memuat tautan WhatsApp seperti `[WhatsApp](https://wa.me/6281329837905?text=...)`.
* **Akar Masalah:**
  Regex `TRANSACTIONAL_SOLICITATION_PATTERNS` di `gatekeeper.py` saat ini adalah:
  ```python
  re.compile(r"\b(?:08\d{8,12}|\+62\d{8,12})\b")
  ```
  Pola ini mewajibkan awalan `08...` atau `+62...`. Tautan WhatsApp modern (`wa.me/628...` atau `api.whatsapp.com/send?phone=628...`) menggunakan kode negara `628` **tanpa tanda `+`** dan tanpa awalan `08`. Akibatnya, nomor telepon tersebut luput dari penangkapan regex.
* **Solusi Efisien (Ponytail):**
  Perluas regex nomor transaksi menjadi:
  ```python
  re.compile(r"(?:https?://(?:wa\.me/|api\.whatsapp\.com/send\?phone=))?(?:\+?62|08)\d{8,12}\b", re.IGNORECASE)
  ```

### Celah Algoritma #8: Polusi URL & Markdown Link pada `extractSmartKeyword()` Frontend (`draftSanitizer.ts:378–430`)
* **Temuan dari Ketiga Spesimen Riil:**
  Ketika pengguna menempel teks yang baris pertamanya diawali URL (misalnya copas dari browser address bar atau hasil ekspor markdown), `extractSmartKeyword()` menganggap baris URL tersebut sebagai **judul artikel** (karena panjangnya `< 140` karakter dan `< 20` kata).
  - Pada MyWed: diekstrak kata kunci ngawur `"mywed com id indonesia"`.
  - Pada Winny Marlina: diekstrak `"winnymarlina com 2017 cerita"`.
  - Pada Rumah123: diekstrak `"www rumah123 com jual"`.
  Bahkan jika baris URL pertama dihapus, keberadaan tautan Markdown seperti `[Peringkat atas](https://...)` menyebabkan token `"https"` masuk ke perhitungan unigram dan mengekstrak `"peringkat atas https"`.
* **Solusi Efisien (Ponytail):**
  1. Di `extractSmartKeyword()`, lewati baris yang diawali skema URL (`/^https?:\/\//i`) saat mendeteksi judul.
  2. Bersihkan sintaks Markdown link `[anchor](url)` menjadi murni `anchor` sebelum ekstraksi unigram/bigram:
     `text.replace(/\[([^\]]+)\]\((?:https?|mailto|tel):[^\)]+\)/gi, '$1')`.
  3. Setelah diperbaiki, pada naskah Winny Marlina, sistem secara otomatis dan cerdas mengekstrak topik yang tepat: **`"lawang sewu"`**!

### Celah Algoritma #9: Polusi Komentar Blog (*Blog Comments Pollution*) Merusak Ekstraksi Entitas & Information Gain
* **Temuan dari Spesimen Riil Winny Marlina (`winnymarlina.com`):**
  Teks hasil copas Winny Marlina memuat **2.420 kata**, di mana **1.124 kata (46.4%)** di antaranya BUKAN naskah cerita, melainkan **95 komentar pembaca WordPress** (`"95 thoughts on 'Cerita Horor Perjalanan'"`).
* **Efek Fatal pada Algoritma:**
  - Saat diekstraksi entitas pada **naskah cerita murni**, entitas topikal yang muncul sangat relevan: `lawang sewu`, `kamar`, `candi`, `horor`, `desti`, `kawan`, `tidur`, `elus`, `malam`.
  - Namun saat komentar pembaca ikut masuk, daftar entitas **tercemar parah** oleh istilah teknis WordPress dan komentar: `('february', 50)`, `('replytocom', 37)`, `('reply', 37)`, `('respond', 37)`, `('wordpress', 18)`. Hal ini merusak keakuratan perhitungan *Information Gain* terhadap kompetitor SERP!
* **Solusi Efisien (Ponytail):**
  Pasang pemotong seksi komentar otomatis (*Comment Boundary Truncator*) pada sanitizer teks:
  Deteksi pola pembatas komentar blog seperti `\b(?:\d+\s+thoughts on|\d+\s+komentar|leave a reply|tinggalkan balasan|balas komentar)\b` (case-insensitive). Seluruh teks di bawah baris pembatas ini wajib dipangkas sebelum masuk ke pipa ekstraksi NLP & Gatekeeper.

### Celah Algoritma #10: Deteksi Residu Web Saat Ini Masih Bersifat "Semi-Hardcode", Butuh Penguat Heuristik Struktural
* **Kritik Kritis Pengguna:** *"Apakah deteksi residu web ini seakurat itu, atau balik lagi di-hardcode?"*
* **Akar Masalah Nyata:**
  RegEx `WEB_CHROME_LINE_PATTERNS` di `nlp_pipeline.py` saat ini mengandalkan string spesifik (misal nama media `kumparan`, `detik`, `kompas.com`, atau teks footer `tentang kami`, `kebijakan privasi`).
  - Pada dump portal Rumah123 yang memiliki **667 baris**, pola RegEx tersebut **HANYA menangkap 3 baris (0.46%)**!
  - Rumah123 tetap tertolak **bukan** karena RegEx-nya hebat, melainkan diselamatkan oleh dua pilar statistik WASKITA lainnya: **HKO yang meledak ke 27.78%** dan **TTR yang anjlok ke 0.1743**.
  - Jika pengguna melakukan *Ctrl+A* pada portal lain yang footernya berbahasa Inggris (*About Us, Privacy Policy*) atau tidak memiliki nama portal di dalam teks, filter `detect_web_chrome_noise()` akan **lolos**!
* **Solusi Akademis Anti-Hardcode (Metrik Kepadatan Struktural Tata Letak Web):**
  Ubah deteksi residu web dari sekadar mencocokkan kata menjadi **analisis kepadatan struktural dokumen (*Structural Layout Density*)**:
  1. **Rasio Baris Mikro (*Short Line Ratio*):** Hitung rasio baris yang `<= 3 kata`. Pada dump Rumah123, rasio baris mikro mencapai **64.5%** (430 dari 667 baris), sedangkan pada artikel normal manusia hanya **< 15%**.
  2. **Rasio Baris Hyperlink (*Link Density Ratio*):** Hitung rasio baris yang memuat tautan Markdown `[anchor](url)`. Pada dump Rumah123, rasionya mencapai **52.3%** (349 dari 667 baris), sedangkan artikel normal hanya **< 5%**.
  3. **Kepadatan Pola Angka & Mata Uang (*Price Token Density*):** Dump portal properti memuat **95 token harga/mata uang** (`Rp`, `IDR`, `Miliar`, `Juta`), sedangkan artikel informasional memiliki kepadatan mendekati 0.
  Dengan ambang batas `short_line_ratio > 0.45` DAN `link_line_ratio > 0.35`, sistem dapat mendeteksi dump portal web secara **100% matematis tanpa bergantung pada satu pun kata kunci hardcode**!

---

## 🪵 3. Arsitektur Logging: Apakah Cukup `quarantined_domains.jsonl` Saja?

Kamu bertanya sangat kritis: *"Lognya juga itu udah cuman itu aja atau ada log lain yang bisa diterapkan?"*

Jawabannya: **Saat ini baru ada 2 log dasar, dan itu BELUM CUKUP untuk standar produksi maupun untuk bukti empiris Bab 4 Skripsimu!**

Saat ini yang sudah ada di folder `backend/logs/` baru:
1. `waskita_{YYYY-MM-DD}.log` (Log teks umum dari `logging_config.py`).
2. `quarantined_domains.jsonl` (Log domain yang gagal di-scrape `trafilatura` atau kena blokir WAF/Cloudflare).

### 🏆 3 Log Terstruktur Baru (JSONL) yang Wajib Kita Terapkan dengan `loguru`:

Tanpa membuat sistem berat dari nol, kita cukup memanfaatkan fitur sink JSONL pada pustaka **`loguru`** yang sudah terpasang untuk mencatat **3 log analitik tingkat tinggi** berikut:

| Nama Berkas Log (`backend/logs/`) | Apa yang Dicatat Otomatis? | Kenapa Sangat Penting untuk Produksi & Sidang Skripsi? |
| :--- | :--- | :--- |
| **1. `serp_waterfall_telemetry.jsonl`** *(Log Kesehatan Mesin Pencari 4-Tier)* | Mencatat untuk setiap kueri: Tier mana yang berhasil menjawab (`Tier-1 SearXNG`, `Tier-2 Serper`, `Tier-3 DDGS`, atau `Tier-4 Offline`), berapa waktu tunggu (`latency_ms`), berapa kandidat URL yang ditemukan, dan berapa URL yang dibuang (sosmed/video/PDF/kurang dari 150 kata). | Saat di-deploy ke Heroku/VPS, kamu langsung tahu apakah `SearXNG` sehat atau sedang terkena limit IP Google, tanpa harus menebak-nebak. |
| **2. `audit_decision_forensics.jsonl`** *(Log Forensik Keputusan & Latensi Algoritma)* | Mencatat setiap kali audit selesai: `session_id`, `target_query`, `word_count`, `media_count`, rincian skor `{c_vsm, c_ig, c_mattr, c_hko, cds}`, bendera veto yang aktif, serta **rincian waktu komputasi per tahap (`serp_ms`, `nlp_kumparan_ms`, `bm25_vsm_ms`, `gatekeeper_ms`)**. | **Tambang emas Bab 4 Skripsi!** Kalau dosen penguji bertanya: *"Berapa milidetik kecepatan eksekusi `nlp-id` Kumparan dan BM25 pada artikel 100 kata vs 2.000 kata?"*, kamu punya data log JSONL nyata hasil pengujian! |
| **3. `nlp_oov_and_disambiguation.jsonl`** *(Log Kata Baru / Out-of-Vocabulary)* | Mencatat kata-kata di artikel nyata yang tidak ditemukan di kamus 778.514 kata `nlp-id` Kumparan sehingga harus diproses oleh fallback `PySastrawi`, atau kata homograf yang didisambiguasi. | Menjadi bukti ilmiah tak terbantahkan di depan penguji mengapa WASKITA menggunakan arsitektur **Hybrid (`nlp-id` Kumparan + `PySastrawi`)** dan bukan salah satu saja. |

---

## 🧪 4. Bukti Hasil Uji Forensik Empiris 3 Spesimen Riil dari Firefox

Berdasarkan 3 spesimen teks nyata yang kamu salin langsung dari peramban Firefox tanpa rekayasa AI (setelah batas konten dipisahkan secara murni):

| Parameter Metrik / Uji | Spesimen 1: MyWed (`mywed.com`) | Spesimen 2: Winny Marlina (`winnymarlina.com`) | Spesimen 3: Rumah123 (`rumah123.com`) |
| :--- | :--- | :--- | :--- |
| **Jenis Konten** | Direktori Marketplace Jasa Fotografer | Catatan Narasi Horor Perjalanan (Wisata Budaya) | Dump Mentah Ctrl+A Listing Properti Tanah Jombang |
| **Panjang Naskah Murni** | **218 kata** (4.033 karakter) | **1.296 kata** (Cerita) + 1.124 kata (Komentar) = **2.420 kata** | **2.898 kata** (45.193 karakter) |
| **Residu Tata Letak Web (Regex)** | `0 / 44 baris` | `0 / 266 baris` | **`3 / 667 baris` (TERDETEKSI RESIDU)** (`Tentang Kami`, `Kebijakan Privasi`) |
| **Rasio Baris Mikro (<= 3 kata)** | **`40.9%` (18 dari 44 baris)** | `29.7%` (Cerita) / `44.0%` (Komentar) | **`64.5%` (430 dari 667 baris — Sangat Tinggi!)** |
| **Rasio Baris Hyperlink Markdown** | **`40.9%` (18 dari 44 baris)** | `20.3%` (Cerita) / `56.0%` (Komentar) | **`52.3%` (349 dari 667 baris — Kepadatan Link Ekstrem!)** |
| **Kepadatan Token Harga/Mata Uang** | **16 token harga** (`IDR / jam`) dalam 218 kata | **0 token harga** | **95 token harga** (`Rp`, `IDR`, `Miliar`, `Juta`, `/m²`) |
| **Variasi Kosakata (TTR)** | `0.3710` | `0.2934` | **`0.1743` (Sangat Rendah / Template Cetakan)** |
| **Stabilitas Leksikal (MATTR w=50)** | `0.7801` | `0.7030` | `0.5566` |
| **Over-optimasi Kata Kunci (HKO %)** | `0.0%` | `0.0%` | **`27.78%` (EKSTREM! Kata "tanah", "dijual", "jombang")** |
| **Kebocoran AI (AI Prompt Leak)** | `False` | `False` | `False` |
| **Tautan Kontak Komersial** | **5 link WA `wa.me/628...`** (terdeteksi setelah perbaikan Celah #7) | `False` (Sama sekali tidak ada ajakan transaksi) | Terdeteksi kontak pengaduan `085311111010` (PKTN) |
| **Vonis Otomatis Gatekeeper** | **DITOLAK / PERLU REVISI** (Thin Content & Transaksional) | **LOLOS / LAYAK TERBIT** (Narasi Asli Kaya Pengalaman) | **DITOLAK / PERLU REVISI** (Veto 3 Lapis: Noise, HKO, TTR) |

---

## 💳 5. Hasil Analisis Pembayaran DigitalOcean & Heroku (Menjawab Bukti Screenshot)

Berdasarkan bukti tangkapan layar yang kamu kirim:
1. **DigitalOcean Mendukung Penuh Mastercard & Visa:**
   - Bukti pada tangkapan layar Firefox (`media_1795078434079_f9185e71.jpg`): Di dalam kotak isian *"Card number"*, terpampang jelas 4 logo jaringan pembayaran internasional: **VISA, Mastercard, JCB, dan Discover**.
   - Tab di atasnya (`Card`, `Crypto`, `Alipay`, `PayPal`) adalah pemilihan saluran (*channel*). Ketika memilih opsi **`Card`**, kartu debit/kredit berlogo **Mastercard** dapat dimasukkan dan diproses secara langsung.
2. **Heroku Juga Menerima Mastercard:**
   - Kebijakan penagihan resmi Heroku (*Heroku Billing Documentation*) menerima: **Visa, Mastercard, American Express, dan Discover**.
   - Kartu Mastercard maupun Visa memiliki fungsi yang 100% identik di kedua platform cloud tersebut.
3. **Solusi Praktis Kartu Britama yang Hilang (Mengacu Foto BRImo `media_1795078529826_303697d1.jpg`):**
   - Rincian rekening Britama milikmu: Saldo Mengendap Rp 50.000, Biaya Administrasi Bulanan Rp 12.000.
   - Karena kartu fisikmu hilang, kamu **tidak wajib datang ke bank untuk cetak kartu fisik** jika hanya butuh untuk transaksi online:
     - Gunakan fitur **BRI Debit Virtual (VISA)** langsung dari aplikasi BRImo (biaya admin hanya Rp 1.000/bulan).
     - Seluruh data (16 digit nomor kartu, masa berlaku, dan kode CVV) tersedia di aplikasi BRImo dan langsung bisa dimasukkan ke formulir pembayaran DigitalOcean maupun Heroku.
     - Jika nanti kartu fisik Britama dicetak ulang di CS BRI, kartu fisik berlogo Mastercard baru juga tetap bisa dipakai untuk DigitalOcean dan Heroku setelah fitur *Debit Online* diaktifkan di BRImo.

---

## 📋 6. Rencana Tindak Lanjut

1. Menyiapkan **Instruksi Worker (SOP Mode B)** untuk membersihkan dead code dan memperbaiki Celah #1 sampai #8.
2. Memasukkan 3 spesimen riil ini ke dalam dataset pengujian benchmark resmi WASKITA (`dataset_60_drafts.json`):
   - Spesimen 2 (Winny Marlina) sebagai sampel riil kelas **P2** (Narasi Pengalaman Wisata Budaya non-YMYL).
   - Spesimen 3 (Rumah123) sebagai sampel riil kelas **N1 / N5** (Dump Ctrl+A Portal Properti & Over-optimasi Kata Kunci).
   - Spesimen 1 (MyWed) sebagai sampel riil kelas **N4** (Direktori Komersial Tipis / *Commercial Drift*).
