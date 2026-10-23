# STANDAR STRATEGI REFACTORING & PROPER LOGGING (PZN STANDARDS)
**Referensi:** Eko Kurniawan Khannedy (Programmer Zaman Now)  
**Lingkup:** Penanganan Spaghetti / Bloated Code, Strategi Migrasi Parsial, dan Standar Logging Berjenjang.

---

## 🏛️ BAGIAN 1: STRANGLER PATTERN & REFACTORING KODE BENGKAK (ANTI-BIG BANG)

Berdasarkan penjelasan Pak Eko mengenai spaghetti code & legacy bloat:
1. **Dilarang "Big Bang Rewrite" (Rombak Total Sekaligus):**
   - Merombak ulang seluruh codebase sekaligus membutuhkan waktu lama, risiko bug baru sangat tinggi, dan menghentikan progres fitur.
2. **Strangler Pattern (Refactoring Bertahap / Parsial):**
   - Ibarat pohon benalu yang perlahan menggantikan pohon lama, refactoring dilakukan per-modul/per-seksi kecil yang jelas batasannya (*isolated module*).
   - Buat sub-komponen baru yang bersih, pasang di satu area, uji stabilitasnya, lalu hapus (*sunset*) potongan kode usang yang lama.
3. **Pemisahan Lapisan yang Tegas (Separation of Concerns):**
   - UI Komponen **DILARANG** mencampuradukkan business logic berat, mock data raksasa, atau query langsung.
   - Mock data / fixture wajib ditaruh di folder mock/fixtures, bukan di dalam file view komponen.
   - Batas wajar ukuran komponen presentasional adalah **maksimal 300-400 baris kode**.

---

## 🪵 BAGIAN 2: PROPER LOGGING STANDARD (LOG LEVEL & SENSITIVE DATA HYGIENE)

Berdasarkan best practice logging Pak Eko:
1. **Gunakan Log Level Berjenjang (Bukan `console.log` / `print` Liar):**
   - **`DEBUG / TRACE`:** Rincian payload request internal, langkah transisi state, query timing. Aktif saat development lokal, wajib di-off / disembunyikan di Production.
   - **`INFO`:** Kejadian bisnis penting (misal: "Audit sesi berhasil diselesaikan", "User beralih ke sesi #2").
   - **`WARN`:** Anomali yang tidak mematikan sistem (misal: "Response API melebihi ambang 3 detik", "Korpus kompetitor hanya kembali 2 dari 3 dokumen").
   - **`ERROR`:** Kegagalan fatal / exception tertangkap (misal: "Koneksi database terputus", "Ekstraksi DOCX gagal").
2. **Hygienic Logging (Data yang DILARANG KERAS Masuk Log):**
   - ❌ **Password / Kredensial mentah:** Dilarang mencatat kata sandi saat request login/register.
   - ❌ **JWT Token / API Key / Session Signature:** Dilarang mencetak token otorisasi utuh ke log file/console untuk mencegah pencurian token oleh pihak ketiga / log scraper.
   - ❌ **Data Pribadi Sensitif (PII):** Nomor telepon, KTP, email pribadi tanpa masking.
