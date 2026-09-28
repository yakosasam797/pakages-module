# Packages, Bookings, Vendors, and Destination workspace

React + Vite workspace for managing marketed travel packages, bookings, and vendor CRM.

The Packages app consumes `@paryatech/ui` from the Direction 03 design-system repository. Use the sidebar to switch modules. Direct links are `/?module=bookings`, `/?module=vendors`, and `/?module=destination`; Packages is the default.

Destination sits after All inbox in every module's sidebar. It searches places and groups related vendors, packages, proposals, services, and guides. Region suggestions use a local prototype catalog until `VITE_REGION_SEARCH_API_URL` is configured; that endpoint receives `?q=` and should return region suggestions with the shape in `src/regionSearch.ts`. Related records currently come from the workspace's package/proposal data and the Vendor CRM seed catalog. Guides show an honest empty state until a guide source is connected.

Package creation starts with basic details, then opens a separate day and service-block workspace. The block picker combines Vendor CRM services, including services created in this browser, with external search results in one list. Set `VITE_SERVICE_SEARCH_API_URL` to connect an external catalogue; the endpoint receives `?q=` and returns an array (or `{ "results": [...] }`) of `{ id, name, category, location, description?, vendor?, image? }`. Without an endpoint, matching demo results support UI exploration. The final package step records itemised supplier charges for activities, visas, flights, and other services, with optional costs, markup, and a separate catalogue starting price. Accommodation now uses a matching published Vendor CRM rate card for room, meal, season, guest and supplement pricing; manual room-night quotes remain available when no matching card exists. Transport can use a published route and vehicle card or a confirmed supplier quote for transfer, local-day or outstation service, with vehicle class, usable seats, standard, distance, time and extra charges. The selected package rates carry into proposals, where actual traveller dates and party size can be confirmed.

Booking is included as an unmodified Git submodule from [`yakosasam797/new-direction-03`](https://github.com/yakosasam797/new-direction-03). The current standalone Booking page is copied unchanged to `public/booking/index.html` by the dev and build commands. It runs in a full-window isolated frame; only cross-module sidebar clicks are handled by the workspace.

Vendor CRM is included as an unmodified Git submodule from [`yakosasam797/Vendor-CRM`](https://github.com/yakosasam797/Vendor-CRM). The dev and production commands build it into `public/vendor-crm/` and show it in an isolated frame. Its own sidebar opens Packages and Bookings through the workspace switcher. Generated assets are ignored by Git; the two submodules are the sources of truth.

The host adds a small integration-only tab-height rule from `public/vendor-crm-integration.css` inside the Vendor frame. This keeps the upstream Vendor CRM files unchanged, so a later pushed Vendor commit can be brought in by advancing the submodule pointer and rebuilding.

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
