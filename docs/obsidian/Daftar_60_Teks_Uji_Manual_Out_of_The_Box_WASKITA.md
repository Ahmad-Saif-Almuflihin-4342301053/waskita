# 🎯 Panduan Berburu 60 Teks Uji Manual (Normal vs Out-of-The-Box) — WASKITA

> **Tanggal:** 2026-11-20
> **Prinsip Utama:** 100% Teks Riil dari Internet (Tanpa Karangan AI).
> **Komposisi:** **30 Positif (`Layak Terbit`)** vs **30 Negatif (`Perlu Revisi`)** — dibuat seimbang 50:50 agar rumus *Precision, Recall, F1-Score*, dan *Confusion Matrix* di Bab 4 Skripsi tidak timpang (*zero class-imbalance*).

---

## 💡 Kenapa yang "Normal" Cuma 6 Teks (10%) dan "Out-of-The-Box" 54 Teks (90%)?

Dalam rekayasa perangkat lunak (*Equivalence Partitioning & Boundary Value Analysis*):
1. Kalau sistem sudah berhasil meloloskan **3 artikel normal yang bagus** dan menolak **3 artikel normal yang buruk**, menambah 20 artikel normal lagi **tidak akan menemukan celah/bug baru**.
2. Celah algoritma justru selalu bersembunyi di **kasus ekstrem (*edge cases / out-of-the-box*)**: artikel pendek bergambar, bahasa gaul, cerita horor, artikel penuh kode program, komentar blog yang ikut ter-copas, atau artikel bagus yang disisipi jualan di paragraf terakhir.
3. Karena itu, kuota kita pasang: **6 Teks Kontrol Normal** + **54 Teks Penyiksa Algoritma (*Out-of-The-Box*)**.

---

## 📊 Ringkasan Kuota 14 Kategori (Total = 60 Teks)

| Kode | Kategori Teks yang Dicari | Kuota | Target Vonis | Kenapa Jumlahnya Segini & Apa yang Diuji? |
| :--- | :--- | :---: | :---: | :--- |
| **A1** | Artikel Normal Bagus (Kontrol Positif) | **3** | `Layak Terbit` | Baseline wajib (Kesehatan, Teknologi, Kuliner) untuk memastikan fungsi dasar VSM & IG berjalan normal. |
| **A2** | Artikel Normal Jelek / Sangat Dangkal (Kontrol Negatif) | **3** | `Perlu Revisi` | Baseline wajib untuk memastikan artikel pendek tanpa isi (1–2 kalimat) atau ngelantur biasa tetap tertolak. |
| **B1** | Cerita Horor / Mistis / Mitos Budaya Lokal | **4** | `Layak Terbit` | Menguji bahwa penghapusan *hardcode* klenik bekerja: cerita mistis/budaya tidak boleh dituduh penipuan. *(1 sudah ada: Winny Marlina)* |
| **B2** | Gaya Bahasa Gaul ("Gue-Loe") / Opini / Satire | **4** | `Layak Terbit` | Menguji apakah *Lemmatizer* `nlp-id` Kumparan + `PySastrawi` dan skor MATTR tahan terhadap bahasa santai/non-baku. |
| **B3** | Artikel Sangat Pendek (40–150 Kata) tapi Padat Gambar/Tabel/Resep | **5** | `Layak Terbit` | Porsi terbesar positif (5 teks) karena kita baru membuka gembok 300 kata menjadi **30 kata adaptif**. Menguji apakah teks pendek tapi berbobot tetap lolos. |
| **B4** | Tutorial Teknis Bercampur Kode Program / Perintah Terminal | **4** | `Layak Terbit` | Menguji apakah potongan kode (`python`, `bash`, `html`) merusak perhitungan kosakata Indonesia atau dianggap sampah. |
| **B5** | Artikel Bantahan Mitos ("Tidak", "Bukan", "Hoaks", "Jangan") | **4** | `Layak Terbit` | Menguji celah *Negation Blindness*: artikel yang membantah mitos medis/keuangan memiliki kata kunci yang sama dengan artikel hoaks, tapi maknanya berlawanan. |
| **B6** | Review Produk Jujur (Ada Harga `Rp` & Merek, tapi Bukan Jualan) | **3** | `Layak Terbit` | Menguji batas tipis E-E-A-T *Experience*: menyebut harga `Rp` dan merek dalam ulasan pemakaian pribadi **bukan** berarti spam jualan. |
| **B7** | Artikel Jurnalisme Panjang / Mendalam (> 2.000 Kata) | **3** | `Layak Terbit` | Menguji ketahanan rumus MATTR ($w=50$) dan kecepatan komputasi pada naskah super panjang (karena TTR biasa pasti anjlok kalau artikel terlalu panjang). |
| **C1** | Copas Mentah `Ctrl+A` Web Berita/Blog + Komentar + Menu | **5** | `Perlu Revisi` | Porsi besar negatif (5 teks) untuk menguji *Web Chrome Sanitizer* dan pemotong komentar blog (*Comment Boundary Truncator*). |
| **C2** | Direktori Jasa / Listing Marketplace / Agregator Toko (Non-Artikel) | **5** | `Perlu Revisi` | Menguji penolakan halaman di luar lingkup artikel yang penuh harga & kontak WA. *(2 sudah ada: MyWed & Rumah123)* |
| **C3** | Artikel "Kuda Troya" (*Bait-and-Switch*: Awal Edukasi, Akhir Jualan/WA/Slot) | **5** | `Perlu Revisi` | Menguji detektor *Tail Semantic Drift* (`detect_commercial_drift`): paragraf awal tampak ilmiah, tapi ujungnya menyuruh transfer/hubungi WA. |
| **C4** | Teks Mentah AI yang Lupa Diedit ("Tentu, berikut artikelnya...") | **4** | `Perlu Revisi` | Menguji `detect_ai_prompt_leak` dan deteksi kalimat klise AI (*"Di era digital saat ini..."*). |
| **C5** | Artikel "Frankenstein" (Beda Topik Tengah Jalan) & Spam *Keyword Stuffing* | **8** | `Perlu Revisi` | 4 teks gado-gado beda topik (menguji *Red-Span* beruntun) + 4 teks pengulangan kata kunci ekstrem (menguji HKO > 5%). |

