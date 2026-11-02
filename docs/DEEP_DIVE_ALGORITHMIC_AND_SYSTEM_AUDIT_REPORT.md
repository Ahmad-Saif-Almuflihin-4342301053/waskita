# LAPORAN AUDIT FORENSIK ALGORITMA & ARSITEKTUR WASKITA (DEEP-CORE X-RAY)
## Analisis Menyeluruh Kelemahan Matematis, Bottleneck Sistem, Kasus Sudut (Edge Cases), dan Peta Jalan Peningkatan Mesin IR

**Dokumen:** `docs/DEEP_DIVE_ALGORITHMIC_AND_SYSTEM_AUDIT_REPORT.md`  
**Penulis:** System Analyst & Lead Architect (WASKITA R&D)  
**Cakupan Audit:** 100% Basis Kode Backend (`app/services/`, `app/api/`, `app/core/`, `app/models/`, `app/schemas/`) & Frontend (`src/utils/`, `src/components/`)

---

## DAFTAR ISI
1. **Lapisan 1: Cacat Matematis & Statistik Information Retrieval (VSM, TF-IDF, & Cosine)**
2. **Lapisan 2: Kelemahan Morfologi NLP Bahasa Indonesia & Ekstraksi Entitas (Sastrawi & Information Gain)**
3. **Lapisan 3: Celah Logika Gatekeeper, Rumus Komposit CDS, & Anotasi Stabilo 4-Warna**
4. **Lapisan 4: Bottleneck Konkurensi, Jaringan, & Arsitektur Scraping SERP**
5. **Lapisan 5: Inkonsistensi Skema Data, Persistensi SQLite, & Bug Antarmuka (UI/UX)**
6. **Matriks Prioritas Eksekusi (Sprint 4.1 & Fase Lanjutan)**

---

## 1. LAPISAN 1: CACAT MATEMATIS & STATISTIK INFORMATION RETRIEVAL

