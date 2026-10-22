/**
 * Unit Test Sanitasi Media & Perhitungan Kata Murni (WASKITA Sprint 2)
 * File: frontend/src/utils/__tests__/draftSanitizer.test.ts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

import { sanitizePastedOrUploadedDraft, countPureWords, extractSmartKeyword } from '../draftSanitizer.ts';

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`[FAIL] ${message} | Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

export function runSanitizerTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function runCase(name: string, fn: () => void): void {
    try {
      fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      failed++;
      console.error(`  ✗ ${name}:`, err instanceof Error ? err.message : String(err));
    }
  }

  console.log('\n--- Menjalankan Unit Test draftSanitizer.test.ts ---');

  // Test 1: Pembersihan <img src='...'>, ![alt](url), <iframe src='youtube...'>
  runCase('Pembersihan mixed media tag HTML <img>, Markdown ![](), dan <iframe>', () => {
    const rawInput = `
      # Panduan Kopi Tubruk
      Langkah awal adalah menyiapkan cangkir dan biji kopi pilihan.
      <img src="https://example.com/biji-kopi.jpg" alt="Biji Kopi">
      Setelah itu, giling biji kopi hingga tingkat kehalusan medium halus.
      ![Proses Penggilingan](https://example.com/grind.png)
      Tuangkan air bersuhu sembilan puluh derajat celcius secara perlahan.
      <iframe src="https://www.youtube.com/embed/videokopi123" width="560" height="315"></iframe>
      Aduk perlahan dan biarkan ampas mengendap sempurna selama empat menit.
    `;

    const result = sanitizePastedOrUploadedDraft(rawInput);
    assertEqual(result.imageCount, 2, 'Jumlah gambar harus terdeteksi 2');
    assertEqual(result.videoCount, 1, 'Jumlah video harus terdeteksi 1');
    assertTrue(result.cleanText.includes('[gambar 1]'), 'Harus memuat [gambar 1]');
    assertTrue(result.cleanText.includes('[gambar 2]'), 'Harus memuat [gambar 2]');
    assertTrue(result.cleanText.includes('[video 1]'), 'Harus memuat [video 1]');
    assertTrue(!result.cleanText.includes('<img'), 'Tag <img> tidak boleh tersisa');
    assertTrue(!result.cleanText.includes('![Proses Penggilingan]'), 'Sintaks markdown gambar tidak boleh tersisa');
    assertTrue(!result.cleanText.includes('<iframe'), 'Tag <iframe> tidak boleh tersisa');
  });

  // Test 2: Urutan pembersihan token media sequential
  runCase('Penomoran token gambar dan video berurutan [gambar 1], [gambar 2], [video 1]', () => {
    const raw = '<img src="1.jpg"> dan <img src="2.png"> serta <iframe src="https://youtube.com"></iframe>';
    const result = sanitizePastedOrUploadedDraft(raw);
    assertEqual(result.imageCount, 2, 'Total gambar 2');
    assertEqual(result.videoCount, 1, 'Total video 1');
    const idxImg1 = result.cleanText.indexOf('[gambar 1]');
    const idxImg2 = result.cleanText.indexOf('[gambar 2]');
    const idxVid1 = result.cleanText.indexOf('[video 1]');
    assertTrue(idxImg1 !== -1 && idxImg2 !== -1 && idxVid1 !== -1, 'Semua token harus ada');
  });

  // Test 3: countPureWords mengabaikan token [gambar N] dan [video N]
  runCase('countPureWords mengabaikan token [gambar N] dan [video N]', () => {
    const baseSentence = 'Kopi tubruk tradisional diseduh air mendidih tanpa filter';
    const wordsOnlyCount = countPureWords(baseSentence);
    assertEqual(wordsOnlyCount, 8, 'Kalimat dasar harus tepat 8 kata');

    const sentenceWithMedia = 'Kopi tubruk [gambar 1] tradisional [gambar 2] diseduh air [video 1] mendidih tanpa [video 2] filter [gambar 3]';
    const countWithMedia = countPureWords(sentenceWithMedia);
    assertEqual(countWithMedia, 8, 'Jumlah kata murni dengan token media harus tetap 8 kata');
  });

  // Test 4: countPureWords pada teks kosong atau hanya media
  runCase('countPureWords pada string kosong atau murni berisi token media menghasilkan 0', () => {
    assertEqual(countPureWords(''), 0, 'String kosong menghasilkan 0');
    assertEqual(countPureWords('   '), 0, 'Whitespace menghasilkan 0');
    assertEqual(countPureWords('[gambar 1] [gambar 2] [video 1]'), 0, 'Hanya token media menghasilkan 0');
  });

  // Test 5: countPureWords pada naskah panjang >= 300 kata
  runCase('countPureWords pada naskah panjang dengan media menghasilkan hitungan akurat', () => {
    const wordList = Array.from({ length: 305 }, (_, i) => `kata${i + 1}`);
    const draftText = `${wordList.slice(0, 100).join(' ')} [gambar 1] ${wordList.slice(100, 200).join(' ')} [video 1] ${wordList.slice(200).join(' ')} [gambar 2]`;
    assertEqual(countPureWords(draftText), 305, 'Jumlah kata harus persis 305 kata tanpa terdistorsi media');
  });

  // Test 6: Ekstraksi smart keyword dari baris judul
  runCase('extractSmartKeyword mengambil kata kunci relevan dari heading atau baris pembuka', () => {
    const headingDraft = '# Resep Kopi Tubruk Tradisional Khas Jawa\n\nKopi tubruk merupakan warisan nusantara.';
    const kw = extractSmartKeyword(headingDraft);
    assertTrue(kw.includes('kopi tubruk') || kw.includes('resep kopi'), 'Kata kunci harus mengekstrak topik utama');
    assertTrue(!kw.startsWith('#'), 'Tag hash markdown harus dibersihkan');
  });

  console.log(`\nHasil: ${passed} lulus, ${failed} gagal.\n`);
  if (failed > 0) {
    throw new Error(`${failed} unit test gagal.`);
  }

  return { passed, failed };
}

// Auto-run if executed directly via Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('draftSanitizer.test')) {
  try {
    runSanitizerTests();
  } catch {
    process.exit(1);
  }
}