---

## 📋 Daftar Rinci 60 Teks yang Harus Kamu Cari Manual (#1 – #60)

### 🟢 KELOMPOK A: BASELINE NORMAL (6 TEKS — Cukup Sedikit Saja sebagai Pembanding)

#### A1. Artikel Normal Bagus (3 Teks — Target: `Layak Terbit`)
* **Kenapa cuma 3?** Hanya sebagai grup kontrol standar bahwa artikel berita/edukasi normal dari situs tepercaya pasti lolos.
1. **[ ] #01 (Kesehatan Normal):** Cari 1 artikel HaloDoc / Alodokter tentang penyakit umum (misal: *"Gejala Demam Berdarah"*), salin **isi artikelnya saja** (bersih tanpa menu).
2. **[ ] #02 (Teknologi Normal):** Cari 1 artikel panduan teknologi dari blog IT / Dicoding / Niagahoster (misal: *"Apa Itu Cloud Computing"*), salin isi bersihnya.
3. **[ ] #03 (Kuliner/Pertanian Normal):** Cari 1 artikel cara budidaya atau pengolahan dari situs pertanian/kuliner (misal: *"Cara Membuat Pupuk Kompos Organik"*), salin isi bersihnya.

#### A2. Artikel Normal Jelek / Dangkal (3 Teks — Target: `Perlu Revisi`)
* **Kenapa cuma 3?** Untuk membuktikan artikel yang isinya cuma 2–3 kalimat basa-basi tanpa substansi pasti ditolak karena *Information Deficit* tinggi.
4. **[ ] #04 (Artikel Terlalu Dangkal 1):** Ambil 1 paragraf pembuka saja (sekitar 40–50 kata) dari artikel berita yang belum masuk ke pembahasan inti.
5. **[ ] #05 (Artikel Terlalu Dangkal 2):** Ambil teks pengantar singkat dari halaman kategori web yang cuma berisi kalimat umum tanpa penjelasan detail.
6. **[ ] #06 (Artikel Salah Kueri Total):** Ambil 1 artikel tentang *Resep Masakan*, tapi nanti saat diuji masukkan target kata kunci *"Cara Merawat Mesin Mobil"* (menguji VSM Cosine Similarity = 0).

