# Design QA — Packages module

## Evidence

- Direction 03 visual truth: `../design-system/docs/verification/screenshots/story-detail.png`
- Package-information references: the five supplied MakeMyTrip itinerary captures. These guided content coverage only; their visual styling was not reproduced.
- Accordion reference: `C:/Users/YAKSHITH/.t3/userdata/attachments/e0f960be-c119-42ca-8249-25786b10649d-eaa8e625-abff-46ff-976c-ca926b316085.png` (3238 × 1582 px).
- Package-story reference: `C:/Users/YAKSHITH/.t3/userdata/attachments/e0f960be-c119-42ca-8249-25786b10649d-4f1770c2-7499-442f-a448-6f0c2418cd0b.png` (3210 × 1274 px).
- List implementation: `design-qa-implementation.png`
- Package-type navigation: `design-qa-package-types.png`
- Proposal workspace: `design-qa-proposals.png`
- Detail implementation: `design-qa-detail-top.png`
- Collapsed itinerary implementation: `design-qa-detail-collapsed.png`
- Long-itinerary state: `design-qa-detail-day-4.png`
- Add-item modal: `design-qa-add-item.png`
- Responsive detail: `design-qa-detail-mobile.png`
- Creation foundation: `design-qa-builder-foundation.png`
- Route allocation: `design-qa-builder-route.png`
- Contextual service editor: `design-qa-builder-service.png`
- CRM and regional API supply picker: `design-qa-builder-supply.png`
- Day-level itinerary: `design-qa-builder-itinerary.png`
- Commercial build-up: `design-qa-builder-pricing.png`
- Package media workspace: `design-qa-builder-media.png`
- Operational review: `design-qa-builder-review.png`
- Responsive creation flow: `design-qa-builder-mobile.png`
- Direction 03 side-by-side comparison: `design-qa-builder-comparison.png`
- Feedback reference/implementation comparison board: `design-qa-feedback-comparison.png` (1920 × 1200 px).
- Desktop viewport: 1440 × 900 CSS px, device scale factor 1
- Mobile viewport: 390 × 844 CSS px, device scale factor 1
- Test package: Bali Indonesia, 6-day itinerary

## Detail-page comparison

The implementation preserves the canonical Direction 03 shell and detail-page grammar: inset workspace, 250px navigation rail, shared top bar and account controls, compact breadcrumbs, restrained status treatment, flat tab strip, thin dividers, warm-neutral canvas, and a single raised workspace. The MakeMyTrip references were treated as an operational inventory rather than a style reference.

The content hierarchy has been translated into one continuous working document:

- Package identity, status, route, duration, region, and package ID appear before editing actions.
- A destination gallery provides useful visual context without turning the page into a consumer marketplace.
- A flat composition strip summarizes days, flights, transfers, stays, activities, and meals.
- A short package-story preview carries customer-facing highlights without taking over the operational page; View all reveals the complete copy.
- The itinerary uses six compact accordion rows. Opening a day reveals the complete service timeline, imagery, inclusions, and contextual controls while every other day remains easy to scan.
- Flight rows describe the route, cabin, baggage, and service requirement without implying that a live operator or exact time is permanently attached to the reusable package.
- Commercial information is kept in a slim operational rail and explicitly distinguishes accommodation, transfers, visa, and insurance.
- Inclusions, policies, and commercials are separate document tabs rather than nested dashboard cards.

## Interaction verification

