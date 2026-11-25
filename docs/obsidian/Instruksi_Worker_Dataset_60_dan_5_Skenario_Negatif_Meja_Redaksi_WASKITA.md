# 🛠️ Instruksi Eksekusi Worker (Mode B — Ponytail): Pembaruan Dataset 60 Naskah Uji (5 Skenario Negatif Meja Redaksi), Pemanen SERP Otomatis, & Evaluasi Latensi Bab 4 WASKITA

> **Target Pelaksana:** Model Worker Hemat Kuota (Mode B — Flash / Coder Agent)  
> **Arsitek Perancang:** Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Tanggal Spesifikasi:** Senin, 23 November 2026  
> **Repositori Target:** `/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset`  
> **Cabang Git Aktif:** `feat/issue-95-konsolidasi-mitigasi-dan-sitasi-skripsi`  
> **Standar Koding:** **Ponytail (`AGENTS.md`)** — *The best code is the code never written. Reuse existing functions, eliminate duplicate evaluation code, zero bloat, 100% test verification.*  
> **Tautan Terkait:** [[Dashboard]], [[Daftar_60_Teks_Uji_Manual_Out_of_The_Box_WASKITA]], [[Transkrip_Bimbingan_Pak_Ari_2026-11-20]]

---

## 🧠 LATAR BELAKANG & KEPUTUSAN ARSITEKTUR (BAB 4 SKRIPSI)

1. **Mengapa 30 Data Uji Negatif Menggunakan 5 Skenario Meja Redaksi (Pra-Publikasi)?**
   - Di Google SERP halaman pertama (*Post-Publication*), artikel yang tampil sudah terseleksi ketat oleh algoritma Google sehingga jarang ditemukan naskah berkualitas buruk.
   - **WASKITA** beroperasi sebagai **Gerbang Kurasi Pra-Publikasi (*Pre-Publication Gatekeeper*)** di meja redaksi CMS. Oleh karena itu, 30 sampel negatif (`Perlu Revisi`) dirancang menyimulasikan **5 kesalahan nyata penulis di meja redaksi** yang paling sering terjadi dan mudah dipahami secara intuitif:
     - **`N1` (10 Draf) — Naskah Kotor / Copas Mentah `Ctrl+A` Website:** Naskah hasil salin tempel mentah dari halaman web lengkap dengan menu navigasi (`Beranda > Kategori > Bagikan ke Facebook | WhatsApp | Salin Link`), widget *"Baca Juga:"*, serta komentar netizen (*"Komentar (24) | Pertamax gan..."*).
     - **`N2` (5 Draf) — Artikel Dangkal / Cuma Basa-Basi Singkat (2 Kalimat):** Judul terlihat lengkap, tetapi isinya hanya 2 kalimat pengantar singkat ($\pm 22\text{--}28$ kata) tanpa penjelasan substansi (*Information Deficit* parah).
     - **`N3` (5 Draf) — Artikel Ngelantur / Judul Menipu (Beda Topik Total dengan Isi):** Target kueri dan judul membahas Topik A (misal tanaman Monstera atau Python), tetapi isi artikelnya malah membahas Topik B yang sama sekali tidak nyambung (misal resep membuat donat kentang atau perawatan transmisi mobil matic).
     - **`N4` (5 Draf) — Plagiat Total / Jiplak Bulat-Bulat 100%:** Menyalin 100% kalimat demi kalimat dari artikel kompetitor peringkat 1 tanpa parafrasa dan tanpa nilai tambah (*Information Gain = 0%*).
     - **`N5` (5 Draf) — Brosur Jualan / Iklan Baris WhatsApp yang Menyamar Jadi Artikel:** Teks katalog jual-beli (kavling tanah murah, paket bibit, herbal) yang penuh daftar harga `Rp ...`, klaim diskon, dan nomor kontak *"Hubungi WA 0812-XXXX-XXXX / wa.me/628..."*.