---

### 🚀 KELOMPOK B: POSITIF OUT-OF-THE-BOX (27 TEKS — Harus LOLOS, Menguji Agar Sistem Tidak Kaku)

#### B1. Cerita Horor, Mistis, & Budaya Lokal (4 Teks — Target: `Layak Terbit`)
* **Kenapa 4 teks?** Untuk membuktikan secara statistik bahwa WASKITA tidak lagi memblokir kata *"mistis", "gaib", "hantu", "mitos"* selama konteksnya cerita/budaya (Non-YMYL).
7. **[x] #07 (Horor Perjalanan — SUDAH ADA):** `winnymarlina.com` — *"Cerita Horor Perjalanan (Lawang Sewu, Ngalau Indah, Candi Cetho)"* *(Catatan: ambil bagian ceritanya saja tanpa 95 komentar di bawahnya)*.
8. **[ ] #08 (Sejarah/Mitos Budaya Daerah):** Cari 1 artikel tentang sejarah/legenda lokal (misal dari GoodNewsFromIndonesia atau Indonesia.go.id tentang *"Mitologi Nyi Roro Kidul"* atau *"Tradisi Kebo-Keboan Banyuwangi"*).
9. **[ ] #09 (Cerita Pendek / Thread Horor Pengalaman Pribadi):** Cari 1 cerita horor pendek dari blog pribadi / Medium / Kaskus SFTH yang menceritakan pengalaman menginap atau mendaki gunung.
10. **[ ] #10 (Ulasan Film / Buku Horor):** Cari 1 artikel review film horor Indonesia (misal: review film *"Pengabdi Setan"* atau *"KKN di Desa Penari"* dari Kincir / Kompasiana).

#### B2. Gaya Bahasa Gaul ("Gue-Loe"), Satire, & Opini Santai (4 Teks — Target: `Layak Terbit`)
* **Kenapa 4 teks?** Banyak penulis blog modern tidak menulis dengan bahasa baku EYD. Kalau WASKITA menolak artikel bagus cuma karena pakai kata *"gue", "lo", "banget", "gimana"*, berarti NLP kita gagal.
11. **[ ] #11 (Blog Pribadi Gaya "Gue-Loe"):** Cari 1 artikel di Medium Indonesia atau blog pribadi yang membahas karir/keuangan/kehidupan dengan gaya bahasa *"gue/elo"*.
12. **[ ] #12 (Artikel Komedi / Satire Ringan):** Cari 1 artikel esai humor/satire dari Mojok.co atau Terminal Mojok yang membahas fenomena sosial sehari-hari.
13. **[ ] #13 (Review Kuliner Bahasa Santai):** Cari 1 ulasan makanan/kopi dari food blogger yang bahasanya ekspresif dan penuh istilah percakapan.
14. **[ ] #14 (Opini First-Person "Aku/Saya"):** Cari 1 catatan perjalanan (*travel blog*) atau pengalaman magang/kerja di Kompasiana yang ditulis dari sudut pandang orang pertama.

#### B3. Artikel Sangat Pendek (40–150 Kata) tapi Padat Infografis / Gambar / Resep (5 Teks — Target: `Layak Terbit`)
* **Kenapa 5 teks?** Ini fitur baru yang paling kamu tekankan (batas adaptif 30 kata). Kita harus buktikan artikel pendek yang kaya media (`[gambar]`, `[video]`) atau langsung ke inti jawaban tidak dihukum oleh *word budget* 900 kata.
15. **[ ] #15 (Resep Masakan Singkat + Gambar):** Cari 1 resep di Cookpad atau situs resep yang teksnya singkat (sekitar 60–120 kata: bahan & 4 langkah masak) disertai foto langkah-langkahnya.
16. **[ ] #16 (Berita Foto / Galeri Pers):** Cari 1 artikel "Berita Foto" dari Antara Foto atau Detik Foto (biasanya hanya 50–100 kata teks pengantar + 5–6 foto dengan caption).
17. **[ ] #17 (Infografis Kesehatan / Sains):** Cari 1 halaman infografis dari Kemenkes / Tirto / Katadata yang teks pengantarnya pendek (50–100 kata) karena intinya ada di gambar infografis.
18. **[ ] #18 (Definisi Kamus / Istilah Singkat Padat):** Cari 1 halaman penjelasan istilah singkat (sekitar 60–100 kata) yang langsung menjawab *"Apa itu X"* disertai 1 tabel atau diagram.
19. **[ ] #19 (Pengumuman / Rilis Resmi Singkat):** Cari 1 rilis informasi singkat (80–150 kata) yang padat fakta (tanggal, lokasi, syarat, prosedur singkat).

