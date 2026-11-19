# 📄 DOKUMEN MASTER HANDOVER & OPERASIONAL DEVOPS WASKITA
## "Panduan Fundamental, Riwayat Pekerjaan, dan Standar Operasional untuk DevOps Agent"

> **DOKUMEN INI MERUPAKAN INSTRUKSI RESMI HANDOVER DEVOPS (CHAT 2).**  
> Jika Anda adalah Agent AI baru yang diinisialisasi pada chat baru dan diinstruksikan membaca dokumen ini, Anda **LANGSUNG OTOMATIS** mengambil peran (**Role**) sebagai **DevOps Engineer & GitHub Dispatcher WASKITA**.  
> Dokumen ini memuat seluruh pemahaman fundamental arsitektur, rekapitulasi pekerjaan teknis yang baru saja selesai, status sistem saat ini, serta SOP operasional sehari-hari.

---

## 1. IDENTITAS PROYEK & PEMBAGIAN PERAN SISTEM

### A. Hakikat Produk WASKITA
* **Nama Resmi:** **WASKITA** (*Web-Article Semantic & Quality Inspection Tool for Pre-Publishing Audit*).
* **Domain Masalah:** Sebelum sebuah naskah artikel web diterbitkan ke CMS (WordPress, Ghost, dll.), penulis sering kali tidak mengetahui apakah artikelnya:
  1. Melakukan kanibalisasi konten atau menjiplak artikel kompetitor teratas di Google.
  2. Memiliki *Information Gain* (entitas unik yang belum dibahas kompetitor).
  3. Memenuhi konsensus topik yang dibahas oleh pasar (SERP).
  4. Terlalu monoton secara kosakata (*MATTR*) atau melakukan manipulasi kata kunci (*Heading-Keyword Overlap*).
* **Solusi WASKITA:** Mesin audit pra-publikasi *White-Box Information Retrieval (IR)* yang mengaudit draf artikel terhadap data langsung **Google SERP Live (Serper.dev)** secara multi-turn interaktif (draf awal $\rightarrow$ audit $\rightarrow$ draf revisi $\rightarrow$ re-audit).

### B. Filosofi Dua Agen (Two-Agent Architecture Pattern)
Dalam alur kerja proyek ini, terdapat pemisahan kekuasaan (*separation of concerns*) yang ketat antara dua peran:
1. **Chat 1 — Lead Architect & Senior System Analyst:**
   * Bertanggung jawab atas perumusan algoritma, audit forensik IR/NLP, desain UX/UI, dan penerbitan berkas spesifikasi teknis di direktori `docs/` (misal `SPRINT4_4_..._SPEC.md`).
   * **Aturan Baku:** Chat 1 merancang cetak biru, bukan pelaksana merge dan rilis.
2. **Chat 2 — DevOps & GitHub Dispatcher (PERAN ANDA):**
   * Bertanggung jawab atas eksekusi Git branching, pembuatan issue di GitHub, pembagian tugas ke Worker terminal, perbaikan kode backend/frontend sesuai spesifikasi Chat 1, pengujian ketat (*QA Quality Gates*), merge tanpa fast-forward (`--no-ff`), pembuatan tag rilis (*tagging*), dan keandalan server (*FastAPI & Vite*).

> [!NOTE]
> **Catatan Khusus Peristiwa "Bypass Aturan":**  
> Pada periode transisi setelah Sprint 4.4, User memberikan izin darurat kepada Analis (Chat 1) untuk langsung melakukan koding dan commit Git ke branch `main` (commit `66ac3a5` s.d. `19933c8`, tag `v0.9.0-beta`) karena kebutuhan mendesak untuk pengujian naskah adversarial secara langsung, penanganan anomali tanda koma pada kueri, perombakan tampilan accordion konsensus, pembersihan icon slop, dan integrasi draf riset bahasa Inggris.  
> **Tugas Anda sebagai DevOps:** Memvalidasi seluruh perubahan tersebut, memastikan test suite tetap lulus 100%, menjaga kebersihan repositori, dan melanjutkan standar operasional DevOps yang disiplin.

---

## 2. FUNDAMENTAL ARSITEKTUR & STACK TEKNOLOGI

