# SPESIFIKASI LENGKAP & DETAIL ZONA 1 (SIDEBAR MEMBER & GUEST) — WASKITA SPRINT 2.1
**Dokumen Induk:** Mengunci seluruh interaksi, layout, z-index, dan styling Sidebar Desktop & Mobile (Member & Guest Mode).  
**Dilarang Me-Merge PR Sebelum Seluruh Kriteria di Dokumen Ini Lulus Verifikasi Nyata!**

---

## 1. TOMBOL "ANALISIS BARU" (ACTIVE STATE VS IDLE STATE)
*Masalah Sebelumnya:* Tombol "Analisis Baru" transparan terus padahal layar sedang berada di mode analisis baru!
*Aturan Baku:*
1. **Kondisi Aktif (`isActive === true`):**
   - Terjadi saat `activeSessionId === 'session-new'` (di Member) ATAU saat berada di Mode Tamu (Guest).
   - Wajib memiliki background aktif: `background: var(--waskita-card, #E9DFCA)`.
   - `border: none; borderRadius: "12px"; padding: "10px 14px"; fontWeight: 700;`.
2. **Kondisi Tidak Aktif (`isActive === false`):**
   - Terjadi saat pengguna sedang membuka salah satu sesi riwayat percakapan lama (misal: Sesi Kopi Tubruk atau Vespa).
   - Background wajib transparan: `background: transparent`.
   - Hanya berubah warna saat di-hover: `:hover { background: var(--waskita-card, #E9DFCA); }`.
3. **Format Konten:**
   - Cukup Ikon Pensil Kotak (`IconSquarePen`) + Teks "Analisis Baru". Dilarang menambahkan ikon plus atau embel-embel lain.

---

## 2. KONSISTENSI HEADER SIDEBAR DESKTOP (MEMBER & GUEST IDENTIK)
*Masalah Sebelumnya:* Sidebar Tamu menggunakan markup lama Mokly dengan checkbox CSS mati dan tidak ada tombol toggle.
*Aturan Baku:*
1. **Mode Expanded (Lebar 260px):**
   - Kiri: Logo resmi `Waskita`.
   - Kanan: Tombol Cari (`IconSearch`) + Tombol Tutup Sidebar (`IconMenu` / `IconSidebarClose`).
   - Berlaku identik baik di Mode Member maupun Mode Tamu!
   - Dilarang ada tombol burger melayang di luar sidebar.
2. **Mode Collapsed Mini-Rail (Lebar 68px ala ChatGPT/Gemini):**
   - Paling Atas: Monogram huruf **"W"** (logo Waskita).
   - Saat kursor mouse di-hover di atas huruf "W", huruf "W" berganti mulus menjadi icon burger (`IconMenu`), dan saat diklik membuka sidebar (expand).
   - Di bawah "W": Ikon `IconSquarePen` (Analisis Baru), dengan background aktif jika sedang berada di analisis baru.

---

## 3. FOOTER SIDEBAR & ATURAN POSISI ELEMEN (COLLAPSED & EXPANDED)

### A. Mode Collapsed Mini-Rail (Lebar 68px)
1. **Pengaturan (`IconSettings`):**
   - Berada di posisi **ATAS** dari footer mini-rail.
   - Saat diklik (baik Member maupun Tamu), membuka `SettingsPopover` melayang ke kanan.
2. **Profil Pengguna (Avatar):**
   - Berada di posisi **PALING DASAR BAWAH** (tepat di ujung dasar layar).
   - Pada Mode Member: Menampilkan avatar inisial ("A"). Diklik -> membuka `ProfilePopover`.
   - Pada Mode Tamu: Menampilkan ikon profil default (`IconUser`). Diklik -> langsung memicu `onSignIn` (`setIsAuthenticated(true)`).

### B. Mode Expanded (Lebar 260px)
1. **Pada Mode Member:**
   - Kiri: Kartu Profil ("A" + `author_demo` + badge `PERSONAL PLAN`). Diklik -> membuka `ProfilePopover`.
   - Kanan: Tombol Pengaturan (`IconSettings`). Diklik -> membuka `SettingsPopover`.
2. **Pada Mode Tamu:**
   - Kiri: Tombol `[ Sign In ]` kapsul (`background: COLORS.softPeriwinkle`). Diklik -> memicu `setIsAuthenticated(true)` (masuk instan ke dashboard demo).
   - Kanan: Tombol Pengaturan (`IconSettings`). Diklik -> membuka `SettingsPopover`.

