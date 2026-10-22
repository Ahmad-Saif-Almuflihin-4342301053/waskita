# DOKUMEN SPESIFIKASI TEKNIS & INSTRUCTION MANUAL SPRINT 2 — WASKITA
**Judul Proyek:** WASKITA (*Web-Article Semantic & Quality Inspection Tool for Pre-Publishing Audit*)  
**Penyusun:** Ahmad Saif Almuflihin (NIM: 4342301053) — Prodi TRPL Politeknik Negeri Batam  
**Target Rilis Sprint 2:** `v1.1.0-SNAPSHOT.1` (Staging QA) -> `v1.1.0` (Production Release)  
**Fokus Utama Sprint 2:** Reaktivitas Penuh UI/UX (Zero Dead Controls), Integrasi Penuh AJAX FastAPI, Animasi Transisi & Mikro-Interaksi, Sanitasi Media Cerdas (`[gambar N]`, `[video N]`), dan Arsitektur Pemrosesan Berkas & Ekspor 100% Client-Side (Standar Eko Kurniawan Khannedy / PZN).

---

## DAFTAR ISI
1. **BAB 1: Standar Baku Pemrosesan Berkas & Ekspor di Frontend (PZN SPA Standard)**
2. **BAB 2: Bedah Akar Masalah (Root Cause Analysis) & Spesifikasi 9 Fitur Utama Sprint 2**
3. **BAB 3: Panduan Implementasi Langkah demi Langkah (Instruction Manual untuk 3 Worker)**
4. **BAB 4: Kriteria Penerimaan (Definition of Done) & Skenario Pengujian E2E Sprint 2**

---

## BAB 1: STANDAR BAKU PEMROSESAN BERKAS & EKSPOR DI FRONTEND (PZN SPA STANDARD)

> [!IMPORTANT]
> **Keputusan Arsitektur Baku (Standar Eko Kurniawan Khannedy — Programmer Zaman Now):**  
> Dalam arsitektur *Single Page Application* (SPA) modern (React 18 + FastAPI), seluruh pemrosesan berkas unggahan (*file parsing & sanitization*) maupun pengunduhan/ekspor laporan (*PDF, Markdown, CSV, JSON*) **WAJIB dieksekusi 100% di sisi Frontend (Browser)**. Backend FastAPI hanya bertugas melayani pertukaran data murni berformat JSON (`application/json`) dan kalkulasi matematis IR/NLP. Dokumen standar ini juga telah disimpan permanen di `docs/PZN_CLIENT_SIDE_FILE_STANDARD.md`.

### 1.1. Arsitektur Client-Side Export (`.PDF`, `.MD`, `.CSV`, `.JSON`)
1. **Ekspor PDF Eksekutif Vektor Asli (`window.print()` + `@media print`):**
   - **Larangan Keras:** Dilarang memproses pembuatan PDF di Backend (seperti *Puppeteer*, *WeasyPrint*, *wkhtmltopdf*) karena membebani RAM server dan membutuhkan *background job*. Dilarang pula memakai `html2canvas` yang menghasilkan gambar PDF buram dan teks tidak bisa diblok (*non-selectable*).
   - **Mekanisme Standar:**
     - Buat komponen khusus `<ExecutiveAuditPrintReport />` di `frontend/src/components/ExecutiveAuditPrintReport.tsx` yang hanya dirender saat pencetakan (`@media print`).
     - Saat pengguna menekan tombol **Ekspor PDF** pada blok hasil analisis atau menu sesi, Frontend memanggil `window.print()`.
     - Aturan CSS `@media print` di `frontend/src/index.css` otomatis menyembunyikan seluruh elemen UI interaktif (`Sidebar`, `Header`, `FloatingComposerDock`, `Toast`, `Modal`) dan mencetak lembar laporan eksekutif A4 yang memuat:
       1. **Kop Resmi Waskita** (Judul Artikel, Kata Kunci Target, Waktu Audit, Nomor Turn, Skor CDS, dan Badge Vonis).
       2. **Tabel 7 Metrik Kuantitatif White-Box IR** (CDS, Max/Avg Cosine Similarity, Euclidean Distance, TTR, MATTR L=50, HKO).
       3. **Tabel Celah Informasi (Defisit & Gain)** beserta konsensus kompetitor SERP.
       4. **Naskah Beranotasi Stabilo 4-Warna** (`-webkit-print-color-adjust: exact; print-color-adjust: exact;`) dan **Prompt Remediasi**.
2. **Ekspor Instan `.MD`, `.CSV`, dan `.JSON` via Web `Blob` API:**
   - Buat modul `frontend/src/utils/clientExporter.ts` yang mengubah objek `AuditExecuteResponse` di memori React langsung menjadi objek `Blob` (`text/markdown`, `text/csv;charset=utf-8;` dengan BOM `\uFEFF` agar langsung rapi di Microsoft Excel, dan `application/json`), lalu mengunduhnya seketika via `URL.createObjectURL(blob)` tanpa menyentuh jaringan Backend.

### 1.2. Arsitektur Client-Side Upload & Sanitasi Media Cerdas (`[gambar N]`, `[video N]`)
Penulis sering menyalin (*copy-paste*) draf langsung dari editor kaya (*rich-text*) seperti **WordPress**, **Google Docs**, **MS Word**, atau *output* AI yang di dalamnya terdapat sisipan gambar, *base64 data URI* panjang, atau kode *embed* video YouTube.

