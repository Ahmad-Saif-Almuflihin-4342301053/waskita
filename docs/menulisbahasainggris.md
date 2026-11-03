# BLUEPRINT PENULISAN PAPER BAHASA INGGRIS, TATA BAHASA TEKNIK, & STRATEGI PUBLIKASI

Dokumen ini adalah sintesis menyeluruh (*Master Blueprint*) dari **6 literatur utama dan kurikulum resmi** yang menjadi pedoman penulisan artikel ilmiah berbahasa Inggris untuk riset rekayasa perangkat lunak dan komputasi (khususnya publikasi riset **Waskita**):

1. **RPS RPL738 – Penulisan Karya Ilmiah** (Suwarno, S.S., M.Pd., Prodi D4 TRPL Politeknik Negeri Batam, 2023/2025).
2. **Robert S. Laramee (2010)** – *How to Write a Visualization Research Paper: A Starting Point*, Computer Graphics Forum, 29(8), 2363–2371.
3. **Nicolaas E. Deutz, Nathalie Delzenne, George Grimble, & Dileep N. Lobo (2023)** – *Presentation and Publication Skills: How to Get Your Paper Published*, Clinical Nutrition ESPEN, 57, 387–390.
4. **Zhongchao Tan (2022)** – *Academic Writing for Engineering Publications: A Guide for Non-native English Speakers*, Springer Nature (17 Bab & 4 Apendiks).
5. **Adrian Wallwork (2023)** – *English for Writing Research Papers, Third Edition*, Springer Nature (20 Bab).
6. **Adrian Wallwork (2024)** – *AI-Assisted Writing and Presenting in English*, Springer Nature (10 Bab).

---

## BAGIAN 1: PETA KURIKULUM (RPS RPL738), MANAJEMEN WAKTU, & URUTAN PENULISAN PAPER

### 1.1 Pemetaan Target Mata Kuliah RPL738 (Polibatam)
Berdasarkan RPS RPL738, penulisan naskah publikasi dibagi ke dalam **4 Tujuan Pembelajaran (TP)** selama 14 minggu perkuliahan. Luaran akhirnya adalah naskah yang telah di-*submit* (atau *accepted*) di jurnal nasional terakreditasi / jurnal internasional / prosiding seminar dan diunggah ke Sistem Informasi Dosen (SID).

| Fase & Minggu | Capaian Pembelajaran (TP) | Deliverables Wajib |
| :--- | :--- | :--- |
| **TP 1 (Minggu 1–5)**<br>*(Penilaian: T1 & ATS)* | Menentukan tempat publikasi sesuai topik TA/PBL/Magang, mengkaji literatur, mengelola sitasi bebas plagiarisme, dan menyusun abstrak berbahasa Inggris akademik. | 1. Target jurnal/konferensi + *Author Guidelines* & *Template*.<br>2. Matriks kajian literatur & *database* referensi (Mendeley/Zotero).<br>3. Draf *Title* & *Working Abstract* (6–12 kalimat). |
| **TP 2 (Minggu 6–11)**<br>*(Penilaian: T2)* | Menulis hasil penelitian sesuai format/sistematika jurnal di bawah bimbingan dosen serta melengkapi dan mengevaluasi draf artikel secara utuh. | 1. *Outline* 3 Tahap (*Headings* $\rightarrow$ *Topic* $\rightarrow$ *Sentence Outline*).<br>2. Naskah lengkap (*Methods*, *Results*, *Discussion*, *Introduction*, *Conclusions*).<br>3. Siklus revisi internal bersama dosen pembimbing (*co-author*). |
| **TP 3 & TP 4 (Minggu 12–14)**<br>*(Penilaian: T3, T4, & AAS)* | Mendaftarkan (*submit*) naskah ke jurnal/prosiding dan melakukan revisi berdasarkan komentar *reviewer*. | 1. Bukti *Submission* + *Cover Letter*.<br>2. Dokumen *Point-by-Point Response to Reviewers* (*Rebuttal Letter*).<br>3. Naskah revisi bertanda (*Highlighted Revised Manuscript*) & bukti *Accepted/Upload* SID. |

### 1.2 Aturan Manajemen Waktu "2 Bulan & 4 Siklus" (Laramee, 2010)
Penulisan *paper* komputasi berstandar internasional membutuhkan waktu **minimal 2 bulan penuh** setelah sistem/eksperimen selesai dibangun:
* **Bulan ke-1 (Drafting):** Menyelesaikan draf pertama secara utuh dari awal sampai akhir, termasuk seluruh diagram arsitektur, grafik hasil, dan tabel evaluasi.
* **Bulan ke-2 (Internal Feedback Loops):** Melakukan **minimal 4 siklus umpan balik internal** (*internal review*) bersama dosen pembimbing / *co-author*. Jangan pernah mengirimkan draf mentah (siklus ke-1) langsung ke jurnal!
* **H-1 Sebelum Submission (External Proofreading):** Serahkan naskah final kepada satu pembaca eksternal yang belum pernah melihat *paper* tersebut (atau lakukan audit bahasa menyeluruh) khusus untuk menangkap kesalahan ketik (*typos*), kalimat yang melompat, dan ketidakkonsistenan penomoran gambar/sitasi.

### 1.3 Urutan Penulisan Seksi yang Benar (Wallwork, 2023; Laramee, 2010; Tan, 2022)
**JANGAN menulis *paper* secara berurutan dari *Introduction* sampai *Conclusions*!** Menulis *Introduction* di awal akan membuat kita terjebak menulis tinjauan pustaka yang melebar ke mana-mana tanpa arah. Gunakan urutan kerja rekayasa berikut:

```
[1. Working Abstract] ──► [2. 3-Stage Outline + Visuals] ──► [3. Methods] ──► [4. Results]
                                                                                   │
[8. Final Title & Abstract] ◄── [7. Conclusions] ◄── [6. Introduction] ◄── [5. Discussion]
```

1. **Tahap 1 – *Working Abstract* (6–12 Kalimat Kompas):**
   Menurut Laramee (2010), jika kita belum mampu merangkum apa yang kita kerjakan dalam 6–12 kalimat abstrak kasar, artinya fokus penelitian kita belum jelas. Tulis abstrak kasar ini sebagai kompas agar penulisan tidak melenceng.
2. **Tahap 2 – *Three-Stage Outlining* & Susun Visual (Tan, 2022 Bab 4):**
   * *Level 1 (Heading & Visual Skeleton):* Buat seluruh *Heading* dan *Subheading* sesuai *template* jurnal, lalu masukkan semua draf *Figures* (diagram arsitektur, grafik) dan *Tables* ke posisi seksinya masing-masing.
   * *Level 2 (Topic Outline):* Isi setiap sub-seksi dengan poin-poin kata kunci/agenda bahasan.
   * *Level 3 (Sentence Outline):* Ubah setiap poin menjadi **satu kalimat utuh (*Topic Sentence* / *Controlling Idea*)**. Setiap kalimat ini nantinya otomatis menjadi kalimat pertama dari satu paragraf!
3. **Tahap 3 – *Methods / System Architecture*:**
   Bagian paling mudah dan objektif untuk ditulis pertama kali karena kode, rumus, dan prosedur eksperimen sudah selesai Anda kerjakan.
4. **Tahap 4 – *Results*:**
   Deskripsikan fakta dan tren kuantitatif dari tabel serta grafik yang sudah disusun di Tahap 2.
5. **Tahap 5 – *Discussion*:**
   Interpretasikan *mengapa* hasil di Tahap 4 terjadi, bandingkan dengan studi terdahulu, dan bahas batasan sistem.
6. **Tahap 6 – *Introduction & Related Work*:**
   Setelah *Methods*, *Results*, dan *Discussion* matang, barulah tulis *Introduction*. Dengan cara ini, latar belakang, *research gap*, dan tujuan yang dijanjikan di *Introduction* dijamin 100% sinkron dengan hasil yang disajikan.
7. **Tahap 7 – *Conclusions*:**
   Sintesis temuan utama untuk menjawab tujuan yang tertulis di akhir *Introduction*.
8. **Tahap 8 – *Final Abstract & Title*:**
   Tulis ulang *Working Abstract* dan pertajam *Title* agar mencerminkan angka temuan eksak dan kontribusi final *paper*.

---

## BAGIAN 2: ARSITEKTUR MIKRO & MAKRO SETIAP SEKSI PAPER

Bagian ini membedah struktur kalimat demi kalimat untuk setiap seksi *paper* beserta contoh penerapannya pada konteks riset **Waskita** (*Pre-Publication Web Article Curation via Semantic Differentiation*).

### 2.1 Title (Judul Paper)
*(Sumber: Wallwork 2023 Bab 11; Tan 2022 Bab 9.1; Laramee 2010 Seksi 2)*

* **Aturan Struktur & Formula:**
  1. **Formula `Identifier: Technical Description` (Laramee, 2010):** Gunakan nama sistem/metode (2–3 kata yang mudah diingat) diikuti titik dua dan deskripsi teknis spesifik. Ini memudahkan komunitas riset merujuk *paper* Anda sebagai *"The Waskita Paper"*.
  2. **Posisi *Keywords* di Depan (Wallwork, 2023):** Tempatkan kata kunci paling krusial di 4–6 kata pertama judul agar tidak terpotong oleh mesin pencari (Google Scholar / Scopus).
  3. **Gunakan Preposisi yang Jelas, Hindari *Noun Strings* Panjang (Tan, 2022):** Jangan menumpuk lebih dari 3 kata benda berurutan (*"Web Article Draft Semantic Differentiation Pre-Publication Curation Software"* $\rightarrow$ buruk). Gunakan kata kerja bentuk `-ing` atau preposisi penghubung (`for`, `via`, `using`, `based on`, `in`).
  4. **Pantangan Mutlak di Judul:**
     * **HARAM** menggunakan frasa pembuka kosong yang membuang kuota kata: *A Study of..., An Investigation into..., A New Method for..., Development of...*
     * **HARAM** menggunakan kata sifat subjektif/bombastis yang tidak terukur: *novel, innovative, revolutionary, very effective, high-quality*. Ganti dengan kata sifat teknis yang konkret: *computational, multi-dimensional, dual-tier, pre-publication, rule-based*.
     * **HARAM** menggunakan kalimat tanya di judul utama jurnal komputasi (simpan kalimat tanya untuk judul poster atau presentasi lisan) dan hindari singkatan yang belum dikenal luas secara global.