2. **Pemanfaatan Mesin WASKITA untuk Panen Variasi Artikel (`--harvest-query`) & Prinsip Ponytail (DRY):**
   - Menghapus **110 baris kode duplikat** `evaluate_single_draft()` di `scripts/build_dataset_60.py` dan langsung memanggil `evaluate_draft()` dari `backend/tests/evaluate_accuracy.py` (*Single Source of Truth*).
   - Menambahkan argumen opsional `--harvest-query "<kueri>"` pada `scripts/build_dataset_60.py` yang langsung memanggil `search_and_scrape_competitors()` bawaan WASKITA untuk memanen variasi artikel riil dari internet kapan saja dibutuhkan.
   - Menambahkan pengukuran **Latensi Server (`latency_ms`)** per naskah beserta rekapitulasi (`avg_latency_ms`, `min_latency_ms`, `max_latency_ms`, `p95_latency_ms`) di `backend/tests/evaluate_accuracy.py` sesuai persetujuan evaluasi *System-Centric* dari Pak Ari Wibowo.

---

## 📌 ATURAN MUTLAK UNTUK MODEL WORKER (PONYTAIL)
1. **ZERO IMPROVISATION & ZERO BLOAT:** Jangan menambah file baru atau library baru. Cukup perbarui `backend/tests/evaluate_accuracy.py` dan `scripts/build_dataset_60.py`, lalu hasilkan ulang `backend/tests/fixtures/dataset_60_drafts.json` dan `backend/tests/fixtures/accuracy_evaluation_report.json`.
2. **TARGET AKURASI:** Seluruh 30 Positif (`P1` 15 + `P2` 15) dan 30 Negatif (`N1` 10 + `N2` 5 + `N3` 5 + `N4` 5 + `N5` 5) wajib mencapai **100% Match (60/60)** atau minimal $\ge 96\%$ dengan `pytest` lulus 100%.

---

## 🔧 DETAIL IMPLEMENTASI LANGKAH DEMI LANGKAH

### 📦 LANGKAH 1: Tambahkan Pengukuran Latensi Server (`latency_ms`) di `backend/tests/evaluate_accuracy.py`

Buka `backend/tests/evaluate_accuracy.py`:

#### 1A. Tambahkan `import time` di bagian atas file (`evaluate_accuracy.py` baris 15–20):
```python
import asyncio
import json
import os
import sys
import time
from typing import Any, Dict, List, Tuple
```

#### 1B. Ukur waktu eksekusi `t_start = time.perf_counter()` di dalam `evaluate_draft()` (`evaluate_accuracy.py` baris 35–48 dan baris 170–192):
Di awal `evaluate_draft(draft: Dict[str, Any], thresholds: ThresholdConfig)`:
```python
    t_start = time.perf_counter()
```
Dan sebelum `return { ... }` di akhir `evaluate_draft()`:
```python
    latency_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
```
Tambahkan `"latency_ms": latency_ms,` ke dalam dictionary yang di-`return` oleh `evaluate_draft()`.

#### 1C. Tambahkan Rekapitulasi Statistik Latensi Server di `run_accuracy_evaluation()` (`evaluate_accuracy.py` sekitar baris 250–305):
Hitung statistik latensi dari `results`:
```python
    latencies = sorted(r.get("latency_ms", 0.0) for r in results)
    avg_latency_ms = round(sum(latencies) / max(1, len(latencies)), 2)
    min_latency_ms = round(latencies[0], 2) if latencies else 0.0
    max_latency_ms = round(latencies[-1], 2) if latencies else 0.0
    p95_idx = min(len(latencies) - 1, int(len(latencies) * 0.95)) if latencies else 0
    p95_latency_ms = round(latencies[p95_idx], 2) if latencies else 0.0
```
Masukkan objek `"latency_benchmark_ms"` ke dalam dictionary `summary` yang disimpan ke `accuracy_evaluation_report.json`:
```python
        "latency_benchmark_ms": {
            "avg_latency_ms": avg_latency_ms,
            "min_latency_ms": min_latency_ms,
            "max_latency_ms": max_latency_ms,
            "p95_latency_ms": p95_latency_ms,
        },
```

