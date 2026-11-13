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
from app.services.gatekeeper import calculate_composite_cds, generate_annotated_spans
from app.services.information_gain import calculate_information_gain
from app.services.nlp_pipeline import extract_candidate_entities, extract_full_stem_set, preprocess_text_async
from app.services.stylometrics import calculate_stylometrics
from app.services.vsm_calculator import compute_vsm_similarity


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
            """Memulai langkah investasi finansial bagi generasi muda menuntut seleksi instrumen aset yang menitikberatkan pada pelestarian modal pokok dan mitigasi volatilitas pasar. Reksa Dana Pasar Uang atau RDPU hadir sebagai sarana investasi awal yang sangat adaptif bagi pemula. Dengan menempatkan seluruh dana kelolaan pada instrumen pasar uang berjangka waktu pendek, produk ini menawarkan imbal hasil yang stabil dan terukur dibandingkan instrumen pasar saham yang fluktuatif.

## Alokasi Portofolio Berisiko Rendah Dikelola Manajer Investasi
Karakteristik keamanan RDPU bersumber dari alokasi dana kelolaan seratus persen ke dalam instrumen deposito berjangka bank nasional bereputasi prima dan obligasi jangka pendek dengan tenor jatuh tempo di bawah satu tahun. Portofolio ini dikelola secara profesional dan terukur oleh manajer investasi berizin resmi. Nilai aktiva bersih per unit penyertaan NAB/UP bergerak meningkat secara konsisten setiap hari bursa tanpa risiko koreksi modal mendak.

## Fleksibilitas Likuiditas Tanpa Denda dan Keunggulan Bebas Pajak
Salah satu keistimewaan RDPU adalah fleksibilitas pencairan saldo investasi kapan saja tanpa dikenakan biaya potongan penalti penarikan dana lebih awal, berbeda dengan deposito perbankan tradisional. Selain itu, keuntungan imbal hasil return reksa dana bukan merupakan objek pemotongan pajak penghasilan PPh, sehingga seluruh pertumbuhan bunga majemuk modal dinikmati secara penuh oleh investor.

## Jaminan Legalitas OJK dan Sistem Perlindungan Bank Kustodian
Keamanan dana nasabah dijamin melalui pengawasan ketat oleh Otoritas Jasa Keuangan OJK serta pemisahan penitipan aset secara independen pada lembaga bank kustodian. Manajer investasi tidak memiliki akses langsung untuk menyalahgunakan dana nasabah di luar kepentingan transaksi portofolio resmi. Pengawasan berlapis ini menjamin transparansi pelaporan dan integritas modal investor dari risiko gagal bayar korporasi."""
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
            """Korespondensi melalui media surat elektronik dalam lingkungan korporat modern bukan sekadar alat pertukaran informasi, melainkan representasi formal atas profesionalisme dan etika kerja seorang karyawan. Ketidakjelasan pesan atau kesalahan struktur dalam email dapat memicu miskomunikasi antar divisi, keterlambatan eksekusi proyek, hingga mencoreng citra reputasi institusi di hadapan mitra eksternal perusahaan.

## Anatomi Penulisan Baris Subjek Jelas dan Komposisi Paragraf
Email bisnis yang efektif diawali dengan perumusan baris subjek yang ringkas, deskriptif, dan memuat kata kunci status urgensi pesan. Salam pembuka formal harus menyebutkan nama dan gelar penerima secara akurat. Susun alur pesan dengan menyampaikan maksud tujuan utama pada paragraf pembuka, dilanjutkan dengan butir-butir argumen pendukung yang mudah dipindai bullet points, serta diakhiri dengan instruksi call to action yang eksplisit dan tenggat waktu yang terukur.

## Format Penataan Kolom To Cc Bcc dan Lampiran Dokumen
Penyusunan daftar penerima menuntut kehati-hatian etika komunikasi. Kolom To diperuntukkan secara eksklusif bagi penanggung jawab utama yang berkewajiban merespons pesan. Kolom Cc tembusan ditujukan bagi pihak terkait yang perlu memantau perkembangan tanpa harus membalas. Kolom Bcc digunakan untuk menjaga kerahasiaan alamat kontak dalam distribusi pengumuman skala besar. Lampiran berkas harus berformat universal seperti PDF dengan penamaan berkas yang rapi dan ukuran kompresi wajar.

## Kesantunan Gaya Bahasa Korporat dan Uji Koreksi Akhir
Gunakan gaya bahasa formal yang santun dan netral, hindari pengetikan menggunakan huruf kapital penuh atau tanda seru ganda yang terkesan agresif. Sebelum menekan tombol kirim send, luangkan waktu satu menit untuk melakukan proses proofreading menyeluruh. Koreksi potensi salah ketik typo, pastikan kelengkapan berkas lampiran, dan periksa kejelasan blok tanda tangan digital resmi."""
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
    """Membangun 6 draf N1 (Verbatim Copy-Paste dari Kompetitor 1)."""
    topics = {t["topic_id"]: t for t in get_topic_metadata()}
    n1_topic_ids = [1, 4, 7, 10, 13, 15]
    n1_drafts = []

    for tid in n1_topic_ids:
        t_meta = topics[tid]
        docs = get_fallback_corpus(t_meta["query"])
        comp1 = docs[0]
        comp2 = docs[1]
        
        title = f"Panduan Praktis {t_meta['query'].title()}"
        copas_text = f"""Berikut adalah panduan lengkap dan ulasan mendalam mengenai {t_meta['query']}.\n\n## {comp1['headings'][0]['text']}\n{comp1['clean_text']}\n\n## {comp1['headings'][1]['text']}\n{comp1['clean_text']}\n\n## {comp2['headings'][0]['text']}\n{comp2['clean_text']}"""
        words = len(copas_text.split())

        draft = {
            "id": f"draft-{tid:02d}-N1",
            "topic_id": tid,
            "category": t_meta["category"],
            "target_query": t_meta["query"],
            "stratum": "N1",
            "stratum_description": "Direct Verbatim Copy-Paste (High Cosine & Red Spans)",
            "draft_title": title,
            "ground_truth_label": "Perlu Revisi",
            "expert_notes": "Menyalin 80%+ teks kompetitor SERP secara langsung. Memicu veto redundansi kalimat dan kemiripan kosinus tinggi.",
            "draft_content": copas_text,
            "word_count": words,
        }
        n1_drafts.append(draft)
    return n1_drafts