* **Contoh Transformasi Judul (Konteks Waskita):**
  * ❌ **Buruk (Terjemahan Harfiah / Basi):** *A Novel Study on Developing a Software for Checking Whether Web Article Drafts Have Good Quality Based on Semantic Differentiation Using DSRM Framework* (Terlalu panjang, memakai *A Novel Study on Developing*, dan terlalu banyak kata kosong).
  * ✅ **Standar Jurnal Internasional (Opsi 1 – Berfokus Sistem):** *Waskita: Pre-Publication Curation of Web Article Drafts via Multi-Dimensional Semantic Differentiation*
  * ✅ **Standar Jurnal Internasional (Opsi 2 – Berfokus Aksi/Evaluasi):** *Quantifying Intrinsic Text Quality for Pre-Publication Web Article Curation Using Semantic Differentiation*
  * ✅ **Running Title (Maks 50 Karakter):** *Pre-Publication Curation via Semantic Metrics*

---

### 2.2 Abstract & Keywords
*(Sumber: Wallwork 2023 Bab 12–13; Tan 2022 Bab 9.3 & 9.5; Laramee 2010 Seksi 1; Deutz et al. 2023)*

Abstrak adalah bagian yang paling banyak dibaca (rasio pembaca Abstrak vs Teks Penuh adalah $>100:1$). Panjang ideal adalah **150–250 kata** (6–10 kalimat) dalam **satu paragraf utuh** (kecuali jurnal mewajibkan *Structured Abstract* dengan sub-judul).

#### A. Formula 5-Move Abstract (Proporsi Ketat)
Jangan pernah menghabiskan separuh abstrak hanya untuk menceritakan latar belakang umum! Gunakan proporsi 5 langkah berikut:

| Move | Fungsi & Pertanyaan Kunci | Proporsi Panjang | Tense Utama | Pola Frasa Pembuka (*Academic Phrasebank*) |
| :--- | :--- | :---: | :---: | :--- |
| **Move 1: Context & Specific Problem** | Mengapa masalah spesifik ini krusial dan apa kelemahan pendekatan saat ini? | **Maks 20–25%** (1–2 kalimat) | Present Simple / Present Perfect | *Automated web content workflows require... However, existing pre-publication filters rely heavily on..., which fails to capture...* |
| **Move 2: Contribution / Proposed Solution** | Apa artefak, metode, atau metrik baru yang diusulkan di *paper* ini? | **20%** (1–2 kalimat) | Present Simple (*This paper presents...*) atau Past Simple | *Here we present Waskita, a pre-publication curation framework that quantifies...* / *In this study, we propose...* |
| **Move 3: Methodology & Validation Setup** | Bagaimana sistem dibangun dan diuji? (Dataset, metrik, skenario). | **20%** (1–2 kalimat) | Past Simple (Active/Passive) | *Following the Design Science Research Methodology (DSRM), we evaluated the framework across [N] web article drafts using...* |
| **Move 4: Key Quantitative Results** | Berapa angka peningkatan akurasi/efisiensi dibandingkan *baseline*? | **25%** (2–3 kalimat) | Past Simple | *Experimental results showed that [Method] achieved a separation margin of [X]%, outperforming single-metric baselines by [Y]%...* |
| **Move 5: Impact & Implications** | Apa manfaat praktis temuan ini bagi sistem dunia nyata? | **10–15%** (1 kalimat) | Present Simple / Modal (`can`, `enables`) | *These findings demonstrate that multi-dimensional semantic gating provides a computationally lightweight barrier against low-quality web drafts.* |

#### B. Pantangan Mutlak di Abstract
1. **Haram membuka dengan kalimat pasif yang membosankan:** Jangan mulai kalimat pertama dengan *"This paper deals with..."*, *"In this paper, we discuss..."*, atau klise *"In recent years, with the rapid development of the Internet..."*. Langsung masuk ke masalah teknis di kalimat pertama!
2. **Haram mencantumkan elemen eksternal:** Tidak boleh ada nomor sitasi (`[1]`), rujukan tabel/gambar (`as shown in Fig. 1`), persamaan matematika rumit, atau singkatan yang tidak didefinisikan saat pertama kali muncul (dan jangan mendefinisikan singkatan jika istilah tersebut tidak dipakai lagi di dalam abstrak).
3. **Haram menulis klaim kosong (*Vague Results*):** Jangan menulis *"The results are discussed and shown to be very good"*. Wajib sebutkan angka konkret (*quantitative evidence*).

#### C. Aturan Keywords & Highlights
* **Keywords (5–6 Frasa):**
  * Jangan mengulang kata persis yang sudah ada di *Title* jika mesin pencari jurnal menggabungkan indeks *Title + Keywords*; gunakan sinonim teknis atau istilah payung (*broader/narrower terms*) yang dicari pembaca di Google Scholar (misal: jika judul memakai *Pre-Publication Curation*, masukkan *Information Quality Assessment*, *Text Quality Gating*, *Stylometric Analysis*, *Design Science Research*).
  * Uji setiap *keyword* di Google Scholar: apakah memunculkan *paper* di komunitas riset yang sama?
* **Highlights (Jika diminta oleh jurnal seperti Elsevier, 3–5 poin):**
  * Setiap poin maksimal **85 karakter** (termasuk spasi).
  * Gunakan kata kerja aktif yang menonjolkan kebaruan dan hasil (*"Proposes a dual-tier semantic gatekeeper for pre-publication web drafts"*, *"Reduces computational overhead by X% compared to LLM-based evaluators"*).

---

### 2.3 Introduction (Pendahuluan)
*(Sumber: Wallwork 2023 Bab 14; Tan 2022 Bab 5; Laramee 2010 Seksi 3; Deutz et al. 2023)*

Panjang ideal *Introduction* adalah **15–20% dari total panjang paper** (sekitar 4–6 paragraf atau 1–1,5 halaman). Gunakan struktur **6-Stage Funnel (Corong Menyempit)** dari Tan (2022) yang dipadukan dengan daftar kontribusi eksplisit Laramee (2010):

```
┌─────────────────────────────────────────────────────────────┐
│ Paragraf 1: BIG PICTURE & DOMAIN IMPORTANCE                 │
│   (Definisi domain + tantangan nyata di ekosistem saat ini)  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Paragraf 2–3: STATE OF THE ART & CRITICAL LIMITATIONS       │
│   (Kelompok pendekatan yang ada + kelemahan spesifiknya)    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Paragraf 4: THE KNOWLEDGE GAP & PROBLEM STATEMENT           │
│   (Celah spesifik yang belum terjawab oleh literatur)       │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Paragraf 5: OBJECTIVES (WHY) vs TASKS (HOW)                 │
│   (Tujuan ilmiah riset + ikhtisar cara kerja solusi kita)    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Paragraf 6: EXPLICIT BULLETED CONTRIBUTIONS & ROADMAP       │
│   (3–4 poin kontribusi terukur + peta navigasi seksi paper) │
└─────────────────────────────────────────────────────────────┘
```

#### Aturan Kritis di *Introduction*:
1. **Membedakan *Objectives* (Why) vs *Tasks* (How) (Tan, 2022 Bab 5.4):**
   * Kesalahan paling umum mahasiswa teknik adalah menyamakan tugas rekayasa (*Tasks*) dengan tujuan penelitian (*Objectives*).
   * *Task (How):* *"To build a software application and calculate semantic scores."* (Ini adalah aktivitas teknis/prosedur).
   * *Objective (Why):* *"To evaluate the feasibility of multi-dimensional semantic differentiation as a pre-publication gatekeeper and determine the optimal threshold configuration that separates publication-ready drafts from degraded web texts."* (Ini adalah tujuan ilmiah).
2. **Kritik Literatur secara Netral & Profesional (Wallwork, 2023 Bab 7):**
   * Saat menunjukkan kelemahan riset terdahulu (Paragraf 2–3), **HARAM** menggunakan kata bernada menghina atau emosional seperti *unfortunately, sadly, failed to, neglected, poorly designed*.
   * Gunakan kata transisi objektif: *However, prior approaches primarily focus on [X] and do not account for [Y]* atau *While [Method A] achieves high accuracy in [Context 1], its computational cost remains prohibitive for real-time pre-publication gating.*
3. **Daftar Kontribusi Eksplisit dengan *Bullet Points* (Laramee, 2010 Seksi 3):**
   * Jangan biarkan *reviewer* menebak-nebak apa kontribusi Anda. Sebelum paragraf penutup *Introduction*, tulis kalimat pengantar: *"Specifically, the main contributions of this work are threefold:"* diikuti 3–4 *bullet points* padat. Gunakan kata kunci *contribute, propose, quantify, demonstrate*.
4. **Peta Navigasi Seksi (*Paper Roadmap*) dalam *Present Simple*:**
   * Tutup *Introduction* dengan peta singkat. **Gunakan *Present Simple*, BUKAN *Future Tense (`will`)*!**
   * ✅ *"The remainder of this paper is organized as follows. Section 2 reviews related work on automated text quality assessment. Section 3 details the computational architecture of Waskita. Section 4 presents the experimental evaluation, Section 5 discusses the findings and limitations, and Section 6 concludes the paper."*

---

### 2.4 Related Work / Literature Review
*(Sumber: Wallwork 2023 Bab 15; Laramee 2010 Seksi 4; Tan 2022 Bab 5.2)*

Jika jurnal memisahkan *Related Work* ke dalam Seksi 2 tersendiri (umum di *Computer Science* dan *Software Engineering*), terapkan aturan berikut:

