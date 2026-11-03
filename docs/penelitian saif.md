# BLUEPRINT METODOLOGI, ALUR CERITA, & ANTI-BLUNDER PENELITIAN SAIF

> **Dokumen:** `penelitian saif.md`  
> **Status:** Blueprint Resmi — acuan tetap selama penyusunan proposal dan naskah penelitian.

## Daftar Isi

1. [Filosofi Dasar Cara Kerja Saif](#1-filosofi-dasar-cara-kerja-saif-pikir-logika-dulu-baru-menulis)
2. [Alur 6 Tahap Menemukan Masalah hingga Mengunci Riset](#2-alur-6-tahap-menemukan-masalah-hingga-mengunci-riset-sop-hulu-ke-hilir)
3. [Arsitektur Storytelling di Setiap Bab](#3-arsitektur-storytelling-cara-bercerita-di-setiap-bab)
4. [Daftar Blunder Masa Lalu & Pagar Pencegahan](#4-daftar-blunder-masa-lalu--pagar-pencegahan-anti-blunder-guardrails)
5. [SOP Teknis Lingkungan Kerja](#5-sop-teknis-lingkungan-kerja-saif-linux-mint--google-docs--zotero--antigravity)

---

## 1. Filosofi Dasar Cara Kerja Saif ("Pikir Logika Dulu, Baru Menulis")

- **Haram Menentukan Judul di Awal:** Judul adalah muara paling akhir yang baru boleh dirumuskan setelah **6 Pilar Fondasi Penelitian** terkunci secara logis beserta bukti literaturnya:
  1. Topik
  2. Masalah
  3. Teori
  4. Kebaruan
  5. Metode
  6. Tujuan
- **Haram Ghost Claim (Asumsi Tanpa Bukti):** Setiap klaim masalah, angka statistik, justifikasi metode, maupun alasan menolak metode lain **wajib** ditempeli sitasi paper, jurnal, atau nomor paten resmi sejak kalimat pertama ditulis.
- **Prinsip Penggunaan AI ("Jangan Membodohi Diri Sendiri"):** AI dan agen lokal (seperti Antigravity) hanya digunakan untuk memangkas pekerjaan kasar/repetitif (*busy work*), **bukan** menggantikan proses berpikir kritis atau validasi sumber asli.
- **Metode "Tabel & Kerangka Dulu, Narasi Kemudian":** Jangan pernah meminta AI langsung menggenerasi satu bab penuh sekaligus. Kunci dulu struktur poin, tabel matriks, atau diagramnya, baru tuliskan narasinya secara bertahap per sub-bab.

---

## 2. Alur 6 Tahap Menemukan Masalah hingga Mengunci Riset (SOP Hulu ke Hilir)

### Tahap 1: Mengunci Fondasi Masalah & Observasi Lapangan

Sebelum mencari ratusan paper, jawab dan buktikan 3 pertanyaan kunci secara empiris:

1. **Apa bukti angka/fenomena nyata di lapangan?**
   Cari studi longitudinal dan riset industri berskala besar, seperti:
   - Data Common Crawl/Graphite oleh Paredes dkk. (2026)
   - Data Ahrefs/Semrush oleh Fatai (2026)
   - Eksperimen 16 bulan *ranking collapse* oleh Babiak (2026)
2. **Bagaimana kondisi riil perkakas (*tools*) yang ada saat ini?**
   Lakukan observasi dan uji coba langsung (*hands-on local lab*), baik mengamati alat komersial (Surfer SEO, Frase, Clearscope) maupun mengkloning alat open-source di laptop Linux. Contoh: membuktikan bahwa modul *Content Gap Analyzer* pada BlogPilot AI hanya mencocokkan kata di tag judul/heading diff tanpa membaca semantik isi paragraf.
3. **Bagaimana format identifikasi masalah yang benar?**
   Gunakan struktur bertingkat Polibatam:

   > Pernyataan Masalah → Penjelasan Konteks → **a.** Kondisi saat ini (disertai bukti sitasi angka) → **b.** Kondisi yang diharapkan (solusi terukur).

### Tahap 2: Pengumpulan & Penyaringan Literatur Bertarget (Find & Filter)

Jangan mengunduh paper secara acak. Bagi pencarian ke dalam **4 keranjang literatur** di Zotero (cukup **15–20 dokumen inti**):

| # | Keranjang | Fungsi | Contoh |
|---|-----------|--------|--------|
| 1 | **Masalah & Fenomena** (5 tahun terakhir, 2021–2026) | Membuktikan urgensi masalah di Bab I dan Sub-bab 2.1 | Bevendorff dkk., 2024; Font-Julian dkk., 2026; Rodrigues dkk., 2026 |
| 2 | **Teori Induk & Paten** (*seminal/foundational work*) | Rumus dasar di Sub-bab 2.2, tidak terikat batas 5 tahun | Shannon, 1948; Salton dkk., 1975; Manning dkk., 2008; Paten Google Cărbune & Anders, 2022 |
| 3 | **Pemrosesan Bahasa & Leksikal** | Pipa pra-pemrosesan teks bahasa Indonesia | Sastrawi / Nazief-Adriani; Tala, 2003; Asian dkk., 2005 |
| 4 | **Metodologi Rekayasa & Evaluasi** | Sub-bab 2.3, 2.4, dan Bab III | Geerts, 2011 & Peffers dkk., 2007 (DSRM); Powers, 2007 (Confusion Matrix); Ho & Williams, 2006 (uji latensi & beban server) |

**Aturan Baca Cepat (Skimming):**
Baca **Abstrak** → **Kesimpulan / Future Work** (untuk mencari celah) → **Grafik/Metode**, lalu lakukan bacaan penuh (*full read*) hanya pada **20–25% paper paling inti**.

### Tahap 3: Pemetaan Matriks State-of-the-Art (SOTA)

- Buat tabel perbandingan **5 penelitian terdahulu** terlebih dahulu dengan kolom:

  | Peneliti/Tahun | Fokus Penelitian | Metode/Teknologi | Kelebihan/Temuan Utama | Keterbatasan/Celah Penelitian |
  |---|---|---|---|---|

- Letakkan **Penelitian Ini** di baris paling bawah sebagai penutup seluruh celah tersebut.

### Tahap 4: Menyusun Pohon Silsilah Teori (3 Tingkatan + Komparasi Alternatif)

Agar tidak diserang penguji dengan pertanyaan *"Kenapa pakai metode ini, bukan metode itu?"*, susun teori dalam 3 level hierarki:

| Level | Peran | Isi |
|---|---|---|
| **Grand Theory** | Akar Ilmu Murni | *Information Theory* (Shannon, 1948) dan *Information Retrieval Theory* (Salton, 1975) — menjelaskan bagaimana informasi, derau (*noise*), dan representasi numerik dokumen bekerja |
| **Middle-Range Theory** | Batang Komputasi | *Vector Space Model* (TF-IDF & Cosine Similarity) dan *Information Gain Theory* (Paten Google Cărbune & Anders, 2022) — menghitung jarak sudut vektor serta selisih himpunan entitas (Δgain dan Δdeficit) |
| **Applied Theory** | Ranting Fisik Teks | Metrik stilometri permukaan teks (Bevendorff dkk., 2024): *Type-Token Ratio* (TTR/MATTR) dan *Heading-Keyword Overlap* (HKO) |

**Komparasi Alternatif (Alasan Menolak Metode Lain)** — selalu siapkan alasan ilmiahnya:

- **Menolak Deep Learning / BERT Embedding murni**, karena:
  - Bersifat *black-box*;
  - Latensi tinggi;
  - Tidak bisa mengekstrak daftar entitas celah konten secara deterministik;
  - Akurasi detektor AI menurun dari 93% ke 75% (Rodrigues dkk., 2026).
- **Tidak memakai Euclidean Distance sebagai ukuran kemiripan utama**, karena bias terhadap panjang fisik dokumen.

---

## 3. Arsitektur Storytelling (Cara Bercerita) di Setiap Bab

### A. BAB I — Piramida Terbalik 5 Pilar

Bab I harus mengalir dari fenomena global menuju solusi spesifik dalam 5 paragraf/pilar yang saling mengunci:

```plaintext
[Pilar 1: Ledakan Volume Hulu & Regulasi Mesin Pencari]
(Artikel AI capai 50% di Q1 2026 menurut Paredes dkk., memicu penindakan Scaled Content Abuse Google)
       │
       ▼
[Pilar 2: Paradoks Hilir SERP & Fenomena Ranking Collapse]
(Konten manusia kuasai 82,2% Top 3 Ahrefs menurut Fatai 2026, sedangkan AI mentah anjlok dari 28% ke 3% di bulan ke-3 menurut Babiak 2026)
       │
       ▼
[Pilar 3: Akar Kerusakan Stilometri & Pergeseran ke Alur Hibrida]
(Kegagalan dipicu HKO kaku R²=0.98 & TTR rendah menurut Bevendorff dkk. 2024 ──► 64% praktisi beralih ke alur hibrida menurut Fatai 2026)
       │
       ▼
[Pilar 4: Keterbatasan Perangkat Evaluasi Saat Ini (Tooling Gap: Makro ke Mikro)]
(Urutan wajib: Bahas diskrepansi alat SEO komersial makro oleh Font-Julian dkk. 2026 dulu ──► baru bahas alat mikro yang black-box/cek judul dangkal tanpa Information Gain Cărbune & Anders 2022)
       │
       ▼
[Pilar 5: Solusi Artefak Sistem Gatekeeper Anda]
(Membangun Pre-Publishing Quality Gatekeeper berbasis VSM, Information Gain, Stilometri, & kerangka kerja DSRM Geerts 2011)
```

### B. BAB II — Alur 4 Babak Pembuktian Ilmiah

Tugas Bab II adalah membuktikan bahwa posisi penelitian unik dan mesin di dalamnya dibangun di atas matematika yang sahih (ideal **8–12 halaman**, tanpa teori sampah/umum).

- **Babak 1 — Sub-bab 2.1 Penelitian Terkait** *("Di mana celah karya orang lain?")*  
  Ceritakan setiap paper dengan rumus 4 langkah: **Nama Peneliti → Metode → Hasil Utama → Kelemahan Teknisnya**. Rangkum ke dalam *Research Gap Matrix*, lalu tutup dengan penegasan kebaruan sistem.
- **Babak 2 — Sub-bab 2.2 Landasan Teori** *("Rumus apa yang menggerakkan kode saya?")*  
  Haram memasukkan definisi komputer, sejarah internet, atau pengertian Python. Hanya masukkan teori yang benar-benar dikoding:
  - Mekanisme Search Essentials;
  - Rumus VSM: TF-IDF (Persamaan 2.1), Cosine Similarity (Persamaan 2.2), Euclidean Distance (Persamaan 2.3);
  - Diagram himpunan & rumus Information Gain: Δgain (Persamaan 2.4) & Δdeficit (Persamaan 2.5);
  - Pipeline text mining;
  - Rumus stilometri TTR & HKO.
- **Babak 3 — Sub-bab 2.3 Metode Pengembangan / Rekayasa** *("Bagaimana tahapan ilmiah membangunnya?")*  
  Uraikan **6 tahapan DSRM** (Geerts, 2011) dan langsung pasangkan setiap tahap teoritisnya dengan aktivitas nyata pembangunan sistem.
- **Babak 4 — Sub-bab 2.4 Metode Evaluasi Berorientasi Sistem** *("Bagaimana membuktikan alat ini akurat dan tangguh tanpa bias subjektif?")*  
  Uraikan evaluasi *system-centric*:
  - Confusion Matrix (Precision, Recall, F1-Score — Persamaan 2.6–2.8, Powers, 2007) terhadap **30 draf uji** berlabel *ground truth* pakar;
  - Uji kinerja komputasi peladen (*response time* dan *load testing*, Ho & Williams, 2006).

### C. BAB III — Transformasi Rumus Menjadi Arsitektur Kode

Bab III harus membuktikan bahwa seluruh rumus di Bab II benar-benar dieksekusi di dalam rancangan perangkat lunak secara konsisten.

- **Jembatan Metodologi (3.2 vs 3.3):**
  - **3.2** — Jelaskan alur riset makro menggunakan 6 tahapan DSRM (Gambar 3.1).
  - **3.3** — Jelaskan bahwa *Evolutionary Prototyping* bekerja secara spesifik di dalam **Fase ke-3 DSRM (Design and Development)** untuk mengalibrasi ambang batas Cosine Similarity dan ekstraksi entitas secara iteratif.
- **Jembatan Rumus-ke-Modul (3.4):** Setiap komponen berikut harus merujuk langsung ke modul pustaka teknisnya (FastAPI, Serper.dev, HTTPX + curl-cffi, Trafilatura XML, PySastrawi, scikit-learn `TfidfVectorizer`, dan *set difference*):
  - Arsitektur 5 Lapisan (Gambar 3.2)
  - Kebutuhan Fungsional (FR-01 s.d. FR-13)
  - Use Case (Gambar 3.3)
  - Activity Diagram dengan *graceful degradation* FR-13 (Gambar 3.4)
  - ERD 6 Tabel SQLite (Gambar 3.5)
  - Wireframe Mobile-First Waskita (Gambar 3.6)

---

## 4. Daftar Blunder Masa Lalu & Pagar Pencegahan (Anti-Blunder Guardrails)

Simpan daftar ini agar kesalahan yang pernah terjadi selama penyusunan proposal tidak pernah terulang lagi.

| No | Blunder yang Pernah Terjadi | Penyebab Masalah | Solusi & Pagar Pencegahan Ke Depan |
|---|---|---|---|
| 1 | **Halusinasi Atribusi Paper (*Academic Hallucination*)** pada draf awal Bab II. | AI sempat menukar isi paper Roque (2023) menjadi bahasan *ranking collapse* (padahal milik Babiak, 2026) dan Rodrigues dkk. (2026) menjadi A/B testing SERP (padahal komparasi linguistik LIWC/SAGE). | Wajib verifikasi judul & abstrak asli PDF sebelum masuk tabel SOTA. Kunci peran masing-masing: **Roque (2023)** = otomatisasi *content gap* klaster kata kunci; **Rodrigues dkk. (2026)** = komparasi linguistik manusia vs AI (LIWC/SAGE); **Bevendorff dkk. (2024)** = spam SEO & metrik TTR/HKO. |
| 2 | **Urutan Paragraf Latar Belakang Terbalik** (Mikro dulu baru Makro). | Membahas keterbatasan paten mikro (Information Gain) sebelum membahas diskrepansi alat SEO makro (Font-Julian dkk., 2026) membuat alur cerita melompat. | Pertahankan alur Piramida Terbalik (**Makro → Mikro → Solusi**): bahas ketidakpastian platform SEO makro (Font-Julian dkk., 2026) terlebih dahulu, baru kerucutkan ke ketiadaan ekstraksi Information Gain (Cărbune & Anders, 2022). |
| 3 | **Menimpa Format Dokumen Saat Revisi.** | Meminta AI menulis ulang satu bab penuh ketika hanya ada 1–2 paragraf yang keliru dapat merusak format heading, tabel, dan sitasi Zotero yang sudah rapi. | Gunakan **isolasi perbaikan**: sunting hanya paragraf atau baris tabel yang bermasalah tanpa menyentuh bagian bab lain yang sudah terverifikasi. |
| 4 | **Meniru Mentah Contoh Diagram Template Kampus.** | Contoh diagram di template prodi menampilkan kotak evaluasi "SUS, Risiko Keamanan, Kompleksitas Bisnis" yang ditujukan untuk SIM biasa. | Jangan pernah menyalin contoh diagram template secara buta. Karena riset ini bersifat *system-centric* (tanpa kuesioner manusia/SUS), seluruh diagram evaluasi wajib mengacu pada Confusion Matrix (Powers, 2007) dan uji beban peladen (Ho & Williams, 2006). |
| 5 | **Diagram Arsitektur Mermaid.js Terbalik & Semrawut** (Layer 5 naik ke puncak). | Menarik garis panah balik langsung dari blok bawah (Verdict di Layer 5) ke blok atas (UI di Layer 1) membuat mesin layout Mermaid menarik Layer 5 ke paling atas. | Pisahkan blok *Presentation Layer (Input Workspace)* di Lapisan 1 dan *Presentation Layer (Diagnostic Output)* di Lapisan 6, serta kunci urutan dari atas ke bawah dengan tautan tak kasat mata: `L1 ~~~ L2 ~~~ L3 ~~~ L4 ~~~ L5 ~~~ L6`. |
| 6 | **Jebakan Sidang: Kebingungan antara DSRM vs. Evolutionary Prototyping.** | Menyebut DSRM di Bab II/3.2 lalu menyebut Evolutionary Prototyping di 3.3 tanpa menjelaskan hierarkinya rawan diserang penguji metodologi. | Tegaskan bahwa **DSRM** adalah metodologi riset ilmiah (payung besar 6 siklus dari masalah hingga publikasi), sedangkan **Evolutionary Prototyping** adalah metode konstruksi perangkat lunak yang berjalan di dalam **Fase ke-3 DSRM** (Design & Development). |
| 7 | **Jebakan Sidang: Rumus Bab II Dianggap "Pajangan".** | Menulis rumus matematis di Bab II tetapi hanya menulis kotak umum "IR Engine" di Bab III tanpa menyebut implementasi teknisnya. | Selalu sebutkan pemetaan rumus ke pustaka Python secara eksplisit: **Persamaan 2.1–2.2** → scikit-learn `TfidfVectorizer` & `cosine_similarity`; **Persamaan 2.4–2.5** → operasi *set difference* Python pada hasil ekstraksi unigram/bigram/YAKE; **TTR/MATTR & HKO** → kalkulator leksikal pada struktur XML Trafilatura. |

---

## 5. SOP Teknis Lingkungan Kerja Saif (Linux Mint + Google Docs + Zotero + Antigravity)

- **Manajemen Sitasi:** Seluruh PDF referensi wajib masuk ke **Zotero** terlebih dahulu dengan metadata yang bersih sebelum disisipkan ke Google Docs, agar Daftar Pustaka APA Style tergenerasi otomatis tanpa diketik manual.
- **Sinkronisasi Konteks ke Lokal (Antigravity / VS Code):** Saat membutuhkan bantuan agen AI lokal di VS Code (Antigravity) untuk merancang kode, diagram, atau skema basis data, ekspor naskah Google Docs ke berkas Markdown (`.md`) di direktori kerja lokal Linux terlebih dahulu, agar agen membaca konteks Bab I–III secara utuh tanpa terpotong batas peramban.
- **Standar Pengolahan PDF & Lampiran di Linux:** Gunakan utilitas terminal Linux daripada screenshot layar manual yang menurunkan resolusi dokumen:
  - `pdftoppm -png -r 300` untuk mengekstrak halaman PDF menjadi gambar tajam;
  - `qpdf` / `pdfunite` untuk menggabung PDF.
- **Aturan Bookmark Daftar Isi & Lampiran:** Gunakan *Heading Styles* untuk Bab/Sub-bab dan pasang Bookmark **hanya satu kali** pada baris judul awal poin lampiran (misal pada judul *Lampiran B. Bukti Pemeriksaan Orisinalitas Naskah*), bukan di setiap lembar halaman gambarnya.
