# SPESIFIKASI LENGKAP & DETAIL ZONA 3 (ZONA TENGAH: COMPOSER DOCK, EMPTY STATE, OPTIONS OVERLAY, & AUDIT STREAM) — WASKITA SPRINT 2.3
**Dokumen Induk:** Mengunci seluruh interaksi, layout, arsitektur data, dan styling Zona Tengah Desktop & Mobile (Member & Guest Mode).  
**Referensi Standar:** Google Gemini & Claude.ai Multi-Line Document Composer, Mobile-First Touch Ergonomics (Android 3-Button Nav, Safe-Area), Modern Web Guidance (field-sizing, zero-zoom 16px font), dan Keselarasan Proposal TA (Tabel 3.5 & Tabel 3.6).  
**Dilarang Me-Merge PR Sebelum Seluruh Kriteria di Dokumen Ini Lulus Verifikasi Nyata!**

---

## 1. MULTI-LINE DOCUMENT COMPOSER CARD (`FloatingComposerDock`)
*Masalah Sebelumnya:* Komposer berupa kapsul 1 baris sempit (`22px` height) ala chat WhatsApp, tidak proporsional untuk naskah artikel 300–1.500 kata. Kueri target SERP tersembunyi total, indikator kata melayang liar dan bertabrakan dengan tooltip deteksi kata kunci.

