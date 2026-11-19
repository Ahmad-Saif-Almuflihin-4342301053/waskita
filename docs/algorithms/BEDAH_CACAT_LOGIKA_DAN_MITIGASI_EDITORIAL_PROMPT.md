---
title: "Bedah Cacat Logika Algoritma, Mitigasi Editorial Prompt Frankenstein, dan Cetak Biru Eksekusi Worker"
date: 2026-11-17
author: "Ahmad Saif Almuflihin (NIM: 4342301053) & Lead AI System Architect"
tags:
  - algorithmic-forensics
  - information-retrieval
  - gatekeeper-prompt
  - information-gain
  - out-of-domain-guard
  - subsumption-deduplication
  - adr-architectural-decision-record
  - worker-execution-blueprint
  - thesis-dsrm
---

# Bedah Cacat Logika Algoritma, Mitigasi Editorial Prompt "Frankenstein", dan Cetak Biru Eksekusi Worker

Dokumen ini disusun sebagai **Architecture Decision Record (ADR)** dan **Spesifikasi Teknis Mandatori** bagi agen pelaksana (*Worker / Mode B*). Dokumen ini mengkaji secara forensik 6 cacat logika algoritma yang memicu anomali prompt "Frankenstein" pada pengujian empiris sistem **WASKITA** (*Pre-Publishing Semantic Curation & Information Gain Engine*).

---

## 1. Ringkasan Eksekutif & Kronologi Anomali

Pada pengujian lapangan Jumat siang (13 November 2026) hingga akhir pekan (16–17 November 2026), dilakukan uji coba input naskah nyata menggunakan artikel berita Kumparan mengenai program Pemprov Jabar (*"Gubernur KDM Luncurkan Fitur Angkut ODGJ di Aplikasi Sapawarga"*). Pengujian dilakukan berulang terhadap kueri politik nasional (*"wapres pengganti gibran"*).

### Anomali Utama ("Prompt Frankenstein"):
1. Pengguna menempelkan draf berita kriminal Magetan ke sistem dengan kueri target politik nasional.
2. Sistem menandai status naskah sebagai **Out-of-Domain** ($\text{Sim} < 0.05$).
3. Namun, ketika pengguna menekan tombol salin prompt rekomendasi redaksi (*AI Remediation Prompt*), prompt tersebut tetap menyertakan instruksi:
   > *"SURGICAL EDITING: Pertahankan minimal 80% kalimat asli yang tidak bermasalah kata demi kata (verbatim)..."*
   disertai tag pembungkus `=== DRAF ARTIKEL PENULIS ===`.
4. Saat di-*paste* ke model LLM (Claude/GPT/Gemini), model mematuhi aturan 80% verbatim secara kaku: model mempertahankan berita pembunuhan di Magetan lalu secara paksa menyisipkan nama-nama tokoh (*Prabowo Subianto, Wakil Presiden Gibran, Mahkamah Konstitusi*). Hasilnya adalah artikel hibrida kacau (*Frankenstein Slop*) yang tidak memiliki koherensi jurnalistik.

```mermaid
flowchart TD
    subgraph KONDISI CACAT [Alur Lama (Cacat Logika)]
        A1["Draf Berita Kriminal / Luar Topik"] --> B1["Evaluasi VSM: Sim < 0.05\n(Out-of-Domain Terdeteksi)"]
        B1 --> C1["Prompt AI: 'Pertahankan 80% Verbatim'\n+ Delimiter Draf Ditambahkan"]
        C1 --> D1["LLM Eksternal: Memaksa Sisip Politisi ke Berita Kriminal"]
        D1 --> E1["Hasil: Naskah 'Frankenstein' (Kacau/Slop)"]
    end

    subgraph MITIGASI ARCHITECTURE [Alur Baru (Mitigasi ADR-01 s/d ADR-04)]
        A2["Draf Berita Kriminal / Luar Topik"] --> B2["Evaluasi VSM: Sim < 0.05\n(Out-of-Domain Terdeteksi)"]
        B2 --> C2{"is_out_of_domain == True?"}
        C2 -- "Ya (Out-of-Domain)" --> D2["Mode Clean Re-write:\n- Tanpa Delimiter Teks Lama\n- Tanpa Aturan 80% Verbatim\n- Tulis Ulang 100% Baru Sesuai Konsensus"]
        C2 -- "Tidak (In-Domain)" --> E2["Mode Surgical Editing:\n- Pertahankan 80% Teks Asli\n- Sematkan Teks Draf Nyata\n- Lengkapi Entitas Defisit"]
        D2 --> F2["Hasil: Draf Baru Bersih & Relevan"]
        E2 --> G2["Hasil: Revisi Presisi Tanpa Merusak Gaya Penulis"]
    end
```

