# SPRINT 3.10 TECHNICAL SPECIFICATION
## Deficit Gaps Dedicated Card, Clean Stabilo Sanitization, SERP Expansion, & DB Purge

**Dokumen Versi:** 1.0.0  
**Tanggal:** 30 Oktober 2026  
**Peran:** System Analyst & Lead Architect (Chat 1)  
**Target Eksekusi:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** READY FOR DISPATCH

---

### 1. Masalah & Evaluasi Temuan Pengguna (Adversarial Benchmark)
Berdasarkan hasil pengujian lapangan Mode 1 hingga Mode 5 pada dokumen evaluasi pengguna:
1. **Pencemaran Naskah Stabilo (Skandal Stabilo Biru):**
   Di `backend/app/services/gatekeeper.py`, saran celah defisit disuntikkan secara paksa ke elemen pertama array naskah (`spans[0]`) sebagai string sintetis:
   `[Saran Celah Defisit SERP: Naskah belum mengulas materi penting: Roma, Pemerintahan, Bangsa]` dengan `color="blue"`.
   * Ini melanggar aturan legenda antarmuka (`Biru: Kosakata Monoton`).
   * Teks sistem buatan mengotori bacaan naskah orisinal pengguna.
   * Menampilkan popover dengan tombol silang `[X]` yang rancu.
2. **Kompetitor Kurang dari 5 & Masuknya Wikipedia:**
   * Kuota kandidat Serper hanya 10–15 link. Setelah dipotong PDF, YouTube, dan domain ganda, artikel yang lolos sering kali hanya 2–4 dokumen.
   * Wikipedia masuk sebagai kompetitor, padahal dokumen ensiklopedia non-komersial yang sangat panjang (25.000 kata) mendistorsi bobot TF-IDF dan memunculkan saran defisit yang tidak relevan (seperti menyuruh memasukkan materi politik pemerintahan pada naskah arsitektur).
3. **Pembersihan Database Sesi Riwayat:**
   Riwayat sesi pengujian lama di database perlu dikosongkan total agar sidebar segar kembali.

---

### 2. Spesifikasi Solusi Teknis

#### Bagian A: Backend — Pembersihan Naskah & Stabilo Biru Asli (Worker 2)
**File Sasaran:** `backend/app/services/gatekeeper.py`

**Ketentuan:**
1. **HAPUS TOTAL** injeksi teks sintetis `[Saran Celah Defisit SERP: ...]` pada baris 127–136. Naskah stabilo `annotated_spans` **HANYA BOLEH BERISI KALIMAT ASLI MILIK PENGGUNA**.
2. **Kembalikan Hakikat Stabilo Biru (`color="blue"`):**
   Sesuai legenda `Biru: Kosakata Monoton`, jika sebuah kalimat memiliki `local_ttr < 0.40` atau repetisi leksikal tinggi (bukan klise), beri warna `color="blue"` dengan label `"Kosakata Monoton"`.
   Warna kuning (`color="yellow"`) dikhususkan untuk frasa klise/generik (`CLICHE_PHRASES`).

#### Bagian B: Frontend — Kartu Celah Defisit Paten Mandiri (Worker 1)
**File Sasaran:** `frontend/src/components/audit-block/AnnotatedTextSection.tsx`

**Ketentuan:**
1. Tambahkan kartu informasi khusus saran celah defisit tepat di bawah judul/legenda atau di bawah kotak naskah (sebelum popover detail kalimat).
2. Kartu ini bersifat **paten/permanen (tanpa tombol silang [X])**, hanya muncul jika ada entitas defisit (`audit.entity_gaps?.deficit && audit.entity_gaps.deficit.length > 0`).
3. Tampilan elegan: kontainer dengan latar belakang lembut (*subtle blue/slate tint*), border halus, ikon lampu/info, memuat daftar 3–5 entitas celah penting secara ringkas dan manusiawi:
   > **Saran Celah Topik (SERP):** Naskah Anda belum mengulas aspek penting yang banyak dibahas kompetitor: **[Entitas 1, Entitas 2, Entitas 3]**.
4. Kotak diagnostik kalimat yang diklik (`activeSentenceSpan`) tetap dipertahankan di bawahnya untuk rincian kalimat yang diklik oleh pengguna.

#### Bagian C: Backend — Ekspansi SERP & Pemblokiran Wikipedia (Worker 2)
**File Sasaran:** `backend/app/services/serp_scraper.py`

**Ketentuan:**
1. Perluas jaring pencarian Serper: ubah payload `num: 15` menjadi `num: 25` agar Google memberikan 25 kandidat link.
2. Tambahkan domain Wikipedia ke dalam daftar `DOC_DOMAINS` atau `BLOCKED_DOMAINS`:
   `"wikipedia.org"`, `"id.wikipedia.org"`, `"en.wikipedia.org"`.
   *(WASKITA hanya membandingkan naskah dengan portal berita, majalah arsitektur, dan blog artikel independen).*
3. Buka amplop pengalihan `https://www.google.com/goto?url=...` dengan membaca *Location header* 302 atau mengizinkan `httpx` mengikuti redirect ke situs aslinya.
4. Bersihkan koma kueri Google: `clean_query = target_query.split(",")[0].strip()`.

#### Bagian D: Operasional — Pembersihan Database Sesi (DevOps)
Jalankan di terminal backend:
```bash
sqlite3 "backend/waskita.db" "DELETE FROM METRIC_RESULTS; DELETE FROM ENTITY_GAPS; DELETE FROM COMPETITOR_DOCUMENTS; DELETE FROM COMPETITOR_SNAPSHOTS; DELETE FROM AUDIT_SESSIONS; VACUUM;"
```

---

### 3. Kriteria Keberhasilan (Definition of Done)
1. **Naskah Bersih:** Kotak stabilo tidak lagi diawali teks `[Saran Celah Defisit SERP: ...]`.
2. **Kartu Defisit Mandiri:** Saran celah topik tampil terpisah dalam kotak paten tanpa tombol silang `[X]`.
3. **Legenda Akurat:** Warna biru hanya menandai kalimat asli yang kosakatanya monoton.
4. **SERP 5 Dokumen:** Scraping kueri arsitektur/otomotif mengembalikan 5 artikel kompetitor valid tanpa Wikipedia.
5. **Database Bersih:** Sidebar riwayat sesi kosong segar.
6. Rilis snapshot tag `v1.4.10-SNAPSHOT.1`.
