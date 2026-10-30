# SPRINT 3.8 TECHNICAL SPECIFICATION
## Turn-1 Guard Rail, SERP Proxy Domain Sanitizer, and Database Reset

**Dokumen Versi:** 1.0.0  
**Tanggal:** 30 Oktober 2026  
**Peran:** System Analyst & Lead Architect (Chat 1)  
**Target Eksekusi:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** READY FOR DISPATCH

---

### 1. Masalah & Evaluasi Temuan Lapangan
Pengguna menemukan bug logika antarmuka dan scraper yang kritis:
1. **Looping "Buka Sesi Baru" di Turn #1 (UX Loop Paradox):**
   Saat pengguna baru saja membuat sesi baru di Turn #1, antarmuka malah menampilkan kartu pemblokir:
   > *"Fokus Berbeda Terdeteksi. Draf naskah ini mengangkat pokok bahasan baru di luar artikel acuan sesi ini. Buka sesi baru..."*
   Pengguna yang sudah berada di sesi baru menjadi bingung karena disuruh membuka sesi baru lagi. Ini terjadi karena `isTopicShift` di `AuditBlockView.tsx` mengecek `verdict_status` atau `is_out_of_domain` secara buta tanpa memeriksa apakah ini Turn #1 atau bukan.
2. **Scraper Terjebak URL Proxy Google (Penyebab Nilai Similarity 0.01):**
   Pada kueri arsitektur brutalisme, Serper Google mengembalikan URL pengalihan `translate.google.com` dan `google.com/goto`. Keduanya menghasilkan teks mentah berbahasa Inggris. Akibatnya, draf bahasa Indonesia dibandingkan dengan artikel bahasa Inggris sehingga kemiripan semantik jatuh ke 1% ($0.01 < 0.05$), memicu vonis *Out-of-Domain* palsu.
3. **Akumulasi 151 Riwayat Sesi Lawas:**
   Riwayat pengujian lama di database perlu dibersihkan agar pengujian *Golden Benchmark* dimulai dari kondisi segar (*fresh state*).

---

### 2. Spesifikasi Solusi Teknis

#### Bagian A: Frontend — Pembatasan Kartu Topic Shift (Worker 1)
**File Sasaran:** `frontend/src/components/AuditBlockView.tsx`

**Ketentuan:**
1. Kartu pemblokir `TopicShiftBlockerCard` (*"Fokus Berbeda Terdeteksi / Lanjutkan di Sesi Baru"*) **HANYA BOLEH AKTIF JIKA `turn_number > 1`**.
2. Pada **Turn #1**, tidak ada topik sebelumnya yang dapat "berganti". Jika pada Turn #1 skor rendah, sistem harus merender tampilan audit normal (Verdict, Gauge, Subscores, Breakdown) agar pengguna dapat melihat metrik evaluasinya secara transparan, bukan disuruh membuka sesi baru.

**Kode Implementasi:**
```tsx
// frontend/src/components/AuditBlockView.tsx
const isTurn1 = (audit.turn_number || 1) <= 1;

const isTopicShift =
  !isTurn1 &&
  (audit.verdict_status.includes('Topik Tidak Relevan') ||
    !!audit.metrics?.is_out_of_domain ||
    !!audit.topic_shift_detected);
```

---

#### Bagian B: Backend — Filter Domain Proxy & Redirect Google (Worker 2)
**File Sasaran:** `backend/app/services/serp_scraper.py`

**Ketentuan:**
1. Tambahkan daftar domain proxy/mesin pencari/penerjemah yang tidak boleh dijadikan artikel kompetitor:
```python
SEARCH_ENGINE_PROXY_DOMAINS = {
    "google.com",
    "www.google.com",
    "google.co.id",
    "www.google.co.id",
    "translate.google.com",
    "translate.google.co.id",
    "webcache.googleusercontent.com",
    "bing.com",
    "www.bing.com",
    "yahoo.com",
    "www.yahoo.com",
}
```
2. Perbarui `classify_url_skip_reason(url: str)`:
   Jika domain berada dalam `SEARCH_ENGINE_PROXY_DOMAINS` atau berakhiran `.google.com` / `.google.co.id`, kembalikan alasan `"search_engine_proxy"`.
3. Di dalam `search_and_scrape_competitors`, lewatkan URL dengan alasan ini dan catat ke `summary["skipped_proxy_count"]` agar scraper melaju mengambil artikel website penerbit asli (seperti `arsitektur.uma.ac.id`, `dekoruma.com`, dll.).

---

#### Bagian C: Operasional — Pembersihan Database Sesi Lama (DevOps)
**File Sasaran:** `backend/waskita.db`

Jalankan perintah SQL pembersihan tabel sesi tanpa menghapus tabel `USERS`:
```bash
sqlite3 "backend/waskita.db" "DELETE FROM METRIC_RESULTS; DELETE FROM ENTITY_GAPS; DELETE FROM COMPETITOR_DOCUMENTS; DELETE FROM COMPETITOR_SNAPSHOTS; DELETE FROM AUDIT_SESSIONS; VACUUM;"
```
Muat ulang (*reload*) worker Uvicorn dan bersihkan cache browser / reload tab web.

---

### 3. Kriteria Keberhasilan (Definition of Done)
1. **Uji Turn #1:** Draf baru yang dimasukkan pada "Analisis Baru" tidak pernah menampilkan kartu "Buka Sesi Baru".
2. **Uji Bahasa Scraper:** Scraper tidak lagi mengambil `translate.google.com` atau `google.com/goto`.
3. **Uji Arsitektur Brutalisme:** Naskah *Arsitektur Brutalisme* diaudit terhadap artikel arsitektur bahasa Indonesia dan menghasilkan skor relevansi yang wajar ($> 50\%$).
4. Seluruh rangkaian `pytest` backend lulus 100%.
5. Rilis snapshot tag `v1.4.8-SNAPSHOT.1`.
