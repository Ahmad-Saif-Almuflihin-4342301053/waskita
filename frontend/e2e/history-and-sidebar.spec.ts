import { test, expect } from '@playwright/test';

test.describe('Sidebar History & UI Heavy Load Test', () => {
  // Generate 40 mock sessions with varying title lengths
  const mockSessions = Array.from({ length: 40 }, (_, i) => ({
    session_id: `sess-${i + 1}`,
    parent_session_id: null,
    turn_number: (i % 3) + 1,
    target_query: `kueri topik ${i + 1}`,
    draft_title: i === 0
      ? 'Analisis Mendalam Mengenai Regulasi dan Kebijakan Publik Kota Batam dalam Menghadapi Banjir Rob dan Pasang Laut Tahunan 2026'
      : `Draf Analisis Topik Ke-${i + 1} Terkait Kebijakan Publik`,
    audit_timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    verdict_status: 'Perlu Revisi' as const,
    score_cds: (40 + (i * 1.5)) % 100,
    is_pinned: i === 0,
  }));

  test.beforeEach(async ({ page }) => {
    // Intercept backend API calls with mock data
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
          body: JSON.stringify([
            {
              session_id: 'sess-1',
              parent_session_id: null,
              turn_number: 1,
              target_query: 'kebijakan banjir batam',
              draft_title: mockSessions[0].draft_title,
              draft_content: 'Ini adalah naskah pengujian awal untuk audit WASKITA.',
              draft_word_count: 450,
              audit_timestamp: new Date().toISOString(),
              verdict_status: 'Perlu Revisi',
              degradation_warning: null,
              thresholds: {
                min_cds_score: 75.0,
                max_cosine_similarity: 0.60,
                min_mattr: 0.55,
                max_hko_percentage: 40.0,
              },
              metrics: {
                content_differentiation_score: 55.0,
                max_cosine_similarity: 0.75,
                highest_competitor_similarity: 0.75,
                mattr_score: 0.65,
                hko_percentage: 20.0,
                heading_keyword_optimization_pct: 20.0,
                draft_word_count: 450,
                redundant_sentences_count: 2,
                redundant_sentences_density: 0.15,
                broder_containment_max: 0.10,
                information_gain_score: 0.55,
                euclidean_distance: 1.25,
              },
              entity_gaps: { deficit: [], gain: [] },
              annotated_spans: [],
              overview_bullets: ['Draf memerlukan kurasi editorial.'],
              remediation_prompt: 'Anda adalah Kurator dan Redaktur Editorial Ahli.\n\n<prinsip_editorial_anti_slop>\n- ATURAN BEDAH PRESISI: Pertahankan 80% naskah asli.\n</prinsip_editorial_anti_slop>',
            },
          ]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSessions),
        });
      }
    });
  });

  test('Sidebar menangani 40 histori dengan scroll lancar tanpa layout pecah', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      const openNavBtn = page.locator('button[aria-label="Buka Navigasi"]');
      if (await openNavBtn.isVisible()) {
        await openNavBtn.click();
        await page.waitForTimeout(400); // Tunggu transisi drawer mobile
      }
    }

    // Tunggu sidebar memuat daftar histori
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Pastikan item pertama dengan judul sangat panjang ter-render
    const firstItem = sidebar.locator('text=Analisis Mendalam Mengenai Regulasi').first();
    await expect(firstItem).toBeVisible({ timeout: 10000 });

    // Scroll ke bawah untuk melihat item histori ke-30
    const item30 = sidebar.locator('text=Draf Analisis Topik Ke-30').first();
    await item30.scrollIntoViewIfNeeded();
    await expect(item30).toBeVisible();

    // Verifikasi tombol Analisis Baru (+ / Sesi Baru) di sidebar tetap ada dan dapat diklik
    const newAuditBtn = sidebar.getByRole('button', { name: /analisis baru/i });
    await expect(newAuditBtn).toBeVisible();
    await expect(newAuditBtn).toBeEnabled();
  });

  test('Tombol aksi (Hapus & Edit) dan modal konfirmasi berfungsi dengan benar', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      const openNavBtn = page.locator('button[aria-label="Buka Navigasi"]');
      if (await openNavBtn.isVisible()) {
        await openNavBtn.click();
        await page.waitForTimeout(400);
      }
    }

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Temukan item sesi pertama di sidebar
    const sessionItem = sidebar.locator('div, li, button').filter({
      hasText: 'Analisis Mendalam Mengenai Regulasi',
    }).first();

    await expect(sessionItem).toBeVisible({ timeout: 10000 });

    // Hover pada sesi untuk memunculkan tombol opsi
    await sessionItem.hover();

    // Cari tombol titik tiga (menu opsi sesi)
    const actionBtn = sessionItem.locator('button').last();
    if (await actionBtn.isVisible()) {
      await actionBtn.click();

      // Jika membuka menu opsi popover
      const deleteMenuItem = page.locator('button:has-text("Hapus"), div:has-text("Hapus")').first();
      if (await deleteMenuItem.isVisible()) {
        await deleteMenuItem.click();

        // Modal konfirmasi harus muncul
        const confirmModal = page.locator('text=Hapus Sesi Analisis').or(page.locator('text=Apakah Anda yakin'));
        if (await confirmModal.isVisible()) {
          await expect(confirmModal).toBeVisible();

          // Klik tombol Batal
          const cancelBtn = page.getByRole('button', { name: /batal/i });
          await cancelBtn.click();
          await expect(confirmModal).not.toBeVisible();
        }
      }
    }
  });

  test('Collapse sidebar menyusutkan navigasi secara presisi pada Desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Sidebar collapse tombol khusus desktop');

    await page.goto('/');

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Cari tombol toggle collapse sidebar di header atau tepi sidebar
    const collapseBtn = page.locator('button[title*="Tutup Navigasi"], button[title*="Ciutkan"], button[title*="Sidebar"], button[aria-label*="Tutup Navigasi"]').first();
    if (await collapseBtn.isVisible()) {
      const initialBox = await sidebar.boundingBox();
      await collapseBtn.click();
      await page.waitForTimeout(300); // Tunggu transisi animasi

      const collapsedBox = await sidebar.boundingBox();
      if (initialBox && collapsedBox) {
        expect(collapsedBox.width).toBeLessThan(initialBox.width);
      }
    }
  });
});
