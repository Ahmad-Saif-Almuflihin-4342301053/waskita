# Audit Forensik Mendalam: Algoritma Pembanding, Bedah 10 Celah/Bug Algoritma Waskita, dan Blueprint Perbaikan Matematis

> **Dokumen Riset & Audit Kode (Tanpa Asumsi — Berbasis Bukti Baris Kode & Literatur Ilmiah)**  
> **Proyek**: WASKITA — Pre-Publishing Semantic Curation & Information Gain Engine  
> **Peneliti**: Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Tanggal Audit**: 12 November 2026  
> **Cakupan Berkas yang Diaudit**:
> - `backend/app/services/nlp_pipeline.py` (630 baris)
> - `backend/app/services/vsm_calculator.py` (98 baris)
> - `backend/app/services/information_gain.py` (299 baris)
> - `backend/app/services/stylometrics.py` (147 baris)
> - `backend/app/services/gatekeeper.py` (599 baris)
> - `backend/app/services/serp_scraper.py` (593 baris)
> - `backend/app/api/v1/endpoints/audit_endpoints.py` (746 baris)
> - `backend/tests/evaluate_accuracy.py` (260 baris) & `backend/app/fixtures/benchmark_corpus.py` (217 baris)

---

## BAGIAN 1: ALGORITMA PEMBANDING & REPOSITORI STANDAR INDUSTRI (STATE-OF-THE-ART)

Untuk mempertanggungjawabkan posisi ilmiah Waskita di hadapan penguji (khususnya menjawab catatan Ketua Penguji **Ibu Sartikha, S.ST., M.Eng.**), setiap komponen algoritma di Waskita harus dibandingkan secara objektif dengan algoritma *state-of-the-art* (SOTA) dari literatur ilmiah dan repositori terbuka (GitHub):