---

## 2. Bedah 6 Cacat Logika Algoritma & Akar Masalah

### Cacat Logika 1: Jebakan Delimiter & Instruksi Surgical 80% pada Out-of-Domain
* **Lokasi Kode:** `backend/app/services/gatekeeper.py` dan `frontend/src/components/audit-block/RemediationPromptSection.tsx`.
* **Akar Masalah:**
  Fungsi generator prompt tidak membedakan topologi instruksi ketika `is_out_of_domain = True`. Blok delimiter `{PROMPT_DRAFT_DELIMITER}` tetap di-append secara membabi buta, dan instruksi *surgical 80% verbatim* tetap aktif.
  Selain itu, di antarmuka frontend, teks draf asli tidak disematkan secara otomatis ke dalam prompt yang disalin, sehingga pengguna sering menempelkan teks draf yang salah atau memicu kebingungan bagi LLM target.
* **Dampak:** LLM penerima prompt menghasilkan artikel tidak logis karena berusaha mempertahankan draf yang keliru sebesar 80% sembari memaksakan entitas konsensus SERP yang bertolak belakang.

---

### Cacat Logika 2: Kegagalan Pruning Navigasi Web & `extractSmartKeyword` pada Salin Mentah (`Ctrl+A`)
* **Lokasi Kode:** `frontend/src/utils/draftSanitizer.ts`.
* **Akar Masalah:**
  Ketika pengguna menyalin artikel langsung dari portal berita (misal Kumparan/Detik) menggunakan `Ctrl+A`, struktur DOM luar seperti `<nav>`, `<header>`, `<footer>`, dan elemen breadcrumb ikut terbawa dalam satu baris teks panjang tanpa *newline* (`\n`).
  Heuristik baris pertama `extractSmartKeyword` yang membatasi panjang judul $\le 140$ karakter langsung gagal karena baris pertama mencapai ratusan karakter (`BerandaNewsKumparan...`). Akibatnya, sistem jatuh (*fallback*) ke algoritma frekuensi kata murni (TF-IDF). Kata dengan frekuensi leksikal tertinggi seperti `"jawa barat"` terpilih sebagai kueri target, bukan judul berita sesungguhnya.
* **Dampak:** Google SERP mengambil artikel ensiklopedia geografi Provinsi Jawa Barat, sehingga naskah berita peluncuran fitur ODGJ divonis salah topik secara keliru.

---

### Cacat Logika 3: False Topic-Shift Blocker pada Multi-Turn Query Unlock
* **Lokasi Kode:** `backend/app/api/v1/endpoints/audit_endpoints.py` (Baris 472).
* **Akar Masalah:**
  Pengecekan *Topic Shift Blocker* ditulis sebagai:
  ```python
  if req.parent_session_id and avg_cosine_sim < 0.05:
      # BLOKIR: Dianggap pergeseran topik liar antar putaran
  ```
  Kode ini tidak mengecek kondisi `is_same_query`. Ketika pengguna sengaja membuka gembok kueri di Turn #3 untuk meneliti topik baru, backend tetap membandingkan naskah baru terhadap kueri induk Turn #1, sehingga secara salah memblokir pengguna dengan kartu *"FOKUS BARU - Fokus Berbeda Terdeteksi"*.