- New package opens a six-stage operational workspace instead of a generic catalog modal.
- Packages and Proposals are separate primary workspace tabs, matching the Vendor/Services information hierarchy.
- Package lifecycle state no longer occupies the primary tabs; Published, Draft, and Archived are available through the Status filter.
- A second navigation row filters package products by All packages, Complete trips, Accommodation, Transport, Activities, Visa, and Flights.
- The Package type column makes the product model visible in every catalog row.
- Proposals render as a functioning list with customer, package type, travel, value, updated date, and proposal status.
- Trip setup, Route, Itinerary, Pricing, Media, and Review remain in one horizontal progress strip at the top of the workspace.
- The previous package-outline rail is absent; the day workspace uses the available shell width and its structural dividers reach the shell edges.
- Package creation includes a customer-facing “Why travellers will love this package” field with one highlight per line.
- Fixed departures derive 7 dated itinerary days from start and end dates.
- Flexible packages replace exact departure dates with itinerary length and travel season.
- Route allocation validates that every trip night belongs to a destination and blocks continuation when totals do not balance.
- The Ubud-to-Seminyak connection opens the car editor against Day 4, the actual movement day.
- Hotel, activity, transport, car, flight, and meal editors expose different operational fields.
- Service search is scoped to the trip region and can switch between all supply, CRM inventory, and regional APIs.
- Searching API supply for `TransferConnect` returns and selects a regional car service, then populates its editable operating fields.
- Seven itinerary days render as a horizontal day array above the selected day plan.
- Adding an activity updates Day 4 and the live package service count.
- Supplier costs, markup, selling price, and per-adult price calculate from editable component values.
- Review exposes readiness, rate warnings, visa/insurance separation, and links back to the relevant stage.
- Media supports image and video uploads, cover-image selection, and removal; the verified flow starts with 3 assets and accepts an additional upload.
- Create draft package adds the new package to the list and opens its operational detail workspace.
- Opening a package routes from the list to the full detail workspace; all 6 package records were opened and verified.
- All six itinerary days render as collapsible rows; Day 1 is open initially, the active row can collapse, and opening Day 4 closes the previous day.
- Show all and Collapse all expose or condense the entire trip in one action.
- The compact story shows two highlights initially; View all reveals the third and Show less restores the preview.
- No fixed flight clock is rendered in package detail; live flight choice remains a proposal-time operation.
- Destination, accommodation, activity, and transfer images load successfully.
- Add item opens a focused modal with type, name, details, cancel, and submit controls.
- Inclusions, Policies, and Commercials tabs render their respective operational content.
- Back to Packages returns to the package list.
- Draft tab returns exactly 4 rows.
- Searching for the region “Southeast Asia” returns exactly 2 rows.
- Filtering Region to “Southeast Asia” returns exactly 2 rows.
- Desktop and 390px responsive layouts render without horizontal page overflow.
- Browser console and uncaught page errors: none.
- Production TypeScript/Vite build: passed.
- Design-system shell duplication check: passed.

## Comparison history

### Pass 1 — list hierarchy

- P2: action hierarchy did not match the supplied package-management reference.
- Fix: reduced secondary actions and kept New package as the single primary list action.

### Pass 2 — regional discovery

- Product requirement: region needed to be a primary discovery dimension.
- Fix: added region-aware search, a dedicated Region filter, visible region labels, and a Region field in package creation.

### Pass 3 — full package workspace

- P1: opening a package did not expose the operational depth shown in the supplied travel references.
- Fix: added a complete six-day itinerary with transport, accommodation, activities, meals, images, inclusions, policies, and commercials.
- P2: a card-heavy translation would fragment the trip and increase scan cost.
- Fix: used a continuous timeline, a sticky day index, dividers, and a narrow commercial rail instead of a grid of cards.
- P2: the existing 4173/4174 ports could resolve to the unrelated Vendor CRM process.
- Fix: assigned this standalone module a strict local development port of 4180.

### Pass 4 — package creation journey

- P1: the original five-field modal could not represent dates, route nights, service dependencies, supplier rates, or operational readiness.
- Fix: replaced it with Trip setup, Route, Itinerary, Pricing, Media, and Review stages inside the Direction 03 detail shell.
- P1: hotel, activity, transport, car, and flight items require materially different inputs.
- Fix: added service-specific editors and attached every service to a real itinerary day and operating location.
- P2: fixed and reusable packages were previously treated as the same date model.
- Fix: fixed departures generate dated days; flexible packages use an itinerary length and travel season.
- P2: route transfers could be assigned to an arbitrary day.
- Fix: route connections resolve to the calculated movement day before the service editor opens.
- Post-fix evidence: the full creation journey, responsive state, production build, and browser console all passed.

