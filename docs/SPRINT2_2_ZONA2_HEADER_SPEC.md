# SPESIFIKASI LENGKAP & DETAIL ZONA 2 (HEADER ATAS, AKSI KANAN, & TITIK TIGA) — WASKITA SPRINT 2.2
**Dokumen Induk:** Mengunci seluruh interaksi, layout, styling, dan struktur menu Header Atas & Aksi Kanan Desktop & Mobile (Member & Guest Mode).  
**Referensi Standar:** Google Gemini Mobile & Desktop UX Standard (Zero Emoji Bloat, Conditional Actions, Touch Ergonomics).  
**Dilarang Me-Merge PR Sebelum Seluruh Kriteria di Dokumen Ini Lulus Verifikasi Nyata!**

---

## 1. CONDITIONAL RENDERING TITIK TIGA (`⋮`) ALA GOOGLE GEMINI
*Masalah Sebelumnya:* Tombol titik tiga (`⋮`) tetap muncul di layar "Analisis Baru" yang masih kosong, memunculkan opsi "Salin Ringkasan", "Unduh Laporan", dan "Hapus Riwayat" padahal belum ada data artikel sama sekali!

*Aturan Baku:*
1. **Kondisi Sesi Kosong / Analisis Baru (`hasActiveSession === false` atau `currentTurns.length === 0`):**
   - Tombol titik tiga (`⋮`) **DILARANG DIRENDER** (Sembunyi total).
   - Area header kanan tetap bersih dan lega, persis seperti antarmuka Google Gemini awal sesi.
2. **Kondisi Sesi Aktif Berisi Naskah/Audit (`hasActiveSession === true` dan `currentTurns.length > 0`):**
   - Tombol titik tiga (`⋮`) **DIRENDER** di pojok kanan atas (baik desktop maupun mobile).

---

## 2. RESTRUKTURISASI MENU TITIK TIGA (`⋮`): RELEVANSI INTI & ANTI-BLOAT
*Masalah Sebelumnya:* Menu dipenuhi opsi teknis membingungkan (`Unduh Laporan .md`, `Salin Naskah Draf`) serta emoji mentah (`📋`, `📄`) yang merusak estetika antarmuka.

*Struktur Menu Baku (Hanya Fitur Bernilai Nyata):*
1. **✨ Salin Prompt Rekomendasi (Fitur Utama):**
   - Ikon: SVG `IconSparkles` atau `IconCopy` (ukuran 15px).
   - Aksi: Menyalin teks `remediation_prompt` dari turn aktif/terakhir ke *clipboard* pengguna.
   - Feedback: Toast konfirmasi *"Prompt Rekomendasi Tersalin ✓"*. Pengguna tidak perlu *scroll* jauh ke bawah kartu audit untuk mengambil prompt perbaikan AI!
2. **📄 Salin Ringkasan Evaluasi:**
   - Ikon: SVG `IconFileText` (ukuran 15px, **DILARANG MEMAKAI EMOJI 📋!**).
   - Aksi: Menyalin teks ringkasan skor CDS, kueri target, dan vonis kualitas.
3. **🔗 Bagikan Analisis (Share):**
   - Ikon: SVG `IconShare2` (ukuran 15px).
   - Aksi: Membuka dialog bagikan / salin tautan analisis.
4. **📌 Sematkan Analisis / Lepas Sematan (Pin/Unpin):**
   - Ikon: SVG `IconPin` (ukuran 15px).
   - Teks Dinamis: `isPinned ? "Lepas Sematan (Unpin)" : "Sematkan Analisis"`.
   - Warna: Hijau zamrud (`#059669`) jika aktif, atau `COLORS.deepSlate`.
5. **✏️ Ganti Judul (Rename):**
   - Ikon: SVG `IconPencil` (ukuran 15px).
   - Aksi: Membuka dialog penggantian judul draf sesi.
6. **Pemisah Halus (Divider):**
   - Garis pembatas tipis: `borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))"`, `margin: "4px 0"`.
7. **🗑️ Hapus Riwayat:**
   - Ikon: SVG `IconTrash2` (ukuran 15px, warna merah `#EF4444`).
   - Teks: `"Hapus Riwayat"` (warna teks `#EF4444`).
   - Aksi: Membuka `<ConfirmModal />` untuk konfirmasi penghapusan sesi.

---

## 3. PEMBERSIHAN EMOJI PIN AMATIR DI SELURUH APLIKASI
*Masalah Sebelumnya:* Di riwayat sesi sidebar, pin disematkan menggunakan emoji WhatsApp mentah (`📌`).

*Aturan Baku:*
- Cari baris `s.is_pinned && <span style={{ fontSize: "11px" }}>📌</span>` di `auth-sidebar-header.tsx`.
- **HAPUS EMOJI TERSEBUT!**
- Ganti dengan komponen SVG profesional:
  ```tsx
  {s.is_pinned && (
    <IconPin size={13} color="var(--waskita-emerald-accent, #059669)" style={{ flexShrink: 0 }} />
  )}
  ```
- Seluruh antarmuka Waskita **100% bebas dari emoji sistem operasi** pada tombol dan menu.

---

## 4. TOMBOL PINTAS "ANALISIS BARU" DI HEADER MOBILE (ALA GEMINI)
*Masalah Sebelumnya:* Pada layar HP, jika pengguna sedang membaca hasil analisis dan ingin memulai analisis baru, mereka terpaksa harus membuka drawer sidebar terlebih dahulu.

*Aturan Baku:*
- Di header mobile (`!isDesktop`), tepat di sebelah kiri tombol titik tiga (`⋮`), tambahkan tombol pintas:
  ```tsx
  <button
    type="button"
    onClick={onNewAnalysis}
    aria-label="Analisis Baru"
    title="Analisis Baru"
    style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: COLORS.deepSlate,
      cursor: "pointer",
    }}
  >
    <IconSquarePen size={20} color={COLORS.deepSlate} />
  </button>
  ```
- Sekali sentuh dari header atas, pengguna langsung diarahkan ke sesi baru kosong tanpa perlu membuka drawer sidebar.

---

## 5. KONSISTENSI TEMA GELAP (DARK MODE FIDELITY) DI HEADER & POPOVER
*Aturan Baku:*
1. **Header Bar:**
   - Ganti `background: COLORS.warmCream` statis pada header mobile dengan:
     ```tsx
     background: "var(--waskita-bg, #F7F4EB)",
     borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
     ```
2. **Dropdown Menu Popover:**
   - Container popover wajib menggunakan:
     ```tsx
     background: "var(--waskita-surface, var(--waskita-surface-white, #FFFFFF))",
     border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))",
     boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
     ```
   - Tombol item popover:
     - Warna teks default: `COLORS.deepSlate` (`var(--waskita-text)`).
     - Hover background: `var(--waskita-card, rgba(30, 41, 59, 0.06))`.
3. Di Dark Mode, header dan dropdown menyatu serasi dengan warna gelap `#0B1120` dan kartu `#1A2436`, tanpa ada kebocoran warna putih.

---

## 6. PARITAS HEADER MODE TAMU (GUEST MODE)
- Di `guest-workspace.tsx`:
  - Header desktop & mobile menggunakan `background: "var(--waskita-bg, #F7F4EB)"`.
  - Tombol kapsul `Sign in` tetap berada di pojok kanan atas.
  - Tombol titik tiga tidak dirender jika tidak ada sesi tersimpan.