* **Dampak:** Pengguna terkunci dan tidak bisa melakukan audit draf pada kueri baru tanpa membuat sesi dari awal (*hard reset*).

---

### Cacat Logika 4: Kebocoran Information Gain Semu (False Gain) pada Naskah Out-of-Domain
* **Lokasi Kode:** `backend/app/api/v1/endpoints/audit_endpoints.py` dan `backend/app/services/gatekeeper.py`.
* **Akar Masalah:**
  Secara teori himpunan, Information Gain dihitung sebagai selisih entitas draf terhadap entitas SERP:
  $$\Delta_{\text{gain}} = E_{\text{draft}} \setminus E_{\text{SERP}}$$
  Pada naskah yang *Out-of-Domain* (berita kriminal pada kueri politik), seluruh kata berita kriminal (*"tersangka", "polres", "magetan", "senjata tajam"*) tidak ditemukan di SERP politik. Tanpa *guard semantic domain*, sistem menganggap kata-kata kriminal tersebut sebagai "kebaruan informasi bernilai tinggi" (*Information Gain*), memberi stabilo hijau, dan mendongkrak skor $C_{\text{IG}}$ secara palsu.
* **Dampak:** Pelanggaran berat terhadap standar Information Retrieval dan paten Google (Cărbune & Anders, 2022). Kebaruan di luar domain bukanlah nilai tambah, melainkan derau (*noise*).

---

### Cacat Logika 5: Bug Matematis Deduplikasi Subsumption Unigram
* **Lokasi Kode:** `backend/app/services/information_gain.py` (`_deduplicate_subsumed_unigrams`) dan `backend/app/api/v1/endpoints/audit_endpoints.py`.
* **Akar Masalah:**
  1. Kode deduplikasi sebelumnya mengecek:
     `if it.competitor_consensus_count <= bigram_parts_consensus[uni]:`
     Jika frekuensi unigram lebih besar 1 poin dari bigram (misal $DF(\text{Wakil}) = 10$ sedangkan $DF(\text{Wakil Presiden}) = 9$), kondisi ini bernilai `False`. Akibatnya, kata *"Wakil"* dan *"Presiden"* tetap lolos dan muncul bersamaan dengan *"Wakil Presiden"*.
  2. Ekstraksi Top-25 `consensus_serp_stems` pada `audit_endpoints.py` diambil mentah-mentah sebelum proses subsumption dilakukan, mencemari daftar entitas konsensus SERP dengan pecahan kata tunggal.
* **Dampak:** Antarmuka menampilkan entitas redundan (*"Wakil"*, *"Presiden"*, *"Wakil Presiden"*), menurunkan wibawa ilmiah artefak sistem.

---

### Cacat Logika 6: Hilangnya Properti `is_consensus_priority` pada Riwayat Sesi
* **Lokasi Kode:** `backend/app/api/v1/endpoints/audit_endpoints.py` (`build_audit_execute_response`).
* **Akar Masalah:**
  Fungsi pembangun respons saat membaca kembali data sesi dari database lupa memetakan atribut `is_consensus_priority` ke dalam objek DTO entitas defisit. Akibatnya, di frontend, `priority_deficits_count` terhitung 0, sehingga kartu progres menampilkan status palsu *"20/20 Entitas Konsensus Terpenuhi"* saat riwayat sesi dimuat ulang.
* **Dampak:** Kerusakan konsistensi state UI saat berpindah antar riwayat audit (*session reload anomaly*).

---

## 3. Architecture Decision Records (ADR)

### ADR-01: Topologi Prompt Remediasi Dinamis Berbasis Domain
* **Status:** DITERIMA & MANDATORI.
* **Keputusan:**
  1. Jika `is_out_of_domain == True`:
     - Matikan instruksi *"SURGICAL EDITING: Pertahankan minimal 80% kalimat asli"*.
     - Ganti dengan instruksi *"REORIENTASI TOPIK TOTAL: Tulis ulang artikel 100% baru berfokus pada topik target"*.
     - Hapus delimiter `{PROMPT_DRAFT_DELIMITER}` dari prompt agar LLM tidak bingung dengan teks lama yang salah.
  2. Jika `is_out_of_domain == False`:
     - Pertahankan mode bedah presisi (*Surgical 80% Verbatim*).
     - Sisipkan isi naskah draf aktual (`draft_content`) secara otomatis di antara tag delimiter.