def build_n2_drafts() -> List[Dict[str, Any]]:
    """Membangun 6 draf N2 (Mosaic Patchwriting / Cross-Source Stitching)."""
    topics = {t["topic_id"]: t for t in get_topic_metadata()}
    n2_topic_ids = [1, 2, 5, 8, 11, 14]
    n2_drafts = []

    for tid in n2_topic_ids:
        t_meta = topics[tid]
        docs = get_fallback_corpus(t_meta["query"])
        
        c1_sents = [s.strip() for s in re.split(r"[.!?]+", docs[0]["clean_text"]) if len(s.strip().split()) > 7]
        c2_sents = [s.strip() for s in re.split(r"[.!?]+", docs[1]["clean_text"]) if len(s.strip().split()) > 7]
        c3_sents = [s.strip() for s in re.split(r"[.!?]+", docs[2]["clean_text"]) if len(s.strip().split()) > 7]

        s1, s2 = c1_sents[0] + ".", c1_sents[1] + "."
        s3, s4 = c2_sents[0] + ".", c2_sents[1] + "."
        s5, s6 = c3_sents[0] + ".", c3_sents[1] + "."

        title = f"Rangkuman Praktis Mengenai {t_meta['query'].title()}"
        mosaic_text = f"""Dalam memahami topik penting ini, kita harus mencermati berbagai aspek penting yang ada di lapangan. {s1} Oleh karena itu, persiapan yang matang menjadi kunci utama bagi siapa saja. {s2}

## Tinjauan Faktor Kunci dan Strategi
Membahas langkah berikutnya menuntut perhatian kita terhadap metode pelaksanaan yang tepat sasaran. {s3} Di samping itu, banyak pakar di lapangan merekomendasikan hal tersebut demi hasil yang maksimal. {s4}

## Aspek Penting dan Langkah Mitigasi
Pada tahap lanjutan, penerapan teknik yang tepat akan mempermudah pencapaian tujuan yang diharapkan. {s5} Hal ini telah dibuktikan oleh berbagai praktisi yang berpengalaman di bidangnya. {s6} Dengan memperhatikan seluruh pedoman tersebut, Anda dapat mengoptimalkan hasil secara nyata dan terukur."""

        words = len(mosaic_text.split())
        draft = {
            "id": f"draft-{tid:02d}-N2",
            "topic_id": tid,
            "category": t_meta["category"],
            "target_query": t_meta["query"],
            "stratum": "N2",
            "stratum_description": "Mosaic Plagiarism / Cross-Source Patchwriting",
            "draft_title": title,
            "ground_truth_label": "Perlu Revisi",
            "expert_notes": "Plagiarisme mosaik jahit kalimat antar 3 kompetitor. Lolos dari VSM dokumen biasa tetapi tertangkap oleh Broder Containment dan Red-Span Veto Gate.",
            "draft_content": mosaic_text,
            "word_count": words,
        }
        n2_drafts.append(draft)
    return n2_drafts