- **Aturan Sanitasi (`frontend/src/utils/draftSanitizer.ts`):**
  1. Tangkap event `onPaste` pada `<textarea>` komposer dan saat membaca berkas unggahan (`.txt`, `.md`, `.docx`).
  2. Jika *clipboard* mengandung `text/html` (misalnya hasil *copy* dari WordPress editor atau halaman web):
     - Parse DOM di memori browser menggunakan `DOMParser`.
     - Ganti setiap elemen `<img ...>` atau `<figure class="wp-block-image">` dengan teks penanda berurutan: `[gambar 1]`, `[gambar 2]`, dst.
     - Ganti setiap elemen `<iframe ...>`, `<video ...>`, `<embed ...>`, atau `<figure class="wp-block-embed...">` dengan teks penanda berurutan: `[video 1]`, `[video 2]`, dst.
     - Ekstrak teks bersih per paragraf/heading tanpa menyisakan tag HTML atau *script*.
  3. Jika berupa `text/plain` atau Markdown yang mengandung sintaks gambar `![alt](url)`, URL gambar mentah (`https://.../*.jpg|png|webp`), `data:image/...;base64,...`, atau kode shortcode `[caption]...[/caption]` / `<iframe...>`, ganti secara berurutan menjadi `[gambar 1]`, `[gambar 2]` dan `[video 1]`, `[video 2]`.
  4. **Perhitungan Kata (*Word Count*):** Token placeholder `[gambar 1]` dan `[video 1]` **dikecualikan** dari perhitungan jumlah kata murni (`countPureWords(text)`) agar batas minimum 300 kata (FR-02) dan matriks TF-IDF tidak terdistorsi oleh jumlah media.

---

## BAB 2: BEDAH AKAR MASALAH (RCA) & SPESIFIKASI 9 FITUR UTAMA SPRINT 2

### 2.1. Perbaikan #1: Unifikasi Kapsul Input Desktop & Animasi Transisi Tengah -> Bawah
- **Akar Masalah (RCA):**
  - Pada `frontend/src/App.tsx` (baris 599–625), saat `activeSessionId === 'session-new' || currentTurns.length === 0`, komponen `<NewAnalysisEmptyView isDesktop={isDesktop} />` merender satu kapsul input di tengah layar (baris 1801–1883 di `auth-audit-views.tsx`), sementara `<FloatingComposerDock />` juga dirender secara bersamaan di bagian bawah layar (`App.tsx` baris 616). Akibatnya, di versi Desktop muncul **2 input field kembar** sekaligus, dan kapsul tengah tidak memiliki *state binding* (`value`/`onChange`/`onClick`).
- **Spesifikasi Solusi:**
  1. **Hapus** markup kapsul input dari dalam `NewAnalysisEmptyView` (`auth-audit-views.tsx`) dan `GuestWorkspace` (`guest-workspace.tsx`), sehingga di seluruh ruang kerja **hanya ada SATU komponen kapsul input tunggal** (`FloatingComposerDock`).
  2. Tambahkan prop `layoutMode: 'centered' | 'docked'` pada `FloatingComposerDock`:
     - Saat berada di layar **Analisis Baru / Kosong** (`currentTurns.length === 0 && !isLoading`), kapsul berada pada mode `'centered'` (di tengah layar tepat di bawah judul hero `"Segera Periksa, ARTIKELMU!"`).
     - Begitu pengguna menekan `Enter` atau tombol panah kanan (`→`) untuk memulai audit (`isLoading === true` atau `currentTurns.length > 0`), `layoutMode` berubah menjadi `'docked'`, dan kapsul meluncur turun secara mulus ke bagian bawah layar menggunakan transisi CSS:
       ```css
       transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.45s cubic-bezier(0.16, 1, 0.3, 1);
       ```

### 2.2. Perbaikan #2: Tata Letak Empty State Setara ChatGPT & Google Gemini (Pil Contoh Naskah & Footer Disclaimer di Dasar Layar)
- **Akar Masalah (RCA):**
  - Teks informasi kebijakan privasi/disclaimer saat ini menempel langsung di bawah kapsul input tengah, bukan berada di dasar layar (*bottom viewport*) seperti Google Gemini. Selain itu, pengguna/penguji membutuhkan tombol kapsul contoh cepat di bawah input tengah seperti tombol *"What can you do?"* pada ChatGPT.
- **Spesifikasi Solusi:**
  1. **Pil Aksi Cepat (ChatGPT-Style Action Pills) di Bawah Kapsul Tengah:**
     - Saat `layoutMode === 'centered'`, tepat `16px` di bawah kapsul input tengah, tampilkan deretan tombol pil oval (`borderRadius: '9999px'`, `padding: '8px 16px'`, `fontSize: '12.5px'`, `background: rgba(192, 213, 229, 0.35)`):
       - **Pil 1:** `Coba Draf Perlu Revisi (Kopi Tubruk)` — mengisi `<textarea>` dengan draf >310 kata yang mengandung kalimat klise & celah defisit untuk mendemonstrasikan vonis `"Perlu Revisi"`.
       - **Pil 2:** `Coba Draf Layak Terbit (Kopi Dampit)` — mengisi `<textarea>` dengan draf >330 kata yang kaya entitas & lolos ambang batas untuk mendemonstrasikan vonis `"Layak Terbit"`.
  2. **Footer Disclaimer di Paling Dasar Layar (Gemini-Style Bottom Pinning):**
     - Pindahkan teks:
       `"Ketentuan Layanan dan Kebijakan Privasi Waskita berlaku. Waskita menyajikan panduan audit pra-publikasi untuk evaluasi draf artikel web."`
       ke paling bawah *viewport* (`position: 'fixed'` / `bottom: '8px'`, `fontSize: '11px'`, `opacity: 0.7`, `textAlign: 'center'`) baik saat kapsul berada di tengah maupun saat berada di bawah, persis seperti tata letak Google Gemini.

