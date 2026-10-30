# SPRINT 4.0 ARCHITECTURAL SPECIFICATION
## Red-Span Density Veto Gate, Serper Dynamic Multi-Page Pagination, Web Cruft Stopword Purge, & Demo Seeder Sanitization

**Target Versi:** `v1.5.0-SNAPSHOT.1`  
**Status:** Ready for Dispatch to Chat 2 (DevOps & GitHub Dispatcher)  
**Author:** System Analyst & Lead Architect (WASKITA R&D)  
**Tujuan Sprint:** Mengatasi kontradiksi vonis "Siap Terbit" pada draf redundan/plagiat melalui Red-Span Density Veto Gate, memperluas jaring artikel kompetitor hingga target 5 artikel melalui Serper multi-page pagination, menumpas entitas kotor (`www`, `https`) dari celah defisit, dan membersihkan sisa teks sintetis pada `seeder.py`.

---

## 1. Analisis Akar Masalah (Root Cause Analysis)

### Masalah 1: Paradoks Vonis "Siap Terbit (82%)" pada Naskah dengan 50% Stabilo Merah
* **Fakta Empiris:** Pengguna menguji naskah yang disalin langsung dari artikel kompetitor #1 (*sipil.uma.ac.id*). Pada antarmuka naskah beranotasi stabilo, hampir separuh kalimat ditandai warna **Merah (Redundansi VSM Tinggi)**. Namun, sistem WASKITA justru memvonis naskah sebagai **"Siap Terbit (82%)"**!
* **Akar Masalah Matematis:**
  - Fungsi `calculate_composite_cds` di `backend/app/services/gatekeeper.py` hanya menghitung skor makro dokumen:
    $$\text{CDS} = 0.35 \cdot C_{\text{VSM}} + 0.30 \cdot C_{\text{IG}} + 0.20 \cdot C_{\text{MATTR}} + 0.15 \cdot C_{\text{HKO}}$$
  - Dokumen kompetitor aslinya panjang (1.222 kata karena memuat komentar, sidebar, dan artikel terkait). Sementara itu, draf pengguna hanya memuat sebagian paragraf (~350 kata). Akibatnya, Cosine Similarity vektor dokumen global hanya tercatat **39.5%**, yang mana masih berada jauh di bawah ambang batas redundansi global `thresholds.max_cosine_similarity = 0.60` (60%).
  - Karena nilai HKO = 0% ($C_{\text{HKO}} = 100$) dan variasi kata dalam draf cukup baik ($C_{\text{MATTR}} \approx 80$), kalkulator CDS menghasilkan skor komposit **82%**.
  - **Kelemahan Arsitektur:** Evaluasi vonis kelayakan dijalankan sebelum pengecekan mikro kalimat (`generate_annotated_spans`), sehingga rasio kalimat berstabilo merah sama sekali tidak memiliki hak suara (*veto power*) atas vonis kelayakan akhir pra-publikasi.

### Masalah 2: Hanya 2 Artikel Kompetitor yang Berhasil Diambil
* **Fakta Empiris:** Kueri *"arsitektur brutalisme, beton ekspos"* hanya menghasilkan 2 artikel acuan Google SERP (*sipil.uma.ac.id* dan *student-activity.binus.ac.id*), bukan target 5 artikel.
* **Akar Masalah Scraper:**
  - Endpoint `https://google.serper.dev/search` **mengabaikan parameter `num: 25`** dan secara baku hanya mengembalikan 10 hasil organik per halaman (`page: 1`).
  - Dari 10 hasil Google Indonesia tersebut:
    - 1 terblokir karena domain Wikipedia (`id.wikipedia.org`).
    - 2 terbuang karena bertipe PDF jurnal akademis (`iplbijournals.id` dan Semantic Scholar).
    - 2 terbuang karena berupa link terjemahan Google Translate (`translate.google.com` / `translate.goog`) yang dianggap *search_engine_proxy*.
    - 2 link Google Goto menghasilkan teks pendek (< 150 kata) atau proteksi bot/sosial media (Instagram/Reddit).
    - Akibatnya, dari 10 kandidat, hanya 2 yang memenuhi syarat artikel web bersih $\ge 150$ kata.