### Pass 5 - creation workspace density and supply operations

- P1: the vertical stage rail and package outline compressed the operational workspace and made day planning feel congested.
- Fix: moved all six stages into a horizontal shell-top strip, removed the outline rail, and allowed the canvas to use the full width.
- P2: inset structural lines weakened the shared Direction 03 shell language.
- Fix: extended the builder header, step strip, canvas sections, and footer dividers to the workspace edges.
- P1: service creation depended on manual text entry and could not represent existing company inventory or regional API supply.
- Fix: added region-aware CRM/API search with source, vendor, location, availability, and price context before the service-specific operating form.
- P1: package creation had no explicit place to manage the visual assets used by the sellable package.
- Fix: added a dedicated Media stage for images and video, cover selection, uploads, and removal.
- P2: a vertical day navigator made routine day-by-day editing slower and consumed horizontal working space.
- Fix: converted the itinerary navigator into a horizontal day array with the selected day plan directly beneath it.

### Pass 6 — progressive disclosure and package semantics

- P1: rendering every day and every service at once made a complete package feel unnecessarily dense.
- Fix: replaced the detail-page day rail and always-expanded timeline with compact, full-width accordion rows plus Show all and Collapse all controls.
- P1: the package page had no authored customer-facing reason to choose the trip.
- Fix: added a multiline creation field, saved its lines with the package, and rendered a two-highlight preview with View all and Show less.
- P1: example flights showed a specific operator-independent route with exact times, incorrectly suggesting that mutable inventory was fixed in the package.
- Fix: package flights now store route, cabin, baggage, and departure-window preferences; exact operator, fare, and schedule are selected from live supply when the package enters a proposal.
- P2: broad pink fills in persistent navigation made the brand accents visually noisy.
- Fix: reduced the active package navigation state to a neutral surface with a slim teal edge; pink remains a restrained secondary state color and teal remains the primary action color.
- Visual QA: the feedback comparison board places both supplied references beside the browser-rendered 1440 × 900 implementation. Density, accordion affordance, typography hierarchy, spacing rhythm, token use, image quality, and copy were checked. The implementation intentionally inherits Direction 03 typography and shell rather than the source sites’ consumer styling.
- Focused comparison: the day accordion and creation story field are legible on the combined board, so no additional crop was required.

### Pass 7 — package products and proposals hierarchy

- P1: Published, Draft, and Archived occupied the main tabs even though they describe lifecycle state rather than the kind of product a user is trying to find.
- Fix: moved lifecycle state into a dedicated Status filter and kept Packages and Proposals as the only page-level navigation.
- P1: Proposals appeared as a toolbar action, which understated a core sales workspace and did not match the Vendors/Services relationship used elsewhere in the platform.
- Fix: promoted Packages and Proposals to peer workspace tabs and built a functional proposal list with its own search, filters, type counts, actions, and status model.
- P2: adding the Package type column initially pushed row actions beyond the standard desktop canvas.
- Fix: tightened both package and proposal column tracks; the final 1440 × 900 captures keep Open and overflow actions visible without desktop horizontal scrolling.
- Post-fix evidence: `design-qa-package-types.png` and `design-qa-proposals.png`; production build and automated desktop/mobile interaction checks passed with no console errors.

### Pass 8 â€” remove the services-style taxonomy

- P1: the package-type row copied the Services taxonomy too literally and introduced a second tab selector that does not reflect how package users move between Packages and Proposals.
- Fix: removed the complete-trip, accommodation, transport, activity, visa, and flight tabs; these are now values in a single Package type filter in the list toolbar.

## Findings

No actionable P0, P1, or P2 issues remain in the verified list, detail, modal, and responsive states.

final result: passed

---

## Current list revision — 2026-09-26

### Source and browser evidence

