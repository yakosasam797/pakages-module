# Vendors module

Run `npm ci`, `npm run dev`, and `npm run build` from the repository root.

The active entry is `src/modules/vendors/App.tsx`. Source, styles and module data live in `src/modules/vendors/`; shared static assets live in `public/`. Imported Vendor images live in `src/assets/vendors/`.

Historical setup and source references are preserved in `docs/archive/vendors/`. Vendor screenshots are under `qa/vendors/`. The root adapters preserve existing navigation, state and lazy loading. Booking retains its iframe and inline HTML behavior; its generated copy is `/booking/index.html`.

See [root setup](../../../README.md) and [current folder structure](../../folder-structure.md).