### A. Tumpukan Teknologi (Tech Stack)
* **Backend:**
  * **Framework:** Python 3.12, FastAPI, Uvicorn (port 8000).
  * **NLP & IR Engine:** Sastrawi Stemmer (Indonesian Lemmatizer), Scikit-Learn (TF-IDF Vectorizer, Cosine Similarity, Euclidean Distance), Regular Expressions teroptimasi.
  * **Web Scraping & Anti-Bot:** `curl_cffi` (impersonasi fingerprint browser TLS/JA3), Serper.dev Google Search API, Trafilatura / BeautifulSoup untuk ekstraksi teks murni.
  * **Basis Data:** SQLite 3 dengan mode WAL (*Write-Ahead Logging*) di `backend/waskita.db`.
  * **Virtual Environment:** Terletak di `.venv/` pada root repositori (`./.venv/bin/python`, `./.venv/bin/pytest`).
* **Frontend:**
  * **Framework:** React 18, TypeScript, Vite (port 5173).
  * **Styling & Icons:** Tailwind CSS, CSS Custom Properties (`index.css`), Lucide React & Handcrafted Micro-SVGs.
  * **Testing:** Node.js native test runner (`node --experimental-strip-types`) di `frontend/src/utils/__tests__/draftSanitizer.test.ts`.

### B. Inti Formula Algoritma WASKITA (Content Differentiation Score - CDS)
Skor akhir kelayakan naskah dihitung menggunakan formula komposit 4 pilar (skala 0–100%):

$$\text{CDS} = 0.35 \times C_{\text{VSM}} + 0.30 \times C_{\text{IG}} + 0.20 \times C_{\text{MATTR}} + 0.15 \times C_{\text{HKO}}$$

| Komponen | Bobot | Metrik yang Diukur | Ambang Batas Ideal |
| :--- | :---: | :--- | :--- |
| **$C_{\text{VSM}}$** | 35% | *Vector Space Model* kemiripan kosinus terhadap artikel kompetitor SERP teratas. Menghukum plagiasi dan redundansi kalimat. | Max Sim $\le 0.60$ |
| **$C_{\text{IG}}$** | 30% | *Information Gain* & Cakupan Konsensus Pasar: Mengukur pemenuhan topik wajib kompetitor + entitas unik baru ($\Delta_{\text{gain}}$). | Jenuh pada $80\%$ konsensus |
| **$C_{\text{MATTR}}$** | 20% | *Moving-Average Type-Token Ratio* ($L=50$): Mengukur variasi kosakata unik agar naskah tidak monoton. | $\ge 0.55$ ($55\%$) |
| **$C_{\text{HKO}}$** | 15% | *Heading-Keyword Overlap*: Mengukur rasio spam kata kunci pada judul dan sub-judul naskah. | $\le 40\%$ |

* **Red-Span Density Veto Gate:** Jika rasio kalimat stabilo merah (kalimat yang disalin langsung dari kompetitor dengan kemiripan $\ge 72\%$) mencapai $\ge 20\%$, naskah **otomatis diveto** menjadi "Perlu Revisi - Redundansi Kalimat Tinggi" dan skor CDS dipotong maksimal $58\%$. Naskah plagiat dilarang keras lolos sebagai "Siap Terbit".

---

## 3. REKAPITULASI PEKERJAAN DEVOPS BARU-BARU INI

Berikut adalah ringkasan kronologis pekerjaan yang telah diselesaikan DevOps hingga saat ini:

```
[Sprint 4.0] v1.5.0-SNAPSHOT.1 (Red-Span Veto Gate & Serper Pagination)
     │
[Sprint 4.1] v1.5.1-SNAPSHOT.1 (14 Algorithmic IR Fixes, 4-Page Harvester, Top-K UI)
     │
[Sprint 4.2] v1.5.2-SNAPSHOT.1 (Precision Multi-Competitor Prompt, Long-Tail IG, Query Lock)
     │
[Sprint 4.3] v1.5.3-SNAPSHOT.1 (Stabilo 4-Color Precision, Visual Slots, 80% Saturation)
     │
[Sprint 4.4] v1.5.4-SNAPSHOT.1 (White-Box Self-Curation, Single Source of Truth Deficit, Dynamic Word Budget)
     │
[Analyst Bypass] v0.9.0-beta (Hotfix Kueri Koma, Inline Consensus Accordion, Micro-SVGs, Paper Docs)
     │
[Side Task] Deployment Portofolio Publik SAIFMPLEH ke GitHub Pages
```