- Packages visual truth: `C:/Users/YAKSHITH/.t3/userdata/attachments/cff6c540-42a4-4476-b6ce-f9c075158ae7-b4362471-7146-43fa-83a0-8dbce528e047.png` (1655 × 977 px).
- Packages implementation: `design-qa-packages-source-size.png` (1655 × 977 px, CSS viewport 1655 × 977, device scale factor 1).
- Proposals visual truth: `C:/Users/YAKSHITH/.t3/userdata/attachments/cff6c540-42a4-4476-b6ce-f9c075158ae7-72de579a-71ab-434a-a578-0f1b72f46c05.png` (1508 × 979 px).
- Proposals implementation: `design-qa-proposals-source-size.png` (1508 × 979 px, CSS viewport 1508 × 979, device scale factor 1).
- Region autocomplete focus: `design-qa-region-suggestions.png` (1655 × 977 px).
- Narrow responsive state: `design-qa-list-narrow.png` (820 × 900 px).
- Density normalization: source and implementation were compared at matching CSS-pixel dimensions with device scale factor 1; no resampling was required.
- State: light theme, Packages default list, Proposals default list, and Packages with `Bangalore` region suggestions open.

### Full-view comparison evidence

- The implementation preserves the source shell, workspace tabs, title/actions, filter row, table column order, status hierarchy, and footer pagination treatment.
- The requested changes are visible: `Recently updated` and the trailing package/proposal result count are removed, the search copy identifies regions, and the table has no horizontal scrollbar.
- At 1655 × 977, the Packages table shows 7 of 9 rows and paginates the remaining rows. The table scroll element measured 1152 px client width and 1152 px scroll width at 1440 × 900, with 424 px client and scroll height.
- At 1508 × 979, all 4 Proposals fit in one page with every information column visible and no horizontal overflow.
- At 820 × 900, the table becomes a full-information card row and paginates one record per view instead of introducing a horizontal scrollbar.

### Focused comparison evidence

- Region search was reviewed separately because the source does not show the open state. `design-qa-region-suggestions.png` confirms that `Bangalore` returns `Bengaluru, Karnataka`, identifies India and South India, and provides a clear `Show packages` selection action.
- Selecting the suggestion returns exactly the two Bangalore/Bengaluru packages.
- The service-type menu exposes 12 options including Complete trips, Accommodation, Transport, Activities, Visa, Flights, Meals & dining, Guides, Travel insurance, Cruises, and Rail.
- The region menu includes the complete configured geography list through Oceania.

### Required fidelity surfaces

- Fonts and typography: the existing Onest/Public Sans/JetBrains Mono design-system stack, weights, compact table labels, money formatting, truncation, and line heights remain consistent with the product shell.
- Spacing and layout rhythm: title, tabs, toolbar, table header, 64 px data rows, and pagination retain the source rhythm. Adaptive page sizing reserves footer space and prevents table-owned vertical scrolling.
- Colors and tokens: the implementation continues to use the shared neutral, teal, pink, success, warning, and information tokens. No new decorative palette was introduced.
- Image quality and assets: existing local destination thumbnails remain sharp, correctly cropped, and use the source product imagery. No placeholder or code-drawn image assets were added.
- Copy and content: region-aware search wording is explicit; the obsolete sort and result-count copy is absent; status labels and package/proposal content remain intact.

### Primary interactions and diagnostics

- Tested package/service type filtering and confirmed 12 service-type options.
- Tested the All regions menu and confirmed extended geography options.
- Typed `Bangalore`, waited for the asynchronous suggestion, selected `Bengaluru, Karnataka`, and confirmed the matching package results.
- Switched between Packages and Proposals and verified zero horizontal overflow in both tables.
- Resized to 820 × 900 and verified the responsive card layout, one-row viewport pagination, and zero horizontal overflow.
- Browser console errors and uncaught page errors: none.
- Production TypeScript/Vite build: passed.
- Design-system shell duplication check: passed.
- T3 collaborative preview was unavailable in this environment, so browser verification used the repository's installed Playwright/Chromium runtime.

### Comparison history

