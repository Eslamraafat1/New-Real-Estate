# ATLAS ESTATES — developer guide (conventions every contributor must follow)

Next.js **16.4.3** (App Router, `cacheComponents: true`, Turbopack), React 19.3, Tailwind v4, TypeScript strict.
This is NOT the Next.js in your training data. When unsure, read `node_modules/next/dist/docs/01-app/**`.

## Architecture in one paragraph
All routes live under `app/[lang]/…` (`lang` = `en` | `ar`). `app/[lang]/layout.tsx` is the root layout (html/body, fonts,
theme script, `AppProvider`, `Header`, `Footer`, `CompareTray`). `proxy.ts` redirects locale-less URLs. Data never comes
from `data/demo/*` directly in UI: use the typed API layer in `lib/api/*` (server components call e.g.
`listProperties()` directly; client components use `lib/api/client.ts` fetchers hitting `/api/*`). Demo content is a fictional
city, "Meridian Bay". Everything is labelled demo.

## Cache Components rules (build fails otherwise)
- Pages get `params` as a **Promise**: `const { lang } = await params;`. Type pages with the generated globals:
  `PageProps<"/[lang]/properties/[slug]">`, `LayoutProps<...>`, `RouteContext<...>`. Run `npx next typegen` after adding routes.
- Dynamic segments MUST export `generateStaticParams()` returning **all params of the route including `lang`**
  (e.g. `locales.flatMap(lang => slugs.map(slug => ({ lang, slug })))`). Static pages under `[lang]` inherit `lang` from the layout.
- Never read `searchParams`, `cookies()`, `headers()` or `Date.now()/Math.random()/new Date()` (for display) in a server
  component outside `<Suspense>`. Client components that call `useSearchParams()` must be wrapped in `<Suspense>`.
  Non-deterministic values (dates "today") belong in client components/effects, not server render.
- No `export const dynamic = …` route-segment config (incompatible). Use `loading.tsx` / `<Suspense>`.
- Server components must not import client-only hooks. Mark interactive components `"use client"`.

## i18n (Arabic RTL + English LTR) — mandatory for every string
- Bilingual data fields are `L = { en, ar }` (`lib/i18n/config.ts`); read with `tr(field, lang)`.
- UI strings live in dictionaries: `lib/i18n/dictionaries/en/<ns>.ts` and `ar/<ns>.ts`. The `ar` file is typed
  `typeof` the `en` export, so **both files must have identical keys** (TypeScript enforces it).
  Namespaces: `core.ts` (common, nav, labels, listings, forms, mortgage, compare, saved, footer — owned by the lead, read-only for you),
  `property` (property detail), `home` (homepage sections A–H), `home2` (homepage sections I–S), `pages` (static/content pages),
  `admin` (admin/account/login UI). **Only edit your own namespace files.** Access: `t.property.x`, `t.home.x` …
- Client: `const { t, lang, href, dir } = useApp()` (`components/providers/AppProvider`). Server: `getDictionary(lang)` from `@/lib/i18n`
  and `href(lang, "/path")` from `@/lib/i18n/config`. `fmt("{n} results", { n })` fills placeholders.
- Internal links: client → `<LocLink to="/buy">` or `<Link href={href("/buy")}>`; server → `<Link href={href(lang, "/buy")}>`.
- Use **logical** Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `border-s`), never `ml/mr/pl/pr/left/right`
  for layout. Directional icons: `components/ui/Arrow.tsx` (`Arrow`, `ArrowOut`, `Chevron`) or `rtl:-scale-x-100`.
- Numbers/money/area/dates: `useFormat()` from `lib/hooks` (client) or `formatMoney/formatNumber/formatArea/formatDate` from `lib/i18n/format` (server).
  Never hard-code `$`/`m²`.
- Arabic copy must be real, natural Arabic — not transliteration.

