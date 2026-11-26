# 🧭 Panduan & Contekan Bimbingan Zoom Pak Ari Wibowo — WASKITA v2

> **Tanggal:** Jumat, 20 November 2026 (Pukul 14.00 WIB)  
> **Dosen Pembimbing:** Pak Ari Wibowo | **Mahasiswa:** Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Link Google Slides:** https://docs.google.com/presentation/d/1T6veIpp0G2UrIhUgdgY5U9YZl2FjCuCdBFALDETmTAQ/edit  
> **Perintah Terminal Rekam Suara (Jika Mau Rekam Mandiri di Terminal):**  
> `cd ~/Downloads/Telegram\ Desktop/proyekmagang/waskitariset && ./rekam_zoom.sh start`  
> *(Untuk berhenti & transkrip otomatis ke Obsidian setelah selesai: `./rekam_zoom.sh stop`)*

---

## ⚡ CONTEKAN KILAT PRESENTASI (BACA INI SAJA SAAT ZOOM!)

### 🗣️ Cara Buka Presentasi (Menit 0–1)
> *"Selamat siang Pak Ari, terima kasih banyak waktunya.*  
> *Siang ini saya ingin memaparkan tindak lanjut masukan Sempro kemarin, menyamakan alur sistem WASKITA v2, dan mengonfirmasi **Rencana Pengujian Bab 4** sebelum saya mulai eksperimennya di sistem, Pak."*

---

### 📖 Kamus Kilat Singkatan & Istilah (Bahasa Manusianya!)

| Istilah | Bahasa Manusianya (Cara Jelasin ke Pak Ari) |
| :--- | :--- |
| **SERP (Top-K)** | **Halaman 1 Google** saat orang mencari kata kunci. Di sistem kita ambil **sampai 10 artikel kompetitor**, bukan cuma 3. |
| **DSRM** | Metode penelitian kita yang berfokus **membuat software/algoritma pemecah masalah**. |
| **BM25-VSM (35%)** | Pengukur **kemiripan teks** naskah vs kompetitor (cek masih nyambung topik nggak, dan ada indikasi plagiat nggak). |
| **Information Gain (30%)** | Pengukur **kebaruan info / fakta unik** di draf kita yang belum pernah dibahas kompetitor Google. |
| **Stilometri (35%)** | **Pengukur gaya bahasa tulisan** agar tidak monoton dan tidak spam. Terdiri dari 2 hal: |
| ↳ **MATTR (20%)** | Cek **variasi kosakata** (biar tulisan kaya diksi dan nggak ngulang kata yang sama terus kayak robot). |
| ↳ **HKO (15%)** | Cek **sub-judul (H2/H3)** (biar nggak maksa masukin kata kunci di semua judul / anti-spam). |
| **Gatekeeper (Veto)** | **Satpam otomatis** yang langsung nolak naskah kalau ketahuan plagiat kalimat, sampah web, chat AI bocor, atau jualan terselubung. |
| **CDS (0–100%)** | **Skor gabungan** dari 4 pilar di atas untuk menentukan draf *Siap Terbit* atau *Perlu Revisi*. |
| **System-Centric** | Pengujian yang fokus pada **akurasi dan kecepatan mesin/algoritmanya**, bukan nyebar kuesioner ke manusia (bukan SUS). |
| **Ground Truth** | **Kunci jawaban asli** dari 60 teks uji nyata (30 layak terbit vs 30 bermasalah) untuk mencocokkan tebakan sistem. |
| **Cohen's Kappa** | Rumus statistik untuk mengukur **kekompakan 2 penilai ahli** saat membuat kunci jawaban, agar labelnya objektif. |
| **Confusion Matrix** | **Rapor akurasi sistem** (Precision, Recall, F1-Score) dalam membedakan draf layak vs draf bermasalah. |

---

### 🎬 Alur Pemaparan 8 Slide (Cukup 1–2 Kalimat per Slide)