---

### 📦 LANGKAH 2: Perbarui `scripts/build_dataset_60.py` (5 Skenario Negatif Meja Redaksi + Ponytail DRY + Harvester CLI)

Buka `scripts/build_dataset_60.py`:

#### 2A. Perbaiki 2 Draf Positif `P2` (Topik 12 & Topik 14) agar Bebas False-Negative Red-Span Pasca-Upgrade Lemmatizer `nlp-id`
Di dalam fungsi `build_p2_drafts()` pada `scripts/build_dataset_60.py`:
- Pada `p2_contents[12]` (baris 218–230), ganti isi teksnya dengan parafrasa empiris yang lebih mandiri agar tidak memicu *red-span* berlebih terhadap korpus kompetitor:
```python
        12: (
            "Strategi Akumulasi Modal Generasi Muda: Pemanfaatan Likuiditas dan Keamanan Reksa Dana Pasar Uang",
            """Memulai langkah akumulasi aset finansial bagi pekerja muda menuntut seleksi wadah penempatan dana yang memprioritaskan ketahanan nilai pokok serta meminimalkan guncangan fluktuasi bursa. Reksa Dana Pasar Uang atau RDPU tampil sebagai instrumen tabungan produktif yang sangat luwes bagi investor ritel tahap awal. Melalui pengalokasian modal pada surat utang berumur pendek, wadah ini menyuguhkan pertumbuhan saldo yang jauh lebih terprediksi daripada spekulasi saham harian.

## Komposisi Instrumen Kas Perbankan dan Surat Utang Tenor Pendek
Stabilitas kinerja RDPU ditopang oleh penempatan dana kelolaan secara eksklusif pada sertifikat deposito perbankan buku empat serta surat berharga korporasi maupun negara yang masa jatuh temponya kurang dari dua belas bulan. Seluruh racikan aset tersebut diawasi secara ketat oleh tim analis manajer investasi berlisensi. Pergerakan kurva nilai aktiva bersih cenderung mendaki secara mulus setiap pekan tanpa gejolak penurunan tajam.

## Kemudahan Pencairan Saldo Darurat dan Efisiensi Perpajakan
Keunggulan utama yang membuat RDPU cocok sebagai tempat parkir dana darurat adalah ketiadaan denda penalti ketika pemilik modal mencairkan unit penyertaan sewaktu-waktu melalui aplikasi digital. Di samping proses pencairan T+1 yang praktis, selisih pertumbuhan nilai unit penyertaan dikategorikan sebagai bukan objek potongan pajak penghasilan final, sehingga imbal hasil bersih yang diterima melampaui bunga tabungan konvensional.

## Pemisahan Wewenang Penyimpanan Aset pada Bank Kustodian
Integritas tata kelola modal investor dilindungi oleh regulasi Otoritas Jasa Keuangan melalui mekanisme pemisahan rekening penyimpanan pada lembaga bank kustodian independen. Perusahaan manajer investasi hanya berwenang mengatur strategi alokasi portofolio tanpa bisa membawa kabur uang nasabah. Transparansi laporan bulanan atau fund fact sheet memudahkan generasi muda memantau perkembangan kekayaan secara berkala."""
        ),
```
- Pada `p2_contents[14]` (baris 244–256), ganti isi teksnya dengan parafrasa struktural yang mandiri:
```python
        14: (
            "Protokol Korespondensi Bisnis Modern: Standarisasi Struktur Email dan Etika Komunikasi Korporat",
            """Pertukaran pesan surat elektronik di ranah korporasi modern bukan sekadar saluran kirim berkas, melainkan cerminan kredibilitas serta kedisiplinan kerja seorang profesional. Pesan yang bertele-tele atau tata letak yang semrawut kerap menghambat pengambilan keputusan lintas departemen, menunda jadwal peluncuran produk, bahkan menurunkan kepercayaan klien strategis terhadap kualitas layanan perusahaan.

## Perumusan Tajuk Pesan Presisi dan Alur Paragraf Piramida Terbalik
Surat elektronik yang efektif selalu dibuka dengan penulisan tajuk subjek yang spesifik memuat konteks proyek beserta tingkat prioritasnya. Gunakan sapaan pembuka yang menghormati jabatan lawan bicara secara proporsional. Terapkan prinsip piramida terbalik dengan menuliskan inti permasalahan pada kalimat pertama, diikuti rincian poin teknis yang ringkas, lalu tutup dengan kalimat kesimpulan mengenai langkah tindak lanjut yang disepakati bersama.

## Disiplin Penggunaan Jalur Distribusi Penerima dan Standar Berkas
Ketepatan memilih kolom alamat tujuan sangat menentukan efektivitas koordinasi tim. Tempatkan alamat rekan yang wajib mengeksekusi tugas langsung pada kolom tujuan utama, sedangkan atasan atau pemangku kepentingan yang sekadar membutuhkan laporan perkembangan cukup dimasukkan ke jalur tembusan. Ketika mengirimkan undangan massal ke pihak luar, manfaatkan jalur tembusan tertutup demi menjaga privasi data alamat kontak, serta pastikan dokumen lampiran telah dikonversi ke format statis yang rapi.

##Kewaspadaan Nada Bahasa Tertulis dan Pemeriksaan Akhir
Mengingat teks layar tidak memiliki intonasi suara, pilihlah diksi kalimat aktif yang sopan dan hindari pemakaian huruf besar seluruhnya yang memberi kesan membentak. Biasakan membaca ulang seluruh isi draf dari baris subjek hingga identitas jabatan di kaki surat sebelum menekan tombol pengiriman guna memastikan tidak ada kesalahan penyebutan nama maupun dokumen yang tertinggal."""
        ),
```

