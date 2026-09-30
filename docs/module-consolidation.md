# Module consolidation

## Starting state (30 September 2026)

Root branch: `main`, tracking `origin/main`. Root has no source changes. Booking and Finance are clean. Vendor CRM has one untracked file, `pnpm-lock.yaml`; preserve its bytes (SHA-256 `d6466532413dca20d1d6aa6f03814d17f95a4f4deaa2619624d45fc3812d0d0b`). The verified sibling backup at `D:\_backup_before_module_merge_2026-09-30` is outside this work and must remain untouched.

| Module | Working entry / screens | Navigation and data | Assets / previous build |
| --- | --- | --- | --- |
| Packages | `src/main.tsx` -> `src/App.tsx`; lists, package detail, builder, proposals, pricing, itinerary | Root `?module=` switcher; package/proposal fixtures and browser notes; service search uses Vendor seed data and browser-created services | `src/assets`, `public/service-thumbnails`; root React 19, TypeScript 5.7, Vite 6, `@paryatech/ui` |
| Destination | `src/DestinationPage.tsx`; place search, profiles, related records | `src/destinationSources.ts`, `destinationDemoData.ts`, `destinationProfiles.ts`; Packages/Proposals/Vendor seeds; parses Booking HTML rows; optional region/service search endpoints | Root destination assets and Vendor location images; same root build |
| Vendor CRM | `vendor-crm/src/main.tsx` -> `App.tsx`; vendor directory/detail, services, rate cards, activity, finance, communications, tasks, account/settings | Local React routes plus `/settings`, `/account`, `/notifications`; `src/data/*`, rate-card engine, browser-created services; previously intercepted iframe sidebar clicks | `src/assets`, `public/brand`, icons/favicon and reference/QA images; independent React 19, TypeScript 6, Vite 8, design-system alias, oxlint |
| Booking | **`booking-module/booking-redesign.html`**; booking list/detail, service blocks, finance, activity, communications and notes | Inline DOM scripts and fixtures in the HTML; `src/App.tsx` is only an iframe wrapper; root already wraps the content with its shared shell | Preserved `src/imports` references/images; HTML uses Google Fonts; Figma/Vite/Tailwind scaffold previously served/copied the standalone HTML |
| Finance | `finance-module/src/FinanceApp.tsx`; Overview, Receivables, Payables, Transactions, Expenses, Bank & cash, Reports, Controls | `src/financeModel.ts` integer-paise fixtures; local React interactions; root `src/FinanceModule.tsx` already imports it directly | `public/brand`; independent TypeScript 6 / Vite 8 / design-system alias / oxlint build also copied an unused standalone site |

The previous `scripts/prepare-vendor.mjs` initialized submodules, installed two nested dependency trees, built both React modules, and copied their output and Booking HTML to ignored root public directories on every dev/build start. Design-system locks differed: root/Finance used commit `2d274ecc`, Vendor used `2b4591cc`.

## Target and milestones

1. Record this inventory before changing sources. Keep all existing source, assets, reference material and the untracked Vendor lockfile.
2. Replace the three gitlinks with ordinary root-tracked files. Capture and compare original file hashes, stage each original file explicitly, verify root index coverage, and only then remove nested `.git` pointers, corresponding root `.git/modules` metadata, `.gitmodules` and local submodule configuration. Import no old history.
3. Root owns one package manifest, lockfile, dependency tree, TypeScript check, Vite server and production build. First replace submodule builds with a lightweight Booking/static-asset copy so all screens remain reachable.
4. Lazy-load Vendor CRM into React, wire its existing sidebar to the host module switcher, add Destination directly, retain local detail/settings routing, and scope Vendor/Finance CSS by the active module (including portals). Preserve the existing shell and screen composition. Finance remains a direct React import.
5. After module verification, archive redundant manifests/locks/configuration as historical reference, preserving original files while removing competing active setup paths. Remove unused generated Vendor/Finance outputs and integration adapters. Keep only Booking's HTML boundary unless a deliberate rewrite becomes necessary.
6. Document the final tree, entries, precise setup and remaining limitations. Verify a fresh root install, dev navigation, deep links and browser history, representative screen interactions, Finance fixture reconciliation, lint/type checks and production build. Commit coherent milestones on `main`, then push `origin/main`.

## Intended layout

