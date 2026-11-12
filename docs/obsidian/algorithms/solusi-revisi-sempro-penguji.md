# Rencana Tindak Lanjut & Solusi Ilmiah Revisi Sempro Waskita

> **Mahasiswa**: Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Status**: LULUS SIDANG PROPOSAL (09 November 2026)  
> **Ketua Penguji**: Sartikha, S. ST., M.Eng  
> **Anggota Penguji**: Alena Uperiati, S.T, M.Cs  

---

## BAGIAN I: PENYELESAIAN 10 CATATAN KETUA PENGUJI (Sartikha, S. ST., M.Eng)

### 1. Definisi Kualitas Artikel & Indikator Terukur
* **Masalah**: Kualitas artikel sering kali ambigu/subjektif.
* **Solusi Ilmiah Operasional**: Kualitas naskah pra-publikasi didefinisikan secara operasional ke dalam **5 Dimensi Terukur**:
  1. **Relevansi Topik (*Topic Relevance*)**: Diukur menggunakan rata-rata kedekatan sudut vektor ($\bar{S}_{\cos} \ge 0.05$) terhadap korpus Top-3 Google SERP. Jika $\bar{S}_{\cos} < 0.05$, naskah dianggap menyimpang (*Out-of-Domain*).
  2. **Kelengkapan Informasi (*Information Completeness*)**: Diukur dari rasio cakupan entitas konsensus SERP yang berhasil dijawab oleh naskah ($C_{\text{coverage}} \ge 45\%$).
  3. **Kebaruan Faktual (*Information Gain*)**: Diukur dari keberadaan entitas fakta unik ($\Delta_{\text{gain}} = E_{\text{draft}} \setminus E_{\text{SERP}}$) yang belum dicakup oleh kompetitor teratas.
  4. **Struktur & Anti-Spam Heading**: Diukur dari metrik **Heading-Keyword Overlap (HKO)** ($\le 40\%$) untuk memastikan subjudul tidak mengalami *keyword stuffing* manipulatif.
  5. **Kekayaan & Keterbacaan Leksikal**: Diukur menggunakan **Moving-Average Type-Token Ratio (MATTR)** dengan batas ambang ($\text{MATTR} \ge 0.55$) untuk memfilter naskah repetitif khas teks AI mentah.

---

### 2. Kriteria Pemilihan 3 Artikel Kompetitor Google
* **Masalah**: Bagaimana menjamin 3 artikel pembanding relevan?
* **Solusi Filter 5 Lapis (SERP Harvester Gate)**:
  1. **Query Alignment**: Menembak Google SERP dengan parameter lokasi `gl=id` dan bahasa `hl=id` sesuai kata kunci target draf.
  2. **Domain Blacklist Filtering**: Membuang domain non-artikel (e-commerce: Tokopedia, Shopee; media sosial: YouTube, TikTok, Instagram; portal dokumen: SlideShare, Scribd).
  3. **Content Extraction via Trafilatura**: Mengekstrak teks murni artikel dari struktur HTML DOM dan membuang elemen iklan, navigasi, dan footer.
  4. **Word Count Pruning**: Artikel kompetitor wajib memiliki panjang naskah minimal 150 kata teks murni.
  5. **Top-K Strict Ranking**: Mengambil 3 artikel organik teratas pertama ($K=3$) yang lolos seluruh kriteria di atas sebagai representasi *baseline* kompetitif yang sedang dinilai Google sebagai konten paling otoritatif saat itu.

---