- P1: fixed 1080 px table minimums created horizontal scrolling and rendered every filtered row, forcing table/page scrolling on shorter viewports.
  - Fix: removed fixed table minimum widths, used zero-minimum fractional tracks, hid table overflow, and calculated page size from the live viewport and table position.
  - Post-fix evidence: package and proposal scroll widths equal their client widths; the 1655 × 977 Packages view paginates after row 7.
- P1: region discovery was plain text matching and did not provide a selectable backend suggestion flow for aliases such as Bangalore/Bengaluru.
  - Fix: added debounced region autocomplete with an API endpoint boundary, alias-aware local fallback, clear location metadata, and selection-driven filtering.
  - Post-fix evidence: `design-qa-region-suggestions.png`; selecting Bengaluru returns two records.
- P2: package/service taxonomy and geography were incomplete, while the sort and result-count controls contradicted the requested toolbar.
  - Fix: expanded the service and region filters and removed `Recently updated` plus the trailing result count; records remain sorted by update date by default.
- P2: the dense nine-column table could not remain legible on a narrow viewport.
  - Fix: retained every record field in a responsive card layout below 900 px and paginated based on the taller row footprint.
  - Post-fix evidence: `design-qa-list-narrow.png`.

### Findings

No actionable P0, P1, or P2 issues remain in the verified Packages, Proposals, region-suggestion, and narrow responsive states. The implementation intentionally keeps the current row-click and overflow-menu action pattern rather than duplicating the older source's separate Open button; opening remains keyboard accessible.

final result: passed

---

## Vendor CRM language alignment — 2026-09-26

- Reference: Vendor CRM commit `a20fa66563cd3a7d05ca6058a5f2aaf7403f57ed` and its package list, package detail, vendor header, and activity QA captures. Full audit: `vendor-design-language-audit.md`.
- Shell: the Paryatech lockup, pink active navigation, pink notes and credit meter, unlabeled divider-separated navigation groups, sidebar Settings, and 280 px top-bar search now match the reference treatment.
- Tables: Packages and Proposals now use interactive rows with one overflow action, 40 px thumbnails, status dots, and Vendor CRM's neutral package Draft tone.
- Detail: the package thumbnail, record-header surface, primary Edit action, and overflow actions use the same visual hierarchy as Vendor CRM package records.
- Responsive: six package composition metrics reflow into two columns on phones. The verified mobile detail has no document-level horizontal overflow.
- Evidence: `design-qa-implementation.png`, `design-qa-proposals.png`, `design-qa-builder-foundation.png`, `design-qa-detail-top.png`, and `design-qa-detail-mobile.png`, reviewed against the reference captures.
- `npm run build` and `npm run verify:ui` passed. UI verification covered seven package records, list filters, creation, row menu, keyboard row opening, desktop/mobile views, complete images, and zero console errors.

final result: passed

---

## Booking module integration — 2026-09-26

- Imported the complete current user-facing booking document from `yakosasam797/new-direction-03` at commit `a55ca6c` into `public/booking/booking-redesign.html`. Its list, detail, nine populated detail tabs, notes, filters, and dialogs are present locally.
- The shared `@paryatech/ui` shell owns sidebar and top bar. The Booking document supplies only its module content through `src/BookingModule.tsx`; its duplicate shell chrome is hidden by `public/booking/booking-embed.css`.
- Sidebar navigation works in both directions. `/?module=bookings` opens Bookings directly, and the browser back/forward history tracks module changes. Booking detail updates the host breadcrumb and Back button.
- Desktop booking list fits within a 998 px module viewport. Under 800 px it becomes full-information cards; the mobile detail keeps its source's responsive summary and More tab menu.
- Live preview checks: seven booking records present; opening a row shows a populated Overview and nine populated tab panels; Vouchers activates; mobile More exposes the other eight tabs; list search narrows to XYZ; Direct booking and Booking notes open; host Back returns to the list; clicking Packages returns to the unchanged package list.
- `npm run build`, `npm run verify:ui`, and the shared-shell duplication check passed. Preview showed no browser console errors.

final result: passed
