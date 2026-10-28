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
  'paling', 'sering', 'kurang', 'terlalu', 'selalu', 'belum', 'masih', 'pernah',
  // Kata lokasional, struktural, fungsional & transisi (Sprint 3.2 Hotfix):
  'bagian', 'bawah', 'atas', 'tengah', 'depan', 'belakang', 'samping', 'luar',
  'sisi', 'aspek', 'bentuk', 'macam', 'jenis', 'melampaui', 'sekadar', 'berupa',
  'terdiri', 'yakni', 'yaitu', 'balik'
]);

/**
 * Ekstraksi kata kunci semantik cerdas (Semantic Entity & Whole-Text Extraction) - Sprint 3.2:
 * 1. Memprioritaskan Entitas Huruf Kapital (Proper Nouns) sebelum lowercase (misal 'Ordo Klasik', 'Arsitektur Romawi').
 * 2. Deteksi judul ketat: baris pertama hanya dianggap judul jika <= 100 karakter dan <= 15 kata.
 * 3. Menghilangkan noise kata lokasional/fungsional ('bagian', 'bawah', 'sekadar', dsb.).
 * 4. Mendukung rekomendasi multi-kata kunci dipisahkan koma agar otomatis menjadi tag chip di UI.
 */
export function extractSmartKeyword(text: string): string {
  if (!text || !text.trim()) return '';

  // 1. Bersihkan token media [gambar N], [video N], dsb.
  const clean = text
    .replace(/\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*[^\]]*\]/gi, ' ')
    .trim();

  const lines = clean.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return '';

  // Deteksi judul: lines[0] hanya dianggap judul jika <= 100 karakter dan <= 15 kata
  let titleText = '';
  const firstLineClean = lines[0].replace(/^#+\s*/, '').trim();
  const firstLineWords = firstLineClean.split(/\s+/).filter(Boolean);
  if (firstLineClean.length <= 100 && firstLineWords.length <= 15) {
    titleText = firstLineClean.toLowerCase();
  }

  const bodyLines = titleText && lines.length > 1 ? lines.slice(1) : lines;
  const bodyText = bodyLines.join('\n');

  // 2. Ekstraksi Entitas Huruf Kapital (Proper Nouns) sebelum lowercase
  const entityMatches = clean.match(/\b[A-Z][a-z\u00C0-\u024F]{2,}(?:[^\S\r\n]+[A-Z][a-z\u00C0-\u024F]{2,}){1,2}\b/g) || [];
  const entityScores: Record<string, number> = {};

  // Proper noun tunggal di tengah kalimat (misal: "ordo Dorik", "arsitektur Romawi")
  const singleEntityBoost: Record<string, number> = {};
  const midSentenceCapitalized = bodyText.match(/(?:[a-z0-9,;]\s+)\b([A-Z][a-z\u00C0-\u024F]{2,})\b/g) || [];
  for (const match of midSentenceCapitalized) {
    const word = match.replace(/^[^A-Z]+/, '').toLowerCase();
    if (!INDONESIAN_STOPWORDS.has(word)) {
      singleEntityBoost[word] = (singleEntityBoost[word] || 0) + 2.0;
    }
  }

  // 3. Frekuensi kata (unigram) dan bigram substantif di seluruh naskah
  const allWords = clean
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !/^[\d_-]+$/.test(w));

  if (allWords.length === 0) return clean.slice(0, 30).trim().toLowerCase();

  const unigramCounts: Record<string, number> = {};
  const bigramCounts: Record<string, number> = {};

  for (let i = 0; i < allWords.length; i++) {
    const w1 = allWords[i];
    if (!INDONESIAN_STOPWORDS.has(w1)) {
      const inTitle = titleText && titleText.includes(w1) ? 2.5 : 1.0;
      const properBoost = singleEntityBoost[w1] || 0;
      unigramCounts[w1] = (unigramCounts[w1] || 0) + inTitle + properBoost;
    }

    if (i < allWords.length - 1) {
      const w2 = allWords[i + 1];
      if (!INDONESIAN_STOPWORDS.has(w1) && !INDONESIAN_STOPWORDS.has(w2) && w1 !== w2) {
        const bg = `${w1} ${w2}`;
        const inTitle = titleText && titleText.includes(bg) ? 3.5 : 1.5;
        bigramCounts[bg] = (bigramCounts[bg] || 0) + inTitle;
      }
    }
  }

  // Skor frasa entitas kapital
  for (const raw of entityMatches) {
    const rawWords = raw.split(/[^\S\r\n]+/);
    const validWords = rawWords.map((w) => w.toLowerCase()).filter((w) => !INDONESIAN_STOPWORDS.has(w));
    if (validWords.length >= 2) {
      const phrase = validWords.join(' ');
      const escaped = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const re = new RegExp('\\b' + escaped + '\\b', 'gi');
      const countInAll = (clean.match(re) || []).length;
      const countInBody = (bodyText.match(re) || []).length;

      // Hindari artefak Title Case judul jika frasa tersebut tidak pernah muncul sama sekali di isi teks
      if (titleText && countInBody === 0 && countInAll === 1) {
        continue;
      }

      const wordQuality = validWords.reduce((acc, w) => acc + (unigramCounts[w] || 1), 0);
      const inTitleBoost = titleText && titleText.includes(phrase) ? 2.5 : 1.0;
      const properBonus = countInBody > 0 ? 3.0 : 1.0;
      entityScores[phrase] = Math.max(entityScores[phrase] || 0, countInAll * wordQuality * inTitleBoost * properBonus);
    }
  }

  const sortedEntities = Object.entries(entityScores).sort((a, b) => b[1] - a[1]);
  const sortedBigrams = Object.entries(bigramCounts).sort((a, b) => b[1] - a[1]);
  const sortedUnigrams = Object.entries(unigramCounts).sort((a, b) => b[1] - a[1]);

  // Pilih kata kunci utama (prioritas: entitas kapital > bigram dominan > unigram)
  let primary = '';
  if (sortedEntities.length > 0 && sortedEntities[0][1] >= 4.0) {
    primary = sortedEntities[0][0];
  } else if (sortedBigrams.length > 0 && sortedBigrams[0][1] >= 2.0) {
    primary = sortedBigrams[0][0];
  } else if (sortedUnigrams.length > 0) {
    primary = sortedUnigrams[0][0];
  }

  if (!primary) return clean.slice(0, 30).trim().toLowerCase();

  // 4. Rekomendasi kata kunci pelengkap (multi-keyword dengan koma untuk tag chip UI)
  const primaryWords = new Set(primary.split(/\s+/));
  let secondary = '';

  // 4a. Cari entitas independen lain
  for (const [ent, score] of sortedEntities.slice(1)) {
    if (score >= 4.0) {
      const entWords = ent.split(/\s+/);
      if (!entWords.some((w) => primaryWords.has(w))) {
        secondary = ent;
        break;
      }
    }
  }

  // 4b. Cari bigram pelengkap jika tidak ada entitas kedua
  if (!secondary) {
    for (const [bg, score] of sortedBigrams) {
      if (score >= 2.5) {
        const bgWords = bg.split(/\s+/);
        if (!bgWords.some((w) => primaryWords.has(w))) {
          secondary = bg;
          break;
        }
      }
    }
  }

  // 4c. Cari unigram pelengkap jika tidak ada bigram
  if (!secondary) {
    const comp = sortedUnigrams.find(([w, score]) => !primaryWords.has(w) && score >= 2.0);
    if (comp) {
      secondary = comp[0];
    }
  }

  // Gabungkan dengan koma jika panjangnya proporsional (<= 45 karakter)
  if (secondary && (primary + ', ' + secondary).length <= 45) {
    return `${primary}, ${secondary}`;
  }

  return primary;
}

/**
 * Menghitung warna busur dinamis SemiCircleGauge (Sprint 3.5):
 * - Merah (#EF4444) jika score < 50 atau isOutOfDomain == True
 * - Kuning (#F59E0B) jika score >= 50 dan score < threshold
 * - Hijau (#10B981) jika score >= threshold
 */
export function getGaugeColor(
  score: number,
  threshold: number = 75,
  isOutOfDomain: boolean = false
): string {
  if (isOutOfDomain || score < 50) {
    return '#EF4444';
  }
  if (score < threshold) {
    return '#F59E0B';
  }
  return '#10B981';
}
