# 📐 Dokumentasi Lengkap Diagram Bab 3 Skripsi WASKITA (Standar Akademik TRPL Polibatam)

> **Judul Skripsi**: *Rancang Bangun Perangkat Lunak Kurasi Konten Pra-Publikasi Menggunakan Pendekatan Information Gain dan Vector Space Model Berbasis Kerangka Kerja DSRM*  
> **Penulis**: Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Dosen Pembimbing**: Ari Wibowo, S.T., M.T.  
> **Status Berkas**: Tersimpan Resmi di Repositori (`docs/diagrams/`) & Vault Obsidian (`../diagrams/`)  
> **Format Tersedia**: Gambar Cetak HD (PNG 300 DPI Monokrom), Vektor (SVG), dan Berkas Mentahan Draw.io (`.drawio`) Siap Edit.

---

## 📌 Ringkasan Status Diagram Bab 3

| No | Nama Diagram | Standar Notasi | Status | File PNG Cetak | File Mentahan Draw.io |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | **ERD Notasi Chen (Konseptual)** | Peter Chen (Oval Atribut) | ✅ Selesai | `../diagrams/erd_chen_standar_kampus_bw.png` | `../diagrams/erd_chen_waskita.drawio` |
| **2** | **ERD Relasional (Fisikal/LDM)** | Crows Foot / Tabel Relasional | ✅ Selesai | `../diagrams/erd_relasional_standar_kampus_bw.png` | `../diagrams/erd_relasional_waskita.drawio` |
| **3** | **Use Case Diagram (Lengkap)** | UML OMG (Aktor Primer & Sekunder) | ✅ Selesai | `../diagrams/use_case_waskita_lengkap.png` | `../diagrams/use_case_waskita_lengkap.drawio` |
| **4** | **Use Case Diagram (Versi Bersih)** | UML OMG (5 Aktivitas Utama) | ✅ Selesai | `../diagrams/use_case_waskita_bersih.png` | `../diagrams/use_case_waskita_bersih.drawio` |
| **5** | **Sequence Diagram (Audit Flow)** | UML OMG (Alur 13 Langkah) | ✅ Selesai | `../diagrams/sequence_diagram_waskita.png` | `../diagrams/sequence_diagram_waskita.drawio` |
| **6** | **Flowchart Algoritma Sistem** | Activity / Flowchart DSRM | 📄 Ada di Word | Gambar Kedua di Dokumen Word (Revisi Serper $\rightarrow$ SearXNG) | Digambar langsung di Word / Draw.io |

---

## 1. Entity Relationship Diagram (ERD)

Basis data WASKITA menggunakan SQLite dengan mode WAL (*Write-Ahead Logging*) yang dikelola melalui SQLAlchemy ORM pada `backend/app/models/entities.py`. Terdapat 6 entitas utama: `USERS`, `AUDIT_SESSIONS`, `METRIC_RESULTS`, `COMPETITOR_SNAPSHOTS`, `COMPETITOR_DOCUMENTS`, dan `ENTITY_GAPS`.

### A. Versi Notasi Chen (Standar Konseptual Kampus — Atribut Oval)
*Format sesuai preferensi buku teks basis data kampus dan referensi Super User (garis relasi mandiri `merevisi` berbentuk dua garis paralel simetris ke belah ketupat).*

![[../diagrams/erd_chen_standar_kampus_bw.png]]

* **Karakteristik Visual**:
  * Kotak Persegi: Entitas utama.
  * Oval ("Bulat-Bulat"): Nama atribut kolom. Atribut *Primary Key* (`PK`) diberi format **tebal dan garis bawah**.
  * Belah Ketupat: Hubungan relasi (`melakukan`, `mengambil`, `menghasilkan`, `memiliki`, `memuat`, `merevisi`).
  * Relasi Mandiri `AUDIT_SESSIONS` $\rightarrow$ `merevisi`: Dua garis lurus bersih (Garis kiri = `1 / Sesi Induk`, Garis kanan = `N / Draf Revisi`).
  * Gaya: Monokrom murni (hitam-putih), tanpa kotak legenda di dalam gambar.
* **Tautan Berkas**:
  * PNG HD: [erd_chen_standar_kampus_bw.png](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/erd_chen_standar_kampus_bw.png)
  * File Draw.io: [erd_chen_waskita.drawio](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/erd_chen_waskita.drawio)

---

### B. Versi Tabel Relasional / Physical Data Model
*Format alternatif tabel relasional dengan tipe data kolom, penanda kunci (`PK`, `FK`), dan notasi kardinalitas orthogonal.*

