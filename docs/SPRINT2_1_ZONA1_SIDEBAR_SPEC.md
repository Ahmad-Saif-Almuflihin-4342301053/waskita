# SPESIFIKASI PERBAIKAN ZONA 1: SIDEBAR DESKTOP & MOBILE (WASKITA SPRINT 2.1)
**Target:** Pembersihan & Refactoring Sidebar (Anti-Bloat, Settings Modal, No-Border Button, Desktop Collapse Toggle)  
**Komponen Terkait:** `frontend/src/components/auth-sidebar-header.tsx`, `frontend/src/components/SettingsModal.tsx`, `frontend/src/App.tsx`

---

## 1. DAFTAR PERBAIKAN SPESIFIK UNTUK WORKER 2 (FRONTEND)

### A. Footer Sidebar & Modal Pengaturan Baru (`SettingsModal.tsx`)
1. **Hapus Elemen Mentah di Footer `AuthSidebar`:**
   - Hapus teks `🌓 Mode Tampilan` dan tombol `[Keluar]` bergaris merah dari `footer` di `AuthSidebar`.
2. **Ganti dengan Ikon Pengaturan Elegan (`IconSettings`):**
   - Di footer `AuthSidebar` (baik mode desktop maupun mobile), tampilkan profil ringkas pengguna di sisi kiri (avatar inisial / nama) dan tombol bulat **Ikon Pengaturan (`IconSettings`)** di sisi kanan (`title="Pengaturan"`).
3. **Buat Komponen Baru `<SettingsModal />` di `frontend/src/components/SettingsModal.tsx`:**
   - Muncul ketika tombol Pengaturan diklik (`isSettingsOpen === true`).
   - Berisi 3 seksi rapi:
     a. **Profil Pengguna:** Nama (`author_demo`), Email (`author@waskita.id`), dan Badge Paket (`Personal Plan`).
     b. **Tampilan Antarmuka:** Pilihan radio/switch yang jelas untuk **Mode Terang (Light)** dan **Mode Gelap (Dark)**.
     c. **Sesi & Akun:** Tombol **Keluar (Sign Out)** yang bersih dengan konfirmasi aman.

### B. Tombol "+ Analisis Baru"
1. Pada `AuthSidebar`, cari tombol `+ Analisis Baru`:
   - Ubah `border: "1px solid rgba(30, 41, 59, 0.1)"` menjadi **`border: "none"`**.
   - Berikan warna latar `background: COLORS.warmSand`, sudut melengkung `borderRadius: "14px"`, padding `10px 14px`, dan transisi hover yang lembut.

### C. Fitur Buka-Tutup (Collapse / Expand) Sidebar di Desktop
1. **Header `AuthSidebar` di Desktop:**
   - Tambahkan tombol toggle ikon menu (`IconMenu`) tepat di sebelah kiri logo Waskita.
   - Saat diklik, panggil callback `onToggleCollapse()`.
2. **State di `App.tsx`:**
   - Tambahkan state `isSidebarCollapsed` (boolean, default: `false`).
   - Ketika `isSidebarCollapsed === true`:
     - Sidebar desktop menyusut menjadi *mini-rail* (lebar 68px ala Google Gemini) atau sembunyi.
     - Header atas desktop menampilkan tombol toggle (`IconMenu`) di pojok kiri atas untuk membuka kembali sidebar.

### D. Tampilan Mobile Drawer (Zona 1)
1. Footer drawer mobile wajib identik: hanya ada tombol/ikon Pengaturan yang membuka `<SettingsModal />`.
2. Tombol `+ Analisis Baru` di mobile tanpa border (`border: none`).
3. Saat pengguna memilih salah satu sesi di riwayat atau menekan tombol `+ Analisis Baru` di mobile, drawer otomatis menutup (`onClose()`).

---

## 2. ATURAN KERJA WORKER 3 (QA & VISUAL AUDITOR)
Sesuai `docs/QA_QUALITY_GATES.md`:
1. **Gate 1 (Anti-Bloat):** File `SettingsModal.tsx` terpisah mandiri, maksimal 200 baris.
2. **Gate 2 (Visual):** Verifikasi tidak ada lagi teks mentah `🌓 Mode Tampilan` dan tombol keluar merah di footer sidebar. Pastikan tombol `+ Analisis Baru` tidak memiliki border.
3. **Gate 3 (Build):** `npm run build` wajib 0 error TypeScript.