---

### ADR-02: Kebijakan Nol-Gain pada Status Out-of-Domain (Zero-Gain Policy)
* **Status:** DITERIMA & MANDATORI.
* **Keputusan:**
  Ketika kemiripan semantik VSM rata-rata $< 0.05$ (`is_out_of_domain == True`), sistem menerapkan isolasi mutlak:
  $$\Delta_{\text{gain}} = \emptyset, \quad C_{\text{IG}} = 0$$
  Daftar `entity_gaps.gain` dikosongkan dan tidak ada stabilo hijau yang dirender pada draf yang salah topik.

---

### ADR-03: Sanitasi DOM Pruning Tingkat Elemen pada Ingest Draf
* **Status:** DITERIMA & MANDATORI.
* **Keputusan:**
  Sebelum mengekstraksi teks atau menghitung heuristik judul di `draftSanitizer.ts`, parser harus membuang elemen struktural web:
  `nav, header, footer, aside, script, style, [role="navigation"], [role="banner"], [role="contentinfo"]`.
  Setiap elemen blok (`h1`, `h2`, `p`, `div`) wajib diakhiri pemisah baris (`\n\n`) untuk menjamin heuristik judul baris pertama membaca judul bersih tanpa lelehan teks navigasi.

---

### ADR-04: Relaksasi Rasio Frekuensi Subsumption Sanderson
* **Status:** DITERIMA & MANDATORI.
* **Keputusan:**
  Mengadopsi aturan dominasi leksikal Sanderson & Croft (1999):
  Unigram $u$ dihapus dari daftar entitas konsensus jika terdapat bigram/trigram $M$ sedemikian rupa sehingga:
  $$u \subset M \quad \land \quad DF(M) \ge \lfloor 0.75 \times DF(u) \rfloor \quad \land \quad DF(M) \ge 2$$
  Hal ini menjamin bahwa unigram seperti *"Presiden"* ($DF=10$) akan otomatis diserap (*subsumed*) ke dalam *"Wakil Presiden"* ($DF=9$), karena $9 \ge \lfloor 0.75 \times 10 \rfloor = 7$.

---

## 4. Landasan Teori & Justifikasi Skripsi DSRM (Bab 3 & Bab 4)

Dalam konteks penyusunan naskah Skripsi (*Design Science Research Methodology*):
1. **Model Ruang Vektor (VSM) & Ambang Batas Domain:**
   $$\text{Sim}(D, \mathcal{S}) = \frac{\mathbf{v}_D \cdot \mathbf{v}_{\mathcal{S}}}{\|\mathbf{v}_D\| \|\mathbf{v}_{\mathcal{S}}\|} = \frac{\sum_{i=1}^{n} w_{i,D} \cdot w_{i,\mathcal{S}}}{\sqrt{\sum_{i=1}^{n} w_{i,D}^2} \sqrt{\sum_{i=1}^{n} w_{i,\mathcal{S}}^2}}$$
   Ambang batas $\tau_{\text{domain}} = 0.05$ berfungsi sebagai *non-compensatory gating mechanism*. Jika $\text{Sim} < \tau_{\text{domain}}$, naskah dinyatakan gagal relevansi mendasar.
2. **Isolasi Matematis Information Gain:**
   $$\text{IG}(D \mid \mathcal{S}) = \begin{cases} \sum_{e \in E_{\text{draft}} \setminus E_{\text{SERP}}} \text{Score}(e), & \text{jika } \text{Sim}(D, \mathcal{S}) \ge \tau_{\text{domain}} \\ 0, & \text{jika } \text{Sim}(D, \mathcal{S}) < \tau_{\text{domain}} \end{cases}$$
   Formulasi ini membuktikan orisinalitas rancang bangun sistem dalam mencegah eksploitasi spam SEO.

