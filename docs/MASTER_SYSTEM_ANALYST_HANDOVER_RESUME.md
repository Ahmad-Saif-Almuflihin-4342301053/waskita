# MASTER RESUME & HANDOVER ARSITEKTUR WASKITA (SPRINT 1 - SPRINT 4.3)
## "Dokumen Transfer Konteks & Mandat Analisis Arsitektur Sistem WASKITA"

> **DOKUMEN INI ADALAH INSTRUKSI HANDOVER RESMI DARI SYSTEM ANALYST & LEAD ARCHITECT.**  
> **Untuk Agent Baru di Chat Baru:**  
> Begitu Anda menerima resume ini, Anda **LANGSUNG OTOMATIS** mengambil peran (**Role**) sebagai **Lead Architect & Senior System Analyst WASKITA**.  
> **DILARANG** melakukan modifikasi kode atau *git commit* langsung di percakapan ini. Seluruh modifikasi kode dilakukan oleh **Chat 2 (DevOps & GitHub Dispatcher)** berdasarkan berkas spesifikasi di direktori `docs/`.

---

## 1. FUNDAMENTAL PROYEK & ARSITEKTUR SISTEM WASKITA

* **Nama Proyek:** WASKITA (*Web-Article Semantic & Quality Inspection Tool for Pre-Publishing Audit*).
* **Hakikat Sistem:** Mesin audit pra-publikasi artikel berbasis *White-Box Information Retrieval (IR)*, Stilometri Leksikal, dan *Generative Engine Optimization (GEO)*. Membandingkan naskah draf penulis secara langsung terhadap artikel acuan dari **Google SERP Live (Serper.dev)**.
* **Tumpukan Teknologi (Tech Stack):**
  * **Backend:** Python FastAPI, Uvicorn, Sastrawi Stemmer, Scikit-learn (TF-IDF & Cosine Similarity), SQLite WAL (`backend/waskita.db`), Serper.dev API, `curl_cffi` (impersonasi browser anti-bot).
  * **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
  * **Infrastruktur:** Cloudflare Tunnel (`trycloudflare.com`), multi-worker branching Git.
* **Rumus Komposit Utama (Content Differentiation Score - CDS 0–100%):**
  $$\text{CDS} = 0.35 \times C_{\text{VSM}} + 0.30 \times C_{\text{IG}} + 0.20 \times C_{\text{MATTR}} + 0.15 \times C_{\text{HKO}}$$
  * $C_{\text{VSM}}$: Penalti kemiripan kosinus global dan redundansi kalimat lokal.
  * $C_{\text{IG}}$: Cakupan topik konsensus SERP + rasio kebaruan *Information Gain* ($\Delta_{\text{gain}}$).
  * $C_{\text{MATTR}}$: Kekayaan variasi kosakata (*Moving-Average Type-Token Ratio*, $L=50$, target $\ge 55\%$).
  * $C_{\text{HKO}}$: *Heading-Keyword Overlap* (target $\le 40\%$, anti-keyword stuffing).

---

## 2. RIWAYAT EVOLUSI & STATUS SPRINT TERAKHIR

| Sprint | Tag Rilis | Sorotan Pencapaian & Evolusi Teknis |
| :--- | :--- | :--- |
| **Sprint 3.10** | `v1.4.10-SNAPSHOT.1` | Pembersihan database sesi, Dedicated Deficit Card di bawah stabilo, jaring 25 Serper. |
| **Sprint 4.0** | `v1.5.0-SNAPSHOT.1` | *Red-Span Density Veto Gate* ($\ge 20\%$ kalimat merah otomatis memotong skor CDS maksimal $58\%$). |
| **Sprint 4.1** | `v1.5.1-SNAPSHOT.1` | Overhaul 14 cacat IR: Sliding-Window Cosine, 4-Page SERP Harvester (40 hasil), Akordeon Top-$K$ kompetitor, eliminasi halusinasi defisit Top-30, rekonstruksi prompt riwayat sidebar. |
| **Sprint 4.2** | `v1.5.2-SNAPSHOT.1` | *Precision Multi-Competitor Prompt* (4-pilar: eliminasi jiplakan, kelengkapan konsensus, nilai tambah unik, pembatasan kata *Word Budget*), *Long-Tail Information Gain*, *Target Query Locking* (🔒), *Dual-Tab Prompt* (CMS Pack vs Micro-Tuning). |
| **Sprint 4.3** | `v1.5.3-SNAPSHOT.1` | *(Sedang dalam tahap implementasi oleh Chat 2)*: Perbaikan Stabilo 4-Warna, Sub-Judul Bernomor bebas merah, Trigram Green Gain, Saturation Threshold 80% (CDS 100%), Visual Media Slot Cards, Blokir Slideshare. |

---

## 3. HASIL PENGUJIAN ADVERSARIAL NYATA (BENCHMARK CASE STUDY)

Pengujian dilakukan menggunakan artikel acuan kompetitor #1 Google (*sipil.uma.ac.id*) dengan topik *"arsitektur brutalisme, contoh bangunan"*:

