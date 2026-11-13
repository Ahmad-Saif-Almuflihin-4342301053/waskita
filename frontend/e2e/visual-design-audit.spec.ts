import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Visual Design & UI Slop Detection Suite', () => {
  const screenshotsDir = path.resolve('test-results/ui-visual-gallery');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'mock-jwt-token', token_type: 'bearer' }),
      });
    });
  });

  test('Kondisi 1: Tampilan Awal (Empty State) - Bebas Horizontal Scroll', async ({ page, isMobile }) => {
    await page.route('**/api/v1/sessions**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/');

    // Evaluasi Slop Otomatis 1: Dilarang ada horizontal scrollbar yang merusak layar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll, 'Terjadi kebocoran layout horizontal (UI Slop)').toBe(false);

    // Ambil tangkapan layar visual
    const filename = isMobile ? '01-empty-state-mobile.png' : '01-empty-state-desktop.png';
    await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
  });

  test('Kondisi 2: Tampilan Hasil Audit "Perlu Revisi" (Stabilo Jiplak & 4-Pilar)', async ({ page, isMobile }) => {
    const mockRevisionAudit = {
      session_id: 'sess-revisi-1',
      parent_session_id: null,
      turn_number: 1,
      target_query: 'resep kopi tubruk tradisional',
      draft_title: 'Resep Kopi Tubruk Tradisional',
      draft_content: 'Kopi tubruk adalah minuman kopi khas Indonesia yang diseduh langsung dengan air mendidih tanpa filter. Takaran kopi dan air harus pas agar rasa tidak terlalu pahit atau encer.',
      draft_word_count: 550,
      audit_timestamp: new Date().toISOString(),
      verdict_status: 'Perlu Revisi',
      degradation_warning: null,
      thresholds: { min_cds_score: 75.0, max_cosine_similarity: 0.60, min_mattr: 0.55, max_hko_percentage: 40.0 },
      metrics: {
        content_differentiation_score: 42.0,
        max_cosine_similarity: 0.88,
        highest_competitor_similarity: 0.88,
        mattr_score: 0.58,
        hko_percentage: 33.3,
        heading_keyword_optimization_pct: 33.3,
        draft_word_count: 550,
        redundant_sentences_count: 3,
        redundant_sentences_density: 0.22,
        broder_containment_max: 0.18,
        information_gain_score: 0.35,
        euclidean_distance: 0.95,
      },
      serp_competitors: [
        { domain_name: 'kompas.com', page_title: 'Cara Membuat Kopi Tubruk', cosine_similarity: 0.88 },
        { domain_name: 'detik.com', page_title: 'Resep Kopi Tubruk Enak', cosine_similarity: 0.75 },
      ],
      entity_gaps: {
        deficit: [
          { term_string: 'rasio takaran', term_surface_form: 'Rasio Takaran', tfidf_weight: 0.85, competitor_consensus_count: 3 },
          { term_string: 'suhu seduh ideal', term_surface_form: 'Suhu Seduh Ideal', tfidf_weight: 0.80, competitor_consensus_count: 2 },
        ],
        gain: [],
      },
      annotated_spans: [
        { text: 'Kopi tubruk adalah minuman kopi khas Indonesia yang diseduh langsung dengan air mendidih tanpa filter.', status: 'redundant', match_source: 'kompas.com' },
      ],
      overview_bullets: [
        'Draf memerlukan kurasi editorial (Skor CDS: 42.0%).',
        'Tingkat kemiripan semantik tinggi terhadap Artikel kompas.com (88.0%).',
        'Terdapat celah topik penting SERP yang belum dicakup: Rasio Takaran, Suhu Seduh Ideal.',
      ],
      remediation_prompt: 'Anda adalah Kurator dan Redaktur Editorial Ahli.\n\n<prinsip_editorial_anti_slop>\n- ATURAN BEDAH PRESISI: Pertahankan minimal 80% naskah asli.\n- PRINSIP TONE & PERSONA MIRRORING: Hormati gaya khas penulis.\n</prinsip_editorial_anti_slop>\n\n1. ELIMINASI JIPLAKAN DARI SUMBER UTAMA:\n   - Parafrase kalimat yang mirip dengan kompas.com.\n2. LENGKAPI CELAH KONSENSUS: Rasio Takaran, Suhu Seduh Ideal.',
    };

    await page.route('**/api/v1/sessions**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/thread')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockRevisionAudit]) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ session_id: 'sess-revisi-1', draft_title: 'Resep Kopi Tubruk Tradisional', score_cds: 42.0, verdict_status: 'Perlu Revisi', target_query: 'resep kopi tubruk tradisional', turn_number: 1, audit_timestamp: new Date().toISOString() }]),
        });
      }
    });

    await page.goto('/');

    await expect(page.locator('text=42%').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Perlu Revisi').first()).toBeVisible();

    // Verifikasi Slop: Tombol stabilo dan navigasi rapi
    const filename = isMobile ? '02-audit-perlu-revisi-mobile.png' : '02-audit-perlu-revisi-desktop.png';
    await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
  });

  test('Kondisi 3: Tampilan Hasil Audit "Siap Terbit 100%" (Dual-Tab CMS & Micro-Tuning)', async ({ page, isMobile }) => {
    const mockReadyAudit = {
      session_id: 'sess-ready-1',
      parent_session_id: null,
      turn_number: 1,
      target_query: 'robusta dampit seduh presisi',
      draft_title: 'Eksplorasi Robusta Dampit Malang',
      draft_content: 'Kopi Robusta Dampit dari lereng Gunung Semeru Jawa Timur memiliki cita rasa unik caramel dan dark chocolate yang pekat...',
      draft_word_count: 820,
      audit_timestamp: new Date().toISOString(),
      verdict_status: 'Siap Terbit',
      degradation_warning: null,
      thresholds: { min_cds_score: 75.0, max_cosine_similarity: 0.60, min_mattr: 0.55, max_hko_percentage: 40.0 },
      metrics: {
        content_differentiation_score: 95.0,
        max_cosine_similarity: 0.22,
        highest_competitor_similarity: 0.22,
        mattr_score: 0.84,
        hko_percentage: 10.0,
        heading_keyword_optimization_pct: 10.0,
        draft_word_count: 820,
        redundant_sentences_count: 0,
        redundant_sentences_density: 0.0,
        broder_containment_max: 0.0,
        information_gain_score: 0.92,
        euclidean_distance: 1.55,
      },
      serp_competitors: [
        { domain_name: 'ottencoffee.co.id', page_title: 'Karakter Kopi Dampit', cosine_similarity: 0.22 },
      ],
      entity_gaps: {
        deficit: [],
        gain: [
          { term_string: 'lereng semeru', term_surface_form: 'Lereng Semeru', tfidf_weight: 0.9, competitor_consensus_count: 0 },
        ],
      },
      annotated_spans: [],
      overview_bullets: [
        'Skor diferensiasi semantik draf sangat baik (95.0%), melampaui ambang batas.',
        'Draf berhasil menyajikan nilai tambah informasi orisinal: Lereng Semeru.',
      ],
      remediation_prompt: 'Prompt remediation',
      remediation_prompt_cms: 'Anda adalah Editor Distribusi & Metadata Digital.\n\nTolong siapkan paket materi pra-publikasi CMS & SEO:\n1. Meta Title: Eksplorasi Robusta Dampit Malang\n2. Meta Description: Panduan seduh robusta dampit presisi.',
      remediation_prompt_perfectionist: 'Anda adalah Redaktur Khusus Micro-Tuning.\n\n<prinsip_editorial_anti_slop>\n- ATURAN BEDAH PRESISI: Pertahankan 90% naskah kata demi kata.\n</prinsip_editorial_anti_slop>',
    };

    await page.route('**/api/v1/sessions**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/thread')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockReadyAudit]) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ session_id: 'sess-ready-1', draft_title: 'Eksplorasi Robusta Dampit Malang', score_cds: 95.0, verdict_status: 'Siap Terbit', target_query: 'robusta dampit seduh presisi', turn_number: 1, audit_timestamp: new Date().toISOString() }]),
        });
      }
    });

    await page.goto('/');

    await expect(page.locator('text=95%').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Siap Terbit').first()).toBeVisible();

    const filename = isMobile ? '03-audit-siap-terbit-mobile.png' : '03-audit-siap-terbit-desktop.png';
    await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
  });
});
