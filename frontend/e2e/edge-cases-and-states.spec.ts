import { test, expect } from '@playwright/test';

test.describe('Edge Cases & State Resilience (Loading, Error 500, Empty State)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'mock-jwt-token', token_type: 'bearer' }),
      });
    });
  });

  test('Empty State: Menampilkan panduan awal jika belum ada riwayat', async ({ page }) => {
    // Mock histori kosong
    await page.route('**/api/v1/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Halaman utama menampilkan empty state dengan tombol sampel naskah
    await expect(page.locator('text=Periksa Kualitas & Orisinalitas Artikel')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Draf Perlu Revisi|Kopi Tubruk/i }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Robusta Dampit|Draf (Layak|Siap) Terbit/i }).first()).toBeVisible();
  });

  test('Validasi Batas Kata: Tombol kirim terkunci jika < 300 kata', async ({ page }) => {
    await page.route('**/api/v1/sessions**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/');

    const textarea = page.locator('textarea');
    await textarea.fill('Ini hanya kalimat pendek kurang dari tiga ratus kata.');

    // Indikator kata harus menampilkan peringatan minimal 300 kata (desktop: "9 / 300 kata min", mobile: "9/300 kata")
    const counter = page.locator('text=/300 kata').or(page.locator('text=/ 300 kata'));
    await expect(counter.first()).toBeVisible();

    // Tombol Kirim Analisis harus dalam keadaan disabled
    const submitBtn = page.getByRole('button', { name: /kirim analisis/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('Loading State (Live Stepper): Animasi tahapan audit muncul saat proses berjalan', async ({ page }) => {
    await page.route('**/api/v1/sessions**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock API execute dengan jeda 1.5 detik agar fase loading LiveStepper tertangkap
    await page.route('**/api/v1/audit/execute**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session_id: 'sess-new-1',
          parent_session_id: null,
          turn_number: 1,
          target_query: 'resep kopi tubruk tradisional',
          draft_title: 'Resep Kopi Tubruk Tradisional',
          draft_content: 'Naskah pengujian...',
          draft_word_count: 350,
          audit_timestamp: new Date().toISOString(),
          verdict_status: 'Layak Terbit',
          degradation_warning: null,
          thresholds: { min_cds_score: 75.0, max_cosine_similarity: 0.60, min_mattr: 0.55, max_hko_percentage: 40.0 },
          metrics: {
            content_differentiation_score: 80.0,
            max_cosine_similarity: 0.35,
            highest_competitor_similarity: 0.35,
            mattr_score: 0.75,
            hko_percentage: 10.0,
            heading_keyword_optimization_pct: 10.0,
            draft_word_count: 350,
            redundant_sentences_count: 0,
            redundant_sentences_density: 0.0,
            broder_containment_max: 0.0,
            information_gain_score: 0.80,
            euclidean_distance: 1.30,
          },
          entity_gaps: { deficit: [], gain: [] },
          annotated_spans: [],
          overview_bullets: ['Draf sangat baik.'],
          remediation_prompt: 'Prompt remediation',
        }),
      });
    });

    await page.goto('/');

    // Klik tombol sampel draf agar otomatis mengisi 700 kata
    const sampleBtn = page.locator('button').filter({ hasText: /Draf Layak Terbit|Robusta Dampit/i }).first();
    await sampleBtn.click();

    // Tombol kirim sekarang aktif
    const submitBtn = page.getByRole('button', { name: /kirim analisis/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verifikasi bahwa komponen LiveStepper muncul selama proses audit
    const liveStepper = page.locator('text=Mengekstrak & menormalisasi draf naskah').or(page.locator('text=Mengakuisisi korpus'));
    await expect(liveStepper.first()).toBeVisible({ timeout: 5000 });
  });

  test('Error 500 / Kegagalan Server: Menampilkan toast error tanpa merusak aplikasi atau menghilangkan naskah', async ({ page }) => {
    await page.route('**/api/v1/sessions**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock API mengembalikan error 500
    await page.route('**/api/v1/audit/execute**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Koneksi ke Google SERP terputus. Silakan coba lagi.' }),
      });
    });

    await page.goto('/');

    // Isi naskah sampel
    const sampleBtn = page.locator('button').filter({ hasText: /Draf Perlu Revisi|Kopi Tubruk/i }).first();
    await sampleBtn.click();

    const submitBtn = page.getByRole('button', { name: /kirim analisis/i });
    await submitBtn.click();

    // Toast error harus muncul
    const toastError = page.locator('text=Audit Gagal').or(page.locator('text=Koneksi ke Google SERP terputus'));
    await expect(toastError.first()).toBeVisible({ timeout: 10000 });

    // Verifikasi naskah di textarea TIDAK HILANG (Penting untuk UX penulis!)
    const textarea = page.locator('textarea');
    const textValue = await textarea.inputValue();
    expect(textValue.length).toBeGreaterThan(100);
  });
});