---

## 4. PERILAKU & POSISI SETTINGS POPOVER (ARAH MEMBUKA & SUBMENU HOVER)

### A. Arah Membuka (Wajib ke KANAN):
- Pada sidebar desktop (expanded):
  `position: absolute; left: calc(100% + 8px); bottom: 0; z-index: 100; width: 220px;`
  *(Membuka keluar dari sidebar ke arah kanvas utama seperti Google Gemini, TIDAK mengayun ke kiri menutupi profil!)*
- Pada mode mini-rail collapsed (68px desktop):
  `position: absolute; left: 72px; bottom: 0; z-index: 100; width: 220px;`
- Pada mobile drawer:
  `position: absolute; right: 0; bottom: calc(100% + 8px); width: 220px;`

### B. Struktur Isi Popover (Mengalir, Tanpa Garis `<hr>`, Tanpa Header Huruf Kapital):
- Popover utama HANYA berisi 2 baris bersih:
  1. `🌓 Tema >` (ada ikon tema dan panah chevron right `>`).
  2. `❓ Bantuan & Dokumentasi`.

### C. Submenu Flyout Tema (Zero Hover Gap & Click to Lock):
- Saat kursor mouse di-hover ke baris "Tema" (atau diklik), muncul flyout submenu di sampingnya berisi 3 pilihan vertikal:
  * `💻 System`
  * `☀️ Light`
  * `🌙 Dark` (dengan tanda centang `✓` pada tema yang sedang aktif).
- **Solusi Anti-Hilang:**
  1. Hilangkan celah kosong (`left: 100%` dengan padding transparan sebagai jembatan hitbox), sehingga mouse tidak keluar area saat bergeser.
  2. Berikan toleransi waktu debounce 150ms pada `onMouseLeave`.
  3. Baris "Tema" bisa DIKLIK untuk mengunci submenu tetap terbuka.

---

## 5. PERBAIKAN TOTAL MODE TAMU (GUEST MODE)
1. **Urutan Layout di `App.tsx`:**
   - `<GuestSidebar />` WAJIB ditaruh SEBELUM `<GuestWorkspace />` (Sidebar selalu di sebelah KIRI!).
2. **Interaktivitas Drawer Mobile Tamu:**
   - Ganti `<label>` mati dengan `<button type="button" onClick={onClose}>` pada tombol silang `(X)` di header mobile drawer agar berfungsi menutup drawer.
3. **Tombol "Sign In":**
   - Pasang `onClick={onSignIn}` pada semua tombol Sign In tamu, dan pastikan memicu `setIsAuthenticated(true)`.
4. **Tombol Gear Pengaturan Tamu:**
   - Membuka `SettingsPopover` yang sama (bukan langsung toggle theme mentah).

---

## 6. SPESIFIKASI KHUSUS MOBILE VIEWPORT (SAMSUNG A12 & ANDROID CHROME TESTED)
*Masalah Nyata di Fisik HP Samsung A12 (resolusi ~390px-414px dengan 3-tombol navigasi Android `|||` `o` `<`):*
1. Drawer sidebar mobile menyisakan ruang kosong ~100px di sebelah kanan (`width: 280px` hardcoded).
2. Footer sidebar mobile terpotong/tenggelam di bawah navigasi 3-tombol bawaan HP (`height: 100vh` tanpa safe-area).
3. Pengaturan dan profil mobile tidak bisa menggunakan hover flyout desktop, wajib menggunakan tampilan layar penuh terpadu (Mobile Settings/Account Sheet) ala Google Gemini (mengacu pada screenshot resmi `media_1792735824377_bab82006.png`).

### A. Dimensi Drawer Mobile 100% Penuh (Full Viewport)
- Pada drawer mobile (`!isDesktop`), baik di `auth-sidebar-header.tsx` maupun `guest-sidebar.tsx`:
  `width: 100%; max-width: 100vw; min-width: 100vw;`
- Dilarang keras menggunakan fixed `width: 280px` di mobile. Drawer wajib menutup 100% lebar layar ponsel saat terbuka.

### B. Anti-Clipping Navigasi Sistem Android (Safe-Area & 100dvh)
- Container sidebar:
  `height: 100dvh; max-height: 100dvh;` *(menggunakan dynamic viewport height `100dvh` agar responsif terhadap URL bar dan keyboard)*.
