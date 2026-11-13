import copy
import re
from typing import Any, Dict, List

# --- Built-in Indonesian Curated Fallback Corpus (Tahap 4 DSRM & 100% Offline Testing) ---
# Mencakup 15 Topik Ilmiah Lintas Disiplin dengan Korpus Kompetitor Riil & Domain Spesifik
CURATED_FALLBACK_BENCHMARKS: Dict[str, List[Dict[str, Any]]] = {
    # 01. Kuliner & Tata Boga
    "kopi tubruk": [
        {
            "rank_position": 1,
            "page_title": "Panduan Lengkap Cara Membuat Kopi Tubruk Tradisional yang Nikmat",
            "source_url": "https://id.example.com/kopi-tubruk-nikmat",
            "domain_name": "id.example.com",
            "snippet_text": "Kopi tubruk tradisional khas Nusantara diseduh dengan air mendidih bersuhu 90-95 derajat celcius tanpa saringan.",
            "clean_text": """Kopi tubruk adalah metode penyeduhan kopi paling sederhana dan merakyat di Indonesia. Cara membuat kopi tubruk sangat mudah, cukup tuangkan air panas ke dalam cangkir berisi bubuk kopi halus atau medium. Suhu air ideal untuk menyeduh kopi tubruk berkisar antara 90 hingga 95 derajat Celsius agar cita rasa tidak gosong. Rasio seduh standar biasanya menggunakan 1 banding 15, yakni sepuluh gram bubuk kopi untuk seratus lima puluh mililiter air mendidih. Setelah dituang, diamkan kopi selama empat menit hingga ampas kopi mengendap sempurna ke dasar cangkir sebelum dinikmati bersama camilan tradisional. Karakter rasa kopi tubruk sangat pekat dengan tingkat keasaman yang seimbang jika menggunakan biji kopi pilihan.""",
            "headings": [
                {"level": "H1", "text": "Cara Membuat Kopi Tubruk Tradisional yang Nikmat"},
                {"level": "H2", "text": "Suhu Air dan Rasio Seduh Kopi Tubruk"},
                {"level": "H2", "text": "Langkah Menyeduh Kopi Tubruk Tanpa Ampas"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Rahasia Seduhan Kopi Tubruk Mantap dan Tips Ampas Mengendap",
            "source_url": "https://resepkopi.example.id/tubruk-mantap",
            "domain_name": "resepkopi.example.id",
            "snippet_text": "Kunci rasa kopi tubruk mantap terletak pada kesegaran bubuk kopi dan durasi mendiamkan seduhan.",
            "clean_text": """Menikmati secangkir kopi tubruk merupakan kebiasaan turun temurun masyarakat di berbagai penjuru tanah air. Bahan utamanya hanya bubuk kopi robusta atau arabika murni dan air panas berkualitas. Kunci kenikmatan kopi tubruk ada pada waktu tunggu ekstraksi. Saat air panas dituangkan, terjadi proses blooming yang melepaskan aroma wangi karamel dan cokelat. Jangan langsung mengaduk kopi terlalu kencang. Aduk perlahan tiga kali lalu biarkan selama empat hingga lima menit agar ampas turun ke dasar gelas. Penggunaan takaran gula tebu alami secukupnya juga dapat menambah kenikmatan rasa tanpa menghilangkan karakter asli kopi.""",
            "headings": [
                {"level": "H1", "text": "Rahasia Seduhan Kopi Tubruk Mantap"},
                {"level": "H2", "text": "Waktu Ekstraksi dan Blooming Kopi"},
                {"level": "H3", "text": "Memilih Gula Alami Pendamping Kopi"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Perbedaan Kopi Tubruk Robusta dan Arabika untuk Pemula",
            "source_url": "https://barista.example.id/kopi-tubruk-robusta-arabika",
            "domain_name": "barista.example.id",
            "snippet_text": "Perbedaan karakter rasa antara robusta dan arabika ketika diseduh dengan cara tubruk tradisional.",
            "clean_text": """Pencinta kopi tubruk sering memperdebatkan mana yang lebih sedap antara varietas robusta atau arabika. Kopi tubruk robusta dikenal memiliki kadar kafein lebih tinggi, kekentalan tebal, dan aroma cokelat gelap yang kuat. Sebaliknya, kopi tubruk arabika menghadirkan aroma buah segar dan keasaman lembut yang elegan. Untuk menghasilkan seduhan yang seimbang, banyak kedai kopi tradisional mencampurkan blend robusta dan arabika dengan perbandingan 70:30. Pastikan air yang digunakan bebas dari kaporit agar kejernihan rasa dan keharuman kopi tubruk tetap terjaga secara sempurna.""",
            "headings": [
                {"level": "H1", "text": "Perbedaan Kopi Tubruk Robusta dan Arabika"},
                {"level": "H2", "text": "Karakteristik Rasa Robusta dan Arabika"},
                {"level": "H2", "text": "Tips Kualitas Air Seduh Bebas Bau"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 02. Kesehatan & Kedokteran
    "kanker serviks": [
        {
            "rank_position": 1,
            "page_title": "Mengenal Gejala Kanker Serviks Stadium Awal dan Pencegahannya",
            "source_url": "https://kesehatan.example.id/kanker-serviks-gejala",
            "domain_name": "kesehatan.example.id",
            "snippet_text": "Kanker serviks disebabkan oleh infeksi Human Papillomavirus (HPV) dan dapat dicegah dengan vaksinasi.",
            "clean_text": """Kanker serviks atau leher rahim merupakan salah satu penyakit ganas yang paling banyak dialami wanita di seluruh dunia. Sebagian besar kasus kanker serviks disebabkan oleh infeksi menular persisten dari virus Human Papillomavirus tipe 16 dan 18. Pada tahap awal, kanker serviks sering kali tidak menunjukkan gejala nyata sehingga dijuluki silent killer. Gejala lanjutan meliputi perdarahan abnormal setelah berhubungan seksual, keputihan berbau tidak sedap, serta nyeri panggul. Pencegahan primer dapat dilakukan dengan imunisasi vaksin HPV sejak usia remaja, sedangkan deteksi dini dilakukan melalui pemeriksaan pap smear secara teratur setiap tiga tahun.""",
            "headings": [
                {"level": "H1", "text": "Mengenal Gejala Kanker Serviks Stadium Awal"},
                {"level": "H2", "text": "Penyebab Infeksi Human Papillomavirus HPV"},
                {"level": "H2", "text": "Vaksinasi HPV dan Pemeriksaan Pap Smear"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Pentingnya Skrining Pap Smear dan Tes IVA untuk Deteksi Dini",
            "source_url": "https://medis.example.id/skrining-pap-smear-iva",
            "domain_name": "medis.example.id",
            "snippet_text": "Pemeriksaan pap smear dan inspeksi visual asam asetat IVA sangat efektif menemukan lesi prakanker.",
            "clean_text": """Deteksi dini merupakan kunci utama menurunkan angka kematian akibat kanker serviks. Terdapat dua metode skrining yang umum dilakukan di fasilitas pelayanan kesehatan, yaitu pap smear sitologi dan inspeksi visual dengan asam asetat atau tes IVA. Tes IVA lebih praktis dan terjangkau di tingkat puskesmas untuk melihat perubahan warna epitel serviks. Apabila ditemukan lesi prakanker, tindakan medis seperti krioterapi dapat segera dilakukan sebelum sel berkembang menjadi tumor ganas stadium lanjut. Wanita yang aktif secara seksual disarankan melakukan pemeriksaan berkala minimal satu kali dalam setahun.""",
            "headings": [
                {"level": "H1", "text": "Pentingnya Skrining Pap Smear dan Tes IVA"},
                {"level": "H2", "text": "Metode Pemeriksaan di Fasilitas Kesehatan"},
                {"level": "H3", "text": "Tindakan Medis Lesi Prakanker"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Faktor Risiko Kanker Leher Rahim dan Pola Hidup Sehat",
            "source_url": "https://klinikwanita.example.id/faktor-risiko-kanker-serviks",
            "domain_name": "klinikwanita.example.id",
            "snippet_text": "Faktor risiko meliputi kebiasaan merokok, sistem imun lemah, dan hubungan seksual tanpa proteksi.",
            "clean_text": """Selain infeksi virus HPV, ada sejumlah faktor risiko yang mempercepat perkembangan kanker serviks pada wanita. Kebiasaan merokok menurunkan daya tahan membran mukosa serviks sehingga virus lebih mudah menginfeksi sel target. Penurunan sistem imun pada penderita penyakit kronis juga memperburuk prognosis infeksi. Untuk mencegah komplikasi, para pakar medis menyarankan gaya hidup bersih, menjaga higienitas organ reproduksi, mengonsumsi makanan kaya antioksidan, dan setia pada pasangan. Konsultasi segera dengan dokter spesialis obstetri ginekologi bila mengalami flek darah tidak wajar.""",
            "headings": [
                {"level": "H1", "text": "Faktor Risiko Kanker Leher Rahim"},
                {"level": "H2", "text": "Pengaruh Gaya Hidup dan Kebiasaan Merokok"},
                {"level": "H2", "text": "Konsultasi Dokter Spesialis Ginekologi"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 03. Teknologi & Pemasaran Digital
    "seo on page": [
        {
            "rank_position": 1,
            "page_title": "Panduan Praktis SEO On-Page untuk Artikel Blog",
            "source_url": "https://digitalmarketing.example.id/seo-on-page",
            "domain_name": "digitalmarketing.example.id",
            "snippet_text": "Optimasi mesin pencari Google memerlukan penerapan kata kunci yang tepat pada judul dan heading.",
            "clean_text": """Search Engine Optimization atau SEO adalah strategi mengoptimalkan konten situs web agar mendapatkan peringkat teratas di mesin pencari seperti Google. Pada SEO On-Page, struktur artikel memegang peranan krusial. Kata kunci utama harus ditempatkan secara alami pada judul H1, paragraf pembuka, serta beberapa sub-judul H2 dan H3. Jangan melakukan manipulasi keyword stuffing karena algoritma Google semakin cerdas menilai kualitas relevansi tulisan. Optimasi kecepatan memuat halaman, penambahan gambar berukuran proporsional dengan alt text deskriptif, dan tautan internal internal links juga sangat mendukung performa peringkat organik website.""",
            "headings": [
                {"level": "H1", "text": "Panduan Praktis SEO On-Page untuk Artikel"},
                {"level": "H2", "text": "Penempatan Kata Kunci pada Heading dan Teks"},
                {"level": "H2", "text": "Kecepatan Website dan Tautan Internal"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Cara Menulis Konten Orisinal Sesuai Pedoman Helpful Content Google",
            "source_url": "https://kontencreator.example.id/google-helpful-content",
            "domain_name": "kontencreator.example.id",
            "snippet_text": "Sistem Google Helpful Content mengutamakan artikel bermanfaat yang menyajikan wawasan orisinal.",
            "clean_text": """Pembaruan sistem Google Helpful Content dirancang untuk memberi penghargaan pada konten yang dibuat khusus untuk manusia, bukan semata-mata untuk memanipulasi mesin pencari. Artikel yang hanya menyadur atau merangkum ulang konten kompetitor tanpa nilai tambah kini sulit mendapatkan peringkat yang baik. Pembuat konten harus menyajikan sudut pandang unik, data pengalaman langsung first-hand experience, atau riset mendalam. Evaluasi artikel Anda sebelum terbit dengan memastikan naskah menjawab tuntas niat pencarian search intent pengunjung dan tidak memuat frasa generik klise yang berulang.""",
            "headings": [
                {"level": "H1", "text": "Cara Menulis Konten Orisinal Google Helpful Content"},
                {"level": "H2", "text": "Nilai Tambah dan First-Hand Experience"},
                {"level": "H3", "text": "Evaluasi Niat Pencarian Search Intent"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Strategi Riset Kata Kunci dan Analisis Celah Kompetitor",
            "source_url": "https://seotools.example.id/riset-keyword-kompetitor",
            "domain_name": "seotools.example.id",
            "snippet_text": "Menemukan celah kata kunci Information Gain dari hasil pencarian kompetitor teratas.",
            "clean_text": """Sebelum menulis draf artikel, analisis mendalam terhadap halaman hasil pencarian Google SERP merupakan langkah fundamental. Identifikasi sepuluh artikel kompetitor teratas untuk memetakan sub-topik apa saja yang telah dibahas secara luas. Cari tahu apa yang belum mereka jelaskan secara komprehensif, inilah yang disebut dengan celah topik information gain. Menutup celah tersebut dalam draf artikel Anda akan memberikan kebaruan semantik yang sangat diapresiasi oleh pembaca dan perayap web crawler. Gunakan variasi leksikal yang kaya dan hindari repetisi istilah berlebihan.""",
            "headings": [
                {"level": "H1", "text": "Strategi Riset Kata Kunci dan Analisis Celah"},
                {"level": "H2", "text": "Memetakan Sub-Topik Sepuluh Besar SERP"},
                {"level": "H2", "text": "Memanfaatkan Celah Information Gain"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],
    "seo web": [],  # Alias yang mengarah ke seo on page jika dicari

    # 04. Pertanian & Tanaman Hias
    "monstera": [
        {
            "rank_position": 1,
            "page_title": "Panduan Lengkap Merawat Monstera Deliciosa Agar Daun Lebar dan Membelah",
            "source_url": "https://tanamanhias.example.id/merawat-monstera-deliciosa",
            "domain_name": "tanamanhias.example.id",
            "snippet_text": "Monstera deliciosa memerlukan media tanam porous dan pencahayaan terang tidak langsung untuk membelah daun.",
            "clean_text": """Monstera deliciosa merupakan tanaman hias tropis yang sangat digemari karena keindahan daunnya yang berlubang dan membelah secara alami atau fenestration. Agar tanaman tumbuh subur dan rimbun, gunakan media tanam yang memiliki porositas tinggi seperti campuran sekam bakar, perlite, cocopeat, dan pecahan kulit kayu pinus. Tempatkan pot di area yang memperoleh intensitas cahaya terang tidak langsung atau bright indirect light. Paparan sinar matahari terik langsung dapat menyebabkan daun terbakar dan mengering kecokelatan. Jaga kelembaban lingkungan sekitar dengan rutin menyemprotkan air pada helaian daun.""",
            "headings": [
                {"level": "H1", "text": "Panduan Lengkap Merawat Monstera Deliciosa"},
                {"level": "H2", "text": "Komposisi Media Tanam Porous Berkualitas"},
                {"level": "H2", "text": "Kebutuhan Intensitas Cahaya Terang"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Teknik Penyiraman dan Pemupukan Monstera dalam Ruangan",
            "source_url": "https://kebunasri.example.id/penyiraman-pupuk-monstera",
            "domain_name": "kebunasri.example.id",
            "snippet_text": "Hindari busuk akar pada monstera dengan memeriksa kelembaban tanah sebelum menyiram dan berikan pupuk NPK teratur.",
            "clean_text": """Penyiraman berlebih menjadi penyebab utama kematian monstera deliciosa akibat pembusukan akar atau root rot. Periksa kelembaban media tanam dengan menusukkan jari atau alat pengukur kelembaban sedalam lima sentimeter. Siram hanya ketika lapisan atas tanah terasa kering, dan pastikan pot memiliki lubang drainase yang memadai agar air tidak menggenang. Berikan pupuk daun atau pupuk NPK slow release dengan dosis seimbang satu kali setiap bulan selama fase pertumbuhan aktif. Bersihkan debu yang menempel pada daun monstera menggunakan kain mikrofiber lembap agar proses fotosintesis berjalan optimal.""",
            "headings": [
                {"level": "H1", "text": "Teknik Penyiraman dan Pemupukan Monstera"},
                {"level": "H2", "text": "Mencegah Busuk Akar Root Rot"},
                {"level": "H3", "text": "Pemberian Pupuk NPK Dosis Seimbang"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Pemasangan Turus Penyangga dan Pengendalian Hama Tanaman Monstera",
            "source_url": "https://botanika.example.id/turus-dan-hama-monstera",
            "domain_name": "botanika.example.id",
            "snippet_text": "Gunakan turus sabut kelapa untuk memanjat akar angin monstera dan semprotkan neem oil untuk membasmi kutu putih.",
            "clean_text": """Di habitat aslinya, monstera merupakan tanaman merambat yang memanfaatkan akar angin untuk menempel pada batang pohon inang. Pemasangan tiang rambat atau turus berbahan sabut kelapa atau lumut spagnum sangat efektif merangsang pertumbuhan daun menjadi lebih besar dan kokoh. Ikatkan batang monstera secara longgar ke turus agar akar adventif dapat menancap kuat. Waspadai serangan hama seperti kutu putih mealybug, tungau laba-laba, dan thrips. Semprotkan larutan minyak mimba atau neem oil dan sabun insektisida organik secara berkala pada bagian bawah permukaan daun untuk membasmi koloni hama.""",
            "headings": [
                {"level": "H1", "text": "Pemasangan Turus dan Pengendalian Hama Monstera"},
                {"level": "H2", "text": "Manfaat Turus Sabut Kelapa bagi Akar Angin"},
                {"level": "H2", "text": "Pencegahan Hama Kutu Putih dan Neem Oil"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 05. Kesehatan & Fisiologi Tubuh
    "air putih hangat": [
        {
            "rank_position": 1,
            "page_title": "Khasiat Luar Biasa Minum Air Hangat Saat Perut Kosong di Pagi Hari",
            "source_url": "https://kesehatankeluarga.example.id/manfaat-air-hangat-pagi",
            "domain_name": "kesehatankeluarga.example.id",
            "snippet_text": "Minum air hangat di pagi hari merangsang peristaltik usus, membuang racun detoksifikasi, dan memulihkan hidrasi sel.",
            "clean_text": """Memulai hari dengan meminum segelas air putih hangat saat perut masih kosong memiliki segudang manfaat bagi kebugaran tubuh. Setelah tidur selama enam hingga delapan jam tanpa cairan, tubuh mengalami dehidrasi ringan. Air hangat membantu mengembalikan hidrasi selular secara cepat dan lembut tanpa mengejutkan organ lambung. Konsumsi air hangat juga merangsang kontraksi gerakan peristaltik pada saluran pencernaan, sehingga memperlancar buang air besar dan mencegah konstipasi. Selain itu, air hangat membantu proses detoksifikasi alami dengan melarutkan sisa metabolisme racun dan kotoran dalam tubuh.""",
            "headings": [
                {"level": "H1", "text": "Khasiat Minum Air Hangat di Pagi Hari"},
                {"level": "H2", "text": "Mengembalikan Hidrasi Sel Pasca Tidur"},
                {"level": "H2", "text": "Melancarkan Gerak Peristaltik Pencernaan"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Pengaruh Suhu Air Minum terhadap Metabolisme dan Sirkulasi Darah",
            "source_url": "https://fisiologitubuh.example.id/suhu-air-dan-metabolisme",
            "domain_name": "fisiologitubuh.example.id",
            "snippet_text": "Air hangat melancarkan sirkulasi pembuluh darah dan membantu memecah partikel lemak dalam saluran cerna.",
            "clean_text": """Suhu air yang masuk ke dalam lambung berpengaruh langsung terhadap respons termoregulasi tubuh. Air hangat bersuhu suam-suam kuku sekitar 37 hingga 45 derajat Celsius memicu vasodilatasi atau pelebaran pembuluh darah, yang berujung pada meningkatnya aliran sirkulasi oksigen ke seluruh jaringan organ. Dalam proses pencernaan, air hangat membantu mengemulsi dan melarutkan sisa partikel lemak dari makanan yang dikonsumsi sebelumnya. Hal ini meringankan beban kerja enzim lambung dan empedu dalam mencerna nutrisi. Para ahli gizi menyarankan konsumsi air putih hangat secara teratur demi metabolisme yang lebih efisien.""",
            "headings": [
                {"level": "H1", "text": "Pengaruh Suhu Air terhadap Sirkulasi Darah"},
                {"level": "H2", "text": "Vasodilatasi dan Aliran Oksigen Jaringan"},
                {"level": "H3", "text": "Pencernaan Lemak dan Kinerja Enzim Lambung"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Panduan Menjaga Fungsi Ginjal Melalui Kebiasaan Hidrasi Pagi",
            "source_url": "https://nefrologi.example.id/fungsi-ginjal-dan-hidrasi",
            "domain_name": "nefrologi.example.id",
            "snippet_text": "Cukupi kebutuhan cairan tubuh sejak pagi untuk menjaga filtrasi ginjal dan mencegah pembentukan batu kemih.",
            "clean_text": """Organ ginjal bertugas menyaring limbah produk sisa metabolisme dari aliran darah setiap detik tanpa henti. Meminum satu hingga dua gelas air putih hangat di pagi hari sangat mendukung laju filtrasi glomerulus ginjal. Cairan yang cukup mengencerkan konsentrasi garam mineral dan asam urat dalam urine, sehingga menurunkan risiko pembentukan kristal atau batu ginjal. Pastikan air minum yang dikonsumsi telah dimasak matang atau melalui sistem sterilisasi yang higienis bebas kontaminan mikroba. Hindari menambahkan gula pasir atau perisa buatan agar manfaat hidrasi murni air putih tetap maksimal.""",
            "headings": [
                {"level": "H1", "text": "Panduan Menjaga Fungsi Ginjal dengan Hidrasi"},
                {"level": "H2", "text": "Meningkatkan Laju Filtrasi Glomerulus Ginjal"},
                {"level": "H2", "text": "Pencegahan Pengkristalan Batu Ginjal"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 06. Keuangan & Perencanaan Finansial
    "keuangan pribadi": [
        {
            "rank_position": 1,
            "page_title": "Strategi Budgeting Finansial 50 30 20 untuk Gaji Pertama Pemula",
            "source_url": "https://finansialpribadi.example.id/metode-budgeting-50-30-20",
            "domain_name": "finansialpribadi.example.id",
            "snippet_text": "Kelola keuangan pribadi dengan membagi alokasi penghasilan 50% kebutuhan primer, 30% keinginan, dan 20% tabungan investasi.",
            "clean_text": """Bagi pemula yang baru memasuki dunia kerja, mengelola gaji bulanan secara bijak merupakan fondasi kemandirian finansial jangka panjang. Salah satu metode alokasi anggaran yang paling populer dan mudah diterapkan adalah formula budgeting 50-30-20. Alokasikan lima puluh persen penghasilan bersih untuk membiayai kebutuhan primer pokok seperti sewa tempat tinggal, konsumsi makanan harian, utilitas listrik, dan transportasi kerja. Tiga puluh persen dialokasikan untuk pos keinginan gaya hidup dan hiburan secara terukur. Sementara sisa dua puluh persen wajib disisihkan di awal bulan untuk pos tabungan, dana darurat, dan instrumen investasi.""",
            "headings": [
                {"level": "H1", "text": "Strategi Budgeting Finansial 50 30 20 Pemula"},
                {"level": "H2", "text": "Alokasi Pos Kebutuhan Pokok Primer"},
                {"level": "H2", "text": "Menyisihkan Tabungan dan Investasi di Awal"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Pentingnya Membangun Dana Darurat dan Proteksi Asuransi Kesehatan",
            "source_url": "https://cerdasuang.example.id/dana-darurat-dan-asuransi",
            "domain_name": "cerdasuang.example.id",
            "snippet_text": "Siapkan pos dana darurat minimal tiga hingga enam bulan pengeluaran rutin pada instrumen likuid bebas risiko.",
            "clean_text": """Sebelum memutuskan terjun ke instrumen investasi berisiko tinggi seperti saham, prioritas utama perencanaan keuangan adalah membentuk dana darurat atau emergency fund. Besaran dana darurat yang ideal bagi individu lajang adalah tiga hingga enam kali total pengeluaran bulanan. Simpan dana darurat pada instrumen yang memiliki likuiditas tinggi dan aman dari penurunan nilai, seperti rekening tabungan khusus atau reksa dana pasar uang. Dana ini hanya boleh ditarik ketika terjadi musibah tak terduga seperti pemutusan hubungan kerja atau sakit darurat. Lengkapi juga diri Anda dengan proteksi asuransi kesehatan dasar BPJS.""",
            "headings": [
                {"level": "H1", "text": "Pentingnya Membangun Dana Darurat Finansial"},
                {"level": "H2", "text": "Menentukan Besaran Nominal Tiga Bulan Pengeluaran"},
                {"level": "H3", "text": "Instrumen Likuid Tempat Menyimpan Dana Darurat"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Cara Mengontrol Rasio Utang dan Menghindari Jebakan Pinjol Konsumtif",
            "source_url": "https://melekliterasi.example.id/mengontrol-rasio-utang-pinjol",
            "domain_name": "melekliterasi.example.id",
            "snippet_text": "Jaga rasio cicilan utang maksimal tiga puluh persen dari pendapatan dan hindari pinjaman online berbunga tinggi.",
            "clean_text": """Kemudahan akses teknologi finansial sering kali memicu perilaku konsumtif yang berlebihan di kalangan generasi muda. Batasi total beban cicilan bulanan atau debt service ratio maksimal tiga puluh persen dari pendapatan kotor agar arus kas tetap sehat. Hindari penggunaan pinjaman online ilegal atau paylater untuk membeli barang-barang konsumtif yang nilainya terus menyusut. Beban bunga majemuk dan denda keterlambatan yang tinggi dapat merusak skor kredit perbankan dalam Sistem Layanan Informasi Keuangan SLIK OJK. Catat seluruh arus kas pengeluaran harian menggunakan aplikasi pembukuan digital.""",
            "headings": [
                {"level": "H1", "text": "Mengontrol Rasio Utang dan Bahaya Pinjol"},
                {"level": "H2", "text": "Batas Maksimal Debt Service Ratio Tiga Puluh Persen"},
                {"level": "H2", "text": "Pencatatan Arus Kas Pengeluaran Harian"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 07. Gaya Hidup & Kesehatan Mental
    "insomnia": [
        {
            "rank_position": 1,
            "page_title": "Penerapan Pedoman Sleep Hygiene untuk Mengatasi Susah Tidur Malam",
            "source_url": "https://tidurnyenyak.example.id/pedoman-sleep-hygiene",
            "domain_name": "tidurnyenyak.example.id",
            "snippet_text": "Sleep hygiene membantu menyelaraskan ritme sirkadian tubuh melalui jadwal tidur teratur dan lingkungan kamar gelap.",
            "clean_text": """Insomnia merupakan gangguan tidur yang ditandai dengan kesulitan untuk memulai tidur atau mempertahankan lelap sepanjang malam. Salah satu pendekatan non-farmakologis yang paling efektif adalah menerapkan pedoman kebersihan tidur atau sleep hygiene. Kunci utamanya adalah konsistensi jadwal tidur dan bangun pada jam yang sama setiap hari, termasuk di akhir pekan, guna menyelaraskan ritme sirkadian tubuh. Ciptakan suasana kamar tidur yang gelap gulita, hening dari kebisingan, dan bertemperatur sejuk sekitar 20 hingga 23 derajat Celsius. Kondisi tersebut merangsang kelenjar pineal memproduksi hormon melatonin alami.""",
            "headings": [
                {"level": "H1", "text": "Penerapan Pedoman Sleep Hygiene Mengatasi Insomnia"},
                {"level": "H2", "text": "Konsistensi Jadwal dan Ritme Sirkadian"},
                {"level": "H2", "text": "Kondisi Kamar Dingin dan Hormon Melatonin"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Bahaya Blue Light Layar Ponsel dan Teknik Relaksasi Pernapasan 4 7 8",
            "source_url": "https://psikologisehat.example.id/blue-light-dan-relaksasi" ,
            "domain_name": "psikologisehat.example.id",
            "snippet_text": "Hindari paparan sinar biru layar gawai satu jam sebelum tidur dan lakukan latihan pernapasan untuk menurunkan kortisol.",
            "clean_text": """Paparan sinar biru atau blue light dari layar ponsel cerdas, tablet, dan televisi di malam hari menekan sekresi hormon melatonin dan menipu otak seolah hari masih siang. Hentikan penggunaan seluruh perangkat digital minimal enam puluh menit sebelum beranjak ke tempat tidur. Sebagai gantinya, lakukan latihan pernapasan dengan metode empat tujuh delapan. Tarik napas melalui hidung selama empat detik, tahan napas selama tujuh detik, lalu embuskan perlahan melalui mulut selama delapan detik. Teknik ini mengaktifkan sistem saraf parasimpatis, meredakan detak jantung, serta menurunkan hormon stres kortisol.""",
            "headings": [
                {"level": "H1", "text": "Bahaya Blue Light dan Relaksasi Pernapasan"},
                {"level": "H2", "text": "Pembatasan Gawai Sebelum Waktu Tidur"},
                {"level": "H3", "text": "Mekanisme Saraf Parasimpatis Latihan 4 7 8"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Manajemen Konsumsi Kafein dan Rutinitas Relaksasi Menjelang Malam",
            "source_url": "https://kliniktidur.example.id/kafein-dan-rutinitas-malam",
            "domain_name": "kliniktidur.example.id",
            "snippet_text": "Waktu paruh kafein bertahan hingga enam jam dalam tubuh, batasi kopi sore dan lakukan peregangan ringan.",
            "clean_text": """Kafein yang terkandung di dalam kopi, teh pekat, cokelat, dan minuman berenergi bekerja dengan memblokir reseptor adenosin di otak sehingga menimbulkan rasa terjaga. Waktu paruh atau half-life kafein dalam tubuh manusia dapat bertahan antara lima hingga delapan jam. Oleh sebab itu, hindari konsumsi minuman berkafein setelah pukul dua siang. Ganti kebiasaan tersebut dengan menyeduh teh herbal chamomile hangat yang bebas kafein. Bangun rutinitas malam yang menenangkan seperti mandi air hangat, membaca buku cetak, atau melakukan peregangan yoga ringan untuk mempersiapkan otot tubuh memasuki fase istirahat.""",
            "headings": [
                {"level": "H1", "text": "Manajemen Kafein dan Rutinitas Menjelang Tidur"},
                {"level": "H2", "text": "Waktu Paruh Kafein dan Reseptor Adenosin Otak"},
                {"level": "H2", "text": "Minuman Herbal Chamomile dan Mandi Hangat"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 08. Otomotif & Energi Terbarukan
    "mobil listrik": [
        {
            "rank_position": 1,
            "page_title": "Perbandingan Efisiensi Energi Motor Listrik EV vs Mesin Bensin ICE",
            "source_url": "https://otomotifmasa-depan.example.id/efisiensi-mobil-listrik-vs-bensin",
            "domain_name": "otomotifmasa-depan.example.id",
            "snippet_text": "Mobil listrik mengonversi lebih dari 80 persen energi baterai menjadi daya gerak roda tanpa emisi gas buang.",
            "clean_text": """Transisi mobilitas dari kendaraan berbahan bakar fosil internal combustion engine menuju kendaraan listrik berbasis baterai electric vehicle didorong oleh keunggulan efisiensi energi. Motor listrik sanggup mengonversi lebih dari delapan puluh lima persen energi listrik yang tersimpan dalam paket baterai menjadi tenaga putaran roda. Sebaliknya, mesin bensin konvensional hanya mampu mengubah sekitar dua puluh hingga tiga puluh persen energi bahan bakar, sementara sisanya terbuang percuma sebagai energi panas dan gesekan mekanis. Selain itu, mobil listrik menghasilkan emisi nol tailpipe sehingga mereduksi polusi udara perkotaan.""",
            "headings": [
                {"level": "H1", "text": "Perbandingan Efisiensi Energi EV vs Mesin ICE"},
                {"level": "H2", "text": "Konversi Daya Baterai Lithium Motor Listrik"},
                {"level": "H2", "text": "Reduksi Emisi Karbon Bebas Polusi Knalpot"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Kelebihan Torsi Instan dan Sistem Pengereman Regeneratif EV",
            "source_url": "https://evindonesia.example.id/torsi-instan-regenerative-braking",
            "domain_name": "evindonesia.example.id",
            "snippet_text": "Motor listrik menghasilkan torsi puncak instan sejak putaran nol dan pengereman regeneratif memulihkan energi.",
            "clean_text": """Pengalaman berkendara pada mobil listrik menawarkan responsivitas yang tidak dimiliki oleh mobil konvensional. Karakteristik motor listrik memungkinkan penyaluran torsi maksimum secara instan dari putaran mesin nol RPM tanpa jeda perpindahan gigi transmisi. Akselerasi mobil terasa sangat halus, senyap tanpa getaran mesin, dan bertenaga. Keunggulan teknologis lainnya adalah fitur regenerative braking atau pengereman regeneratif. Ketika pedal akselerator dilepas, motor listrik bertindak sebagai generator yang memperlambat laju mobil sekaligus memanen kembali energi kinetik untuk mengisi ulang kapasitas baterai.""",
            "headings": [
                {"level": "H1", "text": "Kelebihan Torsi Instan dan Pengereman Regeneratif"},
                {"level": "H2", "text": "Penyaluran Torsi Maksimum Nol RPM Senyap"},
                {"level": "H3", "text": "Pemanenan Energi Kinetik Regenerative Braking"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Analisis Biaya Operasional dan Perawatan Berkala Kendaraan Listrik",
            "source_url": "https://mobilitasbersih.example.id/biaya-servis-dan-pengisian-ev",
            "domain_name": "mobilitasbersih.example.id",
            "snippet_text": "Biaya pengisian daya per kilometer jauh lebih hemat dan komponen servis mobil listrik sangat minim.",
            "clean_text": """Dalam perhitungan jangka panjang, total biaya kepemilikan mobil listrik terbukti jauh lebih ekonomis dibandingkan mobil berbahan bakar minyak. Biaya pengisian daya listrik per kilometer di rumah atau stasiun pengisian kendaraan listrik umum SPKLU hanya sepertiga dari biaya membeli bensin. Dari segi perawatan berkala, mobil listrik tidak memerlukan penggantian oli mesin, busi, filter bahan bakar, maupun timing belt. Dengan jumlah komponen bergerak yang jauh lebih sedikit, risiko keausan mekanis menjadi sangat rendah. Pabrikan otomotif umumnya juga menyertakan garansi paket baterai traksi hingga delapan tahun.""",
            "headings": [
                {"level": "H1", "text": "Analisis Biaya Operasional dan Servis Mobil Listrik"},
                {"level": "H2", "text": "Perhitungan Biaya Pengisian Daya SPKLU vs Bensin"},
                {"level": "H2", "text": "Bebas Ganti Oli Mesin dan Garansi Baterai"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 09. Lingkungan & Daur Ulang Mandiri
    "pupuk kompos": [
        {
            "rank_position": 1,
            "page_title": "Panduan Membuat Pupuk Kompos Organik Rumahan dari Limbah Dapur",
            "source_url": "https://kelolasampah.example.id/kompos-organik-dapur",
            "domain_name": "kelolasampah.example.id",
            "snippet_text": "Daur ulang sisa sayuran dan buah dapur menjadi pupuk kompos kaya hara dengan menjaga rasio karbon nitrogen.",
            "clean_text": """Mengolah sampah organik sisa dapur rumah tangga menjadi pupuk kompos merupakan solusi nyata dalam menekan timbulan limbah ke tempat pembuangan akhir. Kunci keberhasilan proses pengomposan adalah menyeimbangkan rasio karbon dan nitrogen atau C/N ratio sekitar 30 banding 1. Unsur nitrogen atau bahan hijau berasal dari sisa sayuran mentah, kulit buah, dan ampas kopi basah. Sedangkan unsur karbon atau bahan cokelat dapat diperoleh dari daun kering, sekam padi, serbuk gergaji, atau cacahan kardus. Potong bahan organik menjadi ukuran kecil dua hingga tiga sentimeter agar mikroorganisme pengurai bekerja lebih cepat.""",
            "headings": [
                {"level": "H1", "text": "Panduan Membuat Kompos dari Sampah Dapur"},
                {"level": "H2", "text": "Menyeimbangkan Rasio Karbon dan Nitrogen"},
                {"level": "H2", "text": "Pencacahan Bahan Organik Mentah"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Pemanfaatan Bioaktivator EM4 dan Pengaturan Aerasi Komposter",
            "source_url": "https://pertanianorganik.example.id/bioaktivator-em4-aerasi",
            "domain_name": "pertanianorganik.example.id",
            "snippet_text": "Gunakan larutan mikroorganisme EM4 dan pastikan sirkulasi udara lancar pada wadah komposter.",
            "clean_text": """Untuk mempercepat proses dekomposisi bahan organik secara aerobik, penambahan larutan bioaktivator mikroorganisme efektif atau EM4 sangat disarankan. Larutkan dua sendok makan cairan EM4 bersama satu sendok gula merah atau molase ke dalam satu liter air, lalu diamkan selama lima belas menit sebelum disemprotkan merata ke tumpukan kompos. Wadah komposter harus dilengkapi lubang ventilasi udara dan lubang pembuangan lindi di bagian bawah. Balik tumpukan kompos secara berkala satu minggu sekali untuk memasok oksigen bagi bakteri aerob dan mencegah proses fermentasi anaerob yang memicu aroma busuk.""",
            "headings": [
                {"level": "H1", "text": "Pemanfaatan Bioaktivator EM4 dan Aerasi Komposter"},
                {"level": "H2", "text": "Aktivasi Bakteri Pengurai dengan Molase"},
                {"level": "H3", "text": "Pembalikan Tumpukan Kompos Mingguan"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Ciri-Ciri Pupuk Kompos Matang Siap Pakai dan Tips Bebas Belatung",
            "source_url": "https://kebunlestari.example.id/ciri-kompos-matang",
            "domain_name": "kebunlestari.example.id",
            "snippet_text": "Kompos matang ditandai warna cokelat kehitaman, aroma tanah hutan yang segar, dan suhu tumpukan stabil.",
            "clean_text": """Proses pengomposan rumahan biasanya membutuhkan waktu antara empat hingga enam minggu tergantung kelembaban dan suhu lingkungan. Kompos organik yang telah matang sempurna memiliki karakteristik fisik menyerupai tanah humus hutan, berwarna cokelat gelap kehitaman, bertekstur remah gembur, dan beraroma segar tanpa bau amonia menyengat. Suhu tumpukan kembali normal mendekati suhu ruang setelah melewati fase pemanasan termofilik. Untuk mencegah kemunculan lalat dan belatung selama pengomposan, jangan memasukkan sisa daging hewani, minyak goreng, atau tulang ikan, dan selalu tutup tumpukan dengan lapisan tanah gembur.""",
            "headings": [
                {"level": "H1", "text": "Ciri Fisik Kompos Matang dan Tips Bebas Bau"},
                {"level": "H2", "text": "Karakteristik Humus Remah dan Aroma Tanah Hutan"},
                {"level": "H2", "text": "Larangan Memasukkan Bahan Hewani Berlemak"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 10. Teknologi Informasi & Pemrograman
    "pemrograman python": [
        {
            "rank_position": 1,
            "page_title": "Pondasi Bahasa Pemrograman Python: Variabel Tipe Data dan Logika Kontrol",
            "source_url": "https://kodingdasar.example.id/belajar-python-variabel-looping",
            "domain_name": "kodingdasar.example.id",
            "snippet_text": "Pelajari sintaksis bersih Python mulai dari deklarasi variabel dinamis hingga percabangan if dan perulangan for.",
            "clean_text": """Python merupakan bahasa pemrograman tingkat tinggi yang sangat populer karena sintaksisnya yang bersih, ekspresif, dan mudah dibaca menyerupai bahasa Inggris alami. Konsep dasar yang wajib dikuasai seorang pemula mencakup pemahaman tipe data primitif seperti integer, float, string, dan boolean. Berbeda dengan bahasa yang bertipe statis, Python menggunakan sistem dynamic typing sehingga tipe variabel ditentukan otomatis saat runtime. Logika alur program dikendalikan oleh struktur percabangan if elif else serta blok perulangan for loop dan while loop yang mengandalkan blok indentasi spasi yang konsisten.""",
            "headings": [
                {"level": "H1", "text": "Pondasi Dasar Pemrograman Bahasa Python"},
                {"level": "H2", "text": "Tipe Data Primitif dan Dynamic Typing"},
                {"level": "H2", "text": "Struktur Kendali Percabangan dan Indentasi Spasi"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Manipulasi Struktur Data List Tuple Set dan Dictionary di Python",
            "source_url": "https://belajarpython.example.id/struktur-data-list-dict",
            "domain_name": "belajarpython.example.id",
            "snippet_text": "Kuasai penggunaan list mutable, tuple immutable, serta kamus dictionary pasangan key-value dalam Python.",
            "clean_text": """Kekuatan Python terletak pada kemampuannya mengelola struktur data bawaan yang sangat fleksibel dan efisien. Struktur data list bersifat mutable sehingga elemen di dalamnya dapat diubah, ditambah dengan metode append, atau diurutkan. Sebaliknya, tuple bersifat immutable yang cocok digunakan untuk menyimpan data konstanta yang tidak boleh berubah. Untuk operasi himpunan tanpa duplikasi elemen unik, gunakan tipe data set. Sementara tipe data dictionary menyimpan informasi dalam format pasangan kunci dan nilai atau key-value pairs, yang sangat berguna saat memproses format data JSON atau entitas objek dalam pengembangan aplikasi.""",
            "headings": [
                {"level": "H1", "text": "Manipulasi Struktur Data Bawaan Python"},
                {"level": "H2", "text": "Perbedaan Sifat List Mutable dan Tuple Immutable"},
                {"level": "H3", "text": "Penyimpanan Pasangan Kunci Nilai Dictionary"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Menulis Fungsi Modular dan Pengelolaan Virtual Environment Pip",
            "source_url": "https://rekayasapython.example.id/fungsi-modular-virtualenv",
            "domain_name": "rekayasapython.example.id",
            "snippet_text": "Buat fungsi modular dengan kata kunci def dan kelola dependensi pustaka pihak ketiga menggunakan venv dan pip.",
            "clean_text": """Dalam menulis kode program skala besar, prinsip clean code menuntut modularitas melalui pembuatan fungsi reusable. Fungsi dideklarasikan menggunakan kata kunci def dengan parameter input serta mengembalikan nilai menggunakan pernyataan return. Dokumentasikan fungsi Anda menggunakan docstring standar tiga tanda kutip. Untuk menjaga kebersihan sistem operasi dari konflik dependensi pustaka pihak ketiga, biasakan selalu membuat lingkungan virtual atau virtual environment menggunakan modul venv. Instal modul pustaka open-source resmi melalui manajer paket pip dan catat seluruh daftar pustaka pada berkas requirements.txt.""",
            "headings": [
                {"level": "H1", "text": "Menulis Fungsi Modular dan Lingkungan Virtual"},
                {"level": "H2", "text": "Deklarasi Fungsi Def dan Nilai Return"},
                {"level": "H2", "text": "Isolasi Dependensi Modul via Venv dan Pip"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 11. Kesehatan Kerja & Ergonomi Digital
    "kesehatan mata": [
        {
            "rank_position": 1,
            "page_title": "Mencegah Sindrom Penglihatan Komputer dengan Menerapkan Aturan 20-20-20",
            "source_url": "https://oftalmologi.example.id/pencegahan-computer-vision-syndrome",
            "domain_name": "oftalmologi.example.id",
            "snippet_text": "Aturan 20-20-20 merelaksasi otot siliaris mata setiap 20 menit menatap layar monitor komputer.",
            "clean_text": """Menatap layar monitor komputer atau ponsel pintar secara terus-menerus selama berjam-jam dapat memicu keluhan Computer Vision Syndrome atau ketegangan mata digital. Gejala umumnya berupa mata perih, pandangan kabur berbayang, mata merah, serta sakit kepala di area pelipis. Asosiasi dokter mata merekomendasikan penerapan aturan 20-20-20 sebagai langkah mitigasi paling mudah. Setiap dua puluh menit menatap layar kerja, istirahatkan mata Anda selama dua puluh detik dengan mengalihkan pandangan ke objek yang berada pada jarak minimal dua puluh kaki atau sekitar enam meter. Jeda singkat ini memberi waktu bagi otot siliaris mata untuk berelaksasi.""",
            "headings": [
                {"level": "H1", "text": "Mencegah Sindrom Penglihatan Komputer"},
                {"level": "H2", "text": "Gejala Ketegangan Mata Digital Pekerja Layar"},
                {"level": "H2", "text": "Aplikasi Praktis Kaidah Relaksasi 20-20-20"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Mengatasi Mata Kering dan Pentingnya Frekuensi Berkedip Alami",
            "source_url": "https://kesehatanmata.example.id/mengatasi-mata-kering-layar",
            "domain_name": "kesehatanmata.example.id",
            "snippet_text": "Refleks berkedip menurun drastis saat fokus bekerja depan layar, gunakan tetes mata air mata buatan.",
            "clean_text": """Ketika seseorang berkonsentrasi penuh membaca dokumen di depan monitor komputer, frekuensi refleks berkedip alami dapat merosot drastis hingga lima puluh persen. Akibatnya, lapisan air mata yang melumasi permukaan kornea mata menguap dengan cepat, memicu sindrom mata kering atau dry eyes. Mata terasa seperti berpasir, panas, dan mudah lelah. Biasakan berkedip secara sadar dan berkala untuk meratakan lapisan lipid air mata. Jika gejala ketidaknyamanan berlanjut, gunakan obat tetes mata air mata buatan atau artificial tears tanpa kandungan pengawet untuk menjaga kelembaban permukaan kornea secara aman.""",
            "headings": [
                {"level": "H1", "text": "Mengatasi Mata Kering pada Pekerja Digital"},
                {"level": "H2", "text": "Penurunan Frekuensi Berkedip Alami di Depan Layar"},
                {"level": "H3", "text": "Penggunaan Tetes Mata Artificial Tears Bebas Pengawet"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Pengaturan Ergonomi Jarak Monitor dan Filter Blue Light Ruangan",
            "source_url": "https://ergonomikerja.example.id/posisi-monitor-dan-pencahayaan",
            "domain_name": "ergonomikerja.example.id",
            "snippet_text": "Posisikan monitor berjarak 50-70 cm sedikit di bawah garis mata dan atur pencahayaan seimbang bebas silau.",
            "clean_text": """Penataan tata letak ergonomi ruang kerja sangat berpengaruh terhadap kenyamanan indera penglihatan. Letakkan layar monitor komputer pada jarak sekitar lima puluh hingga tujuh puluh sentimeter dari wajah, dengan posisi bagian atas layar sejajar atau sedikit di bawah garis pandang mata horizontal. Sudut kemiringan ke bawah ini mengurangi luas permukaan mata yang terbuka sehingga menekan laju penguapan cairan mata. Atur tingkat kecerahan layar agar seimbang dengan intensitas cahaya di ruangan sekitar untuk mencegah efek silau. Pasang filter pelindung anti silau atau gunakan mode malam untuk memangkas paparan radiasi sinar biru.""",
            "headings": [
                {"level": "H1", "text": "Pengaturan Ergonomi Monitor dan Pencahayaan Ruang"},
                {"level": "H2", "text": "Jarak Ideal Layar Monitor dan Sudut Pandang"},
                {"level": "H2", "text": "Menghilangkan Efek Silau dan Filter Sinar Biru"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 12. Investasi & Pasar Modal
    "reksa dana": [
        {
            "rank_position": 1,
            "page_title": "Karakteristik dan Potensi Reksa Dana Pasar Uang bagi Investor Pemula",
            "source_url": "https://pasarmodal.example.id/karakteristik-reksa-dana-pasar-uang",
            "domain_name": "pasarmodal.example.id",
            "snippet_text": "RDPU mengalokasikan 100% dana ke instrumen pasar uang seperti deposito perbankan dan obligasi jangka pendek.",
            "clean_text": """Bagi generasi muda yang baru mulai belajar berinvestasi, Reksa Dana Pasar Uang atau RDPU merupakan pintu masuk yang sangat aman dan terukur. Karakteristik utama produk ini adalah seluruh dana kelolaan dialokasikan seratus persen ke dalam instrumen pasar uang berisiko sangat rendah, seperti deposito berjangka perbankan nasional dan surat utang obligasi yang jatuh tempo di bawah satu tahun. Portofolio investasi dikelola secara profesional oleh manajer investasi berlisensi resmi. Fluktuasi nilai aktiva bersih per unit penyertaan NAB/UP bergerak stabil naik setiap hari tanpa gejolak tajam layaknya pasar saham.""",
            "headings": [
                {"level": "H1", "text": "Karakteristik Reksa Dana Pasar Uang RDPU"},
                {"level": "H2", "text": "Alokasi Instrumen Deposito dan Obligasi Jangka Pendek"},
                {"level": "H2", "text": "Peran Profesional Manajer Investasi Berlisensi"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Likuiditas Fleksibel dan Bebas Pajak pada Instrumen RDPU",
            "source_url": "https://investasipemula.example.id/likuiditas-bebas-pajak-rdpu",
            "domain_name": "investasipemula.example.id",
            "snippet_text": "Pencairan dana fleksibel tanpa biaya penalti dan imbal hasil bukan merupakan objek pajak penghasilan.",
            "clean_text": """Salah satu daya tarik utama reksa dana pasar uang dibandingkan deposito bank konvensional adalah tingkat likuiditasnya yang tinggi dan fleksibel. Investor dapat mencairkan saldo investasi mereka kapan saja tanpa dikenakan biaya denda penalti atau potongan administrasi, dengan durasi penyelesaian dana satu hingga dua hari kerja bursa. Selain itu, keuntungan imbal hasil return dari reksa dana bukan merupakan objek pemotongan pajak penghasilan atau PPh, berbeda dengan bunga tabungan dan deposito yang dipotong pajak hingga dua puluh persen. Hal ini memaksimalkan pertumbuhan bunga majemuk modal Anda.""",
            "headings": [
                {"level": "H1", "text": "Keunggulan Likuiditas dan Efisiensi Pajak RDPU"},
                {"level": "H2", "text": "Pencairan Tanpa Biaya Penalti Kapan Saja"},
                {"level": "H3", "text": "Bukan Objek Pajak Penghasilan Berbeda dari Bunga Bank"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Aspek Keamanan Pengawasan OJK dan Perlindungan Bank Kustodian",
            "source_url": "https://keuanganaman.example.id/keamanan-reksa-dana-ojk",
            "domain_name": "keuanganaman.example.id",
            "snippet_text": "Dana investor disimpan terpisah di bank kustodian independen dan diawasi ketat oleh Otoritas Jasa Keuangan.",
            "clean_text": """Keamanan modal merupakan faktor terpenting yang wajib dipastikan sebelum menempatkan uang pada produk investasi apa pun. Seluruh manajer investasi dan agen penjual efek reksa dana di Indonesia wajib mengantongi izin resmi dan diawasi secara berkala oleh Otoritas Jasa Keuangan atau OJK. Dana nasabah tidak disimpan di rekening manajer investasi, melainkan dititipkan secara terpisah pada lembaga bank kustodian independen. Pemisahan rekening ini menjamin dana investor tetap aman terlindungi dan tidak dapat disalahgunakan meskipun perusahaan pengelola mengalami likuidasi kebangkrutan.""",
            "headings": [
                {"level": "H1", "text": "Aspek Keamanan Legalitas Reksa Dana Pasar Uang"},
                {"level": "H2", "text": "Regulasi dan Pengawasan Otoritas Jasa Keuangan OJK"},
                {"level": "H2", "text": "Penyimpanan Dana Independen pada Bank Kustodian"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 13. Akuakultur & Wirausaha Agribisnis
    "bioflok": [
        {
            "rank_position": 1,
            "page_title": "Prinsip Dasar Teknologi Bioflok Kolam Terpal untuk Budidaya Lele",
            "source_url": "https://agribisnisikanku.example.id/teknologi-bioflok-lele",
            "domain_name": "agribisnisikanku.example.id",
            "snippet_text": "Teknologi bioflok memanfaatkan mikroorganisme pengurai limbah amonia menjadi flok pakan alami kaya protein.",
            "clean_text": """Budidaya ikan lele dengan teknologi bioflok merupakan terobosan akuakultur modern yang sangat cocok diterapkan di pekarangan rumah berlahan terbatas. Sistem ini mengandalkan kolam terpal bulat dengan kepadatan tebar tinggi mencapai seribu hingga seribu dua ratus ekor per meter kubik air. Inti dari sistem bioflok adalah menumbuhkan mikroorganisme bakteri heterotrof yang mampu mendegradasi limbah kotoran feses ikan dan amonia beracun di dalam air, lalu mengubahnya menjadi gumpalan biomassa atau flok yang kaya protein. Gumpalan flok tersebut dapat dimakan kembali oleh ikan lele sebagai pakan alami tambahan.""",
            "headings": [
                {"level": "H1", "text": "Prinsip Dasar Teknologi Bioflok Budidaya Lele"},
                {"level": "H2", "text": "Pemanfaatan Kolam Terpal Padat Tebar Tinggi"},
                {"level": "H2", "text": "Konversi Limbah Amonia Menjadi Flok Protein Alami"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Pentingnya Aerasi Kontinu dan Pemberian Sumber Karbon Molase",
            "source_url": "https://budidayaakuakultur.example.id/aerasi-dan-molase-bioflok",
            "domain_name": "budidayaakuakultur.example.id",
            "snippet_text": "Sirkulasi oksigen aerator wajib hidup 24 jam dan tambahkan molase untuk menjaga rasio karbon nitrogen di atas 10.",
            "clean_text": """Keberlangsungan ekosistem mikroba di dalam air bioflok sangat bergantung pada pasokan oksigen terlarut yang memadai. Sistem aerasi melalui mesin blower atau aerator venturi wajib menyala tanpa henti selama dua puluh empat jam penuh untuk menjaga kadar dissolved oxygen di atas empat miligram per liter. Selain aerasi, pembudidaya harus rutin menambahkan sumber karbon organik seperti molase tetes tebu atau gula merah bersama kultur probiotik Bacillus. Penambahan karbon ini bertujuan menjaga rasio C/N ratio air kolam di atas sepuluh, sehingga bakteri heterotrof dapat berkembang pesat menekan patogen jahat.""",
            "headings": [
                {"level": "H1", "text": "Aerasi Kontinu dan Pemberian Karbon Molase"},
                {"level": "H2", "text": "Kebutuhan Oksigen Terlarut Mesin Aerator Non-Stop"},
                {"level": "H3", "text": "Pengaturan Rasio Karbon Nitrogen Probiotik Bacillus"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Efisiensi Pakan FCR Rendah dan Manajemen Kualitas Air Kolam Bioflok",
            "source_url": "https://peternakmodern.example.id/fcr-pakan-dan-kualitas-air-bioflok",
            "domain_name": "peternakmodern.example.id",
            "snippet_text": "Bioflok menekan feed conversion ratio di bawah 0.8 dan meminimalkan frekuensi pergantian air kolam.",
            "clean_text": """Keuntungan ekonomis terbesar dari penerapan sistem bioflok adalah penghematan biaya pakan pelet secara signifikan. Nilai rasio konversi pakan atau feed conversion ratio FCR pada budidaya bioflok dapat ditekan hingga di bawah nol koma delapan, jauh lebih hemat dibanding kolam konvensional yang mencapai satu koma dua. Sistem ini juga sangat hemat penggunaan air karena tidak memerlukan sirkulasi pergantian air harian, cukup menambahkan air yang berkurang akibat penguapan. Pantau parameter pH air pada kisaran netral tujuh hingga delapan, dan lakukan sortasi ukuran ikan secara berkala setiap tiga minggu untuk menghindari kanibalisme.""",
            "headings": [
                {"level": "H1", "text": "Efisiensi Pakan FCR dan Pengendalian Kualitas Air"},
                {"level": "H2", "text": "Penurunan Nilai Feed Conversion Ratio di Bawah Nol Koma Delapan"},
                {"level": "H2", "text": "Penghematan Air Kolam dan Sortasi Ikan Berkala"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 14. Komunikasi Bisnis & Karier
    "email bisnis": [
        {
            "rank_position": 1,
            "page_title": "Struktur Baku Penulisan Email Bisnis yang Efektif dan Profesional",
            "source_url": "https://komunikasikorporat.example.id/struktur-email-bisnis",
            "domain_name": "komunikasikorporat.example.id",
            "snippet_text": "Tulis email bisnis dengan subjek deskriptif, salam formal, paragraf isi terstruktur, dan call-to-action yang jelas.",
            "clean_text": """Dalam dunia kerja profesional, korespondensi melalui surat elektronik merupakan cerminan reputasi dan kredibilitas seorang pekerja. Penulisan email bisnis harus mengikuti etika dan struktur komunikasi yang baku dan terarah. Mulailah dengan menulis baris subjek yang ringkas dan deskriptif, sehingga penerima dapat langsung memahami maksud pesan tanpa harus membuka email terlebih dahulu. Gunakan salam pembuka formal seperti sapaan nama lengkap atau jabatan penerima. Sampaikan inti maksud pesan pada paragraf pembuka secara lugas, susun argumen pendukung menggunakan bullet points yang mudah dipindai, dan akhiri dengan arahan call to action yang tegas.""",
            "headings": [
                {"level": "H1", "text": "Struktur Baku Penulisan Email Bisnis"},
                {"level": "H2", "text": "Penyusunan Baris Subjek Jelas dan Deskriptif"},
                {"level": "H2", "text": "Salam Pembuka Formal dan Kejelasan Call to Action"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Etika Penggunaan Kolom Penerima Cc Bcc dan Lampiran Dokumen",
            "source_url": "https://etikakarier.example.id/etika-cc-bcc-dan-attachment",
            "domain_name": "etikakarier.example.id",
            "snippet_text": "Pahami perbedaan kolom To, Cc, dan Bcc serta pastikan format dan ukuran lampiran berkas tidak memberatkan penerima.",
            "clean_text": """Kesalahan dalam mencantumkan alamat penerima dapat memicu kecanggungan komunikasi kerja atau kebocoran privasi data sensitif. Kolom To ditujukan secara khusus bagi individu yang diharapkan memberikan tindakan atau respons langsung atas email tersebut. Kolom Cc atau carbon copy digunakan untuk memberikan informasi tembusan bagi pihak terkait yang hanya perlu mengetahui tanpa kewajiban membalas. Sedangkan kolom Bcc atau blind carbon copy dipakai ketika mengirim pengumuman massal guna melindungi privasi alamat email kolega. Periksa ukuran berkas lampiran attachment, gunakan format dokumen universal seperti PDF, dan beri nama berkas secara profesional.""",
            "headings": [
                {"level": "H1", "text": "Etika Kolom Penerima dan Pengelolaan Lampiran"},
                {"level": "H2", "text": "Pembedaan Fungsi Kolom To Cc dan Blind Carbon Copy"},
                {"level": "H3", "text": "Standarisasi Nama Berkas dan Format Lampiran PDF"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Menjaga Nada Komunikasi Netral dan Urgensi Proofreading Sebelum Mengirim",
            "source_url": "https://profesionalmuda.example.id/nada-komunikasi-dan-proofreading",
            "domain_name": "profesionalmuda.example.id",
            "snippet_text": "Hindari huruf kapital penuh dan tanda seru berlebihan, selalu lakukan proofreading tata bahasa sebelum klik send.",
            "clean_text": """Nada komunikasi verbal dalam email rentan disalahartikan karena ketiadaan ekspresi wajah dan intonasi suara penutur. Hindari penggunaan huruf kapital penuh secara berlebihan yang menimbulkan kesan membentak atau agresif di mata penerima. Batasi penggunaan tanda seru ganda dan emotikon santai yang tidak sesuai dalam komunikasi resmi antarkorporasi. Sebelum menekan tombol kirim atau send, luangkan waktu satu menit untuk melakukan pemeriksaan ulang proofreading menyeluruh. Pastikan tidak ada kesalahan ejaan ketik atau typo, verifikasi kebenaran nama penerima, kelengkapan berkas lampiran, dan cantumkan blok tanda tangan digital resmi.""",
            "headings": [
                {"level": "H1", "text": "Menjaga Nada Komunikasi dan Prosedur Proofreading"},
                {"level": "H2", "text": "Menghindari Huruf Kapital Penuh dan Emotikon Kasual"},
                {"level": "H2", "text": "Pemeriksaan Koreksi Typo dan Tanda Tangan Digital"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],

    # 15. Medis Darurat & Keselamatan Rumah Tangga
    "luka bakar": [
        {
            "rank_position": 1,
            "page_title": "Pertolongan Pertama Penanganan Luka Bakar Ringan Derajat Satu",
            "source_url": "https://pertolonganpertama.example.id/penanganan-luka-bakar-ringan",
            "domain_name": "pertolonganpertama.example.id",
            "snippet_text": "Dinginkan luka bakar derajat satu dengan mengalirkan air sejuk suhu ruang selama 10 hingga 20 menit.",
            "clean_text": """Luka bakar ringan derajat satu merupakan cedera kulit superfisial yang kerap terjadi dalam aktivitas rumah tangga akibat tersiram air panas, menyentuh wajan masak, atau terkena cipratan minyak goreng. Tindakan medis pertolongan pertama yang paling mendesak adalah mendinginkan jaringan kulit yang terbakar sesegera mungkin. Alirkan air bersih yang sejuk bersuhu ruang langsung ke area luka selama sepuluh hingga dua puluh menit tanpa henti. Pengaliran air ini berfungsi menghentikan proses perusakan jaringan panas ke lapisan dermis yang lebih dalam, meredakan pembengkakan inflamasi, dan menurunkan intensitas nyeri rasa perih yang dialami korban.""",
            "headings": [
                {"level": "H1", "text": "Pertolongan Pertama Luka Bakar Ringan"},
                {"level": "H2", "text": "Mekanisme Pendinginan Jaringan Kulit dengan Air Mengalir"},
                {"level": "H2", "text": "Durasi Minimal Pengaliran Air Sejuk Suhu Ruang"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Bahaya Mitos Mengoleskan Odol Pasta Gigi dan Mentega pada Luka Bakar",
            "source_url": "https://mitosmedis.example.id/bahaya-odol-pada-luka-bakar",
            "domain_name": "mitosmedis.example.id",
            "snippet_text": "Jangan pernah mengoleskan odol, kecap, atau mentega karena mengunci panas dan memicu infeksi bakteri.",
            "clean_text": """Mitos yang masih berkembang luas di masyarakat adalah mengoleskan pasta gigi odol, kecap manis, mentega, atau tepung terigu pada kulit yang baru saja terbakar. Para dokter spesialis bedah plastik sangat menentang praktik berbahaya ini. Mengoleskan bahan berlemak atau pasta kental justru akan memerangkap sisa panas di dalam lapisan kulit sehingga memperparah kedalaman kerusakan jaringan epitel. Selain itu, bahan-bahan non-steril tersebut membawa mikroba kontaminan yang meningkatkan risiko infeksi bakteri berbahaya. Hindari pula menggunakan air es atau es batu langsung karena dapat memicu hipotermia lokal dan kerusakan jaringan sel.""",
            "headings": [
                {"level": "H1", "text": "Bahaya Mengoleskan Odol dan Mentega pada Luka Bakar"},
                {"level": "H2", "text": "Mekanisme Penjeratan Panas Jaringan oleh Lemak"},
                {"level": "H3", "text": "Risiko Infeksi Bakteri dan Efek Hipotermia Es Batu"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Perawatan Luka Bersih Menggunakan Salep Terbakar dan Balutan Steril",
            "source_url": "https://p3kkeluarga.example.id/perawatan-luka-dan-kasa-steril",
            "domain_name": "p3kkeluarga.example.id",
            "snippet_text": "Oleskan gel aloe vera murni atau salep perak sulfadiazin dan lindungi dengan balutan kasa perban steril.",
            "clean_text": """Setelah proses pendinginan air mengalir selesai, keringkan kulit secara sangat perlahan menggunakan handuk bersih atau kasa dengan cara ditepuk lembut tanpa digosok. Untuk meredakan iritasi, oleskan gel lidah buaya murni aloe vera atau salep antibiotik perak sulfadiazin tipis-tipis. Tutup area luka bakar secara longgar menggunakan balutan perban kasa steril guna melindunginya dari gesekan pakaian dan kontaminasi debu kotoran. Jangan sekali-kali memecahkan gelembung lepuh kulit atau bula yang terbentuk, karena kulit lepuh tersebut berfungsi sebagai pelindung biologis alami. Segera rujuk ke dokter bila timbul nanah atau demam.""",
            "headings": [
                {"level": "H1", "text": "Perawatan Luka Bersih dan Balutan Perban Steril"},
                {"level": "H2", "text": "Penggunaan Gel Aloe Vera dan Salep Antibiotik"},
                {"level": "H2", "text": "Perlindungan Lapisan Kulit Lepuh dan Rujukan Dokter"},
            ],
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ],
}

# Hubungkan alias "seo web" ke "seo on page"
CURATED_FALLBACK_BENCHMARKS["seo web"] = CURATED_FALLBACK_BENCHMARKS["seo on page"]


def _generate_synthetic_indonesian_corpus(query: str) -> List[Dict[str, Any]]:
    """Membuat 3 dokumen kompetitor sintetis deterministik berbasis kueri untuk demonstrasi sistem."""
    q_clean = query.strip()
    words = [w for w in re.findall(r"\b\w+\b", q_clean) if len(w) > 2]
    main_kw = " ".join(words) if words else q_clean

    doc1 = {
        "rank_position": 1,
        "page_title": f"Panduan Lengkap dan Praktis Mengenai {main_kw.title()}",
        "source_url": f"https://sumber-utama.example.com/{re.sub(r'[^a-zA-Z0-9]+', '-', q_clean.lower())}",
        "domain_name": "sumber-utama.example.com",
        "snippet_text": f"Informasi terpercaya dan analisis mendalam tentang topik {main_kw} di Indonesia.",
        "clean_text": f"""Topik mengenai {main_kw} saat ini menjadi salah satu pembahasan yang sangat penting di kalangan praktisi dan masyarakat Indonesia. Dalam penerapannya, pemahaman dasar tentang {main_kw} memerlukan ketelitian dalam menyusun konsep, teknik pelaksanaan, serta evaluasi hasil secara berkala. Berbagai pakar menyarankan agar pendekatan yang digunakan selalu mengacu pada standar mutu yang berlaku. Faktor utama keberhasilan mencakup kesiapan sumber daya, perencanaan strategi yang matang, serta pemanfaatan teknologi yang tepat guna. Dengan memperhatikan aspek-aspek krusial tersebut, tujuan akhir dari pengelolaan {main_kw} dapat tercapai dengan efisien dan memberikan manfaat nyata secara berkelanjutan bagi semua pihak yang terlibat.""",
        "headings": [
            {"level": "H1", "text": f"Panduan Lengkap Mengenai {main_kw.title()}"},
            {"level": "H2", "text": f"Konsep Dasar dan Prinsip {main_kw.title()}"},
            {"level": "H2", "text": f"Strategi Pelaksanaan Praktis"},
        ],
        "fetch_status": "offline_synthetic",
        "http_status_code": 200,
    }

    doc2 = {
        "rank_position": 2,
        "page_title": f"Faktor Kunci Keberhasilan dan Analisis {main_kw.title()}",
        "source_url": f"https://portal-informasi.example.org/{re.sub(r'[^a-zA-Z0-9]+', '-', q_clean.lower())}-terbaru",
        "domain_name": "portal-informasi.example.org",
        "snippet_text": f"Ulasan komprehensif mengenai faktor keberhasilan dan tantangan {main_kw}.",
        "clean_text": f"""Banyak organisasi dan individu menghadapi berbagai tantangan saat mengkaji {main_kw}. Untuk mengatasi kendala yang kerap muncul, diperlukan analisis mendalam mengenai kebutuhan lapangan serta adaptasi terhadap perubahan tren terkini seputar {main_kw}. Pengalaman membuktikan bahwa komunikasi terarah dan integrasi metode yang tepat mampu meningkatkan efektivitas hingga dua kali lipat. Pemantauan berkala dan penyusunan panduan operasional standar menjadi instrumen esensial dalam menjaga kualitas kerja. Terus perbarui wawasan Anda agar tidak tertinggal dari perkembangan terbaru dalam domain ini.""",
        "headings": [
            {"level": "H1", "text": f"Faktor Kunci Keberhasilan {main_kw.title()}"},
            {"level": "H2", "text": f"Tantangan Implementasi {main_kw.title()}"},
            {"level": "H3", "text": f"Solusi Taktis dan Langkah Mitigasi"},
        ],
        "fetch_status": "offline_synthetic",
        "http_status_code": 200,
    }

    doc3 = {
        "rank_position": 3,
        "page_title": f"Tips dan Trik Optimalisasi {main_kw.title()} Terbaik",
        "source_url": f"https://wawasan-ahli.example.net/tips-{re.sub(r'[^a-zA-Z0-9]+', '-', q_clean.lower())}",
        "domain_name": "wawasan-ahli.example.net",
        "snippet_text": f"Tips praktis mengoptimalkan {main_kw} secara berkelanjutan.",
        "clean_text": f"""Optimalisasi dalam mengelola {main_kw} memerlukan kedisiplinan dan pendekatan berbasis data yang akurat. Para ahli merekomendasikan serangkaian tips terbaik yang terbukti efektif di lapangan. Langkah awal adalah melakukan pemetaan masalah, kemudian merumuskan solusi berbasis bukti yang dapat diukur kinerjanya. Dalam konteks {main_kw}, kolaborasi lintas disiplin dan keterbukaan terhadap masukan konstruktif terbukti mempercepat pencapaian target. Terapkan prinsip konsistensi dan tinjau ulang hasil implementasi setiap bulan untuk memastikan pertumbuhan yang stabil.""",
        "headings": [
            {"level": "H1", "text": f"Tips Optimalisasi {main_kw.title()}"},
            {"level": "H2", "text": f"Langkah Awal Pemetaan Masalah"},
            {"level": "H2", "text": f"Evaluasi dan Peningkatan Berkelanjutan"},
        ],
        "fetch_status": "offline_synthetic",
        "http_status_code": 200,
    }

    return [doc1, doc2, doc3]


def get_fallback_corpus(query: str) -> List[Dict[str, Any]]:
    """Mengambil salinan korpus fallback deterministik berdasarkan kueri (15 topik benchmark atau generator sintetis)."""
    q_low = query.lower().strip()
    # 1. Cek pencocokan substring langsung
    for key, docs in CURATED_FALLBACK_BENCHMARKS.items():
        if not docs:
            continue
        if key in q_low or q_low in key:
            copied = copy.deepcopy(docs)
            for d in copied:
                d["fetch_status"] = "offline_curated"
            return copied

    # 2. Cek kecocokan token kata kunci jika variasi frasa sedikit berbeda
    q_tokens = set(re.findall(r"\b\w+\b", q_low))
    for key, docs in CURATED_FALLBACK_BENCHMARKS.items():
        if not docs:
            continue
        key_tokens = set(re.findall(r"\b\w+\b", key))
        if len(key_tokens) >= 2 and key_tokens.issubset(q_tokens):
            copied = copy.deepcopy(docs)
            for d in copied:
                d["fetch_status"] = "offline_curated"
            return copied

    return _generate_synthetic_indonesian_corpus(query)
