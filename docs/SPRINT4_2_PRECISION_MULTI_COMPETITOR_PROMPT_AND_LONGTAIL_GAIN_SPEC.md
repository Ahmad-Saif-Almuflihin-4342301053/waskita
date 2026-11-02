# BLUEPRINT ARSITEKTUR & SPESIFIKASI MASTER SPRINT 4.2
## "Precision Multi-Competitor Remediation, Long-Tail Information Gain, Word Budget Enforcement, & Query Lock"

> **Status Dokumen:** APPROVED BLUEPRINT / READY FOR IMPLEMENTATION  
> **Target Rilis:** `v1.5.2-SNAPSHOT.1`  
> **Komponen:** Backend Fast-API (`gatekeeper.py`, `nlp_pipeline.py`, `information_gain.py`, `stylometrics.py`, `audit_endpoints.py`) & Frontend React (`FloatingComposerDock.tsx`, `App.tsx`, `RemediationPromptSection.tsx`, `AnnotatedTextSection.tsx`)  
> **Lead Architect / System Analyst:** Tim Arsitektur WASKITA

---

## 1. LATAR BELAKANG & AKAR PERMASALAHAN (ROOT CAUSE ANALYSIS)

Berdasarkan hasil uji adversarial pengguna (*Skenario Plagiasi UMA -> Revisi ChatGPT -> Re-Audit*), ditemukan 6 anomali kritis yang menghalangi pencapaian target audit 100% dan memicu pembengkakan kata 2x lipat:

1. **Sindrom Instruksi Aditif Tanpa Plafon Kata (*Unbounded Expansion*):**
   Prompt remediasi WASKITA saat ini hanya memerintahkan LLM untuk *"merombak kalimat dan menyertakan topik X, Y, Z"*. Tanpa parameter plafon kata (*Word Budget Constraint*) dan instruksi pemangkasan (*Pruning Rule*), LLM melipatgandakan panjang draf dari **1.170 kata menjadi 2.591 kata**. Di ranah GEO (Generative Engine Optimization) dan RAG vector chunking, artikel panjang tanpa kepadatan informasi mengalami penalti dilusi semantik.
2. **Keterbatasan "Top-25 TF" pada Deteksi *Information Gain*:**
   Fungsi `extract_candidate_entities(top_n=25)` hanya mengekstrak 25 kata berfrekuensi tertinggi di draf. Pada artikel 2.000 kata, 25 kata tersering didominasi oleh kosakata umum (*bangunan*, *beton*, *arsitektur*, *struktur*) yang pasti ada di kompetitor. Sementara entitas orisinal bernilai tinggi (*Trellick Tower*, *Reyner Banham*, *Alison Smithson*, *Kenyamanan Termal*) yang muncul 1–3 kali terpotong di luar Top-25, sehingga metrik $\Delta_{\text{gain}}$ draf hanya mencatat 1 entitas (`★ Komposisi`) dan kehilangan 11 poin skor CDS.
3. **Penyederhanaan Ekstrem Multi-Kompetitor di Prompt (*Single-Competitor Myopia*):**
   WASKITA menjaring 10 artikel Google SERP, tetapi teks prompt hanya merujuk pada kompetitor #1 (*sipil.uma.ac.id*). Ini memicu kebingungan pengguna mengenai fungsi 9 artikel lainnya. Ke-10 kompetitor harus diposisikan sebagai **Matriks Konsensus Pasar** (Sumber jiplakan utama vs standar kelengkapan kompetitor lain vs celah diferensiasi unik).
4. **Pencemaran Kata Kerja/Sifat Pasif pada Entitas Defisit (*Stopword Bleed*):**
   Kata-kata non-topikal seperti `Sederhana`, `Muncul`, `Selesai`, `Pandangan`, `Dikaitkan`, `Namanya` lolos ke kartu defisit karena filter stopword belum membersihkan verba proses dan adjektiva umum.