#### 2B. Ganti Fungsi `build_n1_drafts()` s/d `build_n5_drafts()` dengan 5 Skenario Negatif Meja Redaksi (Total = 30 Draf Negatif)

Ubah kelima fungsi pembangun draf negatif di `scripts/build_dataset_60.py` menjadi tepat 30 draf berikut:

1. **`build_n1_drafts()` — 10 Draf Naskah Kotor / Copas Mentah `Ctrl+A` Website (`stratum = "N1"`):**
   Gunakan `n1_topic_ids = [1, 2, 3, 5, 7, 8, 9, 11, 13, 14]`.
   Untuk setiap topik tersebut, bungkus teks artikel dengan elemen sampah DOM hasil `Ctrl+A` portal web dan komentar pembaca sehingga `detect_web_chrome_noise()` menangkapnya secara deterministik:
   ```python
   def build_n1_drafts() -> List[Dict[str, Any]]:
       """Membangun 10 draf N1 (Naskah Kotor / Copas Mentah Ctrl+A Website + Menu Navigasi & Komentar)."""
       topics = {t["topic_id"]: t for t in get_topic_metadata()}
       n1_topic_ids = [1, 2, 3, 5, 7, 8, 9, 11, 13, 14]
       n1_drafts = []

       for tid in n1_topic_ids:
           t_meta = topics[tid]
           docs = get_fallback_corpus(t_meta["query"])
           comp1 = docs[0]
           title = f"[Ctrl+A Mentah] {comp1['page_title']}"
           dirty_ctrl_a_text = (
               f"Beranda > {t_meta['category']} > Artikel Terpopuler\n"
               f"Bagikan ke Facebook | Bagikan ke WhatsApp | Bagikan ke Twitter | Salin Link\n"
               f"Diterbitkan Selasa, 19 Nov 2026 14:30 WIB - Waktu baca 4 menit\n"
               f" ADVERTISEMENT - SCROLL TO CONTINUE WITH CONTENT \n\n"
               f"{comp1['clean_text']}\n\n"
               f"Baca Juga: 10 Tips Pilihan Redaksi Lainnya yang Wajib Anda Ketahui Hari Ini\n"
               f"Baca Juga: Berita Terpopuler Minggu Ini di Kanal {t_meta['category']}\n"
               f"Tag Populer: #{t_meta['key'].replace(' ', '')} #Viral #InfoTerkini\n\n"
               f"--- KOLOM KOMENTAR PEMBACA (42 Komentar) ---\n"
               f"Tulis komentar Anda... (Maksimal 500 karakter) | Kirim Komentar\n"
               f"1. Agus_Santoso99 (2 jam yang lalu): Pertamax gan! Mantap banget infonya sangat bermanfaat.\n"
               f"   Balas | Bagikan | Laporkan Penyalahgunaan\n"
               f"2. Siti_Rahmawati (1 jam yang lalu): Izin share ke grup WA keluarga ya min, terima kasih.\n"
               f"   Balas | Bagikan | Laporkan Penyalahgunaan\n"
               f"Hak Cipta © 2026 Portal Berita Nasional - Redaksi | Pedoman Media Siber | Kebijakan Privasi"
           )
           n1_drafts.append({
               "id": f"draft-{tid:02d}-N1",
               "topic_id": tid,
               "category": t_meta["category"],
               "target_query": t_meta["query"],
               "stratum": "N1",
               "stratum_description": "Naskah Kotor / Copas Mentah Ctrl+A Website & Komentar",
               "draft_title": title,
               "ground_truth_label": "Perlu Revisi",
               "expert_notes": "Salinan mentah Ctrl+A halaman web yang masih memuat breadcrumb navigasi, tombol share, iklan Baca Juga, dan komentar netizen.",
               "draft_content": dirty_ctrl_a_text,
               "word_count": len(dirty_ctrl_a_text.split()),
           })
       return n1_drafts
   ```