### 1.1. Delusi Normalisasi L2 pada Ketimpangan Panjang Dokumen (*Length Asymmetry Dilution*)
* **Lokasi Kode:** [`backend/app/services/vsm_calculator.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/vsm_calculator.py#L29-L48)
* **Bedah Matematis:**
  `TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2), norm="l2")` memproyeksikan dokumen ke permukaan bola satuan berdimensi-$V$ ($\|\mathbf{v}\|_2 = 1$).
  Misalkan draf pengguna $D$ memiliki panjang $L_D = 350$ kata, dan merupakan salinan kata-demi-kata (*exact subset*) dari artikel kompetitor $C$ yang memiliki panjang $L_C = 1.400$ kata (karena artikel kompetitor memuat 4 sub-topik tambahan atau daftar referensi panjang).
  Jika himpunan fitur aktif pada $D$ adalah $F_D \subset F_C$ dengan bobot seragam, maka hasil kali titik ternormalisasi L2 adalah:
  $$\cos(\mathbf{v}_D, \mathbf{v}_C) = \frac{\sum_{t \in F_D} w_t^2}{\sqrt{\sum_{t \in F_D} w_t^2} \cdot \sqrt{\sum_{t \in F_C} w_t^2}} = \sqrt{\frac{\sum_{t \in F_D} w_t^2}{\sum_{t \in F_C} w_t^2}} \approx \sqrt{\frac{L_D}{L_C}} = \sqrt{\frac{350}{1400}} = 0.50$$
  Dengan `ngram_range=(1, 2)`, jumlah fitur bigram unik di sisa $1.050$ kata kompetitor makin memperbesar penyebut $\|\mathbf{v}_C\|_2$, menekan nilai kosinus turun ke **$\approx 0.38 - 0.41$**.
* **Dampak Fatal:** Penulis yang menyalin mentah 350 kata dari artikel pilar sepanjang 1.500 kata **tidak akan pernah** menyentuh ambang `max_cosine_similarity = 0.60` jika hanya diukur dengan kosinus dokumen global.
* **Solusi Algoritma (Sliding-Window Passage VSM):**
  Ketika $L_C > 1.35 \times L_D$, dokumen kompetitor $C$ harus dipecah menjadi jendela geser (*sliding passages*) $W_1, W_2, \dots, W_m$ berukuran $L_D$ dengan *stride* $L_D / 3$. Kemiripan efektif dihitung sebagai kombinasi cembung:
  $$S_{\text{eff}}(D, C) = \max\left(S_{\text{global}}(D, C),\ 0.35 \cdot S_{\text{global}}(D, C) + 0.65 \cdot \max_{k} \cos(\mathbf{v}_D, \mathbf{v}_{W_k})\right)$$

### 1.2. Kelemahan TF-IDF Murni terhadap *Smart Spinner* (Parafrase Sinonim Struktur Tetap)
* **Lokasi Kode:** [`backend/app/services/vsm_calculator.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/vsm_calculator.py#L29-L35) & [`backend/app/services/gatekeeper.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/gatekeeper.py#L163-L182)
* **Bedah Matematis:**
  Saat pengguna menggunakan *Smart Spinner* (seperti pada kasus uji Mode 2 di dokumen pengujian), struktur kalimat tetap sama persis, tetapi $35\% - 45\%$ kata diganti dengan sinonim (*"material beton mentah tanpa pelapis"* $\rightarrow$ *"bahan semen kasar tanpa plesteran"*).
  - Pada level kalimat di `gatekeeper.py`, rumus Jaccard:
    $$J(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{1 - p}{1 + p}$$
    Jika proporsi kata yang diganti sinonim adalah $p = 0.35$ ($35\%$ kata diganti), maka $J(A, B) = \frac{0.65}{1.35} = 0.481$.
    Karena ambang stabilo merah sebelumnya dikunci pada $J \ge 0.65$, kalimat hasil *Smart Spinner* dengan $35\%$ pergantian kata **lolos 100% tanpa satu pun stabilo merah**!
* **Solusi Algoritma:**
  1. Gunakan kombinasi **Jaccard ($\ge 0.50$)** ATAU **Asymmetric Containment / Szymkiewicz–Simpson Coefficient**:
     $$C(A, B) = \frac{|A \cap B|}{\min(|A|, |B|)} \ge 0.72 \quad (\text{dengan } |A \cap B| \ge 4)$$
  2. Tambahkan **Kamus Kanonikalisasi Sinonim & Serapan Teknis** sebelum stemming sehingga pasangan kata yang sering diputar oleh spinner (*material/bahan, struktur/konstruksi, karakteristik/ciri, ekspos/exposed/terbuka, minimalis/sederhana*) dipetakan ke stem kanonik yang sama.

---

## 2. LAPISAN 2: KELEMAHAN MORFOLOGI NLP & EKSTRAKSI ENTITAS (INFORMATION GAIN)

### 2.1. "Jebakan Pemotongan Top-N" (*Truncated Set-Difference Hallucination*)
* **Lokasi Kode:** [`backend/app/api/v1/endpoints/audit_endpoints.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/api/v1/endpoints/audit_endpoints.py#L340-L349) & [`backend/app/services/information_gain.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/information_gain.py#L35-L60)
* **Bedah Masalah:**
  Operasi selisih himpunan dilakukan antara $E_{\text{draft\_top30}}$ dan $E_{\text{SERP\_top25}}$, bukan terhadap seluruh kosakata dokumen:
  - **Halusinasi Defisit (False Deficit):** Kata yang sudah ditulis pengguna sebanyak 1–2 kali di draf (peringkat frekuensi #31 ke bawah) tidak masuk ke $E_{\text{draft\_top30}}$, sehingga dituduh "belum dibahas di naskah Anda".
  - **Halusinasi Gain (False Gain):** Kata yang disalin pengguna dari paragraf tengah kompetitor (peringkat frekuensi #26 ke bawah di kompetitor) tidak masuk ke $E_{\text{SERP\_top25}}$, sehingga dipuji sebagai "nilai tambah unik baru" dan diberi stabilo hijau.
* **Solusi Mutlak:**
  Pisahkan antara **Himpunan Kandidat Topik ($E^{\text{cand}}$)** dan **Himpunan Eksistensi Kosakata Penuh ($V^{\text{full}}$)**:
  $$\Delta_{\text{deficit}} = \left\{ e \in E^{\text{cand}}_{\text{SERP}} \setminus V^{\text{full}}_{\text{draft}} \;\middle|\; \text{df}_{\text{SERP}}(e) \ge 2 \right\}$$
  $$\Delta_{\text{gain}} = E^{\text{cand}}_{\text{draft}} \setminus \bigcup_{j=1}^{K} V^{\text{full}}_{\text{comp}, j}$$

### 2.2. Duplikasi Unigram–Bigram (*Subsumption Redundancy* pada Chip Entitas)
* **Lokasi Kode:** [`backend/app/services/nlp_pipeline.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/nlp_pipeline.py#L170-L209) & [`backend/app/services/information_gain.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/information_gain.py#L40-L76)
* **Bedah Masalah:**
  Pada hasil uji pengguna, muncul chip: `★ Beton Ekspos`, `★ Ekspos`, `★ Beton Mentah`.
  Kata tunggal `Ekspos` muncul berdampingan dengan frasa `Beton Ekspos`. Secara ergonomis dan semantik, menampilkan kata bagian (*unigram*) ketika frasa utuhnya (*bigram*) sudah ditampilkan adalah pemborosan slot 10 besar dan membingungkan penulis.
* **Solusi Algoritma (Bigram Subsumption Filter):**
  Saat menyusun daftar 10 besar `top_deficit` maupun `top_gain`:
  1. Prioritaskan bigram bermakna terlebih dahulu.
  2. Jika sebuah unigram $w$ sudah menjadi bagian dari bigram $w_1 w_2$ yang terpilih di dalam daftar 10 besar (misal `"ekspos"` di dalam `"beton ekspos"`), maka unigram $w$ tersebut **dieliminasi (subsumed)** kecuali konsensus dokumennya lebih tinggi dari bigram tersebut.

### 2.3. Kegagalan Sastrawi pada Akhiran Serapan Asing (`-isme`, `-is`, `-ist`, `exposed` vs `ekspos`)
* **Lokasi Kode:** [`backend/app/services/nlp_pipeline.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/nlp_pipeline.py#L112-L118)
* **Bedah Masalah:**
  Kamus dasar PySastrawi dirancang untuk imbuhan Melayu/Indonesia asli (`me-`, `ber-`, `-kan`, `-an`), tetapi **gagal menormalisasi sufiks serapan Indo-Eropa**:
  - `"brutalisme"`, `"brutalis"`, dan `"brutalist"` menghasilkan 3 stem berbeda!
  - `"minimalisme"`, `"minimalis"`, dan `"minimalist"` menghasilkan 3 stem berbeda!
  - `"arsitektur"` dan `"arsitek"` menghasilkan 2 stem berbeda!
  - `"exposed"` dan `"ekspos"` menghasilkan 2 stem berbeda!
* **Solusi Algoritma (Pre/Post-Stemming Suffix & Loanword Normalizer):**
  Tambahkan normalisasi morfologi serapan di dalam `stem_word(word)`:
  - Konversi ejaan serapan umum (`exposed` $\rightarrow$ `ekspos`, `architectural`/`architecture` $\rightarrow$ `arsitektur`).
  - Untuk kata berakhiran `-isme` atau `-ist` dengan panjang $> 7$ huruf (misal `brutalisme`, `brutalist`, `minimalisme`, `modernisme`, `fungsionalisme`), normalisasikan ke bentuk dasar `-is` (`brutalis`, `minimalis`, `modernis`, `fungsionalis`) agar variasi istilah di berbagai artikel kompetitor menyatu ke dalam satu konsep yang sama!

---

## 3. LAPISAN 3: CELAH LOGIKA GATEKEEPER & RUMUS KOMPOSIT CDS

### 3.1. Kompensasi Palsu pada Rumus Komposit CDS (*Compensatory Scoring Vulnerability*)
* **Lokasi Kode:** [`backend/app/services/gatekeeper.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/gatekeeper.py#L239-L290)
* **Bedah Matematis:**
  $$\text{CDS} = 0.35 \cdot C_{\text{VSM}} + 0.30 \cdot C_{\text{IG}} + 0.20 \cdot C_{\text{MATTR}} + 0.15 \cdot C_{\text{HKO}}$$
  Perhatikan sifat linier aditif rumus ini:
  - Jika seseorang menulis artikel yang sangat dangkal (tidak menjiplak siapa pun sehingga `max_cosine_sim = 0.15` $\implies C_{\text{VSM}} = 100$), kosakatanya normal ($\text{MATTR} = 0.65 \implies C_{\text{MATTR}} = 100$), dan tidak melakukan spam heading ($\text{HKO} = 20\% \implies C_{\text{HKO}} = 100$), maka dari 3 komponen ini saja ia sudah mengantongi:
    $$0.35(100) + 0.20(100) + 0.15(100) = 70.0\text{ poin!}$$
  - Ia hanya butuh $5.0$ poin tambahan dari $C_{\text{IG}}$ (artinya $C_{\text{IG}}$ cukup bernilai $17\%$ saja!) untuk menembus skor total **$75.0\%$ ("Siap Terbit")**!
  - Dengan kata lain: **Naskah yang sangat dangkal dan gagal membahas 80% topik penting SERP ($C_{\text{IG}} = 20\%$) tetap bisa lolos "Siap Terbit" hanya karena tidak plagiat dan tidak spam!**
* **Solusi Matematis (Non-Compensatory Pillar Floor):**
  Tetapkan syarat ambang minimum per pilar untuk vonis `"Siap Terbit"`:
  - Selain $\text{CDS} \ge 75\%$, naskah **WAJIB** memiliki $C_{\text{IG}} \ge 45.0\%$ (cakupan topik memadai) dan `red_span_ratio < 0.20`. Jika $C_{\text{IG}} < 45.0\%$, vonis harus tetap `"Perlu Revisi"` karena artikel belum komprehensif secara substansi.

### 3.2. Paradoks Penyebut `coverage_ratio` terhadap Pertumbuhan Jumlah Kompetitor $K$
* **Lokasi Kode:** [`backend/app/api/v1/endpoints/audit_endpoints.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/api/v1/endpoints/audit_endpoints.py#L368-L379)
* **Bedah Matematis:**
  Jika `serp_entities_count` dihitung dari gabungan (*union*) seluruh kata unik di $K$ kompetitor ($\left|\bigcup_{j=1}^K E_j\right|$), maka menurut Hukum Heaps (*Heaps' Law*), ukuran kosakata gabungan tumbuh sebesar $O(K^\beta)$. Saat $K$ naik dari 3 ke 10 artikel, penyebut membengkak $2.5\times$ lipat sementara panjang draf pengguna tetap sama.
* **Solusi Matematis:**
  Penyebut `serp_entities_count` pada `coverage_ratio` **harus dikunci maksimal pada Top-25 Entitas Konsensus SERP** ($\text{consensus} \ge 2$, diurutkan berdasarkan derajat konsensus tertinggi). Dengan demikian, berapapun jumlah kompetitor yang terjaring ($K = 3, 7,$ atau $10$), standar ujian cakupan topiknya selalu terkalibrasi secara konsisten pada 25 konsep inti topik tersebut!

---

## 4. LAPISAN 4: BOTTLENECK KONKURENSI, JARINGAN, & SCRAPING SERP

### 4.1. *Tail-Latency Trap* (Jebakan Waktu Tunggu Ekor Panjang `7s + 8s = 15s`)
* **Lokasi Kode:** [`backend/app/services/serp_scraper.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/serp_scraper.py#L179-L240)
* **Bedah Masalah:**
  `asyncio.gather(*tasks)` menyelesaikan eksekusi mengikuti **tugas yang paling lambat** (*max latency of N tasks*).
  Di dalam `fetch_page_content(url)`:
  - Attempt 1 (`httpx`) memiliki `timeout=7.0`.
  - Jika server tujuan mati/hang (misal repositori kampus yang sedang *down*), `httpx` menunggu penuh **7.0 detik** lalu melempar `TimeoutException`.
  - Kemudian kode mengatur `trigger_curl_fallback = True`, sehingga Attempt 2 (`curl_cffi`) kembali mencoba menghubungi server mati yang sama dengan `timeout=8.0`!
  - Total waktu tunggu untuk 1 URL mati = **$7.0 + 8.0 = 15.0\text{ detik}$**!
  Saat kita menarik 35 kandidat dari 4 halaman Google, peluang adanya minimal 1 situs yang *down*/lambat mendekati $95\%$. Satu situs lambat ini akan menahan seluruh hasil audit selama 15 detik!
* **Solusi Sistem (Fast-Fail & Selective Impersonation Fallback):**
  1. **Jangan jalankan `curl_cffi` jika `httpx` gagal karena `TimeoutException` atau `ConnectError`!** `curl_cffi` berguna untuk menembus blokir TLS fingerprint Cloudflare (`HTTP 401, 403, 406, 429, 503`), bukan untuk menghidupkan server yang mati.
  2. Turunkan timeout `httpx` menjadi `httpx.Timeout(4.5, connect=2.5)` dan timeout `curl_cffi` menjadi `4.5` detik, serta bungkus setiap task `fetch_page_content` dengan batas waktu keras `asyncio.wait_for(..., timeout=6.0)`.
  3. Gunakan **Shared `httpx.AsyncClient` Pool** (1 client bersama untuk seluruh 35 URL, bukan membuat 35 instance `AsyncClient` baru) dengan `asyncio.Semaphore(15)` agar jabat tangan TLS dan soket OS sangat hemat memori.
  - **Dampak Performa:** Waktu tunggu maksimum untuk mengunduh 35 kandidat dari 4 halaman Google dipangkas dari **15–16 detik menjadi tegas $\le 6.5\text{ detik}$**!

### 4.2. Pemrosesan Stemming Sastrawi Sekuensial di Event Loop Utama
* **Lokasi Kode:** [`backend/app/api/v1/endpoints/audit_endpoints.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/api/v1/endpoints/audit_endpoints.py#L310-L345)
* **Bedah Masalah:**
  1. Loop `for c in competitor_docs: prep_c = await preprocess_text_async(c_clean)` berjalan satu per satu (sekuensial), bukan paralel `asyncio.gather`.
  2. Pemanggilan `extract_candidate_entities` untuk 10 kompetitor dijalankan secara sinkron di *main thread* dan melakukan tokenisasi + stemming ulang atas teks yang sebenarnya baru saja dipreproses pada langkah sebelumnya!
* **Solusi Sistem:**
  Jalankan `preprocess_text_async` secara paralel dengan `asyncio.gather`, dan manfaatkan cache LRU `stem_word` sehingga ekstraksi entitas dan himpunan stem penuh berjalan instan ($< 15\text{ ms}$).

---

## 5. LAPISAN 5: INKONSISTENSI SKEMA DATA, PERSISTENSI SQLITE, & BUG UI/UX

### 5.1. Bug Nama Atribut `SerpAuditSummary` (Penyebab Statistik `"0 hasil Google dilewati"` Selalu Nol!)
* **Lokasi Kode:**
  - Backend: [`backend/app/schemas/audit.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/schemas/audit.py#L105-L112)
  - Frontend: [`frontend/src/components/audit-block/SerpCompetitorsSection.tsx`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/frontend/src/components/audit-block/SerpCompetitorsSection.tsx#L22-L27)
* **Bedah Masalah:**
  - Backend mengirim JSON dengan nama field berakhiran `_count`:
    `skipped_video_social_count`, `skipped_pdf_doc_count`, `skipped_proxy_count`, `skipped_short_text_count`, `skipped_bot_protect_count`.
  - Sedangkan Frontend di `SerpCompetitorsSection.tsx` membaca:
    `summary?.skipped_video_social`, `summary?.skipped_pdf_doc`, `summary?.skipped_bot_protected`, `summary?.skipped_short_text` (tanpa `_count`)!
  - Akibatnya, di UI selalu tertulis: **`(0 hasil Google dilewati: 0 video/sosmed, 0 PDF/dokumen)`** meskipun kenyataannya puluhan link telah disaring!
* **Solusi:**
  Baca kedua variasi nama field di `SerpCompetitorsSection.tsx` (`summary?.skipped_video_social_count ?? summary?.skipped_video_social ?? 0`, dst.) dan tampilkan rincian total kandidat yang dievaluasi secara akurat.

### 5.2. Hilangnya Poin Ringkasan Diagnostik (`overview_bullets`) Saat Membuka Riwayat Sesi dari Sidebar
* **Lokasi Kode:** [`backend/app/api/v1/endpoints/audit_endpoints.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/api/v1/endpoints/audit_endpoints.py#L136-L140)
* **Bedah Masalah:**
  Saat pengguna mengeklik sesi lama di sidebar, fungsi `build_audit_execute_response(session)` dipanggil. Karena `overview_bullets` tidak disimpan di database, fungsi tersebut menggantinya dengan 2 kalimat generik kaku:
  - *"Audit selesai dengan status vonis..."*
  - *"Skor diferensiasi semantik CDS tercatat..."*
* **Solusi:**
  Di `build_audit_execute_response`, panggil kembali `generate_overview_and_remediation(...)` berdasarkan metrik, entitas, kompetitor tertinggi, dan cuplikan stabilo merah yang tersimpan di sesi tersebut! Dengan demikian, saat pengguna membuka riwayat sesi kapan pun, poin diagnostik terperinci tetap utuh 100% tanpa perlu migrasi skema tabel baru.

### 5.3. Deduplikasi Konten Identik Lintas Domain (*Cross-Domain Syndication / Mirror Filter*)
* **Lokasi Kode:** [`backend/app/services/serp_scraper.py`](file:///home/saifmpleh/Downloads/Telegram%20Desktop/proyekmagang/waskitariset/backend/app/services/serp_scraper.py#L440-L465)
* **Bedah Masalah:**
  Di Indonesia, portal berita daerah atau blog kampus sering menyalin artikel yang 100% sama dari media lain (*syndicated content* — misal Tribunnews daerah atau blog mahasiswa yang menyalin artikel Kompas).
  Saat ini `serp_scraper.py` hanya melakukan deduplikasi berdasarkan `seen_domains` (nama domain), belum memeriksa `main_text_hash` atau kemiripan isi antar-kompetitor! Jika ada 2 website berbeda yang memuat artikel kembar identik, keduanya masuk ke korpus dan menggandakan bobot konsensus secara palsu.
* **Solusi:**
  Tambahkan `seen_text_hashes: Set[str]` di `serp_scraper.py` agar dua URL dari domain berbeda yang memiliki isi artikel identik tidak dihitung ganda.
