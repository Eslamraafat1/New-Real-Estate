import { test, expect } from '@playwright/test';

// Technical SEO checks. Run once (desktop project) — they don't depend on viewport.
test.skip(({ isMobile }) => isMobile, 'Viewport-independent');

const absoluteHttps = /^https:\/\/(?!localhost)[^/]+\//;

const jsonLd = async (page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => [].concat(JSON.parse(b))); // throws if any block is invalid JSON
};

test('robots.txt allows crawling and points to an absolute sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/Disallow: \/api\//);
  const sitemap = body.match(/Sitemap: (\S+)/)[1];
  expect(sitemap).toMatch(absoluteHttps);
  expect(sitemap).toMatch(/\/sitemap\.xml$/);
});

test('sitemap.xml lists both locales and no demo-only/private pages', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(50);
  for (const loc of locs) expect(loc).toMatch(absoluteHttps);
  expect(locs.some((l) => l.endsWith('/en/properties/skyline-one-penthouse'))).toBe(true);
  expect(locs.some((l) => l.endsWith('/ar/properties/skyline-one-penthouse'))).toBe(true);
  expect(xml).toContain('hreflang="ar"');
  expect(locs.filter((l) => /\/(login|admin|account|saved|compare)\b/.test(l))).toEqual([]);
});

for (const lang of ['en', 'ar']) {
  test(`home (${lang}): canonical, hreflang, Open Graph and structured data`, async ({ page, request }) => {
    await page.goto(`/${lang}`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(absoluteHttps);
    expect(canonical).toMatch(new RegExp(`/${lang}$`));
    for (const alt of ['en', 'ar']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveAttribute('href', absoluteHttps);
    }

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toMatch(/opengraph-image/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    // The generated image must actually render (fetch it from the server under test).
    const img = await request.get(new URL(ogImage).pathname + new URL(ogImage).search);
    expect(img.status()).toBe(200);
    expect(img.headers()['content-type']).toContain('image/png');

    const types = (await jsonLd(page)).map((d) => d['@type']);
    expect(types).toEqual(expect.arrayContaining(['RealEstateAgent', 'WebSite']));
  });
}

test('property page: cover image, RealEstateListing + BreadcrumbList', async ({ page }) => {
  await page.goto('/en/properties/skyline-one-penthouse');
  await expect(page).toHaveTitle(/Skyline One Penthouse/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/(?!localhost).+\/en\/properties\/skyline-one-penthouse$/);
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /^https:\/\/images\.unsplash\.com\//);

  const data = await jsonLd(page);
  const listing = data.find((d) => d['@type'] === 'RealEstateListing');
  expect(listing.name).toBe('Skyline One Penthouse');
  expect(listing.offers).toMatchObject({ '@type': 'Offer', priceCurrency: 'USD' });
  expect(listing.offers.price).toBeGreaterThan(0);
  expect(listing.disambiguatingDescription).toMatch(/not a real offer/i);

  const crumbs = data.find((d) => d['@type'] === 'BreadcrumbList');
  expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  for (const i of crumbs.itemListElement) expect(i.item).toMatch(absoluteHttps);
});

test('FAQ page exposes FAQPage structured data', async ({ page }) => {
  await page.goto('/en/faq');
  const faq = (await jsonLd(page)).find((d) => d['@type'] === 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThan(0);
});

for (const path of ['/en/login', '/en/admin', '/en/account']) {
  test(`demo-only page ${path} is noindex and labelled as demo`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByText(/Demo (UI|admin|account)/).first()).toBeVisible();
  });
}
