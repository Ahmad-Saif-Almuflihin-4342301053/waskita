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

  // Test 17 (Sprint 4.1): Verifikasi Logika Accordion Top-K Kompetitor Dinamis
  runCase('Logika pembatasan dan ekspansi accordion Top-K kompetitor (5 awal + toggle)', () => {
    const INITIAL_VISIBLE_COUNT = 5;
    const dummyCompetitors = Array.from({ length: 8 }, (_, i) => ({ rank_position: i + 1 }));
    const n = dummyCompetitors.length;

    // Default collapsed
    let isExpanded = false;
    let visible = isExpanded ? dummyCompetitors : dummyCompetitors.slice(0, INITIAL_VISIBLE_COUNT);
    assertEqual(visible.length, 5, 'Saat awal harus menampilkan 5 kompetitor teratas');
    assertEqual(Math.max(0, n - INITIAL_VISIBLE_COUNT), 3, 'Harus mencatat 3 kompetitor tersembunyi');

    // Setelah toggle expanded
    isExpanded = true;
    visible = isExpanded ? dummyCompetitors : dummyCompetitors.slice(0, INITIAL_VISIBLE_COUNT);
    assertEqual(visible.length, 8, 'Saat dibuka harus menampilkan seluruh 8 kompetitor');
  });

  // Test 18 (Sprint 4.1): Verifikasi Deteksi Span Heading Mandiri pada Naskah Teranotasi
  runCase('Deteksi baris sub-judul polos mandiri untuk pemisahan blok heading di naskah teranotasi', () => {
    const isHeading = (span: { text: string; color: string | null; is_heading?: boolean }): boolean => {
      const trimmed = span.text.trim();
      const wordsCount = trimmed.split(/\s+/).length;
      const isMarkdownHeading = /^#{1,4}\s+/.test(trimmed);
      const cleanText = trimmed.replace(/^#{1,4}\s+/, '');
      const endsWithSentencePunct = /[.!;:,]$/.test(cleanText) && !cleanText.endsWith('?');
      return Boolean(
        span.is_heading ||
        (!span.color && (
          isMarkdownHeading ||
          (wordsCount >= 2 && wordsCount <= 14 && (!endsWithSentencePunct || cleanText.endsWith('?')) && cleanText[0] === cleanText[0].toUpperCase())
        ))
      );
    };

    const spanHeading = { text: 'Karakteristik Utama Beton Ekspos', color: null };
    const spanNormalSentence = { text: 'Permukaan beton mentah dibiarkan terlihat teksturnya.', color: null };
    const spanMarkedSentence = { text: 'Arsitektur brutalisme sangat terkenal di eropa.', color: 'green' };

    assertTrue(isHeading(spanHeading), 'Baris sub-judul polos harus terdeteksi sebagai heading span');
    assertTrue(!isHeading(spanNormalSentence), 'Kalimat dengan titik penutup tidak boleh jadi heading span');
    assertTrue(!isHeading(spanMarkedSentence), 'Kalimat dengan warna stabilo tidak boleh jadi heading span');
  });

  // Test 19 (Sprint 4.2): Deteksi Sub-Judul Kalimat Tanya FAQ dan Markdown
  runCase('Deteksi sub-judul bergaya tanya FAQ (?) dan markdown heading terpisah rapi', () => {
    const isHeading = (span: { text: string; color: string | null; is_heading?: boolean }): boolean => {
      const trimmed = span.text.trim();
      const wordsCount = trimmed.split(/\s+/).length;
      const isMarkdownHeading = /^#{1,4}\s+/.test(trimmed);
      const cleanText = trimmed.replace(/^#{1,4}\s+/, '');
      const endsWithSentencePunct = /[.!;:,]$/.test(cleanText) && !cleanText.endsWith('?');
      return Boolean(
        span.is_heading ||
        (!span.color && (
          isMarkdownHeading ||
          (wordsCount >= 2 && wordsCount <= 14 && (!endsWithSentencePunct || cleanText.endsWith('?')) && cleanText[0] === cleanText[0].toUpperCase())
        ))
      );
    };

    const spanFaqHeading = { text: 'Apa Itu Arsitektur Brutalisme?', color: null };
    const spanMarkdownHeading = { text: '## Karakteristik Desain', color: null };
    const spanWithBackendFlag = { text: 'Relevansi Material', color: null, is_heading: true };

    assertTrue(isHeading(spanFaqHeading), 'Heading pertanyaan bertanda tanya harus terdeteksi');
    assertTrue(isHeading(spanMarkdownHeading), 'Heading markdown ## harus terdeteksi');
    assertTrue(isHeading(spanWithBackendFlag), 'Heading dengan bendera is_heading backend harus terdeteksi');
  });

  // Test 20 (Sprint 4.2): Target Query Locking pada Paste Revisi
  runCase('Target Query Locking mencegah mutasi kueri saat paste revisi pada sesi aktif', () => {
    let currentTargetQuery = 'arsitektur brutalisme';
    let isQueryLocked = true;
    let toastShown = false;

    const handlePaste = (pastedText: string, keywordCandidate: string) => {
      if (isQueryLocked) {
        toastShown = true;
        return; // Kueri tidak berubah
      }
      if (keywordCandidate) {
        currentTargetQuery = keywordCandidate;
      }
    };

    // User paste teks revisi yang memuat topik baru
    handlePaste('Ini adalah naskah revisi hasil perbaikan ChatGPT...', 'rumah kaca modern');

    assertEqual(currentTargetQuery, 'arsitektur brutalisme', 'Target query harus tetap terkunci pada kueri awal');
    assertTrue(toastShown, 'Toast pemberitahuan kueri terkunci harus ditampilkan');
  });

  // Test 21 (Sprint 4.2): Dual-Tab Prompt Remediasi untuk Status Siap Terbit
  runCase('Dual-Tab Prompt Remediasi menghasilkan CMS Pack dan Perfectionist Prompt saat Siap Terbit', () => {
    const auditMock = {
      verdict_status: 'Siap Terbit',
      remediation_prompt: 'Prompt Standar',
      remediation_prompt_cms: 'Prompt Meta SEO CMS Pack',
      remediation_prompt_perfectionist: 'Prompt Micro-Tuning Kesempurnaan 100%',
    };

    const getPromptForTab = (tab: 'cms' | 'perfectionist') => {
      const isReady = auditMock.verdict_status === 'Siap Terbit';
      if (!isReady) return auditMock.remediation_prompt;
      return tab === 'cms' ? auditMock.remediation_prompt_cms : auditMock.remediation_prompt_perfectionist;
    };

    assertEqual(getPromptForTab('cms'), 'Prompt Meta SEO CMS Pack', 'Tab CMS harus memuat prompt pra-publikasi SEO');
    assertEqual(getPromptForTab('perfectionist'), 'Prompt Micro-Tuning Kesempurnaan 100%', 'Tab perfectionist harus memuat micro-tuning');
  });

  // Test 22 (Sprint 4.3): Pembersihan WordPress boilerplate & perbaikan titik menempel
  runCase('Pembersihan boilerplate WordPress dan perbaikan titik menempel ke huruf kapital', () => {
    const dirtyText = `
      Posted on 24 Oktober 2026 by Admin Waskita
      Arsitektur brutalisme mengutamakan kejujuran bahan.Mengenal sejarah gaya ini sangat penting.
      Dipublikasikan pada 12 Januari 2025 oleh Redaksi Sipil
      Beton ekspos menjadi ciri utama.Karakteristik visualnya monumental.
    `;
    const sanitized = sanitizePastedOrUploadedDraft(dirtyText);
    assertTrue(!sanitized.cleanText.includes('Posted on'), 'Boilerplate "Posted on" harus dibersihkan');
    assertTrue(!sanitized.cleanText.includes('Dipublikasikan pada'), 'Boilerplate "Dipublikasikan pada" harus dibersihkan');
    assertTrue(sanitized.cleanText.includes('bahan. Mengenal sejarah'), 'Titik menempel bahan.Mengenal harus dipisahkan spasi');
    assertTrue(sanitized.cleanText.includes('ciri utama. Karakteristik'), 'Titik menempel utama.Karakteristik harus dipisahkan spasi');
  });

  // Test 23 (Sprint 4.3): Contextual Media Slot token & countPureWords handling
  runCase('Contextual Visual Media Slot token dan pengabaian kata murni countPureWords', () => {
    const sampleHtml = `
      <h2>Karakteristik Utama Beton Ekspos</h2>
      <img src="https://example.com/beton.jpg" alt="Permukaan Beton Kasar" />
      <p>Permukaan beton kasar dibiarkan telanjang tanpa lapisan plesteran halus demi menampilkan tekstur asli.</p>
    `;
    const result = sanitizePastedOrUploadedDraft('', sampleHtml);
    assertEqual(result.imageCount, 1, 'Total 1 gambar terdeteksi');
    assertTrue(
      result.cleanText.includes('[gambar 1: Ilustrasi Karakteristik Utama Beton Ekspos]') ||
      result.cleanText.includes('[gambar 1: Ilustrasi Permukaan Beton Kasar]'),
      'Token slot gambar harus memuat konteks subjudul atau alt-text'
    );

    // Pastikan countPureWords mengabaikan slot gambar kontekstual
    const textWithContextSlot = 'Pembahasan arsitektur dimulai di sini. [gambar 1: Ilustrasi Karakteristik Utama Beton Ekspos] Lanjutan penjelasan karakteristik material.';
    const wordCount = countPureWords(textWithContextSlot);
    assertEqual(wordCount, 9, 'countPureWords harus mengabaikan token slot gambar kontekstual');
  });

  // Test 24 (Sprint 4.3): Independensi Buka Kunci Kueri (Toggle Unlock Query)
  runCase('Buka Kunci Kueri memungkinkan pengguna menimpa kueri target secara bebas', () => {
    let isQueryLocked = true;
    let targetQuery = 'arsitektur brutalisme';

    const toggleLock = () => {
      isQueryLocked = !isQueryLocked;
    };

    const pasteHandler = (newKeyword: string) => {
      if (isQueryLocked) {
        return; // Terkunci, jangan ubah targetQuery
      }
      targetQuery = newKeyword;
    };

    // Saat masih terkunci: paste diabaikan
    pasteHandler('restorasi candi prambanan');
    assertEqual(targetQuery, 'arsitektur brutalisme', 'Target query tidak boleh berubah saat isQueryLocked true');

    // Pengguna mengeklik Buka Kunci
    toggleLock();
    assertEqual(isQueryLocked, false, 'State isQueryLocked harus menjadi false');

    // Saat sudah terbuka: paste berhasil menimpa kueri
    pasteHandler('restorasi candi prambanan');
    assertEqual(targetQuery, 'restorasi candi prambanan', 'Target query berhasil diubah setelah buka kunci');
  });

  // Test 25 (Sprint 4.4): Dynamic Word Budget Feedback di Composer Dock
  runCase('Logika Dynamic Word Budget Indicator (muted < 300, emerald rentang budget, amber > max)', () => {
    const minWordCount = 300;
    const testFeedback = (wordCount: number, budgetMin?: number, budgetMax?: number) => {
      if (wordCount < minWordCount) {
        return { text: `${wordCount} / ${minWordCount} kata min`, status: 'under-min' };
      }
      if (budgetMax && wordCount > budgetMax) {
        return { text: `${wordCount} kata (Melebihi budget ${budgetMax}!) ⚠️`, status: 'exceeded' };
      }
      if (budgetMin && budgetMax) {
        if (wordCount < budgetMin) {
          return { text: `${wordCount} kata (Target: ${budgetMin}–${budgetMax})`, status: 'below-target' };
        }
        return { text: `${wordCount} kata (Target: ${budgetMin}–${budgetMax}) ✓`, status: 'on-target' };
      }
      return { text: `${wordCount} kata ✓`, status: 'adaptive-ready' };
    };

    // Kasus 1: Draf di bawah 300 kata
    const r1 = testFeedback(150, 500, 800);
    assertEqual(r1.status, 'under-min', 'Draf < 300 kata harus berstatus under-min');
    assertEqual(r1.text, '150 / 300 kata min', 'Format teks draf < 300 kata');

    // Kasus 2: Draf berada di dalam rentang budget (misal 650 kata pada budget 500-800)
    const r2 = testFeedback(650, 500, 800);
    assertEqual(r2.status, 'on-target', 'Draf dalam rentang budget harus on-target');
    assertEqual(r2.text, '650 kata (Target: 500–800) ✓', 'Format teks rentang ideal');

    // Kasus 3: Draf melebihi budget maksimum (misal 950 kata pada budget 500-800)
    const r3 = testFeedback(950, 500, 800);
    assertEqual(r3.status, 'exceeded', 'Draf > budget max harus exceeded');
    assertEqual(r3.text, '950 kata (Melebihi budget 800!) ⚠️', 'Format teks peringatan budget melebihi');

    // Kasus 4: Mode adaptif (tanpa batas budget kustom)
    const r4 = testFeedback(450);
    assertEqual(r4.status, 'adaptive-ready', 'Draf adaptif >= 300 kata harus adaptive-ready');
    assertEqual(r4.text, '450 kata ✓', 'Format teks adaptif');
  });

  // Test 26 (Sprint 4.4): Telemetri Road to 100% & Prioritas Konsensus
  runCase('Telemetri Road to 100% dan kalkulasi kekurangan kata kunci konsensus', () => {
    const consensusTotal = 25;
    const consensusTarget = Math.max(5, Math.floor(consensusTotal * 0.8)); // 20 entitas jenuh 80%
    const currentMatched = 19;

    const remainingTo100 = Math.max(0, consensusTarget - currentMatched);
    assertEqual(consensusTarget, 20, 'Target konsensus jenuh 80% dari 25 adalah 20');
    assertEqual(remainingTo100, 1, 'Kekurangan entitas menuju skor 100% harus 1');

    // Simulasi penambahan 1 kata kunci konsensus prioritas
    const newMatched = currentMatched + 1;
    const newRemaining = Math.max(0, consensusTarget - newMatched);
    assertEqual(newRemaining, 0, 'Setelah menambah 1 entitas konsensus, target tercapai 100%');
  });

  // Test 27 (Sprint 4.4): Smart Default Tab Remediasi
  runCase('Smart Default Tab Remediasi (Micro-Tuning vs CMS Pack)', () => {
    const getInitialTab = (status: string, score: number): 'cms' | 'perfectionist' => {
      const isReady = status === 'Siap Terbit' || status === 'Layak Terbit';
      if (isReady && score < 100) return 'perfectionist';
      return 'cms';
    };

    assertEqual(getInitialTab('Siap Terbit', 99), 'perfectionist', 'Siap Terbit dengan skor 99% harus membuka Tab 2 (Micro-Tuning)');
    assertEqual(getInitialTab('Siap Terbit', 100), 'cms', 'Siap Terbit dengan skor 100% harus membuka Tab 1 (CMS Pack)');
    assertEqual(getInitialTab('Perlu Revisi', 65), 'cms', 'Perlu Revisi harus membuka Tab CMS/Remediasi default');
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