#### B4. Tutorial Teknis Bercampur Kode Program / Rumus (4 Teks — Target: `Layak Terbit`)
* **Kenapa 4 teks?** Untuk menguji apakah blok kode (`def`, `import`, `sudo apt`, `<div>`) membuat sistem salah mendeteksi pengulangan kata atau merusak ekstraksi kata kunci.
20. **[ ] #20 (Tutorial Python / JavaScript):** Cari 1 artikel tutorial koding singkat (misal dari PetaniKode atau Medium) yang separuh isinya penjelasan bahasa Indonesia dan separuhnya blok kode program.
21. **[ ] #21 (Tutorial Command Line Linux / Server):** Cari 1 artikel cara install aplikasi di Ubuntu/VPS yang memuat banyak perintah terminal (`sudo`, `systemctl`, `docker`).
22. **[ ] #22 (Tutorial Rumus Excel / Google Sheets):** Cari 1 artikel panduan rumus Excel (`=VLOOKUP`, `=INDEX(MATCH)`) yang memuat contoh tabel dan formula.
23. **[ ] #23 (Artikel Matematika / Fisika / Statistik):** Cari 1 artikel penjelasan rumus (misal: cara menghitung BMI, bunga majemuk, atau TF-IDF) yang penuh angka dan simbol perhitungan.

#### B5. Artikel Bantahan Mitos / Fakta vs Hoaks (Penuh Kata Negasi) (4 Teks — Target: `Layak Terbit`)
* **Kenapa 4 teks?** Untuk menguji **Celah #4 (*Negation Blindness*)**. Artikel ini penuh kata *"tidak benar", "bukan", "mitos", "jangan dilakukan"*.
24. **[ ] #24 (Cek Fakta Medis / Kemenkes):** Cari 1 artikel `[CEK FAKTA]` atau *"Mitos vs Fakta Kesehatan"* (misal: *"Mitos atau Fakta: Mandi Malam Menyebabkan Rematik?"*).
25. **[ ] #25 (Bantahan Hoaks Kominfo / TurnBackHoax):** Cari 1 artikel klarifikasi hoaks dari `turnbackhoax.id` atau Komdigi yang menjelaskan kenapa sebuah klaim itu palsu.
26. **[ ] #26 (Artikel "Larangan / Hal yang Tidak Boleh Dilakukan"):** Cari 1 artikel bertema *"5 Hal yang JANGAN Dilakukan Saat..."* (misal saat terkena luka bakar atau saat baterai HP kembung).
27. **[ ] #27 (Edukasi Anti-Penipuan Finansial):** Cari 1 artikel OJK / bank yang mengedukasi ciri-ciri investasi bodong atau pinjol ilegal (memuat kata *"untung besar", "pasti cair"*, tapi dalam konteks memperingatkan warga agar **tidak** tertipu!).

#### B6. Review Jujur Produk / Jasa (Ada Harga `Rp` & Merek, tapi Bukan Jualan) (3 Teks — Target: `Layak Terbit`)
* **Kenapa 3 teks?** Untuk menguji ketajaman detektor *Commercial Drift*. Kalau orang menulis review jujur HP atau hotel dan mencantumkan harga `Rp 3.500.000`, itu adalah sinyal *Experience* yang bagus, **bukan** spam jualan.
28. **[ ] #28 (Review Gadget / Laptop Jujur):** Cari 1 artikel review pemakaian HP/laptop dari JagatReview atau Hybrid.co.id yang mencantumkan tabel spesifikasi dan harga resmi.
29. **[ ] #29 (Review Penginapan / Tempat Wisata + Harga Tiket):** Cari 1 artikel blog perjalanan yang merinci harga tiket masuk, biaya parkir, dan harga sewa kamar secara informatif.
30. **[ ] #30 (Review Skincare / Produk Harian):** Cari 1 ulasan jujur pemakaian produk (kelebihan & kekurangan) dari blog kecantikan/kesehatan tanpa tautan afiliasi spam.