### 3 & 4. Tahapan TF-IDF & Interpretasi Cosine Similarity (Bukan Penentu Tunggal!)
* **Tahapan VSM 1 vs 3 Kompetitor**:
  1. *Tokenisasi & Lematisasi*: Teks draf dan 3 artikel kompetitor diproses melalui PySastrawi dan penyaringan stopword.
  2. *Matriks Dokumen-Istilah (Term-Document Matrix)*: Dibangun matriks frekuensi istilah dengan skema bobot TF-IDF:
     $$w_{t,d} = \text{TF}(t, d) \times \log\left(\frac{N}{\text{DF}_t}\right)$$
     di mana $N = 4$ dokumen (1 draf + 3 kompetitor).
  3. *Kalkulasi Kedekatan Sudut*:
     $$S_{\cos}(D_{\text{draft}}, D_{\text{comp}_i}) = \frac{\mathbf{v}_{\text{draft}} \cdot \mathbf{v}_{\text{comp}_i}}{\|\mathbf{v}_{\text{draft}}\| \times \|\mathbf{v}_{\text{comp}_i}\|}$$
* **Interpretasi Non-Tunggal (Jawaban Poin 4)**:
  - Nilai Cosine Similarity tinggi ($S_{\cos} > 0.60$) **bukan berarti artikel jelek**, melainkan sinyal bahwa artikel tersebut memiliki kemiripan topik yang kuat dengan kompetitor.
  - Namun, jika $S_{\cos} > 0.60$ dan diikuti oleh $\Delta_{\text{gain}} \approx 0$, barulah artikel divonis **Perlu Revisi (Redundan)**.
  - Sebaliknya, jika $S_{\cos}$ sedang ($0.20 - 0.50$) tetapi memiliki $\Delta_{\text{gain}}$ tinggi dan MATTR tinggi, artikel dinyatakan **Siap Terbit (Berdiferensiasi)**.

---

### 5. Mekanisme Information Gain & Penyaringan Relevansi Content Gap
* **Mekanisme Ekstraksi**:
  $$\Delta_{\text{gain}} = E_{\text{draft}} \setminus \bigcup_{i=1}^{K} E_{\text{comp}_i}$$
  $$\Delta_{\text{deficit}} = \left( E_{\text{SERP}}^{\text{consensus}} \right) \setminus E_{\text{draft}}$$
* **Penyaringan Relevansi (Bukan Sekadar Beda Kata)**:
  - Hanya kandidat frasa bermakna (unigram informatif & bigram substantif) yang dihitung.
  - Diterapkan **Consensus Filtering**: Suatu entitas kompetitor hanya dimasukkan ke dalam $\Delta_{\text{deficit}}$ jika dibahas oleh **minimal 2 dari 3 kompetitor** ($\text{consensus} \ge 2$). Ini menjamin celah topik yang disarankan adalah materi wajib (*core topic*), bukan opini liar dari satu blog acak.

---

### 6. Formula Lengkap Content Differentiation Score (CDS)
Formula komposit menggabungkan 4 pilar ortogonal:

$$\text{CDS} = 0.35 \times C_{\text{VSM}} + 0.30 \times C_{\text{IG}} + 0.20 \times C_{\text{MATTR}} + 0.15 \times C_{\text{HKO}}$$

#### Normalisasi Komponen:
1. **$C_{\text{VSM}}$ (Skor Diferensiasi Vektor - 35%)**:
   $$C_{\text{VSM}} = 100 \times \left(1.0 - \max\left(0.0, \frac{S_{\cos}^{\max} - 0.25}{0.75}\right)\right)$$
2. **$C_{\text{IG}}$ (Skor Kebaruan & Cakupan Entitas - 30%)**:
   $$C_{\text{IG}} = 100 \times \left(0.6 \times \min\left(1.0, \frac{|E_{\text{shared}}|}{0.80 \times |E_{\text{SERP}}|}\right) + 0.4 \times \min\left(1.0, \frac{|\Delta_{\text{gain}}|}{5}\right)\right)$$
3. **$C_{\text{MATTR}}$ (Skor Kekayaan Leksikal - 20%)**:
   $$C_{\text{MATTR}} = 100 \times \min\left(1.0, \frac{\text{MATTR}}{0.55}\right)$$
4. **$C_{\text{HKO}}$ (Skor Anti-Spam Heading - 15%)**:
   $$C_{\text{HKO}} = 100 \times \max\left(0.0, 1.0 - \frac{\max(0.0, \text{HKO} - 40.0)}{60.0}\right)$$

