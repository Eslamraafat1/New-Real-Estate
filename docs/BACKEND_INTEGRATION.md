# Backend integration guide

ATLAS ESTATES ships with a **demo data layer**. Every page reads data through the typed functions in `lib/api/*`;
no UI component imports `data/demo/*`. This document describes how to replace the demo layer with a real backend.

## 1. Architecture

```
Browser ──fetch──▶ /api/* Route Handlers (Next.js)  ──▶ lib/api/<resource>.ts ──▶ demo data  (DATA_SOURCE=demo)
Server Components ───────────────────────────────────▶ lib/api/<resource>.ts ──▶ BACKEND_API_URL (DATA_SOURCE=remote)
```

* `lib/api/types.ts` — canonical TypeScript contracts (Property, Neighborhood, Agent, Development, Article, queries, inquiries).
* `lib/api/config.ts` — reads environment variables (server-side only for secrets).
* `lib/api/<resource>.ts` — the *service* functions: `listProperties`, `getProperty`, `listNeighborhoods`, `listAgents`,
  `listDevelopments`, `listArticles`, `submitInquiry`, `submitViewingRequest`, `submitValuationRequest`.
  Each one switches on `isRemote()` (`lib/api/remote.ts`): remote → proxy to the backend, otherwise → demo data.
* `lib/api/client.ts` — browser fetchers (`fetchProperties`, …) that only talk to our own `/api/*` routes.
* `lib/search.ts` — `parseQuery` / `serializeQuery` / `filterProperties`: the URL ⇄ `PropertyQuery` mapping shared by UI and API.
* `lib/api/validation.ts` — shared validators (run in the browser *and* in the route handlers). Errors are message keys.

## 2. Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `DATA_SOURCE` | server | `demo` (default) or `remote` |
| `BACKEND_API_URL` | **server** | Base URL of the real API, e.g. `https://api.example.com/v1` |
| `BACKEND_API_KEY` | **server** | Bearer token used by `lib/api/remote.ts`. Never `NEXT_PUBLIC_*`. |
| `INQUIRY_WEBHOOK_URL` | **server** | Optional: forward inquiries to a CRM/e-mail webhook while still in demo data mode |
| `NEXT_PUBLIC_CURRENCY` | public | Default display currency (ISO 4217) |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin for metadata/sitemap |
| `NEXT_PUBLIC_MAP_PROVIDER` / `NEXT_PUBLIC_MAP_TOKEN` | public | Map provider switch; the token must be a URL-restricted public token |

See `.env.example`. Secrets stay server-side: the browser only calls same-origin `/api/*`, and the server adds the key.

## 3. Endpoints exposed by this app (same-origin)

All responses are JSON. Errors: `{ "ok": false, "error": "<code>", "fieldErrors"?: { field: "<key>" } }`.

### `GET /api/properties`
Query parameters (all optional; names match `serializeQuery`):

| Param | Type | Meaning |
| --- | --- | --- |
| `purpose` | `sale` \| `rent` | Buy / rent |
| `q` | string | Free text over title (en/ar), location, ref, type, style, neighborhood name |
| `neighborhood` | slug | Neighborhood slug |
| `type` | csv of `villa,apartment,penthouse,townhouse,residence,house,land` | Property types |
| `style` | csv of `contemporary,modernist,mediterranean,minimalist,traditional` | Architectural styles |
| `minPrice`, `maxPrice` | number | Price bounds in the listing currency |
| `beds`, `baths` | number | Minimum bedrooms / bathrooms |
| `minArea`, `maxArea` | number | Built area (m²) |
| `furnished` | `furnished` \| `semi` \| `unfurnished` | |
| `amenities` | csv of amenity keys | **All** listed amenities must be present |
| `completion` | `ready` \| `under-construction` \| `off-plan` | |
| `development` | slug | Units belonging to a development |
| `featured` | `1` | Featured only |
| `ids` | csv of ids/slugs | Fetch specific listings (saved / compare) |
| `sort` | `relevance` \| `newest` \| `price-asc` \| `price-desc` | default `relevance` |
| `page`, `pageSize` | int | 1-based page; `pageSize` default 12, max 100 |

Response `Paged<Property>`:
```json
{ "items": [ /* Property */ ], "total": 29, "page": 1, "pageSize": 12, "totalPages": 3, "isDemo": true }
```
Caching: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

### `GET /api/properties/{id}` — `Property` (id **or** slug) or `404 { ok:false, error:"not_found" }`.
### `GET /api/locations` — `[{ slug, name:{en,ar}, count }]` (picker options with listing counts).
### `GET /api/neighborhoods` — `Neighborhood[]`.
### `GET /api/agents` — `Agent[]`.
### `GET /api/developments` — `Development[]`.