#### B7. Artikel Jurnalisme Panjang / Long-Form (> 2.000 Kata) (3 Teks — Target: `Layak Terbit`)
* **Kenapa 3 teks?** Pada teks > 2.000 kata, rumus TTR biasa pasti jatuh ke bawah 0.25 karena kata hubung diulang ratusan kali. Ini untuk membuktikan rumus **MATTR ($w=50$)** kita tetap stabil dan waktu prosesnya tidak *timeout*.
31. **[ ] #31 (Liputan Mendalam / Indepth Journalism):** Cari 1 artikel panjang (> 2.000 kata) dari Tirto.id (kategori *Mild Report / Indepth*) atau Project Multatuli.
32. **[ ] #32 (Panduan Lengkap / Ultimate Guide):** Cari 1 artikel panduan super lengkap (> 2.000 kata) tentang SEO, pemrograman, atau keuangan.
33. **[ ] #33 (Artikel Ilmiah Populer / Sejarah Panjang):** Cari 1 artikel sejarah panjang dari Historia.id atau National Geographic Indonesia.

---

### 🛑 KELOMPOK C: NEGATIF & DI LUAR LINGKUP OUT-OF-THE-BOX (27 TEKS — Harus DITOLAK / `Perlu Revisi`)

#### C1. Copas Mentah `Ctrl+A` Web Berita / Blog Lengkap dengan Sampah Navigasi & Komentar (5 Teks — Target: `Perlu Revisi`)
* **Kenapa 5 teks?** Ini ujian langsung untuk **Celah #9 (Polusi Komentar Blog)** dan **Celah #10 (Deteksi Residu Struktural Tanpa Hardcode)**.
34. **[ ] #34 (Winny Marlina Versi Mentah + 95 Komentar):** Gunakan file `true_winny.txt` kemarin **lengkap dengan seluruh 95 komentarnya** (untuk menguji apakah pemotong komentar bekerja atau apakah versi kotornya terdeteksi memiliki residu komentar).
35. **[ ] #35 (Ctrl+A Portal Berita Nasional — Detik/Kompas/Kumparan):** Buka 1 berita pendek, lalu tekan `Ctrl+A` dan `Ctrl+C` dari ujung atas sampai footer paling bawah (biarkan menu, *"Baca Juga"*, *"Berita Terpopuler"*, dan iklan ikut masuk).
36. **[ ] #36 (Ctrl+A Portal Berita Bahasa Inggris/Luar atau Portal Lokal Kecil):** Cari 1 web berita daerah atau portal yang **nama medianya tidak ada di daftar hardcode kita**, lalu `Ctrl+A` seluruh halamannya (menguji deteksi residu struktural anti-hardcode!).
37. **[ ] #37 (Ctrl+A Forum Diskusi — Reddit / Quora / Kaskus):** Buka 1 halaman tanya-jawab yang penuh tombol *Upvote, Share, Reply, Follow*, lalu `Ctrl+A` semuanya.
38. **[ ] #38 (Ctrl+A Halaman Wikipedia Lengkap dengan Daftar Referensi Kaki):** Salin 1 artikel pendek Wikipedia beserta ratusan baris catatan kaki `[1][2][3]`, kotak navigasi bawah, dan kategori di bagian akhir.