* **Slide 1 (Cover):** "Ini judul revisi pasca sempro kita Pak, fokus kurasi pra-publikasi berbasis Information Gain dan VSM dengan DSRM."
* **Slide 2 (Masalah):** "Masalah utamanya adalah artikel sering gagal masuk indeks Google (*Crawled - Not Indexed*) karena isinya seragam dengan kompetitor. Tools seperti Yoast cuma cek kata kunci, sedangkan AI sering bikin konten klise."
* **Slide 3 (Batasan SEO):** "Lingkup WASKITA dikunci pada **On-Page Semantic & Search Intent** khusus artikel informatif, membandingkannya langsung dengan **Lanskap Halaman 1 Google SERP organik (Top-K hingga 10 artikel)**. Format non-artikel seperti direktori atau marketplace kita jadikan batasan masalah."
* **Slide 4 & 5 (Arsitektur & 4 Pilar CDS):** "Teks draf diproses NLP (kamus Kumparan 778k lema + Sastrawi), lalu dinilai lewat 4 pilar: BM25-VSM (35%), Information Gain (30%), dan Stilometri MATTR & HKO (35%). Kalau ada plagiasi atau residu web, Gatekeeper langsung memberi veto 'Perlu Revisi'."
* **Slide 6 (Evaluasi System-Centric):** "Sesuai DSRM yang fokus menguji artefak, pengujian kita murni **System-Centric** (tanpa kuesioner pengguna/SUS). Kita menguji ketepatan klasifikasi mesin dan mencatat latensi komputasi server ke dalam log JSONL."
* **Slide 7 (60 Teks Uji Riil):** "Data ujinya berupa **60 teks nyata dari internet berimbang (30 Positif vs 30 Negatif)**. Kunci jawaban divalidasi dengan Cohen's Kappa, lalu diukur menggunakan Confusion Matrix (Precision, Recall, F1-Score)."
* **Slide 8 (Penutup & 2 Pertanyaan ke Pak Ari):** "Ada 2 hal yang ingin saya mintakan arahan ke Pak Ari:  
  1. *Apakah rancangan evaluasi system-centric 60 teks ini sudah tepat untuk Bab 4?*  
  2. *Untuk format laporan di Polibatam, apakah fokus ke Bab 4 dulu atau langsung disambung ke Bab 5?*"

---

---

## 📱 Status Pengiriman WA Bimbingan (20 Nov 2026, 10:41 WIB)
Pesan permohonan bimbingan telah dikirimkan ke Pak Ari Wibowo:
![[chat_dosbing_pak_ari_20261120.jpg]]

---

## 🖼️ 3 Gambar Terpisah Siap Kirim ke WA Pak Ari

### Gambar 1: Lingkup SEO & Fokus SERP
![[01_lingkup_seo_dan_fokus_serp.png]]

### Gambar 2: Update Arsitektur WASKITA v2
![[02_alur_arsitektur_waskita_v2.png]]

### Gambar 3: Rencana Pengujian Bab 4 (System-Centric)
![[03_rencana_pengujian_system_centric.png]]

---

## 🧠 Peta Ingatan Cepat Buat Kamu Sendiri (5 Bagian Inti Penelitianmu dari Awal sampai Akhir)

Kalau kamu ingin menjelaskan ke Pak Ari Wibowo (atau saat kamu sendiri lupa detailnya), ingat **5 Urutan Logis** ini:

### 1. Posisi Masalah di Peta Besar SEO (Kenapa Fokus SERP & Artikel Teks?)
* **SEO itu sangat luas:** Ada *Technical SEO* (kecepatan web, struktur HTML), *Off-Page SEO* (backlink, otoritas domain), serta berbagai jenis halaman yang bisa masuk halaman 1 Google karena *search intent* non-artikel (seperti **direktori jasa** *10 programmer/fotografer terbaik*, **agregator toko/marketplace** *Shopee/Tokopedia/Rumah123*, atau **alat web interaktif** *kalkulator BMI/KPR*).
* **Batasan & Fokus WASKITA:** WASKITA membatasi lingkup secara tegas pada **Kurasi Semantik Naskah Artikel Teks Pra-Publikasi (On-Page Content Differentiation)** berbasis pembanding langsung **Lanskap Kompetitor Organik Google SERP**. Halaman non-artikel (direktori, katalog marketplace, kalkulator web) diletakkan sebagai *Out-of-Scope* di Bab 1 (Batasan Masalah) dan menjadi rekomendasi pengembangan multi-fitur di Bab 5 (Saran Riset Lanjutan).
* **Dua Masalah Nyata yang Diselesaikan WASKITA:**
  1. **Gerbang Indeksasi (*Crawled - Currently Not Indexed*):** Googlebot menolak mengindeks artikel baru jika terdeteksi sebagai duplikat semantik (*near-duplicate*) yang tidak punya nilai tambah fakta dibanding halaman yang sudah ada di Google.
  2. **Gerbang Pemeringkatan (*Ranking Collapse & E-E-A-T*):** Artikel AI mentah atau saduran dangkal anjlok peringkatnya karena gagal memenuhi sinyal kualitas *Experience, Expertise, dan Trustworthiness* (E-E-A-T).