1. **Kelompokkan Berdasarkan Taksonomi Tema/Pendekatan, BUKAN Kronologi Tahun:**
   * Jangan menulis seperti buku sejarah (*"In 2019, A did X. In 2020, B did Y. In 2021, C did Z."*).
   * Bagi menjadi 2–3 sub-kategori logis (misal: *2.1 Heuristic & Readability Filtering*, *2.2 Deep Learning & LLM-Based Quality Scoring*, *2.3 Multi-Dimensional Semantic Differentiation*).
2. **Struktur 4-Lapis di Setiap Paragraf *Related Work* (Wallwork, 2023 Bab 15.3):**
   * *Kalimat 1 (Topic Sentence):* Perkenalkan kategori pendekatan dan ide utamanya.
   * *Kalimat 2–4 (Synthesis of Prior Works):* Bandingkan 2–4 referensi kunci (2–3 kalimat per karya/kelompok karya).
   * *Kalimat 5 (Contrastive Positioning – Laramee Rule):* Nyatakan secara eksplisit **apa bedanya karya kita dibandingkan kelompok referensi tersebut** (*"In contrast to these post-hoc ranking models, our work operates as a deterministic pre-publication gatekeeper..."*).
3. **Aturan Emas Sitasi Nama Penulis (Laramee, 2010 Seksi 4):**
   * **JANGAN PERNAH menjadikan nomor kurung siku sebagai subjek atau objek kalimat!**
     * ❌ Salah: *"[4] shows that web spam is increasing."* atau *"In [7, 8], they proposed a new metric."*
     * ✅ Benar: *"Bevendorff et al. [4] demonstrate that..."* atau *"Recent studies by Chang et al. [7] and Putra [8] propose..."*
   * **Alasan Strategis Laramee:** Editor jurnal sangat sering memilih nama-nama yang Anda sitasi di *Related Work* sebagai *Reviewer* naskah Anda! Menyebut nama mereka secara hormat dan akurat di dalam kalimat prosa (bukan sekadar angka anonim `[4]`) membangun impresi psikologis yang sangat positif.
4. **6 Teknik Parafrasa Bebas Plagiarisme (Wallwork, 2023 Bab 15.10–15.11):**
   Jangan pernah menyalin $>5$ kata berurutan dari sumber lain (atau dari *paper* Anda sendiri / *self-plagiarism*). Kombinasikan minimal 3 dari 6 langkah ini saat memparafrasa:
   1. **Ubah urutan informasi dalam kalimat:** Jika kalimat asli menggunakan pola `Sebab -> Akibat`, ubah menjadi `Akibat <- disebabkan oleh Sebab`.
   2. **Ubah kelas kata (*Word Class Shift*):** Ubah kata kerja menjadi kata benda atau kata sifat (misal: *analyzed the distribution* $\rightarrow$ *distributional analysis*).
   3. **Gunakan sinonim HANYA untuk kata umum (*Non-Key Words*):** Ubah kata kerja/keterangan umum (*investigated* $\rightarrow$ *examined*), tetapi **JANGAN PERNAH mengubah istilah teknis baku (*technical keywords*)**!
   4. **Ubah bentuk kalimat (*Active $\leftrightarrow$ Passive*):** *Smith [2] measured X* $\rightarrow$ *X was quantified by Smith [2]*.
   5. **Ubah tunggal $\leftrightarrow$ jamak:** *A web draft exhibits...* $\rightarrow$ *Web drafts exhibit...*
   6. **Gabungkan ide dari $\ge 2$ *paper* ke dalam satu kalimat sintesis.**

---

### 2.5 Methods / System Architecture / Experimental Setup
*(Sumber: Wallwork 2023 Bab 16; Tan 2022 Bab 6; Laramee 2010 Seksi 5)*

Menurut Tan (2022) dan Wallwork (2023), seksi *Methods* harus ditulis seperti **"Buku Manual Replikabilitas"** sehingga peneliti lain yang memiliki kompetensi setara dapat membangun ulang sistem dan mengulangi eksperimen Anda dengan hasil yang konsisten.

#### A. Arsitektur *Divide-and-Conquer* (Laramee, 2010 Seksi 5)
1. **Mulai dengan *Subsection 3.1: Architecture / Method Overview* + Diagram Pipa Konseptual:**
   * Tempatkan satu **Diagram Alir Konseptual (*System Pipeline Diagram*)** yang bersih di bagian atas halaman pertama seksi *Methods*.
   * Berikan nomor atau label yang jelas pada setiap blok di dalam diagram tersebut (misal: *Stage 1: Text Preprocessing & Normalization*, *Stage 2: Multi-Dimensional Feature Extraction*, *Stage 3: Semantic Differentiation & Gating*).
2. **Korespondensi 1-ke-1 antara Diagram dan Sub-Seksi:**
   * Setiap blok di dalam diagram wajib menjadi satu sub-seksi tersendiri (`3.2 Stage 1: ...`, `3.3 Stage 2: ...`, `3.4 Stage 3: ...`). Ini membuat struktur *paper* sangat terorganisir dan mudah diikuti *reviewer*.

#### B. 5 Komponen Wajib dalam *Methods* Komputasi (Tan, 2022 Bab 6.1 & Laramee, 2010 Seksi 5.1)
1. **Formulasi Matematis & Metrik Pengatur (*Governing Equations*):**
   * Tuliskan rumus skor/metrik secara eksplisit. Jelaskan alasan teoretis mengapa rumus/metrik tersebut dipilih, bukan sekadar menempelkan rumus.
2. **Asumsi & Batasan Desain (*Explicit Assumptions & Justifications*):**
   * Nyatakan setiap asumsi atau penyederhanaan yang dipakai sistem beserta alasannya (misal: *"We assume input drafts are written in standard Indonesian or English prose of at least 150 words, as shorter snippets lack sufficient lexical variance for stable entropy estimation"*).
3. **Sub-Seksi Khusus *Parameters & Thresholds* (Laramee Rule):**
   * Buat penjelasan eksplisit atau tabel kecil yang merinci seluruh parameter sistem (misal: bobot $\alpha, \beta, \gamma$, nilai ambang batas *threshold* $\tau$), rentang nilainya (*range*), serta nilai *default* yang digunakan dalam eksperimen beserta cara kalibrasinya.
4. **Dataset & Prosedur Pengujian (*Experimental Protocol*):**
   * Rinci sumber data, jumlah sampel ($N$), kriteria inklusi/eksklusi sampel, pembagian kelas (*gold-standard* vs *degraded/synthetic*), serta metrik evaluasi eksternal yang digunakan untuk memvalidasi sistem.
5. **Lingkungan Komputasi (*Implementation Details*):**
   * Sebutkan bahasa pemrograman, versi pustaka (*library*) utama, dan spesifikasi perangkat keras tempat pengujian dijalankan demi menjamin *reproducibility*.

#### C. Aturan Gaya Bahasa di *Methods*
* **Selalu mulai dengan Tujuan sebelum Tindakan (*Purpose before Action* – Wallwork 2023 Bab 16.5):**
  * ❌ Kurang jelas: *"The text was tokenized and stop words were removed."* (Pembaca bertanya: untuk apa?)
  * ✅ Jelas: *"To eliminate syntactic noise prior to lexical diversity calculation, raw drafts were tokenized and filtered using..."*
* **Jangan menulis seperti Daftar Belanja (*Shopping List*):** Gunakan kata hubung urutan logis (*First, Subsequently, Once the feature vector is constructed, Finally*) dan batasi maksimal 1–2 langkah prosedur dalam satu kalimat.

---

### 2.6 Results (Hasil Eksperimen)
*(Sumber: Wallwork 2023 Bab 17; Tan 2022 Bab 7 & 14; Laramee 2010 Seksi 6; Deutz et al. 2023)*

#### A. Prinsip Seleksi Data ("Analogi Piala Dunia" Wallwork, 2023 Bab 17.1)
* Laporan tesis/TA menuntut seluruh data mentah ditampilkan, tetapi **artikel jurnal menuntut kurasi hanya pada *highlights* yang menjawab *Research Objectives***.
* Urutkan sub-seksi *Results* mengikuti urutan *Objectives* atau tahapan di *Methods*:
  1. Hasil utama (*Primary Endpoint* – Deutz et al., 2023).
  2. Hasil sekunder / studi ablasi (*Ablation / Component Contribution*).
  3. Analisis sensitivitas parameter / kasus batas (*Edge Cases & Negative Results*).
* **Kejujuran Ilmiah (Feynman & Goldacre dalam Wallwork Bab 17.3):** Jangan pernah menyembunyikan anomali atau kasus di mana sistem gagal (*false positives / false negatives*). Melaporkan di mana metode kita mulai menurun performanya justru meningkatkan kepercayaan *reviewer* secara drastis.

#### B. Aturan Emas "Show, Don't Tell" (Lertzman / Wallwork Bab 17.6–17.8)
**JANGAN PERNAH menjadikan "Figure X" atau "Table Y" sebagai subjek kalimat yang kosong, dan JANGAN menyalin ulang deretan angka yang sudah terlihat jelas di dalam tabel!**

| ❌ Kalimat Buruk (*"Tell / Pointer Sentences"*) | ✅ Kalimat Standar Internasional (*"Show / Claim-First Sentences"*) |
| :--- | :--- |
| *"Table 2 shows the evaluation results of our system across three datasets."* (Kalimat tanpa informasi; memaksa pembaca mencari sendiri artinya di tabel). | *"Multi-dimensional semantic gating reduced false-positive acceptance by 24.6% compared to the readability-only baseline (Table 2)."* (Klaim & tren menjadi subjek utama; tabel di dalam kurung sebagai bukti). |
| *"As can be seen in Figure 3, the score of Group A is 0.82, Group B is 0.65, and Group C is 0.41, which is very interesting."* (Mengulang angka mentah + komentar subjektif *very interesting*). | *"Publication-ready articles consistently exhibited higher semantic differentiation scores than machine-spun drafts ($0.82 \pm 0.04$ vs. $0.41 \pm 0.07$, $p < 0.001$; Fig. 3)."* |