### 2.3. Perbaikan #3: Auto-Deteksi Kata Kunci Target & Mikro-Interaksi Bersinar (Game-like Glow) pada Tombol `+`
- **Akar Masalah (RCA):**
  - Pengguna awam umumnya langsung menempel (*paste*) naskah artikel tanpa tahu bahwa mereka bisa melihat atau mengubah arah kata kunci target (*target query*) di dalam menu `+`. Namun jika kita menambahkan *field* kedua untuk kata kunci di tampilan utama, antarmuka menjadi ramai dan membingungkan.
- **Spesifikasi Solusi:**
  1. **Pertahankan 1 Kapsul Input Tunggal.**
  2. **Ekstraksi Kata Kunci Otomatis Saat Paste/Ketik (`extractSmartKeyword(text)`):**
     - Begitu pengguna menempelkan naskah ke `<textarea>` (dan pengguna belum mengunci/mengubah kata kunci secara manual di sesi tersebut), ekstrak kandidat kata kunci utama secara otomatis dari baris judul pertama (atau 4–6 kata benda utama pada kalimat pembuka, contoh: `"resep kopi tubruk tradisional"`).
  3. **Animasi Tombol `+` Bersinar & Membesar-Mengecil (`plusGlowPulse`):**
     - Saat naskah pertama kali ditempel (*paste*), picu state `isPlusGlowing = true` selama `3.5 detik`:
       - Tombol bulat `+` memancarkan cahaya pendaran (*glow ring* hijau zamrud/biru langit) dan berdenyut membesar sedikit (`transform: scale(1.18)`) lalu kembali normal (`scale(1.0)`).
       - Di atas tombol `+`, muncul *floating badge/tooltip* dengan animasi *fade-in* halus dan panah kecil menunjuk ke tombol `+`:
         `Kata kunci terdeteksi: "[targetQuery]" — Klik (+) untuk lihat kata kuncimu`
       - Gelembung petunjuk tersebut dapat diklik langsung untuk membuka `AuditOptionsOverlay` dan akan menghilang secara *fade-out* setelah 5 detik atau saat tombol `+` ditekan.

### 2.4. Perbaikan #4: Indikator Tipis Jumlah Kata di Atas Kapsul & Penguncian Submit (< 300 Kata)
- **Akar Masalah (RCA):**
  - Sesuai aturan **FR-02 Proposal TA**, naskah wajib memiliki minimal **300 kata** agar perhitungan *Moving-Average Type-Token Ratio* (MATTR dengan jendela L=50) valid secara statistik. Saat ini belum ada indikator tipis di atas kapsul dan tombol *Enter* / panah kanan (`→`) masih bisa ditekan saat kata kurang dari 300.
- **Spesifikasi Solusi:**
  1. Tampilkan baris status tipis (`fontSize: '12px'`, `fontWeight: 600`) tepat di atas kapsul input (hanya muncul ketika `draftText.trim().length > 0`):
     - **Kondisi Kurang dari 300 Kata (`0 < wordCount < 300`):**
       - Tampilkan teks berwarna oranye/merah peringatan (`#D97706` di Light Mode, `#FBBF24` di Dark Mode):
         `Kata-kata belum cukup (${wordCount} / 300 kata minimum)`
       - **Kunci Tombol Kirim (`→`) dan Tombol `Enter`:** `disabled={true}`, `opacity: 0.4`, `cursor: 'not-allowed'`, `pointerEvents: 'none'`.
     - **Kondisi Cukup (`wordCount >= 300`):**
       - Tampilkan teks berwarna hijau zamrud (`#059669` di Light Mode, `#34D399` di Dark Mode):
         `${wordCount} kata — Naskah siap diaudit` (ditambah badge kecil `${mediaCount} media disanitasi` jika terdapat `[gambar N]` atau `[video N]`).
       - **Aktifkan Tombol Kirim (`→`) dan Tombol `Enter`.**

### 2.5. Perbaikan #5: Perbaikan Bug Reset Slider, Popover Preset Cerdas, & Peringatan Kombinasi Ngawur (`AuditOptionsOverlay.tsx`)
- **Akar Masalah (RCA):**
  - Di `NewAnalysisEmptyView`, tombol `+` masih berupa `<label htmlFor="auth-plus-toggle-desktop">` yang membuka overlay via CSS `:checked`, dan di `shared-ui.tsx` (baris 735–910) masih terdapat definisi `AuditOptionsOverlay` lama dengan `defaultValue` tidak terkontrol. Selain itu, preset yang ditaruh berjajar langsung di dalam kartu membuat tampilan menumpuk.