### Masalah 3: Derau Protokol Web Masuk ke Celah Defisit (`+ Www`, `+ Https`)
* **Fakta Empiris:** Kartu *Matriks Celah Informasi (Information Gain)* memunculkan entitas defisit seperti `+ Www (1 SERP)` dan `+ Https (1 SERP)`.
* **Akar Masalah Tokenizer:**
  - Pembersihan regex `re.sub(r"[^\w\s]", " ", ...)` memecah URL menjadi token kata terpisah. Kata seperti `https` (5 huruf) dan `www` (3 huruf) lolos dari filter panjang kata dan belum terdaftar dalam `WEB_NOISE_STOPWORDS` di `nlp_pipeline.py`.

### Masalah 4: Sisa Teks Sintetis pada Sesi Demonstrasi (`seeder.py`)
* **Fakta Empiris:** Pembersihan database via vacuum/purge memicu `backend/app/core/seeder.py` untuk menginjeksi ulang data demo awal (*Resep Kopi Tubruk Tradisional*). Di dalam berkas ini, kolom `annotated_spans_json` masih memuat teks sintetis lama: `[Saran Celah Defisit SERP: ...]`.

---

## 2. Rincian Perubahan Teknis (Technical Directives)

### Butir A: Red-Span Density Veto Gate (Backend - Worker 2)
**Berkas Sasaran:**
1. `backend/app/services/gatekeeper.py`
2. `backend/app/api/v1/endpoints/audit_endpoints.py`

**Spesifikasi Algoritma:**
1. Di `gatekeeper.py`, perbarui fungsi `calculate_composite_cds`:
   ```python
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
       red_span_ratio: float = 0.0,  # Rasio kalimat redundan mikro terhadap total kalimat
   ) -> Dict[str, any]:
   ```
2. **Aturan Veto Red-Span Density (Ambang Batas $\ge 20\%$):**
   - Hitung `red_span_ratio = len(red_spans) / max(1, len(all_spans))`.
   - Jika `red_span_ratio >= 0.20`:
     - Tandai `is_sentence_redundant = True`.
     - Paksa vonis akhir: `verdict_status = "Perlu Revisi - Redundansi Kalimat Tinggi"` (apabila bukan out-of-domain).
     - Terapkan penalti batas atas pada skor komposit CDS:
       ```python
       # Skor CDS tidak boleh melebihi 58.0% jika lebih dari seperlima draf menjiplak kompetitor
       cds = min(cds, round(58.0 * (1.0 - (red_span_ratio - 0.20)), 1))
       ```
3. Di `audit_endpoints.py`:
   - Ubah urutan eksekusi: panggil `generate_annotated_spans` terlebih dahulu sebelum `calculate_composite_cds`, atau hitung rasio kalimat merah dan masukkan sebagai parameter `red_span_ratio`.
   - Pastikan jika `is_sentence_redundant` bernilai True, vonis tidak dapat menjadi "Siap Terbit".

### Butir B: Serper Multi-Page Pagination & Proxy Unwrapper (Backend - Worker 2)
**Berkas Sasaran:** `backend/app/services/serp_scraper.py`

**Spesifikasi Teknis:**
1. **Multi-Page Candidate Fetching:**
   - Buat fungsi pembantu `_fetch_serper_page(client, query, page_num)` yang mengunduh 10 kandidat Serper per halaman.
   - Panggil `page: 1`. Jika jumlah `candidate_urls` bersih setelah filter awal kurang dari `settings.SERP_TOP_K` (atau $< 8$ kandidat), langsung lakukan permintaan paralel/berurutan ke `page: 2` (dan jika perlu `page: 3`) hingga terkumpul minimal 10–15 kandidat URL unik.
2. **Pembersihan URL Google Translate / Proxy:**
   - Pada `classify_url_skip_reason`, jika URL berasal dari `translate.google.com` atau subdomain `translate.goog`:
     - Periksa parameter query `u=` atau `url=` untuk mengekstrak URL tujuan aslinya.
     - Jika URL asli valid dan bukan media sosial/PDF, gunakan URL asli tersebut atau izinkan halaman terjemahan diunduh sebagai korpus teks bahasa Indonesia (karena memuat artikel bernilai tinggi dari media global yang diterjemahkan).