---

### 2.7 Discussion (Pembahasan)
*(Sumber: Wallwork 2023 Bab 18; Tan 2022 Bab 7; Deutz et al. 2023)*

Jika *Results* menjawab **"What happened?"** (fakta data), maka *Discussion* wajib menjawab **"Why did it happen and what does it mean?"** (mekanisme kausal, komparasi, dan generalisasi).

#### A. Formula RECA untuk Menyusun Paragraf *Discussion* (Tan, 2022 Bab 7.2)
Setiap temuan utama di *Discussion* harus dibedah menggunakan siklus 4 langkah **RECA**:
1. **R – Reiteration (Penegasan Tren Utama):** Nyatakan kembali temuan kunci secara ringkas tanpa mengulang tabel (*"Our experiments indicate that combining structural coherence with lexical entropy provides the strongest discriminatory power..."*).
2. **E – Explanation (Penjelasan Mekanisme Kausal):** Jelaskan secara teoretis/mekanistik *mengapa* hal itu terjadi (*"This behavior occurs because low-quality web drafts often mimic surface-level readability formulas by using short sentences, yet fail to maintain topic-level semantic progression across paragraphs..."*).
3. **C – Comparison (Komparasi Internal & Literatur):** Bandingkan temuan tersebut dengan studi terdahulu yang sudah diperkenalkan di *Introduction / Related Work*.
   * **Aturan Ketat Deutz et al. (2023):** **HARAM** memunculkan hasil eksperimen baru di *Discussion* (semua angka hasil wajib sudah muncul di *Results*), dan **HARAM** tiba-tiba membahas topik literatur baru yang sama sekali belum disinggung di *Introduction*!
4. **A – Analysis & Deduction (Generalisasi & Implikasi):** Tarik pelajaran umum atau implikasi desain dari temuan tersebut (*"Consequently, pre-publication curation systems should treat surface readability as a necessary but insufficient condition..."*).

#### B. 5 Langkah Membandingkan Temuan Kita dengan Literatur (Wallwork, 2023 Bab 18.5)
Agar *reviewer* tidak pernah bingung membedakan mana temuan Anda dan mana temuan orang lain, gunakan struktur pemisah yang tegas:
1. Nyatakan temuan Anda (gunakan **Past Simple** + penanda eksplisit `In our experiments, we found that...`).
2. Sebutkan temuan peneliti lain (gunakan `This finding aligns with / contrasts with Smith et al. [12], who reported that...`).
3. Jelaskan titik temu atau perbedaannya secara spesifik.
4. Jelaskan *mengapa* perbedaan itu muncul (misal: perbedaan karakteristik dataset web vs teks akademik).
5. Nyatakan kontribusi/kesimpulan baru yang lahir dari perbandingan tersebut.

#### C. 5 Langkah Menangani Alternatif Interpretasi & *Reviewer Skepticism* (Enquist / Wallwork Bab 18.6)
Antisipasi kritik *reviewer* sebelum mereka menanyakannya:
1. Akui adanya kemungkinan penjelasan alternatif (*"One might argue that the observed score drop is merely an artifact of document length..."*).
2. Jelaskan logika argumen alternatif tersebut secara adil.
3. Akui bagian data yang sekilas tampak mendukung argumen itu.
4. Berikan bukti empiris/kontrol eksperimen yang mematahkan argumen tersebut (*"However, length-normalized ablation tests in Section 4.3 confirm that the separation margin remains above 19% across all length buckets..."*).
5. Tegaskan kembali validitas kesimpulan Anda.

#### D. Membahas *Limitations* Tanpa Merusak Kredibilitas (Wallwork 2023 Bab 7 & 18.7; Tan 2022 Bab 7.3)
* Tempatkan pembahasan *Limitations* di sub-seksi menjelang akhir *Discussion* (tetapi **JANGAN PERNAH mengakhiri seluruh *paper* dengan kalimat kelemahan!**).
* Gunakan struktur pembingkaian positif (`Although [Limitation], [Mitigation / Future Direction]`):
  * ❌ Merusak diri sendiri: *"Unfortunately, our software failed to process multilingual articles and the dataset was too small."*
  * ✅ Konstruktif & Ilmiah: *"While the current evaluation focuses on Indonesian and English web drafts ($N = \dots$), the underlying semantic differentiation metrics rely on language-agnostic distributional properties and can be extended to multilingual corpora by substituting the tokenizer module."*

---

### 2.8 Conclusions (Kesimpulan)
*(Sumber: Wallwork 2023 Bab 19; Tan 2022 Bab 8)*

Panjang ideal *Conclusions* adalah **1–2 paragraf (150–250 kata)**. Banyak *reviewer* membaca *Title $\rightarrow$ Abstract $\rightarrow$ Figures $\rightarrow$ Conclusions* terlebih dahulu sebelum membaca tubuh *paper*.

1. **Bukan *Copy-Paste* dari Abstract (Tan, 2022 Bab 8.1):**
   * *Abstract* adalah iklan undangan yang merangkum keseluruhan *paper* (Why–How–What) untuk pembaca yang belum membaca isi *paper*.
   * *Conclusions* adalah penutup untuk pembaca yang sudah memahami metode Anda; fokusnya adalah **menjawab langsung *Objectives* yang dijanjikan di akhir *Introduction*** dan menyimpulkan nilai guna ilmiahnya.
2. **Langsung ke Inti di Kalimat Pertama (Wallwork, 2023 Bab 19.4):**
   * Hapus kalimat pembuka basi seperti *"In conclusion, in this study we have investigated..."*. Langsung buka dengan sintesis kontribusi: *"This study has demonstrated that multi-dimensional semantic differentiation effectively filters low-quality web drafts prior to publication."*
3. **5 Elemen Urutan *Conclusions*:**
   1. Sintesis jawaban atas *Research Objectives* utama (gunakan *Present Perfect*: `We have presented / demonstrated...`).
   2. Ringkasan bukti kuantitatif paling menentukan (gunakan *Past Simple*: `Experimental evaluation showed...`).
   3. Implikasi praktis bagi pengelola platform web / industri rekayasa perangkat lunak.
   4. Batasan ruang lingkup secara singkat (1 klausa anak kalimat).
   5. Arah riset lanjutan yang **spesifik dan dapat dieksekusi** (jangan menulis kalimat kabur *"In the future, we will improve our system"*; tuliskan spesifik: *"Future work will integrate cross-paragraph entity graph tracking to detect factual hallucinations alongside semantic degradation"*).
4. **Pantangan Mutlak di *Conclusions* (Tan, 2022 Bab 8.2):**
   * **HARAM** memasukkan sitasi referensi (`[1]`), persamaan matematika, tabel/gambar, atau singkatan baru yang tidak didefinisikan ulang.

---

## BAGIAN 3: ATURAN BAHASA INGGRIS AKADEMIK & TEKNIK (GRAMMAR, STYLE, & FORMATTING GUARDRAILS)

Bagian ini merangkum aturan tata bahasa dan gaya penulisan sains-rekayasa dari **Zhongchao Tan (2022, Bab 10–16)** dan **Adrian Wallwork (2023, Bab 2–8)**.

### 3.1 Peta Penggunaan *Tenses* di Seluruh Paper
Kesalahan *tenses* paling sering terjadi karena mencampuradukkan *Past Simple* dan *Present Simple*. Gunakan matriks keputusan berikut:

| Seksi Paper | Fungsi Kalimat | Tense yang WAJIB Dipakai | Contoh Kalimat Benar |
| :--- | :--- | :---: | :--- |
| **Abstract** | Fakta umum domain & tujuan *paper* ini | **Present Simple** | *Pre-publication curation plays a critical role... This paper presents Waskita...* |
| **Abstract** | Prosedur eksperimen & angka hasil temuan kita | **Past Simple** | *We evaluated 500 drafts... The framework reduced false positives by 24%.* |
| **Introduction & Related Work** | Kebenaran ilmiah umum / definisi konsep | **Present Simple** | *Shannon entropy measures the unpredictability of information content.* |
| **Introduction & Related Work** | Tren riset dari masa lalu hingga saat ini (*to date, recently, over the past decade*) | **Present Perfect** | *Several studies have investigated automated text scoring [1–4].* |
| **Introduction & Related Work** | Studi spesifik yang **tahunnya disebut eksplisit** atau metode masa lalu yang spesifik | **Past Simple** | *In 2023, Deutz et al. [5] identified core publication barriers.* |
| **Introduction** | Peta organisasi seksi *paper* (*Roadmap*) | **Present Simple** *(Bukan `will`!)* | *Section 3 describes the system architecture, and Section 4 presents...* |
| **Methods** | Cara kerja algoritma, rumus matematika, dan arsitektur sistem yang berlaku permanen | **Present Simple** | *Equation (2) computes the lexical variance, where $\alpha$ denotes... The gatekeeper rejects drafts when...* |
| **Methods** | Prosedur pengumpulan data, pra-pemrosesan dataset, dan pengujian yang sudah dilakukan | **Past Simple** *(Passive/Active)* | *A corpus of 300 articles was collected and annotated by three raters.* |
| **Results** | Menunjuk ke Tabel/Gambar (`shows, summarizes, illustrates`) | **Present Simple** | *Figure 4 illustrates the score distribution across three quality tiers.* |
| **Results** | Melaporkan temuan eksperimen kita sendiri (`found, observed, achieved, decreased`) | **Past Simple** *(Wajib!)* | *The dual-tier filter achieved an F1-score of 0.89, whereas the baseline reached 0.71.* |
| **Discussion** | Menginterpretasikan makna universal / mekanisme teoretis dari hasil | **Present Simple** | *This gap indicates that surface readability does not guarantee semantic depth.* |
| **Conclusions** | Menyatakan apa yang telah berhasil dicapai oleh *paper* ini secara keseluruhan | **Present Perfect** | *We have developed and validated a pre-publication curation framework...* |

