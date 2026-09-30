# Booking module

Run all commands from the repository root: `npm ci`, `npm run dev`, `npm run build`.

The working UI is `booking-redesign.html`, with its original mock bookings, styles and inline interaction scripts. `scripts/prepare-assets.mjs` copies it to the root's generated `/booking/index.html`. `src/BookingModule.tsx` in the root wraps it inside the shared shell and connects notes, local Back behavior and navigation.

Booking retains one iframe to isolate its document-wide scripts and styles. The old React wrapper, imported images/HTML, Figma files and standalone tooling are preserved as references. `tooling-reference/*.reference` files are inactive and require no installation. Root development watches the working HTML and refreshes its generated copy when it changes.

See [root setup and module map](../README.md) and [consolidation notes](../docs/module-consolidation.md).