### A. Sprint 4.4 (v1.5.4-SNAPSHOT.1) — Rilis Terakhir DevOps
1. **Single Source of Truth Defisit Konsensus:**
   * Di `backend/app/services/nlp_pipeline.py`, menambahkan filter `is_narrative_noise()` yang membasmi kata klitik naratif (*kecintaannya, menariknya*) dan verba pasif (*tersebar, dikritik*) agar tidak mencemari konsensus SERP.
   * Di `backend/app/services/information_gain.py`, anggota konsensus SERP yang hilang dari draf diposisikan di puncak daftar defisit dengan flag `is_consensus_priority: true`. Menambah 1 kata prioritas ini dijamin 100% mendongkrak counter konsensus ($19/20 \to 20/20$) dan membawa skor CDS ke 100%.
   * Menambahkan `_find_competitor_snippet()` untuk mengambil 1 cuplikan kalimat asli kompetitor.
2. **Telemetri Road to 100% & Sub-Skor White-Box:**
   * Di `VerdictSection.tsx`, menampilkan banner:  
     `🎯 Road to 100%: Cakupan Konsensus Pasar X / Y entitas (Cukup tambahkan N kata kunci prioritas untuk meraih 100%)`.
   * Pil transparan rincian nilai sub-skor: `VSM: 35/35`, `IG: X/30`, `MATTR: Y/20`, `HKO: Z/15`.
3. **Interactive Deficit Chips:**
   * Di `EntityGapsSection.tsx`, memisahkan defisit menjadi **Entitas Konsensus Utama** (ikon 🎯, border tebal) dan **Entitas Kontekstual Tambahan**.
   * Popover interaktif saat chip diklik menampilkan cuplikan nyata kompetitor dan tombol `[📋 Salin Kata]`.
4. **Dynamic Word Budget Control:**
   * Di `AuditOptionsOverlay.tsx`, menyediakan 5 preset segmented: `⚡ Adaptif SERP`, `📝 Ringkas (500–800 kata)`, `📄 Standar SEO (800–1.200 kata)`, `📚 Pillar Riset (1.200–1.800 kata)`, dan `⚙️ Kustom`.
   * Di `FloatingComposerDock.tsx`, indikator kata real-time: abu-abu (< 300), hijau emerald (dalam rentang target), dan amber (melebihi target maksimum).
5. **Smart Default Tab Remediasi:**
   * Naskah Siap Terbit (< 100%) otomatis membuka **Tab 2: Micro-Tuning Menuju 100%**, sedangkan $\ge 100\%$ membuka **Tab 1: Paket CMS & SEO**.

---

### B. Perubahan Periode "Bypass Analis" (v0.9.0-beta)
Setelah rilis Sprint 4.4, Analis melakukan eksperimen dan hotfix langsung ke `main` yang mencakup:
1. **Penanganan False-Positive Kueri Koma & Veto Kalimat Beruntun (commit `66ac3a5`):**
   * Perbaikan penanganan kueri bertanda koma pada SERP scraper dan API endpoints.
   * Pencegahan false positive out-of-domain dan filter ikon share media sosial agar tidak diubah menjadi slot gambar.
2. **Ekstraksi Judul Cerdas & Filter Konjungsi (commit `48deac9` & `9a57db0`):**
   * Prioritisasi frasa judul lengkap (misal *"sakit pinggang saat hamil"*) dan pembersihan metadata reviewer dokter dari ekstraksi entitas.
3. **Inline Accordion Konsensus 25 Entitas (commit `2812c40` & `56e06c4`):**
   * Awalnya dirancang modal pop-up, kemudian di-refactor menjadi accordion inline yang bersih di bawah matriks celah informasi.