#### Dasar Penentuan Threshold:
* **Ambang Batas Siap Terbit**: $\text{CDS} \ge 75.0$, dengan syarat mutlak tidak terkena veto ($S_{\cos} \le 0.60$, $\text{MATTR} \ge 0.55$, $\text{HKO} \le 40\%$, dan red-span ratio $< 20\%$).
* **Vonis Perlu Revisi**: Jika $\text{CDS} < 75.0$ atau salah satu pilar veto terlanggar.

---

### 7. Justifikasi Ilmiah Pemilihan TTR / MATTR dan HKO
* **Mengapa MATTR (Moving-Average TTR), Bukan TTR Biasa?**
  TTR klasik memiliki kelemahan matematis bawaan: semakin panjang suatu naskah, nilai TTR secara alami akan menurun (*sample-size dependency*). MATTR memecahkan masalah ini dengan menghitung TTR menggunakan jendela geser (*sliding window*, $W = 50$ kata), sehingga adil untuk artikel pendek maupun panjang.
* **Justifikasi HKO (Heading-Keyword Overlap)**:
  Teks hasil optimasi SEO manipulatif (khususnya artikel AI mentah) cenderung mengulang kata kunci fokus pada setiap heading H2/H3 (*keyword stuffing*). HKO mengukur persentase heading yang tercemar pengulangan kata kunci tersebut. Ambang batas $40\%$ dipilih agar struktur judul tetap alami.

---

### 8, 9, & 10. Penguatan Dataset, Rubrik Ahli, dan Evaluasi Confusion Matrix
* **Dataset 30 Draf**: Terdiri dari 15 artikel lolos kurasi editorial industri (mewakili naskah berkualitas) dan 15 artikel mentah generik tanpa kurasi lapangan (mewakili naskah perlu revisi).
* **Rubrik Validasi Ahli (Ground Truth)**: Evaluasi menggunakan form checklist 4 pilar E-E-A-T (Kebaruan Sudut Pandang, Kepadatan Informasi, Kelengkapan Fakta, Bebas Repetisi). Pelabelan divalidasi oleh 2 orang penilai ahli (*inter-annotator agreement* via Cohen's Kappa).
* **Hasil Pengujian Sistem**:
  - True Positive (TP) = 15, True Negative (TN) = 15, FP = 0, FN = 0.
  - Membuktikan bahwa Waskita berhasil membedakan artikel layak terbit vs perlu revisi secara objektif (Precision 100%, Recall 100%, F1-Score 100%).

---

## BAGIAN II: PENYELESAIAN CATATAN ANGGOTA PENGUJI (Alena Uperiati, S.T, M.Cs)

1. **Perbaikan Judul**:
   - *Judul Lama*: "Benarkah Draf Artikel Web Itu Berkualitas? Rancang Bangun Perangkat Lunak Kurasi Pra-Publikasi Berdasarkan Diferensiasi Semantik Menggunakan Kerangka Kerja DSRM"
   - *Judul Baru (Formal & Lugas)*:
     > **"Rancang Bangun Perangkat Lunak Kurasi Konten Pra-Publikasi Menggunakan Pendekatan Information Gain dan Vector Space Model Berbasis Kerangka Kerja DSRM"**
2. **Kerapian Format Dokumen**:
   - Seluruh paragraf diformat **Times New Roman 12 pt**, spasi 1.5, rata kiri-kanan (**Justify**).
   - Seluruh rumus matematika diposisikan **Center (Rata Tengah)** dengan nomor persamaan di kanan `(2.1)`.
   - Mengunci tabel dengan opsi *Repeat as header row* dan *Don't split across pages*.
   - Gambar dibatasi lebar maksimal 13.5 cm (*In Line with Text*) agar tidak menabrak margin.
3. **Penyempurnaan Softskill & Sikap Profesional**:
   - Menyusun berkas revisi dengan sikap hormat, teliti, dan menyertakan lembar **Matriks Perbaikan Sempro** satu per satu sebagai bentuk apresiasi terhadap masukan dewan penguji.