---

## 5. Panduan Langkah Kerja untuk Sesi Worker (Mode B)

Agen pelaksana (*Worker*) diwajibkan mengeksekusi langkah-langkah berikut secara berurutan dan terverifikasi:

### Langkah 1: Pruning DOM pada `draftSanitizer.ts`
* **File:** `frontend/src/utils/draftSanitizer.ts`
* **Tindakan:**
  Di dalam `sanitizePastedOrUploadedDraft(rawInput: string)`:
  Gunakan parser DOM virtual (`DOMParser`), lakukan pembersihan elemen non-konten (`nav, header, footer, aside, script, style, [role="navigation"]`), dan pastikan elemen heading/paragraf terpisah oleh `\n\n`. Pastikan heuristik judul baris pertama membaca judul artikel berita yang murni.

### Langkah 2: Perbaikan Guard & Session State pada `audit_endpoints.py`
* **File:** `backend/app/api/v1/endpoints/audit_endpoints.py`
* **Tindakan:**
  1. Perbaiki evaluasi Topic Shift:
     ```python
     # Pastikan is_same_query dievaluasi sebelum memblokir:
     if req.parent_session_id and is_same_query and (avg_cosine_sim is not None and avg_cosine_sim < 0.05):
     ```
  2. Saat `is_out_of_domain` bernilai `True`, pastikan:
     `entity_gaps.gain = []` dan `raw_information_gain_score = 0.0`.
  3. Pada fungsi `build_audit_execute_response()`, pastikan atribut `is_consensus_priority = (g.competitor_consensus_count >= 2)` dipetakan ke DTO deficit.
  4. Terapkan fungsi subsumption unigram pada daftar `consensus_serp_stems` (Top-25) sebelum dikirimkan ke frontend.

### Langkah 3: Optimasi Formula Subsumption pada `information_gain.py`
* **File:** `backend/app/services/information_gain.py`
* **Tindakan:**
  Implementasikan rasio frekuensi Sanderson:
  ```python
  # Unigram diserap jika ada n-gram pembungkus dengan DF >= floor(0.75 * DF_unigram)
  threshold = math.floor(0.75 * it.competitor_consensus_count)
  if any(compound_df >= threshold for compound_df in matching_compound_dfs):
      continue  # Subsumed!
  ```

### Langkah 4: Rekonstruksi Prompt pada `gatekeeper.py`
* **File:** `backend/app/services/gatekeeper.py`
* **Tindakan:**
  Perbarui fungsi `generate_overview_and_remediation()` agar menerima parameter opsional `draft_content: Optional[str] = None`.
  - Jika `is_out_of_domain == True`: Buat prompt *Clean Re-write* tanpa delimiter naskah lama.
  - Jika `is_out_of_domain == False`: Sisipkan `draft_content` aktual di dalam delimiter `=== DRAF ARTIKEL PENULIS ===`.

### Langkah 5: Penyesuaian Komponen UI `RemediationPromptSection.tsx`
* **File:** `frontend/src/components/audit-block/RemediationPromptSection.tsx`
* **Tindakan:**
  Pastikan tombol *"Salin Prompt Remediasi"* menyalin teks prompt yang sudah lengkap beserta draf teks aktual atau instruksi tulis ulang yang koheren.

### Langkah 6: Verifikasi Regresi Otomatis
* **Tindakan:**
  1. Jalankan pengujian backend:
     `pytest backend/tests/test_api_resilience.py`
  2. Jalankan pengujian frontend:
     `npm test`
  3. Verifikasi build produksi:
     `npm run build`

---

## 6. Konteks Bisnis & Kanal Pembayaran (Adsterra & Monetisasi)

Sebagai catatan operasional bagi pengembang:
1. **Adsterra Publisher Berhasil Didaftarkan:**
   - Akun: `saifmpleh` (`asamuphp@gmail.com`).
   - Telegram Messenger tertaut untuk notifikasi.