---

### 3.2 Arsitektur Kalimat & Paragraf (Aturan Panjang & Struktur SEC)
1. **Target Panjang Kalimat (15–20 Kata, Maksimal Mutlak 25–30 Kata):**
   * Pembaca akademik internasional kehilangan fokus jika satu kalimat melebihi 30 kata atau memuat lebih dari 2 gagasan.
   * **Teknik Kalimat Pendek Penekan (*Short Punchy Sentence* – Wallwork 2023 Bab 3.8):** Setelah menulis 1–2 kalimat penjelasan yang agak panjang (20–25 kata), selipkan satu kalimat pendek (6–10 kata) untuk menonjolkan kesimpulan kunci.
2. **Aturan Urutan Kata (*Strict SVO Word Order* – Wallwork Bab 2):**
   * Jaga agar **Subject (S)** dan **Verb (V)** sedekat mungkin! Jangan memisahkan Subjek dan Kata Kerja dengan klausa anak kalimat yang panjang.
   * ❌ Buruk (S dan V terpisah 14 kata): *"The semantic score, which was calculated using three different linguistic modules across all web article drafts in our dataset, **was** higher than the baseline."*
   * ✅ Baik (S dan V berdampingan): *"The semantic score **exceeded** the baseline across all evaluated web article drafts when computed using the three linguistic modules."*
3. **Rumus Paragraf `SEC` (Statement – Evidence – Conclusion) (Tan, 2022 Bab 11):**
   * **Kalimat 1 = *Statement* (*Topic Sentence* / *Controlling Idea*):** Kalimat pertama dari setiap paragraf **WAJIB** merangkum klaim utama paragraf tersebut. Pembaca cepat harus bisa memahami seluruh isi *paper* hanya dengan membaca kalimat pertama dari setiap paragraf!
   * **Kalimat 2–5 = *Evidence*:** Penjelasan teknis, data angka, rujukan gambar/tabel, atau sitasi literatur yang membuktikan *Kalimat 1*.
   * **Kalimat Terakhir = *Conclusion / Bridge*:** Kalimat penutup yang menyimpulkan dampak bukti tersebut atau menjembatani ke paragraf berikutnya.
   * **Ukuran Paragraf Ideal:** 75–150 kata (4–7 kalimat, atau 8–12 baris tercetak). **Haram** membuat paragraf yang hanya terdiri dari 1 kalimat!

---

### 3.3 Konsistensi Kosakata & Anti-Ambiguitas
1. **Aturan *Anti-Monologophobia / Synonymomania* (Wallwork 2023 Bab 5.3; Tan 2022 Bab 10.7):**
   * Di pelajaran mengarang sastra sekolah, kita diajarkan untuk mengganti-ganti kata dengan sinonim agar tidak bosan. **Dalam penulisan *paper* rekayasa/komputasi, mengganti istilah teknis dengan sinonim adalah KESALAHAN FATAL!**
   * Jika Anda menamakan komponen Anda `pre-publication gatekeeper`, jangan mengubahnya di paragraf berikutnya menjadi `draft filter`, lalu `article screener`, lalu `quality controller`. *Reviewer* akan bingung dan mengira Anda sedang membahas 4 modul perangkat lunak yang berbeda!
   * **Aturan Baku:** Gunakan **1 istilah yang persis sama 100%** untuk setiap konsep/komponen teknis dari judul hingga kesimpulan. Variasi sinonim hanya boleh dipakai untuk kata kerja umum (*demonstrates, indicates, reveals*).
2. **Larangan Kata Ganti Ambigu (*Naked Pronouns*: `It`, `This`, `They`, `The former/latter`):**
   * Jangan pernah memulai kalimat dengan kata `This shows that...` atau `It is caused by...` tanpa kata benda penjelas, karena pembaca tidak tahu `This` atau `It` merujuk pada kata benda yang mana di kalimat sebelumnya.
   * **Solusi:** Selalu ikuti `This / These` dengan kata benda spesifik: *"This degradation shows that..."*, *"These threshold values indicate..."*.
   * Hindari penggunaan *"the former"* dan *"the latter"* karena memaksa pembaca berhenti dan membaca ulang kalimat sebelumnya; sebutkan saja langsung namanya.
3. **Aturan `that` vs `, which` (Tan, 2022 Bab 12.9; Wallwork, 2023 Bab 5.8):**
   * Gunakan **`that` (tanpa koma)** untuk klausa pembatas (*restrictive clause* — jika klausa ini dihapus, arti kalimat berubah/salah): *"Drafts **that** fall below the threshold $\tau$ are rejected."* (Hanya draf yang di bawah $\tau$ yang ditolak).
   * Gunakan **`, which` (WAJIB diawali koma)** untuk informasi tambahan (*non-restrictive clause* — sekadar info pelengkap): *"The pipeline computes lexical entropy**, which** quantifies vocabulary richness."*
4. **Aturan Akhiran `-ing` (*Dangling Participles*): `by + -ing` vs `thus + -ing` (Wallwork Bab 5.10–5.11):**
   * Akhiran `, ...-ing` di ujung kalimat sangat ambigu karena bisa berarti "dengan cara" (*method*) atau "sehingga menghasilkan" (*consequence*).
   * ❌ Ambigu: *"The algorithm normalizes sentence lengths, reducing false positives."*
   * ✅ Jika maksudnya **Cara (*Method*)**, gunakan **`by + -ing`**: *"The algorithm reduces false positives **by normalizing** sentence lengths."*
   * ✅ Jika maksudnya **Akibat (*Result*)**, gunakan **`thus + -ing`** atau **`which + verb`**: *"The algorithm normalizes sentence lengths, **thus reducing** (atau **which reduces**) false positives."*

---

### 3.4 *Verb-Based Writing* vs *Nominalization* & Kata Terlarang
Penulisan teknik yang kuat mengandalkan **kata kerja aktif yang spesifik**, bukan tumpukan kata benda abstrak (*nominalization* berakhiran `-tion, -ment, -ance, -ity`).

| Kategori Masalah | ❌ Bentuk Lemah / Terlarang (Hindari!) | ✅ Bentuk Kuat & Presisi (Gunakan Ini!) |
| :--- | :--- | :--- |
| **Nominalization (Kata Benda + Kata Kerja Lemah)** | *perform an evaluation of*<br>*make a calculation of*<br>*carry out an investigation into*<br>*lead to a reduction in*<br>*provide a description of* | *evaluate*<br>*calculate / compute*<br>*investigate / examine*<br>*reduce*<br>*describe* |
| **Empty Generic Nouns (Kata Benda Kosong)** | *The filtering process is fast.*<br>*Displays a degradation phenomenon.*<br>*Has a complex nature.* | *Filtering is fast.*<br>*Degrades.*<br>*Is complex.* |
| **Wordy Phrases (Frasa Bertele-tele)** | *due to the fact that / in light of the fact that*<br>*in order to / for the purpose of*<br>*a large number of / a majority of*<br>*at the present time / in recent years*<br>*it is worth noting that / it can be seen that* | *because / since*<br>*to*<br>*many / most*<br>*currently / recently*<br>*(Hapus langsung! Langsung tulis klaimnya)* |
| **Subjective / Emotional Words (Kata Subjektif & Emosional)** | *very, extremely, really, obviously, clearly, surprisingly, unfortunately, good, bad, ideal, agree very well* | Ganti dengan angka eksak (*"differs by less than 1.8%"*) atau adverbia terukur (*substantially, marginally, consistently*). |
| **Jebakan Kata `Significant` (Tan Bab 13.7)** | *"The score increased significantly"* (tanpa uji statistik!). | Kata **`significant / significantly`** **HANYA** boleh dipakai jika disertai bukti statistik ($p < 0.05$). Jika tanpa uji-$p$, gunakan **`substantial / markedly / considerable`**. |
| **Kontraksi & Informalitas** | *don't, doesn't, can't, isn't, a lot of, plenty of, get, big, stuff, etc.* | *do not, does not, cannot (satu kata!), is not, numerous, obtain/achieve, large, dan jangan pernah menulis `etc.` (gunakan `such as A, B, and C`).* |

---

### 3.5 Aturan Format Teknis: Angka, Satuan SI, Persamaan Matematika, Tabel, & Gambar
*(Sumber: Tan 2022 Bab 11, 14, 15, 16; Laramee 2010)*

1. **Penulisan Angka (Tan Bab 11):**
   * **Eja dengan huruf (`one` s.d. `ten`)** untuk bilangan bulat $0\text{--}10$ yang tidak diikuti satuan pengukuran (*"three linguistic dimensions"*, *"five evaluators"*).
   * **Gunakan angka Arab (`11, 12, ...`)** untuk bilangan $\ge 11$, semua angka desimal (`0.85`), persentase (`24%`), penomoran (`Fig. 2`, `Stage 1`), dan semua angka yang diikuti satuan SI (`5 ms`, `8 GB`).
   * **LARANGAN MUTLAK:** Jangan pernah memulai kalimat dengan angka digit!
     * ❌ Salah: *"300 web article drafts were collected from..."*
     * ✅ Benar: *"A total of 300 web article drafts were collected..."* atau *"Three hundred web article drafts were collected..."*
2. **Penulisan Satuan SI (Tan Bab 11):**
   * Wajib beri **1 spasi** antara angka dan simbol satuan (`20 ms`, `100 MB`, `300 K`), kecuali untuk simbol persen (`24%`) dan derajat sudut (`45°`).
   * Simbol satuan **tidak pernah** diberi akhiran `-s` untuk jamak dan tidak diberi titik (`50 s`, bukan `50 secs.`).