5. **Penolakan Sub-Judul Kalimat Tanya (`?`) pada HKO Overlap:**
   Regex sub-judul di `stylometrics.py` dan `gatekeeper.py` melarang karakter `?` (`[^\n.!?]`). Akibatnya sub-judul bergaya FAQ modern (*"Apa Itu Arsitektur Brutalisme?"*, *"Apakah Bisa Diterapkan pada Rumah Tinggal?"*) ditolak sebagai sub-judul, menjatuhkan skor HKO dari 100% ke 0% dan menyebabkan teks menyatu rapat tanpa spasi di kotak stabilo.
6. **Query Hijacking Saat Paste Revisi (*Target Query Mutation*):**
   Saat pengguna menempel draf hasil revisi ChatGPT ke editor, fungsi `handlePasteSanitized` di `App.tsx` mengekstrak kata kunci baru dari draf revisi dan menimpa *target_query* lama. Evaluasi menjadi bias (*not apple-to-apple*).

---

## 2. USER JOURNEY & ALUR SISTEM (USER FLOW TARGET)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. INPUT AWAL PENGGUNA                                                                 │
│    - Pengguna menempel draf awal (~1.170 kata).                                        │
│    - Kueri Target dikunci otomatis (Locked Target Query 🔒).                           │
│    - Plafon Kata Otomatis: Benchmark SERP (Misal: 900 - 1.200 kata).                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Klik "Audit Naskah"
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. EVALUASI SESI 1: JIPLAKAN TERDETEKSI & PROMPT PRESISI MULTI-KOMPETITOR              │
│    - Vonis: "Perlu Revisi - Redundansi Kalimat Tinggi" (Skor CDS ~37%).                │
│    - Max Cosine Sim: 100% terhadap Kompetitor #1 (sipil.uma.ac.id).                    │
│    - Defisit Bersih: Menampilkan hanya istilah substantif (Modular, Minimalis, dsb).   │
│    - Prompt Terpadu Multi-Kompetitor (Satu Klik Salin):                                │
│      * Bagian A: Eliminasi kemiripan struktur dari Kompetitor #1.                      │
│      * Bagian B: Lengkapi celah konsensus dari Kompetitor #2 & #3 (Detik, Binus).      │
│      * Bagian C: Wajib suntikkan 3-5 inovasi materi yang nihil di seluruh 10 SERP.     │
│      * Bagian D: Plafon kata KETAT (Maksimal 1.100 kata, buang kalimat basa-basi).     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Salin ke AI Agent / ChatGPT
                                            │ Tempel Balik Naskah Hasil Revisi
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. EVALUASI SESI 2: HASIL REVISI MENDEKATI 100% TANPA BENGKAK                          │
│    - Panjang Draf: Terkendali (~950 - 1.050 kata).                                     │
│    - Cosine Sim: Aman (< 20%). HKO Terdeteksi Sempurna (Termasuk Sub-Judul FAQ ?).     │
│    - Long-Tail Gain: Terdeteksi 4-6 entitas unik (Trellick Tower, Alison Smithson dll) │
│    - Vonis: "Siap Terbit" (Skor 92% - 98%).                                            │
│    - Antarmuka Dua Tab di Kotak Prompt:                                                │
│      * Tab 1: Paket Pra-Publikasi CMS & SEO (Meta Title, Description, Tag).            │
│      * Tab 2: Micro-Tuning Menuju 100% (Jika pengguna ingin mendorong sisa 2-5% skor). │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI TEKNIS IMPLEMENTASI

### A. WORKER 2: BACKEND ALGORITHMIC RE-ENGINEERING