![[../diagrams/erd_relasional_standar_kampus_bw.png]]

* **Kardinalitas Hubungan Antar-Tabel**:
  * `USERS` (1) $\rightarrow$ `AUDIT_SESSIONS` (N) : *One to Many*
  * `AUDIT_SESSIONS` (1) $\rightarrow$ `AUDIT_SESSIONS` (N) : *One to Many (Turn Revisi via parent_session_id)*
  * `AUDIT_SESSIONS` (1) $\rightarrow$ `COMPETITOR_SNAPSHOTS` (1) : *One to One*
  * `AUDIT_SESSIONS` (1) $\rightarrow$ `METRIC_RESULTS` (1) : *One to One*
  * `AUDIT_SESSIONS` (1) $\rightarrow$ `ENTITY_GAPS` (N) : *One to Many*
  * `COMPETITOR_SNAPSHOTS` (1) $\rightarrow$ `COMPETITOR_DOCUMENTS` (N) : *One to Many*
* **Tautan Berkas**:
  * PNG HD: [erd_relasional_standar_kampus_bw.png](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/erd_relasional_standar_kampus_bw.png)
  * File Draw.io: [erd_relasional_waskita.drawio](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/erd_relasional_waskita.drawio)

---

## 2. Use Case Diagram (UML)

Menjelaskan batasan sistem (*system boundary*) dan interaksi antara pengguna dengan fungsionalitas perangkat lunak.

### A. Versi Lengkap (Aktor Primer + Layanan Eksternal & `<<include>>`)
*Sesuai referensi gambar Anda (memuat Aktor Primer di kiri, boundary di tengah, dan Aktor Sekunder / Sistem Layanan di kanan).*

![[../diagrams/use_case_waskita_lengkap.png]]

* **Rincian Komponen**:
  * **Aktor Primer (Kiri)**: `Penulis / Editor Konten` (pengguna manusia).
  * **Aktor Sekunder (Kanan)**:
    * `<<service>> Mesin Pencari (Google / SearXNG)`: Layanan luar pemanen SERP.
    * `<<system>> Basis Data (SQLite Engine)`: Penyimpanan sesi, metrik, dan snapshot.
  * **Relasi `<<include>>`**: `Menjalankan Audit Mutu Konten` secara otomatis memicu `Memanen Korpus SERP Kompetitor` dan `Mengkalkulasi Metrik IR & Stilometri`.
* **Tautan Berkas**:
  * PNG HD: [use_case_waskita_lengkap.png](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/use_case_waskita_lengkap.png)
  * File Draw.io: [use_case_waskita_lengkap.drawio](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/use_case_waskita_lengkap.drawio)

---

### B. Versi Bersih (Tanpa `<<include>>` — Paling Bebas Debat Dosen)
*Jika saat asistensi bimbingan atau sidang Anda ingin tampilan yang lebih ringkas tanpa garis putus-putus.*

![[../diagrams/use_case_waskita_bersih.png]]

* **5 Aktivitas Utama**:
  1. `Memasukkan Draf Naskah & Kueri Target`
  2. `Menjalankan Audit Mutu Konten`
  3. `Melihat Laporan Diagnostik & Skor CDS`
  4. `Melakukan Perbaikan Draf (Turn Revisi)`
  5. `Mengekspor Laporan Hasil Audit`
* **Tautan Berkas**:
  * PNG HD: [use_case_waskita_bersih.png](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/use_case_waskita_bersih.png)
  * File Draw.io: [use_case_waskita_bersih.drawio](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/use_case_waskita_bersih.drawio)

---

## 3. Sequence Diagram (UML)

Menggambarkan alur eksekusi pesan secara kronologis antar-komponen perangkat lunak saat tombol **"Mulai Audit"** diklik oleh penulis.

![[../diagrams/sequence_diagram_waskita.png]]

### 6 Lifeline Komponen Perangkat Lunak:
1. `Penulis`: Aktor pengguna di peramban web.
2. `:Frontend (React UI)`: Komponen antarmuka pengguna web.
3. `:API Gateway (FastAPI)`: Controller layer yang mengorkestrasi logika audit (`audit_endpoints.py`).
4. `:SERP Harvester`: Modul scraper pencarian dan ekstraksi teks bersih (`serp_scraper.py` via SearXNG).
5. `:IR & NLP Engine`: Modul kalkulasi matematika VSM, Information Gain, Stilometri, dan Gatekeeper CDS (`vsm_calculator.py`, `information_gain.py`, `gatekeeper.py`).
6. `:Basis Data (SQLite)`: Lapisan persistensi data WAL (`entities.py`).