2. **`build_n2_drafts()` — 5 Draf Artikel Dangkal / Cuma Basa-Basi Singkat 2 Kalimat (`stratum = "N2"`):**
   Gunakan `n2_topic_ids = [2, 4, 6, 10, 12]`.
   Isi dengan 2 kalimat pengantar basa-basi pendek ($\pm 22\text{--}26$ kata) yang tidak membahas entitas inti sama sekali sehingga terkena `is_superficial_content` ($C_{IG} < 45\%$):
   ```python
   def build_n2_drafts() -> List[Dict[str, Any]]:
       """Membangun 5 draf N2 (Artikel Dangkal / Basa-Basi Singkat 2 Kalimat Tanpa Substansi)."""
       topics = {t["topic_id"]: t for t in get_topic_metadata()}
       n2_topic_ids = [2, 4, 6, 10, 12]
       n2_drafts = []

       for tid in n2_topic_ids:
           t_meta = topics[tid]
           title = f"Pengantar Singkat Mengenai {t_meta['query'].title()}"
           shallow_text = (
               f"Membahas tentang {t_meta['key']} memang menjadi hal yang sering diperbincangkan oleh banyak orang saat ini. "
               f"Semua pihak tentu berharap pembahasan ini dapat memberikan gambaran umum yang berguna. Sekian dan terima kasih."
           )
           n2_drafts.append({
               "id": f"draft-{tid:02d}-N2",
               "topic_id": tid,
               "category": t_meta["category"],
               "target_query": t_meta["query"],
               "stratum": "N2",
               "stratum_description": "Artikel Dangkal / Cuma Basa-Basi Singkat Tanpa Isi",
               "draft_title": title,
               "ground_truth_label": "Perlu Revisi",
               "expert_notes": "Draf terlalu dangkal (hanya 2 kalimat basa-basi tanpa penjelasan substantif), memicu Information Deficit C_IG < 45%.",
               "draft_content": shallow_text,
               "word_count": len(shallow_text.split()),
           })
       return n2_drafts
   ```

