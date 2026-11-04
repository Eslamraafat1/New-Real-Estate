import { test, expect } from '@playwright/test';

// Real user flows. Everything runs against bundled demo data, so results are deterministic.
const PROPERTY = '/en/properties/skyline-one-penthouse'; // sample listing with 4 photos

// The results counter in the listings toolbar, e.g. "29 properties".
const resultsStatus = (page) => page.getByRole('status').filter({ hasText: /\d+ propert/ });
const countOf = async (page) => Number((await resultsStatus(page).innerText()).match(/\d+/)[0]);

test.describe('Listings search', () => {
  test.skip(({ isMobile }) => isMobile, 'Uses the desktop filter sidebar');

  test('type filter updates results and URL, Clear all resets', async ({ page, request }) => {
    await page.goto('/en/properties');
    await expect(resultsStatus(page)).toBeVisible();
    const all = await countOf(page);

    const api = await (await request.get('/api/properties?type=penthouse&pageSize=1')).json();
    expect(api.total).toBeGreaterThan(0);
    expect(api.total).toBeLessThan(all);

    const filters = page.getByRole('complementary', { name: 'Filters' });
    const chip = filters.getByRole('button', { name: 'Penthouse', exact: true });
    await chip.click();
    await expect(page).toHaveURL(/[?&]type=penthouse\b/);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(resultsStatus(page)).toHaveText(`${api.total} properties`);

    // Active-filter chip is shown and the search survives a reload (state lives in the URL).
    // Clearing after the reload is a regression test: it used to leave the filtered results on screen.
    await expect(page.getByRole('button', { name: 'Clear: Penthouse' })).toBeVisible();
    await page.reload();
    await expect(resultsStatus(page)).toHaveText(`${api.total} properties`);

    await filters.getByRole('button', { name: 'Clear all' }).click();
    await expect(page).not.toHaveURL(/type=/);
    await expect(resultsStatus(page)).toHaveText(`${all} properties`);
  });

  test('sorting by price is reflected in the URL and the order', async ({ page }) => {
    await page.goto('/en/properties');
    await page.getByRole('combobox').filter({ hasText: 'Price' }).first().selectOption('price-asc');
    await expect(page).toHaveURL(/[?&]sort=price-asc\b/);

    const api = await (await page.request.get('/api/properties?sort=price-asc&pageSize=1')).json();
    const cheapest = api.items[0].title.en;
    await expect(page.locator('main a[href*="/en/properties/"]').filter({ hasText: cheapest }).first()).toBeVisible();
  });

  test('a search with no matches shows the empty state', async ({ page }) => {
    await page.goto('/en/properties?q=zzzz-no-such-place');
    await expect(resultsStatus(page)).toHaveText('0 properties');
    await expect(page.getByText('No properties match', { exact: false })).toBeVisible();
  });
});

test.describe('Property detail', () => {
  test('photo viewer opens, navigates with keyboard and closes with Escape', async ({ page }) => {
    await page.goto(PROPERTY);
    await page.getByRole('button', { name: 'Open photo 1 in full screen' }).click();

    const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText('1 / 4')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(viewer.getByText('2 / 4')).toBeVisible();
    await page.keyboard.press('End');
    await expect(viewer.getByText('4 / 4')).toBeVisible();
    await page.keyboard.press('ArrowRight'); // wraps around
    await expect(viewer.getByText('1 / 4')).toBeVisible();

    await viewer.getByRole('button', { name: 'Next photo' }).click();
    await expect(viewer.getByText('2 / 4')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
  });

  test('photo viewer close button works', async ({ page }) => {
    await page.goto(PROPERTY);
    await page.getByRole('button', { name: 'Open photo 2 in full screen' }).click();
    const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
    await expect(viewer.getByText('2 / 4')).toBeVisible();
    await viewer.getByRole('button', { name: 'Close viewer' }).click();
    await expect(viewer).toBeHidden();
  });
});

test.describe('Compare', () => {
  test('add from a listing, see it in the tray and studio, then remove', async ({ page }) => {
    await page.goto(PROPERTY);
    const toggle = page.getByRole('button', { name: 'Compare', exact: true }).first();
    await toggle.click();
    await expect(page.getByRole('button', { name: 'In comparison' }).first()).toHaveAttribute('aria-pressed', 'true');

    const tray = page.getByRole('region', { name: 'Compare properties' });
    await expect(tray).toContainText('1 of 3 selected');

    await tray.getByRole('link', { name: 'Open comparison' }).click();
    await expect(page).toHaveURL(/\/en\/compare$/);
    await expect(page.locator('main')).toContainText('Skyline One Penthouse');

    await page.getByRole('button', { name: 'Clear comparison' }).first().click();
    await expect(tray).toBeHidden();
    await expect(page.getByText('Nothing to compare yet')).toBeVisible();
  });
});

test.describe('Contact form', () => {
  test('shows validation errors, then succeeds with valid input', async ({ page }) => {
    await page.goto('/en/contact');
    const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Send request' }) });
    await form.getByRole('button', { name: 'Send request' }).click();

    const name = form.getByLabel('Full name');
    const email = form.getByLabel('Email', { exact: true });
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('This field is required.')).toHaveCount(3); // name, email, message
    await expect(form.getByText('Please confirm to continue.')).toBeVisible();
    await expect(page.getByText('Request recorded (demo)')).toHaveCount(0);

    await name.fill('QA Tester');
    await email.fill('not-an-email');
    await form.getByRole('button', { name: 'Send request' }).click();
    await expect(form.getByText('Enter a valid email address.')).toBeVisible();

    await email.fill('qa@example.com');
    await form.getByLabel('Message').fill('Automated end-to-end test — please ignore.');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByText('Request recorded (demo)')).toBeVisible();
  });
});

test.describe('Language switch', () => {
  test('EN → AR keeps the page and flips to RTL', async ({ page, isMobile }) => {
    await page.goto('/en/contact');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: /Language: العربية/ }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/ar\/contact$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Not found', () => {
  test('unknown top-level route returns HTTP 404 with noindex', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist');
    expect(res.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  });

  // A slug no one has requested before, so this really is the first request for it
  // (the response must not be a streamed 200 that only later turns into a 404).
  const freshSlug = (info) => `no-such-listing-${info.project.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  test('unknown property returns HTTP 404 on the first request and offers a way back', async ({ page }, info) => {
    const res = await page.goto(`/en/properties/${freshSlug(info)}`);
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This property is not in the atlas' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    await page.getByRole('link', { name: /Back to/i }).first().click();
    await expect(page).toHaveURL(/\/en\/properties$/);
  });

  test('every detail route returns 404 for an unknown slug on the first request; known slugs stay 200', async ({ request }, info) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    for (const section of ['properties', 'neighborhoods', 'developments', 'agents', 'journal']) {
      for (const lang of ['en', 'ar']) {
        const res = await request.get(`/${lang}/${section}/${freshSlug(info)}`, { maxRedirects: 0 });
        expect(res.status(), `/${lang}/${section}/<unknown>`).toBe(404);
      }
      const known = urls.find((u) => u.startsWith(`/en/${section}/`));
      expect(known, `sitemap lists a ${section} detail page`).toBeTruthy();
      const ok = await request.get(known, { maxRedirects: 0 });
      expect(ok.status(), known).toBe(200);
    }
  });
});
