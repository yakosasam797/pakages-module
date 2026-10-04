# Bookings module

## UX and operational context

See [Booking module flow and operational handoff](booking-module-ux-operational-context.md) for the screen map, fulfilment workflows, travellers/documents/vouchers, Finance interactions, accepted supplier handoffs, and current implementation boundaries.

Open [Booking UI and user-flow atlas](booking-module-ui-flow-context.html) in a browser for 59 current screens and states: the directory, all nine detail tabs, every defined dialog, notes, contextual menus, and accepted supplier handoffs. The standalone HTML includes isolated source previews, actual app captures, field/control inventories, entry points, next-screen links, and short notes about what each action currently does. Use it alongside the operational Markdown when handing Booking to another agent.

Run `npm ci`, `npm run dev`, and `npm run build` from the repository root.

The active entry is `src/modules/bookings/booking-redesign.html`. Source, styles and module data live in `src/modules/bookings/`; shared static assets live in `public/`. Imported Vendor images live in `src/assets/vendors/`.

Historical setup and source references are preserved in `docs/archive/bookings/`. Vendor screenshots are under `qa/vendors/`. The root adapters preserve existing navigation, state and lazy loading. Booking retains its iframe and inline HTML behavior; its generated copy is `/booking/index.html`.

See [root setup](../../../README.md) and [current folder structure](../../folder-structure.md).