## Design language (see `app/globals.css`)
Tokens: `--paper --paper-2 --surface --ink --ink-soft --ink-mute --forest --forest-2 --on-forest --copper --line --line-soft`
(Tailwind: `bg-paper bg-paper2 bg-surface text-ink text-soft text-mute bg-forest text-onforest text-copper border-line border-linesoft`).
Light = limestone paper / ink / forest / copper; dark theme = `:root[data-theme="dark"]` (never hard-code hex colours in components; use tokens).
Classes: `.wrap` (page container), `.section` (vertical rhythm), `.display` + `.h-xl/.h-lg/.h-md/.h-sm` (serif display),
`.annot` (mono annotation), `.numeral` (large editorial number), `.btn .btn-primary .btn-copper .btn-sm`, `.icon-btn`, `.field`, `.label`, `.err`, `.chip`,
`.atlas-grid`, `.reveal` + `.in-view`, `.draw` (stroke-dash draw), `.img-hover` (with parent `.group`), `.no-scrollbar`, `.safe-b`/`.safe-t`.
Be editorial and asymmetric: whitespace, big numerals, hairlines, coordinates — NOT generic card grids. Each section a distinct composition.

## Shared building blocks (already written — reuse, don't duplicate)
- `components/property/PropertyCard.tsx` — `variant: "standard" | "poster" | "wide" | "row" | "compact"`, props `p`, `priority`, `selected`, `onHover`, `onSelect`, `sizes`.
- `components/property/PropertyBits.tsx` — `Price`, `Specs`, `FavButton`, `CompareButton` (`label` prop), `Badges`, `MiniPlan`.
- `components/atlas/MapView.tsx` — `<MapView markers areas selectedId hoverId onSelect activeArea onArea cluster controls badge bottomInset className />`
  (illustrative SVG map; container needs an explicit height). `MapMarker = { id, x, y, label, title?, kind? }`; coordinates are the 0–1000 demo plane (`property.geo`).
- `components/ui/*`: `AtlasImage` (next/image + blueprint fallback; ALWAYS use instead of raw next/image for remote photos), `Reveal`, `Contour`, `SectionHead`/`PageHeader`,
  `Modal` (native dialog), `BottomSheet`, `LocLink`, `Arrow`.
- `components/forms/forms.tsx` — `InquiryForm kind propertyId agentId`, `ViewingForm propertyId`, `ValuationForm neighborhoods`, `Field`.
- `components/agents/AgentCard.tsx` — `AgentCard`, `Monogram`.
- `components/finance/MortgageCalculator.tsx` (lead) — `<MortgageCalculator initialPrice? currency? compact? />`.
- `components/property/FloorPlanViewer.tsx` (property-detail workstream) — `<FloorPlanViewer plan={FloorPlan} propertyTitle? className? />`.
- `lib/hooks.ts`: `useFormat`, `useMedia`, `useReducedMotion`, `useAsync`. `lib/store.ts`: localStorage stores (favorites, compare, searches, theme).
- `useApp()` also exposes `favorites/isFavorite/toggleFavorite`, `compare/inCompare/toggleCompare`, `searches/saveSearch/deleteSearch`, `toast(msg)`, `theme`.

## Motion rules
GSAP + ScrollTrigger for scroll choreography, `framer-motion` (package is `framer-motion`; import from `"framer-motion"`) for UI state transitions,
React Three Fiber for the few 3D scenes (always `next/dynamic(..., { ssr: false })`, lazy). **Never two animation systems on one element.**
Every ScrollTrigger scene: create inside `gsap.context()` and `ctx.revert()` on cleanup; use `gsap.matchMedia()` so pinned scenes only run for
`(min-width: 768px) and (prefers-reduced-motion: no-preference)`; provide a non-pinned mobile/reduced-motion alternative; pin durations ≤ ~250% viewport.
Register plugins once (`gsap.registerPlugin(ScrollTrigger)`) inside client components only.

## Honesty rules
Demo only: no real addresses, agents, reviews, certifications; show "verified" only if `property.verified === true`; never present generated floor-plan
rooms as measurements (`plan.demo === true`); forms say submissions are simulated; admin/login/account labelled demo (no real auth).

## React 19 / lint rules (eslint-config-next runs `react-hooks` v6)
No synchronous `setState` in effect bodies (derive state, use `useSyncExternalStore`, or set state in async callbacks/event handlers); no refs read/written during render;
no components created inside components. Run `npx eslint <your files>` and `npx tsc --noEmit` before you finish.

## Verification you must do
`npx tsc --noEmit` clean for your files. Don't run `next build` while other agents are editing (the lead runs the final build). If an import from another
workstream doesn't exist yet, code against the documented contract and finish; do not create the other workstream's file.