3. **Penulisan Persamaan Matematika (*Equations* – Tan Bab 15):**
   * Setiap persamaan adalah bagian dari kalimat tata bahasa. Jangan menaruh tanda titik dua (`:`) sebelum persamaan jika kalimat pengantarnya berakhir dengan kata kerja atau preposisi seperti `is`, `gives`, `by`, `as`:
     ```markdown
     The composite semantic differentiation score $S_{\text{total}}$ is defined as
     $$S_{\text{total}} = \alpha D_{\text{lex}} + \beta C_{\text{struct}} + \gamma E_{\text{sem}}$$   (1)
     where $D_{\text{lex}}$ denotes lexical diversity, $C_{\text{struct}}$ represents structural coherence, and $\alpha, \beta, \gamma$ are non-negative weighting coefficients satisfying $\alpha + \beta + \gamma = 1$.
     ```
   * Kata **`where`** tepat di bawah persamaan wajib ditulis dengan **huruf kecil (`w`)** dan **rata kiri (tanpa indentasi paragraf baru)**.
   * Seluruh simbol variabel tunggal ($x, N, \alpha, \tau$) wajib dicetak **miring (*italic*)** baik di dalam blok persamaan maupun ketika disebut di dalam paragraf teks! Sebaliknya, nama fungsi baku ($\log, \exp, \max, \min$) dan indeks label deskriptif ($\text{total}, \text{max}, \text{baseline}$) dicetak **tegak (Roman)**.
4. **Standar Tabel & Gambar (*Figures & Tables* – Tan Bab 14 & Laramee 2010):**
   * **Posisi *Caption*:** Judul/keterangan **Tabel (*Table Caption*) wajib di ATAS tabel**; keterangan **Gambar (*Figure Caption*) wajib di BAWAH gambar**.
   * **Kemandirian Visual (*Self-Contained Rule* – Laramee):** Setiap Gambar dan Tabel beserta *caption*-nya harus bisa dipahami 100% oleh *reviewer* yang membolak-balik halaman tanpa harus membaca teks tubuh *paper*. Jelaskan arti singkatan, satuan, dan apa yang harus diperhatikan pembaca langsung di dalam *caption*!
   * **Aturan Grafik Data Diskret vs Model (Tan Bab 14):** Gunakan **simbol titik/marker (*dots/markers*)** untuk titik data observasi/eksperimen diskret, dan gunakan **garis (*solid/dashed lines*)** untuk fungsi model matematis, regresi, atau batas *threshold* kontinu. Selalu gunakan latar belakang putih bersih tanpa *gridlines* gelap yang mengganggu, dan pastikan ukuran huruf di dalam gambar setara dengan ukuran huruf teks tubuh saat dicetak.
   * **Cara Merujuk di Teks:** Gunakan `Table 1` (jangan pernah disingkat `Tab. 1`!), `Figure 1` jika di awal kalimat, dan `Fig. 1` (atau `Figs. 1 and 2`) jika di tengah kalimat. Jangan gunakan kata sandang `the` di depan nomor gambar/tabel (*"as shown in Fig. 2"*, bukan *"as shown in the Fig. 2"*).

---

## BAGIAN 4: SOP PEMANFAATAN AI & MACHINE TRANSLATION TANPA TERJEBAK GAYA ROBOTIK

Bagian ini menyarikan panduan praktis dari buku terbaru **Adrian Wallwork (2024), *AI-Assisted Writing and Presenting in English*** dan **Wallwork (2023, Bab 9–10)** agar penggunaan alat bantu AI (ChatGPT, Claude, Gemini, DeepL, Writefull) meningkatkan kualitas bahasa tanpa merusak keaslian ilmiah atau memicu detektor "bahasa robotik AI".

### 4.1 Dua Jalur Kerja (*Workflow*) yang Direkomendasikan Wallwork

#### Jalur A: Menulis Draf dalam Bahasa Indonesia $\rightarrow$ *Pre-Editing* $\rightarrow$ DeepL/Google Translate $\rightarrow$ AI Polishing
Jika Anda menyusun pemikiran awal dalam Bahasa Indonesia, **JANGAN langsung menyalin paragraf Bahasa Indonesia yang panjang dan berbelit-belit ke mesin penerjemah!** Lakukan **7 Aturan Pre-Editing Bahasa Indonesia** berikut sebelum diterjemahkan:
1. **Pecah kalimat panjang:** Pastikan satu kalimat Bahasa Indonesia maksimal 15–20 kata dan hanya memuat 1–2 klausa.
2. **Gunakan struktur S–P–O–K yang tegas:** Setiap kalimat wajib memiliki Subjek yang jelas (hindari kalimat tanpa subjek seperti *"Dalam pengujian ini menunjukkan bahwa..."* $\rightarrow$ ubah menjadi *"Pengujian ini menunjukkan bahwa..."*).
3. **Tulis istilah teknis langsung dalam Bahasa Inggris di tengah kalimat Indonesia:** Jangan menerjemahkan istilah baku komputasi ke Bahasa Indonesia lalu membiarkan mesin menerjemahkannya balik secara salah (Contoh: tulis *"Modul `pre-publication gatekeeper` menghitung `lexical entropy` dan `semantic differentiation` pada setiap draf"*).
4. **Ganti kata ganti *"itu / tersebut / hal ini / mereka"* dengan kata bendanya langsung:** Ubah *"Nilai itu kemudian dibandingkan..."* menjadi *"Nilai ambang batas $\tau$ tersebut kemudian dibandingkan..."*.
5. **Hapus kata mubazir Indonesia:** Coret frasa seperti *Adapun, perlu diketahui bahwa, di mana (yang bukan kata tanya), dalam rangka untuk, oleh karena itu maka*.
6. **Gunakan kalimat aktif:** *"Kami mengevaluasi..."* atau *"Sistem menolak..."* jauh lebih akurat diterjemahkan mesin daripada kalimat pasif berantai *"Dilakukannya pengevaluasian terhadap..."*.
7. **Larangan *Back-Translation*:** Setelah teks menjadi Bahasa Inggris, **jangan pernah mengecek kualitasnya dengan menerjemahkannya kembali ke Bahasa Indonesia!** Evaluasi langsung teks Bahasa Inggrisnya.

#### Jalur B: Menulis Langsung dalam Bahasa Inggris (*Chunking*) $\rightarrow$ *Constrained AI Editing*
Tulis draf langsung dalam Bahasa Inggris per potongan (*chunk*) **150–400 kata (1–3 paragraf)**, lalu gunakan *prompt* terbatas (*constrained prompt*) agar AI hanya memperbaiki tata bahasa tanpa merombak struktur argumen Anda.

---

### 4.2 Trik *ALL CAPS Keyword Locking* & Audit *Track Changes* (Wallwork, 2024 Bab 2–3)
Kelemahan terbesar LLM/Chatbot saat mengedit naskah akademik adalah:
1. Mengganti istilah teknis spesifik Anda dengan sinonim generik (*synonymomania*).
2. Mengubah klaim kepemilikan `our previous study / our method` menjadi pasif anonim `a previous study / the method`, sehingga *reviewer* tidak sadar bahwa itu adalah hasil karya Anda sendiri!

**Solusi Praktis Wallwork (2024):**
* **Trik HURUF KAPITAL (*ALL CAPS Locking*):** Sebelum memasukkan paragraf ke AI, ubah istilah teknis utama Anda menjadi HURUF KAPITAL (misal: `PRE-PUBLICATION CURATION`, `SEMANTIC DIFFERENTIATION`, `WASKITA`), lalu instruksikan di *prompt*: *"Do NOT change or replace any words written in ALL CAPS."*
* **Audit Wajib dengan *Compare Documents*:** Jangan pernah langsung menyalin hasil *output* AI ke naskah utama tanpa membandingkannya kata demi kata! Gunakan fitur **Microsoft Word $\rightarrow$ Review $\rightarrow$ Compare** (atau `git diff`) antara draf asli Anda dan hasil revisi AI untuk memastikan AI tidak mengaburkan makna teknis atau mengubah angka eksperimen.

---

### 4.3 Kumpulan *Prompt Templates* Siap Pakai (Standar Wallwork, 2024)

Gunakan *prompt* dengan batasan negatif (*negative constraints*) berikut agar AI bertindak sebagai editor bahasa akademik yang disiplin, bukan penulis bayangan yang mengubah isi:

#### 1. Prompt untuk *Light Proofreading* (Menjaga Suara Asli Penulis)
> *"I am submitting an extract from a computer science research paper on automated text quality assessment. Please act as an academic copy editor. Only make ESSENTIAL corrections to grammar, tense consistency, prepositions, and word order. Do NOT paraphrase for style, do NOT merge or split sentences unless grammatically necessary, do NOT use flowery vocabulary, and do NOT alter any technical terms written in ALL CAPS. After the revised text, list the specific grammatical reasons for each correction."*

#### 2. Prompt untuk Memadatkan *Abstract* (Memotong Kata Mubazir)
> *"Below is the draft abstract of my engineering research paper (currently [X] words). Please tighten the prose to under [200] words without losing any technical details, quantitative results, or methodological steps. Replace nominalizations (noun-heavy phrases) with concise action verbs, remove redundant introductory filler, and keep all technical keywords intact."*

#### 3. Prompt untuk Mengecek Alur Logika *Introduction / Discussion*
> *"Critique the logical flow and paragraph cohesion of the following [Introduction/Discussion] section from a software engineering journal paper. Do NOT rewrite the text yet. Instead, identify: (1) any sentences where the subject or pronoun ('this', 'it', 'they') is ambiguous, (2) any claims that lack clear transitions from the previous sentence, and (3) whether each paragraph starts with a clear controlling topic sentence."*

---

### 4.4 Daftar 7 Ciri Teks "Bau AI" (*AI Hallmarks*) yang Wajib Dihapus Manual!
Editor dan *reviewer* jurnal saat ini sangat peka terhadap gaya bahasa khas LLM. Pastikan naskah Anda bersih dari **7 tanda teks buatan AI** berikut (Wallwork, 2024 Bab 4):