- **Spesifikasi Solusi:**
  1. **Hapus `AuditOptionsOverlay` lama di `shared-ui.tsx`** dan gunakan satu-satunya `frontend/src/components/AuditOptionsOverlay.tsx` yang 100% dikontrol oleh React state (`thresholds`, `onThresholdsChange`, `isOpen`, `onClose`).
  2. **Persistensi Kustomisasi Terakhir (`localStorage`):**
     - Simpan objek `thresholds` ke `localStorage.getItem('waskita_custom_thresholds')` setiap kali pengguna menggeser slider. Saat overlay ditutup dan dibuka kembali (bahkan setelah *refresh* halaman), nilai slider **wajib tetap berada pada kustomisasi terakhir pengguna** dan tidak pernah kembali ke default kecuali pengguna menekan tombol **"Reset Default"**.
  3. **Sub-Popup / Popover "Preset Cerdas" (Hover di Desktop, Tap di Mobile) & Tombol "Reset Default":**
     - Pada baris judul *"Ambang Batas Kualitas (Opsional)"*, tambahkan 2 kontrol ringkas di sisi kanan:
       - **Tombol "Preset ▾"**: Saat *pointer mouse* diarahkan ke tombol ini di Desktop (`onMouseEnter`) atau saat disentuh di Mobile (`onClick`), muncul **popup kecil mengambang (Popover)** di atasnya tanpa membuat kartu utama memanjang/menumpuk, berisi 3 opsi:
         1. **Standar Editorial (Default):** Cosine `0.60` | MATTR `0.55` | HKO `40%` | CDS `75`
         2. **Mode Fleksibel (Blog/Opini):** Cosine `0.70` | MATTR `0.48` | HKO `50%` | CDS `65`
         3. **Mode Ketat (Riset/Akademis):** Cosine `0.45` | MATTR `0.65` | HKO `30%` | CDS `82`
       - **Tombol "Reset"**: Mengembalikan ke-4 slider ke nilai Standar Editorial Default (`0.60`, `0.55`, `40`, `75`).
  4. **Peringatan Kombinasi Ambang Batas Ngawur (Threshold Sanity Check Banner):**
     - Evaluasi ke-4 nilai slider secara *real-time* dan tampilkan pita peringatan ringkas di bawah slider hanya ketika kombinasinya tidak wajar:
       - **Terlalu Longgar (*Under-constrained*):** Jika `max_cosine_similarity > 0.75` ATAU `min_cds_score < 55` ATAU (`min_mattr < 0.42` dan `max_hko_percentage > 60`):
         - Peringatan Kuning/Oranye: `"Ambang batas terlalu longgar: Draf yang sangat mirip kompetitor atau miskin kosakata berisiko tetap diloloskan."`
       - **Terlalu Ekstrem / Mustahil (*Over-constrained*):** Jika `max_cosine_similarity < 0.35` ATAU `min_cds_score > 90` ATAU `min_mattr > 0.78` ATAU `max_hko_percentage < 20`:
         - Peringatan Merah Muda: `"Kombinasi terlalu ekstrem: Hampir semua artikel normal akan divonis 'Perlu Revisi' dengan standar seketat ini."`

### 2.6. Perbaikan #6: Eliminasi 3 Hamburger Mobile & Reaktivitas Penuh Sidebar + Menu Titik Tiga (`⋮`)
- **Akar Masalah (RCA):**
  - Di `frontend/src/components/auth-sidebar-header.tsx` (baris 1464–1510), komponen `AuthHeader` masih merender **3 elemen `<label>` hamburger sekaligus** (`auth-burger-1`, `auth-burger-2`, `auth-burger-new`) yang mengarah ke ID radio CSS yang sudah tidak ada. Selain itu, `AuthSidebar` versi mobile masih memiliki `transform: translateX(-100%)` statis yang tidak membaca prop `isOpen`.
- **Spesifikasi Solusi:**
  1. **Satu Tombol Hamburger Mobile:** Di `AuthHeader` (`auth-sidebar-header.tsx`), hapus ketiga `<label>` hamburger lama dan ganti dengan **1 elemen `<button type="button" onClick={onOpenSidebar}>`** yang merender `<IconMenu size={22} />`.
  2. **Drawer Mobile Berbasis State React:** Pada `AuthSidebar` dan `GuestSidebar` mode mobile (`!isDesktop`), atur `transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'`, `pointerEvents: isOpen ? 'auto' : 'none'`, dan tampilkan *backdrop overlay* gelap (`rgba(30, 41, 59, 0.35)`) yang menutup sidebar saat diklik (`onClick={onClose}`).
  3. **Interaktivitas Penuh Item Riwayat & Dropdown Titik Tiga (`⋮`):**
     - Klik pada item riwayat memanggil `onSelectSession(session.session_id)` dan otomatis menutup drawer di mobile.
     - Klik pada tombol titik tiga (`⋮`) di samping item riwayat membuka menu aksi yang dikontrol React state (`openMenuSessionId`), bukan checkbox CSS statis:
       - **Sematkan / Lepas Sematan (Pin/Unpin):** Memanggil `PATCH /api/v1/sessions/{id}` (`is_pinned: !session.is_pinned`) dan memindahkan item berstatus *pinned* ke urutan teratas daftar.
       - **Ganti Nama (Rename):** Membuka modal/input kustom yang elegan (tanpa `prompt()` bawaan browser!) untuk mengubah `draft_title` via `PATCH /api/v1/sessions/{id}`.
       - **Bagikan / Ekspor Cepat:** Menyalin tautan/ringkasan sesi ke *clipboard* atau mengunduh laporan `.md`.
       - **Hapus (Delete):** Membuka `<ConfirmModal />` kustom dan menghapus sesi via `DELETE /api/v1/sessions/{id}`.