### 1.1 Modul Kemiripan Dokumen: Sublinear TF-IDF VSM vs. Okapi BM25 / BM25+
* **Implementasi Waskita Saat Ini**: Menggunakan `TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2), norm="l2")` dari `scikit-learn` (`vsm_calculator.py` baris 29–35).
* **Algoritma Pembanding Utama**: **Okapi BM25 & BM25+** (Robertson & Zaragoza, 2009; Lv & Zhai, 2011).
  * **Repositori GitHub Rujukan**:
    - [`dorianbrown/rank_bm25`](https://github.com/dorianbrown/rank_bm25) — Implementasi standar Python untuk *Okapi BM25*, *BM25L*, dan *BM25+*.
    - [`AmenRa/retriv`](https://github.com/AmenRa/retriv) — Mesin pencari hibrida berkecepatan tinggi berbasis Numba & BM25.
  * **Perbedaan Matematis**:
    TF-IDF standar menormalisasi panjang dokumen menggunakan norma Euclidean $L_2$ ($\|\mathbf{v}\|_2 = 1$). Kelemahannya, dokumen kompetitor yang sangat panjang (misal 2.500 kata) memiliki vektor yang lebih padat sehingga sudut kosinus terhadap draf pendek (350 kata) terdilusi secara tidak proporsional (*document length dilution*).
    **BM25** menyelesaikan ini secara analitik tanpa perlu *sliding-window* kasar melalui parameter saturasi frekuensi $k_1 \in [1.2, 2.0]$ dan normalisasi panjang dokumen eksplisit $b \approx 0.75$:
    $$\text{Score}_{\text{BM25}}(D, Q) = \sum_{t \in Q} \text{IDF}(t) \cdot \frac{f(t, D) \cdot (k_1 + 1)}{f(t, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
  * **Referensi Ilmiah**:
    - Robertson, S., & Zaragoza, H. (2009). *The Probabilistic Relevance Framework: BM25 and Beyond*. Foundations and Trends in Information Retrieval, 3(4), 333–389.
    - Lv, Y., & Zhai, C. (2011). *Lower-Bounding Term Frequency Normalization (BM25+)*. Proceedings of ACM CIKM 2011, 7–16.

### 1.2 Modul Ekstraksi Entitas & Information Gain: Frekuensi N-Gram vs. YAKE! / KeyBERT / Maximal Marginal Relevance (MMR)
* **Implementasi Waskita Saat Ini**: Menghitung frekuensi kemunculan unigram & bigram dengan pengali heuristik `1.35x` untuk bigram (`nlp_pipeline.py` baris 503) serta operasi selisih himpunan $\Delta_{\text{gain}} = E_{\text{draft}} \setminus E_{\text{SERP}}$ (`information_gain.py` baris 187).
* **Algoritma Pembanding Utama**:
  1. **YAKE! (Yet Another Keyword Extractor)** — Ekstraksi frasa kunci statistik tanpa ketergantungan korpus eksternal.
     - **Repositori GitHub**: [`LIAAD/yake`](https://github.com/LIAAD/yake)
     - **Keunggulan**: Menggunakan 5 fitur statistik lokal: *Casing* ($W_{\text{Case}}$), *Word Position* ($W_{\text{Pos}}$ — kata di awal dokumen lebih penting), *Word Frequency* ($W_{\text{Freq}}$), *Word Relatedness to Context* ($W_{\text{Rel}}$ — mengukur seberapa sering kata muncul bersama kata lain seperti stopword), dan *Word DifSentence* ($W_{\text{DifSentence}}$ — sebaran kata lintas kalimat).
     - **Referensi**: Campos, R., Mangaravite, V., Pasquali, A., Jorge, A., Nunes, C., & Jatowt, A. (2020). *YAKE! Keyword Extraction from Single Documents using Multiple Local Features*. Information Sciences, 509, 257–289.
  2. **Maximal Marginal Relevance (MMR) & TREC Novelty Detection** — Standar klasik Information Gain & Redundancy.
     - **Persamaan MMR (Carbonell & Goldstein, 1998)**:
       $$\text{MMR} = \arg\max_{D_i} \left[ \lambda \cdot \text{Sim}_1(D_i, Q) - (1 - \lambda) \cdot \max_{D_j \in S} \text{Sim}_2(D_i, D_j) \right]$$
     - **Persamaan New Word Count / KL-Divergence With Reference Corpus (Allan et al., 2003; Zhang et al., 2002)**: Mengukur kebaruan kalimat/dokumen bukan hanya dari *set difference* biner, melainkan dari divergensi distribusi probabilitas Kullback-Leibler (KL-Divergence) dengan *Dirichlet smoothing* terhadap kumpulan dokumen acuan.
     - **Referensi**:
       - Carbonell, J., & Goldstein, J. (1998). *The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries*. ACM SIGIR 1998, 335–336.
       - Zhang, Y., Callan, J., & Minka, T. (2002). *Novelty and Redundancy Detection in Adaptive Filtering*. ACM SIGIR 2002, 81–88.

### 1.3 Modul Stilometri & Kekayaan Leksikal: MATTR vs. MTLD & HD-D
* **Implementasi Waskita Saat Ini**: Menggunakan TTR dan MATTR (*window size* $W = 50$) di `stylometrics.py` baris 19–36.
* **Algoritma Pembanding Utama**:
  - **Repositori GitHub**:
    - [`LSYS/LexicalRichness`](https://github.com/LSYS/LexicalRichness) — Paket Python standar untuk menghitung TTR, Root TTR (Guiraud), Corrected TTR (Carroll), **MATTR**, **MTLD** (*Measure of Textual Lexical Diversity*), dan **HD-D** (*Hypergeometric Distribution D*).
    - [`LCR-ADS-Lab/TAALED`](https://github.com/LCR-ADS-Lab/TAALED) — *Tool for the Automatic Assessment of Lexical Diversity*.
  - **Perbandingan Ilmiah**:
    - **MATTR (Covington & McFall, 2010)** menghitung rata-rata TTR pada jendela bergerak sepanjang $W$ token.
    - **MTLD (McCarthy & Jarvis, 2010)** mengukur rata-rata jumlah kata berurutan yang mampu mempertahankan nilai TTR di atas titik potong stabil ($0.720$).
  - **Referensi**:
    - Covington, M. A., & McFall, J. D. (2010). *Cutting the Gordian Knot: The Moving-Average Type–Token Ratio (MATTR)*. Journal of Quantitative Linguistics, 17(2), 94–100.
    - McCarthy, P. M., & Jarvis, S. (2010). *MTLD, vocd-D, and HD-D: A validation study of sophisticated approaches to lexical diversity assessment*. Behavior Research Methods, 42(2), 381–392.

### 1.4 Modul Deteksi Plagiarisme Kalimat Lokal: Jaccard/Containment vs. Broder's w-Shingling & MinHash
* **Implementasi Waskita Saat Ini**: Menghitung irisan himpunan stem kata per kalimat (`jaccard >= 0.50` atau `containment >= 0.72 and overlap >= 4`) di `gatekeeper.py` baris 210–215.
* **Algoritma Pembanding Utama**: **Broder's Resemblance & Containment over $w$-Shingles** (Broder, 1997).
  - **Repositori GitHub**: [`ekzhu/datasketch`](https://github.com/ekzhu/datasketch) & [`life4/textdistance`](https://github.com/life4/textdistance).
  - **Referensi**: Broder, A. Z. (1997). *On the resemblance and containment of documents*. Proceedings of Compression and Complexity of SEQUENCES 1997 (IEEE), 21–29.

### 1.5 Framework Evaluasi Sistem IR: `AmenRa/ranx` & `scikit-learn`
* **Repositori GitHub**: [`AmenRa/ranx`](https://github.com/AmenRa/ranx) (Bassani, ECIR 2022) untuk evaluasi perangkingan dan uji signifikansi statistik.

---

## BAGIAN 2: BEDAH FORENSIK 10 CELAH & BUG ALGORITMA WASKITA SAAT INI (BUKTI KODE NYATA)

Berdasarkan pembacaan kode baris demi baris dan eksekusi empiris pada codebase saat ini, ditemukan **10 celah dan bug algoritmik nyata** yang wajib Anda ketahui (dan menjelaskan secara persis mengapa Ketua Penguji memberikan 10 catatan revisi tersebut):

---

### 🚨 TEMUAN KRITIS #1: "Ilusi Akurasi 100%" — Seluruh 15 Draf Buruk di Dataset Uji Sebenarnya Mendapatkan Skor CDS Tinggi (77.3% – 83.9% > Ambang Batas 75.0%!)

* **Lokasi Kode**: `backend/tests/evaluate_accuracy.py` (baris 93–105 & output eksekusi) dan `backend/app/services/gatekeeper.py` (baris 340–387).
* **Bukti Empiris Nyata dari Output `evaluate_accuracy.py`**:
  Perhatikan skor **CDS%** pada 15 draf berlabel Ground Truth **"Perlu Revisi"** (draf nomor genap `draft-02` s.d. `draft-30`):
  - `draft-02`: MATTR = `0.7344`, HKO = `100.0%`, **CDS = `78.6%`** ($\ge 75.0\%$)
  - `draft-04`: MATTR = `0.6501`, HKO = `100.0%`, **CDS = `77.3%`** ($\ge 75.0\%$)
  - `draft-06`: MATTR = `0.6672`, HKO = `100.0%`, **CDS = `79.9%`** ($\ge 75.0\%$)
  - `draft-08`: MATTR = `0.7024`, HKO = `100.0%`, **CDS = `80.1%`** ($\ge 75.0\%$)
  - `draft-12`: MATTR = `0.6932`, HKO = `100.0%`, **CDS = `81.4%`** ($\ge 75.0\%$)
  - `draft-16`: MATTR = `0.6385`, HKO = `100.0%`, **CDS = `82.2%`** ($\ge 75.0\%$)
  - `draft-24`: MATTR = `0.6618`, HKO = `100.0%`, **CDS = `83.9%`** ($\ge 75.0\%$)
* **Akar Masalah (Mengapa Ini Terjadi?)**:
  1. Ambang batas kelulusan CDS ditetapkan `min_cds_score = 75.0`. Namun **100% dari draf buruk memiliki skor CDS di atas 77.3% (rata-rata ~80.0%)**!
  2. Mengapa draf buruk tetap terprediksi `"Perlu Revisi"` sehingga akurasi terlihat 100%? **Semata-mata karena flag boolean `is_keyword_stuffed` (`hko_percentage > 40.0`) di baris 359 & 382 `gatekeeper.py`!**
  3. Mengapa skor CDS draf buruk sangat tinggi (~80%)?
     - **Normalisasi MATTR Cacat Scaling (`gatekeeper.py` baris 341–343)**:
       ```python
       tau_mattr = max(0.1, thresholds.min_mattr) # 0.55
       c_mattr_raw = 100.0 * min(1.0, mattr_score / tau_mattr)
       ```
       Karena pada teks Bahasa Indonesia طول 50 kata, bahkan teks yang sangat repetitif sekalipun memiliki `mattr_score` antara `0.62` hingga `0.73` (jauh di atas `0.55`), maka $\frac{\text{mattr\_score}}{0.55} > 1.0 \implies C_{\text{MATTR}} = 100.0\%$! Artinya, **seluruh draf buruk mendapatkan nilai sempurna 100% (20 poin penuh) pada komponen MATTR**!
     - **Komponen $C_{\text{HKO}}$ Hanya Bernilai 15%**: Meskipun draf buruk mendapat $C_{\text{HKO}} = 0\%$ karena HKO = 100%, tiga pilar lainnya ($C_{\text{VSM}} \approx 35$, $C_{\text{IG}} \approx 25$, $C_{\text{MATTR}} = 20$) sudah menjumlahkan skor $\approx 80.0\%$!
* **Kaitan dengan Catatan Penguji**: Inilah alasan **Poin 6, 7, dan 10 Ibu Sartikha** menanyakan: *"Bagaimana hasil pengujian membuktikan bahwa Content Differentiation Score dapat digunakan sebagai alat bantu evaluasi kualitas artikel?"* — karena saat ini angka CDS-nya sendiri gagal mendiskriminasi draf buruk (< 75%), dan hanya ditolong oleh veto HKO!

---

### 🚨 TEMUAN KRITIS #2: 26 dari 30 Draf Uji di `evaluate_accuracy.py` Jatuh ke Korpus Sintetis Palsu (`_generate_synthetic_indonesian_corpus`)

* **Lokasi Kode**: `backend/app/fixtures/benchmark_corpus.py` (baris 5–147 & 207–217) dan `backend/tests/evaluate_accuracy.py` (baris 42).
* **Bukti Baris Kode**:
  Di `benchmark_corpus.py`, dictionary `CURATED_FALLBACK_BENCHMARKS` **hanya menyediakan 3 key topik**:
  1. `"kopi tubruk"` (cocok untuk `draft-01` & `draft-02`)
  2. `"kanker serviks"` (cocok untuk `draft-03` & `draft-04`)
  3. `"seo web"` (TIDAK COCOK untuk `draft-05` & `draft-06` karena kueri draf adalah `"panduan seo on page artikel blog"`, sehingga `"seo web" in q_low` bernilai `False` dan `q_low in "seo web"` bernilai `False`!)
  - Sedangkan 12 topik lainnya (`draft-07` s.d. `draft-30`: Monstera, Air Putih Hangat, Keuangan Pribadi, Insomnia, Mobil Listrik, Pupuk Kompos, Python, Kesehatan Mata, Reksa Dana, Ikan Lele, Korespondensi, Luka Bakar) **sama sekali tidak ada di `CURATED_FALLBACK_BENCHMARKS`**!
  - Akibatnya, **26 dari 30 draf uji (86.7% dataset)** dievaluasi terhadap `_generate_synthetic_indonesian_corpus(query)` (baris 150–204), yang isinya hanyalah 3 paragraf *template boilerplate* kosong seperti:
    > *"Topik mengenai {main_kw} saat ini menjadi salah satu pembahasan yang sangat penting di kalangan praktisi dan masyarakat Indonesia..."*
* **Dampak Fatal**:
  1. Karena kompetitornya cuma teks template kosong, maka istilah apa pun di dalam draf otomatis tidak ada di kompetitor, sehingga `gain_count` selalu $\ge 5$ ($100\%$ gain ratio!) dan `max_cosine_sim` selalu rendah ($\approx 0.15 - 0.25 \implies C_{\text{VSM}} = 100\%$).
  2. Di produksi (`audit_endpoints.py` baris 566), jika `serp_source == "offline_synthetic"`, vonis wajib menjadi `"Mode Demo"`, bukan `"Siap Terbit"`. Namun `evaluate_accuracy.py` mem-bypass logika tersebut.

---

### 🚨 TEMUAN KRITIS #3: Divergensi Pipeline Antara `evaluate_accuracy.py` vs. Endpoint Produksi `audit_endpoints.py`

* **Lokasi Kode**: `backend/tests/evaluate_accuracy.py` (baris 63–102) vs `backend/app/api/v1/endpoints/audit_endpoints.py` (baris 441–559).
* **Bukti Baris Kode**:
  Terdapat **4 perbedaan logika** antara skrip evaluasi akurasi dan API produksi:
  1. **Ekstraksi Long-Tail Gain Absen di Evaluasi**: `audit_endpoints.py` (baris 442) memanggil `extract_candidate_gain_entities(draft_content)` untuk mengambil Proper Nouns & Trigrams, sedangkan `evaluate_accuracy.py` (baris 63) tidak memanggilnya.
  2. **Penyaringan Konsensus SERP Berbeda**: `audit_endpoints.py` (baris 460–474) memfilter `serp_candidate_stems` dari `NON_TOPICAL_VERBS_AND_ADJECTIVES`, `is_narrative_noise()`, dan memotong Top-25 (`stem_freqs[:25]`). Sedangkan `evaluate_accuracy.py` (baris 80–88) **tidak melakukan filter tersebut dan tidak memotong Top-25**, serta **tidak mengoper parameter `consensus_serp_stems`** ke dalam `calculate_information_gain()` (baris 68–74)!
  3. **Deteksi Kalimat Plagiat (`red_span_ratio` & `max_consecutive_red`) Dilewati di Evaluasi**: `audit_endpoints.py` (baris 517–559) menghitung `generate_annotated_spans()` lalu mengirim `red_span_ratio` dan `max_consecutive_red` ke `calculate_composite_cds()`. Sedangkan `evaluate_accuracy.py` (baris 93–102) tidak memanggil `generate_annotated_spans()`, sehingga `red_span_ratio` selalu `0.0`!
  4. **Topic Relevance Gate (`avg_cosine_sim`) Dilewati di Evaluasi**: `evaluate_accuracy.py` tidak mengirim `avg_cosine_sim` ke `calculate_composite_cds()` (sehingga bernilai `None` dan gate Out-of-Domain mati saat evaluasi).

---

### 🚨 TEMUAN KRITIS #4: Bug Perhitungan Ulang `sub_scores` yang Rusak Saat Memuat Riwayat Sesi (`build_audit_execute_response`)

* **Lokasi Kode**: `backend/app/api/v1/endpoints/audit_endpoints.py` (baris 135–149) vs `backend/app/services/gatekeeper.py` (baris 324–351 & 399–408).
* **Bukti Baris Kode**:
  Karena tabel database `MetricResult` tidak menyimpan kolom `c_vsm`, `c_ig`, `c_mattr`, dan `c_hko`, fungsi `build_audit_execute_response()` di `audit_endpoints.py` baris 136–139 mencoba menebak ulang nilainya dengan rumus yang **SALAH**:
  ```python
  c_vsm = max(0.0, min(35.0, (1.0 - (m.max_cosine_similarity or 0.0)) * 35.0))
  c_mattr = min(20.0, ((m.mattr_score or 0.0) / 0.55) * 20.0)
  c_hko = max(0.0, (1.0 - ((m.hko_percentage or 0.0) / 40.0)) * 15.0)
  c_ig = max(0.0, (m.content_differentiation_score or 0.0) - c_vsm - c_mattr - c_hko)
  ```
* **Bukti Kerusakan Matematis**:
  1. Pada `gatekeeper.py` baris 347, jika `hko_percentage <= 40.0` (misal `25.0%`), maka `c_hko = 100.0` (kontribusi poin = $15.0$). Tetapi pada `audit_endpoints.py` baris 138, `hko_percentage = 25.0%` dihitung menjadi `(1 - 25/40) * 15 = 5.625` (hilang $9.375$ poin!).
  2. Pada `gatekeeper.py` baris 324, `max_cosine_sim <= 0.25` memberikan `c_vsm = 100.0` (kontribusi poin = $35.0$). Tetapi di `audit_endpoints.py` baris 136, `max_cosine_sim = 0.25` dihitung `(1 - 0.25) * 35 = 26.25` (hilang $8.75$ poin!).
  3. Seluruh kehilangan poin ($9.375 + 8.75 = 18.125$ poin) kemudian ditambahkan secara liar ke `c_ig` melalui rumus residu `cds - c_vsm - c_mattr - c_hko`, sehingga `c_ig` pada riwayat sesi dapat menampilkan angka **48.1 dari maksimal 30 poin**!
  4. Selain itu, key `c_vsm`, `c_ig`, `c_mattr`, `c_hko` di baris 145–148 diisi nilai terboboti (`0..35`), padahal di `gatekeeper.py` baris 404–407 diisi nilai skala `0..100`.

---

### 🚨 TEMUAN KRITIS #5: Diskrepansi Rumus TF-IDF Proposal vs. `scikit-learn` pada Korpus Mikro ($N=4$)

* **Lokasi Kode**: `backend/app/services/vsm_calculator.py` (baris 29–35).
* **Bukti Matematis (Menjawab Poin 3 Ibu Sartikha)**:
  - Di Proposal Bab 2 (Persamaan 2.1), rumus yang ditulis adalah TF-IDF klasik:
    $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{N}{\text{DF}(t)}\right)$$
    Menurut rumus di proposal tersebut, jika sebuah kata muncul di **semua 4 dokumen** ($\text{DF}(t) = N = 4$), maka $\log(4/4) = \log(1) = 0$ (bobot kata tersebut menjadi **0**).
  - Namun di kode `vsm_calculator.py` baris 29:
    ```python
    vectorizer = TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2), min_df=1, norm="l2")
    ```
    Secara *default*, `scikit-learn` menggunakan `smooth_idf=True` dan logaritma natural ($\ln$) dengan konstanta $+1$ di luar logaritma:
    $$\text{TF}_{\text{sublinear}}(t, d) = 1 + \ln(\text{tf}(t, d))$$
    $$\text{IDF}_{\text{sklearn}}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$
  - Akibatnya:
    1. Rumus di laporan **tidak cocok** dengan rumus di kode (`sublinear_tf` dan `smooth_idf + 1`).
    2. Karena $N$ sangat kecil ($N=4$ untuk 1 draf + 3 kompetitor), kata yang muncul di semua dokumen ($\text{df}=4$) tetap mendapat $\text{IDF} = 1.0$, sedangkan kata yang sangat langka ($\text{df}=1$) hanya mendapat $\text{IDF} = \ln(5/2) + 1 = 1.916$. Rasio pembeda IDF antara kata paling pasaran vs kata paling unik tertekan menjadi hanya $1 : 1.916$!

---

### 🚨 TEMUAN KRITIS #6: Kurva Monotonik $C_{\text{VSM}}$ Memberi Nilai 100% pada Artikel yang Tidak Nyambung (Menjawab Poin 4 Ibu Sartikha)

* **Lokasi Kode**: `backend/app/services/gatekeeper.py` (baris 324 & 362).
* **Bukti Baris Kode**:
  ```python
  c_vsm_doc = 100.0 * (1.0 - max(0.0, (max_cosine_sim - 0.25) / 0.75))
  ```
* **Celah Matematis**:
  - Fungsi di atas bersifat **monoton turun murni**: semakin mendekati $0$ nilai `max_cosine_sim`, semakin tinggi skor $C_{\text{VSM}}$ (mencapai $100\%$ penuh untuk semua $0 \le S_{\cos}^{\max} \le 0.25$).
  - Jika sebuah draf hanya menyentuh topik secara sangat dangkal sehingga `avg_cosine_sim = 0.051` (lolos tipis dari gate Out-of-Domain `< 0.05`) dan `max_cosine_sim = 0.08`, sistem justru menghadiahi draf yang hampir tidak relevan itu dengan **$C_{\text{VSM}} = 100\%$**!
  - Sebaliknya, draf berkualitas tinggi yang membahas topik yang sama secara mendalam bersama kompetitor cenderung memiliki kemiripan kosakata domain sekitar $S_{\cos}^{\max} \in [0.30, 0.45]$, yang justru terkena penalti linier pada rumus di atas.

---

### 🚨 TEMUAN KRITIS #7: Degradasi Komponen Unigram di `all_serp_full_stems` Menggugurkan Bigram Gain yang Valid ($\Delta_{\text{gain}}$ False Negative)

* **Lokasi Kode**: `backend/app/services/information_gain.py` (baris 168–171 & 198–199).
* **Bukti Baris Kode**:
  ```python
  # Baris 168-171: Memecah semua bigram kompetitor menjadi kata tunggal ke dalam all_serp_full_stems
  for part_st in list(comp_full_set):
      for p in part_st.split():
          if len(p) > 2:
              all_serp_full_stems.add(p)
  ...
  # Baris 198-199: Menggugurkan bigram draf jika kedua kata tunggalnya pernah muncul di mana saja di SERP
  if len(parts) > 1 and all(p in all_serp_full_stems for p in parts):
      continue
  ```
* **Celah Logika**:
  - Dalam linguistik komputasional, konsep teknis baru sering kali berupa **komposisi frasa nomina (bigram)** dari kata-kata yang secara terpisah umum ditemukan (contoh: kata `"jaringan"` ada di Kompetitor 1, dan kata `"saraf"` ada di Kompetitor 3 dalam konteks berbeda, tetapi draf membahas `"jaringan saraf"` / *neural network*).
  - Karena baris 198 mengecek `all(p in all_serp_full_stems for p in parts)` terhadap gabungan seluruh kata tunggal dari seluruh kompetitor, maka **setiap bigram konsep baru yang kata penyusunnya kebetulan pernah muncul terpisah di kompetitor berbeda akan langsung DIHAPUS dari $\Delta_{\text{gain}}$**!

---

### 🚨 TEMUAN KRITIS #8: Fallback Bobot TF-IDF `0.75` Menggelembungkan Skor Entitas Non-VSM hingga 8 Kali Lipat

* **Lokasi Kode**: `backend/app/services/information_gain.py` (baris 200–202).
* **Bukti Baris Kode**:
  ```python
  weight = draft_tfidf_weights.get(stem, 0.75)
  if len(parts) >= 2:
      weight = round(weight * 1.15, 4)
  ```
* **Celah Matematis**:
  - Di `vsm_calculator.py`, vektor TF-IDF dinormalisasi dengan $L_2$ norm (`norm="l2"`). Untuk draf 350–500 kata, nilai bobot TF-IDF riil di dalam `draft_tfidf_weights` berkisar antara **`0.0400` hingga `0.1800`**.
  - Namun, kandidat entitas dari `extract_candidate_gain_entities()` dapat berupa **Trigram** (`len(parts) == 3`), sedangkan `TfidfVectorizer` hanya diatur `ngram_range=(1, 2)`. Artinya, trigram **pasti tidak ada** di dalam `draft_tfidf_weights`!
  - Begitu key tidak ditemukan, kode memberikan nilai fallback **`0.75`** (dan dikali `1.15` menjadi **`0.8625`**). Akibatnya, saat diurutkan dengan `gain_items.sort(key=lambda x: x.tfidf_weight, reverse=True)` di baris 211, item yang gagal masuk matriks TF-IDF justru menduduki peringkat teratas mengalahkan entitas yang benar-benar memiliki bobot TF-IDF tertinggi!

---

### 🚨 TEMUAN KRITIS #9: Kekebalan Plagiarisme Kalimat Akibat Substring Heading (`any(h in sentence for h in detected_headings)`)

* **Lokasi Kode**: `backend/app/services/gatekeeper.py` (baris 180–188).
* **Bukti Baris Kode**:
  ```python
  is_heading = (
      sentence in detected_headings
      or is_numbered_heading
      or bool(re.match(r"^#{1,4}\s+", sentence))
      or any(h in sentence for h in detected_headings)
  )
  if is_heading:
      spans.append(AnnotatedSpan(text=sentence, color=None, label="Sub-Judul / Heading", is_heading=True))
      continue
  ```
* **Celah Logika**:
  - Kondisi `any(h in sentence for h in detected_headings)` mengecek apakah teks heading `h` merupakan **substring** dari kalimat paragraf `sentence`.
  - Contoh nyata: Jika draf memiliki sub-judul `## Gejala Awal` atau `## Kopi Tubruk`, maka **seluruh kalimat panjang di dalam paragraf** yang mengandung frasa `"Kopi Tubruk"` atau `"Gejala Awal"` akan dievaluasi sebagai `is_heading = True`!
  - Dampaknya:
    1. Kalimat paragraf biasa berubah tampilan menjadi blok Heading di antarmuka pengguna.
    2. Karena langsung `continue` di baris 188, kalimat tersebut **melewati pemeriksaan stabilo Merah (plagiasi), Kuning (klise), dan Biru (monoton)**!

---

### 🚨 TEMUAN KRITIS #10: Pencocokan Substring Tanpa Word-Boundary (`\b`) pada Pencarian Bukti Snippet Kompetitor

* **Lokasi Kode**: `backend/app/services/information_gain.py` (baris 40 & 75).
* **Bukti Baris Kode**:
  ```python
  if (surface_low in s_low or stem_low in s_low) and len(s_clean.split()) >= 5:
  ```
* **Celah Logika**:
  - Mengecek `stem_low in s_low` menggunakan operator substring biasa, bukan *regular expression word boundary* (`\b`).
  - Jika `stem_low` adalah kata pendek (4 huruf) seperti `"pola"`, `"seni"`, `"asri"`, `"kaji"`, atau `"cair"`, maka kalimat kompetitor yang sama sekali tidak membahas kata tersebut tetapi mengandung kata `"polarisasi"`, `"seniman"`, `"pasri"`, `"mengaji"`, atau `"pencairan"` akan dicomot secara salah sebagai cuplikan bukti empiris (*White-Box Forensics*)!

---

## BAGIAN 3: RUMUSAN SOLUSI PERBAIKAN MATEMATIS & ARSITEKTURAL (BLUEPRINT SIAP IMPLEMENTASI & PERTAHANAN SIDANG)

Berikut adalah rumusan solusi perbaikan yang presisi, berbasis referensi ilmiah, dan langsung menjawab seluruh 10 poin catatan Ibu Sartikha:

---

### Solusi 1: Kalibrasi Ulang Normalisasi MATTR dengan *Min-Max Piecewise Scaling* (Menjawab Poin 6 & 7 Bu Sartikha)

* **Masalah yang Diperbaiki**: Rumus lama `min(1.0, mattr / 0.55)` memberikan nilai 100% pada semua draf karena MATTR teks Bahasa Indonesia ($W=50$) hampir selalu berada di rentang $[0.55, 0.95]$.
* **Landasan Referensi**: Covington & McFall (2010) menunjukkan bahwa pada jendela $W=50$, teks ekspositori alami memiliki distribusi MATTR di rentang $0.70 - 0.90$, sedangkan teks repetitif berada di bawah $0.68$.
* **Formula Baru (Piecewise Linear Calibration)**:
  Tetapkan batas bawah penalti penuh $\tau_{\text{floor}} = 0.50$ dan batas saturasi ideal $\tau_{\text{ideal}} = 0.82$:
  $$C_{\text{MATTR}} = 100 \times \text{clip}\left(\frac{\text{MATTR} - \tau_{\text{floor}}}{\tau_{\text{ideal}} - \tau_{\text{floor}}}, \, 0.0, \, 1.0\right) = 100 \times \text{clip}\left(\frac{\text{MATTR} - 0.50}{0.32}, \, 0.0, \, 1.0\right)$$
* **Efek pada Dataset 30 Draf**:
  - Draf AI repetitif (`MATTR = 0.64`): $C_{\text{MATTR}} = 100 \times \frac{0.64 - 0.50}{0.32} = 43.75\%$ (poin = $8.75 / 20$, bukan lagi $20/20$!).
  - Draf Editor kaya diksi (`MATTR = 0.91`): $C_{\text{MATTR}} = 100\%$ (poin = $20 / 20$).
  - Selain itu, naikkan ambang batas veto `min_mattr` dari `0.55` menjadi **`0.68`** (atau hitung MATTR pada token yang sudah di-*stem* via PySastrawi agar repetisi kata berimbuhan terdeteksi secara akurat).

---

### Solusi 2: Kurva *Trapezoidal Goldilocks Zone* pada $C_{\text{VSM}}$ (Menjawab Poin 4 Bu Sartikha: Cosine Similarity Bukan Penentu Tunggal)

* **Masalah yang Diperbaiki**: Cosine Similarity yang terlalu rendah ($< 0.15$) tidak boleh diberi nilai 100% karena mengindikasikan kurangnya relevansi topik terhadap SERP.
* **Formula Baru (Fungsi Keanggotaan Trapesium / *Semantic Sweet-Spot*)**:
  - **Zona 1 (Out-of-Domain / Kurang Relevan, $S_{\cos}^{\max} < 0.12$)**: Skor naik linier dari $0$ hingga $100$:
    $$C_{\text{VSM}} = 100 \times \frac{S_{\cos}^{\max}}{0.12}$$
  - **Zona 2 (Zona Ideal / *Differentiated Relevance*, $0.12 \le S_{\cos}^{\max} \le 0.35$)**: Topik relevan namun membawa sudut pandang berbeda:
    $$C_{\text{VSM}} = 100.0$$
  - **Zona 3 (Zona Redundansi / Kemiripan Berlebih, $S_{\cos}^{\max} > 0.35$)**: Skor turun secara proporsional:
    $$C_{\text{VSM}} = 100 \times \max\left(0.0, \, 1.0 - \frac{S_{\cos}^{\max} - 0.35}{0.65}\right)$$
* **Keunggulan Ilmiah**: Menjawab langsung kritik Ibu Sartikha Poin 4! Grafik $C_{\text{VSM}}$ berbentuk trapesium (*inverted-U plateau*): menghukum naskah yang menyimpang dari topik ($S_{\cos} \to 0$) maupun naskah yang menjiplak kompetitor ($S_{\cos} > 0.60$).

---

### Solusi 3: Target Information Gain Proporsional & Salience Filtering (Menjawab Poin 5 Bu Sartikha)

* **Masalah yang Diperbaiki**:
  1. Target gain statis `gain_count / 5.0` terlalu mudah ditembus dengan kata sembarangan.
  2. Penghapusan bigram gain di `information_gain.py` baris 198 terlalu agresif.
  3. Fallback bobot `0.75` merusak urutan TF-IDF.
* **Rumusan Perbaikan**:
  1. **Proporsional Gain Target**: Target jumlah entitas baru ($\tau_{\text{gain}}$) menyesuaikan panjang naskah (misal 1 entitas baru substantif per 75 kata naskah, minimal 5):
     $$\tau_{\text{gain}} = \max\left(5, \, \left\lfloor \frac{N_{\text{words}}}{75} \right\rfloor\right)$$
  2. **Perbaikan Filter Bigram Gain (Baris 198 `information_gain.py`)**:
     Jangan menggugurkan bigram `A B` hanya karena unigram `A` dan unigram `B` muncul terpisah di kompetitor berbeda. Gugurkan hanya jika bigram `A B` itu sendiri memang muncul di `all_serp_full_stems`!
  3. **Perbaikan Skala Bobot Fallback (Baris 200 `information_gain.py`)**:
     Ganti angka magis `0.75` dengan **median/persentil ke-75 dari `draft_tfidf_weights.values()`** (misal `np.percentile(list(draft_tfidf_weights.values()), 75)` jika ada, atau `0.12`), sehingga entitas dari `extract_candidate_gain_entities` berada pada skala yang setara dengan matriks TF-IDF.

---

### Solusi 4: Penyelarasan Rumus TF-IDF di Dokumen Laporan dan Kode (`vsm_calculator.py`) (Menjawab Poin 3 Bu Sartikha)

* **Masalah yang Diperbaiki**: Perbedaan rumus klasik di Bab 2 dengan `TfidfVectorizer(sublinear_tf=True, smooth_idf=True)` di kode.
* **Rumusan Perbaikan**:
  Tuliskan secara eksplisit di Bab 2 (Persamaan 2.1) formulasi **Sublinear TF dengan Smoothed IDF** (Manning et al., 2008, hlm. 126–128; Dokumentasi Resmi `scikit-learn`):
  $$\text{wf}_{t,d} = \begin{cases} 1 + \ln(\text{tf}_{t,d}) & \text{jika } \text{tf}_{t,d} > 0 \\ 0 & \text{lainnya} \end{cases}$$
  $$\text{idf}_t = \ln\left(\frac{1 + N}{1 + \text{df}_t}\right) + 1$$
  $$w_{t,d} = \frac{\text{wf}_{t,d} \times \text{idf}_t}{\sqrt{\sum_{k \in d} (\text{wf}_{k,d} \times \text{idf}_k)^2}}$$
  Ini membuktikan kepada penguji bahwa Anda benar-benar menguasai cara kerja internal `scikit-learn` dan alasan matematis di balik *sublinear scaling* (mencegah satu kata yang diulang 20 kali mendominasi vektor) serta *Laplace smoothing* $+1$ (mencegah *division by zero*).

---

### Solusi 5: Melengkapi Korpus Benchmark 15 Topik di `benchmark_corpus.py` & Menyelaraskan `evaluate_accuracy.py` (Menjawab Poin 8, 9, 10 Bu Sartikha)

* **Masalah yang Diperbaiki**: 13 dari 15 topik di `dataset_30_drafts.json` jatuh ke generator sintetis karena `CURATED_FALLBACK_BENCHMARKS` hanya berisi 3 topik, serta `evaluate_accuracy.py` tidak memanggil pipeline lengkap.
* **Rumusan Perbaikan**:
  1. Lengkapi `CURATED_FALLBACK_BENCHMARKS` untuk seluruh **15 kueri topik** yang ada di `dataset_30_drafts.json` (masing-masing 3 artikel kompetitor riil hasil ekstraksi SERP).
  2. Samakan langkah pemanggilan di `evaluate_accuracy.py` agar 100% identik dengan `audit_endpoints.py` (menyertakan `extract_candidate_gain_entities`, `generate_annotated_spans`, `red_span_ratio`, `max_consecutive_red`, dan `avg_cosine_sim`).
  3. Tambahkan ke dalam `dataset_30_drafts.json` skenario uji batas (*boundary/grey-area cases*): misalnya draf buatan manusia yang dangkal/plagiat (harus terdeteksi *Perlu Revisi*) dan draf bantuan AI yang telah dikurasi mendalam dengan data primer oleh editor (harus terdeteksi *Layak Terbit*), serta hitung koefisien kesepakatan antar-penilai **Cohen's Kappa ($\kappa$)** dari 2 validator ahli.

---

### Solusi 6: Perbaikan Bug Teknis `build_audit_execute_response`, Heading Substring Immunity, dan Snippet Word-Boundary

1. **Di `audit_endpoints.py` baris 135–149**: Simpan `sub_scores` ke dalam JSON atau hitung ulang menggunakan fungsi `calculate_composite_cds()` yang asli, bukan rumus pendekatan yang salah.
2. **Di `gatekeeper.py` baris 184**: Hapus kondisi `or any(h in sentence for h in detected_headings)` dan gunakan pencocokan eksak setelah normalisasi tanda `#` (`sentence.lstrip("#").strip() in detected_headings`), sehingga kalimat paragraf tidak pernah salah diklasifikasikan sebagai heading.
3. **Di `information_gain.py` baris 40 & 75**: Gunakan regex dengan batas kata utuh `re.search(rf"\b{re.escape(term)}\b", s_low)` agar pencocokan cuplikan kalimat kompetitor presisi 100%.

---

## RINGKASAN MATRIKS PEMETAAN BUG KE CATATAN PENGUJI SEMPRO

| ID Bug | Lokasi File & Baris | Inti Masalah Algoritma | Menjawab Catatan Penguji Nomor |
| :--- | :--- | :--- | :--- |
| **BUG-01** | `evaluate_accuracy.py` L63–102 | Pipeline pengujian berbeda dari endpoint produksi (`audit_endpoints.py`) | Poin 10 (Skenario Evaluasi Sistem) |
| **BUG-02** | `benchmark_corpus.py` L5–147, L211 | 26 dari 30 draf uji jatuh ke teks sintetis generik (hanya 3 topik tersedia) | Poin 2 & Poin 8 (Kriteria Kompetitor & Dataset) |
| **BUG-03** | `vsm_calculator.py` L29–35, L54–70 | Diskrepansi rumus TF-IDF klasik vs `sublinear_tf` + `smooth_idf` pada $N=4$ | Poin 3 (Tahapan TF-IDF & Vektor) |
| **BUG-04** | `audit_endpoints.py` L136–149 | Rekonstruksi `sub_scores` riwayat sesi salah rumus & merusak nilai $C_{\text{IG}}$ | Poin 6 (Formula & Normalisasi CDS) |
| **BUG-05** | `gatekeeper.py` L324 | Fungsi $C_{\text{VSM}}$ monotonik memberi 100% pada teks tidak relevan ($S_{\cos} \to 0$) | Poin 1 & Poin 4 (Interpretasi Cosine Similarity) |
| **BUG-06** | `information_gain.py` L168–171, L198 | Pemecahan unigram di `all_serp_full_stems` membunuh bigram $\Delta_{\text{gain}}$ valid | Poin 5 (Mekanisme Information Gain) |
| **BUG-07** | `information_gain.py` L200 | Nilai default TF-IDF `0.75` menggelembungkan skor trigram 8x lipat | Poin 5 & Poin 6 (Pembobotan Indikator) |
| **BUG-08** | `gatekeeper.py` L184 | Substring `any(h in sentence)` membuat kalimat plagiat kebal stabilo merah | Poin 1 & Poin 6 (Akurasi Deteksi Redundansi) |
| **BUG-09** | `stylometrics.py` L8, `gatekeeper.py` L341 | `min_mattr=0.55` terlalu rendah; 15 draf buruk mendapat $C_{\text{MATTR}}=100\%$ dan $\text{CDS} > 77\%$ | Poin 6 & Poin 7 (Threshold MATTR, HKO, & CDS) |
| **BUG-10** | `information_gain.py` L40, L75 | Pencocokan substring tanpa `\b` mengambil cuplikan kalimat kompetitor yang salah | Poin 5 (Relevansi Bukti Content Gap) |