#### C2. Halaman Direktori Jasa, Listing Marketplace, & Agregator Toko (Di Luar Lingkup Artikel) (5 Teks — Target: `Perlu Revisi / Di Luar Lingkup`)
* **Kenapa 5 teks?** Sesuai catatan Obsidian kita pagi ini: halaman ini **bukan jelek di mata Google**, tapi **di luar lingkup WASKITA (bukan artikel)**. WASKITA harus konsisten menandainya tidak layak sebagai artikel ekspositori.
39. **[x] #39 (Direktori Jasa + Tombol WA — SUDAH ADA):** `mywed.com` — *"Fotografer Pasangan dan Pertunangan Terbaik di Indonesia"* (218 kata, 5 kontak WA `wa.me/628...`, 16 harga IDR).
40. **[x] #40 (Listing Properti Ctrl+A — SUDAH ADA):** `rumah123.com` — *"Tanah Dijual di Jombang"* (2.898 kata, 64.5% baris pendek, HKO 27.78%).
41. **[ ] #41 (Halaman Kategori Shopee / Tokopedia / OLX):** Buka 1 halaman daftar produk di marketplace (misal pencarian *"Laptop Bekas Surabaya"*), lalu `Ctrl+A` daftar kartu produknya.
42. **[ ] #42 (Listicle "10 Jasa/Toko Terbaik" yang Hanya Berisi Nama, Alamat & Nomor WA):** Cari 1 artikel di Google bertipe *"10 Jasa Sedot WC / Servis AC Terbaik di..."* yang isinya cuma daftar nama, alamat, dan nomor telepon tanpa pembahasan mendalam.
43. **[ ] #43 (Halaman Alat Web Interaktif / Kalkulator Online):** Buka 1 halaman web kalkulator BMI, kalkulator KPR, atau konverter mata uang yang teksnya hanya label tombol dan form input, lalu `Ctrl+A`.

#### C3. Artikel "Kuda Troya" (*Bait-and-Switch*: Awalnya Edukasi, Ujungnya Jualan/Spam/Klaim Palsu) (5 Teks — Target: `Perlu Revisi`)
* **Kenapa 5 teks?** Ini adalah modus spam SEO paling berbahaya di Indonesia. Paragraf 1–3 menyalin artikel edukasi bagus (supaya Cosine Similarity tinggi), tapi paragraf terakhir diselipi jualan obat ajaib, kontak WA agen, atau judi online.
44. **[ ] #44 (Artikel Kesehatan + Ujungnya Jualan Obat Herbal Klaim Sembuh Tanpa Operasi):** Cari (atau gabungkan dari iklan blog obat herbal) artikel penyakit yang di bagian bawahnya menyuruh beli paket obat herbal via WhatsApp `08...` / `wa.me/628...`.
45. **[ ] #45 (Artikel Budaya/Mistis + Ujungnya Jualan Jasa Paranormal/Mahar):** Cari teks cerita/artikel mistis yang di bagian bawahnya menawarkan *"konsultasi mahar pelet / buka aura hubungi WA..."* (menguji perbedaan antara cerita horor murni Winny Marlina vs penipuan berkedok klenik!).
46. **[ ] #46 (Artikel Teknologi/SEO + Ujungnya Sisipan Promosi Slot/Judi/Pinjol):** Contoh artikel web yang terkena *deface* atau *backlink injection* (awal bahas teknologi, bawahnya ada paragraf promosi *slot gacor / deposit pulsa*).
47. **[ ] #47 (Artikel Edukasi Keuangan + Hard-Selling Afiliasi/Voucher Diskon):** Artikel tips menabung yang di tengah dan akhirnya penuh ajakan *"Gunakan kode voucher spesial, daftar sekarang hubungi admin"*.
48. **[ ] #48 (Artikel Wisata/Properti + Spam Nomor Agen Berulang-ulang):** Artikel pendek tentang kota wisata/perumahan yang di setiap akhir paragraf disisipi *"Hubungi marketing kami di 0812..."*.

#### C4. Hasil Mentah ChatGPT / AI yang Lupa Diedit & Klise Generik (4 Teks — Target: `Perlu Revisi`)
* **Kenapa 4 teks?** Banyak penulis pemula langsung `Ctrl+C` dan `Ctrl+V` dari ChatGPT tanpa menghapus kalimat pembuka asisten AI dan penuh frasa klise.
49. **[ ] #49 (Teks dengan Pembuka ChatGPT):** Minta ChatGPT/Gemini membuat artikel, lalu salin **mentah-mentah bersama kalimat** *"Tentu! Sebagai asisten AI, berikut adalah draf artikel mengenai..."* dan penutup *"Semoga artikel ini membantu! Apakah ada hal lain yang bisa saya bantu?"*.
50. **[ ] #50 (Teks Bocor Metadata Prompt SEO):** Teks hasil AI yang masih memuat baris `Meta Title:`, `Meta Description:`, `Target Keyword:` di bagian atasnya.
51. **[ ] #51 (Teks AI Penuh Klise Berulang):** Teks yang setiap paragrafnya diawali kalimat klise (*"Di era digital saat ini, tidak dapat dipungkiri bahwa...", "Seperti yang kita ketahui bersama...", "Sebagai kesimpulan..."*) tanpa data atau entitas spesifik.
52. **[ ] #52 (Teks Terjemahan Mesin Mentah yang Kaku):** Ambil 1 artikel bahasa Inggris, terjemahkan mentah-mentah dengan penerjemah kualitas rendah hingga struktur kalimatnya rusak/tidak alami.

