#!/usr/bin/env python3
"""
Generator script to produce the static deterministic dataset_30_drafts.json
Strictly 30 realistic Indonesian informational articles (15 Layak Terbit, 15 Perlu Revisi).
No procedural randomization.
"""

import json
import re
import os
import sys

# Ensure backend root is on PYTHONPATH
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

from app.services.stylometrics import calculate_stylometrics, _tokenize_words

DRAFTS = [
    # ---------------- 1. Kopi Tubruk (Kuliner) ----------------
    {
        "id": "draft-01",
        "category": "Kuliner & Tata Boga",
        "target_query": "resep kopi tubruk tradisional",
        "draft_title": "Eksplorasi Resep Kopi Tubruk Nusantara: Seni Mengatur Suhu Seduh dan Karakter Biji Robusta Dampit",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Variasi diksi luas, struktur heading informatif tanpa repetisi kata kunci target (HKO 25% <= 40%), MATTR > 0.60, analisis rasio suhu mendalam.",
        "draft_content": """Kopi tubruk merupakan warisan tradisi menyeduh naskah lokal yang telah mendarah daging di berbagai penjuru Nusantara. Berbeda dari teknik seduh modern yang mengandalkan alat filtrasi canggih bertekanan tinggi, metode tubruk menonjolkan kejujuran cita rasa murni biji kopi melalui perendaman langsung bubuk kopi bersama air mendidih. Kesederhanaan proses ini justru menuntut kepekaan sensorik seorang penyeduh dalam memperhitungkan variabel penting seperti profil sangrai, tingkat kehalusan gilingan, suhu air, dan waktu sedimentasi ampas.

## Menemukan Esensi Seduhan Tubruk Tradisional
Keunikan tubruk terletak pada interaksi dinamis antara partikel bubuk kopi yang terendam tanpa batas filter kertas atau saringan logam. Ketika air panas berpadu dengan bubuk kopi, minyak atsiri alami dan senyawa aromatik terekstraksi secara menyeluruh. Hal tersebut menghasilkan badan seduhan yang tebal dan sensasi rasa yang berlapis di rongga mulut. Pengalaman sensorik ini tidak dapat digantikan oleh seduhan kertas filter yang cenderung menyerap sebagian besar minyak alami kopi.

## Seleksi Profil Sangrai dan Tingkat Gilingan Bubuk
Untuk menghasilkan cangkir kopi yang berkarakter kokoh dan nikmat, pemilihan varietas sangatlah krusial. Biji Robusta asal lereng Gunung Semeru, tepatnya perkebunan Dampit Jawa Timur, menawarkan aroma cokelat gelap dengan aksen kacang panggang yang khas. Biji disangrai pada tingkat medium-dark untuk memunculkan karamelisasi alami tanpa menyisakan rasa getir gosong. Gilinglah biji dengan konsistensi medium-fine, sedikit lebih halus dari garam meja, agar proses ekstraksi berjalan seimbang saat air dituang.

## Manajemen Termal Air Seduhan Serta Rasio Ideal
Suhu air seduh memegang kendali utama ekstraksi senyawa rasa. Jangan pernah menuangkan air yang masih bergejolak mendidih pada suhu seratus derajat Celsius karena akan membakar bubuk kopi dan memicu rasa pahit berlebih. Suhu optimal yang dianjurkan berada pada rentang 91 hingga 94 derajat Celsius. Gunakan rasio seduhan klasik satu banding lima belas, yaitu sepuluh gram bubuk kopi untuk seratus lima puluh mililiter air panas berkualitas bebas kaporit.

## Waktu Pengendapan Ampas untuk Kejernihan Rasa
Tuangkan air secara perlahan dengan gerakan memutar dari bagian tengah cangkir menuju tepi luar. Biarkan proses blooming berlangsung selama tiga puluh detik untuk melepaskan gas karbondioksida alami. Setelah itu, aduk perlahan sebanyak tiga kali menggunakan sendok kayu atau keramik, lalu diamkan selama empat menit penuh. Periode istirahat ini memungkinkan ampas kopi mengendap sempurna ke dasar cangkir, sehingga tegukan pertama terasa jernih, tebal, dan memberikan kenikmatan sejati bagi para pencinta kopi otentik."""
    },
    {
        "id": "draft-02",
        "category": "Kuliner & Tata Boga",
        "target_query": "resep kopi tubruk tradisional",
        "draft_title": "Resep Kopi Tubruk Tradisional Terbaik dan Sangat Mudah",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Artikel AI mentah tanpa kurasi, mengandung kalimat klise generik, heading keyword stuffing HKO 100%, repetisi istilah berulang.",
        "draft_content": """Di era digital saat ini, banyak orang menyukai minuman segar dan hangat. Tidak dapat dipungkiri bahwa kopi tubruk adalah minuman yang sangat populer sekali di kalangan masyarakat kita. Seperti yang kita ketahui, kopi tubruk sangat mudah dibuat oleh siapa saja di rumah setiap hari. Dalam artikel kali ini, mari kita simak pembahasannya secara lengkap mengenai cara membuat seduhan yang mantap dan nikmat tanpa rasa ribet.

## Resep Kopi Tubruk Tradisional untuk Pemula
Membahas resep kopi tubruk tradisional memang sangat menarik bagi para penggemar kopi di mana pun berada. Kopi tubruk tradisional adalah kopi yang diseduh dengan cara tradisional menggunakan bubuk kopi dan air panas. Kopi tubruk tradisional sangat digemari karena kopi tubruk tradisional memiliki rasa yang sangat kuat. Banyak orang memilih kopi tubruk tradisional sebagai minuman pagi hari yang sangat menyenangkan dan menyegarkan tubuh. Kopi tubruk tradisional selalu menjadi teman setia saat bersantai di sore hari bersama keluarga tercinta.

## Cara Membuat Resep Kopi Tubruk Tradisional Nikmat
Dalam mempraktikkan resep kopi tubruk tradisional nikmat, langkah pertama adalah menyiapkan bubuk kopi pilihan Anda. Masukkan bubuk kopi ke dalam gelas lalu tuangkan air panas mendidih. Cara membuat resep kopi tubruk tradisional ini sangat gampang dan praktis. Tak heran jika resep kopi tubruk tradisional disukai oleh tua maupun muda di seluruh Indonesia karena kemudahan pembuatannya yang luar biasa. Siapkan juga cangkir yang bersih agar rasa resep kopi tubruk tradisional semakin terasa mantap dan lezat sekali.

## Langkah Resep Kopi Tubruk Tradisional di Rumah
Langkah resep kopi tubruk tradisional di rumah membutuhkan air panas dan gelas yang bersih. Anda cukup menuangkan air panas ke dalam gelas yang sudah berisi bubuk kopi. Aduk resep kopi tubruk tradisional ini secara perlahan-lahan agar tercampur rata. Jangan lupa untuk menunggu sebentar agar bubuk kopi turun ke bawah gelas. Memang resep kopi tubruk tradisional sangat sederhana tetapi hasilnya sangat luar biasa nikmat untuk dinikmati bersama teman-teman saat kumpul bersama di teras rumah.

## Rahasia Resep Kopi Tubruk Tradisional Harum
Sebagai kesimpulan, rahasia resep kopi tubruk tradisional harum terletak pada bubuk kopi yang masih baru dan air yang panas. Kesimpulannya adalah bahwa resep kopi tubruk tradisional tetap menjadi pilihan utama masyarakat pecinta kopi sejati. Minumlah resep kopi tubruk tradisional selagi masih hangat agar keharumannya terasa maksimal di tenggorokan Anda. Demikianlah penjelasan mengenai resep kopi tubruk tradisional yang dapat kami bagikan semoga bermanfaat bagi Anda semua pembaca setia."""
    },

    # ---------------- 2. Kanker Serviks (Medis) ----------------
    {
        "id": "draft-03",
        "category": "Kesehatan & Kedokteran",
        "target_query": "gejala kanker serviks stadium awal",
        "draft_title": "Panduan Klinis Deteksi Gejala Awal Kanker Serviks dan Urgensi Pemeriksaan Skrining Sitologi",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Kosakata terminologi medis akurat, variasi leksikal tinggi (MATTR > 0.60), heading profesional tanpa spam HKO (0% <= 40%).",
        "draft_content": """Kanker leher rahim atau karsinoma serviks uteri merupakan neoplasma maligna yang berkembang lambat pada zona transformasi epitel serviks. Keganasan ini menempati peringkat teratas sebagai penyebab mortalitas pada wanita di negara-negara berkembang. Salah satu faktor yang menyebabkan tingginya angka kematian adalah karakteristik penyakit ini yang bersifat asimtomatik pada permulaan lesi prakanker. Mengenali sinyal perubahan biologis dan patologi organ reproduksi menjadi langkah paling krusial untuk menyelamatkan integritas organ dan kelangsungan hidup pasien.

## Manifestasi Fisik pada Fase Permulaan Neoplasia
Meskipun sering dijuluki sebagai silent killer, transformasi displasia epitel skuamosa dapat memicu tanda klinis mikro yang patut diwaspadai. Indikasi awal yang paling kerap dilaporkan berupa perdarahan kontak atau bercak darah abnormal setelah aktivitas koitus. Pasien juga dapat mengalami leukorea serosanguinosa, yaitu keluarnya cairan keputihan encer yang terkadang bercampur serpihan darah dengan aroma khas tidak sedap. Pada tahap ini, nyeri pelvis belum dirasakan secara intensif karena massa tumor belum menginfiltrasi pleksus saraf lumbosakral.

## Patofisiologi Infeksi Onkogenik Human Papillomavirus
Etiologi utama transformasi keganasan serviks adalah persistensi transmisi virus Human Papillomavirus tipe onkogenik berisiko tinggi, terutama subtipe 16 dan 18. Protein onkogenik virus, yakni E6 dan E7, secara agresif mendegradasi protein penekan tumor p53 dan retinoblastoma dalam sel inang. Akibatnya, siklus pembelahan sel kehilangan kendali apoptosis dan memicu mutasi materi genetik intraseluler secara tak terbatas hingga membentuk displasia stadium berat.

## Peran Diagnostik Sitologi Pap Smear dan Inspeksi Asam Asetat
Pemeriksaan skrining sitologi berkala melalui metode pap smear konvensional atau sitologi berbasis cairan mampu mendeteksi lesi displasia intraepitel sebelum bermutasi menjadi karsinoma invasif. Di fasilitas kesehatan primer dengan keterbatasan sarana laboratorium patologi anatomi, skrining inspeksi visual asam asetat atau tes IVA terbukti sangat efektif. Pengolesan larutan asam cuka tiga hingga lima persen akan memicu koagulasi protein selular abnormal, menghasilkan plak putih pada epitel atipikal yang siap ditangani dengan metode krioterapi.

## Langkah Proteksi Preventif Melalui Vaksinasi Rekombinan
Pencegahan primer yang paling efektif dilakukan melalui pemberian imunisasi vaksin HPV rekombinan bivalen, tetravalen, atau nonavalen kepada remaja perempuan sebelum aktif secara seksual. Vaksin ini merangsang imunitas humoral protektif terhadap antigen kapsid L1 virus. Kombinasi vaksinasi profilaksis dengan pola hidup higienis dan penapisan sitologi rutin setiap tiga tahun merupakan benteng pertahanan terbaik dalam mengeliminasi ancaman keganasan leher rahim sedini mungkin."""
    },
    {
        "id": "draft-04",
        "category": "Kesehatan & Kedokteran",
        "target_query": "gejala kanker serviks stadium awal",
        "draft_title": "Ketahui Gejala Kanker Serviks Stadium Awal yang Wajib Diketahui",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Uncurated AI draft, keyword stuffing 100% pada headings, repetisi leksikal parah, klise generik bertebaran.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya mengenai berbagai penyakit yang sering terjadi pada wanita. Tidak dapat dipungkiri bahwa kesehatan organ tubuh adalah hal yang sangat penting untuk kita ketahui bersama. Seperti yang kita ketahui, penyakit kanker adalah salah satu penyakit yang sangat ditakuti di seluruh dunia. Mari kita simak pembahasannya mengenai masalah kesehatan yang sangat penting ini agar kita selalu waspada setiap saat demi menjaga kesehatan tubuh kita semua.

## Gejala Kanker Serviks Stadium Awal pada Wanita
Membahas gejala kanker serviks stadium awal pada wanita sangatlah penting karena gejala kanker serviks stadium awal sering tidak disadari. Banyak wanita yang tidak tahu gejala kanker serviks stadium awal karena gejala kanker serviks stadium awal tidak menimbulkan rasa sakit sama sekali. Oleh karena itu, memahami gejala kanker serviks stadium awal adalah kunci utama bagi wanita agar tidak terlambat mendapatkan penanganan dari dokter. Semua wanita harus saling mengingatkan tentang gejala kanker serviks stadium awal ini.

## Mengenal Gejala Kanker Serviks Stadium Awal Sejak Dini
Untuk mengenal gejala kanker serviks stadium awal sejak dini, kita harus memperhatikan tanda-tanda yang muncul pada tubuh kita. Tanda gejala kanker serviks stadium awal biasanya berupa pendarahan dan keputihan yang tidak biasa. Jika Anda melihat gejala kanker serviks stadium awal ini, Anda harus segera memeriksakan diri ke puskesmas terdekat. Jangan mengabaikan gejala kanker serviks stadium awal karena gejala kanker serviks stadium awal bisa bertambah parah dari hari ke hari.

## Waspada Gejala Kanker Serviks Stadium Awal di Sekitar Kita
Kita semua harus waspada gejala kanker serviks stadium awal di sekitar kita demi keselamatan keluarga tercinta. Pencegahan gejala kanker serviks stadium awal dapat dilakukan dengan menjaga kebersihan tubuh secara rutin. Apabila kita selalu waspada terhadap gejala kanker serviks stadium awal, maka kita akan terlindungi dari bahaya yang mengancam kesehatan. Semua wanita wajib memahami gejala kanker serviks stadium awal tanpa terkecuali agar hidup lebih tenang dan tentram.

## Mengatasi Gejala Kanker Serviks Stadium Awal dengan Cepat
Sebagai kesimpulan, mengatasi gejala kanker serviks stadium awal dengan cepat adalah tindakan yang sangat bijaksana. Kesimpulannya adalah bahwa deteksi gejala kanker serviks stadium awal sangat bermanfaat bagi kelangsungan hidup kita semua. Konsultasikanlah segera mengenai gejala kanker serviks stadium awal ke bidan atau dokter kandungan. Semoga ulasan tentang gejala kanker serviks stadium awal ini memberikan manfaat yang nyata bagi masyarakat luas di tanah air tercinta."""
    },

    # ---------------- 3. SEO Web (Teknologi) ----------------
    {
        "id": "draft-05",
        "category": "Teknologi & Pemasaran Digital",
        "target_query": "panduan seo on page artikel blog",
        "draft_title": "Strategi Optimasi Elemen On-Page Website: Meningkatkan Visibilitas Organik Berbasis Niat Penelusuran",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Bahasa teknis berbobot, struktur heading analitis (HKO 0% <= 40%), MATTR > 0.60, tanpa repetisi hampa.",
        "draft_content": """Optimasi mesin pencari pada tataran halaman artikel merupakan pondasi fundamental dalam menjangkau audiens organik yang relevan dan berkelanjutan. Meskipun algoritma penelusuran Google secara konstan memperbarui sistem pemeringkatannya melalui kecerdasan buatan, prinsip dasar pemahaman konten oleh web crawler tetap berpijak pada keterbacaan semantik struktur kode HTML. Penulis artikel digital dituntut untuk menyajikan naskah yang tidak hanya memikat pembaca manusia, melainkan juga menyediakan sinyal kontekstual yang tegas bagi bot perayap mesin telusur.

## Harmonisasi Hirarki Dokumen HTML dan Penataan Heading
Struktur semantik dokumen dimulai dari hierarki judul yang teratur. Setiap halaman artikel wajib memuat satu tag judul utama eksklusif yang merangkum fokus pembahasan artikel secara presisi. Bagian isi kemudian dipilah ke dalam sub-pokok bahasan menggunakan heading tingkat dua dan tingkat tiga. Pendekatan ini memfasilitasi algoritma perayap dalam mengurai peta semantik teks serta mengekstraksi cuplikan terpilih pada laman hasil pencarian, sekaligus memudahkan navigasi mata pembaca dalam memindai poin-poin utama tulisan.

## Penulisan Cuplikan Meta Deskriptif dan Struktur Permalinks Ramah Mesin
Elemen meta deskripsi berfungsi sebagai etalase konversi klik pada lembar pencarian SERP. Tulislah ringkasan persuasif sepanjang seratus tiga puluh hingga seratus lima puluh lima karakter yang mengandung ajakan bertindak halus dan mencerminkan jawaban langsung atas niat penelusuran pengguna. Bersamaan dengan itu, konfigurasi tautan permanen atau permalinks wajib diatur secara ringkas, deskriptif, dan bebas dari parameter angka rumit agar perayap memahami topik bahasan naskah sejak pandangan pertama.

## Penyusunan Tautan Kontekstual Internal untuk Distribusi PageRank
Arsitektur penautan internal antarhalaman blog memegang peran vital dalam mendistribusikan otoritas halaman dan mempertahankan durasi sesi pengunjung situs. Hubungkan artikel baru dengan publikasi relevan sebelumnya menggunakan teks jangkar atau anchor text deskriptif yang variatif. Hindari pemakaian teks jangkar generik seperti klik tautan di sini, karena praktik tersebut memboroskan nilai relevansi semantik yang semestinya memperkuat keterkaitan topik dalam kluster konten blog Anda.

## Pengayaan Visual Melalui Kompresi Gambar dan Atribut Aksesibilitas
Aset visual pendukung seperti infografis dan diagram alur memperkaya pemahaman naskah, namun berpotensi membebani kecepatan memuat halaman bila tidak dikelola secara efisien. Konversikan berkas grafis ke dalam format modern berbobot ringan seperti format WebP dengan resolusi proporsional. Selalu sematkan teks alternatif deskriptif pada atribut gambar guna menjamin aksesibilitas pembaca tunanetra pemakai pembaca layar, sekaligus memberi petunjuk konteks visual bagi bot perayap Google Citra."""
    },
    {
        "id": "draft-06",
        "category": "Teknologi & Pemasaran Digital",
        "target_query": "panduan seo on page artikel blog",
        "draft_title": "Panduan SEO On Page Artikel Blog Mudah untuk Pemula",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa klise robotik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara membuat blog yang sukses di internet. Tidak dapat dipungkiri bahwa memiliki website yang ramai pengunjung adalah impian bagi setiap pemilik blog di mana saja. Seperti yang kita ketahui, salah satu cara terbaik untuk mendapatkan pengunjung adalah dengan menerapkan optimasi kata kunci yang tepat. Mari kita simak pembahasannya secara tuntas dalam artikel kali ini agar blog Anda semakin maju dan berkembang.

## Panduan SEO On Page Artikel Blog Bagian Pertama
Mempelajari panduan seo on page artikel blog sangatlah penting bagi keberhasilan blog Anda. Tanpa panduan seo on page artikel blog, artikel blog Anda akan sangat sulit sekali ditemukan di mesin pencari. Dengan panduan seo on page artikel blog yang tepat, blog Anda bisa mendapatkan banyak pembaca setia setiap harinya. Oleh sebab itu, pahami betul setiap poin dalam panduan seo on page artikel blog ini dengan seksama.

## Panduan SEO On Page Artikel Blog Bagian Kedua
Langkah lanjutan dari panduan seo on page artikel blog adalah menyusun kata kunci pada setiap kalimat tulisan Anda. Dalam panduan seo on page artikel blog ini, Anda harus mengulang kata kunci berkali-kali agar mesin pencari tahu topik tulisan Anda. Panduan seo on page artikel blog ini sangat mudah dipraktikkan oleh siapa saja bahkan oleh pemula yang baru membuat blog. Terapkan panduan seo on page artikel blog ini pada setiap postingan baru Anda.

## Panduan SEO On Page Artikel Blog Mengenai Trik Kata Kunci
Trik utama dalam panduan seo on page artikel blog adalah memilih topik yang banyak dicari oleh pembaca. Jangan sampai Anda menulis artikel blog tanpa memperhatikan panduan seo on page artikel blog yang benar. Banyak blogger yang berhasil karena setia mengikuti panduan seo on page artikel blog dari waktu ke waktu tanpa pernah menyerah. Pastikan Anda selalu mengingat panduan seo on page artikel blog ini.

## Panduan SEO On Page Artikel Blog untuk Hasil Maksimal
Sebagai kesimpulan, panduan seo on page artikel blog untuk hasil maksimal harus dijalankan dengan konsisten dan sabar. Kesimpulannya adalah bahwa panduan seo on page artikel blog menjadi kunci kesuksesan blog di dunia internet. Tak heran jika panduan seo on page artikel blog selalu menjadi topik yang paling dicari oleh para pengelola situs di mana-mana. Semoga artikel ini berguna bagi perjalanan blog Anda."""
    },

    # ---------------- 4. Monstera (Botani) ----------------
    {
        "id": "draft-07",
        "category": "Pertanian & Tanaman Hias",
        "target_query": "cara merawat tanaman monstera deliciosa",
        "draft_title": "Pedoman Pemeliharaan Monstera Deliciosa: Komposisi Media Tanam Porus dan Manajemen Cahaya Terfilter",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Bahasa hortikultura kaya dan spesifik, HKO 0% <= 40%, variasi istilah anatomi botani luas (MATTR > 0.60).",
        "draft_content": """Monstera deliciosa, flora tropis berdaun eksotis dari famili Araceae, telah bertransformasi menjadi ikon estetika botani pada dekorasi interior modern. Dikenal berkat bilah daunnya yang berlubang anggun atau fenestrasi alami, tanaman merambat asal hutan hujan belantara Amerika Tengah ini sesungguhnya memiliki daya tahan hidup yang tinggi. Kendati demikian, kegagalan pemeliharaan kerap dialami pekebun hias pemula akibat kekeliruan mendasar dalam mengkondisikan lingkungan tumbuh mikro yang selaras dengan habitat alami kanopi tropis asalnya.

## Kebutuhan Intensitas Radiasi Surya dan Kelembaban Ambien
Habitat asli monstera ternaungi oleh pepohonan kanopi lebat, sehingga anatomi daunnya terbiasa menerima spektrum cahaya matahari bauran atau filtered indirect light. Penempatan tanaman di bawah terik surya langsung berisiko merusak klorofil dan menyebabkan luka bakar gosong pada lamina daun. Sebaliknya, defisit pencahayaan ekstrem akan menghambat fotosintesis dan membuat helai daun baru tumbuh mengecil tanpa belahan fenestrasi. Jagalah kelembaban udara ruang berkisar enam puluh persen dengan bantuan pelembab udara buatan.

## Formulasi Substrat Tumbuh Berporositas Tinggi Bebas Genangan
Media tanam standar yang terlalu padat berbahan dasar tanah liat merupakan pemicu utama busuk rontok akar akibat anoksia perakaran. Formulasikan media tumbuh khusus tanaman aroid dengan mencampurkan cacahan kulit pinus terfermentasi, perlit vulkanik, sekam padi bakar, dan sedikit humus daun berpori. Komposisi porous ini menjamin aerasi oksigen leluasa di sekitar rambut akar serta memastikan kelebihan air siraman segera terbuang melalui lubang drainase pot.

## Pola Hidrasi Terjadwal dan Penopang Turus Sabut Kelapa
Lakukan penyiraman secara bijak hanya ketika lapisan atas media tanam sedalam tiga hingga lima sentimeter telah terasa mengering saat disentuh ujung jari. Di samping pasokan cairan berkala, sifat morfologi monstera yang merupakan tumbuhan hemiepifit membutuhkan media panjatan kokoh berupa turus sabut kelapa lembab. Akar udara yang melilit erat pada tiang penopang akan menyerap uap air tambahan sekaligus memicu pembesaran ukuran diameter batang secara progresif.

## Nutrisi Pupuk Lepas Lambat untuk Pembentukan Fenestrasi Daun
Asupan hara makro dan mikro disalurkan secara stabil melalui pemberian butiran pupuk lepas lambat berimbang setiap enam bulan sekali. Bersihkan permukaan helai daun secara teratur memakai kain katun basah untuk menghilangkan lapisan debu yang menghalangi stomata daun. Dengan disiplin perawatan yang teliti, tanaman Anda akan berkembang rimbun dengan bilah daun membelah sempurna yang memancarkan pesona tropis abadi di sudut kediaman Anda."""
    },
    {
        "id": "draft-08",
        "category": "Pertanian & Tanaman Hias",
        "target_query": "cara merawat tanaman monstera deliciosa",
        "draft_title": "Cara Merawat Tanaman Monstera Deliciosa yang Sangat Praktis",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kosa kata, frasa pembuka AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang menyukai tanaman hias daun untuk mempercantik ruangan rumah mereka. Tidak dapat dipungkiri bahwa tanaman hijau bisa membuat suasana rumah menjadi lebih asri dan nyaman sekali. Seperti yang kita ketahui, monstera adalah tanaman yang sangat hits dan disenangi oleh banyak pecinta tanaman di mana saja. Dalam artikel kali ini, mari kita simak pembahasannya tentang tanaman hias yang sangat indah ini agar tidak layu dan tetap segar bugar setiap hari.

## Cara Merawat Tanaman Monstera Deliciosa di Ruang Tamu
Mengetahui cara merawat tanaman monstera deliciosa di ruang tamu adalah hal yang sangat penting bagi pemilik rumah. Tanpa cara merawat tanaman monstera deliciosa yang baik, tanaman Anda bisa layu dan mati dengan cepat. Cara merawat tanaman monstera deliciosa sebenarnya tidak terlalu rumit asalkan Anda rajin membersihkan pot setiap minggu. Semua orang bisa menerapkan cara merawat tanaman monstera deliciosa ini di rumah masing-masing dengan mudah. Letakkan tanaman monstera di sudut ruang tamu yang terang agar tampak memesona.

## Tips Cara Merawat Tanaman Monstera Deliciosa yang Mudah
Dalam mempraktikkan tips cara merawat tanaman monstera deliciosa yang mudah, Anda harus memperhatikan jumlah air yang disiramkan. Tips cara merawat tanaman monstera deliciosa ini mengajarkan agar kita tidak menyiram terlalu banyak air. Jika Anda menerapkan tips cara merawat tanaman monstera deliciosa dengan benar, daun tanaman akan tumbuh subur dan hijau royo-royo setiap saat sepanjang tahun. Perhatikan juga kebersihan pot tanaman monstera deliciosa kesayangan Anda.

## Tahapan Cara Merawat Tanaman Monstera Deliciosa Agar Cantik
Tahapan cara merawat tanaman monstera deliciosa agar cantik meliputi penempatan pot di dekat jendela kamar. Tahapan cara merawat tanaman monstera deliciosa ini sangat berguna untuk menjaga kesegaran daun monstera kesayangan Anda. Lakukan tahapan cara merawat tanaman monstera deliciosa secara berurutan dan jangan melewatkan satu langkah pun agar hasilnya memuaskan hati Anda. Tanaman monstera deliciosa Anda akan tampak sangat mengagumkan sekali bagi siapa saja yang melihatnya.

## Perhatikan Cara Merawat Tanaman Monstera Deliciosa Setiap Hari
Sebagai kesimpulan, perhatikan cara merawat tanaman monstera deliciosa setiap hari dengan penuh rasa sayang dan perhatian. Kesimpulannya adalah bahwa cara merawat tanaman monstera deliciosa merupakan kegiatan berkebun yang sangat menyenangkan bagi siapa saja. Tak heran jika cara merawat tanaman monstera deliciosa selalu menjadi topik favorit pembaca. Sempatkanlah waktu merawat monstera deliciosa Anda. Semoga artikel ini berguna bagi Anda pecinta tanaman hijau."""
    },

    # ---------------- 5. Air Putih Hangat (Kesehatan) ----------------
    {
        "id": "draft-09",
        "category": "Kesehatan & Fisiologi Tubuh",
        "target_query": "manfaat minum air putih hangat di pagi hari",
        "draft_title": "Efek Fisiologis Konsumsi Cairan Hangat Saat Perut Kosong: Aktivasi Peristaltik dan Hemodinamik Tubuh",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Ulasan mekanisme biologis tubuh mendalam, HKO 0% <= 40%, variasi kosakata kaya (MATTR > 0.60).",
        "draft_content": """Memulai rutinitas harian dengan meneguk segelas cairan bersuhu hangat saat perut dalam keadaan kosong merupakan kebiasaan hidup sehat yang berakar kuat pada tradisi medis kuno maupun temuan biomedis modern. Selama siklus tidur sepanjang enam hingga delapan jam, tubuh manusia mengalami dehidrasi ringan akibat pelepasan uap air pernapasan dan ekskresi dermal alami tanpa adanya asupan cairan pengganti. Masuknya cairan dengan temperatur yang selaras dengan suhu inti tubuh segera memicu serangkaian respon fisiologis yang menguntungkan bagi homeostasis organ dalam.

## Rehidrasi Seluler Pascaperiode Puasa Nokturnal
Sensasi hangat dari air yang mengalir menyusuri esofagus mempercepat absorbsi molekul hidrogen oleh mukosa lambung dan enterosit usus halus. Rehidrasi kilat ini segera mengencerkan viskositas cairan intravaskular, mengembalikan turgor sel yang menyusut, serta memulihkan volume plasma darah yang sempat terdepresi selama masa istirahat malam. Dampak langsung dari ketercukupan cairan seluler adalah perbaikan transmisi neurotransmiter otak yang mengusir rasa kantuk dan meningkatkan kewaspadaan mental kognitif di permulaan fajar.

## Stimulasi Motilitas Saluran Cerna dan Pembersihan Residu Toksik
Temperatur cairan yang berkisar antara tiga puluh delapan hingga empat puluh derajat Celsius menstimulasi relaksasi otot polos sfingter lambung dan memicu gerak motilitas peristaltik usus besar. Fenomena ini melunakkan sisa metabolisme yang tertahan semalaman serta mendorong proses defekasi secara alami tanpa perlu mengejan kuat. Aktivasi usus yang lancar membantu eliminasi racun sisa metabolisme keluar dari tubuh sebelum sempat diserap kembali ke peredaran darah vena porta.

## Efisiensi Regulasi Sirkulasi Pembuluh Darah Perifer
Paparan termal hangat pada lumen lambung merangsang pelepasan sinyal saraf parasimpatis yang menyebabkan vasodilatasi pembuluh darah mikrosirkulasi di sekitar saluran cerna. Pelebaran dinding kapiler memperlancar aliran nutrisi serta oksigen menuju seluruh organ vital perifer, mengurangi beban resistensi vaskular sistemik, dan menstabilkan tekanan denyut jantung. Sirkulasi yang lancar juga berperan aktif dalam mengendurkan ketegangan jaringan otot leher dan bahu yang kerap terasa kaku saat bangun tidur.

## Keseimbangan Termoregulasi dan Optimasi Laju Metabolisme Basal
Konsumsi air hangat secara bertahap menaikkan suhu tubuh internal sekian desimal derajat, yang kemudian mengaktifkan mekanisme pendinginan alami melalui sekresi keringat halus kelenjar kulit. Proses termoregulasi dinamis ini membakar cadangan kalori mikroskopis dan menaikkan laju metabolisme basal hingga beberapa persen. Menjadikan ritual hidrasi hangat ini sebagai disiplin harian sederhana akan memberikan fondasi imunitas yang kokoh dalam menunjang produktivitas hidup yang berkualitas."""
    },
    {
        "id": "draft-10",
        "category": "Kesehatan & Fisiologi Tubuh",
        "target_query": "manfaat minum air putih hangat di pagi hari",
        "draft_title": "Manfaat Minum Air Putih Hangat di Pagi Hari untuk Tubuh Kita",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata ekstrem, frasa pembuka AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya apa saja kebiasaan sehat yang mudah dikerjakan setiap hari. Tidak dapat dipungkiri bahwa menjaga kesehatan raga adalah hal yang sangat penting untuk kita ketahui bersama. Seperti yang kita ketahui, air putih adalah minuman yang sangat menyehatkan bagi seluruh anggota keluarga. Mari kita simak pembahasannya secara tuntas tentang khasiat air hangat agar badan kita selalu bugar dan terbebas dari berbagai penyakit berbahaya.

## Berbagai Manfaat Minum Air Putih Hangat di Pagi Hari
Membicarakan berbagai manfaat minum air putih hangat di pagi hari tentu sangat menyenangkan bagi siapa saja. Berbagai manfaat minum air putih hangat di pagi hari bisa dirasakan oleh anak-anak maupun orang dewasa. Ketika kita bangun tidur, berbagai manfaat minum air putih hangat di pagi hari langsung bekerja menyegarkan tenggorokan yang kering. Oleh karena itu, rasakan sendiri berbagai manfaat minum air putih hangat di pagi hari untuk memulai hari Anda dengan ceria.

## Manfaat Minum Air Putih Hangat di Pagi Hari bagi Kesehatan
Ada banyak sekali manfaat minum air putih hangat di pagi hari bagi kesehatan tubuh manusia secara alami. Manfaat minum air putih hangat di pagi hari bagi kesehatan salah satunya adalah melancarkan buang air besar di pagi hari. Selain itu, manfaat minum air putih hangat di pagi hari bagi kesehatan juga dapat membuat kulit wajah menjadi lebih bersih dan berseri. Sangat banyak sekali manfaat minum air putih hangat di pagi hari bagi kesehatan yang tidak boleh Anda lewatkan.

## Manfaat Minum Air Putih Hangat di Pagi Hari untuk Metabolisme
Manfaat minum air putih hangat di pagi hari untuk metabolisme tubuh kita sangatlah luar biasa hebatnya. Dengan adanya manfaat minum air putih hangat di pagi hari untuk metabolisme, lemak tubuh bisa dibakar dengan lebih cepat dan mudah. Jangan malas untuk mendapatkan manfaat minum air putih hangat di pagi hari untuk metabolisme setiap bangun tidur. Kebiasaan ini sangat simpel tetapi memberikan hasil yang dahsyat.

## Rasakan Manfaat Minum Air Putih Hangat di Pagi Hari Sekarang
Sebagai kesimpulan, rasakan manfaat minum air putih hangat di pagi hari sekarang juga tanpa ditunda lagi. Kesimpulannya adalah bahwa manfaat minum air putih hangat di pagi hari sangat terbukti membawa berkah kebaikan bagi raga kita. Tak heran jika manfaat minum air putih hangat di pagi hari selalu direkomendasikan banyak orang. Semoga ulasan ini bermanfaat bagi Anda semua."""
    },

    # ---------------- 6. Keuangan Pribadi (Finansial) ----------------
    {
        "id": "draft-11",
        "category": "Keuangan & Perencanaan Finansial",
        "target_query": "strategi mengelola keuangan pribadi untuk pemula",
        "draft_title": "Arsitektur Anggaran Finansial Personal: Alokasi Likuiditas, Dana Siaga, dan Pembatasan Utang Konsumtif",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Kosakata literasi keuangan presisi, HKO 0% <= 40%, MATTR > 0.60, struktur edukatif tanpa spam.",
        "draft_content": """Mengelola tata kelola finansial personal bagi individu yang baru menapaki jenjang karir profesional kerap menjadi tantangan psikologis tersendiri di tengah godaan gaya hidup konsumerisme perkotaan. Kenaikan pendapatan gaji bulanan sering kali tidak berbanding lurus dengan peningkatan tabungan bersih apabila tidak dibarengi oleh literasi anggaran yang disiplin. Kesadaran untuk merancang cetak biru keuangan sejak usia produktif merupakan prasyarat mutlak guna mengamankan stabilitas ekonomi jangka panjang dari goncangan risiko ketidakpastian hidup.

## Pemetaan Arus Kas Masuk dan Pencatatan Pengeluaran Riil
Langkah awal dalam menata pundi-pundi moneter adalah melakukan audit personal terhadap seluruh arus kas keluar masuk secara transparan. Setiap pengeluaran, mulai dari kebutuhan pokok harian hingga pos rekreasi mikro, wajib terdokumentasi rapi dalam pembukuan digital. Pemetaan ini bertujuan mengidentifikasi pola kebocoran dana tersembunyi yang sering terabaikan, seperti langganan aplikasi digital berulang yang tidak terpakai atau belanja impulsif yang mengikis saldo rekening secara diam-diam.

## Penerapan Formula Proporsi Alokasi Kebutuhan dan Keinginan
Gunakan kerangka pembagian anggaran proporsional yang realistis untuk mengontrol laju konsumsi. Alokasikan separuh dari total pendapatan bersih untuk membiayai pos kebutuhan esensial yang tidak dapat ditawar, seperti biaya sewa tempat tinggal, konsumsi makanan bergizi, dan utilitas transportasi. Selanjutnya, batasi pos keinginan sekunder maksimal dua puluh persen, sementara sisa tiga puluh persen pendapatan disisihkan langsung di awal bulan untuk dialokasikan ke instrumen akumulasi tabungan dan investasi.

## Pembentukan Dana Darurat pada Instrumen Likuid Bebas Volatilitas
Sebelum melangkah ke instrumen investasi berisiko tinggi di pasar modal, prioritas utama pemula adalah membangun benteng proteksi dana siaga minimal setara tiga hingga enam kali nilai pengeluaran bulanan. Simpan cadangan likuiditas darurat ini pada instrumen moneter yang kebal terhadap gejolak fluktuasi pasar, memiliki akses pencairan cepat, dan memberikan imbal hasil di atas laju inflasi, seperti instrumen reksa dana pasar uang atau deposito perbankan digital.

## Disiplin Menghindari Jebakan Utang Bunga Berbunga
Kemandirian finansial akan runtuh seketika jika seseorang terjebak dalam pusaran utang konsumtif berbunga tinggi, seperti skema pinjaman daring ilegal atau pemakaian fasilitas bayar tunda berlebihan. Jangan pernah berutang demi membiayai gaya hidup gengsi sesaat yang nilainya terdepresiasi. Apabila terpaksa memanfaatkan fasilitas kredit, pastikan rasio cicilan bulanan tidak melebihi ambang batas aman tiga puluh persen dari pendapatan bersih demi menjaga kelayakan skor kredit Anda di masa depan."""
    },
    {
        "id": "draft-12",
        "category": "Keuangan & Perencanaan Finansial",
        "target_query": "strategi mengelola keuangan pribadi untuk pemula",
        "draft_title": "Strategi Mengelola Keuangan Pribadi untuk Pemula Tanpa Ribet",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata parah, bahasa AI klise tanpa substansi kalkulasi.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara mengatur uang gaji dengan baik setiap bulannya. Tidak dapat dipungkiri bahwa uang adalah hal yang sangat penting untuk kita ketahui bersama cara pemakaiannya. Seperti yang kita ketahui, jika tidak pandai mengatur uang maka uang kita akan cepat habis begitu saja tanpa bekas. Dalam artikel kali ini, mari kita simak pembahasannya secara lengkap agar dompet Anda tidak pernah tipis lagi dan selalu terisi penuh setiap saat.

## Pilihan Strategi Mengelola Keuangan Pribadi untuk Pemula
Mempelajari pilihan strategi mengelola keuangan pribadi untuk pemula sangatlah berguna bagi anak muda zaman sekarang. Tanpa strategi mengelola keuangan pribadi untuk pemula, uang tabungan Anda tidak akan pernah bertambah banyak. Dengan menerapkan strategi mengelola keuangan pribadi untuk pemula, hidup Anda akan menjadi lebih tenang dan bahagia. Oleh sebab itu, pahami betul strategi mengelola keuangan pribadi untuk pemula ini dengan sebaik-baiknya demi masa depan yang cerah.

## Belajar Strategi Mengelola Keuangan Pribadi untuk Pemula Sukses
Untuk belajar strategi mengelola keuangan pribadi untuk pemula sukses, Anda harus rajin menabung uang koin dan kertas. Langkah dalam strategi mengelola keuangan pribadi untuk pemula ini sangat gampang dilakukan oleh siapa saja yang mau berusaha. Banyak orang yang kaya raya karena setia mengikuti strategi mengelola keuangan pribadi untuk pemula sejak dini. Jangan ragu untuk mempraktikkan strategi mengelola keuangan pribadi untuk pemula ini setiap hari tanpa menunda lagi.

## Trik Strategi Mengelola Keuangan Pribadi untuk Pemula Masa Kini
Trik utama dari strategi mengelola keuangan pribadi untuk pemula masa kini adalah hemat dalam berbelanja barang di toko. Jangan membeli barang yang mahal jika tidak sesuai dengan strategi mengelola keuangan pribadi untuk pemula Anda. Selalu ingat aturan strategi mengelola keuangan pribadi untuk pemula agar keuangan keluarga Anda tetap aman dan sejahtera selalu sepanjang masa. Hindari jajan sembarangan demi mendukung strategi mengelola keuangan pribadi untuk pemula ini.

## Evaluasi Strategi Mengelola Keuangan Pribadi untuk Pemula
Sebagai kesimpulan, evaluasi strategi mengelola keuangan pribadi untuk pemula wajib dilakukan pada akhir bulan secara rutin. Kesimpulannya adalah bahwa strategi mengelola keuangan pribadi untuk pemula merupakan panduan yang sangat bermanfaat bagi generasi muda. Tak heran jika strategi mengelola keuangan pribadi untuk pemula banyak dibaca orang di internet. Semoga artikel ini berguna bagi masa depan dan kesuksesan finansial Anda sekeluarga."""
    },

    # ---------------- 7. Insomnia (Gaya Hidup) ----------------
    {
        "id": "draft-13",
        "category": "Gaya Hidup & Kesehatan Mental",
        "target_query": "tips mengatasi insomnia tanpa obat tidur",
        "draft_title": "Manajemen Higiene Tidur Non-Farmakologis: Regulasi Ritme Sirkadian dan Kontrol Stimulus Lingkungan Kamar",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Bahasa neurosains tidur kaya (MATTR > 0.60), HKO 0% <= 40%, tanpa klise repetitif, penjelasan aplikatif.",
        "draft_content": """Gangguan sulit tidur atau insomnia kronis telah menjadi epidemi tersembunyi di tengah peradaban masyarakat modern yang dipicu oleh tingginya paparan stres psikologis dan polusi cahaya artifisial. Ketergantungan terhadap sediaan medikasi sedatif atau pil hipnotik kimiawi bukanlah solusi jangka panjang yang ideal, mengingat adanya risiko toleransi obat, penurunan kualitas tidur gelombang lambat, dan efek samping ketergantungan fisik. Pendekatan perilaku berbasis kebersihan tidur terbukti jauh lebih aman dan berkelanjutan dalam merestorasi arsitektur tidur alami manusia.

## Penyelarasan Jam Biologis Tubuh Melalui Paparan Cahaya Alami
Sistem pengaturan waktu internal tubuh diatur oleh nukleus suprakiasmatik di otak yang sangat sensitif terhadap sinyal fotik matahari. Untuk menyetel ulang jam biologis sirkadian yang kacau, luangkan waktu menyerap paparan radiasi surya pagi hari selama lima belas hingga tiga puluh menit saat baru terjaga. Respon fotoreseptor retina terhadap spektrum cahaya biru alami akan menekan produksi hormon melatonin dan memicu lonjakan kortisol sehat yang menyegarkan raga, sekaligus memprogram pelepasan kantuk tepat waktu pada malam harinya.

## Reduksi Emisi Sinar Biru Gawai dan Suasana Gelap Pengantar Melatonin
Penyebab utama penundaan onset tidur di era modern adalah kebiasaan menatap layar ponsel pintar atau komputer jinjing menjelang waktu istirahat. Radiasi spektrum cahaya biru berpanjang gelombang pendek dari layar gawai memanipulasi otak untuk mengira bahwa suasana masih terang benderang, sehingga menghambat sekresi alami hormon melatonin dari kelenjar pineal. Matikan seluruh perangkat digital minimal enam puluh menit sebelum berbaring, dan kondisikan kamar tidur dalam keadaan gelap gulita untuk merangsang relaksasi mendalam.

## Pembatasan Zat Stimulan Kafein pada Jam Kritis Menjelang Petang
Molekul kafein bekerja sebagai antagonis kompetitif pada reseptor adenosin di sistem saraf pusat, yakni senyawa kimia yang bertugas mengirimkan sinyal kelelahan biologis ke otak. Mengingat waktu paruh eliminasi kafein dalam metabolisme hati manusia dapat bertahan antara lima hingga delapan jam, hindari konsumsi kopi, teh pekat, atau minuman energi melewati pukul dua siang agar molekul adenosin dapat berikatan sempurna dengan reseptornya saat waktu tidur tiba.

## Praktik Relaksasi Otot Progresif untuk Menurunkan Ketegangan Mental
Saat tubuh berbaring namun pikiran terus berputar dalam kecemasan, latihlah teknik relaksasi otot progresif dipadu pernapasan diafragma berirama lambat. Tegangkan kelompok otot kaki secara sadar selama lima detik, lalu lepaskan secara total sembari menghembuskan napas panjang, kemudian lanjutkan ke area paha, perut, bahu, hingga otot wajah. Penurunan ketegangan somatik secara bertahap ini akan menurunkan aktivitas gelombang beta otak menuju gelombang alfa yang menenangkan, mengantarkan kesadaran Anda menuju lelap yang tenang dan memulihkan vitalitas raga secara paripurna."""
    },
    {
        "id": "draft-14",
        "category": "Gaya Hidup & Kesehatan Mental",
        "target_query": "tips mengatasi insomnia tanpa obat tidur",
        "draft_title": "Tips Mengatasi Insomnia Tanpa Obat Tidur Paling Ampuh",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa klise robotik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya mengapa sangat sulit untuk memejamkan mata di malam hari. Tidak dapat dipungkiri bahwa tidur nyenyak adalah kebutuhan pokok yang sangat penting untuk kita ketahui bersama. Seperti yang kita ketahui, kurang tidur bisa membuat badan menjadi lemas dan tidak bertenaga sama sekali saat beraktivitas. Dalam artikel kali ini, mari kita simak pembahasannya tentang cara tidur pulas yang sangat gampang dicoba malam ini juga agar tubuh kita kembali bugar dan bersemangat.

## Ragam Tips Mengatasi Insomnia Tanpa Obat Tidur Alami
Mencari ragam tips mengatasi insomnia tanpa obat tidur alami adalah langkah yang sangat tepat bagi Anda. Dengan ragam tips mengatasi insomnia tanpa obat tidur alami, Anda tidak perlu takut akan bahaya bahan kimia berbahaya. Ragam tips mengatasi insomnia tanpa obat tidur alami ini sangat disukai oleh banyak orang karena aman dan tanpa efek samping. Lakukan ragam tips mengatasi insomnia tanpa obat tidur alami ini setiap malam di ranjang Anda demi mendapatkan tidur yang sangat berkualitas.

## Mengapa Tips Mengatasi Insomnia Tanpa Obat Tidur Diperlukan
Alasan mengapa tips mengatasi insomnia tanpa obat tidur diperlukan adalah demi menjaga kebugaran tubuh kita sepanjang waktu. Jika kita tidak menerapkan tips mengatasi insomnia tanpa obat tidur, kita akan sering sakit kepala di pagi hari. Oleh karena itu, tips mengatasi insomnia tanpa obat tidur menjadi solusi nomor satu yang wajib Anda pelajari sekarang juga tanpa ragu-ragu. Sayangilah kesehatan Anda dengan tips mengatasi insomnia tanpa obat tidur.

## Cara Menerapkan Tips Mengatasi Insomnia Tanpa Obat Tidur
Cara menerapkan tips mengatasi insomnia tanpa obat tidur sangatlah sederhana sekali untuk dikerjakan. Anda cukup mematikan lampu kamar dan bernapas pelan-pelan sambil memejamkan mata rapat-rapat. Tips mengatasi insomnia tanpa obat tidur ini sudah terbukti menolong ribuan orang yang susah tidur nyenyak. Jangan pernah menyerah dalam mempraktikkan tips mengatasi insomnia tanpa obat tidur ini agar Anda bisa terlelap dengan tenang.

## Kesimpulan Tips Mengatasi Insomnia Tanpa Obat Tidur
Sebagai kesimpulan, tips mengatasi insomnia tanpa obat tidur harus dibiasakan secara terus menerus agar berhasil optimal. Kesimpulannya adalah bahwa tips mengatasi insomnia tanpa obat tidur memberikan ketenangan jiwa dan raga bagi kita semua. Tak heran jika tips mengatasi insomnia tanpa obat tidur selalu menjadi topik yang paling diminati pembaca. Terapkan tips mengatasi insomnia tanpa obat tidur ini dengan konsisten. Selamat mencoba dan semoga lekas tidur nyenyak."""
    },

    # ---------------- 8. Mobil Listrik (Otomotif) ----------------
    {
        "id": "draft-15",
        "category": "Otomotif & Energi Terbarukan",
        "target_query": "keunggulan mobil listrik dibanding mobil konvensional",
        "draft_title": "Analisis Komparatif Elektrifikasi Transportasi: Efisiensi Konversi Energi, Emisi Gas Buang, dan Biaya Operasional",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Kosakata teknik otomotif dan termodinamika akurat, HKO 0% <= 40%, variasi diksi tinggi (MATTR > 0.60).",
        "draft_content": """Transformasi lanskap industri otomotif global menuju era elektrifikasi kendaraan roda empat bukan lagi sekadar tren gaya hidup elitis sesaat, melainkan suatu keniscayaan transisi energi guna memitigasi krisis perubahan iklim bumi. Perbandingan antara unit bertenaga baterai murni dengan kendaraan berbahan bakar hidrokarbon konvensional menyingkap perbedaan paradigma fundamental dalam hal efisiensi termodinamika mekanis, dampak lingkungan emisi karbon, dan kalkulasi kepemilikan jangka panjang bagi mobilitas masyarakat urban.

## Torsi Instan Dinamis Penggerak Motor Arus Bolak-Balik
Karakteristik performa mekanis motor induksi listrik menawarkan keunggulan akselerasi yang tidak mampu ditandingi oleh mesin pembakaran internal berbahan bakar bensin. Tanpa memerlukan transmisi roda gigi bertingkat yang rumit atau menunggu naiknya putaran mesin per menit, motor listrik sanggup menghantarkan torsi puncak secara instan seketika pedal akselerator diinjak. Responsivitas dinamis ini menghasilkan pengalaman berkendara yang mulus tanpa hentakan perpindahan gigi, sekaligus memberikan kesenyapan kabin tanpa getaran mekanik mesin.

## Perbandingan Pengeluaran Konsumsi Kilowatt-Hour Terhadap Bahan Bakar Fosil
Ditinjau dari perspektif efisiensi konversi daya, motor listrik mengonversi lebih dari delapan puluh persen energi elektrokimia baterai menjadi gerak kinetik roda, berbanding terbalik dengan mesin pembakaran bensin yang memboroskan tujuh puluh persen energi termal menjadi panas terbuang. Ditransformasikan ke dalam biaya riil operasional harian, ongkos pengisian daya listrik per seratus kilometer perjalanan terbukti empat hingga lima kali lipat lebih ekonomis dibandingkan pembelian liter bahan bakar minyak nonsubsidi.

## Penyederhanaan Suku Cadang Bergerak Bebas Pelumas Rutin
Konstruksi arsitektur kendaraan listrik meniadakan ribuan komponen bergerak yang rentan mengalami keausan mekanis akibat gesekan dan suhu tinggi. Ketiadaan komponen seperti piston mesin, katup hisap, poros engkol, sistem knalpot pembuangan, dan girboks rumit secara dramatis memangkas kebutuhan servis berkala. Pemilik kendaraan dibebaskan dari kewajiban rutin penggantian oli pelumas mesin, filter udara bahan bakar, dan sabuk timing, yang secara kumulatif menghemat anggaran perawatan tahunan secara signifikan.

## Kontribusi Nyata Penurunan Polutan Udara Perkotaan
Dari sudut pandang keberlanjutan ekologis, ketiadaan pipa gas buang menjamin nol emisi gas rumah kaca langsung di jalan raya perkotaan. Mengeliminasi buangan beracun seperti karbon monoksida, nitrogen oksida, dan partikel debu mikro partikulat sangat krusial dalam menekan angka insiden penyakit saluran pernapasan pada pemukiman padat penduduk. Dipadukan dengan dekarbonisasi bauran energi listrik pembangkit nasional, kendaraan baterai merupakan solusi transportasi paling bersih bagi kelestarian masa depan bumi."""
    },
    {
        "id": "draft-16",
        "category": "Otomotif & Energi Terbarukan",
        "target_query": "keunggulan mobil listrik dibanding mobil konvensional",
        "draft_title": "Keunggulan Mobil Listrik Dibanding Mobil Konvensional di Masa Depan",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata ekstrem, klise AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya mobil jenis apa yang paling bagus untuk dibeli. Tidak dapat dipungkiri bahwa kendaraan adalah hal yang sangat penting untuk kita ketahui bersama fungsinya. Seperti yang kita ketahui, kendaraan listrik saat ini sedang ramai dibicarakan di media sosial dan berita televisi. Mari kita simak pembahasannya secara lengkap dalam artikel kali ini mengenai perbandingan kendaraan masa depan yang canggih ini agar Anda tidak salah pilih saat membeli mobil baru di dealer.

## Mengapa Keunggulan Mobil Listrik Dibanding Mobil Konvensional Sangat Nyata
Membahas mengapa keunggulan mobil listrik dibanding mobil konvensional sangat nyata memang tidak ada habisnya. Banyak pengemudi yang mengakui keunggulan mobil listrik dibanding mobil konvensional saat melaju di jalanan kota. Keunggulan mobil listrik dibanding mobil konvensional membuat banyak orang ingin segera beralih dari mobil lama mereka. Tidak heran jika keunggulan mobil listrik dibanding mobil konvensional menjadi alasan utama penjualan kendaraan baru. Keunggulan mobil listrik dibanding mobil konvensional ini patut dipertimbangkan oleh setiap keluarga yang ingin berhemat.

## Bukti Keunggulan Mobil Listrik Dibanding Mobil Konvensional Terkini
Terdapat berbagai bukti keunggulan mobil listrik dibanding mobil konvensional terkini yang bisa kita saksikan sendiri. Bukti keunggulan mobil listrik dibanding mobil konvensional terkini adalah mesinnya yang sangat senyap dan tidak berisik. Selain itu, bukti keunggulan mobil listrik dibanding mobil konvensional terkini terlihat dari tidak adanya asap knalpot hitam. Inilah bukti keunggulan mobil listrik dibanding mobil konvensional yang sangat membanggakan kita semua. Masyarakat pun semakin mengakui bukti keunggulan mobil listrik dibanding mobil konvensional ini di mana-mana.

## Ulasan Keunggulan Mobil Listrik Dibanding Mobil Konvensional Otomotif
Dalam ulasan keunggulan mobil listrik dibanding mobil konvensional otomotif, faktor penghematan biaya bahan bakar menjadi sorotan utama. Ulasan keunggulan mobil listrik dibanding mobil konvensional otomotif menyebutkan bahwa mengisi baterai jauh lebih murah daripada bensin. Membaca ulasan keunggulan mobil listrik dibanding mobil konvensional otomotif tentu membuat kita semakin yakin untuk membelinya. Keberadaan ulasan keunggulan mobil listrik dibanding mobil konvensional otomotif ini sangat mencerahkan wawasan para pecinta otomotif tanah air.

## Alasan Keunggulan Mobil Listrik Dibanding Mobil Konvensional Menang
Sebagai kesimpulan, alasan keunggulan mobil listrik dibanding mobil konvensional menang telak adalah karena teknologinya ramah lingkungan. Kesimpulannya adalah bahwa keunggulan mobil listrik dibanding mobil konvensional membuka jalan baru bagi dunia transportasi kita. Alasan keunggulan mobil listrik dibanding mobil konvensional ini sudah tidak terbantahkan lagi oleh para ahli. Semoga ulasan ini memberikan wawasan yang bermanfaat bagi pembaca sekalian."""
    },

    # ---------------- 9. Kompos Dapur (Lingkungan) ----------------
    {
        "id": "draft-17",
        "category": "Lingkungan & Daur Ulang Mandiri",
        "target_query": "cara membuat pupuk kompos dari sampah organik dapur",
        "draft_title": "Teknologi Pengomposan Skala Rumah Tangga: Manajemen Rasio Karbon-Nitrogen dan Aerasi Mikroba Dekomposer",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Diksi sains dekomposisi organik kaya (MATTR > 0.60), HKO 0% <= 40%, prosedur praktis presisi tanpa spam.",
        "draft_content": """Timbunan sisa bahan makanan dari aktivitas memasak dapur keluarga menyumbang porsi terbesar volume limbah domestik yang berakhir di tempat pembuangan akhir sampah tanpa pengolahan berarti. Dekomposisi anaerobik dari timbunan sampah basah tersebut melepaskan emisi gas metana berkonsentrasi tinggi ke lapisan atmosfer, yang berpotensi mempercepat pemanasan global. Melalui inisiatif pengomposan mandiri berskala mikro, limbah organik rumah tangga dapat dikonversi menjadi pupuk kondisioner tanah alami yang sarat nutrisi hara makro bagi tanaman pekarangan.

## Pemilahan Fraksi Hijau Basah dan Fraksi Cokelat Kering
Kunci keberhasilan fermentasi kompos aerobik berakar pada perimbangan rasio atomik karbon terhadap nitrogen yang berkisar pada proporsi tiga puluh banding satu. Bahan berkadar nitrogen tinggi, atau material fraksi hijau, bersumber dari kulit buah-buahan segar, sisa sayuran hijau, dan ampas bubuk kopi. Bahan ini wajib diseimbangkan dengan material berkarbon tinggi, atau fraksi cokelat kering, seperti dedaunan luruh kering, serbuk gergaji kayu bersih, atau sobekan kardus karton tanpa tinta kimia sintetis guna mencegah pembusukan berbau busuk.

## Inokulasi Bioaktivator Cair Mempercepat Pembusukan Terkendali
Guna memangkas durasi pematangan dekomposisi dari hitungan bulan menjadi beberapa pekan, tambahkan inokulan kultur mikroorganisme pengurai cair yang telah diencerkan dengan air gula tebu. Cairan bioaktivator yang memuat konsorsium bakteri asam laktat, jamur ragi fermentasi, dan bakteri aktinomisetes akan menguraikan polimer selulosa dan hemiselulosa serat tumbuhan secara agresif. Semprotkan larutan kultur ini secara merata pada setiap lapisan material organik di dalam wadah komposter tong tertutup.

## Pemantauan Kelembaban Substrat dan Sirkulasi Oksigen Komposter
Pertumbuhan koloni mikroorganisme aerobik sangat bergantung pada suplai sirkulasi gas oksigen dan kadar kelembaban substrat kompos. Jagalah kadar basah material berkisar pada rentang lima puluh hingga enam puluh persen, yang dapat diuji dengan meremas segenggam bahan; terasa lembab seperti spons basah namun tidak meneteskan air berlebih. Lakukan pembalikan material tumpukan menggunakan garpu tanah seminggu sekali untuk memasukkan oksigen segar dan meratakan distribusi panas fermentasi termofilik.

## Indikator Kematangan Fisik Kompos Siap Aplikasi Tanaman
Proses pengomposan dinyatakan tuntas sempurna apabila tumpukan material telah mengalami transformasi wujud fisik secara menyeluruh. Ciri kompos matang yang aman diaplikasikan adalah penurunan temperatur substrat kembali ke suhu ruang normal, aroma harum khas tanah humus hutan setelah hujan, dan tekstur remah berwarna cokelat kehitaman yang rapuh saat diremas. Pupuk organik murni ini siap menyuburkan kesuburan mikrobiologis tanah kebun Anda secara lestari."""
    },
    {
        "id": "draft-18",
        "category": "Lingkungan & Daur Ulang Mandiri",
        "target_query": "cara membuat pupuk kompos dari sampah organik dapur",
        "draft_title": "Cara Membuat Pupuk Kompos dari Sampah Organik Dapur Sendiri",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi istilah sampah organik dapur, bahasa AI klise, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara mengolah sisa makanan di rumah agar tidak bau. Tidak dapat dipungkiri bahwa sampah dapur adalah masalah yang sangat penting untuk kita ketahui bersama jalan keluarnya. Seperti yang kita ketahui, jika dibiarkan menumpuk maka sisa masakan akan mengundang banyak lalat dan kuman penyakit. Dalam artikel kali ini, mari kita simak pembahasannya secara lengkap mengenai pembuatan pupuk yang sangat mudah dan murah ini.

## Cara Membuat Pupuk Kompos dari Sampah Organik Dapur Mudah
Mempraktikkan cara membuat pupuk kompos dari sampah organik dapur mudah sangat disarankan bagi para ibu rumah tangga. Dengan cara membuat pupuk kompos dari sampah organik dapur mudah, pekarangan rumah Anda akan menjadi lebih bersih dan rapi. Langkah awal dari cara membuat pupuk kompos dari sampah organik dapur mudah adalah mengumpulkan sisa sayuran dan buah yang tidak termakan. Siapa saja pasti bisa mempraktikkan cara membuat pupuk kompos dari sampah organik dapur mudah ini.

## Tahap Cara Membuat Pupuk Kompos dari Sampah Organik Dapur Cepat
Ada beberapa tahap cara membuat pupuk kompos dari sampah organik dapur cepat yang harus Anda ikuti dengan cermat. Tahap cara membuat pupuk kompos dari sampah organik dapur cepat mengharuskan Anda memotong sisa sayur menjadi kecil-kecil terlebih dahulu. Dengan tahap cara membuat pupuk kompos dari sampah organik dapur cepat ini, sampah Anda akan cepat membusuk menjadi tanah yang sangat subur sekali.

## Kunci Cara Membuat Pupuk Kompos dari Sampah Organik Dapur Berhasil
Kunci cara membuat pupuk kompos dari sampah organik dapur berhasil adalah menutup wadah ember dengan rapat setiap hari. Tanpa kunci cara membuat pupuk kompos dari sampah organik dapur berhasil, tumpukan sampah dapur Anda bisa mengeluarkan bau yang tidak sedap. Pastikan Anda selalu mengingat kunci cara membuat pupuk kompos dari sampah organik dapur berhasil ini demi kenyamanan keluarga.

## Hasil Cara Membuat Pupuk Kompos dari Sampah Organik Dapur Subur
Sebagai kesimpulan, hasil cara membuat pupuk kompos dari sampah organik dapur subur sangat bagus untuk tanaman hias dan cabai Anda. Kesimpulannya adalah bahwa cara membuat pupuk kompos dari sampah organik dapur membawa manfaat ganda bagi kebersihan dan kesuburan kebun. Tak heran jika cara membuat pupuk kompos dari sampah organik dapur menjadi tren hijau saat ini. Semoga sukses mencobanya di rumah."""
    },

    # ---------------- 10. Belajar Python (Pemrograman) ----------------
    {
        "id": "draft-19",
        "category": "Teknologi Informasi & Pemrograman",
        "target_query": "panduan belajar pemrograman python dasar untuk pemula",
        "draft_title": "Pondasi Sintaksis dan Paradigma Logika Kode: Struktur Data Kolektif, Percabangan Alur, dan Modularisasi Skrip",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Bahasa computer science kaya konsep (MATTR > 0.60), HKO 0% <= 40%, edukatif, bebas redundansi generik.",
        "draft_content": """Memasuki ranah rekayasa perangkat lunak modern menuntut penguasaan bahasa pemrograman yang memiliki sintaksis elegan serta fleksibilitas ekosistem pustaka yang luas. Bahasa pemrograman Python menonjol sebagai instrumen komputasi pilihan utama di berbagai sektor industri, mulai dari otomatisasi skrip administratif, pengembangan layanan web backend berskala besar, hingga riset kecerdasan buatan dan analitika data raya. Filosofi desainnya yang memprioritaskan keterbacaan kode memungkinkan pemula memusatkan perhatian pada logika algoritma tanpa tersandung hambatan sintaksis yang rumit.

## Pengenalan Tipe Data Primitif dan Variabel Penampung Nilai
Perjalanan membangun logika kode diawali dengan pemahaman terhadap tipe data fundamental yang merepresentasikan nilai dalam memori komputer. Kenali karakteristik bilangan bulat integer, pecahan titik kambang float untuk kalkulasi presisi desimal, nilai kebenaran boolean untuk evaluasi logika kondisi, serta untaian teks string untuk manipulasi karakter alfabet. Python mengadopsi sistem pengetikan dinamis, yang berarti interpreter akan menyimpulkan tipe data variabel secara otomatis saat waktu eksekusi tanpa memerlukan deklarasi tipe eksplisit.

## Pengendalian Alur Instruksi Kondisional Serta Perulangan Iteratif
Sebuah program komputer memperoleh kecerdasannya melalui kemampuan mengambil keputusan logis berdasarkan kriteria kondisi tertentu. Kuasai blok percabangan bersyarat menggunakan kata kunci if, elif, dan else yang diatur menggunakan indentasi spasi ketat sebagai penanda blok kode. Guna mengeksekusi instruksi berulang pada sekumpulan elemen data koleksi seperti list dan dictionary, manfaatkan struktur perulangan iterasi for serta perulangan berbasis kondisi while yang dilengkapi penjaga kondisi batas.

## Deklarasi Fungsi Rekayasa Ulang dan Penanganan Pengecualian Eror
Menulis kode yang bersih dan dapat dipelihara memerlukan pembagian logika ke dalam blok fungsi mandiri yang mengembalikan nilai keluaran spesifik. Deklarasikan fungsi terstruktur memakai kata kunci def dengan parameter masukan yang terdefinisi jelas untuk mencegah duplikasi kode berulang. Lengkapi setiap alur kerja perangkat lunak dengan mekanisme penanganan galat eksepsi menggunakan blok try dan except agar program mampu menangani kegagalan input tak terduga tanpa mengalami penghentian mendadak secara fatal.

## Manajemen Pustaka Eksternal Menggunakan Perangkat Pengelola Paket
Kekuatan sejati ekosistem Python terletak pada ribuan repositori modul sumber terbuka yang siap diintegrasikan melalui perangkat manajer paket pip. Pelajari cara mengisolasi dependensi proyek dalam lingkungan virtual terpisah agar versi modul tidak saling bertabrakan antar-aplikasi. Dengan menguasai konsep-konsep dasar arsitektur logika ini secara konsisten, Anda telah menanamkan pondasi rekayasa perangkat lunak yang kokoh untuk menjelajahi spesialisasi teknologi tingkat lanjut di masa depan."""
    },
    {
        "id": "draft-20",
        "category": "Teknologi Informasi & Pemrograman",
        "target_query": "panduan belajar pemrograman python dasar untuk pemula",
        "draft_title": "Panduan Belajar Pemrograman Python Dasar untuk Pemula dari Nol",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa pembuka AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara belajar coding komputer dengan mudah dan cepat. Tidak dapat dipungkiri bahwa keterampilan membuat program adalah hal yang sangat penting untuk kita ketahui bersama keuntungannya. Seperti yang kita ketahui, programmer adalah profesi yang sangat keren dan memiliki masa depan yang sangat cerah sekali. Dalam artikel kali ini, mari kita simak pembahasannya tentang cara belajar bahasa komputer paling populer di dunia saat ini.

## Panduan Belajar Pemrograman Python Dasar untuk Pemula Bagian Input
Memulai panduan belajar pemrograman python dasar untuk pemula bagian input adalah langkah awal yang sangat bagus. Dalam panduan belajar pemrograman python dasar untuk pemula bagian input ini, Anda akan belajar cara mengetik kata print di layar. Panduan belajar pemrograman python dasar untuk pemula bagian input sangat mudah dipahami oleh siapa saja tanpa perlu pintar matematika. Jangan takut salah saat mencoba panduan belajar pemrograman python dasar untuk pemula bagian input ini.

## Panduan Belajar Pemrograman Python Dasar untuk Pemula Bagian Logika
Langkah kedua dari panduan belajar pemrograman python dasar untuk pemula bagian logika membahas tentang cara kerja komputer berpikir. Dengan panduan belajar pemrograman python dasar untuk pemula bagian logika, Anda bisa membuat program yang pintar dan hebat. Banyak siswa yang berhasil berkat panduan belajar pemrograman python dasar untuk pemula bagian logika yang teratur ini. Teruslah berlatih mengikuti panduan belajar pemrograman python dasar untuk pemula bagian logika.

## Panduan Belajar Pemrograman Python Dasar untuk Pemula Bagian Function
Penerapan panduan belajar pemrograman python dasar untuk pemula bagian function bertujuan agar kode Anda rapi dan teratur. Anda bisa membuat banyak tombol perintah dengan panduan belajar pemrograman python dasar untuk pemula bagian function ini. Kuasai panduan belajar pemrograman python dasar untuk pemula bagian function ini agar Anda bisa membuat aplikasi game sendiri di komputer rumah Anda.

## Panduan Belajar Pemrograman Python Dasar untuk Pemula Bagian Akhir
Sebagai kesimpulan, panduan belajar pemrograman python dasar untuk pemula bagian akhir harus ditutup dengan proyek latihan mandiri. Kesimpulannya adalah bahwa panduan belajar pemrograman python dasar untuk pemula membuka gerbang karir digital yang sangat luas. Tak heran jika panduan belajar pemrograman python dasar untuk pemula selalu dicari di internet. Semoga artikel panduan ini bermanfaat bagi Anda."""
    },

    # ---------------- 11. Kesehatan Mata (Ergonomi) ----------------
    {
        "id": "draft-21",
        "category": "Kesehatan Kerja & Ergonomi Digital",
        "target_query": "tips menjaga kesehatan mata bagi pekerja depan layar",
        "draft_title": "Pencegahan Sindrom Penglihatan Komputer: Penerapan Jeda Akresi Akomodasi, Ergonomi Sudut Pandang, dan Pencahayaan",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Kosakata oftalmologi dan ergonomi kerja akurat, HKO 0% <= 40%, variasi istilah kaya (MATTR > 0.60).",
        "draft_content": """Tuntutan produktivitas era modern mewajibkan jutaan pekerja profesional menghabiskan waktu lebih dari delapan jam setiap hari menatap layar gawai digital dan monitor komputer. Kebiasaan menatap tampilan piksel secara statis tanpa jeda memicu timbulnya sindrom ketegangan mata digital atau asthenopia okupasional. Kondisi ini ditandai oleh gejala mata perih mengering, pandangan buram sesaat, fotofobia, serta sensasi nyeri tumpul yang menjalar ke otot pelipis dan tengkuk leher. Menerapkan disiplin ergonomi visual terpadu merupakan kunci utama melindungi ketajaman penglihatan organ mata jangka panjang.

## Implementasi Disiplin Relaksasi Okular Teratur Setiap Duapuluh Menit
Otot siliaris mata mengalami spasme ketegangan konstan saat dipaksa memfokuskan bayangan pada jarak dekat secara terus-menerus. Terapkan protokol relaksasi penglihatan klasik dua puluh-dua puluh-dua puluh sebagai jeda intervensi visual. Setiap dua puluh menit menatap layar, alihkan fokus tatapan mata ke objek pemandangan yang berjarak minimal dua puluh kaki atau sekitar enam meter selama minimal dua puluh detik penuh. Pengalihan jarak fokus jauh ini seketika mengendurkan kontraksi otot siliaris dan memulihkan daya akomodasi lensa kristalin mata.

## Pengaturan Sudut Inklinasi Monitor dan Jarak Pandang Ideal
Posisi penempatan layar monitor terhadap sumbu pandang wajah menentukan tingkat penguapan lapisan air mata prekorneal. Aturlah ketinggian monitor sedemikian rupa sehingga bagian teratas bingkai layar berada sejajar atau sedikit di bawah garis horizontal pandangan mata. Posisi ini memaksa sudut tatapan mata mengarah sedikit ke bawah sebesar lima belas hingga dua puluh derajat, yang memperkecil luas bukaan celah kelopak mata palpebra sehingga laju evaporasi cairan lapisan mata dapat ditekan secara signifikan.

## Kalibrasi Kontras Layar Terhadap Luminansi Ruang Kerja
Perbedaan intensitas cahaya yang mencolok antara tingkat terang layar monitor dengan kegelapan ruangan kerja membebani kinerja otot pupil secara berlebihan. Sesuaikan tingkat kecerahan layar agar harmonis dengan luminansi cahaya ruangan sekitar Anda; hindari bekerja di ruangan temaram dengan layar berpendar terlalu benderang. Aktifkan filter temperatur warna hangat pada pengaturan sistem operasi menjelang senja hari guna menyaring radiasi spektrum cahaya biru berenergi tinggi yang melelahkan retina.

## Tetes Lubrikasi Kornea Mata Artifisial Mengatasi Sindrom Kering
Frekuensi kedipan mata manusia secara alami merosot hingga lebih dari separuh laju normal saat berkonsentrasi membaca teks di layar, memicu dehidrasi sel epitel kornea. Untuk meredakan sensasi berpasir, gunakan sediaan obat tetes mata air mata buatan bebas bahan pengawet secara berkala. Menjaga hidrasi okular dipadukan dengan kebiasaan mengedipkan mata secara sadar akan memelihara kestabilan lapisan lipid air mata, menjamin kenyamanan penglihatan prima sepanjang hari kerja."""
    },
    {
        "id": "draft-22",
        "category": "Kesehatan Kerja & Ergonomi Digital",
        "target_query": "tips menjaga kesehatan mata bagi pekerja depan layar",
        "draft_title": "Tips Menjaga Kesehatan Mata bagi Pekerja Depan Layar Setiap Hari",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa klise robotik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara merawat mata agar tidak cepat lelah saat bekerja. Tidak dapat dipungkiri bahwa mata adalah indra penglihatan yang sangat penting untuk kita ketahui bersama cara merawatnya. Seperti yang kita ketahui, bekerja seharian di depan laptop bisa membuat pandangan menjadi kabur dan pusing kepala. Dalam artikel kali ini, mari kita simak pembahasannya tentang cara menjaga indra penglihatan kita agar selalu sehat dan jernih setiap saat.

## Aneka Tips Menjaga Kesehatan Mata bagi Pekerja Depan Layar
Mempelajari aneka tips menjaga kesehatan mata bagi pekerja depan layar sangat dibutuhkan oleh para staf kantor modern. Tanpa aneka tips menjaga kesehatan mata bagi pekerja depan layar, mata Anda akan terasa pedih dan merah sekali. Aneka tips menjaga kesehatan mata bagi pekerja depan layar ini sangat mudah dipraktikkan tanpa perlu mengeluarkan biaya sepeser pun. Lakukan aneka tips menjaga kesehatan mata bagi pekerja depan layar ini sekarang juga di meja kerja Anda.

## Pentingnya Tips Menjaga Kesehatan Mata bagi Pekerja Depan Layar
Alasan pentingnya tips menjaga kesehatan mata bagi pekerja depan layar adalah agar kita bisa bekerja dengan nyaman seharian penuh. Jika Anda mengabaikan pentingnya tips menjaga kesehatan mata bagi pekerja depan layar, minus mata Anda bisa bertambah tinggi dengan cepat. Oleh sebab itu, pentingnya tips menjaga kesehatan mata bagi pekerja depan layar harus selalu diingat oleh semua karyawan kantor di mana pun berada.

## Solusi Tips Menjaga Kesehatan Mata bagi Pekerja Depan Layar
Sebagai salah satu solusi tips menjaga kesehatan mata bagi pekerja depan layar, Anda disarankan untuk sering mengedipkan mata saat mengetik. Solusi tips menjaga kesehatan mata bagi pekerja depan layar ini terbukti ampuh mencegah kekeringan pada bola mata. Terapkan solusi tips menjaga kesehatan mata bagi pekerja depan layar ini secara disiplin setiap hari tanpa lupa.

## Rangkuman Tips Menjaga Kesehatan Mata bagi Pekerja Depan Layar
Sebagai kesimpulan, rangkuman tips menjaga kesehatan mata bagi pekerja depan layar mengajarkan kita untuk menyayangi tubuh kita sendiri. Kesimpulannya adalah bahwa tips menjaga kesehatan mata bagi pekerja depan layar sangat berguna bagi kelangsungan karir Anda di era serba komputer ini. Tak heran jika tips menjaga kesehatan mata bagi pekerja depan layar banyak dicari pembaca. Semoga tips ini membawa manfaat nyata."""
    },

    # ---------------- 12. Reksa Dana Pasar Uang (Investasi) ----------------
    {
        "id": "draft-23",
        "category": "Investasi & Pasar Modal",
        "target_query": "keuntungan investasi reksa dana pasar uang untuk generasi muda",
        "draft_title": "Diversifikasi Aset Pemula Melalui Instrumen Pasar Uang: Fleksibilitas Pencairan, Imbal Hasil Kompetitif, dan Risiko Rendah",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Terminologi reksa dana dan pasar modal akurat (MATTR > 0.60), HKO 0% <= 40%, gaya edukatif tanpa spekulasi.",
        "draft_content": """Langkah pertama generasi muda dalam memasuki dunia pasar modal sering kali terhalang oleh stigma bahwa investasi selalu identik dengan volatilitas ekstrem, risiko kebangkrutan modal, dan kebutuhan modal awal yang bernilai fantastis. Menghadapi kekhawatiran tersebut, wadah investasi kolektif reksa dana pasar uang hadir sebagai jembatan inklusi finansial paling ideal bagi investor pemula. Karakteristik instrumen portofolionya yang berfokus pada instrumen jangka pendek menawarkan perpaduan optimal antara keamanan dana pokok, likuiditas pencairan tinggi, dan imbal hasil kompetitif di atas inflasi.

## Mekanisme Penempatan Portofolio pada Deposito dan Surat Utang Jangka Pendek
Sesuai regulasi otoritas keuangan, manajer investasi profesional mengalokasikan seratus persen dana kelolaan reksa dana jenis ini ke dalam instrumen pasar uang berjangka waktu jatuh tempo di bawah satu tahun. Portofolio aset mencakup kombinasi penempatan deposito berjangka pada bank-bank nasional terpercaya serta surat utang negara atau obligasi korporasi berperingkat investasi tinggi. Diversifikasi aset jangka pendek ini memastikan pergerakan grafik nilai aktiva bersih bergerak stabil menanjak tanpa terpengaruh fluktuasi indeks harga saham gabungan.

## Ketiadaan Biaya Transaksi Pembelian Maupun Penjualan Unit
Salah satu keunggulan ekonomis yang memanjakan investor bermodal terbatas adalah pembebasan biaya administrasi transaksi. Tidak seperti transaksi saham atau instrumen properti yang membebankan komisi pialang dan pajak penjualan pada setiap eksekusi, reksa dana pasar uang pada platform agen penjual digital umumnya memberlakukan kebijakan nol biaya pembelian dan nol biaya penebusan. Seluruh modal yang disetorkan terkonversi utuh menjadi unit penyertaan tanpa potongan biaya tersembunyi.

## Likuiditas Tinggi Tanpa Penguncian Modal Pokok
Keunggulan fleksibilitas pencairan modal menempatkan instrumen ini sebagai lokasi penyimpanan dana siaga yang sangat superior dibandingkan produk tabungan konvensional. Dana investasi tidak mengalami penguncian jangka waktu kaku layaknya deposito perbankan tradisional yang mengenakan sanksi penalti penarikan dini. Pemodal dapat mencairkan unit penyertaan kapan pun kebutuhan mendesak timbul, dan dana hasil penjualan akan ditransfer ke rekening bank dalam hitungan satu hingga dua hari kerja bursa.

## Perlindungan Legalitas Melalui Otoritas Jasa Keuangan dan Bank Kustodian
Keamanan dana masyarakat dijamin oleh kerangka regulasi pasar modal yang sangat ketat dan transparan. Dana kelolaan nasabah tidak disimpan di rekening perusahaan manajer investasi, melainkan dititipkan secara terpisah pada lembaga bank kustodian independen yang berizin resmi. Pengawasan langsung oleh Otoritas Jasa Keuangan menjamin akuntabilitas audit berkala, menghindarkan pemodal dari risiko penggelapan dana dan skema penipuan investasi ilegal yang marak terjadi."""
    },
    {
        "id": "draft-24",
        "category": "Investasi & Pasar Modal",
        "target_query": "keuntungan investasi reksa dana pasar uang untuk generasi muda",
        "draft_title": "Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda Cuan",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi istilah pasar uang pemula, klise generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara menginvestasikan uang saku agar cepat berkembang. Tidak dapat dipungkiri bahwa memiliki tabungan uang yang banyak adalah impian masa depan yang sangat penting untuk kita ketahui bersama kuncinya. Seperti yang kita ketahui, jika hanya menyimpan uang di bawah bantal maka uang kita tidak akan bertambah nilainya. Dalam artikel kali ini, mari kita simak pembahasannya secara tuntas mengenai tempat menyimpan dana yang sangat menguntungkan ini.

## Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda Hemat
Mengetahui keuntungan investasi reksa dana pasar uang untuk generasi muda hemat adalah langkah pintar anak muda masa kini. Dengan keuntungan investasi reksa dana pasar uang untuk generasi muda hemat, Anda bisa mulai menabung dari uang sepuluh ribu rupiah saja. Keuntungan investasi reksa dana pasar uang untuk generasi muda hemat sangat cocok bagi pelajar dan mahasiswa yang ingin belajar berinvestasi tanpa beban berat sama sekali di dompet mereka.

## Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda Mudah
Sisi menarik lainnya dari keuntungan investasi reksa dana pasar uang untuk generasi muda mudah adalah aplikasinya yang bisa diunduh di ponsel pintar. Keuntungan investasi reksa dana pasar uang untuk generasi muda mudah membuat siapa pun bisa membeli unit investasi sambil rebahan di rumah. Semua keuntungan investasi reksa dana pasar uang untuk generasi muda mudah ini dapat dinikmati oleh seluruh anak muda di seluruh pelosok Indonesia.

## Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda Aman
Tentu saja keuntungan investasi reksa dana pasar uang untuk generasi muda aman menjadi alasan utama mengapa produk ini sangat dipercaya masyarakat. Keuntungan investasi reksa dana pasar uang untuk generasi muda aman diawasi langsung oleh pemerintah sehingga uang Anda tidak akan hilang dicuri orang. Rasakan keuntungan investasi reksa dana pasar uang untuk generasi muda aman ini demi masa depan keluarga.

## Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda Kaya
Sebagai kesimpulan, keuntungan investasi reksa dana pasar uang untuk generasi muda kaya raya terbukti nyata jika dilakukan secara rutin setiap bulan. Kesimpulannya adalah bahwa keuntungan investasi reksa dana pasar uang untuk generasi muda menjadi jalan kesuksesan moneter generasi milenial. Tak heran jika produk ini selalu menjadi buah bibir di mana-mana. Semoga artikel ini berguna bagi masa depan Anda."""
    },

    # ---------------- 13. Lele Bioflok (Akuakultur) ----------------
    {
        "id": "draft-25",
        "category": "Akuakultur & Wirausaha Agribisnis",
        "target_query": "cara budidaya ikan lele sistem bioflok di lahan sempit",
        "draft_title": "Manajemen Akuakultur Padat Tebar Tinggi: Pembentukan Gumpalan Mikroba Aerobik dan Pengendalian Limbah Amonia Kolam",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Bahasa teknik biologi akuakultur mendalam (MATTR > 0.60), HKO 0% <= 40%, kalkulasi aerasi dan rasio pakan terinci.",
        "draft_content": """Keterbatasan ketersediaan lahan pekarangan di area pemukiman padat perkotaan kini bukan lagi menjadi penghalang bagi penggiat wirausaha agribisnis perikanan darat air tawar. Penerapan bioteknologi budidaya berbasis sistem bioflok menawarkan solusi terobosan dalam melipatgandakan kepadatan tebar komoditas ikan lele tanpa menuntut pasokan pergantian air harian yang boros. Metode intensif ini memanfaatkan konsorsium mikroorganisme alami untuk mendaur ulang limbah metabolisme ekskresi ikan menjadi gumpalan biomassa kaya protein yang dapat dikonsumsi kembali oleh benih ikan.

## Persiapan Wadah Terpal Bundar Berporositas Kuat Berdiameter Tiga Meter
Konstruksi kolam bundar berbahan terpal karet berkekuatan tinggi dengan rangka besi anyaman galvanis merupakan opsi paling efisien untuk memanfaatkan sudut sempit pekarangan rumah. Pasang instalasi pembuangan sentral berbentuk kerucut di dasar tengah kolam guna mempermudah pembuangan endapan lumpur pekat secara gravitasi. Isi kolam dengan air bersih hingga ketinggian delapan puluh sentimeter, lalu sterilkan media air menggunakan garam krosok dan larutan pembasmi patogen sebelum proses inokulasi kultur mikroba dimulai.

## Fermentasi Molase Tetes Tebu dan Probiotik Pembentuk Flok
Pembentukan flok mikroba aerobik mensyaratkan manipulasi rasio karbon terhadap nitrogen air kolam pada angka minimal dua belas banding satu. Masukkan inokulan bakteri probiotik genus Bacillus subtilis yang dikombinasikan dengan sumber karbon organik terlarut berupa molase tetes tebu murni atau larutan gula aren. Biarkan air kolam diaerasi secara intensif selama satu pekan penuh hingga warna air berubah menjadi kecokelatan dan aroma air tercium segar layaknya adonan ragi roti yang menandakan koloni mikroba telah matang.

## Pengoperasian Pompa Aerator Berkelanjutan Menyuplai Oksigen Terlarut
Tingkat padat tebar tinggi hingga seribu ekor per meter kubik air menuntut ketersediaan oksigen terlarut yang sangat stabil pada level minimal empat miligram per liter. Pompa aerasi bertenaga tiup kontinu wajib beroperasi tanpa henti sepanjang siang dan malam melalui batu aerasi uniring yang disebar di dasar kolam. Suplai gelembung oksigen mikro ini berfungsi ganda: mempertahankan kehidupan metabolisme ikan lele sekaligus mencegah pengendapan massa flok mikroba yang dapat memicu pembusukan anaerobik berbahaya.

## Pemantauan Nilai Derajat Keasaman dan Rasio Konversi Pakan
Keberhasilan pemeliharaan diukur melalui efisiensi konversi pakan pelet yang secara drastis menurun ke angka di bawah nol koma delapan berkat kontribusi konsumsi flok mikroba. Pantau parameter kualitas air secara harian, terutama stabilitas pH pada rentang tujuh koma nol hingga delapan koma nol, serta pantau volume endapan flok menggunakan kerucut imhoff pada level tiga puluh mililiter per liter. Panen ikan lele berbobot seragam dapat dicapai dalam durasi pemeliharaan relatif singkat selama tujuh puluh hingga delapan puluh hari saja."""
    },
    {
        "id": "draft-26",
        "category": "Akuakultur & Wirausaha Agribisnis",
        "target_query": "cara budidaya ikan lele sistem bioflok di lahan sempit",
        "draft_title": "Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit Murah",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kosa kata lele bioflok, bahasa AI klise, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara memulai usaha sampingan yang menghasilkan banyak uang di rumah. Tidak dapat dipungkiri bahwa memelihara ikan lele adalah peluang bisnis yang sangat penting untuk kita ketahui bersama cara kerjanya. Seperti yang kita ketahui, ikan lele adalah makanan yang sangat laris manis dibeli oleh warung pecel lele di mana-mana. Dalam artikel kali ini, mari kita simak pembahasannya secara tuntas mengenai ternak ikan di halaman sempit.

## Langkah Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit
Mempraktikkan langkah cara budidaya ikan lele sistem bioflok di lahan sempit adalah solusi terbaik bagi warga perkotaan. Dengan langkah cara budidaya ikan lele sistem bioflok di lahan sempit, Anda tidak butuh sawah yang luas untuk memelihara ribuan ekor lele. Siapa saja bisa meniru langkah cara budidaya ikan lele sistem bioflok di lahan sempit ini dengan modal yang sangat terjangkau sekali di kantong Anda.

## Kiat Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit Sukses
Terdapat beberapa kiat cara budidaya ikan lele sistem bioflok di lahan sempit sukses yang wajib Anda perhatikan secara teliti. Kiat cara budidaya ikan lele sistem bioflok di lahan sempit sukses ini mengajarkan kita untuk selalu mengecek mesin aerator agar tidak mati mendadak. Jika Anda mengikuti kiat cara budidaya ikan lele sistem bioflok di lahan sempit sukses ini, ikan lele Anda akan cepat besar dan gemuk-gemuk semua saat panen nanti.

## Hasil Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit Banyak
Pencapaian hasil cara budidaya ikan lele sistem bioflok di lahan sempit banyak tentu akan mendatangkan keuntungan yang sangat berlipat ganda. Hasil cara budidaya ikan lele sistem bioflok di lahan sempit banyak ini bisa langsung dijual ke pedagang pasar tradisional terdekat. Jangan heran melihat hasil cara budidaya ikan lele sistem bioflok di lahan sempit banyak yang membuat tetangga Anda merasa kagum.

## Catatan Cara Budidaya Ikan Lele Sistem Bioflok di Lahan Sempit Untung
Sebagai kesimpulan, catatan cara budidaya ikan lele sistem bioflok di lahan sempit untung besar harus dijalankan dengan sabar dan tekun setiap waktu. Kesimpulannya adalah bahwa cara budidaya ikan lele sistem bioflok di lahan sempit merupakan terobosan agribisnis masa depan yang menjanjikan. Semoga ulasan cara budidaya ini bermanfaat bagi Anda yang ingin menjadi pengusaha ikan sukses."""
    },

    # ---------------- 14. Email Bisnis (Komunikasi) ----------------
    {
        "id": "draft-27",
        "category": "Komunikasi Bisnis & Karier",
        "target_query": "etika komunikasi profesional dalam email bisnis",
        "draft_title": "Korespondensi Formal Dunia Korporat: Ketepatan Baris Subjek, Struktur Pembuka Santun, dan Kejelasan Panggilan Bertindak",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Kosakata komunikasi korporat berkelas (MATTR > 0.60), HKO 0% <= 40%, tata bahasa tertata tanpa repetisi klise.",
        "draft_content": """Kemampuan menyusun pesan elektronik bernada profesional merupakan representasi langsung dari reputasi kompetensi intelektual dan etika kerja seorang profesional di lingkungan industri modern. Meskipun platform perpesanan instan kian mendominasi koordinasi harian, media surat elektronik atau email tetap menjadi saluran resmi utama dalam pertukaran dokumen legal, pengajuan proposal kemitraan bisnis, dan negosiasi strategis antar-perusahaan. Keteledoran kecil dalam merangkai kata atau struktur pesan dapat menimbulkan interpretasi keliru yang berpotensi merusak relasi kemitraan yang bernilai tinggi.

## Perumusan Judul Surel Spesifik dan Ringkas Menggambarkan Urgensi
Pintu gerbang efektivitas komunikasi bermula dari baris subjek surel yang ringkas namun sarat konteks informatif. Penerima pesan di level eksekutif menerima puluhan surat setiap jamnya, sehingga subjek yang ambigu seperti mohon bantuan atau halo akan diabaikan atau masuk ke folder spam. Formulasikan baris subjek yang memuat kata kunci aksi, nama proyek spesifik, dan tenggat waktu respon yang diharapkan secara lugas agar penerima dapat langsung memprioritaskan urgensi pembacaan pesan Anda di tengah kesibukan mereka.

## Salam Penghormatan Sesuai Jenjang Kemitraan Antar-Lembaga
Awali tubuh pesan dengan kalimat pembuka santun yang mencerminkan etika penghargaan terhadap posisi lawan bicara. Gunakan salam resmi diikuti gelar profesional atau nama lengkap mitra kerja; hindari pemakaian sapaan kasual seperti halo kawan atau sapaan santai lainnya dalam korespondensi tingkat awal. Tunjukkan apresiasi singkat atas kerja sama yang telah berjalan sebelum langsung memaparkan pokok pembicaraan utama, guna menciptakan atmosfer dialog kemitraan yang konstruktif dan bersahabat.

## Penyampaian Maksud Utama Secara Lugas Tanpa Ambiguitas Frasa
Efisiensi waktu mitra bisnis menuntut penyusunan paragraf isi yang padat, berorientasi solusi, dan bebas dari basa-basi retorika yang bertele-tele. Paparkan konteks permasalahan pada kalimat pembuka, kemudian uraikan rincian data penting menggunakan daftar butir bernomor untuk memudahkan pemindaian visual. Pilih diksi formal yang objektif dan hindari penulisan kalimat berhuruf kapital penuh atau tanda seru berulang yang dapat dipersepsikan sebagai ekspresi kemarahan atau ketidaksopanan emosional di ruang kerja virtual.

## Penutupan Profesional Serta Penambahan Tanda Tangan Digital Terverifikasi
Akhiri komunikasi dengan ajakan bertindak yang tegas mengenai langkah koordinasi lanjutan yang diharapkan, dilengkapi dengan batas waktu konfirmasi yang realistis. Bubuhkan salam penutup formal yang konsisten, disusul blok tanda tangan digital korporat yang memuat nama lengkap, jabatan resmi divisi, nama institusi, serta tautan kontak telepon dan situs perusahaan yang terverifikasi. Transparansi identitas ini mempertegas legitimasi kredibilitas organisasi Anda di mata seluruh pemangku kepentingan industri."""
    },
    {
        "id": "draft-28",
        "category": "Komunikasi Bisnis & Karier",
        "target_query": "etika komunikasi profesional dalam email bisnis",
        "draft_title": "Etika Komunikasi Profesional dalam Email Bisnis yang Harus Dipahami",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa pembuka AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya bagaimana cara menulis surat elektronik yang baik di kantor. Tidak dapat dipungkiri bahwa berkirim surat adalah hal yang sangat penting untuk kita ketahui bersama aturannya. Seperti yang kita ketahui, jika menulis surat dengan sembarangan maka rekan kerja kita bisa merasa tersinggung dan marah sekali. Dalam artikel kali ini, mari kita simak pembahasannya secara tuntas mengenai tata krama surat kantor yang sangat penting ini agar komunikasi kita lancar dan tidak ada salah paham.

## Macam Etika Komunikasi Profesional dalam Email Bisnis Kantor
Mengenal macam etika komunikasi profesional dalam email bisnis kantor sangat bermanfaat bagi staf baru. Tanpa adanya macam etika komunikasi profesional dalam email bisnis kantor, suasana kerja bisa menjadi kacau dan tidak nyaman. Berbagai macam etika komunikasi profesional dalam email bisnis kantor ini mengajarkan kita untuk selalu bersikap sopan kepada atasan. Oleh karena itu, pelajari macam etika komunikasi profesional dalam email bisnis kantor ini dengan sungguh-sungguh demi kelancaran koordinasi kerja di kantor setiap waktu.

## Manfaat Etika Komunikasi Profesional dalam Email Bisnis Rekan
Ada banyak sekali manfaat etika komunikasi profesional dalam email bisnis rekan kerja yang bisa kita dapatkan. Manfaat etika komunikasi profesional dalam email bisnis rekan membuat kita terlihat lebih pintar dan berwibawa di mata bos. Selain itu, manfaat etika komunikasi profesional dalam email bisnis rekan juga mempercepat pekerjaan selesai tepat waktu. Jangan pernah meremehkan manfaat etika komunikasi profesional dalam email bisnis rekan ini di tempat kerja Anda.

## Syarat Etika Komunikasi Profesional dalam Email Bisnis Tepat
Penerapan syarat etika komunikasi profesional dalam email bisnis tepat harus dimulai dari menulis salam di baris awal. Syarat etika komunikasi profesional dalam email bisnis tepat ini sangat mendasar namun sering dilupakan orang. Pastikan Anda selalu mematuhi syarat etika komunikasi profesional dalam email bisnis tepat agar tidak dimarahi pimpinan divisi Anda. Telitilah kembali setiap kalimat sebelum menekan tombol kirim email kantor.

## Penutup Etika Komunikasi Profesional dalam Email Bisnis Kerja
Sebagai kesimpulan, penutup etika komunikasi profesional dalam email bisnis kerja harus diakhiri dengan ucapan terima kasih yang tulus. Kesimpulannya adalah bahwa etika komunikasi profesional dalam email bisnis menjadi cermin kepribadian seorang pekerja yang bermutu. Tak heran jika etika komunikasi profesional dalam email bisnis selalu diajarkan di pelatihan kantor. Terapkanlah selalu etika komunikasi profesional dalam email bisnis ini. Semoga ulasan artikel ini berguna bagi karir masa depan Anda."""
    },

    # ---------------- 15. Luka Bakar Ringan (Medis Darurat) ----------------
    {
        "id": "draft-29",
        "category": "Medis Darurat & Keselamatan Rumah Tangga",
        "target_query": "langkah pertolongan pertama pada luka bakar ringan di rumah",
        "draft_title": "Penatalaksanaan Darurat Termal Derajat Satu: Pendinginan Aliran Air Mengalir, Sterilisasi Lesi, dan Larangan Mengoles Zat Berminyak",
        "ground_truth_label": "Layak Terbit",
        "expert_notes": "Penjelasan medis darurat berbasis bukti klinis (MATTR > 0.60), HKO 0% <= 40%, instruksi pertolongan pertama presisi.",
        "draft_content": """Insiden cedera termal berkategori ringan kerap terjadi tanpa terduga di lingkungan domestik keluarga, mulai dari kontak sesaat kulit dengan percikan minyak panas penggorengan, uap air mendidih panci, hingga sengatan panas setrika pakaian. Trauma termal derajat pertama ini umumnya merusak lapisan terluar epidermis kulit, ditandai oleh reaksi eritema kemerahan lokal, rasa nyeri menyengat perih, dan pembengkakan ringan tanpa pembentukan bula cairan melepuh. Penanganan awal yang tepat dalam hitungan menit pertama pascakejadian sangat menentukan dalam membatasi perluasan kerusakan jaringan kulit yang lebih dalam.

## Evaluasi Kedalaman Kerusakan Jaringan Dermis dan Epidermis Kulit
Langkah identifikasi permulaan adalah memastikan derajat keparahan luka bakar yang dialami korban. Apabila area kulit yang terdampak hanya mengalami perubahan warna kemerahan kering tanpa adanya gelembung kulit melepuh dan luas cakupannya tidak melampaui area telapak tangan, cedera tersebut diklasifikasikan sebagai luka bakar superfisial derajat satu yang aman dirawat secara mandiri di rumah. Namun jika timbul lepuhan kulit berisi cairan bening atau terjadi pada organ sensitif wajah dan persendian, rujukan medis ke unit gawat darurat wajib segera dilakukan.

## Penurunan Suhu Jaringan Menggunakan Air Keran Suhu Ruang Selama Duapuluh Menit
Tindakan terapeutik utama yang wajib segera dieksekusi adalah mengalirkan air bersih bersuhu ruang mengalir langsung di atas permukaan luka selama lima belas hingga dua puluh menit penuh. Hindari penggunaan es batu atau air beku bersuhu ekstrem, karena paparan dingin mendadak justru memicu vasokonstriksi kapiler darah hebat dan memperparah iskemia nekrosis jaringan sel kulit yang baru saja terbakar. Pengaliran air bersuhu sejuk ini berfungsi meredakan akumulasi panas laten serta mematirasakan ujung serabut saraf sensorik yang teriritasi.

## Proteksi Permukaan Lesi Menggunakan Kasa Steril Kering Non-Lengket
Setelah sensasi panas terbakar mereda sempurna, tepuk-tepuk lembut kulit di sekitar lesi menggunakan handuk bersih tanpa menggosok permukaan luka yang sensitif. Oleskan gel lidah buaya murni atau salep luka bakar antiseptik tipis-tipis guna menjaga kelembaban fisiologis kulit selama fase epitelisasi awal. Tutup area luka dengan pembalut kasa steril non-lengket dan rekatkan memakai plester medis secara longgar untuk mencegah kontaminasi debu dan gesekan mekanis pakaian kotor.

## Bahaya Praktik Tradisional Mengoleskan Pasta Gigi Maupun Mentega
Sangat krusial untuk meluruskan mitos pengobatan tradisional yang menganjurkan pengolesan pasta gigi, mentega dapur, kecap, atau tepung terigu pada kulit yang baru terbakar. Zat-zat berminyak dan bersifat abrasif tersebut justru memerangkap suhu panas di dalam pori-pori dermis serta menjadi media subur bagi kolonisasi infeksi bakteri oportunistik sekunder. Patuhilah protokol medis pertolongan pertama berbasis bukti klinis demi menjamin pemulihan integritas lapisan kulit yang cepat tanpa menyisakan jaringan parut bekas luka."""
    },
    {
        "id": "draft-30",
        "category": "Medis Darurat & Keselamatan Rumah Tangga",
        "target_query": "langkah pertolongan pertama pada luka bakar ringan di rumah",
        "draft_title": "Langkah Pertolongan Pertama pada Luka Bakar Ringan di Rumah Cepat",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100%, repetisi kata berulang, frasa pembuka AI generik, MATTR rendah.",
        "draft_content": """Di era digital saat ini, banyak orang yang bertanya apa yang harus dilakukan saat tangan terkena benda panas di dapur. Tidak dapat dipungkiri bahwa kecelakaan di rumah adalah hal yang sangat penting untuk kita ketahui bersama penanganannya. Seperti yang kita ketahui, jika tangan terkena wajan panas rasanya sangat perih dan sakit sekali di kulit. Dalam artikel kali ini, mari kita simak pembahasannya secara tuntas mengenai cara menolong anggota keluarga yang terkena musibah ini.

## Urutan Langkah Pertolongan Pertama pada Luka Bakar Ringan di Rumah
Mengetahui urutan langkah pertolongan pertama pada luka bakar ringan di rumah adalah kewajiban setiap orang tua. Tanpa urutan langkah pertolongan pertama pada luka bakar ringan di rumah yang benar, luka di kulit anak bisa bertambah parah dan infeksi kuman. Urutan langkah pertolongan pertama pada luka bakar ringan di rumah sangat gampang diikuti oleh siapa saja. Selalu ingat urutan langkah pertolongan pertama pada luka bakar ringan di rumah ini demi keselamatan keluarga Anda.

## Panduan Langkah Pertolongan Pertama pada Luka Bakar Ringan di Rumah
Dalam membaca panduan langkah pertolongan pertama pada luka bakar ringan di rumah, hal pertama yang harus dicari adalah air mengalir. Panduan langkah pertolongan pertama pada luka bakar ringan di rumah melarang kita untuk panik berlebihan saat kejadian berlangsung. Ikuti panduan langkah pertolongan pertama pada luka bakar ringan di rumah ini agar rasa sakit perih di kulit segera hilang dengan cepat.

## Saran Langkah Pertolongan Pertama pada Luka Bakar Ringan di Rumah
Salah satu saran langkah pertolongan pertama pada luka bakar ringan di rumah adalah menutup luka dengan perban kain yang bersih. Jangan abaikan saran langkah pertolongan pertama pada luka bakar ringan di rumah ini agar debu kotor tidak masuk ke dalam luka. Mintalah bantuan orang lain untuk menjalankan saran langkah pertolongan pertama pada luka bakar ringan di rumah ini bila Anda merasa takut.

## Akhir Langkah Pertolongan Pertama pada Luka Bakar Ringan di Rumah
Sebagai kesimpulan, akhir langkah pertolongan pertama pada luka bakar ringan di rumah harus dievaluasi apakah perlu dibawa ke dokter atau tidak. Kesimpulannya adalah bahwa langkah pertolongan pertama pada luka bakar ringan di rumah menjadi panduan darurat yang sangat berguna di setiap rumah tangga. Tak heran jika materi ini sangat dicari pembaca. Semoga artikel darurat ini bermanfaat bagi Anda semua."""
    }
]


def verify_and_save():
    print(f"Total drafts to compile: {len(DRAFTS)}")
    assert len(DRAFTS) == 30, f"Expected exactly 30 drafts, got {len(DRAFTS)}"

    layak_count = 0
    revisi_count = 0

    for d in DRAFTS:
        content = d["draft_content"]
        words = re.findall(r"\b\w+\b", content)
        w_count = len(words)
        d["word_count"] = w_count

        # Compute stylometrics
        st = calculate_stylometrics(content, d["target_query"])
        d["mattr_score"] = st["mattr_score"]
        d["ttr_score"] = st["ttr_score"]
        d["hko_percentage"] = st["hko_percentage"]

        print(f"[{d['id']}] {d['ground_truth_label']:12} | Words: {w_count:3} | MATTR: {st['mattr_score']:.4f} | HKO: {st['hko_percentage']:5.1f}% | Title: {d['draft_title'][:40]}...")

        # Strict checks
        assert 350 <= w_count <= 800, f"[{d['id']}] Word count {w_count} outside [350, 800]"

        if d["ground_truth_label"] == "Layak Terbit":
            layak_count += 1
            assert st["mattr_score"] > 0.55, f"[{d['id']}] Layak Terbit MATTR {st['mattr_score']} <= 0.55"
            assert st["hko_percentage"] <= 40.0, f"[{d['id']}] Layak Terbit HKO {st['hko_percentage']}% > 40%"
        elif d["ground_truth_label"] == "Perlu Revisi":
            revisi_count += 1
            # Perlu Revisi must trigger at least one failure condition: HKO > 40% OR MATTR < 0.50
            assert st["hko_percentage"] > 40.0 or st["mattr_score"] < 0.50, f"[{d['id']}] Perlu Revisi has neither HKO > 40% nor MATTR < 0.50"

    assert layak_count == 15, f"Expected 15 Layak Terbit, got {layak_count}"
    assert revisi_count == 15, f"Expected 15 Perlu Revisi, got {revisi_count}"

    out_path = os.path.join(BASE_DIR, "tests", "fixtures", "dataset_30_drafts.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(DRAFTS, f, indent=2, ensure_ascii=False)

    print(f"\nSUCCESS: 30 deterministic drafts verified and saved to {out_path}!")


if __name__ == "__main__":
    verify_and_save()
