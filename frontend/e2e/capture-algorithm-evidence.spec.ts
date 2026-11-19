import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Mobile Algorithmic Evidence Capture (WASKITA IR & Gatekeeper Engine)', () => {
  const outputDir = path.resolve('test-results/mobile_evidence');
  const docsFiguresDir = path.resolve('../docs/figures/mobile_evidence');
  const obsidianFiguresDir = path.resolve('../docs/obsidian/figures/mobile_evidence');

  test.beforeAll(() => {
    [outputDir, docsFiguresDir, obsidianFiguresDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  const copyToDocs = (filename: string) => {
    const src = path.join(outputDir, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(docsFiguresDir, filename));
      fs.copyFileSync(src, path.join(obsidianFiguresDir, filename));
    }
  };

  test.beforeEach(async ({ page }) => {
    // Set Samsung Galaxy A12 mobile viewport (360x800) with 2x DPR
    await page.setViewportSize({ width: 360, height: 800 });

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'mock-jwt-token', token_type: 'bearer' }),
      });
    });
  });

  test('Bukti 1: In-Domain Audit Nyata UI Sekolah Rakyat (CDS 92% Siap Terbit)', async ({ page }) => {
    const mockKumparanAudit = {
      session_id: 'sess-kumparan-ui-1',
      parent_session_id: null,
      turn_number: 1,
      target_query: 'perbesar, sekolah rakyat',
      draft_title: 'Draf: perbesar, sekolah rakyat...',
      draft_content: 'Universitas Indonesia (UI) menegaskan bahwa rencana pembangunan Sekolah Rakyat tidak akan menggunakan lahan di dalam kawasan Hutan Kota UI. Tanah UI merupakan tanah negara...',
      draft_word_count: 330,
      audit_timestamp: new Date().toISOString(),
      verdict_status: 'Siap Terbit',
      degradation_warning: null,
      thresholds: { min_cds_score: 75.0, max_cosine_similarity: 0.60, min_mattr: 0.55, max_hko_percentage: 40.0 },
      metrics: {
        content_differentiation_score: 92.0,
        max_cosine_similarity: 0.087,
        highest_competitor_similarity: 0.087,
        mattr_score: 0.835,
        hko_percentage: 0.0,
        heading_keyword_optimization_pct: 0.0,
        draft_word_count: 330,
        redundant_sentences_count: 0,
        redundant_sentences_density: 0.0,
        broder_containment_max: 0.0,
        information_gain_score: 0.73,
        euclidean_distance: 1.37,
      },
      serp_competitors: [
        { domain_name: 'pemberdayaan.go.id', page_title: 'Sekolah Rakyat Jadi Harapan Baru bagi Keluarga Miskin', cosine_similarity: 0.05 },
        { domain_name: 'kemendikdasmen.go.id', page_title: 'Sekolah Rakyat Hadir Memutus Rantai Kemiskinan', cosine_similarity: 0.07 },
        { domain_name: 'setneg.go.id', page_title: 'Sekolah Rakyat Strategi Pemerintah Putus Mata Rantai', cosine_similarity: 0.04 },
        { domain_name: 'probolinggokab.go.id', page_title: 'Pemkab Probolinggo Matangkan Persiapan Sekolah', cosine_similarity: 0.09 },
      ],
      entity_gaps: {
        deficit: [
          { term_string: 'siswa', term_surface_form: 'Siswa', tfidf_weight: 0.9, competitor_consensus_count: 9, is_consensus_priority: true },
          { term_string: 'program', term_surface_form: 'Program', tfidf_weight: 0.85, competitor_consensus_count: 9, is_consensus_priority: true },
          { term_string: 'ruang', term_surface_form: 'Ruang', tfidf_weight: 0.8, competitor_consensus_count: 9, is_consensus_priority: true },
          { term_string: 'keluarga miskin', term_surface_form: 'Keluarga Miskin', tfidf_weight: 0.75, competitor_consensus_count: 8, is_consensus_priority: true },
        ],
        gain: [
          { term_string: 'erwin agustian panigoro', term_surface_form: 'Erwin Agustian Panigoro', tfidf_weight: 0.95, competitor_consensus_count: 0 },
          { term_string: 'pemerintah provinsi dki', term_surface_form: 'Pemerintah Provinsi Dki', tfidf_weight: 0.9, competitor_consensus_count: 0 },
          { term_string: 'kawasan hutan kota ui', term_surface_form: 'Kawasan Hutan Kota UI', tfidf_weight: 0.9, competitor_consensus_count: 0 },
          { term_string: 'pelestarian lingkungan', term_surface_form: 'Pelestarian Lingkungan', tfidf_weight: 0.85, competitor_consensus_count: 0 },
          { term_string: 'kawasan kampus', term_surface_form: 'Kawasan Kampus', tfidf_weight: 0.8, competitor_consensus_count: 0 },
        ],
      },
      consensus_entities: [
        {
          term_string: 'sekolah rakyat',
          term_surface_form: 'Sekolah Rakyat',
          doc_frequency: 10,
          total_competitors: 10,
          is_present_in_draft: true,
          competitor_domain: 'pemberdayaan.go.id',
          competitor_snippet: 'Sekolah Rakyat Jadi Harapan Baru bagi Keluarga Miskin untuk Bangkit dan Berdaya Program Sekolah Rakyat terus berkembang sebagai salah satu upaya pemerintah...',
        },
        {
          term_string: 'membangun',
          term_surface_form: 'Membangun',
          doc_frequency: 10,
          total_competitors: 10,
          is_present_in_draft: true,
          competitor_domain: 'pemberdayaan.go.id',
          competitor_snippet: 'Karena itu, Sekolah Rakyat diharapkan mampu menjadi jalan bagi keluarga prasejahtera untuk membangun kemandirian ekonomi dan sosial secara berkelanjutan.',
        },
        {
          term_string: 'siswa',
          term_surface_form: 'Siswa',
          doc_frequency: 9,
          total_competitors: 10,
          is_present_in_draft: false,
          competitor_domain: 'pemberdayaan.go.id',
          competitor_snippet: 'Hingga 26 April 2026, tercatat terdapat 166 Sekolah Rakyat rintisan yang tersebar di 34 provinsi dengan total 14.936 siswa dari jenjang SD, SMP, hingga SMA.',
        },
        {
          term_string: 'program',
          term_surface_form: 'Program',
          doc_frequency: 9,
          total_competitors: 10,
          is_present_in_draft: false,
          competitor_domain: 'pemberdayaan.go.id',
          competitor_snippet: 'Sekolah Rakyat Jadi Harapan Baru bagi Keluarga Miskin untuk Bangkit dan Berdaya Program Sekolah Rakyat terus berkembang sebagai salah satu upaya pemerintah...',
        },
        {
          term_string: 'ruang',
          term_surface_form: 'Ruang',
          doc_frequency: 9,
          total_competitors: 10,
          is_present_in_draft: false,
          competitor_domain: 'pemberdayaan.go.id',
          competitor_snippet: 'Melalui program ini, pemerintah tidak hanya membuka ruang belajar bagi anak-anak dari keluarga rentan, tetapi juga memperkuat upaya pemberdayaan masyarakat...',
        },
      ],
      annotated_spans: [
        {
          text: 'Universitas Indonesia (UI) menegaskan bahwa rencana pembangunan Sekolah Rakyat tidak akan menggunakan lahan di dalam kawasan Hutan Kota UI.',
          color: 'green',
          label: 'Memuat nilai tambah orisinal: Kawasan Hutan Kota UI',
        },
        {
          text: 'Akses pendidikan dan pelestarian lingkungan bukan dua hal yang harus dipertentangkan, ujar Direktur Erwin Agustian Panigoro.',
          color: 'green',
          label: 'Memuat entitas pembeda unik: Erwin Agustian Panigoro, Pelestarian Lingkungan',
        },
      ],
      overview_bullets: [
        'Skor diferensiasi semantik draf sangat baik (92.0%), melampaui ambang batas 75%.',
        'Draf berhasil menyajikan nilai tambah informasi orisinal: Erwin Agustian Panigoro, Pemprov DKI, Kawasan Hutan Kota UI.',
      ],
      remediation_prompt: 'Anda adalah Redaktur Khusus Micro-Tuning...',
      remediation_prompt_cms: 'Anda adalah Editor Distribusi & Metadata Digital.\n\nTolong siapkan paket materi pra-publikasi CMS & SEO:\n1. Meta Title: UI Tegaskan Sekolah Rakyat Tak Dibangun di Hutan Kota\n2. Meta Description: Klarifikasi resmi UI terkait lahan kampus dan kelestarian hutan kota.',
      remediation_prompt_perfectionist:
        'Anda adalah Redaktur Khusus Micro-Tuning dan Polishing Editorial.\n\n<prinsip_editorial_anti_slop>\n- ATURAN BEDAH PRESISI (SURGICAL EDITING): Pertahankan minimal 90% struktur dan kalimat asli yang sudah sangat baik ini kata demi kata.\n- PRINSIP TONE MIRRORING: Jaga otentisitas suara jurnalis asli.\n- HINDARI KLISE AI: Jangan memasukkan kata penghubung klise robotik.\n</prinsip_editorial_anti_slop>\n\n1. Lengkapi Celah Topik Minor: Siswa, Program, Ruang.\n2. Pertahankan Nilai Orisinalitas Unggul: Erwin Agustian Panigoro, Kawasan Hutan Kota UI, Pemprov DKI.\n\n=== DRAF ARTIKEL PENULIS ===\n[NASKAH ARTIKEL YANG AKAN DIPROSES]:\n"""\nUniversitas Indonesia (UI) menegaskan bahwa rencana pembangunan Sekolah Rakyat tidak akan menggunakan lahan di dalam kawasan Hutan Kota UI...\n"""\n=============================',
    };

    await page.route('**/api/v1/sessions**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/thread')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockKumparanAudit]) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              session_id: 'sess-kumparan-ui-1',
              draft_title: 'Draf: perbesar, sekolah rakyat...',
              score_cds: 92.0,
              verdict_status: 'Siap Terbit',
              target_query: 'perbesar, sekolah rakyat',
              turn_number: 1,
              audit_timestamp: new Date().toISOString(),
            },
          ]),
        });
      }
    });

    await page.goto('/');

    // Tunggu komponen stabil setelah memuat thread sesi
    await expect(page.locator('text=Siap Terbit').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=92%').first()).toBeVisible();
    await expect(page.locator('text=Matriks Celah Informasi (Information Gain)').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(600);

    // 1. Tangkapan Kartu Vonis & Gauge 92% (Siap Terbit)
    const verdictCard = page.locator('div:has-text("Vonis Kelayakan")').first();
    await verdictCard.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '01_mobile_verdict_cds_92_siap_terbit.png'),
    });
    copyToDocs('01_mobile_verdict_cds_92_siap_terbit.png');

    // 2. Tangkapan 7 Metrik IR & Stilometri
    const metricsHeading = page.locator('text=7 Metrik Evaluasi White-Box IR').first();
    await metricsHeading.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '02_mobile_7_metrics_ir_stilometri.png'),
    });
    copyToDocs('02_mobile_7_metrics_ir_stilometri.png');

    // 3. Tangkapan Matriks Information Gain (Δgain) Entitas Unik Pembeda
    const igSection = page.locator('text=Matriks Celah Informasi (Information Gain)').first();
    await igSection.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '03_mobile_information_gain_matrix_indomain.png'),
    });
    copyToDocs('03_mobile_information_gain_matrix_indomain.png');

    // 4. Tangkapan White-Box Konsensus SERP (10/10 SERP, Klausul Acuan)
    const consensusCard = page.locator('#consensus-serp-section').first();
    await consensusCard.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '04_mobile_whitebox_consensus_serp.png'),
    });
    copyToDocs('04_mobile_whitebox_consensus_serp.png');

    // 5. Tangkapan Naskah Teranotasi Stabilo 4-Warna
    const stabiloHeading = page.locator('text=Naskah Teranotasi Stabilo 4-Warna').first();
    if (await stabiloHeading.isVisible()) {
      await stabiloHeading.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(outputDir, '05_mobile_stabilo_annotated_spans.png'),
      });
      copyToDocs('05_mobile_stabilo_annotated_spans.png');
    }

    // 6. Tangkapan Prompt Remediasi In-Domain (Micro-Tuning & Delimiter Draf Tersemat)
    const microTabBtn = page.locator('button:has-text("Micro-Tuning Menuju 100%")').first();
    if (await microTabBtn.isVisible()) {
      await microTabBtn.click();
      await page.waitForTimeout(300);
    }
    const promptSection = page.locator('h3:has-text("Rekomendasi Perbaikan")').first();
    await promptSection.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '06_mobile_prompt_indomain_embedded_draft.png'),
    });
    copyToDocs('06_mobile_prompt_indomain_embedded_draft.png');
  });

  test('Bukti 2: Out-of-Domain Guard & Zero-Gain Policy (CDS 20% Perlu Revisi)', async ({ page }) => {
    const mockOodAudit = {
      session_id: 'sess-ood-cerita-konyol-1',
      parent_session_id: null,
      turn_number: 1,
      target_query: 'cerita konyol',
      draft_title: 'Draf: cerita konyol...',
      draft_content: 'seberapa sering sih aku modol, dahulu kala ketika aku masih kecil aku sering kali makan sembarangan...',
      draft_word_count: 114,
      audit_timestamp: new Date().toISOString(),
      verdict_status: 'Perlu Revisi - Topik Tidak Relevan',
      degradation_warning: null,
      thresholds: { min_cds_score: 75.0, max_cosine_similarity: 0.60, min_mattr: 0.55, max_hko_percentage: 40.0 },
      metrics: {
        content_differentiation_score: 20.0,
        max_cosine_similarity: 0.015,
        highest_competitor_similarity: 0.015,
        mattr_score: 0.907,
        hko_percentage: 0.0,
        heading_keyword_optimization_pct: 0.0,
        draft_word_count: 114,
        redundant_sentences_count: 0,
        redundant_sentences_density: 0.0,
        broder_containment_max: 0.0,
        information_gain_score: 0.0,
        euclidean_distance: 1.41,
      },
      serp_competitors: [
        { domain_name: 'bola.com', page_title: '11 Kumpulan Cerita Lucu Pendek Menghibur', cosine_similarity: 0.01 },
        { domain_name: 'ketawa.com', page_title: 'Cerita Lucu - Kisah Humor Indonesia', cosine_similarity: 0.0 },
        { domain_name: 'liputan6.com', page_title: '18 Cerita Lucu Pendek yang Bikin Ngakak', cosine_similarity: 0.01 },
      ],
      entity_gaps: {
        deficit: [
          { term_string: 'anak', term_surface_form: 'Anak', tfidf_weight: 0.9, competitor_consensus_count: 10, is_consensus_priority: true },
          { term_string: 'memutuskan', term_surface_form: 'Memutuskan', tfidf_weight: 0.85, competitor_consensus_count: 10, is_consensus_priority: true },
          { term_string: 'coba', term_surface_form: 'Coba', tfidf_weight: 0.8, competitor_consensus_count: 10, is_consensus_priority: true },
          { term_string: 'rumah', term_surface_form: 'Rumah', tfidf_weight: 0.75, competitor_consensus_count: 10, is_consensus_priority: true },
        ],
        gain: [],
      },
      consensus_entities: [
        {
          term_string: 'anak',
          term_surface_form: 'Anak',
          doc_frequency: 10,
          total_competitors: 10,
          is_present_in_draft: false,
          competitor_domain: 'bola.com',
          competitor_snippet: 'Asal Muasal Kelinci Anak kelinci: "Ibu, aku ini asalnya dari mana?" Ibu kelinci: "Sekarang belum saatnya kamu tahu..."',
        },
        {
          term_string: 'memutuskan',
          term_surface_form: 'Memutuskan',
          doc_frequency: 10,
          total_competitors: 10,
          is_present_in_draft: false,
          competitor_domain: 'bola.com',
          competitor_snippet: 'Akhirnya, si tukang becak memutuskan untuk pulang saja.',
        },
      ],
      annotated_spans: [],
      overview_bullets: [
        'Draf memerlukan kurasi editorial (Skor CDS: 20.0%).',
        'Naskah terindikasi di luar topik utama (Out-of-Domain): kemiripan semantik rata-rata dengan acuan SERP sangat rendah (< 0.05). Skor CDS dipangkas menjadi maksimal 20.0%.',
      ],
      remediation_prompt:
        'Anda adalah Kurator dan Redaktur Editorial Ahli.\n\nPERINGATAN KURASI: Draf artikel ini terdeteksi berada di luar domain topik utama (Out-of-Domain, kemiripan semantik < 5%) untuk kueri target "cerita konyol". Naskah sebelumnya memuat materi atau cuplikan berita acak yang menyimpang dari topik ini.\n\n<instruksi_reorientasi_topik>\n1. ELIMINASI KONTEN NON-TOPIKAL (BERSIHKAN NOISE):\n   - Buang seluruh paragraf dan materi acak yang tidak berhubungan dengan "cerita konyol". DILARANG mempertahankan teks yang menyimpang dari topik utama.\n2. REORIENTASI TOPIK TOTAL (TULIS ULANG BERFOKUS PENUH PADA KONSENSUS SERP):\n   - Tulis ulang artikel 100% baru berfokus pada topik target "cerita konyol" secara koheren dan berbobot.\n   - Sebagaimana disepakati oleh 10 artikel acuan Google SERP, wajib mengulas aspek penting berikut: Anak, Memutuskan, Coba, Rumah.\n3. LARANGAN KERAS FRASA KLISE AI (ANTI-SLOP):\n   - Tulis dengan gaya profesional tanpa kalimat basa-basi klise robotik AI.\n</instruksi_reorientasi_topik>',
      remediation_prompt_cms: null,
      remediation_prompt_perfectionist: null,
    };

    await page.route('**/api/v1/sessions**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/thread')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockOodAudit]) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              session_id: 'sess-ood-cerita-konyol-1',
              draft_title: 'Draf: cerita konyol...',
              score_cds: 20.0,
              verdict_status: 'Perlu Revisi - Topik Tidak Relevan',
              target_query: 'cerita konyol',
              turn_number: 1,
              audit_timestamp: new Date().toISOString(),
            },
          ]),
        });
      }
    });

    await page.goto('/');

    // 7. Tangkapan Kartu Vonis Out-of-Domain & CDS 20%
    await expect(page.locator('text=Perlu Revisi - Topik Tidak Relevan').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=20%').first()).toBeVisible();

    const oodVerdictCard = page.locator('div:has-text("Vonis Kelayakan")').first();
    await oodVerdictCard.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '07_mobile_ood_verdict_cds_20.png'),
    });
    copyToDocs('07_mobile_ood_verdict_cds_20.png');

    // 8. Tangkapan Isolasi Zero-Gain (Information Gain [Dinonaktifkan] & Entitas [Panduan Menulis Ulang])
    const oodIgSection = page.locator('text=Matriks Celah Informasi (Information Gain)').first();
    await oodIgSection.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '08_mobile_ood_zero_gain_isolation.png'),
    });
    copyToDocs('08_mobile_ood_zero_gain_isolation.png');

    // 9. Tangkapan Prompt Reorientasi Topik Total (Clean Re-write Tanpa Draf Nyasar)
    const promptSectionOod = page.locator('h3:has-text("Rekomendasi Perbaikan")').first();
    await promptSectionOod.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(outputDir, '09_mobile_ood_clean_rewrite_prompt.png'),
    });
    copyToDocs('09_mobile_ood_clean_rewrite_prompt.png');
  });
});
