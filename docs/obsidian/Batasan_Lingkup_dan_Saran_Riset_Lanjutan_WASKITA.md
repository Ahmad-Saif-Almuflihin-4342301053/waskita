# 🧭 Batasan Lingkup WASKITA & Saran untuk Peneliti Selanjutnya

> Dicatat: 2026-11-20 · Terkait: [[Blueprint_Arsitektur_EEAT_dan_Stress_Test_WASKITA]], [[Audit_DeadCode_Celah_Algoritma_dan_Arsitektur_Logging_WASKITA]]

## 1. Temuan: Konten yang bisa masuk top SEO itu tidak cuma artikel

E-E-A-T dan ranking Google tidak hanya berlaku untuk artikel panjang. Beberapa jenis halaman lain juga bisa masuk peringkat atas:

| Jenis Halaman | Contoh | Kenapa Bisa Ranking |
| :--- | :--- | :--- |
| **Direktori / Listicle Kurasi** | "10 Programmer Terbaik di Surabaya" (nama, nomor, portofolio, harga) | Menjawab langsung niat pencari ("cari jasa"), datanya terkumpul di satu tempat |
| **Agregator Produk / Toko** | "10 Penjual HP Terpercaya di Shopee & Tokopedia" | Membantu orang memilih penjual; ada sinyal kepercayaan (rating, ulasan, toko resmi) |
| **Alat Web Interaktif (Tools)** | Kalkulator BMI interaktif, kalkulator KPR, konverter satuan | Pencari butuh *mengerjakan sesuatu*, bukan membaca. Nilainya ada di fungsi alat, bukan jumlah kata |
| **Marketplace / Listing** | MyWed (direktori fotografer), Rumah123 (listing tanah) | Niat transaksional; Google menampilkan halaman yang paling banyak pilihan & paling terpercaya |

**Kesimpulan:** Nilai sebuah halaman di mata Google bergantung pada **niat pencarian (search intent)**: informasional, navigasional, transaksional, atau alat. Artikel cuma salah satunya.

## 2. Posisi WASKITA saat ini: fokus ke ARTIKEL dulu

- WASKITA saat ini dirancang khusus untuk **naskah artikel informasional/naratif berbahasa Indonesia** (pra-publikasi).
- Metrik yang dipakai (VSM cosine, Information Gain entitas, MATTR, HKO, red-span, E-E-A-T veto) **mengukur kualitas teks**, jadi **tidak cocok** untuk menilai direktori, listing produk, atau alat interaktif.

> [!IMPORTANT]
> **Koreksi pemahaman dari uji spesimen MyWed:**
> MyWed diberi vonis "Perlu Revisi" oleh WASKITA **bukan karena halaman itu jelek di mata Google**. Halaman direktori seperti itu tetap bisa ranking. Vonis itu muncul karena halamannya **di luar lingkup WASKITA** (bukan artikel). Jadi di skripsi, hal ini harus ditulis sebagai **batasan sistem**, bukan sebagai "WASKITA berhasil mendeteksi konten buruk".

### Kalimat siap pakai untuk Bab 1 (Batasan Masalah)
> "Sistem WASKITA dibatasi pada evaluasi naskah artikel teks berbahasa Indonesia bertipe informasional dan naratif. Halaman bertipe direktori, agregator produk, listing marketplace, serta alat web interaktif tidak termasuk dalam lingkup evaluasi, karena nilai halaman tersebut tidak ditentukan oleh kualitas teks."

## 3. Saran untuk Peneliti Selanjutnya (Bab 5 — Saran)

1. **Klasifikasi niat halaman (Intent Classifier) sebelum audit.** Sebelum masuk Gatekeeper, sistem menebak dulu apakah naskah itu artikel, direktori, listing produk, atau alat. Kalau bukan artikel, sistem bilang "di luar lingkup" (bukan langsung memvonis "Perlu Revisi").
2. **Modul evaluasi direktori/listicle kurasi.** Contoh metrik: kelengkapan data tiap entri (nama, kontak, lokasi, harga, bukti/portofolio), kebaruan data, keberagaman entri, ada/tidaknya alasan kurasi ("kenapa masuk daftar").
3. **Modul evaluasi agregator produk/toko.** Contoh metrik: sinyal kepercayaan penjual (rating, jumlah ulasan, toko resmi), transparansi afiliasi, perbandingan harga.
4. **Modul evaluasi alat web interaktif.** Penilaiannya pakai fungsi alat (akurasi rumus, mudah dipakai, kecepatan, aksesibilitas), bukan jumlah kata.
5. **WASKITA sebagai platform multi-fitur.** Arsitektur WASKITA yang sekarang (SERP scraper + pipeline NLP + Gatekeeper) bisa dipakai lagi sebagai fondasi, lalu tiap jenis konten diberi modul penilai masing-masing.

## 4. Dampak ke pengujian sekarang

- Spesimen **MyWed** dan **Rumah123** tetap boleh dipakai di dataset uji, tapi labelnya **"Di Luar Lingkup / Negatif (bukan artikel)"**, bukan "artikel buruk".
- Fokus perbaikan algoritma tetap ke artikel: Celah #7–#10 di [[Audit_DeadCode_Celah_Algoritma_dan_Arsitektur_Logging_WASKITA]].