1. **Kosakata Klise Favorit AI (*AI Buzzwords*):**
   Segera tekan `Ctrl+F` di naskah Anda dan **HAPUS/GANTI** kata-kata ini:
   * ❌ *delve / delve into* $\rightarrow$ ganti dengan *examine, analyze, investigate*.
   * ❌ *realm / landscape / tapestry / paradigm shift* $\rightarrow$ ganti dengan *domain, field, framework*.
   * ❌ *pivotal / paramount / crucial / vital / cornerstone* (jika diulang-ulang di setiap paragraf) $\rightarrow$ ganti dengan penjelasan konkret mengapa hal itu penting.
   * ❌ *underscore / showcase / shed light on / testament to* $\rightarrow$ ganti dengan *demonstrate, indicate, show, confirm*.
   * ❌ *comprehensive / meticulous / robust / seamless* (tanpa bukti metrik) $\rightarrow$ ganti dengan spesifikasi terukur (*three-stage, deterministic, linear-time*).
2. **Ketergantungan Berlebihan pada Kata Transisi Palsu di Awal Kalimat:**
   AI sangat suka memulai hampir setiap kalimat kedua dengan *Moreover, Furthermore, Additionally, Consequently, Notably, Importantly*. Hapus $>70\%$ kata transisi mekanis ini; biarkan hubungan logis antar-kalimat mengalir lewat pengulangan kata kunci (*lexical chaining*).
3. **Panjang Kalimat yang Terlalu Seragam (*Monotonous Rhythm*):**
   AI cenderung menghasilkan kalimat yang semuanya berukuran 18–22 kata dengan pola klausa yang kembar (`Although X..., Y..., thereby Z-ing...`). Pecah beberapa kalimat menjadi kalimat pendek 8–10 kata yang lugas.
4. **Klaim Penutup Paragraf yang Muluk (*Grandiose Tail Sentences*):**
   AI sering menambahkan kalimat penutup berbunga-bunga di akhir paragraf seperti *"Ultimately, this paves the way for a new era of trustworthy digital ecosystems."* **Hapus kalimat semacam ini!** Tutup paragraf dengan fakta teknis atau kesimpulan terukur.
5. **Struktur Partisip `-ing` di Akhir Setiap Kalimat:**
   AI sangat sering menutup kalimat dengan `, thereby enhancing...`, `, ultimately fostering...`, `, ensuring that...`. Ubah menjadi klausa langsung atau hapus jika mengulang ide yang sama.
6. **Penghilangan Suara Penulis (`We` $\rightarrow$ Pasif Kabur):**
   Pastikan kontribusi dan keputusan desain Anda tetap menggunakan subjek yang jelas (*"We designed the threshold..."* atau *"Our framework separates..."*) agar *reviewer* tahu persis apa yang Anda kerjakan.
7. **Etika & Deklarasi Penggunaan AI (Wallwork, 2024 Bab 1 & 10):**
   * AI **dilarang keras** digunakan untuk menghasilkan data sintetis yang diklaim sebagai data riil, mengarang sitasi referensi (karena AI sering mengalami halusinasi referensi palsu!), atau menulis kesimpulan ilmiah tanpa verifikasi.
   * Jika jurnal mewajibkan deklarasi penggunaan AI (seperti kebijakan Elsevier, Springer Nature, IEEE), tambahkan pernyataan standar di akhir naskah (sebelum *References*):
     > **Declaration of Generative AI and AI-assisted technologies in the writing process:** *During the preparation of this work, the authors used [Nama Alat AI] solely to improve language readability and grammatical accuracy. After using this tool, the authors reviewed and edited the content as needed and take full responsibility for the content of the publication.*

---

## BAGIAN 5: SOP FINAL CHECK, COVER LETTER, & PROTOKOL MEMBALAS REVIEWER (REBUTTAL LETTER)

*(Sumber: Deutz et al. 2023; Tan 2022 Bab 17; Wallwork 2023 Bab 20; Wallwork 2024 Bab 8; Laramee 2010 Seksi 7)*

### 5.1 Checklist Audit H-1 Sebelum *Submit* (Laramee & Wallwork)
Sebelum menekan tombol *Submit* di portal jurnal (OJS / Editorial Manager / ScholarOne), jalankan 6 pemeriksaan wajib ini:

- [ ] **1. Cetak Fisik / PDF Spasi Ganda (*Print-Out Visual Check*):** Baca naskah dalam tampilan cetak utuh. Pastikan tidak ada *lonely headings* (judul sub-seksi yang tertinggal sendirian di baris paling bawah halaman), tidak ada paragraf raksasa yang memakan $>15$ baris, dan semua teks di dalam gambar terbaca jelas.
- [ ] **2. *Detached Reference Audit* (Aturan Kritis Laramee, 2010 Seksi 7):**
  Pisahkan halaman *References* dan periksa satu per satu! Menurut Laramee, banyak *reviewer* senior membaca bagian *References* paling pertama untuk menguji kerapian penulis. Pastikan:
  * Setiap sitasi di teks ada di daftar *References*, dan sebaliknya (gunakan Mendeley/Zotero/BibTeX, jangan pernah mengetik manual!).
  * Tidak ada referensi yang kehilangan tahun, nama jurnal/konferensi, nomor volume/halaman, atau DOI.
  * Huruf kapital pada singkatan judul di *References* tidak rusak oleh BibTeX (bungkus kata seperti `{DSRM}`, `{NLP}`, `{Indonesia}` dengan kurung kurawal di file `.bib`).
- [ ] **3. Audit *Homonym Typos* (Lolos dari *Spell-Checker*):**
  Periksa kata-kata yang ejaannya benar secara kamus tetapi salah konteks:
  * `form` vs `from`
  * `weighed` vs `weighted` (untuk bobot rumus matematika, wajib **`weighted`**!)
  * `trough` vs `through`
  * `assess` vs `asses`
  * `principals` vs `principles`
  * `complement` vs `compliment`
  * `affect` (kata kerja: mempengaruhi) vs `effect` (kata benda: dampak/efek)
- [ ] **4. Audit Konsistensi Angka & Persentase:**
  Pastikan angka yang tertulis di *Abstract*, *Results* (teks), *Tables/Figures*, dan *Conclusions* **100% sama persis**! Ketidakcocokan angka antara Abstrak dan Tabel adalah alasan klasik *Desk Reject*.
- [ ] **5. Audit *Double-Blind Anonymity* (Jika Jurnal Menggunakan *Double-Blind Review*):**
  Hapus nama penulis, afiliasi, dan ucapan terima kasih sementara waktu. Saat merujuk karya atau repositori kode sendiri, gunakan kata ganti orang ketiga (*"Following the dataset protocol of Almuflihin et al. [14]..."*, bukan *"In our previous work [14]..."*).

---

### 5.2 Template *Cover Letter* kepada Editor Jurnal (Tan, 2022 Bab 17.2)
Jangan pernah mengosongkan atau menyalin mentah-mentah *Abstract* ke dalam *Cover Letter*! Editor kepala membaca *Cover Letter* untuk memutuskan apakah naskah Anda layak dikirim ke *peer review* atau langsung ditolak (*Desk Reject*). Gunakan struktur **3 Paragraf (1 Halaman)** berikut:

```markdown
Dear [Title and Full Name of Editor-in-Chief, e.g., Prof. John Smith],
Editor-in-Chief, [Full Name of the Journal]

We would like to submit our original research article entitled "[Full Title of Your Manuscript]" by [List of Authors] for consideration for publication in [Journal Name].

[PARAGRAF 2: THE HOOK — MENGAPA PENTING, APA KEBARUANNYA, & MENGAPA COCOK UNTUK JURNAL INI]
Automated web publishing workflows increasingly suffer from degraded, machine-spun, or structurally incoherent article drafts that bypass conventional surface-level readability checks. In this study, we present Waskita, a pre-publication curation framework designed using the Design Science Research Methodology (DSRM) that quantifies intrinsic text quality through multi-dimensional semantic differentiation. Evaluating [N] web article drafts, we demonstrate that our dual-tier semantic gating reduces false-positive acceptance by [X]% compared to single-metric baselines while maintaining low computational latency. Given [Journal Name]'s strong focus on [sebutkan ruang lingkup jurnal dari halaman Aims & Scope mereka, misal: applied software engineering and intelligent information systems], we believe our findings will be of direct interest to your readership.

[PARAGRAF 3: DEKLARASI ETIKA & KEASLIAN WAJIB]
We confirm that this manuscript is original, has not been published before, and is not currently under consideration for publication elsewhere. All authors have approved the manuscript and agree with its submission to [Journal Name]. The authors declare no conflicts of interest.

Thank you very much for your time and consideration. We look forward to hearing from you.

Sincerely,

[Your Name & Academic Affiliation]
Corresponding Author
Email: [Your Institutional Email]
```

---

### 5.3 Protokol Emas Membalas Reviewer (*Rebuttal Letter / Point-by-Point Response*)
*(Sumber: Deutz et al. 2023; Tan 2022 Bab 17.3; Wallwork 2024 Bab 8.7)*

Ketika menerima surat keputusan *Major Revision* atau *Minor Revision*, selamat! Artinya naskah Anda lolos dari *Desk Reject* dan memiliki peluang besar untuk diterbitkan jika Anda menangani komentar *reviewer* secara taktis.

#### A. 6 Hukum Besi Menulis *Response to Reviewers*
1. **Tenangkan Diri & Ingat Bahwa *"The Reviewer is Almost Always Right"* (Deutz et al., 2023):**
   * Jangan membalas di hari pertama saat emosi masih panas.
   * *Reviewers* adalah peneliti sibuk yang memeriksa naskah Anda secara sukarela tanpa dibayar. Jika seorang *reviewer* salah memahami metode Anda, **jangan menyalahkan *reviewer* ("You misunderstood our paper")**; itu adalah bukti bahwa kalimat di naskah Anda masih kurang jelas, dan ribuan pembaca masa depan juga akan mengalami kebingungan yang sama!
