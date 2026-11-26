# 🧩 Checklist Micro-Sprints Penuntasan Skripsi WASKITA

> **Prinsip Anti-Mager**: Jangan lihat "Skripsi Bab 1–5" sekaligus. Kode & eksperimen **sudah 95% beres**, diagram Bab 3 **100% beres**. Yang tersisa tinggal **5 Sprint Kecil (masing-masing 20–30 menit)** di Google Docs master: [Ahmad Saif Almuflihin-4342301053](https://docs.google.com/document/d/1nwItrST20N_nFEr8-iFes12sASCBAGjZen_P2_plWk8/edit).

---

## 🎯 SPRINT 1: Bereskan Bab 3 (~20 Menit, Paling Ringan)
*Target: Bab 3 bersih total tanpa mikir teori.*
- [ ] **1A (5 mnt)**: Ganti **Gambar 3.2** (Arsitektur) dari [PresentationLayer.drawio](https://drive.google.com/file/d/1MPgBU_2KDckAufRTbl0AC76I2T3IU7H3/view) (*export PNG* dulu di Draw.io biar teks `SearXNG / Google` masuk).
- [ ] **1B (3 mnt)**: Tempel **Gambar 3.3** (`use_case_waskita_lengkap.png` / `bersih`).
- [ ] **1C (4 mnt)**: Tempel **Gambar 3.4** (`sequence_diagram_waskita.png`) & ubah paragraf 3.4.5 dari "Activity" ke "Sequence".
- [ ] **1D (4 mnt)**: Cek/tempel **Gambar 3.5** (`erd_chen_standar_kampus_bw.png` atau `erd_relasional_standar_kampus_bw.png`).
- [ ] **1E (4 mnt)**: Ganti **Gambar 3.6** dengan `wireframe_mobile_4layar_waskita.png` + `wireframe_desktop_monitor_waskita.png`.

---

## ⚙️ SPRINT 2: Bab 4 Bagian A — Implementasi Sistem (~30 Menit)
*Target: Tunjukkan aplikasi yang sudah jadi + screenshot asli.*
- [ ] **2A (10 mnt)**: Screenshot tampilan asli `localhost:5173` (Halaman Awal, Modal `+`, Hasil Audit, Sidebar Mobile) — *bisa dibantu Playwright*.
- [ ] **2B (10 mnt)**: Ringkas spesifikasi implementasi dari kode (`FastAPI`, `SQLite WAL`, `SearXNG` + fallback Google/HTTPX, `Sastrawi`, `TF-IDF`, `VSM`, `IG`, `MATTR/HKO`).
- [ ] **2C (10 mnt)**: Tempel tabel daftar endpoint API & struktur tabel database aktual.

---

## 📊 SPRINT 3: Bab 4 Bagian B — Hasil Pengujian & Analisis (~30 Menit)
*Target: Tuangkan data eksperimen yang sudah ada menjadi tabel & grafik.*
- [ ] **3A (10 mnt)**: Rekap **Confusion Matrix** 60 naskah uji (TP=30, TN=30, FP=0, FN=0 → Akurasi/Precision/Recall/F1 = 100%) & jelaskan 5 skenario negatif meja redaksi.
- [ ] **3B (10 mnt)**: Tarik statistik latensi & keandalan dari `backend/logs/*.jsonl` (`audit_decision_forensics.jsonl`, `serp_waterfall_telemetry.jsonl`) + buat 1–2 grafik sederhana.
- [ ] **3C (10 mnt)**: Tulis 1–2 paragraf pembahasan: *mengapa VSM + Information Gain + Veto Redundansi berhasil mencegah konten "mirip/AI tipis" lolos*.

---

## 🏁 SPRINT 4: Bab 5 (Penutup) & Revisi Sempro (~20 Menit)
- [ ] **4A (10 mnt)**: Tulis **5.1 Kesimpulan** (menjawab langsung poin di Rumusan Masalah 1.2) + **5.2 Saran** (ambil dari `Batasan_Lingkup_dan_Saran_Riset_Lanjutan_WASKITA.md`).
- [ ] **4B (10 mnt)**: Cek ulang **10 poin revisi Sempro** & isi form matriks revisi kampus (sambil santai).

---

## ✨ SPRINT 5: Finishing Teknis Sebelum Kumpul (~20 Menit)
- [ ] **5A (10 mnt)**: Update otomatis **Daftar Isi, Daftar Gambar, Daftar Tabel, & Daftar Pustaka (Zotero)**.
- [ ] **5B (5 mnt)**: Cek typo, konsistensi istilah (`SearXNG`, bukan `Serper.dev`), dan kerapian nomor halaman.
- [ ] **5C (5 mnt)**: Export PDF + kirim ke Pak Ari untuk acc bimbingan.