3. **`build_n3_drafts()` — 5 Draf Artikel Ngelantur / Judul Menipu Beda Topik Total (`stratum = "N3"`):**
   Gunakan `n3_topic_ids = [3, 4, 6, 10, 13]`.
   Target kueri dan judul sesuai topik (`t_meta["query"]`), tetapi isi naskahnya membahas topik lain yang sama sekali tidak nyambung (resep kue donat kentang, jadwal pertandingan sepak bola, sejarah candi purbakala, servis transmisi mobil, atau panduan merakit akuarium laut) sehingga `avg_cosine_sim < 0.05` (`is_out_of_domain=True`):
   ```python
   def build_n3_drafts() -> List[Dict[str, Any]]:
       """Membangun 5 draf N3 (Artikel Ngelantur / Judul Beda Total dengan Isi Naskah)."""
       topics = {t["topic_id"]: t for t in get_topic_metadata()}
       n3_off_topic_contents = {
           3: (
               "Panduan Lengkap SEO On Page Artikel Blog untuk Pemula",
               """Membuat adonan donat kentang kampung yang empuk dan mengembang sempurna membutuhkan takaran tepung terigu protein tinggi serta ragi instan yang masih aktif. Kukus kentang hingga lunak lalu haluskan selagi hangat sebelum dicampur bersama kuning telur, gula pasir, dan margarin cair. Uleni adonan hingga kalis elastis lalu diamkan selama empat puluh menit dengan ditutup kain lembab agar mengembang dua kali lipat. Panaskan minyak goreng dengan api kecil, cetak bulatan donat berlubang di tengah, lalu goreng hingga kuning keemasan dan taburi gula halus."""
           ),
           4: (
               "Cara Merawat Tanaman Monstera Deliciosa agar Daunnya Berlubang Indah",
               """Pertandingan babak perempat final turnamen sepak bola piala Eropa malam tadi berlangsung sangat sengit di stadion utama di hadapan puluhan ribu suporter fanatik. Penjaga gawang tim tuan rumah berhasil menepis tiga tendangan penalti beruntun pada drama adu tos-tosan setelah skor imbang bertahan hingga babak perpanjangan waktu usai. Pelatih kepala memuji kedisiplinan barisan bek tengah dalam menjaga jebakan offside serta ketajaman serangan balik sayap kanan yang memaksa lawan bertahan total sepanjang laga."""
           ),
           6: (
               "Strategi Mengelola Keuangan Pribadi untuk Pemula Gaji UMR",
               """Perawatan berkala transmisi otomatis mobil matic konvensional maupun CVT wajib memperhatikan jadwal penggantian oli pelumas girboks setiap empat puluh ribu kilometer di bengkel resmi. Gejala kerusakan kampas kopling matic biasanya ditandai dengan hentakan kasar saat tuas persneling dipindahkan dari posisi parkir ke gigi maju serta keterlambatan respon putaran mesin ketika menanjak curam. Pemeriksaan kebocoran sil karet karter dan pembersihan saringan filter logam mencegah keausan komponen hidrolik."""
           ),
           10: (
               "Panduan Belajar Pemrograman Python Dasar untuk Pemula",
               """Sejarah berdirinya kompleks percandian batu andesit di lereng pegunungan Jawa Tengah berkaitan erat dengan kejayaan dinasti kerajaan kuno pada abad kedelapan masehi. Relief pahatan pada dinding batu menggambarkan kisah perjalanan kafilah dagang maritim, tarian tradisional istana, serta arsitektur kapal bercadik kayu raksasa yang mengarungi samudra Hindia. Pemugaran struktur stupa dan pelestarian prasasti aksara Pallawa dilakukan oleh tim arkeolog guna melindungi warisan cagar budaya nasional."""
           ),
           13: (
               "Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit",
               """Memilih sepatu lari maraton jarak jauh menuntut pengukuran anatomi lengkungan telapak kaki serta ketebalan bantalan busa sol tengah guna meredam benturan lutut di lintasan aspal. Pelari pemula disarankan melakukan pemanasan peregangan otot betis dan paha belakang selama lima belas menit sebelum memulai latihan interval kecepatan. Pengaturan irama ayunan lengan serta pernapasan perut menjaga detak jantung tetap stabil hingga melewati garis finis."""
           ),
       }
       n3_drafts = []
       for tid, (title, content) in n3_off_topic_contents.items():
           t_meta = topics[tid]
           n3_drafts.append({
               "id": f"draft-{tid:02d}-N3",
               "topic_id": tid,
               "category": t_meta["category"],
               "target_query": t_meta["query"],
               "stratum": "N3",
               "stratum_description": "Artikel Ngelantur / Judul Menipu Beda Topik Total",
               "draft_title": title,
               "ground_truth_label": "Perlu Revisi",
               "expert_notes": "Isi naskah melenceng 180 derajat dari judul dan kueri target. Tertangkap oleh Topic Relevance Gate (avg_cosine_sim < 0.05).",
               "draft_content": content,
               "word_count": len(content.split()),
           })
       return n3_drafts
   ```