3. **Target Kuota Kompetitor:**
   - Pastikan loop pengumpulan berusaha mengumpulkan hingga 5 artikel berbobot tinggi ($\ge 150$ kata) sebelum berhenti.

### Butir C: Stopwords Derau Web & Protokol Internet (Backend - Worker 2)
**Berkas Sasaran:** `backend/app/services/nlp_pipeline.py`

**Spesifikasi Teknis:**
Perluas `WEB_NOISE_STOPWORDS` dengan daftar derau protokol web, ekstensi berkas, dan kata navigasi CMS:
```python
WEB_NOISE_STOPWORDS.update({
    "www", "http", "https", "html", "htm", "php", "asp", "aspx", "jsp",
    "com", "org", "net", "gov", "edu", "mil", "co", "id", "io", "ai",
    "url", "uri", "link", "download", "pdf", "file", "doc", "docx",
    "web", "website", "portal", "site", "view", "share", "tag", "tags",
    "admin", "posted", "author", "post", "posts", "komentar", "comment",
    "search", "cari", "menu", "home", "beranda", "navigasi", "navigation",
    "undefined", "null", "true", "false",
})
```
Ini menjamin entitas seperti `Www` dan `Https` tidak akan pernah masuk ke dalam daftar entitas defisit atau entitas pembeda.

### Butir D: Sanitasi Teks Sintetis pada Seeder Demo (DevOps / Worker 2)
**Berkas Sasaran:** `backend/app/core/seeder.py`

**Spesifikasi Teknis:**
1. Bersihkan `annotated_spans_json` pada sesi `s1` (*Resep Kopi Tubruk Tradisional*):
   - Hapus span sintetis: `{"text": "[Saran Celah Defisit SERP: ...]", "color": "blue", "label": "Saran Celah Defisit"}`.
   - Gantikan dengan span kalimat asli naskah yang ditandai monoton atau netral.
2. Jalankan pembersihan database dan seeding ulang agar riwayat sesi bersih 100% dari teks sintetis lama.

### Butir E: Sinkronisasi Status & Label Vonis di Antarmuka (Frontend - Worker 1)
**Berkas Sasaran:**
1. `frontend/src/components/audit-block/PrePublishVerdictCard.tsx`
2. `frontend/src/utils/draftSanitizer.ts`

**Spesifikasi Teknis:**
1. Dukung status vonis baru `"Perlu Revisi - Redundansi Kalimat Tinggi"`:
   - Berikan badge bernuansa amber/rose dengan ikon peringatan.
   - Tampilkan sub-label deskriptif: *"Draf memiliki kemiripan kalimat langsung yang signifikan dengan artikel kompetitor SERP."*
2. Pastikan warna busur gauge SemiCircle mengikuti skor penalti (kuning/merah).

---

## 3. Rencana Pengujian & Kriteria Keberhasilan (QA Acceptance Criteria)
1. **Uji Adversarial Plagiat:**
   - Uji input draf yang disalin dari *sipil.uma.ac.id*.
   - Hasil harus: **"Perlu Revisi - Redundansi Kalimat Tinggi"** dengan skor CDS $\le 58\%$ (TIDAK BOLEH "Siap Terbit").
2. **Uji SERP Scraper Kuota:**
   - Kueri *"arsitektur brutalisme, beton ekspos"* harus mengumpulkan 3 sampai 5 artikel kompetitor valid dari kombinasi Page 1 dan Page 2 Serper (termasuk Detik, Binus, Uma, SetiapGedung).
3. **Uji Stopword Entitas:**
   - Tidak ada entitas `Www`, `Https`, `Pdf`, atau `Com` yang muncul di *Matriks Celah Informasi*.
4. **Uji Seeder:**
   - Sesi demo Kopi Tubruk menampilkan naskah murni tanpa span `[Saran Celah Defisit SERP: ...]`.
5. **Backend & Frontend Test Suite:**
   - Seluruh test di `backend/tests/` dan `frontend/src/` lulus (0 failure).