### 13 Langkah Alur Eksekusi:
1. `Penulis` $\rightarrow$ `Frontend`: Input draf naskah, kueri target, & klik *"Mulai Audit"*.
2. `Frontend` $\rightarrow$ `API Gateway`: `POST /api/v1/audit/execute (AuditExecuteRequest)`.
3. `API Gateway` $\rightarrow$ `SERP Harvester`: `search_and_scrape_competitors(target_query)`.
4. `SERP Harvester` (*Self-Call*): Unduh & ekstrak teks bersih Top-3 SERP via Trafilatura XML, saring media/PDF, validasi $k \ge 2$.
5. `SERP Harvester` $\rightarrow$ `API Gateway`: Kembalikan `competitor_docs` (List dokumen kompetitor).
6. `API Gateway` $\rightarrow$ `IR & NLP Engine`: `preprocess_and_compute_vsm(draft, competitor_docs)` (Stemming Sastrawi, VSM TF-IDF, & Cosine Similarity).
7. `API Gateway` $\rightarrow$ `IR & NLP Engine`: `calculate_information_gain & stylometrics` (Defisit entitas, $\Delta\text{Gain}$, TTR, MATTR, HKO).
8. `API Gateway` $\rightarrow$ `IR & NLP Engine`: `calculate_composite_cds & generate_annotated_spans` (Evaluasi ambang batas veto EEAT, rasio red-span, skor CDS).
9. `IR & NLP Engine` $\rightarrow$ `API Gateway`: Kembalikan keputusan *verdict* (`Siap Terbit` / `Perlu Revisi`), skor CDS (0–100), celah entitas, dan stabilo spans.
10. `API Gateway` $\rightarrow$ `Basis Data`: `db.add(AuditSession, MetricResult, Snapshot, Gaps)` (Simpan riwayat sesi audit, metrik matematis, & entitas).
11. `Basis Data` $\rightarrow$ `API Gateway`: `db.commit()` — Transaksi sukses, UUID `session_id` dihasilkan.
12. `API Gateway` $\rightarrow$ `Frontend`: Respons HTTP `200 OK` memuat `AuditExecuteResponse` JSON.
13. `Frontend` $\rightarrow$ `Penulis`: Render Dasbor White-Box, Rekomendasi Remedi, dan sorotan teks stabilo 4-warna.

* **Tautan Berkas**:
  * PNG HD: [sequence_diagram_waskita.png](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/sequence_diagram_waskita.png)
  * File Draw.io: [sequence_diagram_waskita.drawio](file:///home/saifmpleh/ObsidianVault/Properti_Freelance/../diagrams/sequence_diagram_waskita.drawio)

---

## 4. Hubungan dengan Diagram Alir Sistem (Flowchart Gambar Kedua di Dokumen Word)

Diagram alir pada dokumen Word Anda (*5 kotak proses DSRM*) **BUKAN pengganti** Sequence Diagram, melainkan **pendamping wajib**:

1. **Diagram Alir / Flowchart (Gambar Kedua di Word)**: Menjelaskan **metodologi riset & logika matematika** (bagaimana data bergerak dari validasi kata $\rightarrow$ pembobotan $\rightarrow$ rumus komposit CDS). Diagram ini disukai oleh dosen pakar kecerdasan buatan / NLP.
   > **Catatan Sinkronisasi**: Pada Kotak 2 di Word, ganti frasa *"Panggil Serper.dev API"* menjadi *"Panggil Layanan SERP (SearXNG / Google)"* agar 100% konsisten dengan arsitektur bebas biaya dan tanpa hardcode saat ini.
2. **Sequence Diagram (Bab 3.X)**: Menjelaskan **rekayasa perangkat lunak teknis** (bagaimana data dikirim lewat HTTP JSON dan disimpan ke SQLite WAL). Diagram ini wajib ada untuk memenuhi standar capaian pembelajaran TRPL (Rekayasa Perangkat Lunak).

---

## 5. Cara Mengedit Berkas `.drawio` di Komputer Anda

Jika Anda ingin mengubah tata letak, mengganti font, atau menyesuaikan teks:
1. Buka peramban (Chrome / Firefox) dan buka [app.diagrams.net](https://app.diagrams.net/).
2. Tarik (*drag and drop*) salah satu berkas dari folder `../diagrams/` langsung ke kanvas Draw.io:
   - `erd_chen_waskita.drawio`
   - `use_case_waskita_lengkap.drawio`
   - `sequence_diagram_waskita.drawio`
3. Seluruh kotak, oval, garis, dan teks bersifat vektor magnetik dan dapat digeser dengan bebas tanpa merusak layout.
