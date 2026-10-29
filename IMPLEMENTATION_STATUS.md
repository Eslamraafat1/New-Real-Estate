# ATLAS ESTATES — implementation status

Demo brand on a fictional city ("Meridian Bay"). All listings, agents, prices and neighborhood scores are **sample data**.
Next.js 16.4.3 (App Router, Cache Components, Turbopack), React 19.3, Tailwind v4, GSAP + ScrollTrigger, framer-motion, React Three Fiber.

## Completed
- **Design system**: CSS-variable tokens, light "architectural paper" theme and a separately art-directed dark theme; persisted + system-aware toggle with a pre-paint script (no flash) and a "nightfall" colour/light transition.
- **i18n**: `/en` (LTR) and `/ar` (RTL) route trees, proxy redirect for locale-less URLs, typed dictionaries (Arabic must have the same keys as English), logical CSS utilities, mirrored directional icons, locale-aware number/currency/area/date formatting, bilingual data fields.
- **Data layer**: typed `lib/api/*` services, shared query parse/serialize/filter (`lib/search.ts`), shared validators, Route Handlers (`/api/properties`, `/api/properties/[id]`, `/api/locations`, `/api/neighborhoods`, `/api/agents`, `/api/developments`, `/api/inquiries`, `/api/viewing-requests`, `/api/valuation-requests`), `DATA_SOURCE=remote` proxy path, `.env.example`, `docs/BACKEND_INTEGRATION.md`.
- **Catalog**: 29 properties (villas, houses, townhouses, apartments, penthouses, land, rentals, off-plan/under-construction), 8 neighborhoods, 6 agents, 4 developments, 6 articles; generated *illustrative* floor plans (`demo: true`).
- **Homepage**: 20 sections A–T — GSAP-pinned hero with R3F procedural building (lazy, desktop + motion only, SVG fallback elsewhere, skip button), blueprint→photograph, building perspective, contour reveals, gallery parallax, nightfall theme.
- **Listings** (`/properties`, `/buy`, `/rent`): URL-synchronised filters (all hit the API), chips, sort, grid/list/map, load-more, saved searches, empty/loading/error states, mobile full-screen filter modal.
- **Atlas Explorer** (`/map`): illustrative SVG map behind a provider-agnostic `MapView` (zoom/pan/pinch/keyboard, clustering, fly-to), synchronized marker ⇄ list ⇄ preview, mobile map/list toggle + bottom sheet.
- **Property detail** (`/properties/[slug]`): hero composition, gallery + fullscreen lightbox (keyboard/swipe, RTL-aware), floor-plan viewer (floors, rooms, highlight, zoom/pan/pinch/keyboard, demo labelling), actions (save/compare/share/copy/brochure/viewing/contact/info), conditional storytelling sections, sticky mobile bar.
- **Compare** (≤3, persisted, differences highlighted), **Saved properties**, **Saved searches**, **Mortgage calculator** (+ unit-checked maths, formula & disclaimer).
- **Forms**: viewing, agent/contact/details, seller/landlord, valuation — validation (client + server), loading, success/error; success text states the submission is simulated.
- **Pages**: neighborhoods (+detail), developments (+detail), agents (+profile), about, journal (+article), sell, landlords, valuation, contact, FAQ, privacy, terms, login, account, admin, 404, route error, global error. Sitemap + robots, per-page metadata/OG.
- **Admin / login / account**: UI demos only, labelled as unsecured, in-memory state.

## Validation results (this session)
| Check | Result |
| --- | --- |
| `next build` (production) | ✅ passes; all routes prerender for en + ar |
| `tsc --noEmit` | ✅ no errors |
| `eslint .` | ✅ no errors |
| Route smoke test (`next start`) | ✅ every primary route × 2 locales returns 200; unknown path → 404 |
| API filters (purpose/beds/sort/type/amenities/price/q/page, Arabic text query) | ✅ return expected totals |
| API validation (422 with field keys) and simulated submission (201, `simulated:true`) | ✅ |
| Image optimizer on a remote photo | ✅ 200 image/jpeg |
| Mortgage maths (800k @ 6 %, 25 y ⇒ 5 154.41 / mo; 0 % rate; empty loan) | ✅ |
| Visual check (headless Chrome): home (desktop), map explorer (desktop + 500 px), detail page (390 px EN/AR + desktop RTL), compare empty state | ✅ after two layout fixes found during this pass (CSS layer order, map sizing) |

## Not tested / known limitations (be honest)
- **No automated test suite**; no real-device testing. 320/360/430/768/1024/1920 px widths were **not** individually inspected; only ~390, 500 and 1440 px.
- **Dark theme** was not visually reviewed (the headless run did not switch themes); token-based so it should apply, but unverified.
- **Interactions not exercised in a browser**: scroll-driven hero/architecture scenes and the R3F canvas, lightbox swipe/keyboard, floor-plan pan/zoom, compare/favourite flows, form submit UX, reduced-motion behaviour, hero skip button. They compile and lint but were not driven.
- No Lighthouse / bundle-size audit; heavy scenes are lazy-loaded but not measured.
- **Map**: illustrative demo map only (clearly labelled). No real provider (Mapbox/MapLibre) is wired; `lat/lng` fields exist in types for it.
- **Photos** are remote Unsplash images (demo); property gallery images are not unique per property in the rental/apartment records (a few interiors are reused). Newly added URLs in the admin demo show placeholders (host not allow-listed).
- **Global 404** for non-locale paths is handled by the proxy redirect; `not-found.tsx` shows English with an Arabic line (not fully locale-aware).
- Newsletter form is disabled; login/account/admin have **no real authentication**; favourites/compare/saved searches live in `localStorage` only.
- The Floor-plan tab in the gallery and the "Floor plans" section mount separate viewer instances.

## Remaining work for production
Real backend + auth/authorization/audit (see `docs/BACKEND_INTEGRATION.md`), real map provider, real photography and floor-plan assets, legal review of privacy/terms, e2e + accessibility audit (axe, screen-reader pass), performance budgeting, analytics/consent.
