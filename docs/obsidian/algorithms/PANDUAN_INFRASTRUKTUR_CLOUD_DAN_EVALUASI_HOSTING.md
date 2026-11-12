---
title: "Panduan Strategi Infrastruktur Cloud, Bansos Mahasiswa & Evaluasi Hosting WASKITA"
date: 2026-11-12
author: "Ahmad Saif Almuflihin (NIM: 4342301053)"
tags:
  - devops
  - cloud-infrastructure
  - student-developer-pack
  - hosting-evaluation
  - heroku
  - bansos-cloud
---

# Panduan Strategi Infrastruktur Cloud & Evaluasi Hosting WASKITA

> **Konteks:** Menyiapkan rilis publik (*production release*) WASKITA dengan efisiensi biaya maksimal, memanfaatkan fasilitas resmi *GitHub Student Developer Pack*, dan mengantisipasi regulasi pembayaran/kartu debit perbankan Indonesia.

---

## 1. Status & Rincian Paket Heroku for Students

* **Besaran Bansos:** Kredit **\$13 USD / bulan** selama **24 bulan (2 tahun penuh)**.
* **Total Nilai:** \$312 USD (~Rp 5.000.000,-).
* **Masa Kedaluwarsa Penawaran:**
  - Penawaran di *GitHub Student Developer Pack* berlaku selama status akun GitHub berstatus **Verified Student** (diperbarui berkala setiap 1–2 tahun hingga lulus).
  - Begitu kartu debit terverifikasi di akun Heroku dan kupon dimasukkan, masa aktif kredit **berjalan 24 bulan sejak tanggal aktivasi**.
* **Keperluan Verifikasi Kartu:**
  - Heroku hanya melakukan *authorization hold* sementara (~$1 USD) untuk memastikan akun bukan bot, dan dana tersebut dikembalikan secara otomatis (*refund*).
  - Tidak ada tagihan bulanan selama pemakaian dyno dan database tidak melebihi kuota kredit \$13/bulan.

---

## 2. Opsi Perbankan Lokal untuk Aktivasi Layanan Internasional

| Bank / Layanan | Jenis Kartu | Minimal Saldo & Biaya | Kemudahan untuk Mahasiswa |
| :--- | :--- | :--- | :--- |
| **Bank Jago (Aplikasi Jago)** ⭐ *(Rekomendasi Utama)* | Kartu Debit Visa Digital (Virtual) | **Rp 0** saldo minimal, **Rp 0** biaya admin bulanan, buat kartu instan lewat aplikasi tanpa ke kantor cabang. | Sangat mudah, cukup isi saldo Rp 20.000 via Gopay/ShopeePay/DANA untuk verifikasi $1. |
| **Jenius BTPN** | e-Card Visa Virtual | Saldo fleksibel, biaya Feesible Rp 10.000/bln jika saldo aktif. | Standar komunitas tech Indonesia untuk transaksi internasional. |
| **BRI (Debit Virtual / BritAma)** | Mastercard / Visa Debit | Setoran awal Rp 250.000, admin bulanan ~Rp 12.000, saldo mengendap Rp 50.000. | Menggunakan rekening yang sudah ada dengan mengaktifkan fitur Debit Online di aplikasi BRImo. |

---

## 3. Matriks Perbandingan Alternatif Hosting Backend & Database (Bebas Kartu Kredit)

| Platform | Model Biaya | Kelebihan | Keterbatasan | Status untuk WASKITA |
| :--- | :--- | :--- | :--- | :--- |
| **Koyeb** | Free Tier (Tanpa Kartu Kredit) | Micro-service aktif 24/7 di region Tokyo/Frankfurt, build otomatis dari GitHub. | RAM 512 MB (cukup untuk FastAPI + SQLite/NLP ringan). | **Alternatif Aktif Utama** |
| **Render** | Free Tier (Makin dibatasi) | Setup mudah dari repo Git. | *Cold-start delay* 50 detik jika idle 15 menit, batas aktif 750 jam/bulan. | Opsi Cadangan |
| **Microsoft Azure for Students** | Kredit \$100/tahun (Tanpa Kartu Kredit) | VPS Linux VM murni, akses root penuh. | Menunggu reset nomor 2FA dari Helpdesk Kampus Polibatam. | **Target Utama Pasca-Reset 2FA** |
| **Coolify (Self-Hosted VPS)** | Beli VPS Rp 40rb–50rb/bln (IDCloudHost via QRIS) | 100% Open Source, tanpa batasan, UI mewah setara Vercel. | Memerlukan modal awal puluhan ribu per bulan via e-wallet lokal. | Rencana Skala Komersial / Webinar |

---

## 4. Alur Tindak Lanjut Terjadwal

1. **Jangka Sangat Pendek (Hari Ini):**
   - Menunggu balasan dari Bagian Akademik & Helpdesk Polibatam terkait pembetulan ejaan nama ijazah (`AHMAD SAIF ALMUFLIHIN`) dan reset nomor telepon akun Microsoft Azure.
2. **Jangka Pendek (Menyiapkan Kartu Verifikasi):**
   - Berdiskusi santai dengan orang tua atau mempertimbangkan rekening bank digital tanpa biaya admin (seperti Bank Jago) untuk memverifikasi akun Heroku tanpa mengendapkan saldo besar.
3. **Penyimpanan Status:**
   - Seluruh kredensial dan langkah deploy akan dicatat secara privat di vault ini sebelum server live ke publik.