```text
package.json / package-lock.json / vite.config.ts / tsconfig.json
src/                       # host shell, Packages, Destination, module adapters
vendor-crm/src/             # React CRM screens, fixtures and rate-card engine
finance-module/src/         # React Finance screens and integer-paise fixtures
booking-module/booking-redesign.html  # preserved executable Booking prototype
*/tooling-reference/        # retired standalone setup files (after verification)
scripts/                    # root asset preparation and verification
public/                     # shared static assets, generated Booking HTML
docs/                       # consolidation map and verification record
```

## Known boundaries to retain/document

- Booking's iframe isolates its document-wide selectors, CSS and inline script state. It still uses the same server, root install and root build; sidebar/topbar/navigation are supplied by the host. A React rewrite is separate visual/behavioral work, not needed for consolidation.
- The shared design system is an external GitHub dependency; pin the existing root revision so all React modules use one version. Installation requires network access to that repository and npm.
- Google Fonts and any existing remote media remain optional network resources; seeded data requires no backend. Region and service APIs remain optional environment settings.
- Module fixtures are preserved rather than silently reconciled into authoritative cross-module financial/customer records. Browser-only state remains prototype state; record mutations without existing persistence may reset when leaving a module.

## Verification results

- Inventory milestone committed before source changes.
- Flattening: 32 Booking files, 24 Finance files and 206 Vendor files (including the untracked lockfile) were hashed, inserted into the root index and checked against original bytes before removing nested Git pointers and metadata. Metadata was moved outside the project to `D:\_module_git_metadata_archive_2026-09-30`; no module history was imported. The original sibling backup was untouched.
- Vendor lockfile SHA-256 remains unchanged; `.gitattributes` disables newline conversion for that file.
- Unified runtime: root install succeeds; root TypeScript/Vite production build succeeds; all five sidebar destinations work in the collaborative preview. Vendor CRM and Finance have no iframe; Booking has one isolated HTML frame. Existing Packages DMC/Ground handling selections now have an explicit category type (Vendor's current catalog category union no longer includes it).
- Vendor's generated pre-merge preview differed from its checked-in source (directory pagination/region presentation). Integration uses the preserved checked-in source, fixtures and assets. The prior generated preview is archived outside the active public directory during tooling cleanup.
- Standalone package manifests, locks, Vite/TypeScript configs, HTML entry shells and Figma setup were moved to inactive `tooling-reference` files after the unified modules worked. The Vendor pnpm lock stays at its original path and is unchanged. Obsolete submodule preparation/build scripts and iframe-only Vendor CSS were removed. Root verification now includes the Finance reconciliation and existing Vendor quote tests (20 tests passed).
- Fresh root `npm ci` passed (74 packages installed, no audit vulnerabilities); `npm run dev` started a single Vite site on port 4180. Only the root contains an active `package.json`, and a recursive `.git` scan found only the root repository. `git submodule status` and local submodule configuration are empty.
- Development browser: Packages list/detail, commercial tab and builder; Bali Destination with related packages/services/trips; Vendor directory/detail, services and rate-card pricing; Booking list/detail/Finance tab, local Back and notes; Finance overview and the receipt verification flow all rendered. The Finance flow changed customer outstanding from ₹92,000 to ₹80,000 and review count from three to two, with no browser errors. Vendor settings returned correctly through browser history.
- Production: `npm run build` passed with 230 modules transformed. `npm run preview -- --host 127.0.0.1 --port 4181 --strictPort` navigated all five modules with no runtime errors. Root, Vendor settings/account paths, Booking HTML, shared brand and icon URLs all returned HTTP 200. The source, generated public, and built Booking HTML have matching SHA-256 bytes. A 390px viewport check showed Finance's four metrics in two columns with document width equal to viewport width; desktop shell typography/width remained unchanged after visiting Vendor and Finance.
- `npm run lint` exits successfully with warnings already present in the original module source; `npm run verify:models` passes all 20 Finance/Vendor checks. Vite reports a non-failing warning for the root JavaScript chunk exceeding 500 kB before gzip. No submodule, nested install or nested build is needed.
- Remaining boundaries: Booking remains the one iframe because its active HTML uses document-wide selectors and inline scripts. Cross-module financial/customer fixture amounts are intentionally not reconciled into a single ledger; the Booking/Finance value for `BK-2026-000003` illustrates the product decision still needed. External design-system GitHub access and optional remote fonts/images remain dependencies described in the README.
