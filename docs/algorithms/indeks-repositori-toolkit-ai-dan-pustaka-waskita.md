# Indeks Repositori AI Toolkit Global & Pustaka Standar Waskita v2

> **Tanggal Setup**: 12 November 2026  
> **Status**: Berhasil Diintegrasikan ke Sistem Komputer & Proyek Waskita  
> **Peneliti**: Ahmad Saif Almuflihin (NIM: 4342301053)  

---

## 1. REPOSITORI GLOBAL KOMPUTER (`~/ai-rules-toolkit/`)
Direktori ini berfungsi sebagai **Pusat Aturan & Pengetahuan AI (AI Knowledge Bank)** agar seluruh asisten AI di komputer ini bekerja layaknya *Senior System Analyst* dan *Software Architect*:

1. **`fabric` (`~/ai-rules-toolkit/fabric`)**
   - **Pembuat**: Daniel Miessler (25k+ Stars)
   - **Fungsi**: Framework modular berbasis *Markdown Patterns* (`analyze_claims`, `review_code`, `extract_wisdom`, `create_threat_model`).
2. **`awesome-cursorrules` (`~/ai-rules-toolkit/awesome-cursorrules`)**
   - **Pembuat**: PatrickJS & Komunitas
   - **Fungsi**: Bank aturan prompt untuk membedakan mode kerja: *Architect Mode (Planner)* vs *Coder Mode (Executor)*.
3. **`system-design-primer` (`~/ai-rules-toolkit/system-design-primer`)**
   - **Pembuat**: Donne Martin (280k+ Stars)
   - **Fungsi**: Standar industri desain sistem backend, analisis *trade-off* (plus-minus), dan mitigasi bug/kegagalan server.
4. **`architecture-decision-record` (`~/ai-rules-toolkit/architecture-decision-record`)**
   - **Pembuat**: Joel Parker Henderson
   - **Fungsi**: Format baku dokumen *Architecture Decision Record (ADR)* untuk mendokumentasikan alasan ilmiah pemilihan pustaka.

---

## 2. FILE ATURAN MASTER PROYEK (`.cursorrules`)
Di root proyek Waskita telah dipasang file `.cursorrules` yang menerapkan **Dual-Tier Workflow**:
- **Saat Menggunakan Model Tinggi / Mahal**: AI otomatis menjadi **Architect & System Analyst** (hanya membedah kode, menghitung matematika, membuat spesifikasi, DILARANG langsung koding).
- **Saat Menggunakan Model Rendah / Murah**: AI otomatis menjadi **Executor & Coder** (mengeksekusi instruksi langkah demi langkah dari file spesifikasi secara presisi tanpa berhalusinasi).

---

## 3. PUSTAKA STANDAR INDUSTRI UNTUK WASKITA v2 (`requirements.txt`)
Daftar pustaka open-source yang dipasang untuk menggantikan kode-kode rapuh/usang:

1. **`nlp-id` (Kumparan)**: Menggantikan PySastrawi untuk lematisasi artikel web modern & ekstraksi frasa kata benda (*Phrase Chunker*).
2. **`rank-bm25` (Robertson, 2009)**: Menggantikan *sliding-window* ad-hoc $35\% : 65\%$ dengan formula Okapi BM25 resmi untuk normalisasi panjang dokumen.
3. **`datasketch` (Broder, 1997)**: Menggantikan pencocokan kalimat manual dengan algoritma *MinHash & w-Shingling* standar IEEE untuk stabilo merah (anti-plagiasi kalimat).
4. **`loguru`**: Menggantikan modul logging standar untuk pelacakan thread async FastAPI dan rotasi log otomatis.
5. **`scikit-learn`**: Menghasilkan matriks evaluasi ilmiah formal (`classification_report`, `confusion_matrix`).
