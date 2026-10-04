# Vendors module

## UX and operational context

Start with [Rate card logic, examples, and test context](vendor-rate-card-logic-examples-and-test-context.md) for existing vendor/service/card IDs, numerical accommodation/transport/activity examples, all 18 transport personas, tax and markup rules, Booking/Finance handoffs, and verified implementation limits. This is the detailed pricing reference for the next agent; reuse the listed records rather than creating another dummy catalogue.

See [Vendor module flow and operational handoff](vendor-module-ux-operational-context.md) for the complete screen map, vendor/service creation, rate-card workflows, pricing logic, supporting tabs, data ownership, and current implementation boundaries.

Run `npm ci`, `npm run dev`, and `npm run build` from the repository root.

The active entry is `src/modules/vendors/App.tsx`. Source, styles and module data live in `src/modules/vendors/`; shared static assets live in `public/`. Imported Vendor images live in `src/assets/vendors/`.

Historical setup and source references are preserved in `docs/archive/vendors/`. Vendor screenshots are under `qa/vendors/`. The root adapters preserve existing navigation, state and lazy loading. Booking retains its iframe and inline HTML behavior; its generated copy is `/booking/index.html`.

See [root setup](../../../README.md) and [current folder structure](../../folder-structure.md).
