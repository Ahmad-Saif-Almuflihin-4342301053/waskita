# SPRINT 3.1 — SURGICAL FIX: PROGRESSIVE STREAMING UX, ANTI-MOCK PURGE, & SEMANTIC KEYWORD EXTRACTION
**Penulis:** System Analyst (Chat 1) → **Penerima:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** Dokumen Resmi Spesifikasi Rekayasa (Sprint 3.1)  
**Target Rilis:** `v1.4.1-SNAPSHOT.1`  

---

## 🎯 1. TUJUAN UTAMA & RUANG LINGKUP
Sprint ini adalah operasi bedah (*surgical refactoring*) untuk membuang seluruh anomali kode tiruan (mock), memperbaiki transisi animasi visual komposer menjadi progresif (anti-AI slop), dan meningkatkan kecerdasan ekstraksi kata kunci target dari naskah naskah penuh.

---

## 🛑 2. ELIMINASI "PENYAKIT" KODE LAMA (NON-NEGOTIABLE)

### A. Purge Total Mock Simulation di `frontend/src/App.tsx`
* **Masalah:** Blok `catch (err)` di `App.tsx` baris 290–380 menelan error backend dan mengarang audit palsu:
  - Menyuntikkan entitas kopi (*Rasio Seduh 1:15*, *Cita Rasa Lokal Khas*) pada naskah properti.
  - Memotong teks dari karakter 240 menjadi merah merona (`color: 'red'`).
  - Mengarang tautan fiktif `kompas.com`, `detik.com`, `medium.com`.
* **Solusi Wajib:**
  - Hapus seluruh blok simulasi fiktif di dalam `catch (err)`.
  - Jika backend error (misal HTTP 422 kata < 300, atau koneksi putus), tangkap error asli dan tampilkan melalui banner/toast error yang humanis (`showToast({ type: 'error', message: err.message })`). DILARANG mengarang hasil audit!

### B. Hapus Tombol "Cetak A4"
* **Masalah:** Tombol `[📄 Cetak A4]` di sudut kanan atas kartu hasil audit mengotori layar dan tidak dibutuhkan.
* **Solusi Wajib:** Hapus elemen tombol cetak A4 dari `frontend/src/components/AuditBlockView.tsx` dan sub-komponennya.

---

## 🎬 3. UX TRANSISI KOMPOSER & PROGRESSIVE REVEAL ("SEDANG MENGANALISIS...")

### A. Transisi Meluncur ke Bawah (Seamless Docking)
* Pada saat pertama kali user membuka layar kosong / Analisis Baru (`currentTurns.length === 0`):
  - Saat tombol panah kanan diklik atau `Enter` ditekan:
  - Judul besar *"Segera Periksa, ARTIKELMU!"* memudar halus (*fade-out* 200ms).
  - Kotak komposer **meluncur turun secara mulus (*smooth slide-down transition*)** menuju posisi dasar layar (*docked to bottom* ala ChatGPT).

### B. Indikator "Sedang menganalisis ..." (Anti-AI Slop)
* **DILARANG** menggunakan bulatan hijau berdenyut (*pulsing dot*) yang terasa generik/slop.
* **Gunakan Animasi Titik Tiga Berjalan Sederhana:**
  - Teks minimalis: `Sedang menganalisis .` → `Sedang menganalisis ..` → `Sedang menganalisis ...` yang berganti setiap 400ms secara berulang.
  - Tipografi elegan, warna abu-abu netral (`var(--waskita-text-muted)`).

### C. Progressive / Typewriter Section Reveal
* Saat data dari server diterima:
  - **DILARANG** langsung meletuskan (*pop*) seluruh blok hasil analisis raksasa secara seketika.
  - Tampilkan kartu hasil audit secara bertahap dan mengalir (*sequential section stream*):
    1. **Tahap 1:** Kartu Skor Vonis & 7 Metrik muncul terlebih dahulu. Teks indikator `"Sedang menganalisis ..."` berpindah ke bawahnya.
    2. **Tahap 2:** Matriks Celah Informasi (Defisit & Gain) muncul berikutnya. Indikator terus terdorong turun.
    3. **Tahap 3:** Naskah Beranotasi Stabilo 4-Warna meluncur terbuka.
    4. **Tahap 4:** Rekomendasi Perbaikan & Referensi Kompetitor SERP tampil lengkap.
    5. Indikator `"Sedang menganalisis ..."` memudar dan hilang (*fade-out*).