### `POST /api/inquiries`
```json
{ "kind": "contact|agent|details|seller|landlord", "name": "…", "email": "…", "phone": "…?", "message": "…",
  "propertyId": "…?", "agentId": "…?", "consent": true }
```
Validation: `name` ≥ 2 chars; `email` RFC-ish; `phone` 7–20 of `+()-. 0-9` (optional); `message` ≥ 10 chars; `consent` must be `true`.

### `POST /api/viewing-requests`
```json
{ "propertyId": "p-001", "name": "…", "email": "…", "phone": "…?", "date": "2026-11-20",
  "time": "morning|afternoon|evening", "mode": "in-person|video", "message": "…?", "consent": true }
```
`date` must be a valid ISO date, today or later.

### `POST /api/valuation-requests`
```json
{ "name": "…", "email": "…", "phone": "…?", "purpose": "sale|rent", "type": "villa|…", "neighborhood": "slug",
  "bedrooms": 3, "area": 180, "message": "…?", "consent": true }
```

Success (`201`): `{ "ok": true, "simulated": true, "reference": "DEMO-INQ-AB12CD" }`.
`simulated: true` means **nothing was delivered to a real agent**; the UI says so explicitly.
Validation failure (`422`): `{ "ok": false, "error": "validation", "fieldErrors": { "email": "email" } }` where values are keys of
`ErrorKey` (`required | email | phone | consent | short | date | past | number | invalid`), translated client-side.
Malformed JSON → `400 invalid_json`; upstream failure → `502 upstream`.

## 4. Backend contract (what the real API must provide, under `BACKEND_API_URL`)

| Method & path | Returns |
| --- | --- |
| `GET /properties?<same params>` | `Paged<Property>` |
| `GET /properties/{id-or-slug}` | `Property` |
| `GET /neighborhoods`, `/locations`, `/agents`, `/developments`, `/articles` | arrays as in `lib/api/types.ts` |
| `POST /inquiries`, `/viewing-requests`, `/valuation-requests` | `SubmissionResult` |

Property fields of note:
* **Bilingual fields** are objects `{ "en": "…", "ar": "…" }` (`title`, `summary`, `description`, `location`, story paragraphs, agent bio…).
* **Images**: `images: [{ src, width, height, alt:{en,ar}, caption?:{en,ar} }]`. The first image is the cover. Add the image host to
  `images.remotePatterns` in `next.config.ts`.
* **Map coordinates**: the demo map uses `geo.x` / `geo.y` (0–1000 illustrative plane). A real backend must send `geo.lat` / `geo.lng`;
  a real map provider is wired in `components/atlas/MapView.tsx` (same `MapViewProps` contract: markers need lat/lng).
* **Floor plans**: `floorPlan: { demo:false, floors:[{ id, label, viewBox, rooms:[{ id, name, x,y,w,h, areaM2? }] }], assets?: { [floorId]: url } }`.
  Only set `areaM2` for measured rooms; keep `demo:true` for illustrative diagrams.
* **`verified`** must only be `true` when the agency has actually verified the listing; the UI shows the badge only then.
* **Dates**: ISO strings. **Prices**: numbers in `currency` (ISO 4217); `pricePeriod` for rentals.

## 5. Pagination
Server paging uses `page` + `pageSize`. The listings UI implements "Load more" by requesting `page=1&pageSize=12×n` (URL param `page=n`),
so a shared link reproduces the same visible set. Map views request `pageSize=100`.

## 6. Authentication & authorization
Login, account and admin screens are **UI demos** with no real authentication. Before connecting production data:
1. Add session auth (e.g. cookie-based sessions or an OIDC provider) and verify it **in every Route Handler and Server Action** (not only in the UI).
2. Protect `/admin/*` with a role check server-side (the `proxy.ts` file can gate routes, but must not be the only layer — see the Next.js
   `authentication` guide in `node_modules/next/dist/docs`).
3. Add persistence, validation, rate-limiting/captcha on the three POST endpoints, and an audit log for admin writes.
4. Replace the demo `localStorage` favourites/compare/saved searches with per-user records if cross-device sync is required.

## 7. Migration checklist
1. Implement the endpoints above on the backend; keep `Property` & friends in sync with `lib/api/types.ts`.
2. Set `DATA_SOURCE=remote`, `BACKEND_API_URL`, `BACKEND_API_KEY` (server env only).
3. Allow the image CDN in `next.config.ts`; confirm `width`/`height` for stable layout.
4. Supply `lat`/`lng` and wire a real map provider in `MapView.tsx`.
5. Remove `data/demo/*` and the demo notices (`t.common.demoNotice`, `DEMO_NOTICE`) once real data ships.
6. Replace the `getPropertySlugs()` / `generateStaticParams` sources with backend lists (or switch detail pages to runtime rendering inside `<Suspense>`).
