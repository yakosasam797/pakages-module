# Packages, Bookings, and Vendors workspace

React + Vite workspace for managing marketed travel packages, bookings, and vendor CRM.

The Packages app consumes `@paryatech/ui` from the Direction 03 design-system repository. Use the sidebar to switch modules. Direct links are `/?module=bookings` and `/?module=vendors`; Packages is the default.

Booking is included as an unmodified Git submodule from [`yakosasam797/new-direction-03`](https://github.com/yakosasam797/new-direction-03). The current standalone Booking page is copied unchanged to `public/booking/index.html` by the dev and build commands. It runs in a full-window isolated frame; only cross-module sidebar clicks are handled by the workspace.

Vendor CRM is included as an unmodified Git submodule from [`yakosasam797/Vendor-CRM`](https://github.com/yakosasam797/Vendor-CRM). The dev and production commands build it into `public/vendor-crm/` and show it in an isolated frame. Its own sidebar opens Packages and Bookings through the workspace switcher. Generated assets are ignored by Git; the two submodules are the sources of truth.

## Run locally

```bash
git submodule update --init --recursive
npm install
npm run dev
```

## Verify

```bash
npm run build
node ../design-system/scripts/check-local-shell.mjs .
npm run verify:ui
```
