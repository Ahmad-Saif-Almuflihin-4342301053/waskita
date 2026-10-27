import re
from typing import Any, Dict, List

# --- Built-in Indonesian Curated Fallback Corpus (Tahap 4 DSRM & 100% Offline Testing) ---
CURATED_FALLBACK_BENCHMARKS: Dict[str, List[Dict[str, Any]]] = {
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
    "seo web": [
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
}


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
    """Mengambil salinan korpus fallback deterministik berdasarkan kueri (topik benchmark atau generator sintetis)."""
    import copy
    q_low = query.lower().strip()
    for key, docs in CURATED_FALLBACK_BENCHMARKS.items():
        if key in q_low or q_low in key:
            copied = copy.deepcopy(docs)
            for d in copied:
                d["fetch_status"] = "offline_curated"
            return copied
    return _generate_synthetic_indonesian_corpus(query)