### 2.7. Perbaikan #7: Animasi Checklist Live Stepper (Lingkaran Berputar -> Centang -> Fade-Out)
- **Akar Masalah (RCA):**
  - Saat pengguna menekan tombol mulai audit, pengguna harus tahu persis tahapan apa yang sedang dikerjakan mesin IR Waskita, dengan indikator visual lingkaran berputar pada tahap aktif, centang pada tahap selesai, lalu menghilang secara halus (*fade-out*) setelah seluruh 5 tahap tuntas.
- **Spesifikasi Solusi (`frontend/src/components/LiveStepper.tsx`):**
  1. Tampilkan 5 tahapan berurutan sebagai kartu daftar periksa (*checklist*):
     - **Tahap 1:** *Mengekstrak & menormalisasi draf naskah...*
     - **Tahap 2:** *Mengakuisisi korpus Top-3 kompetitor SERP...*
     - **Tahap 3:** *Melakukan tokenisasi & stemming Sastrawi...*
     - **Tahap 4:** *Menghitung matriks TF-IDF, Cosine Similarity, & Information Gain...*
     - **Tahap 5:** *Menyusun evaluasi stilometri (MATTR, HKO) & vonis CDS...*
  2. **Status Visual Tiap Baris:**
     - **Sedang Diproses (`step === currentStep`):** Menampilkan ikon **lingkaran berputar (*spinning SVG circle*)** + teks tebal + badge kecil `"Sedang diproses..."`.
     - **Selesai (`step < currentStep` atau `isCompleting`):** Berubah menjadi **lingkaran hijau zamrud dengan ikon centang (`✓`)**.
     - **Menunggu (`step > currentStep`):** Lingkaran kosong redup (`opacity: 0.45`).
  3. **Transisi Selesai (*Fade-Out*):**
     - Begitu respons dari API `/api/v1/audit/execute` diterima, seluruh 5 baris berubah menjadi **centang hijau (`✓`)** selama `400ms`, kemudian kartu `LiveStepper` melakukan animasi **menghilang (*fade-out* `opacity: 0`, `transform: scale(0.98) translateY(-6px)`, `transition: all 0.35s ease`)** sebelum blok Hasil Analisis muncul.

### 2.8. Perbaikan #8: Mekanisme Multi-Turn (1 Sesi Chat = 1 Artikel sampai "Layak Terbit") & Prompt Bantuan Terkurasi
- **Akar Masalah (RCA):**
  - Perlu aturan tegas apakah 1 ruang chat digunakan untuk banyak artikel berbeda atau fokus mengawal 1 artikel sampai tuntas, serta bagaimana alur revisi pengguna setelah melihat skor awal.