*Arsitektur & Layout Baku (Desain 2-Tier / Multi-Line Document Card):*

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Kueri SERP: [ ketik kata kunci sasaran...              ]  342 / 300 │ ← Baris Atas: Input Kueri SERP + Counter Kata
├─────────────────────────────────────────────────────────────────────────┤
│  Ketik atau tempel naskah artikel Anda di sini (minimal 300 kata)...    │ ← Textarea Auto-Growing (min 52px, max 180px)
│  (Font 16px di mobile agar bebas dari auto-zoom paksa iOS/Android)       │
│                                                                         │
│  [ + Berkas & Parameter (CDS ≥ 75%) ]                   [ Mulai Audit →]│ ← Baris Bawah: Tombol Lampiran/Opsi + Tombol Kirim
└─────────────────────────────────────────────────────────────────────────┘
```

### Kriteria Komponen Komposer:
1. **Baris Atas (Header Komposer Terpadu):**
   - **Input Kueri Target SERP (Kiri):**
     - Ikon SVG `IconSearch` (ukuran 14px).
     - Input teks tanpa border luar tebal, menyatu dengan warna kartu.
     - Placeholder: `"Kueri target SERP (contoh: resep kopi tubruk)"`.
     - Langsung terhubung ke `targetQuery` dan `onTargetQueryChange`.
   - **Indikator Jumlah Kata Dinamis (Kanan):**
     - Format: `{currentWordCount} / {minWordCount} kata`.
     - Warna: Hijau Zamrud (`var(--waskita-emerald-accent, #059669)`) dengan ikon `IconCheck` jika $\ge 300$ kata; Kuning Amber (`#D97706`) jika $< 300$ kata.
     - Menyatu di dalam header komposer—**DILARANG MENGGUNAKAN ELEMEN MELAYANG ABSOLUT DI LUAR KARTU!**
2. **Area Tengah (Multi-Line Textarea):**
   - Mendukung pengetikan atau *paste* artikel panjang secara nyaman.
   - `min-height: 52px` (2–3 baris teks), `max-height: 180px` dengan *auto-grow* berbasis `scrollHeight` atau CSS modern `field-sizing: content` (disertai fallback).
   - Saat teks melebihi `180px`, muncul scrollbar vertikal yang halus.
   - **Mobile Zero-Zoom Rule:** `fontSize: isDesktop ? "14px" : "16px"` agar browser mobile tidak melakukan *auto-zoom in* saat keyboard virtual terbuka.
   - Placeholder: `"Ketik atau tempel naskah draf artikel Anda di sini (minimal 300 kata)..."`.
3. **Baris Bawah (Footer Aksi Komposer):**
   - **Kiri: Tombol `[ + Berkas & Parameter ]`:**
     - Ikon SVG `IconPlus` (ukuran 16px).
     - Menampilkan label teks ringkas status parameter: `"+ Berkas & Opsi (CDS ≥ " + thresholds.min_cds_score + "%)"`.
     - Tingkat sentuh minimal `40px` tinggi, radius `10px`.
     - Saat kata kunci baru terdeteksi dari hasil paste, tombol ini berkedip halus dengan `animation: plusGlowPulse` dan menampilkan pill bantuan non-destruktif.
   - **Kanan: Tombol Utama `[ Mulai Audit → ]`:**
     - Ukuran ergonomis: tinggi `40px`, padding `0 18px` (desktop) / `0 14px` (mobile).
     - Desain pill berlabel jelas: `IconArrowRight` + teks `"Mulai Audit"` (desktop) atau ikon panah tebal (mobile).
     - Status Disable jelas: opacity 0.45 dan kursor `not-allowed` jika kata belum mencapai 300 atau saat `isLoading === true`.
4. **Docked Mode Background Gradient & Dark Mode Fidelity:**
   - Background gradient docked mode wajib menggunakan CSS Variable:
     `background: "linear-gradient(to top, var(--waskita-bg) 80%, transparent 100%)"`.
   - DILARANG keras memakai hardcoded hex atau string statis `COLORS.warmCream` agar tidak bocor warna terang saat Dark Mode aktif!

---

## 2. PERBAIKAN TATA LETAK KANVAS KOSONG (`NewAnalysisEmptyView`)
*Masalah Sebelumnya:* `NewAnalysisEmptyView` memiliki `minHeight: "100%", height: "100%"` yang mendorong komposer keluar dari layar tengah, serta merender logo ganda di mobile.

*Aturan Baku:*
1. **Pembersihan CSS Flexbox:**
   - Hapus `minHeight: "100%"` dan `height: "100%"` dari root `<div>` di `NewAnalysisEmptyView`.
   - Gunakan `width: "100%", padding: isDesktop ? "32px 24px" : "16px 14px"`, dengan flexbox vertikal terpusat yang proporsional.
2. **Kondisional Logo (Anti-Duplikasi):**
   - Di Desktop (`isDesktop === true`), render `<WaskitaLogo width={160} height={34} />` di atas judul hero.
   - Di Mobile (`isDesktop === false`), **SEMBUNYIKAN LOGO DI EMPTY VIEW** karena logo resmi Waskita sudah tampil permanen pada header atas mobile!
3. **Penyelarasan Pills Contoh Draf (Sample Pills):**
   - Pills contoh draf (*"☕ Coba Draf Perlu Revisi"* dan *"✨ Coba Draf Layak Terbit"*) diganti ikonnya menggunakan SVG inline: `IconCoffee` dan `IconSparkles` (Zero Emoji).
   - Letakkan pills di bawah komposer dengan jarak `marginTop: "14px"`, responsif terbungkus rapi (`flexWrap: "wrap"`).

---

## 3. SINCHRONISASI STATE SESI & KUERI TARGET (`App.tsx`)
*Masalah Sebelumnya:* Kueri target terkunci mati di `'resep kopi tubruk tradisional'`, tidak berganti saat memilih riwayat sesi lain, dan memunculkan banner "Mode Revisi Turn #3" pada sesi baru.

*Aturan Baku:*
1. **Pemilihan Sesi (`handleSelectSession`):**
   - Saat pengguna mengklik suatu sesi di sidebar, ekstrak `target_query` dari sesi tersebut dan panggil `setTargetQuery(sessionObj.target_query)`.
   - Kueri yang tampil di komposer harus selalu sinkron dengan sesi yang sedang aktif di layar.
2. **Sesi Baru (`handleNewAnalysis`):**
   - Reset `targetQuery` menjadi default kosong `""` atau kueri baru.
   - Reset `draftInput` menjadi `""`.
   - Pastikan banner `Mode Revisi Turn #...` HANYA muncul jika `currentTurns.length > 0` DAN `activeSessionId !== 'session-new'`. Jika di sesi baru, banner revisi **DILARANG MUNCUL**.

---

## 4. RESTRUKTURISASI MODAL OPSI AUDIT (`AuditOptionsOverlay.tsx`)
*Masalah Sebelumnya:* Preset disembunyikan di balik dropdown melayang yang menutupi slider di mobile; tidak ada tombol simpan/terapkan di bawah; masih ada emoji mentah `⚠️` dan `🛑`.

*Aturan Baku:*
1. **Segmented Preset Chips (Zero-Click Scanning):**
   - Hapus menu popover dropdown tersembunyi `Preset Cerdas ▾`.
   - Ganti dengan 3 tombol pill segmen yang langsung terlihat di atas slider:
     ```tsx
     [ Standar Editorial (Default) ]  [ Blog / Opini (Fleksibel) ]  [ Riset / Akademis (Ketat) ]
     ```
   - Chip yang aktif memiliki background `var(--waskita-accent-primary, #C0CEE8)` dan teks tebal. Sekali klik, seluruh 4 slider langsung menyesuaikan diri tanpa perlu membuka submenu.
2. **Tombol Aksi Bawah ("Terapkan Parameter"):**
   - Di bagian paling bawah overlay (sticky footer), tambahkan tombol aksi utama:
     ```tsx
     <button type="button" onClick={onClose} style={{ height: "46px", width: "100%", ... }}>
       Terapkan & Simpan Parameter
     </button>
     ```
   - Memberikan kepastian feedback bagi pengguna mobile tanpa harus mencari tanda silang kecil di atas.
3. **Mobile Safe-Area Inset:**
   - Padding bawah container overlay: `paddingBottom: "calc(24px + env(safe-area-inset-bottom, 20px))"` untuk menghindari tabrakan dengan 3-button nav Android.
4. **Zero Emoji pada Banner Validasi:**
   - Ganti `⚠️` dengan SVG `IconAlertTriangle` (warna Amber `#D97706`).
   - Ganti `🛑` dengan SVG `IconAlertCircle` (warna Rose `#DC2626`).

---

## 5. PENYELARASAN KARTU HASIL AUDIT (`AuditBlockView.tsx` & `MultiTurnAuditStreamView.tsx`)
*Masalah Sebelumnya:* Seksi 6 (Referensi Korpus SERP Top 3) hilang dari kode render; terdapat 3 lapis kotak dalam kotak yang memakan 30% lebar layar HP; emoji mentah `🖨️` pada tombol cetak.

*Aturan Baku:*
1. **KEMBALIKAN SEKSI 6 (Referensi SERP · Top 3 Google Competitor):**
   - Sesuai **Tabel 3.5 & Tabel 3.6 Proposal TA**, render kembali Seksi 6 di bagian bawah setiap kartu audit:
     - Daftar 3 artikel kompetitor teratas hasil pencarian Google SERP.
     - Tiap item memuat: Badge Rank (`#1`, `#2`, `#3`), Judul Dokumen, Domain URL eksternal dengan ikon SVG `IconExternalLink`, ringkasan cuplikan (snippet), skor kemiripan kosinus (*Cosine Similarity* terhadap draf), dan estimasi jumlah kata.
2. **Reduksi Kotak di Dalam Kotak di Mobile (Anti-Double Background):**
   - Di layar mobile (`!isDesktop`), kurangi padding kontainer terluar dari `20px 18px` menjadi `16px 12px`.
   - Kartu-kartu di dalam Seksi 1, Seksi 2, dan Seksi 3 menggunakan padding `12px` yang efisien sehingga area baca artikel tetap lapang ($\ge 310\text{px}$ pada layar $360\text{px}$).
3. **Pembersihan Tombol Cetak & Aksi:**
   - Ganti `<span>🖨️</span>` dengan SVG inline `IconPrinter` (ukuran 14px).
   - Seluruh tombol toolbar (`PDF`, `.MD`, `.CSV`, `.JSON`) menggunakan ikon SVG murni.
4. **Penyelarasan Warna Legenda Stabilo 4-Warna (Sinkron dengan Tabel 3.6 Proposal TA):**
   - **Kuning:** Repetisi HKO / Klise Generik
   - **Merah:** Redundansi VSM Tinggi
   - **Biru:** Saran Celah Topik Defisit ($\Delta_{\text{deficit}}$)
   - **Hijau:** Poin Unik / Orisinalitas Kuat ($\Delta_{\text{gain}}$)
5. **Bubble Masukan Pengguna yang Informatif:**
   - Di `MultiTurnAuditStreamView.tsx`, bubble masukan pengguna menampilkan:
     - Label Turn: `Draf Masukan #1` / `Revisi Pengguna #2`
     - Badge Kueri Target: `🔍 "{targetQuery}"`
     - Badge Jumlah Kata: `{wordCount} kata`
     - Tombol akordeon kecil `"Lihat Naskah Asli ▾"` yang jika diklik dapat menampilkan cuplikan teks draf yang dikirim pada turn tersebut.
