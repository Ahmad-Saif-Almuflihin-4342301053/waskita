# STANDAR OPERASIONAL BAKU QA & QUALITY GATES (PZN & ENTERPRISE STANDARD)
**Prinsip:** Anti-Bloat, Anti-Spaghetti, Visual Ergonomics, dan Proper Logging

Setiap **Worker QA (Worker 3)** dan **DevOps Gatekeeper** DILARANG meluluskan Pull Request sebelum 5 lapis Quality Gate berikut terpenuhi 100%:

---

## 🛑 GATE 1: CODE HYGIENE & ANTI-SPAGHETTI (STRANGLER PATTERN AUDIT)
*QA wajib memeriksa kebersihan arsitektur kode sebelum pengujian fungsional.*

1. **Aturan 400 Baris (Component Size Limit):**
   - Komponen React tunggal **tidak boleh melebihi 400 baris**. Jika melebihi, PR **WAJIB DIREJECT** untuk dipecah (menggunakan pola strangler).
2. **Pembersihan Kode Mati (Zero Dead-Code):**
   - Kode lama yang sudah tidak aktif (seperti sisa mockup `auth-audit-views.tsx`) wajib dihapus bersih, dilarang dibiarkan menumpuk.
3. **Pemisahan Data Mock & Inline Styles:**
   - Objek data teks panjang (seperti `SAMPLE_DRAFTS`) wajib ditaruh di file data/mock khusus, dilarang ditanam di dalam file komponen UI.
   - Tag `<style>` inline keyframes wajib ditaruh di `index.css`.

---

## 🛑 GATE 2: VISUAL ERGONOMICS & UI FIDELITY
*QA wajib menguji visual DOM/browser secara langsung, bukan hanya membaca terminal.*

1. **Kesesuaian Tata Letak dengan Mockup Asli:**
   - Footer sidebar menggunakan ikon Settings (`IconSettings`) rapi, dilarang menempel teks mentah `🌓 Mode Tampilan`.
   - Tombol aksi header menyatu dalam bilah navigasi, tidak melayang sendirian di sudut layar.
2. **Eliminasi Emoji Berlebihan:**
   - Gunakan microcopy editorial profesional tanpa emoji yang merusak estetika antarmuka.
3. **Boundary Kontainer:**
   - Dropdown menu titik tiga (Pin, Rename, Export, Delete) tidak boleh melebar keluar dari batas sidebar (*no horizontal overflow*).

---

## 🛑 GATE 3: PROPER LOGGING HYGIENE (PZN LOGGING STANDARD)
1. **No Raw Password & Token in Console:**
   - QA wajib memeriksa tidak ada `console.log(password)` atau cetakan JWT Bearer token utuh di console browser/terminal.
2. **Berjenjang (Log Level):**
   - Logging debug hanya aktif di development; production bersih dari spam console.

---

## 🛑 GATE 4: FUNCTIONAL & REGRESSION TESTING
1. **Akurasi 100% Deterministic IR:** `evaluate_accuracy.py` wajib `F1 = 1.0`.
2. **Backend Pytest:** Seluruh endpoint `/thread`, `/execute`, dll. lolos 100%.
3. **Frontend Edge Cases:** Gate 300 kata mengunci submit; sanitasi media `[gambar 1]`, `[video 1]` tidak merusak jumlah kata.

---

## 🛑 GATE 5: BUILD & BUNDLE SIZE GATE
1. `npm run build` wajib exit code 0 tanpa error tipe TypeScript.
2. Bundle terkompresi `dist/` wajib tetap ringan (dibawah 350 KB).
