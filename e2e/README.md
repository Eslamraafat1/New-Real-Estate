# E2E Tests — Atlas Estates

End-to-end tests written with **Playwright** (+ **@axe-core/playwright**), run on Desktop Chrome and mobile Chrome (Pixel 7 emulation).

## Suites

| File | Checks |
|---|---|
| `tests/flows.spec.js` | Listings filter → result count + URL + reload + clear all; sort by price; empty state; lightbox (click, ←/→/End keys, wrap-around, Esc, close button); compare add → tray → studio → clear; contact form validation + simulated success; EN → AR switch (`lang="ar" dir="rtl"`); 404 handling |
| `tests/seo.spec.js` | robots.txt, sitemap.xml (absolute https URLs, both locales, no demo-only pages), canonical + hreflang, `og:image` renders, JSON-LD types, `noindex` on login/admin/account |
| `tests/a11y.spec.js` | axe-core: no serious/critical WCAG 2.1 A/AA violations on 5 pages (EN + AR) |
| `tests/smoke.spec.js` | Key pages return 200 with the correct title; LTR/RTL; unknown route → 404 |

34 tests, 51 runs (layout-specific and viewport-independent tests run on desktop only).

## Run locally

```bash
# terminal 1 — from the repo root
npm ci && npm run build && npm start

# terminal 2
cd e2e
npm ci
npx playwright install chromium
BASE_URL=http://localhost:3000 npm test    # against the local production build
npm test                                   # against the live site (default baseURL)
```

CI (`.github/workflows/e2e.yml`) runs lint, build and type-check, then this suite against a locally started production build on every push and pull request; a weekly job runs it against the live site.