1. **Uji Draf Jiplakan (Turn #1 - 100% Salin dari UMA, ~1.170 kata):**
   * **Hasil:** Vonis **"Perlu Revisi - Redundansi Kalimat Tinggi"**, Skor CDS **26%–37%**, Max Cosine Sim **99.8%–100%**.
   * **Evaluasi:** Sistem sukses 100% mendeteksi plagiasi dan menghukum naskah jiplakan.
2. **Uji Draf Revisi AI ChatGPT (Turn #2–#5, ~870–925 kata):**
   * **Hasil:** Vonis **"Siap Terbit"**, Skor CDS melonjak ke **97.8% (98%)**, Max Cosine Sim anjlok ke **10.9%**, MATTR **95.2%**, HKO **33.3%**. Panjang kata disiplin sesuai instruksi *Word Budget*.

---

## 4. TEMUAN 7 CACAT SISTEMIK & SOLUSI BLUEPRINT SPRINT 4.3

Berikut adalah rangkuman masalah krusial yang baru saja dibedah dan wajib dipahami oleh System Analyst baru:

1. **Sub-Judul Bernomor Menjadi Stabilo Merah & Dempet:**
   * *Masalah:* Baris `1. Unité d’Habitation (Marseille, Prancis)` dan `5. Kyoto International Conference Center (Kyoto, Jepang)` diawali angka, sehingga `line_clean[0].isupper()` gagal. Sistem menganggapnya kalimat isi, lalu rumus *Containment* ($\ge 0.72$) mewarnainya merah dan menempelkannya ke teks di sebelahnya.
   * *Solusi:* Regex penomoran `^\d+[\.\)]\s+[A-Z\u00C0-\u024F]` diakui sebagai sub-judul sah (`is_heading = True`) dan kebal dari stabilo merah.
2. **Stabilo Hijau Mati Total (0 Triggers):**
   * *Masalah:* Entitas Information Gain berupa 3-kata (trigram: *Robin Hood Gardens*, *Austria Karya Fritz*), tetapi loop pencocokan di `gatekeeper.py` hanya memeriksa unigram & bigram. Selain itu, pemecahan regex merusak tanda hubung (*Saint-Pierre*).
   * *Solusi:* Tambahkan pembuatan trigram, pencocokan substring langsung (`term_surface_form.lower() in sentence.lower()`), dan normalisasi hyphen/aksen ASCII.
3. **Stabilo Biru Mati Matematis:**
   * *Masalah:* Kriteria `local_ttr < 0.40` pada kalimat manusia normal mustahil tercapai.
   * *Solusi:* Ganti dengan deteksi kata konten repetitif ($\ge 3\times$ per kalimat atau TTR kata konten $< 0.60$).
4. **"Frankenstein Trigrams" pada Information Gain:**
   * *Masalah:* Ekstraksi n-gram melompati tanda koma dan memuat kata depan bahasa Indonesia (*Austria Karya Fritz*, *Prancis Yaitu Beton*).
   * *Solusi:* Terapkan *Clause-Bound Gain* (larang melompati tanda baca klausa `, ; : ( )`) dan larang kata hubung (*di, dan, yaitu, tanpa, karya*) di dalam entitas.
5. **Skor Mentok di 98% (Ketiadaan Ambang Jenuh):**
   * *Masalah:* `coverage_ratio` menuntut 100% dari 25 entitas 10 kompetitor sekaligus.
   * *Solusi:* Pasang *Saturation Threshold* 80% (`saturated_serp_target = int(serp_entities_count * 0.80)`), sehingga draf komprehensif dapat mencapai skor 100%.
6. **Kebocoran Repositori Dokumen OCR (Slideshare) di SERP:**
   * *Masalah:* `slideshare.net` lolos sebagai artikel kompetitor teks.
   * *Solusi:* Masukkan `slideshare.net`, `scribd.com`, `academia.edu` ke dalam blacklist dokumen yang dilewati.
7. **Arsitektur Sisipan Slot Gambar (Contextual Visual Media Slot):**
   * *Solusi:* Ekstrak konteks subjudul saat paste (`[gambar N: Ilustrasi Subjudul]`) dan render sebagai **Kartu Visual Slot Gambar interaktif** di antarmuka stabilo, sehingga penulis tahu persis letak aset foto saat publikasi CMS.

---

## 5. PETA BERKAS PENTING & ARSIP SPESIFIKASI

* **Spesifikasi Induk Terkini:**
  * `docs/SPRINT4_2_PRECISION_MULTI_COMPETITOR_PROMPT_AND_LONGTAIL_GAIN_SPEC.md`
  * `docs/SPRINT4_3_STABILO_PRECISION_AND_VISUAL_SLOTS_SPEC.md`
* **File Kritis Backend:**
  * `backend/app/services/gatekeeper.py` (Stabilo 4-warna, komposit CDS, prompt generator).
  * `backend/app/services/nlp_pipeline.py` (Stemming Sastrawi, ekstraksi entitas, stopword filter).
  * `backend/app/services/information_gain.py` (Matriks konsensus defisit & gain).
  * `backend/app/services/stylometrics.py` (Ekstraksi heading, HKO, MATTR).
  * `backend/app/services/serp_scraper.py` (Serper live scraper, bot protection, domain filter).
  * `backend/app/api/v1/endpoints/audit_endpoints.py` (Pipeline orkestrasi audit multi-turn).
* **File Kritis Frontend:**
  * `frontend/src/components/audit-block/AnnotatedTextSection.tsx` (Render stabilo & slot visual gambar).
  * `frontend/src/components/audit-block/RemediationPromptSection.tsx` (Dual-tab CMS vs Micro-Tuning).
  * `frontend/src/components/composer/FloatingComposerDock.tsx` (Editor naskah & lock kueri).
  * `frontend/src/utils/draftSanitizer.ts` (Pembersihan token media, alt-text, dan boilerplate WordPress).
  * `frontend/src/App.tsx` (State manajemen kueri, multi-turn, dan sesi).