#### C5. Artikel "Frankenstein" (Beda Topik Tengah Jalan) & Spam *Keyword Stuffing* (8 Teks — Target: `Perlu Revisi`)
* **Kenapa 8 teks (4 Frankenstein + 4 Stuffing)?** Karena ini menguji dua senjata utama Gatekeeper: **Red-Span Beruntun (`max_consecutive_red >= 4`)** dan **HKO (`hko_percentage > 5%`)**.
53. **[ ] #53 (Frankenstein 1 — Kopi + Otomotif):** Ambil 2 paragraf artikel *Kopi Tubruk*, lalu sambung di bawahnya dengan 3 paragraf artikel *Mobil Listrik* (menguji deteksi *Red-Span* beruntun saat topik melenceng).
54. **[ ] #54 (Frankenstein 2 — Kesehatan + Sepak Bola):** Ambil 2 paragraf artikel *Kesehatan Mata*, lalu sambung dengan 3 paragraf berita *Liga Inggris*.
55. **[ ] #55 (Frankenstein 3 — Pemrograman + Resep Kue):** Ambil 2 paragraf artikel *Belajar Python*, lalu sambung dengan 3 paragraf *Cara Membuat Kue Bolu*.
56. **[ ] #56 (Paragraf Copy-Paste Berulang / Duplikasi Internal):** Ambil 1 artikel pendek 2 paragraf, lalu gandakan (paste ulang) paragraf yang sama 3 kali berturut-turut supaya tampak panjang (menguji deteksi kalimat repetitif & TTR rendah).
57. **[ ] #57 (Keyword Stuffing Ekstrem 1):** Artikel pendek/menengah yang mengulang-ulang kata kunci target secara paksa di setiap kalimat (misal kata *"jual tanah murah"* diulang 25 kali dalam 200 kata).
58. **[ ] #58 (Keyword Stuffing Ekstrem 2 — Gaya SEO Lama Tahun 2010):** Artikel yang di bagian bawahnya diberi daftar tagar/kata kunci berderet: *"kopi murah, jual kopi, kopi enak jakarta, grosir kopi, distributor kopi..."*.
59. **[ ] #59 (Artikel *Word Salad* / Hasil *Article Spinner* Rusak):** Artikel yang kata-katanya diganti sinonim secara acak oleh mesin *spinner* sehingga kalimatnya tidak nyambung secara semantik.
60. **[ ] #60 (Teks Campur Aduk Bahasa / *Lorem Ipsum* Terselubung):** Artikel bahasa Indonesia 1 paragraf yang disambung dengan teks *Lorem ipsum* atau paragraf bahasa asing untuk mengakali jumlah kata.

---

## 🛠️ Cara Paling Santai & Cepat Buat Kamu Mengumpulkannya

1. **Kamu sudah punya 3 teks dari kemarin (#07, #39, #40)** — bahkan dari `true_winny.txt` saja kamu otomatis dapat **2 spesimen sekaligus**:
   - **#07:** Versi cerita bersihnya (Positif B1).
   - **#34:** Versi mentahnya yang masih ada 95 komentar (Negatif C1).
   Jadi **4 dari 60 teks sudah beres di tanganmu sekarang!**
2. **Kamu tidak perlu mencarinya sekaligus 60 hari ini.** Kamu bisa mencicil per kelompok (misal hari ini kirim 5–10 teks dulu ke chat ini atau simpan ke folder).
3. Setiap kali kamu kirim teksnya ke sini, sebutkan saja nomornya (misal: *"Ini untuk #15 resep pendek"* atau *"Ini untuk #36 Ctrl+A web lokal"*), nanti langsung aku masukkan ke file dataset pengujian resmi dan kita lihat hasil vonis mesinnya!