#### 1. Perluasan Ekstraksi Entitas & Long-Tail Information Gain
**Berkas Sasaran:** `backend/app/services/nlp_pipeline.py` & `backend/app/services/information_gain.py`
* **Masalah:** Kandidat gain draf terpotong di `top_n=25`.
* **Solusi Teknis:**
  1. Buat fungsi `extract_candidate_gain_entities(sentences: List[str]) -> List[EntityCandidate]` yang tidak hanya mengambil *Top-TF*, tetapi mengekstrak:
     - Frasa Proper Noun kapital (Title Case Bigram/Trigram non-awal kalimat, contoh: *Alison Smithson*, *Reyner Banham*, *Trellick Tower*, *Kenyamanan Termal*).
     - Entitas teknis yang memiliki frekuensi minimal 1 kali di draf namun memiliki frekuensi **0 di seluruh korpus kompetitor SERP**.
  2. Gabungkan kandidat Top-TF draf dengan Long-Tail Gain candidates sebelum evaluasi diferensiasi di `calculate_information_gain`.
  3. Lakukan **ASCII Normalization / Folding (`unicodedata.normalize('NFKD', ...)` )**: Karakter aksen seperti `Unité` otomatis dinormalisasi menjadi `Unite`, dan mapping leksikal `perancis` -> `prancis` diintegrasikan agar tidak memicu defisit palsu.

#### 2. Pembersihan Stopword Verba & Adjektiva Non-Topikal dari Entitas Defisit
**Berkas Sasaran:** `backend/app/services/nlp_pipeline.py`
* Tambahkan ke dalam `EXCLUDED_DEFICIT_TERMS`:
  ```python
  NON_TOPICAL_VERBS_AND_ADJECTIVES = {
      "sederhana", "muncul", "selesai", "pandangan", "garis", "berbeda",
      "dikaitkan", "namanya", "perubahan", "memiliki", "menjadi", "terdapat",
      "menggunakan", "merupakan", "dikenal", "membantu", "membuat", "terlihat"
  }
  ```
* Seluruh entitas defisit wajib difilter terhadap daftar ini dan panjang karakter $\ge 4$.

#### 3. Generator Prompt Remediasi Multi-Kompetitor Presisi & Dual-Mode
**Berkas Sasaran:** `backend/app/services/gatekeeper.py`
* Parameter Baru: `serp_competitors: List[Dict[str, any]]`, `draft_word_count: int`.
* Jika vonis `Perlu Revisi`:
  Susun prompt terstruktur 4 pilar:
  ```
  Tolong sempurnakan draf artikel ini untuk topik '{target_query}' dengan panduan kurasi berdasarkan perbandingan {competitor_count} artikel kompetitor acuan Google SERP berikut:

  1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA:
     - Draf memiliki kemiripan struktur tinggi dengan {comp_citation}. Rombak total struktur kalimat dan susunan paragrafnya agar terbebas dari penalti plagiasi semantik.

  2. LENGKAPI CELAH KONSENSUS DARI KOMPETITOR LAIN:
     - Sebagaimana dibahas oleh kompetitor SERP lainnya ({other_competitor_domains}), sertakan pembahasan aspek penting yang masih absen di naskah Anda: {valid_deficits}.

  3. CIPTAKAN NILAI TAMBAH BARU (KALAHKAN 10 KOMPETITOR SERP):
     - Ke-10 kompetitor acuan belum mengulas sudut pandang spesifik ini secara mendalam. Sertakan minimal 2 pembahasan baru atau studi kasus kontekstual yang bernilai tinggi bagi pembaca.

  4. BATASAN PANJANG KATA KETAT (SERP WORD BUDGET):
     - Target panjang artikel: {min_target_words} – {max_target_words} kata (DILARANG melebihi {max_target_words} kata).
     - Hapus basa-basi pembuka dan pengantar klise. Langsung bahas substansi pokok secara padat dan lugas.
  ```
* Jika vonis `Siap Terbit` (Skor $\ge 75\%$):
  Sistem mengembalikan struktur respons ganda pada `remediation_prompt`:
  - `cms_pack_prompt`: Prompt Meta SEO, Deskripsi, Tag.
  - `perfectionist_prompt`: Prompt penyempurna untuk mengejar skor 100% jika skor masih $< 98\%$.

