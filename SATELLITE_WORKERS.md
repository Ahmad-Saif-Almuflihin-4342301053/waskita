# 🛸 PANDUAN CEPAT WASKITA SATELLITE CREW (NON-CODE WORKERS)
## "Katalog Menu & Cara Memanggil Tim Satelit Riset, Data, & Evaluasi"

> **Prinsip Utama:**  
> Seluruh worker di bawah ini adalah **Pekerja Pendukung Non-Koding**.  
> Mereka **TIDAK AKAN PERNAH** menyentuh file kode aplikasi (`.py`, `.tsx`, `.ts`), sehingga **NOL RISIKO** tabrakan Git atau merusak aplikasi!  
> Semua output disimpan rapi dalam format Markdown di folder: `docs/satellite_reports/`.

---

### 🕹️ CARA PALING GAMPANG: MENU INTERAKTIF
Buka terminal di root `waskitariset/`, lalu ketik:
```bash
./crew.sh
```
Pilih angka `1` sampai `5` sesuai kebutuhan Anda!

---

### 📋 DAFTAR WORKER & PERINTAH LANGSUNGNYA

| No | Nama Worker | Perintah Cepat | Tugas & Manfaat Nyata |
| :---: | :--- | :--- | :--- |
| **1** | **🎯 Market Scout** | `./crew.sh 1` *atau* `./crew.sh scout` | **Riset Topik Klinik Bidan Afita:** Mengumpulkan 25 kata kunci kesehatan ibu & anak paling dicari di Google + outline konten siap terbit untuk negosiasi WFH. |
| **2** | **🥊 Bug Hunter** | `./crew.sh 2` *atau* `./crew.sh hunter` | **Adversarial Stress-Test:** Menguji sistem Waskita dengan kueri ekstrem, koma, bahasa gaul, dan mencari celah false-positive sebelum ditemukan pengguna lain. |
| **3** | **📝 Paper Scribe** | `./crew.sh 3` *atau* `./crew.sh paper` | **Publikasi Ilmiah:** Membaca hasil akurasi terbaru dan memperbarui naskah jurnal internasional bahasa Inggris di `docs/PAPER_WASKITA_ENGLISH.md`. |
| **4** | **📈 Rank Tracker** | `./crew.sh 4` *atau* `./crew.sh rank` | **Pelacak Peringkat Google:** Menganalisis dan menyusun tabel monitoring posisi ranking Google artikel klinik untuk bukti kinerja nyata (*ROI*). |
| **5** | **💰 System Guard** | `./crew.sh 5` *atau* `./crew.sh quota` | **Audit Sistem (0 Token AI!):** Mengecek ukuran database SQLite, jumlah cache kompetitor, dan memastikan API key Serper aman. |

---

### 💡 Tips Hemat Token
* Worker 1, 2, 3, dan 4 dikonfigurasi menggunakan model super hemat: **`gemini-3.8-flash-low`**.
* Worker 5 (**System Guard**) dijalankan menggunakan skrip Python murni, sehingga memakan **0 TOKEN (100% GRATIS)**!
* Jalankan worker ini hanya saat dibutuhkan (misal: seminggu sekali atau saat butuh bahan presentasi ke Bidan Afita).