### 2. Pembaruan Arsitektur Alat Kita (WASKITA v2 — Menjawab 10 Catatan Sempro)
Pasca-Sempro, sistem sedang kita perkuat dengan mengadopsi pustaka standar industri (*Don't Reinvent the Wheel*) dan menghilangkan *hardcode* kaku:
1. **Input Adaptif & Dual-Layer Web Sanitizer:**
   - Membuka kunci kaku 300 kata menjadi **Mode Adaptif $\ge 30$ Kata Murni** (sehingga mendukung artikel pendek padat infografis/resep maupun artikel panjang > 2.500 kata).
   - Mempertahankan konteks semantik `alt text` dan `caption` media (`[gambar N: ...]`) agar masuk ke perhitungan entitas.
   - Menyaring sampah tata letak web hasil *copy-paste* (`Ctrl+A` portal berita seperti Kumparan/Detik/Kompas) dan memangkas kolom komentar pembaca blog.
2. **Akuisisi Kompetitor SERP 4-Tier Waterfall & DOM Extraction:**
   - Mengambil artikel pembanding langsung dari hasil pencarian memakai 4 jalur berjenjang: **Tier-1 `SearXNG` $\to$ Tier-2 `Serper.dev` (Google.co.id) $\to$ Tier-3 `DuckDuckGo` $\to$ Tier-4 `Offline Benchmark Corpus`**.
   - Menyaring domain non-artikel (e-commerce, medsos, PDF), mewajibkan minimal 150 kata murni, dan mengekstrak teks bersih dengan pustaka **`trafilatura`** pada **Kompetitor Organik SERP (Top-K)**.
3. **Hybrid Dual-Engine NLP Bahasa Indonesia:**
   - Menggabungkan **`nlp-id` (Kumparan)** yang memiliki kamus 778.514 lema media modern & ekstraksi *Noun Phrase* dengan fallback **`PySastrawi` + Homograph Guard** (melindungi kata seperti *berlayar, pelajar, pejabat* agar tidak salah potong).
4. **Empat (4) Mesin Ukur Matematis & Non-Compensatory Gatekeeper:**
   - **Pilar 1 — BM25-Saturated VSM (Bobot 35%):** Memakai pustaka **`rank-bm25`** ($k_1=1.5, b=0.75$) + Cosine Similarity & *Sliding Window* ($W=200$ kata) agar perbandingan panjang dokumen pendek vs panjang tetap adil.
   - **Pilar 2 — Information Gain & Konsensus Pasar (Bobot 30%):** Menghitung $\Delta_{\text{gain}}$ (entitas fakta baru di draf yang belum ada di kompetitor SERP sebagai proksi *Experience*) dan $\Delta_{\text{deficit}}$ (fakta wajib yang dibahas $\ge 2$ kompetitor dengan target saturasi 80% dan batas bawah $C_{\text{IG}} \ge 45\%$ untuk menangkal artikel hoaks/halusinasi miskin fakta).
   - **Pilar 3 — Stilometri Leksikal Adaptif (Bobot 35%: MATTR 20% + HKO 15%):** Mengukur kekayaan kosakata dengan **MATTR jendela adaptif** $W=\min(50, \lfloor N/2 \rfloor) \ge 0.55$ dan mencegah spam kata kunci di subjudul dengan **Heading-Keyword Overlap (HKO $\le 40\%$)**.
   - **Pilar 4 — Gatekeeper Veto Kontekstual (Bebas Hardcode Topik):**
     - Deteksi plagiarisme tingkat kalimat (Stabilo Merah) memakai **`datasketch` ($w$-Shingling MinHash + Broder Containment $\ge 0.72$)** untuk menangkap plagiarisme jahit (*Mosaic Plagiarism*).
     - Deteksi *Bait-and-Switch* (*Kuda Troya*) yang **SERP-Relative**: membedakan topik **Non-YMYL** (cerita budaya/horor/pengalaman pribadi yang sah) dari topik **YMYL** (medis/keuangan) yang dibelokkan ke jualan obat ajaib/kontak WA/judi di akhir naskah.

### 3. Rencana Pengujian Bab 4: 100% SYSTEM-CENTRIC (Berorientasi Sistem)
Sesuai metodologi di Bab 2.4 dan Bab 3.5, pengujian WASKITA **tidak menggunakan kuesioner subjektif (bukan SUS/skala Likert ke pengguna)**, melainkan **Evaluasi Berorientasi Sistem (*System-Centric Evaluation*)** yang terdiri dari 2 pengujian objektif:
1. **Uji Akurasi Diskriminasi via Confusion Matrix (`scikit-learn` — Powers, 2007):**
   - Menguji sistem terhadap **60 Teks Uji Riil Berimbang** (**30 Positif `Layak Terbit` vs 30 Negatif `Perlu Revisi`**) yang diberi label kunci jawaban (*Ground Truth*) berdasarkan **Rubrik Validasi Ahli 4 Pilar E-E-A-T** (*Inter-Annotator Agreement / Cohen's Kappa*).
   - Komposisi 60 teks terdiri dari **6 Teks Kontrol Normal + 54 Teks Kasus Batas (*Out-of-the-Box*)** (artikel pendek multimedia, narasi budaya/mistis non-YMYL, bahasa gaul, tutorial kode, plagiarisme jahit antar-web, hoaks miskin konsensus, kuda troya jualan, prompt AI bocor, dan copas mentah `Ctrl+A` web).
   - Menghitung metrik **Accuracy, Precision, Recall, dan F1-Score** untuk membuktikan keandalan rumus *Content Differentiation Score* ($\text{CDS} \ge 75.0$).
2. **Uji Kinerja Komputasi & Telemetri Peladen (Ho & Williams, 2006):**
   - Mengukur waktu respons (*latency*) per tahapan (`serp_ms`, `nlp_kumparan_ms`, `bm25_vsm_ms`, `gatekeeper_ms`) menggunakan **4 Log JSONL Terstruktur berbasis `loguru`**.

---

## 📱 Panduan Menyusun Pesan Chat ke Pak Ari Wibowo (Tanpa Mengklaim Sudah Selesai!)

Saat kamu menulis chat ke Pak Ari Wibowo, **lampirkan gambar `arsitektur_dan_evaluasi_waskita_v2_pak_ari.png`** di atas, lalu susun teksmu mengikuti **5 Poin Runtut** ini:

1. **Paragraf 1 — Salam & Konteks Pasca-Sempro:**
   - Sapa Pak Ari dengan sopan, sebutkan nama & NIM, serta sampaikan bahwa kamu sedang menindaklanjuti 10 poin saran perbaikan Sempro (dari Bu Sartikha dan Bu Alena) sambil mematangkan sistem dan skenario pengujian.
2. **Paragraf 2 — Penajaman Fokus SERP & Batasan Lingkup SEO:**
   - Jelaskan bahwa mengingat cakupan SEO sangat luas (ada direktori jasa, listing marketplace, alat interaktif, dan faktor off-page), fokus WASKITA dikunci pada **kurasi semantik naskah artikel teks pra-publikasi berbasis pembanding lanskap kompetitor organik Google SERP** (sedangkan halaman non-artikel seperti direktori/marketplace diposisikan sebagai batasan sistem dan saran riset lanjutan).
3. **Paragraf 3 — Update Penguatan Alat (WASKITA v2):**
   - Sampaikan bahwa saat ini kamu **sedang menyempurnakan dan mengkalibrasi** komponen sistem seperti pada gambar terlampir:
     - Pengambilan kompetitor SERP berjenjang (*4-Tier Waterfall*: SearXNG, Serper.dev, DDGS, Offline Corpus) + ekstraksi teks murni `Trafilatura` & pembersih residu `Ctrl+A` portal web/komentar blog.
     - Pemrosesan bahasa Indonesia *hybrid* menggunakan kamus `nlp-id` Kumparan (778 ribu lema) + `PySastrawi`.
     - Perhitungan *Content Differentiation Score* (CDS) dari 4 pilar: relevansi topik (`Okapi BM25` + VSM Cosine), nilai tambah informasi baru (`Information Gain` & konsensus kompetitor), variasi kosakata (`MATTR` adaptif untuk mendukung artikel pendek multimedia $\ge 30$ kata hingga artikel panjang, serta `HKO`), dan pagar pengaman (`MinHash` anti-plagiarisme kalimat & deteksi penyimpangan komersial kontekstual tanpa *hardcode* topik).
4. **Paragraf 4 — Rencana Pengujian Bab 4 yang 100% System-Centric:**
   - Jelaskan bahwa untuk pengujian di Bab 4, evaluasinya dirancang **berorientasi sistem (*system-centric*, tanpa kuesioner pengguna/SUS)** yang mencakup:
     1. **Evaluasi Akurasi via Confusion Matrix (*Precision, Recall, F1-Score*):** Saat ini kamu sedang mengumpulkan **60 teks uji riil** berlabel *Ground Truth* rubrik ahli (30 layak terbit vs 30 perlu revisi) yang mencakup 6 artikel kontrol normal dan 54 variasi kasus batas (*out-of-the-box*).
     2. **Evaluasi Kinerja Komputasi Server:** Mengukur waktu eksekusi (*latency* per modul) melalui pencatatan log telemetri terstruktur (`loguru` JSONL).
5. **Paragraf 5 — Pertanyaan Milestone Bab 4 vs Bab 5 & Permohonan Arahan:**
   - Tanyakan ke Pak Ari: *"Mohon arahan Bapak, apakah rancangan pembaruan sistem dan skenario pengujian system-centric 60 teks ini sudah sesuai untuk saya jalankan penuh ke Bab 4? Serta untuk target bimbingan dokumen berikutnya, apakah saya fokus menyusun laporan hingga Bab 4 (Hasil & Pembahasan) terlebih dahulu atau langsung dirangkai hingga Bab 5 (Kesimpulan & Saran), Pak?"*
