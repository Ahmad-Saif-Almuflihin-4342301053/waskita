import { test, expect } from '@playwright/test';

test.describe('Audit UI & Anti-Slop Remediation Prompt Test', () => {
  const mockAuditResult = {
    session_id: 'sess-audit-1',
    parent_session_id: null,
    turn_number: 1,
    target_query: 'ruwat buang sial modern',
    draft_title: 'Draf Eksplorasi Ruwat Buang Sial Modern',
    draft_content: 'Ini adalah naskah lengkap mengenai praktik ruwatan buang sial modern dengan pendekatan psikologi transpersonal...',
    draft_word_count: 850,
    audit_timestamp: new Date().toISOString(),
    verdict_status: 'Siap Terbit' as const,
    degradation_warning: null,
    thresholds: {
      min_cds_score: 75.0,
      max_cosine_similarity: 0.60,
      min_mattr: 0.55,
      max_hko_percentage: 40.0,
    },
    metrics: {
      content_differentiation_score: 85.0,
      max_cosine_similarity: 0.28,
      highest_competitor_similarity: 0.28,
      mattr_score: 0.82,
      hko_percentage: 12.5,
      heading_keyword_optimization_pct: 12.5,
      draft_word_count: 850,
      redundant_sentences_count: 0,
      redundant_sentences_density: 0.0,
      broder_containment_max: 0.0,
      information_gain_score: 0.85,
      euclidean_distance: 1.45,
    },
    serp_competitors: [
      { domain_name: 'kompas.com', page_title: 'Tata Cara Ruwatan', cosine_similarity: 0.28 },
      { domain_name: 'detik.com', page_title: 'Tradisi Pembersihan Diri', cosine_similarity: 0.22 },
      { domain_name: 'tempo.co', page_title: 'Aspek Sosial Ruwatan', cosine_similarity: 0.18 },
      { domain_name: 'jawapos.com', page_title: 'Budaya Jawa Modern', cosine_similarity: 0.15 },
      { domain_name: 'republika.co.id', page_title: 'Kearifan Lokal', cosine_similarity: 0.12 },
      { domain_name: 'tirto.id', page_title: 'Kajian Etnografi', cosine_similarity: 0.10 },
    ],
    entity_gaps: {
      deficit: [
        { term_string: 'pantangan weton', term_surface_form: 'Pantangan Weton', tfidf_weight: 0.6, competitor_consensus_count: 3 },
      ],
      gain: [
        { term_string: 'gelombang theta', term_surface_form: 'Gelombang Theta', tfidf_weight: 0.9, competitor_consensus_count: 0 },
      ],
    },
    annotated_spans: [],
    overview_bullets: [
      'Skor diferensiasi semantik draf sangat baik (85.0%), melampaui ambang batas.',
      'Draf berhasil menyajikan nilai tambah informasi orisinal: Gelombang Theta.',
    ],
    remediation_prompt: 'Prompt default WASKITA',
    remediation_prompt_cms: 'Anda adalah Editor Distribusi & Metadata Digital.\n\nTolong siapkan paket materi pra-publikasi CMS & SEO:\n1. Meta Title SEO: Buatkan judul 60 karakter.\n2. Meta Description: Buatkan deskripsi 140 karakter.',
    remediation_prompt_perfectionist: 'Anda adalah Redaktur Khusus Micro-Tuning dan Polishing Editorial.\n\n<prinsip_editorial_anti_slop>\n- ATURAN BEDAH PRESISI: Pertahankan minimal 90% naskah kata demi kata.\n- PRINSIP TONE MIRRORING: Jaga otentisitas suara penulis.\n</prinsip_editorial_anti_slop>\n\n1. Perkaya Kosakata & Variasi Leksikal (MATTR)\n2. Lengkapi Celah Topik Minor: Pantangan Weton.',
  };

  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'mock-jwt-token', token_type: 'bearer' }),
      });
    });

    await page.route('**/api/v1/sessions**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/thread')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([mockAuditResult]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              session_id: 'sess-audit-1',
              parent_session_id: null,
              turn_number: 1,
              target_query: 'ruwat buang sial modern',
              draft_title: 'Draf Eksplorasi Ruwat Buang Sial Modern',
              audit_timestamp: new Date().toISOString(),
              verdict_status: 'Siap Terbit',
              score_cds: 85.0,
            },
          ]),
        });
      }
    });
  });

  test('UI menampilkan rekomendasi perbaikan dan prompt anti-slop dengan dual-tab', async ({ page }) => {
    await page.goto('/');

    // Pastikan blok audit tampil dengan skor 85%
    await expect(page.locator('text=85%').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Siap Terbit').first()).toBeVisible();

    // Pastikan bagian Rekomendasi Perbaikan & Prompt Remediasi terlihat
    const sectionTitle = page.locator('text=Rekomendasi Perbaikan & Prompt Remediasi');
    await sectionTitle.scrollIntoViewIfNeeded();
    await expect(sectionTitle).toBeVisible();

    // Verifikasi Dual-Tab pada Siap Terbit (Micro-Tuning vs CMS Pack)
    const tabPerfectionist = page.locator('[data-testid="tab-perfectionist"]');
    const tabCms = page.locator('[data-testid="tab-cms-pack"]');

    await expect(tabPerfectionist).toBeVisible();
    await expect(tabCms).toBeVisible();

    // Karena CDS = 85% (< 100%), tab default adalah Micro-Tuning (Rekomendasi)
    await expect(page.locator('text=Prompt Micro-Tuning Kesempurnaan')).toBeVisible();
    await expect(page.locator('text=PRINSIP TONE MIRRORING')).toBeVisible();

    // Klik tab CMS Pack
    await tabCms.click();
    await expect(page.locator('text=Prompt Pra-Publikasi CMS & SEO')).toBeVisible();
    await expect(page.locator('text=Meta Title SEO')).toBeVisible();

    // Uji Tombol Salin Prompt
    const copyBtn = page.getByRole('button', { name: /salin prompt/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Tombol harus berubah menjadi "Tersalin"
    const tersalinBtn = page.getByRole('button', { name: /tersalin/i });
    await expect(tersalinBtn).toBeVisible();

    // Toast notifikasi muncul
    const toast = page.locator('div').filter({ hasText: 'Prompt Tersalin' }).first();
    await expect(toast).toBeVisible();
  });

  test('Filter tampilan prompt (Lengkap, Mandiri, AI) menyaring konten dengan benar', async ({ page }) => {
    await page.goto('/');

    // Tunggu blok audit termuat
    await expect(page.locator('text=85%').first()).toBeVisible({ timeout: 10000 });

    const sectionTitle = page.locator('text=Rekomendasi Perbaikan & Prompt Remediasi');
    await sectionTitle.scrollIntoViewIfNeeded();

    // Mode Mandiri: Panduan kurasi mandiri tampil, kotak prompt AI tersembunyi
    const btnMandiri = page.getByRole('button', { name: /mandiri/i });
    await btnMandiri.click();

    await expect(page.locator('text=Skor diferensiasi semantik draf sangat baik').first()).toBeVisible();
    await expect(page.locator('[data-testid="tab-perfectionist"]')).not.toBeVisible();

    // Mode Lengkap: Kotak prompt AI kembali tampil
    const btnLengkap = page.getByRole('button', { name: /lengkap/i });
    await btnLengkap.click();
    await expect(page.locator('text=Skor diferensiasi semantik draf sangat baik').first()).toBeVisible();
    await expect(page.locator('[data-testid="tab-perfectionist"]')).toBeVisible();
  });

  test('Accordion kompetitor dan entitas konsensus dapat dibuka dan ditutup', async ({ page }) => {
    await page.goto('/');

    // Tunggu hasil audit muncul
    await expect(page.locator('text=85%').first()).toBeVisible({ timeout: 10000 });

    // Accordion kompetitor acuan Google SERP
    const competitorToggle = page.locator('button, div').filter({ hasText: /lihat \d+ kompetitor lainnya/i }).first();
    if (await competitorToggle.isVisible()) {
      await competitorToggle.click();
      // Kompetitor ke-6 (tirto.id) harus muncul setelah dibuka
      await expect(page.locator('text=tirto.id')).toBeVisible();

      // Klik lagi untuk menutup
      await competitorToggle.click();
    }
  });
});
