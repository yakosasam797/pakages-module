# Paryatech UI workspace

Packages, Destination, Vendor CRM, Booking and Finance in one website, one Git repository and one root dependency installation. This is a UI prototype with preserved sample data and browser interactions; no backend setup is required.

## Setup

Use Node.js **22.18 or newer** and npm. Run these commands from the repository root:

```powershell
cd "D:\Pakages module - Sep 22 open code"
npm ci
npm run dev
```

`npm run dev` prepares shared assets and Booking HTML, starts Vite at **http://localhost:4180**, and opens the website. Use the sidebar to switch modules. No submodule initialization, nested npm install, separate module server or nested build is needed. For a new clone, use ordinary `git clone` without `--recurse-submodules`.

```powershell
npm run typecheck
npm run lint
npm run verify:models
npm run build
npm run preview
```

`npm run build` checks every React module and produces one deployable `dist/`. `npm run preview` serves it at http://localhost:4173. The optional pre-existing `npm run verify:ui` is the Packages visual regression script and requires Playwright Chromium (`npx playwright install chromium`) plus a running dev server. Whole-workspace browser verification is recorded in [the consolidation notes](docs/module-consolidation.md).

## Project tree

```text
.
├── .git/                         # the only repository
├── package.json / package-lock.json
├── vite.config.ts / tsconfig.json # single server, build and React type check
├── src/
│   ├── main.tsx / App.tsx         # React entry, module switcher, shared shell
│   ├── Package*.tsx / Proposal*.tsx
│   ├── DestinationPage.tsx        # destination UI and related records
│   ├── VendorModule.tsx          # lazy React integration
│   ├── BookingModule.tsx         # preserved HTML + shared-shell adapter
│   └── FinanceModule.tsx         # lazy React integration
├── vendor-crm/
│   ├── src/                      # CRM screens, fixtures, rate-card engine
│   ├── public/                   # original brand/icon assets
│   ├── pnpm-lock.yaml            # preserved historical file; unused by npm
│   └── tooling-reference/        # retired standalone files (*.reference)
├── booking-module/
│   ├── booking-redesign.html     # working Booking screens, scripts and data
│   ├── src/imports/              # original reference HTML and images
│   └── tooling-reference/        # retired Figma/Vite/npm setup
├── finance-module/
│   ├── src/FinanceApp.tsx         # eight Finance destinations
│   ├── src/financeModel.ts        # sample records in integer paise
│   └── tooling-reference/        # retired standalone files (*.reference)
├── public/
│   ├── service-thumbnails/       # tracked local media
│   ├── brand/, icons.svg, favicon.svg # generated from Vendor source assets
│   └── booking/index.html        # generated from the working Booking HTML
├── scripts/                      # root asset preparation and verification
├── docs/module-consolidation.md  # source map, decisions and verification
└── qa/                           # preserved visual QA evidence
```

The original source, assets and reference material remain in their module folders. Archived setup files have a `.reference` suffix so package managers and build tools do not treat them as active configuration. Existing standalone React entry wrappers remain as source references and are not separate app entry points.

## Module entry points

| Sidebar | Direct link | Source / integration |
| --- | --- | --- |
| Packages | `/` or `/?module=packages` | `src/App.tsx`, package/proposal screens, builders and pricing |
| Destination | `/?module=destination` | `src/DestinationPage.tsx`, destination profiles and data sources |
| Vendors | `/?module=vendors` | `src/VendorModule.tsx` -> `vendor-crm/src/App.tsx` |
| Bookings | `/?module=bookings` | `src/BookingModule.tsx` -> `booking-module/booking-redesign.html` |
| All finances | `/?module=finance` | `src/FinanceModule.tsx` -> `finance-module/src/FinanceApp.tsx` |

Vendor settings, account and notification pages retain `?module=vendors`; browser Back/Forward and direct reload select the correct module. Production hosting must serve `index.html` for application paths such as `/settings/organization` and `/account/profile` (SPA fallback). Booking's standalone `/booking/index.html` must remain a static file.

`scripts/scope-module-css.mjs` scopes the existing Vendor and Finance styles by the active module, including dialogs and menus rendered into `document.body`. This prevents style changes after visiting another module without rewriting the original screens.

## Data and integration boundaries

- **Booking:** the original HTML uses document-wide selectors and inline scripts. One iframe preserves those interactions inside the shared root shell. Edit `booking-module/booking-redesign.html`; root development watches it and refreshes its generated copy. Converting it to React is a separate UI rewrite. There is no separate Booking install/build.
- **Design system:** all React modules share `@paryatech/ui`, pinned to GitHub revision `2d274eccdc8d1ea41a05576dc89f993b3dd814ed`. The former `@paryatech/design-system` import name resolves to the same root package. Fresh installation requires npm/GitHub network access. Original locks remain references, including the unchanged Vendor `pnpm-lock.yaml`.
- **Mock records:** Packages/Proposals, Booking, Vendor context panels and agency Finance retain their existing fixtures. They are not a shared production ledger. For example, Booking's `BK-2026-000003` list shows ₹16,500 overdue while the Finance fixture has ₹80,000 customer outstanding. Choosing canonical cross-module amounts/IDs is a product/data decision; consolidation does not silently change either screen. Many mutations are in memory and reset on module exit/reload; browser-created Vendor services and workspace notes keep their existing localStorage persistence.
- **Media:** existing Google Fonts and remote image URLs can need internet access; local assets and seeded data work without an API.
- **Optional search APIs:** set `VITE_REGION_SEARCH_API_URL` and/or `VITE_SERVICE_SEARCH_API_URL` in root `.env.local`. Without them, local suggestions and demo service results work. The region endpoint receives `?q=` and uses the `RegionSuggestion` shape in `src/regionSearch.ts`. Service search receives `?q=` and returns an array (or `{ "results": [...] }`) of `{ id, name, category, location, description?, vendor?, image? }` as implemented in `src/packageServiceSearch.ts`.

Package creation retains its basic-details and day/service-block workflow, shared Vendor service picker, optional catalogue search, media, itemised costs, supplier quote/rate-card pricing, markup and catalogue starting price. Published accommodation and transport rate cards can feed package costing and carry into proposals; no backend is required to explore those screens.

The verified sibling backup at `D:\_backup_before_module_merge_2026-09-30` was left untouched. Retired Git metadata and stale generated Vendor/Finance previews were archived separately at `D:\_module_git_metadata_archive_2026-09-30`, outside this repository.
