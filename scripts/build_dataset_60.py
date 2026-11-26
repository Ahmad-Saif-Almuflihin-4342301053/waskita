#!/usr/bin/env python3
"""
Generator & Verifier Dataset Benchmark 60 Draf Multi-Strata WASKITA
Mencakup 15 Topik Lintas Disiplin x 4 Varian Kontras:
- 30 Positif ('Layak Terbit'): 15 Strata P1 (Deep-Dive & Empirical Gain) + 15 Strata P2 (Multi-Source Web Synthesis)
- 30 Negatif ('Perlu Revisi'): 6 N1 (Verbatim) + 6 N2 (Mosaic) + 6 N3 (Hoax) + 6 N4 (Out-of-Domain) + 6 N5 (AI Slop/Stuffing)
"""

import asyncio
import json
import os
import re
import sys
from typing import Any, Dict, List

# Tambahkan direktori root backend ke PYTHONPATH
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

from app.fixtures.benchmark_corpus import CURATED_FALLBACK_BENCHMARKS, get_fallback_corpus
from app.schemas.audit import ThresholdConfig
from tests.evaluate_accuracy import evaluate_draft


def load_p1_drafts() -> List[Dict[str, Any]]:
    """Memuat 15 draf positif P1 dari dataset_30_drafts.json yang sudah terbukti kualitas ilmiahnya."""
    legacy_file = os.path.join(BACKEND_DIR, "tests", "fixtures", "dataset_30_drafts.json")
    with open(legacy_file, "r", encoding="utf-8") as f:
        legacy_drafts = json.load(f)

    p1_drafts = []
    topic_id = 1
    for d in legacy_drafts:
        if d["ground_truth_label"] == "Layak Terbit":
            draft_copy = dict(d)
            draft_copy["id"] = f"draft-{topic_id:02d}-P1"
            draft_copy["topic_id"] = topic_id
            draft_copy["stratum"] = "P1"
            draft_copy["stratum_description"] = "Expert Deep-Dive & Local Empirical Gain"
            p1_drafts.append(draft_copy)
            topic_id += 1
    return p1_drafts


def get_topic_metadata() -> List[Dict[str, Any]]:
    """Daftar 15 topik ilmiah lintas disiplin."""
    return [
        {"topic_id": 1, "category": "Kuliner & Tata Boga", "query": "resep kopi tubruk tradisional", "key": "kopi tubruk"},
        {"topic_id": 2, "category": "Kesehatan & Kedokteran", "query": "gejala kanker serviks stadium awal", "key": "kanker serviks"},
        {"topic_id": 3, "category": "Teknologi & Pemasaran Digital", "query": "panduan seo on page artikel blog", "key": "seo on page"},
        {"topic_id": 4, "category": "Pertanian & Tanaman Hias", "query": "cara merawat tanaman monstera deliciosa", "key": "monstera"},
        {"topic_id": 5, "category": "Kesehatan & Fisiologi Tubuh", "query": "manfaat minum air putih hangat di pagi hari", "key": "air putih hangat"},
        {"topic_id": 6, "category": "Keuangan & Perencanaan Finansial", "query": "strategi mengelola keuangan pribadi untuk pemula", "key": "keuangan pribadi"},
        {"topic_id": 7, "category": "Gaya Hidup & Kesehatan Mental", "query": "tips mengatasi insomnia tanpa obat tidur", "key": "insomnia"},
        {"topic_id": 8, "category": "Otomotif & Energi Terbarukan", "query": "keunggulan mobil listrik dibanding mobil konvensional", "key": "mobil listrik"},
        {"topic_id": 9, "category": "Lingkungan & Daur Ulang Mandiri", "query": "cara membuat pupuk kompos dari sampah organik dapur", "key": "pupuk kompos"},
        {"topic_id": 10, "category": "Teknologi Informasi & Pemrograman", "query": "panduan belajar pemrograman python dasar untuk pemula", "key": "pemrograman python"},
        {"topic_id": 11, "category": "Kesehatan Kerja & Ergonomi Digital", "query": "tips menjaga kesehatan mata bagi pekerja depan layar", "key": "kesehatan mata"},
        {"topic_id": 12, "category": "Investasi & Pasar Modal", "query": "keuntungan investasi reksa dana pasar uang untuk generasi muda", "key": "reksa dana"},
        {"topic_id": 13, "category": "Akuakultur & Wirausaha Agribisnis", "query": "cara budidaya ikan lele sistem bioflok di lahan sempit", "key": "bioflok"},
        {"topic_id": 14, "category": "Komunikasi Bisnis & Karier", "query": "etika komunikasi profesional dalam email bisnis", "key": "email bisnis"},
        {"topic_id": 15, "category": "Medis Darurat & Keselamatan Rumah Tangga", "query": "langkah pertolongan pertama pada luka bakar ringan di rumah", "key": "luka bakar"},
    ]