2. **Metode Penarikan Dana (Payout Channels):**
   - **Local Bank Transfer via Hyperwallet:** Mendukung transfer langsung ke rekening bank lokal Indonesia dalam mata uang **IDR** (termasuk Bank BCA, BRI `BRINIDJA`, Mandiri, dll.). Ambang batas penarikan minimum: **$25.00** (Biaya transfer $7.00 + kurs valuta).
   - **Tether (USDT) / Bitcoin:** Ambang batas penarikan: **$100.00** (Biaya penarikan 1.00%).
   - **Kesimpulan Komersial:** Sistem monetisasi **tidak memerlukan akun PayPal** yang bermasalah dengan biaya pra-otorisasi kartu domestik.
3. **Status Hosting Backend:**
   - Platform Heroku telah aktif menggunakan kartu debit Visa dengan fasilitas GitHub Student Pack Credit sebesar **$312.00** (valid selama 24 bulan).

---

## 7. Laporan Hasil Eksekusi Worker (Mode B) & Verifikasi QA (100% Lulus)

* **Tanggal Eksekusi:** 2026-11-17
* **Pelaksana:** Mode B (Worker / Software Engineer) di bawah `.cursorrules`
* **Status:** SELESAI & 100% TERVERIFIKASI

### 7.1 Matriks Perubahan Kode

| Komponen | Berkas | Perubahan Algoritma / Mitigasi |
|---|---|---|
| **Langkah 1** | `frontend/src/utils/draftSanitizer.ts` | DOM Pruning elemen non-konten (`nav, header, footer, aside, script, style, [role="navigation"]`) & injeksi baris baru (`\n\n`) pada blok teks sehingga `extractSmartKeyword` mengekstrak judul berita murni. |
| **Langkah 2** | `backend/app/api/v1/endpoints/audit_endpoints.py` | Topic-Shift blocker kini mengevaluasi `is_same_query`. Isolasi mutlak Out-of-Domain (Zero-Gain Policy, `entity_gaps.gain = []`). Rehidrasi konsistensi DTO `is_consensus_priority`. Subsumption unigram pada Top-25 konsensus SERP. |
| **Langkah 3** | `backend/app/services/information_gain.py` | Implementasi relaksasi rasio frekuensi Sanderson & Croft (1999) pada `_deduplicate_subsumed_unigrams` dan `deduplicate_consensus_stems` ($DF(M) \ge \lfloor 0.75 \times DF(u) \rfloor$). |
| **Langkah 4** | `backend/app/services/gatekeeper.py` | Topologi prompt dinamis pada `generate_overview_and_remediation(draft_content=...)`. Mode *Clean Re-write* (tanpa delimiter naskah lama & tanpa aturan 80% verbatim) saat Out-of-Domain; sematan draf nyata dalam delimiter saat In-Domain. |
| **Langkah 5** | `frontend/src/components/audit-block/RemediationPromptSection.tsx` | Fungsi `getExecutablePrompt()` memastikan salinan tombol mencakup draf teks aktual atau instruksi reorientasi total yang koheren bagi LLM. |
| **Langkah 6** | `backend/tests/` & `frontend/src/` | Penambahan unit test regresi di `test_ir_engine.py` dan `draftSanitizer.test.ts`. |

### 7.2 Log Hasil Pengujian Otomatis

1. **Backend Test Suite (Pytest):**
   - `test_api_resilience.py`: **23 passed** in 39.30s (100% lulus)
   - `test_ir_engine.py`: **50 passed** in 1.22s (100% lulus)
   - `test_sanitizer.py`: **5 passed** in 0.12s (100% lulus)
   - `test_api_integration.py`: **5 passed** in 2.08s (100% lulus)
   - `evaluate_accuracy.py`: **1 passed** in 1.93s (100% lulus)
   - **Total Backend:** **84 passed, 0 failed (100% Lulus)**.

2. **Frontend Test Suite (Node Test Runner):**
   - `draftSanitizer.test.ts`: **32 passed, 0 failed (100% Lulus)**.

3. **Frontend Production Build:**
   - `tsc && vite build`: **Sukses tanpa error (built in 1.87s)**.
