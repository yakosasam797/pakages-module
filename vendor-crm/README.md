# Vendor CRM module

Run all commands from the repository root: `npm ci`, `npm run dev`, `npm run build`.

`src/App.tsx` contains the existing CRM shell and routes. The root's `src/VendorModule.tsx` lazy-loads it directly into the same React application. Its module navigation callback opens Packages, Booking, Destination and Finance without an iframe. Settings/account/notification URLs retain `?module=vendors` so reload and browser history select the correct module.

Screens, seeded data, assets, reference material and QA images remain here. Browser-created services retain their existing localStorage key and are also available to Packages and Destination. Original standalone installation/build files and the previous README are inactive under `tooling-reference/`.

The pre-existing `pnpm-lock.yaml` is preserved byte-for-byte at its original path for reference; it is not used for installation. There is no active nested package manifest.

See [root setup and module map](../README.md) and [consolidation notes](../docs/module-consolidation.md).
