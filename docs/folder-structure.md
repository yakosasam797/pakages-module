# Root app folder structure

The October 2026 restructuring places all active module code inside the root app. The former `booking-module`, `finance-module`, and `vendor-crm` directories have been removed.

| Content | Location |
| --- | --- |
| App entry, navigation, Packages and Destination | `src/` |
| Working Booking HTML | `src/modules/bookings/booking-redesign.html` |
| Finance screens, models and styles | `src/modules/finance/` |
| Vendor screens, fixtures, permissions and rate cards | `src/modules/vendors/` |
| Imported Vendor images | `src/assets/vendors/` |
| Shared brand assets and icons | `public/brand/`, `public/icons.svg`, `public/favicon.svg` |
| Module documentation | `docs/modules/bookings/`, `docs/modules/finance/`, `docs/modules/vendors/` |
| Retired setup, standalone entry wrappers and design references | `docs/archive/` |
| Vendor visual QA screenshots | `qa/vendors/` |
| Asset preparation and verification | `scripts/` |

Use one root `package.json`, `package-lock.json`, TypeScript configuration, Vite configuration and dependency installation. The root lint configuration retains the Vendor module's lint rules. Finance product and UI instructions remain beside its source in `src/modules/finance/AGENTS.md`.

Vendor CRM and Finance retain lazy React imports. Their CSS remains scoped to the active workspace module, including dialogs rendered into the document body. Booking retains its working HTML and iframe boundary; the root preparation script generates `public/booking/index.html`, and Vite watches the source HTML for development refreshes.

Shared brand files from Finance and Vendor CRM were identical and consolidated without changing their public URLs. The 282 original module files were checked against the sibling backup and accounted for at their new destinations. Imports and current documentation were updated; design reference files, historical locks/configuration, mock data and image contents were preserved. Historical September consolidation notes retain the original source map.

Archived `.reference` files are documentation, not active package or build configuration. The original Booking reference images retain their Git LFS attributes, and the archived Vendor lockfile retains its byte-preservation rule. The former one-time submodule migration script is archived under `docs/archive/flatten-modules.mjs.reference`.

The full sibling backup at `D:\Pakages module - Sep 22 open code - backup 2026-10-02` remains unchanged. Old nested dependencies and generated outputs were removed after source verification; only the root dependency tree is needed.

## Verification

- Root lint and TypeScript check pass. Existing lint warnings remain.
- Production build passes using only the root dependency tree; Vite retains its large-chunk warning.
- All 89 model tests pass, including the preserved INR 1,20,000 Finance reconciliation.
- All four activity proposal flow tests pass.
- Shared browser checks cover Packages, Vendor directory and cancelable deletion dialog, Finance Overview/Receivables at desktop and narrow widths, Booking's generated HTML, and Destination navigation.
