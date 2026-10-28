# SPRINT 3.6 TECHNICAL SPECIFICATION
## Editorial Discovery Blocker Redesign & Prompt Delimiter Polish

**Dokumen Versi:** 1.0.0  
**Tanggal:** 28 Oktober 2026  
**Peran:** System Analyst & Lead Architect (Chat 1)  
**Target Eksekusi:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** READY FOR DISPATCH

---

### 1. Latar Belakang & Evaluasi Arsitektur
Pada Sprint 3.5, sistem berhasil mencegah *Off-Topic High Score Paradox* dengan memperkenalkan *Topic Relevance Gate* dan *Topic Shift Blocker Card*. Namun secara visual dan *user experience*, tampilan kartu pemblokir saat ini masih tergolong **"AI-Slop"**:
1. Menggunakan tumpukan *border* merah tebal dan warna peringatan yang alarmis (*alarmist design*), seolah-olah aplikasi sedang mengalami kegagalan/eror fatal.
2. Menggunakan ikon rambu setop (`⛔`) dan emoji roket (`🚀`) yang tidak mencerminkan martabat produk kurasi jurnalistik/redaksi profesional.
3. Generator prompt perbaikan (`remediation_prompt`) pada draf berpersentase tinggi maupun rendah belum menyertakan wadah teks naskah (*delimiter container*), sehingga membingungkan pengguna yang ingin menempelkan drafnya ke AI eksternal.

Sprint 3.6 mengadopsi estetika **Editorial Mailchimp** dipadukan dengan ilustrasi resmi pilihan kurator **`Discovery-cuate` (Storyset)** yang menggambarkan pengamat menatap cakrawala melalui teleskop, melambangkan penemuan topik baru yang ramah dan elegan.

---

### 2. Spesifikasi Teknis Pekerjaan

#### Bagian A: Migrasi Aset Statis SVG (Worker 1)
File ilustrasi yang telah dikustomisasi pengguna saat ini berada di folder build sementara `frontend/dist/assets/`. Folder ini berisiko terhapus otomatis saat `vite build` dan diabaikan oleh Git.

**Tugas Relokasi:**
1. Buat direktori publik: `frontend/public/assets/`
2. Pindahkan dan standarisasi nama berkas:
   - `frontend/dist/assets/Discovery-cuate.svg` (aksen `#10B981` Emerald) $\rightarrow$ `frontend/public/assets/discovery-light.svg`
   - `frontend/dist/assets/Discovery-cuate(1).svg` (aksen `#78716C` Stone) $\rightarrow$ `frontend/public/assets/discovery-dark.svg`

#### Bagian B: Redesain Komponen Frontend (Worker 1)
**File Sasaran:** `frontend/src/components/AuditBlockView.tsx`  
**Area:** Blok `if (isTopicShift || isOutOfDomain)` (baris 104–234).

**Ketentuan Desain Baru (Anti-Slop Editorial):**
1. **Container:**
   - Hilangkan border merah ganda (`1.5px solid rgba(220, 38, 38, 0.35)`).
   - Gunakan kanvas warm card editorial: `background: 'var(--waskita-warm-card, #FAF8F5)'` / `dark:bg-stone-900`, sudut membulat `borderRadius: '20px'`, border hairline halus `1px solid var(--waskita-border-subtle, rgba(120, 113, 108, 0.15))`, bayangan lembut.
2. **Layout Dua Kolom (Desktop) / Vertikal (Mobile):**
   - Kolom Kiri (Visual Discovery):
     * Muat kedua gambar dengan kelas Tailwind instan tanpa latency JS:
       ```html
       <img src="/assets/discovery-light.svg" alt="Fokus Baru" class="w-36 h-36 md:w-44 md:h-44 object-contain dark:hidden" />
       <img src="/assets/discovery-dark.svg" alt="Fokus Baru" class="w-36 h-36 md:w-44 md:h-44 object-contain hidden dark:block" />
       ```
   - Kolom Kanan (Editorial Copy & Action):
     * Badge Pill: `FOKUS BARU` (warna netral stone/slate, bukan merah menyala).
     * Headline: `"Fokus Berbeda Terdeteksi"` (font serif/humanist berwibawa, `18px-20px`, warna arang gelap).
     * Body Copy (maksimal 2 baris): `"Draf naskah ini mengangkat pokok bahasan baru di luar artikel acuan sesi ini. Buka sesi baru agar pemetaan kompetitor dan celah informasi dapat dinilai secara akurat."`
     * Button CTA (Bebas Emoji 🚀): Label `"Lanjutkan di Sesi Baru"`. Styling rounded-full / rounded-xl dark stone/charcoal (`#292524`), hover halus.
     * Keterangan bawah tombol: `"Draf naskah akan otomatis dimuat di lembar analisis baru."`

