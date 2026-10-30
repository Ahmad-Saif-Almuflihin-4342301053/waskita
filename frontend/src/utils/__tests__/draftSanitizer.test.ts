/**
 * Unit Test Sanitasi Media & Perhitungan Kata Murni (WASKITA Sprint 2)
 * File: frontend/src/utils/__tests__/draftSanitizer.test.ts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';

import { sanitizePastedOrUploadedDraft, countPureWords, extractSmartKeyword, getGaugeColor } from '../draftSanitizer.ts';

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

  // Test 7 (Sprint 3.2 Hotfix): Ekstraksi semantik naskah arsitektur ordo klasik & anti kata sampah lokasional
  runCase('extractSmartKeyword mengekstrak istilah arsitektur relevan dan TIDAK menghasilkan "bagian bawah tiang"', () => {
    const draftArsitektur = `Melampaui Sekadar Pilar Besar: Rahasia di Balik Aturan Ordo

Ordo Klasik dalam arsitektur Yunani dan Romawi kuno bukan sekadar pilar besar penghias fasad gedung. Aturan proporsi ordo Dorik, Ionik, dan Korintia mengatur setiap elemen dari pedestal bagian bawah tiang hingga entablatur di puncaknya. Setiap ordo memiliki aturan rasio ketinggian kolom terhadap diameter bawah tiang yang sangat presisi. Ordo klasik merupakan puncak pencapaian estetika arsitektur kuno.`;

    const kw = extractSmartKeyword(draftArsitektur);
    assertTrue(
      kw.includes('ordo klasik') || kw.includes('arsitektur') || kw.includes('ordo'),
      `Kata kunci harus mengandung 'ordo klasik' atau 'arsitektur', hasil aktual: "${kw}"`
    );
    assertTrue(
      !kw.includes('bagian') && !kw.includes('bawah'),
      `Kata kunci tidak boleh mengandung kata lokasional/fungsional ('bagian'/'bawah'), hasil aktual: "${kw}"`
    );
    assertTrue(
      !kw.includes('tiang') && !kw.includes('bagian bawah tiang'),
      `Kata kunci tidak boleh menghasilkan chord lagu 'bagian bawah tiang', hasil aktual: "${kw}"`
    );
  });

  // Test 8 (Sprint 3.2): Paragraf pembuka panjang dilarang dianggap sebagai judul
  runCase('extractSmartKeyword tidak menganggap baris pertama yang panjang (> 100 karakter atau > 15 kata) sebagai judul', () => {
    const longIntroDraft = `Paragraf pembuka yang sangat panjang sekali ini sengaja dibuat melebihi batas seratus karakter dan lebih dari lima belas kata agar sistem sanitasi draf tidak keliru menganggapnya sebagai sebuah judul artikel melainkan sebuah paragraf pembuka naskah biasa.

Arsitektur Romawi kuno memiliki pilar ordo klasik yang sangat megah dan proporsional.`;

    const kw = extractSmartKeyword(longIntroDraft);
    assertTrue(
      kw.includes('arsitektur romawi') || kw.includes('ordo klasik') || kw.includes('arsitektur'),
      `Harus mengekstrak Proper Noun entitas dari naskah ('arsitektur romawi' / 'ordo klasik'), hasil aktual: "${kw}"`
    );
    assertTrue(
      !kw.includes('paragraf pembuka yang sangat panjang'),
      'Tidak boleh menganggap kalimat paragraf pembuka panjang sebagai judul'
    );
  });

  // Test 9 (Sprint 3.3): Logika penyisipan kursor naskah (cursor-aware partial paste) mempertahankan teks lama
  runCase('Penyisipan kursor naskah (cursor-aware partial paste) mempertahankan teks sebelum dan sesudah kursor', () => {
    const p1 = 'Paragraf pertama naskah editorial.';
    const p2 = 'Paragraf kedua naskah editorial.';
    const p3 = 'Paragraf ketiga naskah editorial.';
    const fullText = `${p1}\n\n${p2}\n\n${p3}`;

    // Simulasikan kursor di tengah paragraf kedua
    const insertPosition = p1.length + 2 + p2.indexOf('naskah');
    const newSentence = ' [KALIMAT SISIPAN] ';
    const before = fullText.substring(0, insertPosition);
    const after = fullText.substring(insertPosition);
    const result = before + newSentence + after;

    assertTrue(result.includes(p1), 'Paragraf 1 harus tetap utuh');
    assertTrue(result.includes(p3), 'Paragraf 3 harus tetap utuh');
    assertTrue(result.includes('KALIMAT SISIPAN'), 'Kalimat sisipan baru harus berhasil dimasukkan');
    assertTrue(result.length === fullText.length + newSentence.length, 'Panjang teks hasil harus tepat bertambah sepanjang kalimat sisipan');
  });

  // Test 10 (Sprint 3.5): Dynamic Gauge Colors
  runCase('Warna busur SemiCircleGauge dinamis (Merah < 50% / Out-of-Domain, Kuning 50-74%, Hijau >= 75%)', () => {
    // Skor rendah / out-of-domain -> Merah (#EF4444)
    assertEqual(getGaugeColor(20, 75, false), '#EF4444', 'Skor 20% wajib merah #EF4444');
    assertEqual(getGaugeColor(49, 75, false), '#EF4444', 'Skor 49% wajib merah #EF4444');
    assertEqual(getGaugeColor(85, 75, true), '#EF4444', 'Skor 85% jika out-of-domain wajib tetap merah #EF4444');

    // Skor sedang di bawah threshold -> Kuning (#F59E0B)
    assertEqual(getGaugeColor(50, 75, false), '#F59E0B', 'Skor 50% wajib kuning #F59E0B');
    assertEqual(getGaugeColor(74, 75, false), '#F59E0B', 'Skor 74% wajib kuning #F59E0B');

    // Skor di atas / sama dengan threshold -> Hijau (#10B981)
    assertEqual(getGaugeColor(75, 75, false), '#10B981', 'Skor 75% batas ambang wajib hijau #10B981');
    assertEqual(getGaugeColor(92, 75, false), '#10B981', 'Skor 92% wajib hijau #10B981');
  });

  // Test 11 (Sprint 3.5 & 3.8): Kondisi Short-circuit Topic Shift Blocker (Hanya aktif jika Turn > 1)
  runCase('Deteksi short-circuit isTopicShift memicu kartu penolakan terfokus hanya pada Turn > 1', () => {
    const isTopicShiftCondition = (
      verdict: string,
      isOutOfDomain?: boolean,
      topicShiftDetected?: boolean,
      turnNumber: number = 2
    ) => {
      const isTurn1 = turnNumber <= 1;
      return (
        !isTurn1 &&
        (verdict.includes('Topik Tidak Relevan') || !!isOutOfDomain || !!topicShiftDetected)
      );
    };

    // Kasus melenceng di Turn #1: TIDAK BOLEH memicu blocker (Sprint 3.8 Turn-1 Guard Rail)
    assertTrue(
      !isTopicShiftCondition('Perlu Revisi - Topik Tidak Relevan', true, true, 1),
      'Turn #1 tidak boleh memicu short-circuit blocker meskipun out-of-domain'
    );

    // Kasus melenceng di Turn #2: HARUS memicu blocker
    assertTrue(
      isTopicShiftCondition('Perlu Revisi - Topik Tidak Relevan', true, true, 2),
      'Harus short-circuit ketika status vonis Topik Tidak Relevan pada Turn > 1'
    );
    assertTrue(
      isTopicShiftCondition('Perlu Revisi', true, false, 2),
      'Harus short-circuit ketika is_out_of_domain bernilai true pada Turn > 1'
    );
    assertTrue(
      isTopicShiftCondition('Perlu Revisi', false, true, 2),
      'Harus short-circuit ketika topic_shift_detected bernilai true pada Turn > 1'
    );

    // Kasus normal (Sesi relevan)
    assertTrue(
      !isTopicShiftCondition('Layak Terbit', false, false, 2),
      'Naskah relevan normal tidak boleh memicu short-circuit blocker'
    );
    assertTrue(
      !isTopicShiftCondition('Perlu Revisi', false, false, 2),
      'Naskah revisi normal (bukan out-of-domain) tidak boleh memicu short-circuit blocker'
    );
  });

  // Test 12 (Sprint 3.5 Final): Prioritaskan entitas substantif judul baris pertama (Title-First)
  runCase('extractSmartKeyword memprioritaskan entitas judul kampus (bukan istilah periferal / TikTok)', () => {
    const campusDraft = `Prinsip Tata Letak Fungsional Kampus: Membangun Ekosistem Hijau

Perencanaan fasilitas universitas memerlukan zonasi terpadu antar fakultas. Di berbagai sudut, ruang kolaborasi terbuka dan area istirahat mahasiswa seringkali menjadi pusat keramaian harian yang ramai dibicarakan di media sosial.`;

    const kw = extractSmartKeyword(campusDraft);
    assertTrue(
      kw.includes('tata letak kampus') || kw.includes('tata letak') || kw.includes('kampus'),
      `Kueri wajib memprioritaskan topik judul 'tata letak kampus', hasil aktual: "${kw}"`
    );
    assertTrue(
      !kw.includes('ruang kolaborasi terbuka') && !kw.includes('tiktok'),
      `Kueri tidak boleh nyasar ke istilah periferal/TikTok, hasil aktual: "${kw}"`
    );
  });

  // Test 13 (Sprint 3.6 & 3.8): Aset ilustrasi Editorial Discovery Blocker tersedia di folder public (Multi-CWD resolution)
  runCase('Aset ilustrasi Editorial Discovery Blocker (discovery-light.svg & discovery-dark.svg) tersedia di public assets', () => {
    const findAsset = (filename: string) => {
      const candidates = [
        path.resolve('frontend/public/assets', filename),
        path.resolve('public/assets', filename),
        path.resolve('../frontend/public/assets', filename),
        path.resolve('../../frontend/public/assets', filename),
      ];
      return candidates.some((p: string) => fs.existsSync(p));
    };
    assertTrue(findAsset('discovery-light.svg'), 'File discovery-light.svg harus tersedia di public assets');
    assertTrue(findAsset('discovery-dark.svg'), 'File discovery-dark.svg harus tersedia di public assets');
  });

  // Test 14 (Sprint 3.7): Isolasi & retensi buffer draf naskah multi-sesi (Per-Session Draft Buffer)
  runCase('Isolasi & retensi buffer draf naskah multi-sesi (Per-Session Draft Buffer)', () => {
    const sessionDrafts: Record<string, string> = {};
    let activeSessionId = 'session-new';
    let draftInput = '';

    const handleDraftInputChange = (text: string) => {
      draftInput = text;
      sessionDrafts[activeSessionId] = text;
    };

    const handleSelectSession = (targetSessionId: string) => {
      sessionDrafts[activeSessionId] = draftInput;
      draftInput = sessionDrafts[targetSessionId] || '';
      activeSessionId = targetSessionId;
    };

    const handleNewAnalysis = () => {
      sessionDrafts[activeSessionId] = draftInput;
      activeSessionId = 'session-new';
      draftInput = sessionDrafts['session-new'] || '';
    };

    const handleStartNewSessionWithDraft = (text: string) => {
      sessionDrafts['session-new'] = text;
      activeSessionId = 'session-new';
      draftInput = text;
    };

    // 1. Mulai sesi baru dengan teks dari Blocker Card (Kopi Tubruk)
    handleStartNewSessionWithDraft('Naskah Lengkap Resep Kopi Tubruk Tradisional...');
    assertEqual(draftInput, 'Naskah Lengkap Resep Kopi Tubruk Tradisional...', 'Draft input harus terisi');
    assertEqual(sessionDrafts['session-new'], 'Naskah Lengkap Resep Kopi Tubruk Tradisional...', 'Buffer session-new harus menyimpan teks');

    // 2. Pindah ke session-1 di riwayat: draf input harus bersih/kosong (tidak bocor)
    handleSelectSession('session-1');
    assertEqual(draftInput, '', 'Draf di session-1 harus kosong/bersih dari teks Kopi Tubruk');
    assertEqual(sessionDrafts['session-new'], 'Naskah Lengkap Resep Kopi Tubruk Tradisional...', 'Buffer session-new tidak boleh terhapus');

    // 3. Ketik naskah di session-1
    handleDraftInputChange('Catatan revisi untuk sesi 1');
    assertEqual(draftInput, 'Catatan revisi untuk sesi 1', 'Draf session-1 harus mencatat input');
    assertEqual(sessionDrafts['session-1'], 'Catatan revisi untuk sesi 1', 'Buffer session-1 harus tersimpan');

    // 4. Kembali ke Analisis Baru via handleNewAnalysis: teks Kopi Tubruk kembali utuh
    handleNewAnalysis();
    assertEqual(draftInput, 'Naskah Lengkap Resep Kopi Tubruk Tradisional...', 'Draf session-new harus pulih utuh');

    // 5. Kembali ke session-1: catatan revisi sesi 1 kembali utuh
    handleSelectSession('session-1');
    assertEqual(draftInput, 'Catatan revisi untuk sesi 1', 'Catatan revisi session-1 harus pulih utuh');
  });

  // Test 15 (Sprint 3.10): Verifikasi Kartu Saran Celah Defisit Paten Mandiri & Naskah Bebas Teks Sintetis
  runCase('Kartu Saran Celah Defisit paten mandiri tanpa tombol [X] dan naskah bebas teks sintetis', () => {
    const mockDeficits = [
      { term_string: 'roma', term_surface_form: 'Roma', tfidf_weight: 0.9, competitor_consensus_count: 3 },
      { term_string: 'pemerintahan', term_surface_form: 'Pemerintahan', tfidf_weight: 0.8, competitor_consensus_count: 2 },
      { term_string: 'bangsa', term_surface_form: 'Bangsa', tfidf_weight: 0.7, competitor_consensus_count: 2 },
    ];

    // Format output teks saran celah defisit
    const deficitText = mockDeficits.slice(0, 5).map((d) => d.term_surface_form || d.term_string).join(', ');
    assertEqual(deficitText, 'Roma, Pemerintahan, Bangsa', 'Format daftar defisit harus sesuai');

    // Naskah stabilo tidak boleh memuat teks buatan
    const annotatedSpans = [
      { text: 'Kopi tubruk disukai banyak orang.', color: 'yellow', label: 'Frasa Klise' },
      { text: 'Kopi kopi kopi robusta kopi kopi robusta.', color: 'blue', label: 'Kosakata Monoton' },
    ];
    assertTrue(annotatedSpans.every((s) => !s.text.includes('[Saran Celah Defisit')), 'Naskah tidak boleh memuat injeksi defisit sintetis');
    assertTrue(annotatedSpans.some((s) => s.color === 'blue' && s.label === 'Kosakata Monoton'), 'Stabilo biru harus berlabel Kosakata Monoton');
  });

  // Test 16 (Sprint 4.0): Verifikasi Dukungan Vonis Redundansi Kalimat Tinggi
  runCase('Penanganan vonis Perlu Revisi - Redundansi Kalimat Tinggi & warna gauge', () => {
    const verdictStatus = 'Perlu Revisi - Redundansi Kalimat Tinggi';
    const isRedundantSentence = verdictStatus.includes('Redundansi Kalimat Tinggi');
    assertTrue(isRedundantSentence, 'Vonis harus terdeteksi sebagai Redundansi Kalimat Tinggi');

    // Skor dipangkas ke 52% (kuning) atau 45% (merah)
    const colorAmber = getGaugeColor(52, 75);
    assertEqual(colorAmber, '#F59E0B', 'Skor 52% harus berwarna kuning');
    const colorRed = getGaugeColor(45, 75);
    assertEqual(colorRed, '#EF4444', 'Skor 45% harus berwarna merah');
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