* **Manfaat:** Pengguna melihat sistem aktif membuka hasil selangkah demi selangkah dan tidak merasa aplikasi sedang *freeze* atau lag.

---

## 🧠 4. EKSTRAKSI KATA KUNCI SEMANTIK KESELURUHAN TEKS (WHOLE-TEXT EXTRACTION)

### A. Masalah Kode Lama di `draftSanitizer.ts`
* Fungsi `extractSmartKeyword` hanya memotong baris pertama (`lines[0]`), sehingga judul *3 "Dosa Besar" Membangun Properti* dicari mentah-mentah ke Google dan menghasilkan artikel agama.

### B. Algoritma Ekstraksi Baru (Term Frequency & Context Scoring)
* Pindai seluruh isi naskah yang ditempel pengguna (bukan cuma baris judul).
* Buang kata tugas / stopwords umum (*"yang"*, *"dan"*, *"untuk"*, *"banyak"*, *"dosa besar"*).
* Ekstrak 2–3 kata benda/frasa substantif yang paling sering muncul dan mendominasi naskah (misal: *"desain arsitektur"*, *"membangun properti"*, *"iklim tropis"*).
* Gabungkan menjadi frasa target yang relevan secara pencarian Google (misal: *"desain arsitektur properti"*).

### C. Input Kueri Fleksibel (Koma / Enter Support)
* Di kolom input kueri target:
  - Pengguna dapat mengetik kata kunci.
  - Jika menekan **Enter** atau mengetik tanda koma (`,`), teks langsung dikonversi menjadi kapsul (*tag/chip*) yang bisa dihapus dengan tombol silang `x`.
  - Jika pengguna hanya mengetik teks biasa tanpa koma, teks tersebut tetap berlaku sebagai satu kueri utama.

---

## 📦 5. PEMBAGIAN TUGAS SPESIALIS WORKER

### Worker 1 (Backend - Core Logic)
Berkas: `backend/app/services/gatekeeper.py`, `backend/app/api/v1/endpoints/audit_endpoints.py`.
1. Pasang gerbang relevansi topik minimum (Topic Relevance Gate): jika `avg_cosine_similarity < 0.05` terhadap seluruh kompetitor, naskah dinyatakan *Out-of-Domain* (Vonis: "Perlu Revisi - Topik Tidak Relevan").
2. Pastikan respons error (seperti 422) menyertakan detail pesan yang ramah pengguna.

### Worker 2 (Frontend - UI/UX Polish)
Berkas: `frontend/src/App.tsx`, `frontend/src/utils/draftSanitizer.ts`, `frontend/src/components/AuditBlockView.tsx`, `frontend/src/components/composer/FloatingComposerDock.tsx`, `frontend/src/components/MultiTurnAuditStreamView.tsx`.
1. **Purge Fake Simulation:** Hapus blok simulasi di `catch (err)` pada `App.tsx`. Gunakan `showToast` untuk error riil.
2. **Hapus Cetak A4:** Buang tombol `[📄 Cetak A4]` dari header hasil audit.
3. **Animasi Docking & Ellipsis:** Buat animasi transisi komposer meluncur ke bawah saat submit di layar kosong, dan pasang indikator teks `Sedang menganalisis ...` dengan titik yang berjalan bergantian (tanpa pulsing dot hijau).
4. **Progressive Reveal:** Implementasikan pembukaan seksi hasil audit secara bertahap yang mendorong indikator ke bawah.
5. **Ekstraksi Semantik:** Perbarui `extractSmartKeyword` di `draftSanitizer.ts` agar membaca seluruh teks, serta dukung pemisahan kata kunci via koma/Enter.

### Worker 3 (QA & Reliability)
1. Uji paste naskah properti: pastikan kueri yang terdeteksi bukan judul clickbait.
2. Uji visual: pastikan tidak ada lagi teks berwarna merah merona massal tanpa alasan dan tidak ada entitas kopi di naskah properti.
3. Verifikasi `npm run build` lolos 0 error.