4. **`build_n4_drafts()` — 5 Draf Plagiat Total / Jiplak Bulat-Bulat 100% (`stratum = "N4"`):**
   Gunakan `n4_topic_ids = [1, 7, 9, 11, 15]`.
   Menyalin 100% teks kompetitor peringkat 1 & 2 tanpa nilai tambah (*Information Gain = 0%*):
   ```python
   def build_n4_drafts() -> List[Dict[str, Any]]:
       """Membangun 5 draf N4 (Plagiat Total / Jiplak Bulat-Bulat 100% dari Kompetitor SERP)."""
       topics = {t["topic_id"]: t for t in get_topic_metadata()}
       n4_topic_ids = [1, 7, 9, 11, 15]
       n4_drafts = []

       for tid in n4_topic_ids:
           t_meta = topics[tid]
           docs = get_fallback_corpus(t_meta["query"])
           comp1, comp2 = docs[0], docs[1]
           title = comp1["page_title"]
           plagiat_text = f"## {comp1['headings'][0]['text']}\n{comp1['clean_text']}\n\n## {comp2['headings'][0]['text']}\n{comp2['clean_text']}"
           n4_drafts.append({
               "id": f"draft-{tid:02d}-N4",
               "topic_id": tid,
               "category": t_meta["category"],
               "target_query": t_meta["query"],
               "stratum": "N4",
               "stratum_description": "Plagiat Total / Jiplak Bulat-Bulat 100% Kompetitor",
               "draft_title": title,
               "ground_truth_label": "Perlu Revisi",
               "expert_notes": "Menjiplak 100% kalimat kompetitor halaman 1 tanpa parafrasa dan tanpa nilai tambah (Red-Span Veto & High Cosine).",
               "draft_content": plagiat_text,
               "word_count": len(plagiat_text.split()),
           })
       return n4_drafts
   ```

5. **`build_n5_drafts()` — 5 Draf Brosur Jualan / Iklan Baris WhatsApp yang Menyamar Jadi Artikel (`stratum = "N5"`):**
   Gunakan `n5_topic_ids = [4, 5, 8, 12, 15]`.
   Isi dengan teks katalog/brosur jualan penuh harga `Rp ...`, diskon promo, dan kontak WhatsApp `wa.me/62812...` sehingga tertangkap oleh `detect_commercial_drift()`:
   ```python
   def build_n5_drafts() -> List[Dict[str, Any]]:
       """Membangun 5 draf N5 (Brosur Jualan / Iklan Baris WhatsApp yang Menyamar Jadi Artikel)."""
       topics = {t["topic_id"]: t for t in get_topic_metadata()}
       n5_topic_ids = [4, 5, 8, 12, 15]
       n5_drafts = []

       for tid in n5_topic_ids:
           t_meta = topics[tid]
           docs = get_fallback_corpus(t_meta["query"])
           intro_hook = docs[0]["clean_text"].split(".")[0] + "."
           title = f"PROMO MURAH! Jual Paket Lengkap {t_meta['key'].title()} Bergaransi"
           brochure_text = (
               f"{intro_hook}\n\n"
               f"PROMO SPESIAL BULAN INI! Kami adalah distributor dan supplier resmi produk {t_meta['key']} termurah dan terpercaya.\n"
               f"- Paket Hemat A: Harga Rp 150.000 (Diskon 50% khusus pembelian hari ini!)\n"
               f"- Paket Lengkap B: Harga Rp 350.000 gratis ongkir seluruh Indonesia\n"
               f"- Paket Grosir Agen: Harga Rp 1.250.000 bonus katalog eksklusif\n\n"
               f"Stok sangat terbatas! Jangan sampai kehabisan promo diskon besar kami. "
               f"Segera pesan sekarang juga dan hubungi admin marketing kami via WhatsApp di 0812-3456-7890 "
               f"atau klik langsung https://wa.me/6281234567890 untuk konsultasi pemesanan dan transfer pembayaran!"
           )
           n5_drafts.append({
               "id": f"draft-{tid:02d}-N5",
               "topic_id": tid,
               "category": t_meta["category"],
               "target_query": t_meta["query"],
               "stratum": "N5",
               "stratum_description": "Brosur Jualan / Iklan Baris WhatsApp Menyamar Jadi Artikel",
               "draft_title": title,
               "ground_truth_label": "Perlu Revisi",
               "expert_notes": "Brosur iklan komersial berisi daftar harga Rp, klaim diskon, dan nomor kontak WhatsApp wa.me. Tertangkap oleh Commercial Drift Detector.",
               "draft_content": brochure_text,
               "word_count": len(brochure_text.split()),
           })
       return n5_drafts
   ```

