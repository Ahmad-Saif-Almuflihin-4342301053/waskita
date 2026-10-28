/**
 * Utilitas Sanitasi Media & Ekstraksi Kata / Kata Kunci Cerdas
 * Sesuai Standar PZN (Eko Kurniawan Khannedy) & Spesifikasi WASKITA Sprint 2
 */

/**
 * Mengubah elemen media (gambar & video) menjadi token penanda bersih [gambar 1], [video 1], dst.
 * Mendukung input HTML dari clipboard rich-text (WordPress, Google Docs, AI) maupun teks Markdown/plain.
 */
export function sanitizePastedOrUploadedDraft(
  rawText: string,
  rawHtml?: string
): { cleanText: string; imageCount: number; videoCount: number } {
  let imageCounter = 0;
  let videoCounter = 0;

  // Jika terdapat rawHtml (misal paste dari WordPress Gutenberg, Docs, atau Web), proses via DOMParser
  if (rawHtml && rawHtml.trim().length > 0 && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // 1. Ekstrak dan ganti elemen video (<iframe ...>, <video ...>, <embed ...>, figure.wp-block-embed)
      const videoElements = doc.querySelectorAll('iframe, video, embed, figure.wp-block-embed');
      videoElements.forEach((el) => {
        videoCounter++;
        const token = doc.createTextNode(`\n[video ${videoCounter}]\n`);
        el.parentNode?.replaceChild(token, el);
      });

      // 2. Ekstrak dan ganti elemen gambar (<img ...>, figure.wp-block-image)
      const imageElements = doc.querySelectorAll('img, figure.wp-block-image');
      imageElements.forEach((el) => {
        imageCounter++;
        const token = doc.createTextNode(`\n[gambar ${imageCounter}]\n`);
        el.parentNode?.replaceChild(token, el);
      });

      // 3. Ambil teks hasil parsing DOM
      let extractedText = doc.body.innerText || doc.body.textContent || '';
      extractedText = cleanUpExtractedText(extractedText);

      // Cek apakah masih ada sisa markdown image / data:image / embed youtube di teks
      const textSanitized = sanitizePlainTextMedia(extractedText, imageCounter, videoCounter);
      return {
        cleanText: textSanitized.cleanText,
        imageCount: textSanitized.imageCount,
        videoCount: textSanitized.videoCount,
      };
    } catch (e) {
      console.warn('DOMParser failed in sanitizePastedOrUploadedDraft, falling back to regex:', e);
    }
  }

  // Fallback atau teks plain / Markdown
  return sanitizePlainTextMedia(rawText, 0, 0);
}

/**
 * Sanitasi regex untuk plaintext, markdown, base64 images, shortcodes, dan embed URL
 */
function sanitizePlainTextMedia(
  text: string,
  initialImageCount = 0,
  initialVideoCount = 0
): { cleanText: string; imageCount: number; videoCount: number } {
  let imageCounter = initialImageCount;
  let videoCounter = initialVideoCount;
  let clean = text;

  // 1. Video embeds: <iframe ...></iframe>, <video>...</video>, <embed ...>
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, () => {
    videoCounter++;
    return `\n[video ${videoCounter}]\n`;
  });
  clean = clean.replace(/<video[\s\S]*?<\/video>/gi, () => {
    videoCounter++;
    return `\n[video ${videoCounter}]\n`;
  });
  clean = clean.replace(/<embed[\s\S]*?>/gi, () => {
    videoCounter++;
    return `\n[video ${videoCounter}]\n`;
  });

  // YouTube / Vimeo standalone link embed (https://www.youtube.com/watch?v=... or youtu.be/... or vimeo.com/...)
  clean = clean.replace(
    /(?:^|\n)\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[^\s]+)\s*(?:\n|$)/gi,
    () => {
      videoCounter++;
      return `\n[video ${videoCounter}]\n`;
    }
  );

  // 2. HTML <img> tags
  clean = clean.replace(/<img[\s\S]*?>/gi, () => {
    imageCounter++;
    return `\n[gambar ${imageCounter}]\n`;
  });

  // 3. WordPress [caption]...[/caption]
  clean = clean.replace(/\[caption[\s\S]*?\[\/caption\]/gi, () => {
    imageCounter++;
    return `\n[gambar ${imageCounter}]\n`;
  });

  // 4. Markdown images: ![alt](url)
  clean = clean.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, () => {
    imageCounter++;
    return `\n[gambar ${imageCounter}]\n`;
  });

  // 5. Data URI images: data:image/[a-zA-Z]+;base64,[a-zA-Z0-9+/=]+
  clean = clean.replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[a-zA-Z0-9+/=]+/gi, () => {
    imageCounter++;
    return `\n[gambar ${imageCounter}]\n`;
  });

  // 6. Standalone image URLs: http(s)://...jpg|png|webp|gif|jpeg|svg
  clean = clean.replace(
    /(?:^|\n)\s*(https?:\/\/[^\s]+?\.(?:png|jpe?g|webp|gif|svg))(?:\?[^\s]*)?\s*(?:\n|$)/gi,
    () => {
      imageCounter++;
      return `\n[gambar ${imageCounter}]\n`;
    }
  );

  // Strip remaining HTML tags but keep paragraph breaks
  clean = clean.replace(/<\/?[^>]+(>|$)/g, ' ');

  // Normalisasi spasi dan baris baru berlebih
  clean = cleanUpExtractedText(clean);

  return {
    cleanText: clean,
    imageCount: imageCounter,
    videoCount: videoCounter,
  };
}

function cleanUpExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Menghitung jumlah kata murni naskah dengan mengabaikan token [gambar N] dan [video N].
 * Token dihitung berdasarkan kata yang terpisah spasi/whitespace.
 */
export function countPureWords(text: string): number {
  if (!text || !text.trim()) return 0;

  // Hilangkan token [gambar N] dan [video N]
  const stripped = text
    .replace(/\[gambar\s*\d+\]/gi, ' ')
    .replace(/\[video\s*\d+\]/gi, ' ')
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF-]/g, ' ')
    .trim();

  if (!stripped) return 0;

  const words = stripped.split(/\s+/).filter((w) => w.length > 0 && !/^[\d_-]+$/.test(w));
  return words.length;
}

const INDONESIAN_STOPWORDS = new Set([
  'yang', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau',
  'ini', 'itu', 'adalah', 'sebagai', 'sebuah', 'para', 'saat', 'ada', 'tidak',
  'bisa', 'dapat', 'juga', 'lebih', 'sangat', 'telah', 'sudah', 'akan', 'secara',
  'hal', 'per', 'bagi', 'agar', 'karena', 'jika', 'tetapi', 'namun', 'seperti',
  'oleh', 'tentang', 'kita', 'anda', 'mereka', 'kami', 'saya', 'dia', 'ia',
  'suatu', 'maupun', 'serta', 'hingga', 'sampai', 'antara', 'setiap', 'semua',
  'beberapa', 'seluruh', 'banyak', 'sedikit', 'lain', 'baru', 'lama', 'awal',
  'akhir', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan',
  'sembilan', 'sepuluh', 'pertama', 'kedua', 'ketiga', 'hari', 'bulan', 'tahun',
  'bukan', 'hanya', 'saja', 'pun', 'lalu', 'kemudian', 'bahkan', 'maka', 'begitu',
  'menjadi', 'membuat', 'melakukan', 'adanya', 'tersebut', 'harus', 'wajib',
  'dosa', 'besar', 'cara', 'tips', 'rahasia', 'panduan', 'trik', 'langkah', 'alasan',
  'faktor', 'mengapa', 'kenapa', 'bagaimana', 'apa', 'siapa', 'kapan', 'dimana',
  'ternyata', 'simak', 'inilah', 'berikut', 'ampuh', 'mudah', 'cepat', 'tepat',
  'paling', 'sering', 'kurang', 'terlalu', 'selalu', 'belum', 'masih', 'pernah'
]);

/**
 * Ekstraksi kata kunci semantik menyeluruh (Whole-Text Extraction) - Sprint 3.1:
 * Memindai seluruh teks naskah untuk mengidentifikasi topik substantif dominan (Term Frequency & Bigram Collocation),
 * mengabaikan kata tugas dan jargon clickbait (misal judul '3 Dosa Besar Membangun Properti'
 * diekstrak menjadi 'desain arsitektur properti', bukan agama).
 */
export function extractSmartKeyword(text: string): string {
  if (!text || !text.trim()) return '';

  // 1. Bersihkan token media [gambar N], [video N], dsb.
  const clean = text
    .replace(/\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*[^\]]*\]/gi, ' ')
    .trim();

  const lines = clean.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return '';

  const titleSection = lines.slice(0, 2).join(' ').toLowerCase();
  const allWords = clean
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !/^[\d_-]+$/.test(w));

  if (allWords.length === 0) return clean.slice(0, 30).trim().toLowerCase();

  // 2. Hitung frekuensi unigram dan bigram substantif
  const unigramCounts: Record<string, number> = {};
  const bigramCounts: Record<string, number> = {};

  for (let i = 0; i < allWords.length; i++) {
    const w1 = allWords[i];
    if (!INDONESIAN_STOPWORDS.has(w1)) {
      const inTitle = titleSection.includes(w1) ? 2.5 : 1.0;
      unigramCounts[w1] = (unigramCounts[w1] || 0) + inTitle;
    }

    if (i < allWords.length - 1) {
      const w2 = allWords[i + 1];
      if (!INDONESIAN_STOPWORDS.has(w1) && !INDONESIAN_STOPWORDS.has(w2) && w1 !== w2) {
        const bg = `${w1} ${w2}`;
        const inTitle = titleSection.includes(bg) ? 3.5 : 1.5;
        bigramCounts[bg] = (bigramCounts[bg] || 0) + inTitle;
      }
    }
  }

  // Cari bigram dengan frekuensi tertinggi
  let topBigram = '';
  let topBigramScore = 0;
  for (const [bg, score] of Object.entries(bigramCounts)) {
    if (score > topBigramScore) {
      topBigramScore = score;
      topBigram = bg;
    }
  }

  // Cari unigram substantif dengan frekuensi tertinggi di luar bigram
  const sortedUnigrams = Object.entries(unigramCounts).sort((a, b) => b[1] - a[1]);

  if (topBigram && topBigramScore >= 2.0) {
    // Cari unigram pelengkap yang tidak terkandung dalam topBigram
    const [wA, wB] = topBigram.split(' ');
    const complementary = sortedUnigrams.find(([w]) => w !== wA && w !== wB);
    if (complementary && complementary[1] >= 2.0 && (topBigram + ' ' + complementary[0]).length <= 40) {
      return `${topBigram} ${complementary[0]}`;
    }
    return topBigram;
  }

  // Fallback: Gabungkan 2-3 unigram paling dominan
  if (sortedUnigrams.length >= 2) {
    const topWords = sortedUnigrams.slice(0, 3).map(([w]) => w);
    return topWords.join(' ');
  } else if (sortedUnigrams.length === 1) {
    return sortedUnigrams[0][0];
  }

  return clean.slice(0, 30).trim().toLowerCase();
}
