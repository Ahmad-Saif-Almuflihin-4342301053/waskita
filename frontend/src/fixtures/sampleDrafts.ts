/**
 * Curated Sample Drafts Fixture & User Memory Buffer (Domain Fixture)
 * Digunakan untuk Quick-Start Demo pada Empty State & Guest Workspace.
 *
 * Spesifikasi Panjang: ~700 kata (memenuhi batas minimal 300 kata).
 * Dilengkapi dengan Memory Tampungan (localStorage) agar isi draf
 * dapat diperbarui dinamis sesuai preferensi pengguna di masa mendatang.
 */

export interface SampleDraftItem {
  id: 'revisionNeeded' | 'approvedReady';
  title: string;
  subtitle: string;
  query: string;
  text: string;
  wordCount: number;
  description: string;
  tag: string;
  updatedAt?: string;
}

export type SampleDraftsMap = Record<'revisionNeeded' | 'approvedReady', SampleDraftItem>;

const STORAGE_KEY = 'waskita_user_sample_drafts_v1';

export const DEFAULT_SAMPLE_DRAFTS: SampleDraftsMap = {
  revisionNeeded: {
    id: 'revisionNeeded',
    title: 'Resep Kopi Tubruk Tradisional dan Cara Menyeduhnya yang Benar',
    subtitle: 'Contoh artikel umum dengan defisit takaran suhu seduh dan rasio air (~700 kata)',
    query: 'resep kopi tubruk tradisional',
    wordCount: 726,
    description: 'Contoh draf berpanjang ideal (~700 kata) namun bergaya generik/klise dan kekurangan entitas konsensus SERP (Perlu Revisi).',
    tag: 'Perlu Revisi',
    text: `Resep Kopi Tubruk Tradisional dan Cara Menyeduhnya yang Benar

Kopi tubruk adalah salah satu minuman tradisional paling populer di Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung menggunakan air panas tanpa disaring sama sekali. Minuman khas nusantara ini sangat digemari oleh semua kalangan masyarakat mulai dari generasi tua hingga anak muda masa kini. Banyak orang menyukai kopi tubruk karena aromanya yang sangat wangi dan pekat serta langkah pembuatannya yang sangat mudah sekali untuk dipraktikkan sendiri di rumah.

Dalam kehidupan sehari-hari masyarakat Indonesia, menikmati secangkir kopi tubruk sudah menjadi kebiasaan rutin yang tidak bisa dilepaskan. Mulai dari waktu pagi hari saat udara masih sejuk dan matahari baru saja terbit, hingga sore hari menjelang petang ketika berkumpul bersama keluarga atau rekan kerja. Kopi tubruk selalu hadir menemani obrolan santai di warung kopi pinggir jalan hingga ruang tamu rumah tinggal. Kehadiran kopi tubruk mampu memberikan kehangatan dan kesegaran bagi siapa saja yang menikmatinya setelah lelah beraktivitas seharian penuh.

Bagi sebagian besar masyarakat di berbagai pelosok Nusantara, terutama di daerah pulau Jawa, Bali, dan Sumatra, kopi tubruk bukan hanya sekadar minuman penghilang rasa kantuk. Kopi tubruk telah menjadi bagian dari identitas budaya lokal yang diwariskan secara turun-temurun dari kakek nenek terdahulu. Pada zaman dahulu, para petani dan pekerja kebun biasa meminum kopi tubruk sebelum berangkat ke ladang untuk menambah tenaga serta stamina dalam bekerja. Tradisi bersahaja ini terus bertahan hingga era modern sekarang ini.

Bahan-bahan yang Dibutuhkan untuk Menyeduh
Untuk membuat seduhan kopi tubruk tradisional yang nikmat di rumah, bahan-bahan yang harus Anda persiapkan sebenarnya sangat sederhana dan mudah didapatkan di warung terdekat:
1. Bubuk kopi hitam murni berkualitas baik secukupnya.
2. Gula pasir putih atau gula kelapa sesuai dengan selera manis Anda.
3. Air bersih matang yang dimasak hingga mendidih.
4. Cangkir keramik atau gelas kaca tebal tahan panas.
5. Sendok kecil untuk mengaduk seduhan.

Langkah-Langkah Pembuatan Kopi Tubruk
Berikut ini adalah panduan praktis dan langkah mudah cara membuat kopi tubruk tanpa ampas naik ke permukaan yang sering dipraktikkan oleh para pecinta kopi di rumah:

Langkah pertama adalah menyiapkan cangkir bersih. Masukkan bubuk kopi ke dalam cangkir sebanyak dua sendok teh penuh. Jika Anda menyukai rasa kopi yang lebih manis dan legit, Anda bisa menambahkan gula pasir sebanyak satu hingga dua sendok teh ke dalam cangkir tersebut. Namun bagi Anda yang lebih menyukai rasa pahit alami kopi hitam, Anda tentu saja tidak perlu menambahkan gula sama sekali ke dalam cangkir.

Langkah kedua adalah memasak air hingga mendidih bergolak. Setelah air mendidih, segera angkat wadah air panas tersebut lalu tuangkan air mendidih secara perlahan ke dalam cangkir yang sudah terisi bubuk kopi dan gula. Pastikan air panas membasahi seluruh permukaan bubuk kopi secara merata agar aromanya langsung tercium semerbak memenuhi seluruh ruangan dapur Anda.

Langkah ketiga adalah mengaduk campuran kopi tersebut. Gunakan sendok kecil untuk mengaduk kopi dan gula secara memutar searah putaran jarum jam selama beberapa detik hingga gula benar-benar larut. Setelah diaduk merata, diamkan cangkir kopi selama beberapa menit tanpa diganggu. Hal ini bertujuan agar butiran ampas bubuk kopi yang masih melayang di permukaan air dapat perlahan-lahan mengendap turun ke bagian dasar cangkir.

Tips Sederhana Agar Kopi Tubruk Lebih Wangi
Ada beberapa tips sederhana yang bisa Anda terapkan saat menyeduh kopi tubruk. Pilihlah bubuk kopi yang baru digiling dan simpanlah bubuk kopi di dalam toples kedap udara agar aromanya tidak cepat memudar. Selain itu, gunakan cangkir keramik yang memiliki dinding tebal karena wadah keramik tebal terbukti efektif menjaga kestabilan panas seduhan kopi lebih lama dibanding cangkir kaca biasa.

Menikmati Kopi Tubruk Bersama Camilan Tradisional
Setelah ampas kopi mengendap sempurna di bagian dasar, kopi tubruk tradisional Anda sudah siap untuk diseruput selagi hangat. Nikmatilah setiap tegukan kopi tubruk dengan perlahan dan hati-hati agar ampas yang ada di dasar cangkir tidak ikut terminum ke dalam mulut. Rasa kopi yang pekat berpadu dengan aroma wangi yang khas akan memberikan kenikmatan tersendiri bagi para penikmat minuman tradisional nusantara.

Menyeruput kopi tubruk akan terasa jauh lebih lengkap dan nikmat jika ditemani oleh aneka camilan atau jajanan pasar tradisional. Pisang goreng tepung yang renyah dan gurih, singkong rebus hangat dengan taburan parutan kelapa, ubi jalar kukus, atau biskuit kelapa renyah adalah pasangan terbaik yang sangat cocok disandingkan bersama secangkir kopi tubruk hangat. Duduk santai di teras beranda rumah sambil menikmati kopi tubruk dan camilan tradisional di kala waktu senggang merupakan momen santai sederhana yang sangat membahagiakan bagi banyak orang di penjuru Nusantara.`,
  },
  approvedReady: {
    id: 'approvedReady',
    title: 'Eksplorasi Robusta Dampit: Panduan Resep Kopi Tubruk Tradisional Rasio 1:15',
    subtitle: 'Contoh artikel dengan entitas unik lokal dan parameter presisi (~700 kata)',
    query: 'resep kopi tubruk tradisional',
    wordCount: 691,
    description: 'Contoh draf berkualitas tinggi (~700 kata) dengan kedalaman ekstraksi presisi dan entitas unik Robusta Dampit (Siap Terbit).',
    tag: 'Siap Terbit',
    text: `Eksplorasi Robusta Dampit: Panduan Resep Kopi Tubruk Tradisional Rasio 1:15

Menikmati seduhan kopi tubruk sejatinya merayakan kesederhanaan rasa yang jujur tanpa intervensi saringan mekanis kertas maupun kain. Ketika sebagian besar penikmat kopi modern terpaku pada kerumitan metode pour-over manual brew, metode penyeduhan tradisional tubruk khas Nusantara justru menyimpan potensi ekstraksi sensoris yang sangat kaya bila dieksekusi dengan parameter terukur. Salah satu komoditas legendaris terbaik untuk seduhan tubruk presisi adalah biji kopi Robusta Dampit yang dibudidayakan di lereng vulkanik Gunung Semeru, Kabupaten Malang, Jawa Timur.

Karakteristik Unik Robusta Dampit
Tumbuh subur pada ketinggian 600 hingga 800 meter di atas permukaan laut dengan naungan vegetasi alami, Robusta Dampit memiliki profil citarasa yang sangat distingtif dibandingkan varietas robusta komersial pada umumnya. Karakter sensory profile yang menonjol meliputi nuansa cokelat hitam pekat (dark cocoa), aroma rempah manis karamel (sweet caramel spices), serta kekentalan body yang tebal dan lembut menyerupai mentega di lidah (buttery mouthfeel). Kandungan keasaman alami yang tergolong rendah berpadu harmonis dengan tingkat kepahitan bersih (clean bitterness), menghasilkan profil rasa yang bundar sempurna tanpa sensasi getir mengganggu di kerongkongan.

Standardisasi Variabel dan Parameter Seduh Presisi
Untuk menghasilkan secangkir kopi tubruk berstandar kompetisi cupping profesional, disiplin parameter rasio seduhan dan termodinamika ekstraksi air memegang peranan krusial:
1. Rasio Seduhan Emas 1:15: Timbang tepat 15 gram bubuk kopi untuk volume 225 mililiter air panas.
2. Tingkat Gilingan (Grind Size): Gunakan tingkat gilingan medium-fine dengan konsistensi partikel seragam, menyerupai butiran pasir pantai halus.
3. Parameter Termal Air 92°C: Gunakan air mineral dengan kandungan dissolved solids (TDS) antara 100 hingga 150 ppm yang dipanaskan hingga suhu optimal 92 derajat Celsius. Hindari penggunaan air mendidih 100°C karena temperatur ekstrem tersebut berisiko menghanguskan senyawa aromatik volatil dan melepaskan tanin berlebih.
4. Gelas Porselen atau Keramik Tebal: Berfungsi menjaga kestabilan retensi suhu seduhan selama proses ekstraksi berlangsung.

Protokol Penyeduhan Empat Tahap
Proses peracikan kopi tubruk presisi terbagi ke dalam empat fase sistematis:

Tahap Pertama: Fase Blooming (Degasifikasi Karbon Dioksida)
Masukkan 15 gram bubuk kopi Robusta Dampit ke dalam cangkir porselen yang telah dihangatkan terlebih dahulu. Tuangkan 45 mililiter air bersuhu 92°C secara melingkar perlahan untuk membasahi seluruh partikel kopi secara merata. Diamkan selama 30 detik. Fase blooming ini sangat penting untuk melepaskan sisa gas karbon dioksida yang terperangkap di dalam selulosa biji sangrai, sehingga air ekstraksi utama dapat berpenetrasi secara sempurna ke pori-pori kopi.

Tahap Kedua: Tuangan Utama (Main Pouring)
Setelah 30 detik berlalu, segera lanjutkan penuangan sisa air panas sebanyak 180 mililiter hingga mencapai volume total 225 mililiter. Lakukan penuangan dengan aliran air halus dan stabil menggunakan gerakan konsentris dari bagian tengah cangkir menuju tepi dinding tanpa menghantam pinggir secara kasar. Biarkan proses ekstraksi alami berlangsung selama 3 menit 30 detik di mana lapisan buih kerak kopi (crust) akan terbentuk tebal di permukaan cangkir.

Tahap Ketiga: Pemecahan Kerak dan Pengendapan Ampas (Crust Stirring)
Pada menit ke-4, gunakan sendok cupping bergagang panjang untuk memecah lapisan kerak kopi di permukaan seduhan. Lakukan pengadukan lembut sebanyak tepat 3 kali putaran searah jarum jam, lalu serap buih busa minyak berlebih di permukaan cangkir menggunakan sendok. Gaya sentrifugal ringan dari pengadukan ini akan memicu partikel ampas kopi yang tersuspensi untuk segera basah kuyup dan tenggelam mengendap sempurna ke dasar cangkir dalam tempo 90 detik, menghasilkan cairan seduhan atas yang sangat bersih tanpa sensasi berpasir di lidah.

Tahap Keempat: Pemanis Alami Opsional
Bila menghendaki sentuhan rasa manis, tambahkan 5 hingga 10 mililiter sirup gula aren organik cair lokal berkualitas premium pada tahap akhir. Karakter gula aren yang kaya mineral melengkapi rasa cokelat pekat Robusta Dampit tanpa pernah menenggelamkan jati diri rasa autentik dari biji kopi itu sendiri.

Menghormati Warisan Gastronomi Nusantara
Menyajikan kopi tubruk dengan parameter saintifik bukan berarti melucuti kesederhanaannya, melainkan menaikkan kelas warisan leluhur nusantara ke panggung gastronomi global. Kombinasi ketepatan temperatur air 92°C, kontrol rasio seduh 1:15, dan jeda sedimentasi ampas yang disiplin membuktikan bahwa secangkir kopi tubruk rumahan mampu menghadirkan pengalaman sensoris mewah yang menandingi kafe modern manapun di dunia.

Menyeruput secangkir kopi tubruk Robusta Dampit di beranda rumah mengajarkan kita tentang arti kesabaran dan penghargaan mendalam terhadap proses seduh. Tanpa perlu mesin espresso yang rumit dan mahal, kekayaan rasa kopi Indonesia dapat tereksplorasi secara paripurna melalui ketelitian parameter seduh yang benar.`,
  },
};