def build_n3_drafts() -> List[Dict[str, Any]]:
    """Membangun 6 draf N3 (Semantic Hoax / Pseudoscience Hallucination)."""
    topics = {t["topic_id"]: t for t in get_topic_metadata()}
    n3_topic_ids = [2, 3, 6, 9, 12, 15]
    n3_contents = {
        2: (
            "Terapi Tradisional Kuno Mengobati Kanker Serviks Tanpa Obat Medis",
            """Kanker serviks stadium awal sering kali menjadi perbincangan hangat di kalangan masyarakat pedesaan kita. Banyak orang mempercayai bahwa kanker serviks stadium awal sebenarnya dipicu oleh energi mistis dan hawa dingin malam hari. Ketika seseorang sering tidur di lantai semen tanpa alas tidur tebal, hawa dingin merambat ke area tubuh bawah dan memicu penyakit tersebut.

## Pengobatan Alami Tanpa Bantuan Medis Rumah Sakit
Untuk menyembuhkan penyakit ini secara menyeluruh, leluhur menyarankan ritual mandi kembang tujuh rupa di bawah sinar rembulan malam jumat kliwon. Air rendaman aneka bunga segar dipercaya membersihkan aura negatif yang menempel pada tubuh penderita. Selain mandi kembang, minumlah ramuan air rebusan daun pisang kering yang dicampur sejumput garam dapur kasar setiap pagi hari.

## Menjaga Keseimbangan Pikiran Batin dan Hawa Murni
Penyembuhan sejati sesungguhnya datang dari ketenangan batin yang mendalam dan doa spiritual kepada alam semesta raya. Hindari merasa cemas karena rasa cemas memperparah kondisi tubuh yang lemah. Cukup lakukan meditasi hening di pagi hari, hirup aroma dupa wangi melati, dan rendam kedua telapak kaki ke dalam air rebusan batu bata merah yang hangat untuk memulihkan keharmonisan energi."""
        ),
        3: (
            "Rahasia Metafisika Menguasai Peringkat Teratas Google dengan Kristal Piramida",
            """Panduan seo on page artikel blog sesungguhnya tidak memerlukan pemahaman algoritma perayap web crawler komputer yang rumit. Para praktisi kebatinan digital telah menemukan rahasia kuno bahwa frekuensi gelombang getaran elektromagnetik artikel dapat diselaraskan dengan server pusat Google melalui media batu kristal kuarsa putih. Meletakkan piramida kristal kecil di atas papan ketik komputer saat mengetik naskah blog akan memancarkan energi positif ke dalam untaian kabel internet.

## Ritual Menyelaraskan Aura Artikel dengan Mesin Pencari
Sebelum mempublikasikan tulisan ke halaman situs, bacakan mantra afirmasi kelimpahan sebanyak sembilan kali di hadapan layar monitor yang menyala. Bakar sebatang dupa beraroma kayu gaharu di sudut meja kerja untuk membersihkan aura negatif yang menghalangi keterbacaan artikel. Getaran gelombang mistis ini dipercaya memikat algoritma pencari secara otomatis tanpa perlu riset kata kunci atau penulisan heading yang melelahkan.

## Meditasi Penarik Pengunjung Organik Berkelanjutan
Duduklah bersila dengan posisi menghadap arah terbitnya matahari fajar dan visualisasikan jutaan audiens berbondong-bondong membuka tautan situs web Anda. Kunci dari kesuksesan digital adalah kepasrahan total pada takdir alam semesta dan kekuatan telepati gelombang pikiran. Dengan menerapkan metode metafisika spiritual ini secara rutin setiap hari purnama, blog Anda akan menduduki tahta halaman pertama mesin pencari selamanya."""
        ),
        6: (
            "Strategi Mengelola Keuangan Berbasis Ramalan Zodiak dan Energi Semesta",
            """Strategi mengelola keuangan pribadi untuk pemula tidak perlu mengandalkan pencatatan arus kas atau alokasi persentase nominal yang membosankan. Dalam kearifan kuno astrologi galaksi, kelimpahan rezeki seseorang sepenuhnya dikendalikan oleh pergerakan orbit planet Jupiter dan posisi rasi bintang saat tanggal kelahiran. Menyelaraskan kebiasaan belanja harian dengan ramalan horoskop mingguan merupakan kunci utama kemakmuran tanpa batas.

## Ritual Menanam Uang Koin di Bawah Pohon Pisang Emas
Salah satu praktik penarik kemakmuran warisan leluhur adalah mengubur tiga keping uang logam emas di bawah pangkal pohon pisang saat bulan sabit muncul di ufuk barat. Siram tanah kuburan koin tersebut dengan air cucian beras murni setiap senja tiba. Energi magnetik pohon dipercaya melipatgandakan nilai nominal uang yang Anda simpan di dalam dompet tanpa perlu berinvestasi pada instrumen perbankan yang rumit.

## Menghindari Hawa Sial Melalui Warna Dompet Keberuntungan
Pilihlah warna dompet dan pakaian kerja yang serasi dengan elemen zodiak kelahiran Anda untuk menangkal aura kemiskinan yang bertebaran di pasar. Kenakan cincin bermata batu akik merah delima di jari manis tangan kanan guna memperkuat daya tarik uang kertas. Ketenangan batin dan kepatuhan pada petunjuk ramalan bintang menjamin masa depan finansial yang aman dan sejahtera tanpa beban utang."""
        ),
        9: (
            "Metode Dekomposisi Kompos Instan Menggunakan Gelombang Pikiran Telepati",
            """Cara membuat pupuk kompos dari sampah organik dapur kini dapat dilakukan secara instan dalam hitungan jam tanpa memerlukan bakteri pengurai aerobik atau wadah komposter konvensional. Melalui penemuan mutakhir terapi bio-telepati kuantum, frekuensi pikiran manusia mampu merangsang resonansi atom sel tanaman yang telah mati agar terurai seketika menjadi partikel hara murni yang kaya energi kosmik.

## Meditasi Menembus Jaringan Seluler Sampah Sisa Sayuran
Kumpulkan seluruh sisa kulit buah, daun sayur busuk, dan ampas makanan dapur ke atas selembar kain putih bersih di tengah ruang keluarga. Duduklah mengitari tumpukan sampah tersebut bersama keluarga tercinta sambil memejamkan mata secara khidmat. Pancarkan gelombang energi cinta kasih dan visualisasikan tumpukan sampah tersebut menyatu kembali dengan intisari bumi pertiwi dalam keheningan doa yang mendalam.

## Pembakaran Dupa Wangi Pengusir Bau Busuk Organik
Nyalakan tiga batang dupa beraroma cendana wangi di samping tumpukan bahan organik guna menyerap energi aroma tak sedap secara gaib. Asap dupa yang membubung ke angkasa berfungsi sebagai jembatan penghubung antara materi fisik sampah dan entitas spiritual penjaga kesuburan tanah. Tumpukan kompos ajaib ini siap ditaburkan langsung ke pot tanaman tanpa masa tunggu pematangan yang melelahkan."""
        ),
        12: (
            "Melipatgandakan Investasi Reksa Dana Melalui Frekuensi Suara Mangkuk Tibet",
            """Keuntungan investasi reksa dana pasar uang untuk generasi muda sesungguhnya dapat dilipatgandakan hingga ratusan persen dalam sekejap tanpa terpengaruh oleh suku bunga acuan bank sentral. Rahasia tersembunyi para pemodal elit terletak pada pemanfaatan getaran akustik mangkuk bernyanyi Tibet singing bowl yang disetel pada frekuensi harmonik lima ratus dua puluh delapan hertz. Resonansi suara sakral ini dipercaya mampu mengubah nasib saldo portofolio secara metafisika.

## Resonansi Gelombang Suara pada Surat Berharga Investasi
Letakkan lembar sertifikat kepemilikan unit penyertaan atau gawai aplikasi investasi Anda tepat di samping mangkuk logam suci. Putar tongkat kayu secara perlahan mengelilingi bibir mangkuk hingga menghasilkan dengungan suara yang jernih dan bergetar panjang di seluruh penjuru ruangan. Getaran suara sakral tersebut diyakini menarik energi kelimpahan kuantum dan melipatgandakan nilai unit penyertaan secara ajaib tanpa risiko kerugian modal.

## Pemasangan Kristal Giok Penarik Imbal Hasil Keberuntungan
Gantungkan liontin batu giok hijau Burma di atas perangkat elektronik yang Anda gunakan untuk bertransaksi pasar modal. Energi kristal alami berfungsi memancarkan aura perlindungan gaib dari potensi kegagalan manajer investasi di bursa efek. Dengan mengandalkan keajaiban frekuensi getaran suara dan kristal pembawa hoki ini, Anda akan meraih kemandirian ekonomi yang abadi tanpa perlu menganalisis laporan keuangan perbankan."""
        ),
        15: (
            "Pengobatan Metafisika Cedera Panas dengan Meditasi Kristal dan Gelombang Suara",
            """Pengobatan gangguan rasa perih akibat sengatan energi astral di lingkungan rumah sering kali memerlukan penyelarasan cakra tubuh. Banyak orang tidak menyadari bahwa rasa perih di tangan sebenarnya merupakan manifestasi dari ketidakseimbangan medan aura eterik yang terganggu oleh getaran frekuensi negatif di sekitar dapur.

## Ritual Mandi Cahaya Lilin Ungu dan Getaran Gong Tibet
Untuk memulihkan getaran sukma yang terluka, nyalakan lilin aromaterapi berwarna ungu di sudut kamar tidur yang gelap. Bunyikan gong tibet secara perlahan selama tiga puluh menit agar frekuensi gelombang suara harmonik lima ratus hertz meresap ke dalam sukma. Gelombang suara sakral ini dipercaya mengalirkan energi sejuk kosmik yang menenteramkan pikiran tanpa membutuhkan penanganan fisik apa pun.

## Penyelarasan Aura Menggunakan Kristal Giok Salju
Letakkan batu kristal giok salju dingin di atas meja altar di dekat tempat tidur Anda. Meditasi hening dengan memejamkan mata sambil memvisualisasikan butiran salju pegunungan Himalaya turun membasuh seluruh tubuh batiniah Anda. Dengan kepasrahan total kepada kehendak alam semesta, rasa tidak nyaman dipercaya akan memudar dengan sendirinya seiring terbitnya fajar di ufuk timur."""
        ),
    }

    n3_drafts = []
    for tid in n3_topic_ids:
        t_meta = topics[tid]
        title, content = n3_contents[tid]
        words = len(content.split())
        draft = {
            "id": f"draft-{tid:02d}-N3",
            "topic_id": tid,
            "category": t_meta["category"],
            "target_query": t_meta["query"],
            "stratum": "N3",
            "stratum_description": "Semantic Hoax / Pseudoscience Hallucination (Low Consensus)",
            "draft_title": title,
            "ground_truth_label": "Perlu Revisi",
            "expert_notes": "Artikel hoaks/pseudosains mengarang bebas tanpa konsensus ilmiah. Tertangkap oleh Non-Compensatory Pillar Floor C_IG < 45% atau Topic Relevance Gate.",
            "draft_content": content,
            "word_count": words,
        }
        n3_drafts.append(draft)
    return n3_drafts


