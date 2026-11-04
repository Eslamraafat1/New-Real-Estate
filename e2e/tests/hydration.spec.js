import { test, expect } from '@playwright/test';

// The home page must hydrate cleanly: no React hydration mismatch (#418/#423/#425),
// no uncaught page errors and no console errors, in both locales, both colour
// schemes and with reduced motion. Runs on both projects (desktop + mobile).
const HYDRATION = /hydrat|#418|#423|#425|didn't match/i;

for (const lang of ['en', 'ar']) {
  for (const colorScheme of ['light', 'dark']) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      test(`home /${lang} hydrates without errors (${colorScheme}, motion: ${reducedMotion})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, reducedMotion });
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(`console: ${m.text()}`);
        });

        const res = await page.goto(`/${lang}`, { waitUntil: 'load' });
        expect(res.status()).toBe(200);
        // Below-the-fold sections stream in and hydrate after load; give them time.
        await page.waitForLoadState('networkidle');
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(1000);

        expect(errors.filter((e) => HYDRATION.test(e)), 'hydration errors').toEqual([]);
        expect(errors, 'console / page errors').toEqual([]);
      });
    }
  }
}