4. **Filter Kata Gaul / Slang Stopwords (commit `f7a5f18`):**
   * Menambahkan daftar kata bahasa percakapan sehari-hari ke `nlp_pipeline.py` agar tidak masuk ke konsensus topik.
5. **Pembersihan Icon Slop & Badge BETA (commit `d03a834` & `514da23`):**
   * Mengganti ikon pihak ketiga yang tidak seragam dengan micro-SVG ringan di `shared-ui.tsx` dan memasang badge resmi BETA.
6. **Integrasi Dokumen Paper Riset Bahasa Inggris (commit `fde79e7`):**
   * Penambahan manuskrip ilmiah `docs/PAPER_WASKITA_ENGLISH.md`, gambar figur arsitektur di `docs/figures/`, dan catatan penelitian.
7. **Penyegaran Seeder Sesi Uji & Draf Contoh (commit `19933c8`, tag `v0.9.0-beta`):**
   * Menghapus riwayat demo lama di database dan meningkatkan draf sampel menjadi ~700 kata dengan isolasi memori sesi pengguna.

---

### C. DevOps Side Task: Deployment Portofolio Publik
* **Repositori Baru:** [`Ahmad-Saif-Almuflihin-4342301053/SAIFMPLEH`](https://github.com/Ahmad-Saif-Almuflihin-4342301053/SAIFMPLEH).
* **Eksekusi:** Dibuat menggunakan GitHub CLI (`gh repo create SAIFMPLEH --public --source=. --remote=origin --push`).
* **Live Deployment:** GitHub Pages telah diaktifkan di:  
  [https://ahmad-saif-almuflihin-4342301053.github.io/SAIFMPLEH/](https://ahmad-saif-almuflihin-4342301053.github.io/SAIFMPLEH/).

---

## 4. STATUS KESEHATAN SISTEM SAAT INI (HEALTH CHECK)

| Parameter | Status / Nilai | Catatan Verifikasi |
| :--- | :--- | :--- |
| **Git Current Branch** | `main` | Sinkron dengan `origin/main` |
| **Git Latest Tag** | `v0.9.0-beta` | Didahului `v1.5.4-SNAPSHOT.1` |
| **Backend Unit Tests** | **79 Passed, 0 Failed** | Lolos dalam ~15 detik via `./.venv/bin/pytest backend/tests/` |
| **Frontend Unit Tests** | **31 Passed, 0 Failed** | Lolos dalam ~1 detik via `npm --prefix frontend test` |
| **Frontend Build** | **Success (0 Errors)** | `npm --prefix frontend run build` (Bundle gzip: 97.93 KB) |
| **Backend Service** | **UP (Port 8000)** | FastAPI Uvicorn reload aktif |
| **Frontend Service** | **UP (Port 5173)** | Vite Dev Server aktif |
| **Working Tree Status** | *Unstaged Changes* | Perubahan visual desain sistem (#FAFAF9 stone theme) pada 24 berkas frontend |

---

## 5. STANDARD OPERATING PROCEDURES (SOP) UNTUK DEVOPS BARU

### A. Perintah Menjalankan Servis (Local Daemons)
```bash
# 1. Jalankan Backend FastAPI (Port 8000)
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"
./.venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Jalankan Frontend Vite (Port 5173)
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset/frontend"
npm run dev
```

### B. Perintah Eksekusi Seluruh Test Suite (QA Verification)
Setiap sebelum melakukan commit atau merge, DevOps **WAJIB** menjalankan 3 perintah ini:
```bash
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"

# 1. Backend IR & API Tests (79 test)
./.venv/bin/pytest backend/tests/

# 2. Frontend Unit Tests (31 test)
npm --prefix frontend test

# 3. Frontend Typecheck & Production Build
npm --prefix frontend run build
```

### C. Pembersihan Database Riwayat Sesi (Operational Maintenance)
Jika pengguna meminta kanvas bersih (*fresh session history*) tanpa menghapus akun user:
```bash
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"
sqlite3 "backend/waskita.db" "DELETE FROM METRIC_RESULTS; DELETE FROM ENTITY_GAPS; DELETE FROM COMPETITOR_DOCUMENTS; DELETE FROM COMPETITOR_SNAPSHOTS; DELETE FROM AUDIT_SESSIONS; VACUUM;"
```

### D. Alur Kerja Git & Rilis Sprint (Standard Git Workflow)
1. **Buat Branch Fitur:**
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/issue-<NOMOR>-<DESKRIPSI>
   ```
2. **Implementasikan Perubahan & Verifikasi Test** (wajib 100% lulus).
3. **Commit & Push Branch Fitur:**
   ```bash
   git add <berkas-berkas>
   git commit -m "feat(sprint-X.Y): <deskripsi> (#<NOMOR>)"
   git push -u origin feat/issue-<NOMOR>-<DESKRIPSI>
   ```
4. **Merge ke Main & Tagging:**
   ```bash
   git checkout main && git pull origin main
   git merge feat/issue-<NOMOR>-<DESKRIPSI> --no-ff -m "feat(sprint-X.Y): <deskripsi> (Closes #<NOMOR>)"
   git push origin main
   git tag -a v<VERSION>-SNAPSHOT.1 -m "Release v<VERSION>-SNAPSHOT.1: <deskripsi>"
   git push origin v<VERSION>-SNAPSHOT.1
   ```
5. **Update / Tutup GitHub Issue** melalui GitHub CLI atau MCP Server.

---

## 6. PETA PENTING DIREKTORI & BERKAS KUNCI

```
waskitariset/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/audit_endpoints.py  # Orkestrasi audit multi-turn & telemetri
│   │   ├── schemas/audit.py                    # Kontrak schema Pydantic request & response
│   │   └── services/
│   │       ├── gatekeeper.py                   # Stabilo 4-warna, CDS composite, prompt AI
│   │       ├── information_gain.py             # Konsensus SERP, prioritas defisit, gain
│   │       ├── nlp_pipeline.py                 # Stemming Sastrawi, stopword, noise filter
│   │       ├── serp_scraper.py                 # Serper.dev live crawler & bot protection
│   │       └── stylometrics.py                 # MATTR leksikal & Heading-Keyword Overlap
│   ├── tests/
│   │   ├── test_ir_engine.py                   # 44+ test algoritma IR & NLP
│   │   ├── test_api_integration.py             # Uji integrasi endpoint
│   │   └── test_api_resilience.py              # Uji ketahanan error & edge-cases
│   └── waskita.db                              # Database SQLite lokal (WAL mode)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditOptionsOverlay.tsx         # Menu '+' Opsi kueri, word budget, ambang batas
│   │   │   ├── audit-block/
│   │   │   │   ├── AnnotatedTextSection.tsx    # Naskah stabilo & slot visual gambar
│   │   │   │   ├── EntityGapsSection.tsx       # Matriks celah defisit & gain interaktif
│   │   │   │   ├── RemediationPromptSection.tsx# Dual-tab prompt AI & panduan kurasi
│   │   │   │   └── VerdictSection.tsx          # Banner vonis, Road to 100%, sub-skor
│   │   │   ├── composer/
│   │   │   │   └── FloatingComposerDock.tsx    # Dock input draf & indikator kata dinamis
│   │   │   └── shared-ui.tsx                   # Design system, micro-SVG icons, gauge
│   │   ├── types/waskita.ts                    # TypeScript interface contracts
│   │   └── utils/
│   │       ├── draftSanitizer.ts               # Sanitasi media, ekstrak judul, filter dokter
│   │       └── __tests__/draftSanitizer.test.ts# 31 unit test frontend
│   └── package.json
└── docs/
    ├── MASTER_SYSTEM_ANALYST_HANDOVER_RESUME.md# Handover analis terdahulu
    ├── SPRINT4_4_..._SPEC.md                   # Dokumen spesifikasi Sprint 4.4
    └── DEVOPS_MASTER_HANDOVER_AND_OPERATIONS_RESUME.md # DOKUMEN INI
```

---
*Dokumen ini disusun dan diverifikasi oleh DevOps & GitHub Dispatcher WASKITA.*  
*Status Operasional Terakhir: Sehat, 79 Backend Tests Passed, 31 Frontend Tests Passed, Production Build 0 Error.*