- **Spesifikasi Solusi:**
  1. **Aturan 1 Ruang Chat = 1 Artikel Prapublikasi:**
     - Setiap ruang percakapan (*session thread*) didedikasikan untuk **1 topik artikel** yang dievaluasi secara berulang (*Turn #1 -> Turn #2 -> Turn #3*) hingga mencapai status **"Layak Terbit"**.
     - Oleh karena itu, **tidak diperlukan tombol khusus "Revisi"**: ketika pengguna telah memperbaiki drafnya (baik diedit sendiri maupun dibantu AI menggunakan *Prompt Bantuan* dari Waskita), pengguna cukup melakukan `Ctrl+A` lalu `Ctrl+V` (*paste*) naskah hasil perbaikan tersebut ke kapsul input di bagian bawah chat dan menekan `Enter` / `→`.
     - Sistem secara otomatis mengenali bahwa ini adalah **Turn lanjutan (`parent_session_id` = ID turn terakhir di ruang chat tersebut)** dan mengunci `target_query` yang sama agar perbandingan kenaikan skor CDS (`+23 poin` dari Turn #1 ke Turn #2) akurat secara ilmiah!
     - Di bagian atas kapsul input saat berada di dalam sesi multi-turn (`currentTurns.length > 0`), tampilkan keterangan tipis:
       `Mode Revisi Turn #${currentTurns.length + 1} untuk kata kunci "${activeTargetQuery}" — Tempel draf perbaikan Anda di bawah`
  2. **Fasilitas Prompt Bantuan Terkurasi (Siap Salin):**
     - Pada bagian bawah setiap blok Hasil Analisis, kotak **"Prompt Bantuan (Siap Salin ke AI)"** menyusun instruksi spesifik berdasarkan data celah yang kosong pada draf pengguna:
       - Mencantumkan daftar entitas **Defisit** yang wajib ditambahkan.
       - Mencantumkan kutipan kalimat berstabilo **Merah (Redundansi VSM Tinggi)** dan **Kuning (Klise/Generik)** yang harus ditulis ulang.
       - Mencantumkan target perbaikan **MATTR** atau **HKO** jika belum memenuhi ambang batas.
       - Dilengkapi tombol **"Salin Prompt"** yang menyalin seluruh teks prompt ke *clipboard* dan menampilkan konfirmasi `"Tersalin ✓"`.

### 2.9. Perbaikan #9: Siklus Hidup Mode Tamu (Guest Trial) & Sinkronisasi Kontrak AJAX FastAPI
- **Spesifikasi Mode Tamu (Guest Mode):**
  1. Saat pengguna berada di **Mode Tamu (`!isAuthenticated`)**, pengguna dapat langsung mengaudit **1 artikel prapublikasi secara utuh (termasuk melakukan revisi Turn #2, #3 pada ruang chat yang sama)** tanpa harus login terlebih dahulu.
  2. Seluruh state percakapan Mode Tamu disimpan hanya di memori React sementara (*ephemeral session*). Jika halaman di-*refresh* (`F5`), sesi tamu otomatis hangus (kembali ke tampilan awal kosong).
  3. Di bagian atas ruang chat Mode Tamu (setelah Turn #1 selesai), tampilkan pita informasi halus:
     `Mode Tamu: Sesi audit ini bersifat sementara dan akan hilang jika halaman dimuat ulang. [Masuk / Daftar] untuk menyimpan riwayat permanen.`
  4. Jika pengguna Tamu menekan tombol **"+ Analisis Baru"** atau ikon **Sidebar** atau tombol **"Sign in"**, tampilkan **Modal Autentikasi Interaktif (`<AuthModal />`)** yang memungkinkan pengguna:
     - Masuk dengan akun (`username/email` & `password`),
     - Mendaftar akun baru (`POST /api/v1/auth/register`), ATAU
     - Menekan tombol **"Masuk Cepat (Akun Demo Penulis)"** yang langsung memanggil `POST /api/v1/auth/login` (`author_demo` / `password123`) agar dosen penguji atau pengguna dapat menguji mode Member ber-database SQLite WAL dalam 1 klik!

---

## BAB 3: PANDUAN IMPLEMENTASI LANGKAH DEMI LANGKAH (INSTRUCTION MANUAL UNTUK 3 WORKER)

### 3.1. Instruksi untuk Worker 1 (Backend Engineer — `backend/app/*`)
**Tujuan:** Menyelaraskan kontrak JSON antara FastAPI dan Frontend React serta menyediakan endpoint pengambilan rangkaian multi-turn (*session thread*).

1. **Perbarui Skema `backend/app/schemas/audit.py`:**
   - Pada `AuditExecuteResponse`: tambahkan field `draft_content: str = ""` agar saat sesi lama dibuka dari Sidebar, teks naskah draf pengguna ikut dikembalikan ke bubble chat kanan.
   - Pada `SessionListItem`: tambahkan field `score_cds: float = 0.0` (selain `content_differentiation_score`) agar langsung cocok dengan tipe `AuditSessionSummary` di Frontend.
2. **Perbarui Router `backend/app/api/v1/routers.py`:**
   - Pada `execute_audit` (`POST /api/v1/audit/execute`) dan `get_session_detail` (`GET /api/v1/sessions/{session_id}`): sertakan `draft_content=draft_content` (atau `session.draft_content`) di dalam `AuditExecuteResponse`.
   - Pada `list_user_sessions` (`GET /api/v1/sessions`):
     - Kembalikan hanya sesi *root* atau sesi terbaru per rantai percakapan (dan sertakan `score_cds=cds`), sehingga satu topik artikel yang direvisi 3 kali tidak menduplikasi 3 baris berbeda di daftar Sidebar, melainkan tampil sebagai 1 item riwayat dengan `turn_number` terbaru!
   - **Tambahkan Endpoint Baru `GET /api/v1/sessions/{session_id}/thread`:**
     - Menerima `session_id` (bisa berupa ID turn ke-1 maupun turn ke-2), menelusuri ke atas hingga *root session* (`parent_session_id == None`), lalu mengumpulkan seluruh turunan berurutan (`turn_number = 1, 2, ...`) dan mengembalikan `List[AuditExecuteResponse]`. Dengan endpoint ini, saat pengguna mengklik sesi di Sidebar, seluruh riwayat Turn #1, Turn #2, dst. langsung tampil utuh di layar!
   - Pada `extract_draft_from_file` (`POST /api/v1/audit/extract-file`):
     - Kembalikan baik `"draft_content": extracted_text` maupun `"extracted_text": extracted_text` serta `"file_format": filename.split(".")[-1]` agar 100% kompatibel dengan tipe `ExtractFileResponse` di Frontend.

---

### 3.2. Instruksi untuk Worker 2 (Frontend Engineer — `frontend/src/*`)
**Tujuan:** Menghidupkan seluruh interaksi UI/UX, menghapus duplikasi elemen statis, dan menerapkan standar Client-Side File/Export PZN.

1. **Buat Utilitas Sanitasi Media & Kata (`frontend/src/utils/draftSanitizer.ts`):**
   - Implementasikan `sanitizePastedOrUploadedDraft(rawText: string, rawHtml?: string): { cleanText: string; imageCount: number; videoCount: number }`:
     - Mengubah elemen gambar (`<img ...>`, Markdown `![...](...)`, `data:image/...`, `[caption]...[/caption]`) menjadi `[gambar 1]`, `[gambar 2]`, dst.
     - Mengubah elemen video (`<iframe ...>`, `<video ...>`, embed YouTube/Vimeo) menjadi `[video 1]`, `[video 2]`, dst.
   - Implementasikan `countPureWords(text: string): number` yang menghitung jumlah kata murni dengan mengabaikan token `[gambar N]` dan `[video N]`.
   - Implementasikan `extractSmartKeyword(text: string): string` yang mengambil kandidat kata kunci bersih (3–6 kata) dari baris pertama atau kalimat pembuka naskah.
2. **Buat Utilitas Client-Side File Reader & Exporter (`frontend/src/utils/clientExporter.ts`):**
   - Implementasikan `parseUploadedFileClientSide(file: File): Promise<{ text: string; wordCount: number; imageCount: number; videoCount: number }>`:
     - Untuk `.txt` dan `.md`: baca langsung di browser menggunakan `await file.text()`, lalu jalankan `sanitizePastedOrUploadedDraft`.
     - Untuk `.docx`: baca XML di sisi klien atau gunakan fallback `waskitaClient.extractFile(file)` lalu jalankan `sanitizePastedOrUploadedDraft`.
   - Implementasikan fungsi ekspor murni di browser (Standar Pak Eko PZN):
     - `exportAuditToMarkdown(turn: AuditExecuteResponse, draftContent?: string): void`
     - `exportAuditToCsv(turn: AuditExecuteResponse): void`
     - `exportAuditToJson(turn: AuditExecuteResponse): void`
     - `triggerExecutivePdfPrint(): void` (memanggil `window.print()`).
3. **Buat Komponen Cetak Vektor A4 (`frontend/src/components/ExecutiveAuditPrintReport.tsx`) & Aturan `@media print` di `frontend/src/index.css`:**
   - Render laporan eksekutif rapi untuk pencetakan PDF ketika `window.print()` dipanggil, lengkap dengan warna stabilo (`print-color-adjust: exact`).
4. **Perbaiki `frontend/src/components/auth-sidebar-header.tsx`:**
   - **Mobile Header (`AuthHeader`):** Hapus 3 `<label>` hamburger (`auth-burger-1`, `auth-burger-2`, `auth-burger-new`) dan ganti dengan **1 `<button onClick={onOpenSidebar}>`** berisi `<IconMenu />`.
   - **Mobile Drawer (`AuthSidebar`):** Gunakan prop `isOpen?: boolean` dan `onClose?: () => void` untuk mengatur `transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'` serta *backdrop overlay* gelap di mobile.
   - **Menu Titik Tiga (`⋮`) & Rename:** Ganti `<label>` statis pada tiap item riwayat dengan state React `activeMenuId`, dan tambahkan fitur **Ganti Nama (Rename)** inline/modal, **Sematkan (Pin)**, **Ekspor (.MD/.PDF)**, serta **Hapus**.
   - **Unified Animated Composer (`FloatingComposerDock`):**
     - Tambahkan prop `layoutMode?: 'centered' | 'docked'`, `wordCount`, `minWordCount = 300`, `isPlusGlowing`, `detectedKeywordHint`, `onPasteSanitized`, `onSelectSampleDraft`, `activeTurnNumber`, dan `activeTargetQuery`.
     - Tampilkan indikator tipis di atas kapsul: merah/oranye `"Kata-kata belum cukup (X / 300 kata minimum)"` saat `0 < wordCount < 300` (dan kunci tombol kirim `→` serta `Enter`), atau hijau `"✓ X kata — Naskah siap diaudit"` saat `wordCount >= 300`.
     - Tampilkan animasi bersinar + membesar sedikit pada tombol `+` (`isPlusGlowing`) beserta tooltip *fade-in* `"Kata kunci terdeteksi: ... — Klik (+) untuk lihat kata kuncimu"` saat pengguna baru saja menempelkan naskah.
     - Saat `layoutMode === 'centered'`, tampilkan 2 tombol pil contoh naskah di bawah kapsul tengah, dan letakkan teks disclaimer di paling dasar layar (`bottom: 10px`).
5. **Perbaiki `frontend/src/components/auth-audit-views.tsx` & `frontend/src/components/guest-workspace.tsx`:**
   - Hapus kapsul input duplikat dari `NewAnalysisEmptyView` (`auth-audit-views.tsx`) sehingga hanya merender Logo Waskita dan judul hero `"Segera Periksa, ARTIKELMU!"` di atas posisi kapsul terpadu.
   - Pastikan `GuestWorkspace` juga menggunakan mekanisme komposer terpadu, animasi tombol `+` saat *paste*, indikator 300 kata, pil contoh naskah, dan disclaimer di dasar layar.
6. **Perbaiki `frontend/src/components/AuditOptionsOverlay.tsx` & `frontend/src/components/shared-ui.tsx`:**
   - Hapus `AuditOptionsOverlay` duplikat dari `shared-ui.tsx`.
   - Pada `AuditOptionsOverlay.tsx`:
     - Simpan & muat `thresholds` dari `localStorage` (`waskita_custom_thresholds`) di `App.tsx` agar kustomisasi terakhir tidak pernah hilang saat popup ditutup/dibuka kembali.
     - Ubah daftar preset menjadi **Popover "Preset Cerdas ▾"** (muncul saat *hover* di Desktop / *tap* di Mobile) + tombol **"Reset Default"** agar tidak menumpuk dengan kartu slider.
     - Pertahankan/perkuat **Peringatan Kombinasi Ngawur** ketika nilai ke-4 slider terlalu longgar atau terlalu ekstrem.
7. **Perbaiki `frontend/src/components/LiveStepper.tsx` & `frontend/src/components/MultiTurnAuditStreamView.tsx`:**
   - Pada `LiveStepper.tsx`: tambahkan prop `isFadingOut?: boolean` agar ketika tahap 1–5 selesai (semua menjadi centang hijau `✓`), kartu melakukan *fade-out* halus sebelum hasil ditampilkan.
   - Pada `MultiTurnAuditStreamView.tsx`: tambahkan bilah aksi ekspor Client-Side (**Cetak PDF Eksekutif**, **Unduh .MD**, **Unduh .CSV**, **Unduh .JSON**) di setiap blok Hasil Analisis, dan pastikan klik kata di bagian atas hasil memunculkan *popover detail* kalimat secara interaktif.
8. **Buat `<AuthModal />` (`frontend/src/components/AuthModal.tsx`) & Hubungkan `App.tsx` ke `waskitaClient`:**
   - Saat aplikasi dibuka dalam mode Member default, lakukan auto-autentikasi ke akun demo (`author_demo` / `password123`) atau ambil token dari `localStorage` sehingga seluruh panggilan `waskitaClient.getSessions()`, `executeAudit()`, `updateSession()`, dan `deleteSession()` benar-benar tersimpan di database SQLite WAL Backend!
   - Sediakan `<AuthModal />` saat tombol **Sign in** atau **Keluar / Ganti Mode (Tamu vs Member)** diklik.

---

### 3.3. Instruksi untuk Worker 3 (QA & Verification Engineer — `backend/tests/*` & `frontend/src/__tests__/*`)
**Tujuan:** Memastikan seluruh perbaikan Sprint 2 teruji secara otomatis baik di Backend maupun Frontend tanpa regresi sedikit pun pada akurasi IR 100%.

1. **Tambahkan Pengujian Endpoint Thread & Kontrak Sprint 2 di `backend/tests/test_api_Integration.py`:**
   - Uji `GET /api/v1/sessions/{session_id}/thread` untuk memastikan urutan Turn #1 dan Turn #2 dikembalikan secara lengkap beserta `draft_content` dan `score_cds`.
2. **Tambahkan Unit Test Sanitasi Media & Kata di Frontend (`frontend/src/utils/__tests__/draftSanitizer.test.ts` atau skrip verifikasi):**
   - Pastikan HTML/teks yang mengandung `<img src="...">`, `![alt](url)`, dan `<iframe src="https://youtube.com/embed/...">` diubah secara akurat menjadi `[gambar 1]`, `[gambar 2]`, dan `[video 1]`.
   - Pastikan `countPureWords` mengabaikan token `[gambar 1]` dan `[video 1]`.
3. **Verifikasi Build Produksi & Akurasi IR:**
   - Jalankan `pytest` di Backend, `evaluate_accuracy.py` (wajib tetap `Precision=100%, Recall=100%, F1=100%`), dan `npm run build` (`tsc && vite build`) di Frontend hingga **0 error**.

---

## BAB 4: KRITERIA PENERIMAAN (DEFINITION OF DONE) SPRINT 2

| No | Komponen / Fitur | Indikator Lulus QA (Zero Regression) |
| :--- | :--- | :--- |
| **1** | **Single Animated Capsule (Desktop & Mobile)** | Hanya ada **1 kapsul input** di layar Analisis Baru (berada di tengah saat kosong, dan meluncur turun dengan animasi mulus ke bagian bawah saat mulai mengaudit). |
| **2** | **Mobile Hamburger & Sidebar Drawer** | Header mobile hanya menampilkan **1 ikon hamburger** (bukan 3), dan saat diklik membuka/menutup Sidebar Drawer dengan mulus. |
| **3** | **Auto-Keyword & Plus (`+`) Glow Animation** | Saat pertama kali *paste* naskah, tombol `+` memancarkan animasi *glow & pulse* membesar sedikit disertai petunjuk *fade-in* kata kunci terdeteksi. |
| **4** | **Validasi 300 Kata di Atas Kapsul** | Di atas kapsul muncul keterangan tipis berwarna (`Kata-kata belum cukup (X / 300 kata minimum)`) dan tombol `Enter` / panah `→` terkunci hingga >= 300 kata. |
| **5** | **Persistent Sliders, Preset Popover, & Warning** | Mengubah slider lalu menutup & membuka kembali popup `+` **tidak me-reset** nilai slider; tersedia Popover *Preset Cerdas*, tombol *Reset Default*, dan peringatan jika kombinasi slider ngawur. |
| **6** | **Sanitasi Media (`[gambar N]`, `[video N]`)** | *Paste* naskah yang berisi gambar/video dari WordPress atau web otomatis mengubah media menjadi `[gambar 1]`, `[video 1]` tanpa mengotori teks. |
| **7** | **Live Stepper Checklist + Fade-Out** | Proses tunggu menampilkan 5 daftar periksa dengan lingkaran berputar -> centang hijau (`✓`) -> menghilang *fade-out* saat selesai. |
| **8** | **Client-Side Export (Standar Pak Eko PZN)** | Ekspor `.PDF` (vektor A4 via `@media print`), `.MD`, `.CSV`, dan `.JSON` berjalan 100% di sisi Frontend secara instan. |
| **9** | **Multi-Turn 1 Artikel & Guest Trial** | 1 ruang chat mengawal 1 artikel dari Turn #1 hingga `"Layak Terbit"`, dan Mode Tamu berjalan di memori sementara (hangus saat *refresh*). |