- Footer sidebar mobile:
  `min-height: 76px; height: auto;`
  `padding-bottom: max(env(safe-area-inset-bottom, 0px), 28px);`
  `padding-top: 10px;`
  *(Menjamin tombol footer berada aman di atas navigasi 3 tombol Samsung Galaxy A12 dan nyaman dipencet jempol)*.

### C. Unified Mobile Settings & Account Sheet (Ala Google Gemini Mobile)
- Di mobile footer, terdapat trigger yang membuka sheet layar penuh: `<MobileSettingsSheet />` (`position: fixed; inset: 0; z-index: 200; background: var(--waskita-bg, #FBF7EE); overflow-y: auto;`).
- **Header Sheet:**
  - Tombol silang `(X)` di pojok kanan atas untuk menutup sheet dan kembali ke drawer.
- **Zona 1: Area Akun (Atas):**
  1. **Jika Member (Sudah Login):**
     - Kartu profil rounded (`border-radius: 20px; background: var(--waskita-card, #E9DFCA); padding: 16px;`):
       - Avatar inisial "A" (dengan badge edit)
       - Nama lengkap Pengguna & Email (`asamuphp@gmail.com` / `author_demo@waskita.id`)
       - Badge kapsul: `PERSONAL PLAN` / `PRO`
       - Di pojok kanan kartu: Tombol chevron accordion `v` (expand/collapse)
       - Saat di-expand, menampilkan opsi akun:
         * Baris "Ganti Akun"
         * Baris "Keluar dari Akun" (Logout -> memicu `onSignOut` / `setIsAuthenticated(false)`)
  2. **Jika Guest (Belum Login):**
     - Kartu Mode Tamu rounded:
       * Avatar icon tamu default
       * Judul "Mode Penjelajah Tamu"
       * Teks: "Masuk untuk menyimpan riwayat analisis dan akses fitur lengkap"
       * Tombol Kapsul tebal: `[ Masuk / Sign In ]` -> memicu `onSignIn()` (`setIsAuthenticated(true)`) dan menutup sheet langsung ke dashboard.
- **Zona 2: Area Pengaturan & Preferensi (Bawah):**
  - Kartu container rounded (`border-radius: 20px; background: #FFFFFF / var(--waskita-surface); padding: 8px 14px;`):
    1. **Menu 'Tema' (Theme):**
       - **WAJIB ON-TAP / ON-CLICK (Dilarang Hover di Mobile!)**.
       - Saat baris 'Tema' diklik, menampilkan opsi tema vertikal lebar penuh yang touch-friendly:
         * `💻 Sistem` (System)
         * `☀️ Terang` (Light)
         * `🌙 Gelap` (Dark)
         * Disertai tanda centang aktif `✓` di sisi kanan tema yang sedang aktif.
    2. **Menu 'Bantuan & Dokumentasi':**
       - Touch-friendly row untuk melihat panduan inspeksi naskah.
    3. **Identitas Footer Aplikasi:**
       - Teks halus: "Waskita v1.1.4 (Pre-Publishing Inspection) — TRPL Polibatam".

### D. Paritas Penuh Mode Tamu di Mobile
- `GuestSidebar.tsx` wajib mengadopsi 100% spesifikasi dimensi mobile ini (`width: 100%`, `100dvh`, padding safe-area 28px, tombol silang `(X)` header drawer berfungsi menutup sidebar, dan trigger footer membuka Mobile Sheet versi tamu).

### E. Dark Mode Fidelity pada Mobile Settings Sheet
- **Zona 2 Card Background:** Wajib menggunakan token adaptif `var(--waskita-surface-white, #FFFFFF)` (yang otomatis berubah menjadi `#1A2436` di dark mode). Daftarkan juga token `--waskita-surface: #FFFFFF;` (light) dan `--waskita-surface: #1A2436;` (dark) di `index.css`. Dilarang keras jatuh ke fallback `#FFFFFF` di mode gelap!
- **Avatar Inisial "A":** Background menggunakan `var(--waskita-text)` dengan teks `var(--waskita-bg)` agar huruf "A" kontras tajam (huruf "A" tidak tenggelam/putih di atas putih).
- **Badge Paket ("PERSONAL PLAN"):** Teks menggunakan warna gelap kontras `color: #0F172A` di atas latar biru pastel `COLORS.softPeriwinkle` agar terbaca tajam di semua tema.
- **Selected Theme Option:** Tombol opsi tema yang aktif wajib memiliki latar pembeda yang jelas di dark mode (`var(--waskita-audit-bg, rgba(255, 255, 255, 0.08))`).
