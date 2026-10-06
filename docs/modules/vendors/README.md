# Vendors module

## UX and operational context

For an agent migrating the **same actual supply catalogue**, start with [Exact reproduction context](vendor-crm-exact-reproduction-context.md) and [Agent-focused standalone HTML](vendor-crm-agent-handoff.html). The text includes every evaluated record, ownership links and operational source evidence. The HTML contains all **194 screenshots in static markup**, all records and context, source calculation/navigation code, extraction instructions and required review ledgers. No tab switching or JavaScript is needed to read its content.

Baseline: **23 vendors, 24 directory services, 30 supplier service profiles, 20 reusable vehicle offerings, 35 listed rate cards, 41 total detailed registry records**. The six additional records are unlinked historical/blank entries. [Exact catalogue JSON](vendor-crm-exact-catalogue.json) distinguishes those collections and includes evaluated discovery links and actual vendor-list projections; do not invent replacement fixtures. Exact internal IDs in this export take precedence over shorthand IDs in earlier prose.

Receiving agents can run `python scripts/extract-vendor-agent-handoff.py docs/modules/vendors/vendor-crm-agent-handoff.html NEW_OUTPUT_DIRECTORY` to obtain individual images, records, context, reference source and TODO review ledgers. To regenerate from the current main fixture baseline, run `node scripts/export-vendor-migration-catalogue.mjs`, then `python scripts/build-vendor-agent-handoff.py`. Screenshot evidence remains dated to its actual capture; exporting fresh data does not recapture the UI.

Start with the [complete Vendor CRM migration reference](vendor-crm-migration-reference.html) for **142 current local screen states, a deployed-version comparison and 51 earlier supporting captures**. The standalone HTML includes screen search, enlarged screenshots, entry points, ownership, operations, controls, persistence, complete pricing/persona examples, and identified reference gaps. Its **Download all context** button exports all embedded text for another agent.

The [complete standalone text backup](vendor-crm-complete-context.md) includes the updated migration context, screen inventory, full earlier operations reference, and all numerical examples/personas. The [updated migration context and checklist](vendor-crm-migration-context.md) is available separately. The [machine-readable screen inventory](vendor-crm-migration-screens.json) contains screen metadata and visible controls. Reviewed 4 October 2026; current observations take precedence over the earlier references below. Product code was not changed to prepare this documentation.

See [Rate card logic, examples, and test context](vendor-rate-card-logic-examples-and-test-context.md) for existing vendor/service/card IDs, numerical accommodation/transport/activity examples, all 18 transport personas, tax and markup rules, Booking/Finance handoffs, and verified implementation limits. This is the detailed pricing reference for the next agent; reuse the listed records rather than creating another dummy catalogue.

See [Vendor module flow and operational handoff](vendor-module-ux-operational-context.md) for the complete screen map, vendor/service creation, rate-card workflows, pricing logic, supporting tabs, data ownership, and current implementation boundaries.

Run `npm ci`, `npm run dev`, and `npm run build` from the repository root.

The active entry is `src/modules/vendors/App.tsx`. Source, styles and module data live in `src/modules/vendors/`; shared static assets live in `public/`. Imported Vendor images live in `src/assets/vendors/`.

Historical setup and source references are preserved in `docs/archive/vendors/`. Vendor screenshots are under `qa/vendors/`. The root adapters preserve existing navigation, state and lazy loading. Booking retains its iframe and inline HTML behavior; its generated copy is `/booking/index.html`.

See [root setup](../../../README.md) and [current folder structure](../../folder-structure.md).