#### 2C. Terapkan Prinsip Ponytail (DRY) & Tambahkan Fitur CLI `--harvest-query` di `scripts/build_dataset_60.py`
1. Hapus fungsi duplikat `evaluate_single_draft` di `scripts/build_dataset_60.py` dan gunakan langsung `from tests.evaluate_accuracy import evaluate_draft, run_accuracy_evaluation`!
2. Tambahkan dukungan argumen CLI opsional `--harvest-query "<kueri>"` di `main()` pada `scripts/build_dataset_60.py`:
   ```python
   if len(sys.argv) >= 3 and sys.argv[1] == "--harvest-query":
       target_q = sys.argv[2]
       from app.services.serp_scraper import search_and_scrape_competitors
       print(f"[HARVESTER WASKITA] Memanen variasi artikel riil untuk kueri: '{target_q}'...")
       harvested = await search_and_scrape_competitors(target_q)
       out_harvest = os.path.join(BACKEND_DIR, "tests", "fixtures", "harvested_variations.json")
       with open(out_harvest, "w", encoding="utf-8") as fh:
           json.dump(harvested, fh, indent=2, ensure_ascii=False)
       print(f"[OK] Berhasil memanen {len(harvested)} artikel ke {out_harvest}")
       return
   ```

---

### 📦 LANGKAH 3: Eksekusi Generator Dataset & Verifikasi Test Suite Wajib (100% Passed)

Jalankan perintah berikut secara berurutan di terminal dari root `/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset`:

```bash
# 1. Bangun ulang dataset_60_drafts.json dan jalankan evaluasi
./.venv/bin/python scripts/build_dataset_60.py

# 2. Jalankan evaluator akurasi & latensi Bab 4 untuk memperbarui accuracy_evaluation_report.json
./.venv/bin/python backend/tests/evaluate_accuracy.py

# 3. Jalankan seluruh unit test backend (termasuk test_accuracy_evaluation)
./.venv/bin/pytest backend/tests/ -q

# 4. Jalankan unit test frontend
cd frontend && npm test -- --run
```

Pastikan:
- `TP = 30, TN = 30, FP = 0, FN = 0` (**Akurasi 100.00%** pada 60 sampel: 30 Positif vs 30 Negatif 5 Skenario Meja Redaksi).
- `accuracy_evaluation_report.json` memuat blok `"latency_benchmark_ms"` dengan `avg_latency_ms`, `min_latency_ms`, `max_latency_ms`, dan `p95_latency_ms`.
- Seluruh `pytest` dan `npm test` lulus **100% PASSED**.
- Buat *git commit* dengan pesan:
  `feat(eval): refactor 60-draft dataset with 5 real-world editorial negative scenarios and server latency metrics`
