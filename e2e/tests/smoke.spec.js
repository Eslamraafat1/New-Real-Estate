import { test, expect } from '@playwright/test';

// Every key page should load (HTTP 200) with the right <title>
const pages = [
  ['/en', /ATLAS ESTATES/i],
  ['/en/buy', /Properties for sale/i],
  ['/en/rent', /Properties for rent/i],
  ['/en/properties', /All listings/i],
  ['/en/properties/skyline-one-penthouse', /Skyline One Penthouse/i],
  ['/en/mortgage-calculator', /Mortgage calculator/i],
  ['/en/contact', /Contact/i],
];

test.describe('Key pages load', () => {
  for (const [path, title] of pages) {
    test(`${path} returns 200 with correct title`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe('Internationalisation', () => {
  test('English pages are LTR', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });
  test('Arabic pages switch to RTL', async ({ page }) => {
    const res = await page.goto('/ar');
    expect(res.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Error handling', () => {
  test('unknown routes return 404', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist');
    expect(res.status()).toBe(404);
  });
});