/**
 * Mengambil seluruh draf dari memory tampungan (localStorage).
 * Jika belum ada di memory, mengembalikan DEFAULT_SAMPLE_DRAFTS.
 */
export function getSampleDrafts(): SampleDraftsMap {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_SAMPLE_DRAFTS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAMPLE_DRAFTS;
    const parsed = JSON.parse(raw);
    return {
      revisionNeeded: { ...DEFAULT_SAMPLE_DRAFTS.revisionNeeded, ...(parsed.revisionNeeded || {}) },
      approvedReady: { ...DEFAULT_SAMPLE_DRAFTS.approvedReady, ...(parsed.approvedReady || {}) },
    };
  } catch (err) {
    console.warn('Gagal membaca memory tampungan draf:', err);
    return DEFAULT_SAMPLE_DRAFTS;
  }
}

/**
 * Mengambil salah satu draf dari memory tampungan.
 */
export function getSampleDraft(key: 'revisionNeeded' | 'approvedReady'): SampleDraftItem {
  const all = getSampleDrafts();
  return all[key] || DEFAULT_SAMPLE_DRAFTS[key];
}

/**
 * Menyimpan pembaruan draf ke memory tampungan (localStorage)
 * sesuai preferensi pengguna.
 */
export function saveSampleDraft(
  key: 'revisionNeeded' | 'approvedReady',
  partial: Partial<SampleDraftItem>
): SampleDraftItem {
  const current = getSampleDrafts();
  const updatedItem: SampleDraftItem = {
    ...current[key],
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  const updatedAll: SampleDraftsMap = {
    ...current,
    [key]: updatedItem,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    } catch (err) {
      console.warn('Gagal menyimpan draf ke memory tampungan:', err);
    }
  }

  return updatedItem;
}

/**
 * Mereset memory tampungan kembali ke draf default kurasi Waskita (~700 kata).
 */
export function resetSampleDrafts(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Gagal mereset memory tampungan draf:', err);
    }
  }
}

/**
 * Proxy SAMPLE_DRAFTS untuk backward compatibility:
 * Akses properti SAMPLE_DRAFTS[key] secara dinamis membaca dari memory tampungan.
 */
export const SAMPLE_DRAFTS: SampleDraftsMap = new Proxy(DEFAULT_SAMPLE_DRAFTS, {
  get(target, prop: 'revisionNeeded' | 'approvedReady') {
    if (prop === 'revisionNeeded' || prop === 'approvedReady') {
      return getSampleDraft(prop);
    }
    return (target as any)[prop];
  },
});