def build_p2_drafts() -> List[Dict[str, Any]]:
    """Membangun 15 draf Strata P2: Sintesis multi-sumber yang sah, parafrasa struktural mandiri, dan studi kasus komparatif."""
    topics = get_topic_metadata()
    p2_contents = {
        1: (
            "Evolusi Teknik Seduh Kopi Tubruk Modern: Integrasi Kontrol Temperatur dan Sains Ekstraksi Partikel",
            """Menikmati secangkir seduhan tubruk merupakan tradisi autentik penikmat kopi di Indonesia yang menggabungkan kesederhanaan teknik dengan ketepatan sains ekstraksi. Berdasarkan praktik barista di berbagai kedai Nusantara, kelezatan minuman ini bertumpu pada keharmonisan antara pemilihan bahan baku dan pengendalian variabel seduh. Tanpa bantuan saringan kertas, seluruh karakter minyak alami biji kopi terlarut sempurna sehingga menghasilkan profil rasa yang tebal dan memikat.

## Harmonisasi Rasio Air dan Pengendalian Termal Seduhan
Konsistensi rasa sangat ditentukan oleh kepatuhan terhadap rasio seduhan yang terukur. Formula standar yang terbukti menghasilkan kepekatan seimbang adalah perbandingan satu banding lima belas, yakni lima belas mililiter air panas untuk setiap satu gram bubuk kopi. Kualitas air memegang peranan krusial, gunakan air mineral jernih yang dipanaskan hingga mencapai rentang temperatur sembilan puluh dua derajat Celsius. Suhu ini mencegah terjadinya ekstraksi berlebih yang dapat merusak keasaman alami kopi.

## Formulasi Campuran Biji Robusta dan Arabika
Untuk memperoleh cita rasa yang kaya dimensi, perpaduan antara varietas Robusta dan Arabika menjadi opsi yang sangat digemari. Biji Robusta menyumbangkan kekentalan pekat dan aroma cokelat pekat, sedangkan Arabika menghadirkan sentuhan aroma buah yang menyegarkan. Kombinasi seimbang dengan komposisi tujuh puluh persen Robusta dan tiga puluh persen Arabika mampu menciptakan seduhan yang mantap namun tetap ramah di lidah bagi penikmat kopi harian.

## Tahapan Ekstraksi Blooming dan Waktu Sedimentasi
Langkah awal penyeduhan diawali dengan membasahi bubuk kopi selama tiga puluh detik untuk memicu proses blooming atau pelepasan gas karbondioksida alami. Setelah itu, tuangkan sisa air panas secara perlahan dengan pola sirkular melingkar. Lakukan pengadukan lembut sebanyak tiga putaran, lalu diamkan seduhan selama empat menit penuh. Waktu jeda ini memberi ruang bagi partikel ampas kopi untuk turun mengendap ke dasar cangkir secara alami, meninggalkan cairan seduhan yang bersih dan nikmat dinikmati hingga tegukan terakhir."""
        ),
        2: (
            "Sintesis Pencegahan Karsinoma Serviks: Perbandingan Efektivitas Skrining Sitologi dan Vaksinasi Human Papillomavirus",
            """Pencegahan keganasan pada serviks menuntut integrasi strategi proteksi primer dan deteksi dini sekunder secara berkesinambungan. Sebagian besar kasus kanker serviks diakibatkan oleh transmisi infeksi Human Papillomavirus tipe 16 dan 18 yang menyerang epitel leher rahim. Mengingat sifat patologi penyakit yang sering kali asimtomatik pada stadium awal, pemahaman wanita terhadap gejala klinis seperti perdarahan kontak dan keputihan atipikal menjadi dasar penanganan sebelum lesi berkembang menjadi neoplasma invasif.

## Perbandingan Akurasi Skrining Pap Smear dan Tes Asam Asetat
Dalam mendeteksi perubahan prakanker pada zona transformasi, terdapat dua metode pemeriksaan yang umum digunakan di fasilitas pelayanan medis. Pemeriksaan pap smear sitologi menawarkan presisi mikroskopis yang tinggi dalam mengidentifikasi displasia selular. Di sisi lain, inspeksi visual dengan asam asetat atau tes IVA memberikan efisiensi diagnosis cepat di pusat kesehatan masyarakat primer dengan mengamati perubahan plak putih pada epitel atipikal, sehingga tindakan krioterapi dapat segera dieksekusi tanpa penundaan.

## Proteksi Imunologis Melalui Vaksinasi Rekombinan
Pendekatan preventif yang paling fundamental adalah membentuk imunitas humoral melalui pemberian vaksin HPV sejak fase pra-remaja. Vaksinasi rekombinan menstimulasi antibodi protektif terhadap antigen kapsid virus, memutus rantai transmisi infeksi onkogenik sebelum paparan seksual aktif terjadi. Program imunisasi nasional yang disinergikan dengan edukasi pola hidup bersih terbukti mampu menekan insidensi keganasan secara drastis dalam studi epidemiologi jangka panjang.

## Pengendalian Faktor Risiko dan Sinergi Gaya Hidup
Faktor pendukung seperti kebiasaan merokok dan defisiensi sistem imun mempercepat progresi infeksi persisten menjadi tumor ganas. Berhenti merokok membantu mempertahankan integritas membran mukosa organ reproduksi dari kerusakan oksidatif. Pemeriksaan berkala setiap tahun bagi wanita usia produktif melengkapi benteng perlindungan komprehensif terhadap risiko kanker leher rahim."""
        ),
        3: (
            "Arsitektur Konten Berkualitas Tinggi: Menyelaraskan Struktur On-Page dengan Evaluasi Google Helpful Content",
            """Mengoptimalkan visibilitas situs web pada era pembaruan algoritma modern memerlukan pergeseran paradigma dari manipulasi kata kunci mekanis menuju kepuasan niat pencarian pengguna secara holistik. Prinsip SEO On-Page yang kokoh harus mampu menyajikan substansi berbobot yang memenuhi kriteria sistem Google Helpful Content. Halaman yang dibangun atas dasar pengalaman langsung first-hand experience dan orisinalitas analitis terbukti memiliki ketahanan peringkat organik yang jauh lebih stabil di mesin telusur.

## Hierarki Heading Semantik dan Integrasi Kata Kunci Natural
Struktur naskah yang terorganisir diawali dengan perumusan judul H1 yang memikat serta sub-judul H2 dan H3 yang mencerminkan pemetaan logis materi. Penempatan frasa kata kunci utama harus mengalir secara kontekstual tanpa kesan dipaksakan atau keyword stuffing yang dapat memicu penalti perayap web crawler. Sertakan gambar pendukung dengan atribut alt text deskriptif serta tautan internal internal links yang relevan untuk memperkuat arsitektur navigasi informasi website.

## Analisis Celah Informasi Information Gain pada Hasil Pencarian
Sebelum merancang draf tulisan, lakukan pemetaan komparatif terhadap sepuluh artikel kompetitor teratas pada halaman Google SERP. Temukan aspek teknis atau dimensi praktis yang belum dijelaskan secara mendalam oleh situs lain, inilah yang menjadi celah information gain berharga. Menghadirkan solusi konkret yang menutup kekosongan tersebut memberikan sinyal otoritas topikal yang kuat kepada sistem pemeringkat mesin pencari.

## Optimalisasi Kecepatan Memuat dan Retensi Pengunjung
Kecepatan akses halaman dan keramahan antarmuka seluler menjadi faktor penentu pengalaman membaca audiens. Kompresi aset visual dan pembersihan skrip yang tidak esensial secara langsung menekan rasio pentalan bounce rate. Konten yang memikat pembaca untuk berinteraksi lebih lama akan memvalidasi relevansi artikel di mata algoritma Helpful Content."""
        ),
        4: (
            "Manajemen Holistik Tanaman Monstera Deliciosa: Formulasi Media Tanam Porous dan Dinamika Fenestrasi Daun",
            """Budidaya Monstera deliciosa di dalam ruangan memerlukan pemahaman mendalam tentang fisiologi tanaman tropis epifit. Daya tarik visual tanaman ini bertumpu pada keindahan fenestrasi atau belahan daun alami yang terbentuk seiring bertambahnya usia tanaman dan terpenuhinya kebutuhan lingkungan tumbuh. Keseimbangan antara kelembaban, sirkulasi udara mikro, dan nutrisi terukur menjadi kunci utama dalam merangsang pertumbuhan helaian daun yang lebar dan kokoh.

## Formulasi Racikan Media Tanam Bebas Genangan Air
Ancaman terbesar bagi kelangsungan hidup monstera adalah pembusukan sistem perakaran akibat media tanam yang terlalu padat dan basah. Campuran media tanam porous yang ideal mengombinasikan sekam bakar, perlite, cocopeat, dan serpihan kulit kayu pinus dengan perbandingan seimbang. Komposisi ini memastikan drainase air siraman mengalir lancar seketika sekaligus mempertahankan aerasi oksigen di sekitar rizosfer akar tanaman.

## Manajemen Kebutuhan Cahaya Terang Tak Langsung
Monstera membutuhkan paparan cahaya matahari terang tidak langsung bright indirect light untuk memicu proses fotosintesis secara maksimal. Meletakkan pot terlalu dekat dengan jendela berpanas terik langsung dapat menyebabkan klorosis dan luka bakar kecokelatan pada permukaan lamina daun. Sebaliknya, intensitas cahaya yang terlalu redup akan menghambat perkembangan belahan daun baru dan menyebabkan tangkai daun tumbuh kurus memanjang.

## Pemasangan Turus Sabut Kelapa dan Pengendalian Hama
Sebagai tanaman hemiepifit, monstera mengembangkan akar angin untuk memanjat tegakan pohon inang. Pemasangan tiang penyangga atau turus berbahan sabut kelapa yang lembap merangsang akar adventif menyerap air tambahan, sehingga ukuran daun bertambah besar secara dramatis. Bersihkan daun secara rutin dan semprotkan larutan neem oil organik untuk mencegah koloni kutu putih mealybug merusak jaringan daun muda."""
        ),
        5: (
            "Fisiologi Cairan Tubuh: Pengaruh Termal Konsumsi Air Hangat terhadap Peristaltik dan Filtrasi Glomerulus",
            """Memulai rutinitas harian dengan asupan air putih hangat bersuhu suam-suam kuku menawarkan stimulus fisiologis yang sangat menguntungkan bagi metabolisme tubuh manusia. Setelah periode istirahat malam tanpa asupan cairan selama berjam-jam, kondisi dehidrasi mikro dapat dipulihkan secara instan tanpa memicu stres kejut pada sfingter lambung. Respons termal dari cairan bersuhu 37 hingga 42 derajat Celsius memfasilitasi adaptasi organ dalam secara alami dan lembut.

## Stimulasi Gerakan Peristaltik dan Pemecahan Partikel Lemak
Air hangat yang masuk ke saluran cerna merangsang kontraksi ritmis otot polos usus atau gerak peristaltik. Fenomena mekanis ini membantu mendorong akumulasi sisa makanan menuju kolon sehingga melancarkan proses defekasi pagi hari dan mencegah konstipasi. Selain itu, paparan suhu hangat mempermudah emulsifikasi partikel lipid sisa santapan malam, sehingga mempermudah kerja enzim hidrolitik empedu dalam menjaga higienitas mukosa pencernaan.

## Pelebaran Vaskular Vasodilatasi dan Aliran Oksigen Jaringan
Secara hemodinamik, suhu hangat memicu relaksasi otot dinding pembuluh darah yang dikenal sebagai vasodilatasi perifer. Peningkatan diameter lumen vaskular ini memperlancar sirkulasi darah serta distribusi oksigen menuju seluruh sel tubuh, memberikan efek relaksasi pada ketegangan otot dan menurunkan beban kerja pompa jantung secara sementara.

## Peningkatan Efisiensi Filtrasi Glomerulus Ginjal
Kecukupan volume cairan di pagi hari sangat mendukung perfusi darah ke unit nefron ginjal. Peningkatan laju filtrasi glomerulus mempercepat ekskresi asam urat dan metabolit sisa melalui urine encer. Konsumsi air matang bebas perasa dan gula menjaga kejernihan filtrat serta meminimalkan pembentukan endapan kalkulus atau batu ginjal."""
        ),
        6: (
            "Perencanaan Keuangan Komprehensif: Integrasi Alokasi 50 30 20 dengan Mitigasi Risiko Rasio Utang",
            """Membangun ketahanan finansial pribadi bagi individu yang baru meniti karier menuntut kedisiplinan alokasi pendapatan dan pemahaman manajemen risiko arus kas yang ketat. Ketiadaan struktur perencanaan anggaran sering kali menjebak pekerja muda dalam siklus pengeluaran impulsif yang tidak terkontrol. Pengadopsian sistem pembagian pos keuangan yang teruji memberikan kerangka kerja jelas dalam mencapai kemandirian ekonomi jangka panjang.

## Distribusi Anggaran Berimbang Melalui Formula 50 30 20
Penerapan proporsi budgeting 50-30-20 membagi penghasilan bersih bulanan ke dalam tiga pilar fungsional. Berdasarkan formula ini, separuh dari total pemasukan bersih difokuskan guna membiayai pos belanja pokok esensial, mencakup pemenuhan pangan bergizi, tempat bernaung, sarana mobilitas harian, serta tagihan listrik rutin. Selanjutnya, porsi tiga persepuluh dialokasikan guna menunjang rekreasi dan kenyamanan gaya hidup secara bertanggung jawab. Adapun sisa dua puluh persen dari pendapatan langsung diamankan sejak hari gajian untuk memupuk portofolio tabungan serta pos proteksi masa depan.

## Pembentukan Dana Darurat Likuid dan Proteksi Asuransi
Langkah krusial sebelum memulai investasi spekulatif adalah membangun fondasi cadangan tunai setara biaya hidup beberapa bulan ke depan. Aset likuid ini disimpan dalam rekening fleksibel yang mudah ditarik kapan saja tanpa risiko penurunan modal saat pasar bergejolak. Keberadaan bantalan kas darurat menjadi penyelamat utama ketika terjadi musibah tak terduga seperti pemutusan hubungan kerja mendadak atau tagihan rumah sakit, didukung keikutsertaan program jaminan kesehatan nasional.

## Pengendalian Beban Cicilan Utang Maksimal Tiga Puluh Persen
Untuk menjaga kesehatan arus kas bulanan, batas aman total angsuran kewajiban tidak boleh menyedot lebih dari sepertiga penghasilan bulanan. Kebiasaan berutang konsumtif melalui pinjaman online berbunga tinggi harus dihindari agar tidak merusak skor kelayakan kredit perbankan di masa depan. Mencatat riwayat pengeluaran kas harian secara digital membantu menjaga neraca keuangan tetap seimbang."""
        ),
        7: (
            "Manajemen Ritme Sirkadian: Pendekatan Higiene Tidur Non-Farmakologis dan Regulasi Melatonin Otak",
            """Gangguan insomnia kronis yang melanda masyarakat modern kerap berakar pada disrupsi sinkronisasi antara ritme sirkadian internal tubuh dan stimulus lingkungan luar. Mengandalkan obat sedatif dalam jangka panjang membawa risiko toleransi farmakologis dan efek samping ketergantungan. Sebagai alternatif yang aman dan berkelanjutan, modifikasi perilaku berbasis pedoman sleep hygiene terbukti secara klinis mampu merestorasi arsitektur tidur alami secara efektif.

## Standardisasi Jam Biologis Tubuh dan Penataan Ruang Istirahat
Langkah awal dalam menata jam tidur biologis adalah menegakkan disiplin waktu bangun pagi yang konsisten, tanpa membedakan hari kerja maupun akhir pekan. Ruangan tempat beristirahat seyogianya ditata sedemikian rupa agar meminimalkan interferensi suara bising dari luar rumah serta menjaga sirkulasi hawa tetap sejuk dan temaram. Ketiadaan stimulasi cahaya buatan memberi sinyal fisiologis bagi organ otak untuk memulai sekresi melatonin penginduksi kantuk.

## Pembatasan Radiasi Perangkat Elektronik dan Teknik Pengaturan Napas
Paparan radiasi spektrum cahaya berfrekuensi tinggi dari layar gawai pintar dapat menghambat pelepasan hormon pemicu tidur alami. Disarankan untuk mematikan perangkat komunikasi digital satu jam sebelum bersiap naik ke peraduan. Sebagai sarana menenangkan pikiran, luangkan waktu sejenak melakukan olah napas teratur dengan ritme lambat guna menurunkan ketegangan neuromuscular serta mereduksi denyut nadi yang terpacu.

## Pembatasan Asupan Stimulan Kafein dan Rutinitas Malam Menenangkan
Zat kafein yang terkandung pada minuman kopi memiliki durasi pembuangan biologis yang cukup panjang di dalam tubuh manusia. Sebaiknya hindari minuman pemicu kewaspadaan menjelang sore hari, dan gantilah dengan meminum seduhan air rebusan bunga herbal yang menenangkan. Rangkaian ritual relaksasi seperti membersihkan diri dengan air suam kuku dan mendengarkan alunan instrumen lembut dapat mempermudah peralihan tubuh menuju fase lelap sempurna."""
        ),
        8: (
            "Transisi Elektrifikasi Mobilitas: Efisiensi Konversi Daya Baterai Motor Listrik dan Penghematan Operasional",
            """Perkembangan teknologi mobilitas listrik berbasis baterai electric vehicle menandai transformasi fundamental dalam efisiensi energi transportasi darat. Dibandingkan dengan kendaraan berbahan bakar minyak yang mengandalkan siklus termodinamika internal combustion engine yang membuang sebagian besar energi sebagai radiasi panas, motor listrik menawarkan tingkat efisiensi konversi daya yang jauh melampaui mesin konvensional.

## Efisiensi Termis Motor Listrik dan Karakter Torsi Puncak Instan
Motor induksi listrik sanggup mengonversi lebih dari delapan puluh lima persen energi elektrokimia baterai menjadi energi mekanik putaran roda. Sebaliknya, mesin pembakaran dalam hanya mampu menyerap efisiensi sekitar dua puluh hingga tiga puluh persen bahan bakar bensin. Karakteristik medan magnet motor listrik juga menghasilkan torsi maksimum instan sejak putaran nol RPM, menghadirkan akselerasi yang senyap, tanpa hentakan transmisi, dan sangat responsif.

## Pemanenan Energi Kinetik Regenerative Braking
Salah satu inovasi tercanggih pada kendaraan listrik adalah pemanfaatan sistem pengereman regeneratif. Ketika pedal akselerasi dilepas, motor listrik beralih fungsi menjadi generator yang memperlambat laju kendaraan sekaligus mengubah energi deselerasi kinetik kembali menjadi muatan listrik pengisi baterai. Mekanisme ini memperpanjang jarak tempuh operasional sekaligus mengurangi keausan kampas rem mekanis secara signifikan.

## Kalkulasi Biaya Perawatan Jangka Panjang dan Ekosistem SPKLU
Ketiadaan komponen bergerak kompleks seperti katup silinder, busi, transmisi girboks bertingkat, dan oli pelumas mesin memangkas biaya servis berkala kendaraan listrik secara dramatis. Biaya pengisian daya per kilometer di stasiun SPKLU terbukti jauh lebih murah daripada pembelian bensin eceran. Garansi paket baterai traksi hingga delapan tahun memberikan jaminan keandalan investasi jangka panjang bagi konsumen."""
        ),
        9: (
            "Rekayasa Dekomposisi Sampah Organik Rumah Tangga: Optimasi Rasio Karbon Nitrogen dan Bioaktivator EM4",
            """Pemanfaatan limbah organik sisa aktivitas dapur melalui teknik pengomposan mandiri merupakan pilar penting dalam ekonomi sirkular skala rumah tangga. Proses biodegradasi bahan hayati ini bukan sekadar menimbun sampah, melainkan mengelola ekosistem mikroorganisme pengurai agar bekerja secara aerobik dalam mengubah senyawa kompleks menjadi humus yang subur bagi kesuburan tanah pekarangan.

## Keseimbangan Proporsi Unsur Kimiawi Bahan Baku
Keberhasilan konversi sampah sangat ditentukan oleh ketepatan perbandingan unsur karbon serta nitrogen di dalam bak olahan. Materi basah seperti potongan sisa bumbu sayur dan kulit buah bertindak sebagai penyumbang nitrogen esensial bagi mikroba. Di sisi lain, bahan kering berserat seperti serbuk gergajian kayu atau serpihan kardus memasok karbon sebagai sumber energi penguraian. Memotong bahan baku menjadi potongan renik memperluas area penetrasi koloni dekomposer.

## Peran Larutan Bioaktivator Mikroorganisme Efektif EM4
Untuk mempercepat fase dekomposisi awal, introduksi kultur bakteri heterotrof melalui bioaktivator EM4 yang diaktifkan dengan larutan molase tetes tebu sangat dianjurkan. Larutan ini disemprotkan merata ke lapisan bahan kompos dengan tingkat kelembaban optimal sekitar empat puluh hingga enam puluh persen. Sirkulasi aerasi pada wadah komposter harus dijaga dengan pembalikan tumpukan satu minggu sekali guna menghindari fermentasi anaerob yang memicu aroma busuk tak sedap.

## Indikator Kematangan Hasil Olahan Organik
Pupuk organik yang telah melewati proses pengomposan selama sebulan lebih ditandai dengan penurunan temperatur tumpukan hingga sejuk menyerupai udara kamar. Hasil olahan yang matang sempurna tampak remah menyerupai struktur partikel tanah perkebunan alami dengan semerbak aroma humus segar yang menyejukkan. Memilah bahan non-hewani sejak awal menjadi kunci terhindar dari bau busuk lindi."""
        ),
        10: (
            "Prinsip Desain Kode Python Bersih: Penguasaan Struktur Data Bawaan dan Enkapsulasi Fungsi Modular",
            """Menulis kode pemrograman Python yang berkualitas tinggi menuntut kepatuhan terhadap prinsip clean code dan idiomatik Pythonic yang menitikberatkan keterbacaan serta modularitas. Sintaksis Python yang ekspresif memungkinkan perancangan algoritma yang ringkas tanpa mengorbankan performa komputasi runtime. Pemahaman mendalam tentang tipe data primitif dan mekanisme dynamic typing menjadi fondasi wajib bagi setiap pengembang perangkat lunak.

## Karakteristik Manipulasi Koleksi Data Bawaan Python
Kekuatan bahasa Python terwujud dalam keragaman struktur data bawaan yang disesuaikan dengan kebutuhan algoritma. Tipe data list mutable memberikan fleksibilitas penambahan dan pengurutan elemen dinamis. Di sisi lain, tuple immutable menjamin integritas data konstanta yang terlindungi dari modifikasi tak disengaja. Penggunaan dictionary berbasis pasangan kunci dan nilai key-value pairs menawarkan efisiensi pencarian berkecepatan konstan O(1) yang sangat handal untuk pengelolaan data terstruktur format JSON.

## Enkapsulasi Logika Melalui Fungsi Reusable dan Docstring
Prinsip modularitas diwujudkan melalui pembungkusan alur logika ke dalam fungsi terdefinisi menggunakan kata kunci def dengan nilai kembalian return yang jelas. Setiap fungsi harus memiliki tanggung jawab tunggal single responsibility dan didokumentasikan menggunakan docstring standar guna mempermudah pemeliharaan jangka panjang. Penggunaan struktur perulangan dan seleksi kondisi bercabang if elif else harus mematuhi indentasi spasi yang konsisten.

## Isolasi Dependensi Pustaka Pihak Ketiga dengan Venv dan Pip
Dalam arsitektur perangkat lunak modern, kebersihan lingkungan eksekusi sistem operasi dijaga melalui pemanfaatan lingkungan virtual venv. Instalasi modul pustaka eksternal dikelola secara terpusat melalui paket manajer pip dan dicatat secara deterministik dalam berkas requirements.txt, mencegah terjadinya benturan versi dependensi antarmuka proyek."""
        ),
        11: (
            "Ergonomi Visual Digital: Mitigasi Sindrom Penglihatan Komputer Melalui Penataan Ruang dan Relaksasi 20-20-20",
            """Intensitas interaksi dengan antarmuka digital selama jam kerja perkantoran modern meningkatkan prevalensi Computer Vision Syndrome di kalangan profesional. Gejala kelelahan okular seperti mata berair, penglihatan kabur berbayang, sensasi panas menyengat, serta nyeri otot leher sering kali timbul akibat kombinasi postur kerja yang buruk, pencahayaan silau, dan penurunan frekuensi refleks berkedip alami di depan monitor kerja.

## Protokol Relaksasi Otot Siliaris Melalui Kaidah 20-20-20
Sebagai langkah preventif paling praktis, para dokter spesialis mata merekomendasikan penerapan kaidah relaksasi 20-20-20. Setiap bekerja selama dua puluh menit di depan layar komputer, istirahatkan mata sejenak selama dua puluh detik dengan menatap benda yang berada pada jarak minimal dua puluh kaki atau enam meter. Jeda fokus jarak jauh ini melepaskan kontraksi akomodasi otot siliaris lensa mata sehingga mencegah terjadinya spasme kelelahan penglihatan kronis.

## Penanggulangan Sindrom Mata Kering dan Pelumasan Kornea
Fokus visual berlebih saat membaca teks di monitor menurunkan frekuensi kedipan mata hingga separuh dari batas normal, mempercepat penguapan lapisan air mata pelindung epitel kornea. Untuk mengatasi iritasi mata kering dry eyes, biasakan berkedip penuh secara sadar dan gunakan tetes mata air mata buatan artificial tears tanpa pengawet. Keberadaan lapisan air mata yang stabil sangat krusial dalam mempertahankan ketajaman refraksi penglihatan.

## Standardisasi Ergonomi Tata Letak Monitor dan Pencahayaan Ruang
Posisikan bagian atas layar monitor sejajar atau sedikit di bawah garis pandang mata horizontal dengan jarak sekitar lima puluh hingga tujuh puluh sentimeter dari wajah. Sudut pandang condong ke bawah ini mempersempit celah kelopak mata yang terbuka sehingga menekan laju evaporasi cairan mata. Seimbangkan kecerahan layar dengan luminansi ruangan sekitar serta pasang filter anti-silau guna memblokir radiasi sinar biru berlebih."""
        ),
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
        13: (
            "Teknologi Bioflok Berkelanjutan: Simbiosis Bakteri Heterotrof dalam Menekan Feed Conversion Ratio Lele",
            """Penerapan teknologi akuakultur sistem bioflok pada kolam terpal bulat merupakan solusi inovatif dalam mengatasi keterbatasan ketersediaan lahan dan efisiensi air pada budidaya ikan lele. Berbeda dengan metode budidaya kolam konvensional yang menuntut pergantian air secara masif, bioflok menciptakan sistem ekologis tertutup di mana limbah metabolik diubah kembali menjadi sumber nutrisi bernilai tinggi bagi komoditas ikan.

## Mekanisme Konversi Limbah Nitrogen Menjadi Flok Protein Alami
Prinsip biologis bioflok bertumpu pada perkembangbiakan koloni bakteri heterotrof yang mampu menyerap senyawa amonia beracun dari kotoran ikan dan sisa pakan terlarut. Bakteri ini mengonversi limbah beracun tersebut menjadi biomassa gumpalan mikroba atau flok yang kaya kandungan protein, asam amino, dan mineral penting. Flok yang melayang di kolom air kemudian dimangsa kembali oleh ikan lele sebagai pakan alami komplementer yang menyehatkan.

## Pasokan Oksigen Aerasi Berkelanjutan dan Regulasi Karbon Molase
Ekosistem bakteri heterotrof aerobik membutuhkan pasokan oksigen terlarut yang tinggi tanpa jeda. Mesin blower aerasi atau sistem venturi wajib beroperasi selama dua puluh empat jam penuh untuk menjaga parameter dissolved oxygen di atas ambang minimal empat miligram per liter. Untuk menjaga laju proliferasi bakteri pengurai, pembudidaya wajib menambahkan sumber karbon organik berupa molase tetes tebu agar rasio karbon terhadap nitrogen C/N ratio air kolam tetap berada di atas sepuluh.

## Efisiensi Ekonomi Feed Conversion Ratio dan Kualitas Air
Pemanfaatan flok sebagai pakan substitusi berhasil menekan angka feed conversion ratio FCR hingga di bawah nol koma delapan, menghemat pengeluaran pakan pelet komersial secara signifikan. Kualitas parameter keasaman pH air dijaga stabil pada rentang netral tujuh hingga delapan tanpa perlu sirkulasi pergantian air rutin. Sortasi periodik menjamin keseragaman pertumbuhan populasi lele hingga masa panen tiba."""
        ),
        14: (
            "Protokol Korespondensi Bisnis Modern: Standarisasi Struktur Email dan Etika Komunikasi Korporat",
            """Pertukaran pesan surat elektronik di ranah korporasi modern bukan sekadar saluran kirim berkas, melainkan cerminan kredibilitas serta kedisiplinan kerja seorang profesional. Pesan yang bertele-tele atau tata letak yang semrawut kerap menghambat pengambilan keputusan lintas departemen, menunda jadwal peluncuran produk, bahkan menurunkan kepercayaan klien strategis terhadap kualitas layanan perusahaan.

## Perumusan Tajuk Pesan Presisi dan Alur Paragraf Piramida Terbalik
Surat elektronik yang efektif selalu dibuka dengan penulisan tajuk subjek yang spesifik memuat konteks proyek beserta tingkat prioritasnya. Gunakan sapaan pembuka yang menghormati jabatan lawan bicara secara proporsional. Terapkan prinsip piramida terbalik dengan menuliskan inti permasalahan pada kalimat pertama, diikuti rincian poin teknis yang ringkas, lalu tutup dengan kalimat kesimpulan mengenai langkah tindak lanjut yang disepakati bersama.

## Disiplin Penggunaan Jalur Distribusi Penerima dan Standar Berkas
Ketepatan memilih kolom alamat tujuan sangat menentukan efektivitas koordinasi tim. Tempatkan alamat rekan yang wajib mengeksekusi tugas langsung pada kolom tujuan utama, sedangkan atasan atau pemangku kepentingan yang sekadar membutuhkan laporan perkembangan cukup dimasukkan ke jalur tembusan. Ketika mengirimkan undangan massal ke pihak luar, manfaatkan jalur tembusan tertutup demi menjaga privasi data alamat kontak, serta pastikan dokumen lampiran telah dikonversi ke format statis yang rapi.

## Kewaspadaan Nada Bahasa Tertulis dan Pemeriksaan Akhir
Mengingat teks layar tidak memiliki intonasi suara, pilihlah diksi kalimat aktif yang sopan dan hindari pemakaian huruf besar seluruhnya yang memberi kesan membentak. Biasakan membaca ulang seluruh isi draf dari baris subjek hingga identitas jabatan di kaki surat sebelum menekan tombol pengiriman guna memastikan tidak ada kesalahan penyebutan nama maupun dokumen yang tertinggal."""
        ),
        15: (
            "Penatalaksanaan Klinis Luka Bakar Derajat Satu: Protokol Pendinginan Jaringan dan Perawatan Antiseptik Bersih",
            """Penanganan darurat medis pada cedera termal superfisial di lingkungan domestik memerlukan respon cepat yang berbasis prinsip kedokteran darurat. Kontak mendadak dengan percikan minyak panas atau uap mendidih di ruang dapur memicu reaksi inflamasi akut berupa sensasi perih menyengat, perubahan warna kemerahan, dan pembengkakan lokal yang menuntut pertolongan tepat agar tidak merusak lapisan dermis yang lebih dalam.

## Tindakan Primer Penurunan Suhu Jaringan Terdampak
Respons pertolongan pertama yang mutlak dikerjakan tanpa penundaan adalah mengalirkan cairan bersih yang tidak dingin langsung ke bagian yang terpapar panas selama belasan menit. Tindakan de-eskalasi termal ini membatasi penyebaran energi panas ke lapisan sel yang lebih dalam, meredakan keparahan edema jaringan, serta memberikan efek mati rasa alami yang mengurangi penderitaan korban cedera.

## Penolakan Penggunaan Bahan Dapur yang Menyesatkan
Masyarakat perlu meninggalkan kebiasaan mengoleskan pasta pembersih gigi atau lemak mentega pada kulit yang baru saja terkena panas. Lapisan berminyak justru mengunci sisa kalor di dalam pori-pori dan membawa mikroba patogen yang memicu komplikasi infeksi berbahaya. Selain itu, menempelkan bongkahan es secara langsung sangat tidak disarankan karena dapat memicu penyempitan vaskular drastis yang merusak sel epitelial.

## Perawatan Higienis Pasca Penyejukan Mandiri
Usai pembasuhan selesai, tepuk-tepuk permukaan secara perlahan menggunakan kain steril hingga kering tanpa memberikan tekanan berlebih. Berikan lapisan tipis pelembab medis seperti gel lidah buaya murni atau salep antibiotik guna mempertahankan hidrasi fisiologis jaringan epitel. Pasang penutup kain pelindung yang longgar agar terhindar dari gesekan pakaian harian, dan hindari menusuk gelembung lepuhan air yang muncul secara sengaja."""
        ),
    }

    p2_drafts = []
    for top in topics:
        tid = top["topic_id"]
        title, content = p2_contents[tid]
        words = len(content.split())
        draft = {
            "id": f"draft-{tid:02d}-P2",
            "topic_id": tid,
            "category": top["category"],
            "target_query": top["query"],
            "stratum": "P2",
            "stratum_description": "Legitimate Multi-Source Web Synthesis & Counter-Angle",
            "draft_title": title,
            "ground_truth_label": "Layak Terbit",
            "expert_notes": "Sintesis multi-sumber independen, parafrasa struktural mandiri, MATTR > 0.80, HKO <= 25%, bebas jiplakan kalimat.",
            "draft_content": content,
            "word_count": words,
        }
        p2_drafts.append(draft)
    return p2_drafts


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


