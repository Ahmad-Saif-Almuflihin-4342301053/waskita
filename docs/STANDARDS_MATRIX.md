# MATRIKS STANDAR ARSITEKTUR & BEST PRACTICE (PZN & INDUSTRY STANDARDS)
**Prinsip Kurasi:** Efisiensi Membaca & Optimasi Token (Separation of Core vs Situational Practices)

Dokumen ini memisahkan standar rekayasa menjadi 3 level hierarki yang jelas agar tim pengembang dan AI asisten tidak perlu membaca semua aturan secara membabi-buta, melainkan fokus pada apa yang wajib dan relevan.

---

## 🟢 LEVEL 1: STANDAR FUNDAMENTAL (WAJIB / NON-NEGOTIABLE)
*Aturan baku yang selalu berlaku di setiap commit, endpoint, dan komponen. Melanggar level ini otomatis gagal code review / QA.*

1. **Anti-Rage Click & Double Submission:**
   - Tombol mutasi data (POST/PUT/DELETE/Audit) wajib otomatis `disabled`, menampilkan loading spinner, dan memiliki fallback timeout.
2. **Concurrency Safety & Atomic Mutation:**
   - Mutasi data krusial di backend wajib dalam `DB::transaction()` / SQLAlchemy session transaction dengan row locking (`lockForUpdate` / `with_for_update()`).
3. **Media Storage Hygiene (Zero Binary in DB):**
   - Dilarang menyimpan file fisik/BLOB di dalam kolom tabel database. Database hanya menyimpan metadata dan path string.
4. **Pure Client-Side Export/Import untuk Dokumen Standar (PZN Core):**
   - Untuk format CSV, Markdown, JSON, dan dokumen print (A4 PDF via `@media print` / `window.print()`), wajib diproses di browser (SPA client) via `Blob` API tanpa membebani CPU server.
5. **No Native Alert / Confirm:**
   - Dilarang keras memakai `window.alert()` atau `window.confirm()`. Wajib gunakan dialog modal berbasis Tailwind/CSS komponen kustom.
6. **Graceful Error Handling & Fallback:**
   - Setiap panggilan jaringan wajib memiliki blok penanganan error yang humanis (toast/banner), tidak boleh membuat layar putih (*white screen of death*).
7. **Mobile-First & Touch Ergonomics Mandate (Non-Negotiable):**
   - Karena pengguna modern mengakses web dari ponsel (smartphone), seluruh perancangan komponen UI/UX wajib berasas **Mobile-First**:
     a. **Scale Up, Not Scale Down:** Rancang alur dan layout dari batas layar ponsel sempit (360px–414px) dengan jempol sebagai input utama, lalu kembangkan (*scale up*) ke layar lebar desktop.
     b. **Anti-Clipping Viewport:** Wajib menggunakan `100dvh` (Dynamic Viewport Height) dan `padding-bottom: max(env(safe-area-inset-bottom, 0px), 24px)` untuk mencegah tombol tertelan bilah navigasi 3-tombol Android atau home bar iOS.
     c. **Touch Target Size:** Target sentuh tombol minimal 44px–48px. Dilarang mengandalkan efek hover mouse di mobile; interaksi di mobile wajib berbasis click/tap eksplisit (menggunakan Full-Screen Sheet atau Modal).
     d. **Off-Canvas Drawers:** Drawer mobile wajib menutup 100% lebar layar (`width: 100%; min-width: 100vw;`), dilarang keras menyisakan celah sempit di samping kanan.

---

## 🟡 LEVEL 2: STANDAR KONDISIONAL / KONTEKSTUAL (SITUASIONAL)
*Digunakan hanya ketika fitur terkait memang ada di dalam cakupan Sprint. Jika tidak relevan dengan tugas yang sedang dikerjakan, lewati bagian ini.*

1. **Sanitasi Media Embed Rich-Text (`[gambar N]`, `[video N]`):**
   - **Kapan dipakai:** Hanya pada input draf artikel web yang rentan disalin dari CMS (WordPress, Google Docs, Medium).
   - **Kapan tidak dipakai:** Pada kolom input teks pendek (judul, komentar, nama profil, pencarian).
2. **Background Job / Asynchronous Worker (Celery / Redis / ThreadPool):**
   - **Kapan dipakai:** Hanya jika komputasi backend memakan waktu > 5 detik (seperti scraping multi-domain, training model besar, atau pengiriman batch email).
   - **Kapan tidak dipakai:** Untuk CRUD standar atau kalkulasi VSM/IR cepat yang selesai dalam hitungan ratusan milidetik.
3. **Feature Flag Toggles:**
   - **Kapan dipakai:** Pada fitur baru berskala besar yang berisiko tinggi saat rilis ke production agar bisa dimatikan seketika tanpa rollback kode.
   - **Kapan tidak dipakai:** Pada perbaikan bug minor (*bugfix*) atau penyesuaian styling UI harian.
4. **Snapshot Tagging Deployment (`vX.Y.Z-SNAPSHOT.N`):**
   - **Kapan dipakai:** Saat merilis build uji coba ke lingkungan staging.
   - **Kapan tidak dipakai:** Pada commit lokal saat pengembangan berlangsung.

---

## ⚪ LEVEL 3: STANDAR LANJUTAN / OPSIONAL (NICE-TO-HAVE / NON-MVP)
*Best practice terkini dari industri yang sifatnya referensi untuk masa depan ketika skala sistem sudah membesar (Enterprise Scale). Dilarang dipaksakan di tahap MVP agar tidak terjadi over-engineering.*

1. **Server-Side PDF Rendering Engine (Headless Browser / Microservice):**
   - Hanya dibutuhkan jika ada kebutuhan cetak laporan ratusan halaman secara terjadwal otomatis di latar belakang tanpa interaksi pengguna.
2. **Event-Driven Architecture & Message Broker (Kafka / RabbitMQ):**
   - Hanya relevan saat pengguna aplikasi sudah mencapai puluhan ribu request per detik.
3. **Advanced Web Worker Offloading:**
   - Memindahkan komputasi frontend yang sangat berat (seperti kompresi video atau enkripsi rumit) ke thread Web Worker terpisah.