2. **Ubah Naskah, Jangan Hanya Menjelaskan di Surat Balasan!**
   * Setiap kali Anda menjawab pertanyaan *reviewer* di surat balasan, Anda **WAJIB menambahkan atau memperjelas kalimat tersebut di dalam naskah revisi (*Revised Manuscript*)**.
3. **Aturan Dokumen Independen (Hukum Kritis Deutz et al., 2023):**
   * **JANGAN PERNAH menulis kepada Reviewer 2: *"Please see our response to Reviewer 1, Comment 3."***
   * Di banyak sistem jurnal, Reviewer 2 hanya menerima balasan yang ditujukan untuk dirinya sendiri dan tidak memiliki akses ke balasan Reviewer 1 (atau malas mencarinya). **Salin dan tulis ulang jawaban lengkap beserta kutipan teks revisinya secara mandiri untuk setiap *reviewer*!**
4. **Format Visual yang Memudahkan Mata Editor & Reviewer (Tan, 2022 Bab 17.3):**
   * Gunakan penomoran yang persis sama dengan surat *reviewer* (`Reviewer #1, Comment 1`, `Comment 2`, dst.). Jika satu paragraf komentar *reviewer* memuat 3 pertanyaan sekaligus, pecah menjadi `Comment 1a`, `Comment 1b`, `Comment 1c` agar tidak ada satu pun sub-pertanyaan yang terlewat.
   * Kutip komentar *reviewer* secara utuh (100% *verbatim*, jangan dipotong) dengan huruf **Tebal (*Bold*)** atau *Italic* berwarna hitam.
   * Tulis balasan Anda (`Response:`) dengan huruf normal, lalu tampilkan kalimat baru yang dimasukkan ke naskah dalam blok kutipan berwarna **Biru** (Tan 2022: **hindari warna merah** di surat balasan karena secara psikologis terkesan agresif), lengkap dengan nomor halaman, seksi, dan barisnya (`Page 7, Section 3.2, Lines 142–148`).
5. **Jangan Pernah Berdebat untuk Permintaan Editorial / Minor (Wallwork, 2024 Bab 8.7):**
   * Jika *reviewer* meminta memendekkan *Introduction*, memperbaiki sebuah gambar, atau menambahkan 1–2 referensi relevan, **lakukan 100% tanpa berdebat**. Berdebat pada hal-hal minor hanya akan membuat *reviewer* kesal dan memicu ronde revisi tambahan.

#### B. Strategi & Template Kalimat untuk 4 Kelas Komentar Reviewer (Tan, 2022 Bab 17.3)

| Kelas Komentar | Strategi Tindakan | Template Kalimat Balasan Resmi (*Copy-Paste Ready*) |
| :--- | :--- | :--- |
| **Kelas 1: *Complimentary* (Pujian di paragraf pembuka *reviewer*)** | **Jangan dihapus!** Tetap kutip di dokumen *Response* (agar Editor dan *reviewer* lain melihat bahwa naskah Anda diapresiasi), lalu balas dengan ucapan terima kasih singkat. | **Reviewer #1, General Comment:** *"This paper presents an interesting and practical approach to pre-publication article curation..."*<br>**Response:** We sincerely thank the Reviewer for the positive assessment of our work and for the constructive suggestions below, which have helped us substantially improve the manuscript. |
| **Kelas 2: *Editorial / Formatting / Typo*** | Terima 100%, perbaiki di naskah, dan tunjukkan lokasi perbaikannya. | **Response:** We agree with the Reviewer and thank you for catching this oversight. We have corrected the notation in Equation (3) and redrawn Figure 2 with higher font resolution (Page 6, Section 3.2, Line 118). |
| **Kelas 3: *Challenging / Clarification* (Meminta penjelasan teknis, alasan asumsi, atau analisis tambahan)** | Berikan jawaban ilmiah yang padat di *Response*, dukung dengan data/referensi, dan **masukkan penjelasan tersebut ke dalam naskah**. | **Response:** We thank the Reviewer for raising this insightful question regarding the sensitivity of threshold $\tau$. As suggested, we conducted an additional sensitivity analysis across $\tau \in [0.4, 0.8]$. The results confirm that the F1-score remains stable within $\pm 1.5\%$ between $0.55$ and $0.65$. We have added this analysis to Section 4.3 (Page 9, Lines 210–224) as follows:<br>> *"[Kutipan persis kalimat baru yang ditambahkan di naskah dengan warna biru]"* |
| **Kelas 4: *Critical / Out-of-Scope Disagreement* (Permintaan yang tidak mungkin dipenuhi atau di luar ruang lingkup riset)** | **Jangan berkata *"You are wrong"*!** Gunakan formula: (1) Apresiasi ide tersebut, (2) Berikan alasan teknis/bukti objektif mengapa hal itu berada di luar ruang lingkup studi ini, (3) Tawarkan kompromi dengan menambahkan diskusi/batasan eksplisit di naskah. | **Response:** We appreciate the Reviewer's suggestion to evaluate the framework on real-time video transcripts. However, the architectural scope of Waskita is specifically tailored to structured written web articles that exhibit paragraph-level discourse transitions, which are absent in unsegmented spoken transcripts. Nevertheless, we fully agree that clarifying this boundary is important for readers. We have therefore explicitly stated this scope condition in Section 5.4 (Page 12, Lines 305–312) as follows:<br>> *"While Waskita is designed for structured written web drafts, adapting the semantic differentiation metrics to unsegmented spoken transcripts represents a promising direction for future work."* |

---

## BAGIAN 6: DAFTAR ANTI-BLUNDER PENULISAN BAHASA INGGRIS (TABEL RINGKAS)

Tabel ini adalah *Checklist* pengaman cepat yang merangkum kesalahan paling fatal penulis non-native saat menyusun *paper* rekayasa perangkat lunak dan komputasi:

| No | Blunder Fatal yang Sering Terjadi | Mengapa Berbahaya di Mata Reviewer? | Solusi Blueprint (Standar Internasional) |
| :-: | :--- | :--- | :--- |
| **1** | **Menulis *Introduction* paling pertama sebelum *Methods & Results* beres.** | Menghasilkan *Introduction* yang bertele-tele dan tidak nyambung dengan hasil eksperimen akhir. | Gunakan urutan: `Working Abstract -> Outline + Visuals -> Methods -> Results -> Discussion -> Introduction -> Conclusions -> Final Abstract/Title`. |
| **2** | **Menggunakan sinonim berganti-ganti untuk komponen teknis yang sama (*Synonymomania*).** | *Reviewer* mengira Anda sedang membahas 3–4 algoritma/modul yang berbeda sehingga alur teknis hancur. | **1 Konsep Teknis = 1 Istilah Konsisten** dari Judul sampai Kesimpulan. Kunci dengan *ALL CAPS* saat memakai AI editor. |
| **3** | **Menjadikan nomor sitasi `[4]` sebagai subjek kalimat (*"[4] proposed..."*).** | Merusak tata bahasa Inggris dan menghilangkan rasa hormat kepada penulis yang kemungkinan besar menjadi *reviewer* Anda. | Selalu tulis nama belakang penulis sebagai subjek kalimat: *"Bevendorff et al. [4] proposed..."* |
| **4** | **Menulis kalimat penunjuk kosong di *Results* (*"Table 1 shows the results"*).** | Membuang ruang kata tanpa memberikan informasi apa pun (*Tell, Don't Show*). | Jadikan klaim/tren kuantitatif sebagai subjek kalimat, dan taruh `(Table 1)` di ujung kalimat sebagai bukti pendukung. |
| **5** | **Memasukkan hasil baru atau topik literatur baru yang belum ada di *Introduction* ke dalam *Discussion*.** | Melanggar struktur logis IMRaD (Deutz et al., 2023); *Discussion* menjadi tidak fokus dan membingungkan. | Pastikan semua angka sudah muncul di *Results*, dan setiap literatur pembanding di *Discussion* sudah diperkenalkan di *Introduction/Related Work*. |
| **6** | **Menyamakan *Tasks* (How) dengan *Objectives* (Why) di akhir *Introduction*.** | Membuat *paper* terlihat seperti laporan proyek koding biasa, bukan karya ilmiah yang menguji hipotesis/pertanyaan riset. | Bedakan: *Task* adalah membangun sistem/mengukur skor; *Objective* adalah mengevaluasi kelayakan dan membuktikan efektivitas metode. |
| **7** | **Memakai kata `significant` tanpa uji statistik ($p$-value) atau memakai kata subjektif (`very good, novel, unfortunately`).** | Dianggap tidak ilmiah, melebih-lebihkan klaim (*overclaiming*), atau emosional. | Gunakan `significant` HANYA jika ada $p < 0.05$; selain itu gunakan `substantial / considerable` dan sertakan persentase eksak. |
| **8** | **Membiarkan kata-kata klise AI (*delve, realm, pivotal, underscore, tapestry, Moreover*) bertebaran di naskah.** | Langsung terdeteksi oleh Editor dan *Reviewer* sebagai teks hasil *copy-paste* mentah dari ChatGPT. | Gunakan *Constrained Prompting*, terapkan *Pre-Editing*, dan bersihkan semua *AI buzzwords* secara manual. |
| **9** | **Menulis *"Please see our response to Reviewer 1"* saat membalas Reviewer 2.** | Membuat Reviewer 2 merasa tidak dihargai atau tidak bisa membaca jawaban karena terpisah di sistem jurnal. | Buat setiap balasan bersifat **mandiri (*self-contained*)**: salin penjelasan lengkap dan kutipan revisi naskah untuk masing-masing *reviewer*. |
| **10** | **Mengabaikan kerapian daftar *References* dan konsistensi simbol matematika ($x$ vs x).** | *Reviewer* menilai ketelitian eksperimen Anda dari kerapian *References* dan konsistensi format persamaan matematika. | Jalankan *Detached Reference Audit* (Laramee) H-1 sebelum *submit*, dan pastikan semua variabel matematika dicetak *italic* di teks maupun di rumus. |
