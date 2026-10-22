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

/**
 * Ekstraksi kandidat kata kunci cerdas (3–6 kata) dari baris pertama / kalimat pembuka naskah.
 * Menghilangkan kata umum seperti "resep", "cara", "panduan", dll jika diawali tanda pagar/judul,
 * dan menghasilkan frasa target yang relevan.
 */
export function extractSmartKeyword(text: string): string {
  if (!text || !text.trim()) return '';

  // Hapus token gambar/video
  const clean = text
    .replace(/\[gambar\s*\d+\]/gi, ' ')
    .replace(/\[video\s*\d+\]/gi, ' ')
    .trim();

  // Ambil baris pertama yang bermakna
  const lines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return '';

  // Bersihkan markdown headings #, ##, **, quotes
  let firstLine = lines[0]
    .replace(/^#+\s*/, '')
    .replace(/^[*_~`]+|[*_~`]+$/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  // Jika baris pertama terlalu pendek (< 3 karakter) atau hanya angka, coba baris kedua
  if (firstLine.length < 3 && lines.length > 1) {
    firstLine = lines[1]
      .replace(/^#+\s*/, '')
      .replace(/^[*_~`]+|[*_~`]+$/g, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  // Potong di tanda titik atau tanda tanya atau tanda seru atau koma jika ada kalimat panjang
  const sentenceMatch = firstLine.split(/[.:?!;]/)[0];
  const candidate = (sentenceMatch || firstLine).trim();

  // Bersihkan karakter non-alfanumerik di awal/akhir
  const cleanedCandidate = candidate.replace(/^[^\w]+|[^\w]+$/g, '');

  // Batasi ke 3-6 kata pertama
  const words = cleanedCandidate.split(/\s+/).filter((w) => w.length > 0);
  if (words.length <= 6 && words.length >= 2) {
    return words.join(' ').toLowerCase();
  } else if (words.length > 6) {
    return words.slice(0, 5).join(' ').toLowerCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    return words[0].toLowerCase();
  }

  return clean.slice(0, 30).trim().toLowerCase();
}
