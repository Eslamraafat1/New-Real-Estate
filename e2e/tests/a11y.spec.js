import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated accessibility scan (axe-core). Fails on "serious" or "critical" WCAG 2.x A/AA violations.
// Color-contrast is excluded: decorative animated layers make it unreliable to measure automatically.
test.skip(({ isMobile }) => isMobile, 'Run once on desktop');

const pages = ['/en/properties', '/en/properties/skyline-one-penthouse', '/en/contact', '/ar/contact', '/en/faq'];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    const serious = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