#### 4. Regex Sub-Judul Kalimat Tanya (`?`) & Perbaikan Blok Heading
**Berkas Sasaran:** `backend/app/services/stylometrics.py` & `backend/app/services/gatekeeper.py`
* Ubah filter tanda baca akhir sub-judul teks polos:
  * Dari: `if line_clean[-1] in (".", ",", ";", ":", "!"):`
  * Menjadi: `if line_clean[-1] in (".", ",", ";", ":", "!") and line_clean[-1] != "?":`
  * Izinkan tanda tanya `?` di akhir baris sub-judul jika memenuhi syarat kata $\le 12$ dan huruf kapital awal kalimat.
* Di `_split_into_sentences` (`gatekeeper.py`), pastikan baris heading Markdown maupun teks polos yang berakhiran `?` dipisahkan dengan penanda khusus `is_heading = True` agar tidak melekat ke kalimat berikutnya di antarmuka stabilo.

---

### B. WORKER 1: FRONTEND WORKSPACE & PROMPT UX

#### 1. Target Query Locking (Mencegah Mutasi Kueri Saat Paste Revisi)
**Berkas Sasaran:** `frontend/src/App.tsx` & `frontend/src/components/composer/FloatingComposerDock.tsx`
* Tambahkan mekanisme penguncian kata kunci target:
  - Jika sesi audit sedang aktif (`activeSessionId` ada atau `turnNumber > 1`), paste naskah revisi **TIDAK BOLEH** menimpa `targetQuery`.
  - Tambahkan tombol/ikon gembok kecil (Lock Query) di samping field kueri target.
  - Notifikasi toast saat kueri terkunci: *"Kueri target dikunci pada '{targetQuery}' untuk menjaga konsistensi benchmark audit."*

#### 2. Antarmuka Dual-Tab pada RemediationPromptSection
**Berkas Sasaran:** `frontend/src/components/audit-block/RemediationPromptSection.tsx`
* Jika audit berstatus **"Siap Terbit"**:
  - Sediakan dua tab tombol di atas kotak prompt:
    - `[Tab 1: Paket Pra-Publikasi CMS & SEO (Rekomendasi)]`
    - `[Tab 2: Micro-Tuning Menuju 100% (Perfeksionis)]`
  - Memudahkan pengguna memilih apakah ingin langsung terbit atau ingin memoles sisa celah kecil.

#### 3. Tampilan Blok Sub-Judul Kalimat Tanya di AnnotatedTextSection
**Berkas Sasaran:** `frontend/src/components/audit-block/AnnotatedTextSection.tsx`
* Pastikan span dengan `is_heading = true` selalu dirender sebagai elemen `display: block` dengan margin vertikal yang jelas, sehingga baris judul seperti *"Apa Itu Arsitektur Brutalisme?"* tidak pernah melebur dengan teks pembuka paragraf di bawahnya.

---

## 4. RENCANA PENGUJIAN & VERIFIKASI (VERIFICATION SUITE)

1. **Uji Panjang Kata:** Kirim prompt hasil WASKITA ke LLM. Pastikan LLM merespons dengan naskah sepanjang **850 – 1.100 kata** (tidak membengkak ke 2.500 kata).
2. **Uji Multi-Kompetitor:** Pastikan teks prompt menyebutkan sitasi kompetitor utama dan domain kompetitor pendukung (misal *sipil.uma.ac.id*, *detik.com*, *binus.ac.id*).
3. **Uji Long-Tail Information Gain:** Pastikan nama tokoh atau konsep teknis berfrekuensi rendah terdeteksi sebagai $\Delta_{\text{gain}}$ bintang hijau, mendorong $C_{\text{IG}} \ge 90\%$.
4. **Uji Heading Kalimat Tanya:** Masukkan draf dengan sub-judul berakhiran tanda tanya (`## Apa Itu Arsitektur Brutalisme?`). Pastikan metrik HKO Overlap $\ge 30\%$ dan baris sub-judul terpisah rapi di kotak stabilo.
5. **Uji Query Lock:** Tempel draf revisi ke editor; pastikan input *target_query* tidak berganti secara liar.