def build_n4_drafts() -> List[Dict[str, Any]]:
    """Membangun 6 draf N4 (Out-of-Domain Clickbait / Topic Hijacking / Parasite SEO)."""
    topics = {t["topic_id"]: t for t in get_topic_metadata()}
    n4_topic_ids = [3, 4, 6, 7, 10, 13]
    n4_contents = {
        3: (
            "Daftar Situs Slot Gacor Terpercaya Deposit Pulsa Tanpa Potongan Menang Instan",
            """Mencari keuntungan instan melalui platform permainan mesin slot online saat ini menjadi pilihan utama bagi banyak masyarakat di tanah air. Dengan modal receh deposit pulsa sepuluh ribu rupiah tanpa potongan, setiap pemain berpeluang meraih hadiah jackpot sensational progresif hingga ratusan juta rupiah setiap putaran spin. Layanan transaksi penarikan dana cepat via transfer bank lokal dan dompet digital siap melayani dua puluh empat jam non-stop tanpa kendala.

## Bocoran Pola Jam Hoki dan Pola Spin Gacor Hari Ini
Untuk memaksimalkan peluang kemenangan di mesin permainan favorit Anda, ikuti rekomendasi jam gacor malam hari yang telah terbukti memberikan persentase return to player tertinggi. Mulailah permainan dengan taruhan nominal kecil menggunakan fitur turbo spin otomatis sepuluh kali, lalu naikkan nominal taruhan secara bertahap saat simbol pengali petir merah mulai bermunculan di layar permainan Anda. Disiplin dalam memasang target menang dan stop loss mencegah kekalahan modal yang tidak diinginkan.

## Bonus Harian Member VIP dan Cashback Mingguan Melimpah
Daftarkan diri Anda sekarang juga menjadi anggota VIP resmi untuk menikmati bonus selamat datang seratus persen, promo putaran gratis free spin, dan cashback mingguan tanpa batas syarat. Customer service kami yang ramah dan profesional selalu siaga memberikan panduan taktis melalui fitur live chat interaktif. Rasakan sensasi hiburan berhadiah paling spektakuler sepanjang masa bersama jutaan pemain aktif lainnya setiap hari."""
        ),
        4: (
            "Pinjaman Online Cepat Cair Bunga Rendah Syarat KTP Langsung Masuk Rekening",
            """Kebutuhan dana mendesak untuk keperluan darurat rumah tangga sering kali menuntut solusi keuangan kilat tanpa prosedur perbankan yang berbelit-belit. Layanan pinjaman online cepat cair resmi menawarkan kemudahan plafon pinjaman tunai mulai dari lima ratus ribu hingga dua puluh juta rupiah hanya dengan bermodalkan foto kartu tanda penduduk KTP dan nomor telepon aktif Anda. Proses persetujuan cerdas hanya memakan waktu lima menit tanpa survei lapangan ke rumah nasabah.

## Keunggulan Tenor Cicilan Fleksibel dan Bunga Kompetitif
Platform pinjol terpercaya kami menghadirkan skema pembayaran cicilan bulanan yang fleksibel dengan pilihan tenor tiga hingga dua belas bulan yang ramah di kantong debitur. Tingkat suku bunga harian yang transparan dan bebas dari potongan biaya tersembunyi menjamin rasa aman dan nyaman saat mengangsur cicilan. Pembayaran tagihan dapat dilakukan dengan mudah melalui virtual account bank, gerai minimarket modern, maupun dompet elektronik.

## Keamanan Privasi Data Debitur Berstandar Internasional
Kami berkomitmen melindungi seluruh kerahasiaan informasi identitas pribadi nasabah menggunakan enkripsi teknologi keamanan mutakhir berstandar industri. Tidak ada akses data kontak darurat di luar persetujuan legal konsumen. Segera ajukan permohonan pinjaman modal usaha Anda hari ini juga dan nikmati kemudahan pencairan dana tunai langsung ke rekening bank pribadi Anda dalam hitungan detik."""
        ),
        6: (
            "Sinyal Trading Kripto Koin Micin Potensi Cuan Seribu Persen di Telegram",
            """Pasar perdagangan aset kripto cryptocurrency menawarkan volatilitas harga yang sangat ekstrem bagi para trader yang berani mengambil risiko tinggi demi keuntungan berlipat ganda. Mengidentifikasi proyek token koin micin meme coin yang baru saja diluncurkan di jaringan bursa desentralisasi decentralized exchange merupakan strategi tercepat dalam menggandakan portofolio investasi dari modal kecil menjadi ratusan juta rupiah dalam hitungan hari.

## Analisis Likuiditas Token dan Verifikasi Smart Contract
Sebelum mengeksekusi pembelian token baru, pastikan likuiditas token telah dikunci secara permanen pada protokol pembuat pasar otomatis automated market maker guna menghindari jebakan penipuan rug pull developer jahat. Periksa audit kode kontrak pintar smart contract melalui situs pelacak transaksi blockchain publik untuk memastikan tidak ada fitur fungsi minting tersembunyi atau pajak penjualan yang mencekik pembeli.

## Gabung Saluran VIP Sinyal Scalping Harian Akurat
Bergabunglah dengan komunitas trader VIP telegram eksklusif kami untuk mendapatkan notifikasi sinyal entri posisi beli dan target ambil untung take profit secara berkala setiap menit. Tim analis kami menggunakan kombinasi indikator moving average teknikal, volume profil transaksi paus whale, dan sentimen media sosial guna menyaring koin berfundamental kuat. Manfaatkan momentum pergerakan harga pasar banteng bull run sekarang juga."""
        ),
        7: (
            "Kumpulan Kode Cheat Game Battle Royale Senjata Rahasia dan Akun Sultan Gratis",
            """Bermain game aksi tembak-menembak battle royale di ponsel pintar menjadi hobi favorit jutaan remaja di seluruh pelosok nusantara untuk mengisi waktu luang di akhir pekan. Meraih kemenangan mutlak boyah atau juara pertama menuntut kombinasi refleks jari yang lincah, penguasaan peta pertempuran yang taktis, serta koleksi perlengkapan senjata tempur berdaya hancur tinggi yang mematikan di medan pertempuran online.

## Trik Menembak Sasaran Tepat Headshot Tanpa Hentakan Recoil
Bagi para pemain pemula yang kesulitan mengendalikan arah tembakan senapan serbu otomatis, pengaturan kepekaan sensitivitas tombol bidik pada menu pengaturan aplikasi memegang peranan krusial. Gunakan konfigurasi tombol kontrol empat jari untuk mempermudah manuver melompat sambil membidik musuh di balik tembok perlindungan. Pemilihan kombinasi senjata jarak dekat shotgun dan senapan runduk jarak jauh sniper rifle menjamin dominasi di segala medan tempur.

## Pembagian Akun Game Sultan Gratis dengan Skin Senjata Langka
Ikuti program undian giveaway mingguan di kanal komunitas kami untuk memenangkan ratusan akun game premium berisi ribuan bundle pakaian langka, emote eksklusif turnamen, dan diamond tanpa batas secara cuma-cuma. Cukup subscribe kanal resmi kami, bagikan tautan siaran langsung streaming ke media sosial teman-teman Anda, dan cantumkan id identitas karakter Anda pada kolom komentar untuk mengklaim hadiah istimewa."""
        ),
        10: (
            "Ramalan Jodoh Primbon Jawa Kuno Berdasarkan Weton Kelahiran Pasangan",
            """Mencari pasangan hidup yang setia dan membawa berkah rezeki melimpah merupakan dambaan setiap insan manusia yang hendak melangkah ke jenjang pernikahan suci. Kitab warisan leluhur primbon jawa kuno menyediakan metode perhitungan neptu hari pasaran weton kelahiran untuk memetakan kecocokan watak batiniah, potensi rezeki bersama, dan rintangan rumah tangga yang mungkin dihadapi calon mempelai pengantin di masa mendatang.

## Menghitung Nilai Neptu Hari Pasangan Calon Pengantin
Setiap hari masehi dan hari pasaran jawa memiliki bobot nilai angka spiritual tersendiri yang telah dirumuskan sejak berabad-abad silam oleh para sesepuh tanah jawa. Jumlahkan total neptu hari kelahiran Anda bersama neptu pasangan pujaan hati Anda, kemudian bagi dengan rumus angka pembagi keramat guna menemukan kategori ramalan jodoh seperti pegat, ratu, jodoh, topo, tinari, padu, sujanan, atau pesthi yang memuat petunjuk nasib.

## Ritual Ruwatan Sengkolo Penangkal Keretakan Rumah Tangga
Apabila hasil perhitungan neptu pasangan jatuh pada kategori ramalan yang kurang menguntungkan, sesepuh adat menyarankan pelaksanaan upacara selamatan ruwatan sengkolo tolak bala secara sederhana di rumah keluarga. Penyediaan sesaji tumpeng nasi kuning, jajan pasar tradisional, dan doa permohonan keselamatan kepada Tuhan Yang Maha Kuasa dipercaya meluluhkan sengketa asmara serta menaburkan keharmonisan cinta sejati abadi."""
        ),
        13: (
            "Bengkel Modifikasi Knalpot Brong Motor Matic Suara Gahar Tarikan Enteng",
            """Mengubah tampilan estetika visual dan performa tarikan akselerasi sepeda motor matic kesayangan menjadi kebanggaan tersendiri bagi para pecinta modifikasi otomotif roda dua. Mengganti sistem saluran gas buang knalpot standar pabrikan dengan knalpot racing model corong brong berbahan stainless steel anti karat terbukti mendongkrak tenaga putaran mesin atas secara instan dan menghasilkan raungan suara knalpot yang padat bertenaga.

## Penyetelan Ukuran Pipa Leher Knalpot Header dan Silencer
Pemilihan diameter pipa leheran knalpot harus disesuaikan secara presisi dengan kapasitas volume silinder mesin motor Anda agar tidak terjadi penurunan torsi pada putaran bawah. Pipa leher berlekuk roll bending halus memperlancar aliran gas buang tanpa hambatan turbulensi udara. Pasang peredam suara db killer yang dapat dilepas-pasang dengan mudah guna mengontrol tingkat kebisingan desibel suara knalpot saat melintasi pemukiman warga perkotaan.

## Paket Bore Up Piston Harian dan Penyetelan Kirian CVT Matic
Lengkapi modifikasi saluran knalpot racing Anda dengan paket peningkatan kapasitas silinder bore up harian yang aman dan awet untuk pemakaian mobilitas kerja rutin. Kombinasikan dengan penggantian roller berbobot ringan dan per torsi racing pada mangkok puli transmisi otomatis CVT untuk meraih akselerasi tarikan gas yang spontan di tanjakan terjal. Kunjungi bengkel spesialis modifikasi kami untuk mendapatkan penawaran harga terbaik."""
        ),
    }

    n4_drafts = []
    for tid in n4_topic_ids:
        t_meta = topics[tid]
        title, content = n4_contents[tid]
        words = len(content.split())
        draft = {
            "id": f"draft-{tid:02d}-N4",
            "topic_id": tid,
            "category": t_meta["category"],
            "target_query": t_meta["query"],
            "stratum": "N4",
            "stratum_description": "Out-of-Domain Clickbait / Topic Drift / Parasite SEO",
            "draft_title": title,
            "ground_truth_label": "Perlu Revisi",
            "expert_notes": "Artikel melenceng total dari kueri target (misal: kueri pertanian tapi isi slot/pinjol). Memicu Topic Relevance Gate avg_cosine < 0.05.",
            "draft_content": content,
            "word_count": words,
        }
        n4_drafts.append(draft)
    return n4_drafts