def assemble_60_drafts() -> List[Dict[str, Any]]:
    """Menggabungkan seluruh 60 draf terstruktur multi-strata."""
    p1 = load_p1_drafts()
    p2 = build_p2_drafts()
    n1 = build_n1_drafts()
    n2 = build_n2_drafts()
    n3 = build_n3_drafts()
    n4 = build_n4_drafts()
    n5 = build_n5_drafts()

    all_drafts = []
    by_topic = {i: [] for i in range(1, 16)}

    for d in p1:
        by_topic[d["topic_id"]].append(d)
    for d in p2:
        by_topic[d["topic_id"]].append(d)
    for d in n1:
        by_topic[d["topic_id"]].append(d)
    for d in n2:
        by_topic[d["topic_id"]].append(d)
    for d in n3:
        by_topic[d["topic_id"]].append(d)
    for d in n4:
        by_topic[d["topic_id"]].append(d)
    for d in n5:
        by_topic[d["topic_id"]].append(d)

    for tid in sorted(by_topic.keys()):
        all_drafts.extend(by_topic[tid])

    return all_drafts


async def main():
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

    print("=" * 80)
    print("   MEMBANGUN DATASET BENCHMARK 60 DRAF MULTI-STRATA WASKITA")
    print("=" * 80)

    drafts = assemble_60_drafts()
    print(f"Total Draf Terbangun: {len(drafts)} draf artikel")

    strata_counts = {}
    gt_counts = {}
    for d in drafts:
        st = d.get("stratum", "Unknown")
        gt = d["ground_truth_label"]
        strata_counts[st] = strata_counts.get(st, 0) + 1
        gt_counts[gt] = gt_counts.get(gt, 0) + 1

    print("\nDistribusi Per Strata:")
    for st, c in sorted(strata_counts.items()):
        print(f"  - Strata {st}: {c} draf")
    print(f"Total Positif (Layak Terbit) : {gt_counts.get('Layak Terbit', 0)} draf")
    print(f"Total Negatif (Perlu Revisi) : {gt_counts.get('Perlu Revisi', 0)} draf")

    out_file = os.path.join(BACKEND_DIR, "tests", "fixtures", "dataset_60_drafts.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(drafts, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Dataset berhasil disimpan ke: {out_file}")

    print("\n" + "=" * 80)
    print("   MEMVERIFIKASI KINERJA DETERMINISTIK 60 DRAF PADA IR ENGINE...")
    print("=" * 80)

    thresholds = ThresholdConfig(
        max_cosine_similarity=0.60,
        min_mattr=0.55,
        max_hko_percentage=40.0,
        min_cds_score=75.0,
    )

    tp = tn = fp = fn = 0
    mismatches = []
    strata_performance = {st: {"total": 0, "correct": 0} for st in strata_counts}

    for i, d in enumerate(drafts, 1):
        res = await evaluate_draft(d, thresholds)
        st = res["stratum"]
        strata_performance[st]["total"] += 1

        cat = res["confusion_category"]
        if cat == "TP":
            tp += 1
            strata_performance[st]["correct"] += 1
        elif cat == "TN":
            tn += 1
            strata_performance[st]["correct"] += 1
        elif cat == "FP":
            fp += 1
            mismatches.append(res)
        elif cat == "FN":
            fn += 1
            mismatches.append(res)

        status_mark = "PASS" if res["is_match"] else "FAIL"
        print(f"[{i:02d}/60] {res['id']:<14} | {st:<2} | CDS: {res['cds_score']:>5.1f}% | Pred: {res['predicted_verdict']:<30} | {status_mark} ({cat})")

    total = len(drafts)
    acc = (tp + tn) / total
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0

    print("\n" + "=" * 60)
    print("       RINGKASAN AKURASI 60 DRAF MULTI-STRATA")
    print("=" * 60)
    print(f"Akurasi Total : {acc * 100:.2f}% ({tp + tn}/{total})")
    print(f"Precision     : {prec * 100:.2f}%")
    print(f"Recall        : {rec * 100:.2f}%")
    print(f"F1-Score      : {f1 * 100:.2f}%")
    print(f"Confusion Mtx : TP={tp}, TN={tn}, FP={fp}, FN={fn}")
    print("-" * 60)
    print("Performa Per Strata:")
    for st, data in sorted(strata_performance.items()):
        pct = (data["correct"] / data["total"]) * 100 if data["total"] > 0 else 0
        print(f"  - {st:<2} : {data['correct']}/{data['total']} ({pct:.1f}%)")
    print("=" * 60)

    if mismatches:
        print(f"\n[PERINGATAN] Ada {len(mismatches)} draf mismatch:")
        for m in mismatches:
            print(f"  - {m['id']} (Strata {m['stratum']}): GT={m['ground_truth']}, Pred={m['predicted_verdict']}, CDS={m['cds_score']}")
    else:
        print("\n[SEMPURNA] 100% Seluruh 60 draf multi-strata lulus uji verifikasi secara deterministik!")


if __name__ == "__main__":
    asyncio.run(main())