#### Bagian C: Penyempurnaan Prompt Kurasi & Delimiter Naskah (Worker 2)
**File Sasaran:** `backend/app/services/gatekeeper.py`  
**Fungsi:** `generate_overview_and_remediation()`

**Ketentuan Format Prompt Baru:**
1. **Untuk Skor Lolos / Siap Terbit ($\ge 75\%$):**
   Sertakan narasi keunggulan terhadap 5 kompetitor Google SERP dan sediakan wadah naskah di bagian bawah:
   ```text
   Draf artikel ini telah lolos audit orisinalitas WASKITA dengan skor tinggi ({cds_score}%) untuk topik '{target_query}'.
   Berdasarkan analisis perbandingan terhadap 5 artikel kompetitor teratas di Google SERP, draf ini memiliki diferensiasi dan nilai kebaruan materi yang kuat ({gain_terms}).

   Tolong siapkan paket materi pra-publikasi CMS & SEO untuk artikel ini tanpa mengubah isi naskah pokoknya:
   1. Meta Title SEO: Buatkan judul menarik maksimal 60 karakter yang memuat kata kunci '{target_query}'.
   2. Meta Description: Buatkan deskripsi 140–155 karakter yang persuasif dan memicu CTR tinggi di Google.
   3. Taksonomi & Tag: Ekstrak 3–5 tag kategori paling relevan untuk pengelompokan artikel di CMS.
   4. Ringkasan Eksekutif (Lead): Tuliskan cuplikan pembuka 2 kalimat untuk teaser media sosial dan newsletter.
   5. Pertahankan Nilai Orisinal: Pastikan poin-poin kebaruan materi draf berikut tetap terjaga: {gain_terms}.

   --------------------------------------------------
   [NASKAH ARTIKEL YANG AKAN DIPROSES]:
   """
   (Tempelkan naskah draf artikel Anda di sini sebelum dikirim ke AI)
   """
   ```

2. **Untuk Skor Perlu Revisi ($< 75\%$):**
   Sertakan konteks perbandingan 5 artikel kompetitor dan delimiter naskah di bagian bawah:
   ```text
   Tolong sempurnakan draf artikel ini untuk topik '{target_query}' dengan panduan kurasi berdasarkan perbandingan 5 artikel kompetitor acuan Google SERP berikut:

   {points_text}

   Instruksi Tambahan: Pertahankan keunikan sudut pandang tulisan dan hindari frasa pembuka yang klise.

   --------------------------------------------------
   [NASKAH ARTIKEL YANG AKAN DIPROSES]:
   """
   (Tempelkan naskah draf artikel Anda di sini sebelum dikirim ke AI)
   """
   ```

3. **Pengujian Unit (`backend/tests/test_ir_engine.py`):**
   - Pastikan seluruh pengujian yang ada tetap lolos (`pytest backend/tests/test_ir_engine.py`).
   - Tambahkan asersi bahwa `[NASKAH ARTIKEL YANG AKAN DIPROSES]` muncul pada hasil `remediation_prompt`.

#### Bagian D: Jaminan Kualitas & Verifikasi (Worker 3)
1. Periksa ketersediaan berkas di `frontend/public/assets/discovery-light.svg` dan `discovery-dark.svg`.
2. Verifikasi tampilan antarmuka saat naskah *out-of-topic* dimasukkan:
   - Pastikan ilustrasi tampil jernih di mode siang (Light) dan mode malam (Dark).
   - Pastikan tidak ada border merah tebal, tidak ada ikon `⛔`, dan tidak ada emoji `🚀`.
3. Uji tombol salin prompt pada draf lolos maupun draf revisi: pastikan blok penampung `[NASKAH ARTIKEL YANG AKAN DIPROSES]` tersalin utuh ke clipboard.