def build_n5_drafts() -> List[Dict[str, Any]]:
    """Membangun 6 draf N5 (AI Slop, Spintax Repetitif & Heading Keyword Stuffing)."""
    topics = {t["topic_id"]: t for t in get_topic_metadata()}
    legacy_file = os.path.join(BACKEND_DIR, "tests", "fixtures", "dataset_30_drafts.json")
    with open(legacy_file, "r", encoding="utf-8") as f:
        legacy_drafts = json.load(f)

    legacy_map = {d["id"]: d for d in legacy_drafts}
    n5_drafts = []
    
    # 1. Topic 5 HKO 100%
    d10 = legacy_map["draft-10"]
    n5_drafts.append({
        "id": "draft-05-N5",
        "topic_id": 5,
        "category": topics[5]["category"],
        "target_query": topics[5]["query"],
        "stratum": "N5",
        "stratum_description": "Uncurated AI Slop & Heading Keyword Stuffing (HKO 100%)",
        "draft_title": d10["draft_title"],
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "AI generik mentah, heading keyword stuffing HKO 100%, repetisi istilah tanpa kurasi substantif.",
        "draft_content": d10["draft_content"],
        "word_count": d10["word_count"],
    })

    # 2. Topic 8 HKO 100%
    d16 = legacy_map["draft-16"]
    n5_drafts.append({
        "id": "draft-08-N5",
        "topic_id": 8,
        "category": topics[8]["category"],
        "target_query": topics[8]["query"],
        "stratum": "N5",
        "stratum_description": "Uncurated AI Slop & Heading Keyword Stuffing (HKO 100%)",
        "draft_title": d16["draft_title"],
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "AI generik mentah, repetisi kueri pada seluruh heading HKO 100%, frasa klise bertebaran.",
        "draft_content": d16["draft_content"],
        "word_count": d16["word_count"],
    })

    # 3. Topic 11 HKO 100%
    d22 = legacy_map["draft-22"]
    n5_drafts.append({
        "id": "draft-11-N5",
        "topic_id": 11,
        "category": topics[11]["category"],
        "target_query": topics[11]["query"],
        "stratum": "N5",
        "stratum_description": "Uncurated AI Slop & Heading Keyword Stuffing (HKO 100%)",
        "draft_title": d22["draft_title"],
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "AI generik mentah, pengulangan kata kunci kaku pada setiap judul sub-bab HKO 100%.",
        "draft_content": d22["draft_content"],
        "word_count": d22["word_count"],
    })

    # 4. Topic 9 Spintax Loop (MATTR < 0.50)
    spintax_kompos = """Membuat pupuk kompos dari sampah organik dapur sangat bagus dan sangat mudah sekali. Sampah organik dapur sangat bagus untuk dibuat pupuk kompos. Kita harus membuat pupuk kompos dari sampah organik dapur setiap hari. Sampah organik dapur membuat pupuk kompos menjadi sangat bagus dan sangat bermanfaat sekali bagi tanaman kita. Pupuk kompos sangat bagus dan sampah organik dapur sangat bagus sekali untuk tanaman.

Membuat pupuk kompos sangat bagus karena sampah organik dapur sangat bagus dan sangat mudah. Kita membuat pupuk kompos dengan sampah organik dapur setiap hari di rumah. Tanaman membutuhkan pupuk kompos dari sampah organik dapur agar sangat bagus dan sangat subur sekali. Jika kita membuat pupuk kompos dari sampah organik dapur maka tanah menjadi sangat bagus sekali. Sampah organik dapur adalah sampah yang sangat bagus untuk membuat pupuk kompos.

Semua orang bisa membuat pupuk kompos dari sampah organik dapur dengan sangat mudah dan sangat cepat. Sampah organik dapur sangat bagus untuk pupuk kompos dan pupuk kompos sangat bagus untuk sampah organik dapur. Kita harus selalu membuat pupuk kompos agar sampah organik dapur bermanfaat sangat bagus sekali. Demikianlah cara membuat pupuk kompos dari sampah organik dapur yang sangat bagus dan sangat mudah sekali untuk dicoba di rumah setiap hari."""

    n5_drafts.append({
        "id": "draft-09-N5",
        "topic_id": 9,
        "category": topics[9]["category"],
        "target_query": topics[9]["query"],
        "stratum": "N5",
        "stratum_description": "Lexical Poverty Spintax Loop (MATTR < 0.52)",
        "draft_title": "Membuat Pupuk Kompos dari Sampah Organik Dapur Sangat Bagus",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Spintax loop dengan kosa kata sangat terbatas berulang-ulang tanpa variasi leksikal (MATTR < 0.52).",
        "draft_content": spintax_kompos,
        "word_count": len(spintax_kompos.split()),
    })

    # 5. Topic 12 Spintax Loop (MATTR < 0.50)
    spintax_rdpu = """Keuntungan investasi reksa dana pasar uang untuk generasi muda sangat menguntungkan sekali dan sangat bagus sekali. Reksa dana pasar uang sangat menguntungkan bagi generasi muda yang ingin investasi. Kita harus investasi reksa dana pasar uang karena reksa dana pasar uang sangat menguntungkan sekali bagi generasi muda. Generasi muda bisa investasi reksa dana pasar uang dengan sangat mudah dan sangat aman sekali setiap hari.

Investasi reksa dana pasar uang sangat bagus untuk generasi muda karena sangat menguntungkan sekali. Generasi muda menyukai investasi reksa dana pasar uang karena reksa dana pasar uang sangat bagus sekali. Keuntungan investasi reksa dana pasar uang membuat generasi muda sangat senang sekali berinvestasi. Reksa dana pasar uang adalah investasi yang sangat bagus dan sangat menguntungkan sekali bagi generasi muda di mana saja.

Semua generasi muda harus mencoba investasi reksa dana pasar uang agar mendapatkan keuntungan yang sangat bagus sekali. Reksa dana pasar uang sangat aman dan investasi reksa dana pasar uang sangat menguntungkan bagi generasi muda. Kita harus mulai investasi reksa dana pasar uang sekarang juga demi masa depan generasi muda yang sangat bagus sekali."""

    n5_drafts.append({
        "id": "draft-12-N5",
        "topic_id": 12,
        "category": topics[12]["category"],
        "target_query": topics[12]["query"],
        "stratum": "N5",
        "stratum_description": "Lexical Poverty Spintax Loop (MATTR < 0.52)",
        "draft_title": "Keuntungan Investasi Reksa Dana Pasar Uang untuk Generasi Muda",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Spintax repetitif berulang-ulang dengan kosakata sangat miskin (MATTR < 0.52).",
        "draft_content": spintax_rdpu,
        "word_count": len(spintax_rdpu.split()),
    })

    # 6. Topic 14 HKO 100% Keyword Stuffing
    content_email_stuffing = """Etika komunikasi profesional dalam email bisnis adalah hal yang sangat penting sekali. Etika komunikasi profesional dalam email bisnis harus diterapkan setiap hari. Etika komunikasi profesional dalam email bisnis membuat kita sukses.

## Etika Komunikasi Profesional dalam Email Bisnis Kantor
Etika komunikasi profesional dalam email bisnis di kantor sangat perlu. Etika komunikasi profesional dalam email bisnis sangat bagus dan sangat baik. Semua orang harus tahu etika komunikasi profesional dalam email bisnis.

## Panduan Etika Komunikasi Profesional dalam Email Bisnis
Panduan etika komunikasi profesional dalam email bisnis sangat mudah dipahami. Etika komunikasi profesional dalam email bisnis memberikan manfaat besar. Kita harus mematuhi etika komunikasi profesional dalam email bisnis.

## Pentingnya Etika Komunikasi Profesional dalam Email Bisnis
Pentingnya etika komunikasi profesional dalam email bisnis tidak diragukan lagi. Etika komunikasi profesional dalam email bisnis adalah kunci keberhasilan. Terapkan etika komunikasi profesional dalam email bisnis sekarang juga."""

    n5_drafts.append({
        "id": "draft-14-N5",
        "topic_id": 14,
        "category": topics[14]["category"],
        "target_query": topics[14]["query"],
        "stratum": "N5",
        "stratum_description": "Uncurated AI Slop & Heading Keyword Stuffing (HKO 100%)",
        "draft_title": "Etika Komunikasi Profesional dalam Email Bisnis Sangat Penting",
        "ground_truth_label": "Perlu Revisi",
        "expert_notes": "Heading keyword stuffing 100% dengan repetisi kaku di seluruh sub-judul.",
        "draft_content": content_email_stuffing,
        "word_count": len(content_email_stuffing.split()),
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


async def evaluate_single_draft(draft: Dict[str, Any], thresholds: ThresholdConfig) -> Dict[str, Any]:
    """Evaluasi satu draf melalui pipa lengkap IR Engine WASKITA."""
    query = draft["target_query"]
    content = draft["draft_content"]
    title = draft["draft_title"]
    ground_truth = draft["ground_truth_label"]
    stratum = draft.get("stratum", "Unknown")

    docs = get_fallback_corpus(query)
    prep_d = await preprocess_text_async(content)
    prep_c = [await preprocess_text_async(c["clean_text"]) for c in docs]
    vsm = compute_vsm_similarity(prep_d, prep_c)

    full_draft_stems = extract_full_stem_set(content)
    full_comp_stems_list = [extract_full_stem_set(c["clean_text"]) for c in docs]

    draft_entities = extract_candidate_entities(content, top_n=40)
    competitor_entities_list = [extract_candidate_entities(c["clean_text"], top_n=35) for c in docs]

    entity_gaps = calculate_information_gain(
        draft_entities=draft_entities,
        competitor_entities_list=competitor_entities_list,
        draft_tfidf_weights=vsm["draft_tfidf_weights"],
        full_draft_stems=full_draft_stems,
        full_competitor_stems_list=full_comp_stems_list,
    )

    stylometrics = calculate_stylometrics(content, query)

    annotated_spans = generate_annotated_spans(
        draft_content=content,
        competitor_clean_texts=[c["clean_text"] for c in docs],
        entity_gaps=entity_gaps,
        hko_percentage=stylometrics["hko_percentage"],
        threshold_hko=thresholds.max_hko_percentage,
    )

    red_spans = [s for s in annotated_spans if s.color == "red"]
    red_span_ratio = len(red_spans) / max(1, len(annotated_spans))

    max_consecutive_red = 0
    curr_consecutive_red = 0
    for span in annotated_spans:
        if span.is_heading or not span.text.strip():
            continue
        if span.color == "red":
            curr_consecutive_red += 1
            if curr_consecutive_red > max_consecutive_red:
                max_consecutive_red = curr_consecutive_red
        else:
            curr_consecutive_red = 0

    serp_candidate_stems = {e[0] for ce in competitor_entities_list for e in ce}
    consensus_serp_stems = set()
    if len(full_comp_stems_list) >= 2:
        for st in serp_candidate_stems:
            doc_freq = sum(1 for c_set in full_comp_stems_list if st in c_set)
            if doc_freq >= 2:
                consensus_serp_stems.add(st)
    if not consensus_serp_stems:
        consensus_serp_stems = serp_candidate_stems
    shared_consensus = consensus_serp_stems.intersection(full_draft_stems)

    decision = calculate_composite_cds(
        max_cosine_sim=vsm["max_cosine_similarity"],
        draft_entities_count=len(full_draft_stems),
        serp_entities_count=len(consensus_serp_stems),
        shared_entities_count=len(shared_consensus),
        gain_count=len(entity_gaps.gain),
        mattr_score=stylometrics["mattr_score"],
        hko_percentage=stylometrics["hko_percentage"],
        thresholds=thresholds,
        avg_cosine_sim=vsm["avg_cosine_similarity"],
        red_span_ratio=red_span_ratio,
        max_consecutive_red=max_consecutive_red,
    )

    pred_verdict = decision["verdict_status"]
    is_positive_gt = (ground_truth == "Layak Terbit")
    is_positive_pred = (pred_verdict in ("Siap Terbit", "Layak Terbit"))

    if is_positive_gt and is_positive_pred:
        cat = "TP"
        is_match = True
    elif not is_positive_gt and not is_positive_pred:
        cat = "TN"
        is_match = True
    elif not is_positive_gt and is_positive_pred:
        cat = "FP"
        is_match = False
    else:
        cat = "FN"
        is_match = False

    return {
        "id": draft["id"],
        "stratum": stratum,
        "title": title,
        "query": query,
        "ground_truth": ground_truth,
        "predicted_verdict": pred_verdict,
        "cds_score": decision["content_differentiation_score"],
        "mattr_score": stylometrics["mattr_score"],
        "hko_percentage": stylometrics["hko_percentage"],
        "max_cosine_sim": vsm["max_cosine_similarity"],
        "avg_cosine_sim": vsm["avg_cosine_similarity"],
        "red_span_ratio": round(red_span_ratio, 3),
        "max_consecutive_red": max_consecutive_red,
        "confusion_category": cat,
        "is_match": is_match,
    }


async def main():
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
        res = await evaluate_single_draft(d, thresholds)
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
