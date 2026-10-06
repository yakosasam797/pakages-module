# Receiving agent: complete product module context

This reference describes the current Paryatech/Paratic UI prototype. Yakshith's next agenda concerns operational logic and user flows. Read the existing behavior before proposing or implementing changes. This is not an instruction to redesign the visual language or to merge Git histories.

## Required reading and evidence procedure

1. Extract the standalone HTML with the included Python helper. Read `context.md`, `audit.md`, `baseline.json`, `screens.json`, `source-coverage.json` and `source-reference/`. The HTML renders the same information without JavaScript. Do not paste image base64 into model context.
2. Enumerate every screen ID and every image. An HTML text fetch does not inspect images. Open every extracted screenshot with an image-capable tool, including scroll continuations. Read its entry point, purpose, captured fields, buttons, outcome, and evidence date. Use the screen-review CSV to record what you actually inspected.
3. Read the entire operational context in bounded chunks. Do not substitute keyword searches, the first N lines, or a truncated tool result for the full document. Keep a chapter checklist. Read the current audit first when older context disagrees with current source.
4. Read each embedded source file, its source inventory and the exact evaluated fixture baseline. The source snapshot freezes this reference at the reviewed state. Verify file hashes against the working project before assuming it is still current. The baseline is source fixtures, not a production database or a dump of all browser storage.
5. For every source conditional, form, modal, menu and action handler, record its corresponding screenshot or an explicit gap. The automated source inventory is a candidate inventory, not proof that each branch is reachable. Check the root mounting path and the branch conditions. Do not resurrect unused components or add routes merely because a component exists in source.
6. Trace every flow as: entry → selection → required data → validation → save/cancel → visible outcome → persistence → related module. Explain responsibility and identity at each handoff. A screen's appearance does not establish backend delivery, reservation, payment processing or durable storage.
7. Keep current baseline captures, local interaction scenarios, earlier captures and source-only states distinct. Earlier images remain useful for unrecaptured states, but must be compared against current source. Conditional states with no image are NOT SCREENSHOT VERIFIED. Do not invent an image, substitute another module's label, or silently treat an absent control as implemented.
8. Preserve exact package/proposal/customer/supplier/service/rate-card/booking/obligation/money IDs and the distinction between their namespaces. Read the complete numeric matrices and rules in the supplier source dependencies. Do not replace them with approximate demo values.
9. Before changing the target, return a gap table: source state/ID, current target route, missing or incorrect control/flow/calculation, evidence, proposed change and risk. Separate prototype defects from missing implementation. Fix only the agreed agenda and retain unrelated work.
10. Exercise every meaningful control when implementing: validation, cancel, save, empty results, selection, pagination, status, approval/change/decline, supplier unresolved cases and cross-module identity. Inspect the corresponding target UI. Record image inspection separately from action verification and financial/operational correctness.
11. Report progress with exact counts and unresolved entries. An image is Inspected only after viewing it; a flow is Verified only after exercising its real handler. A missing backend is Unsupported, not Pass. Do not say “everything covered” while required ledger entries are TODO, failed, source-only, or uninspected.

## Shared operational ownership

Vendor CRM supplier → provided service → vendor-owned rate card / reusable vehicle offering → reusable Package → customer Proposal and accepted version → Booking fulfilment and supplier confirmation → Finance obligation → recorded external money and allocation/bank comparison.

Destination is a discovery index over those records. It does not price, reserve, edit the source record, or collect money. Customer acceptance, supplier confirmation, document readiness, financial settlement and travel completion are distinct.

Agency Finance, Booking Finance and Vendor Finance currently have different prototype data surfaces. Their similar labels do not make them a shared posting service. Future integration must retain one canonical money ID and one obligation per real event. Never sum a commitment and its matching bill as two costs, count a reimbursement as a second expense, or alter customer selling price silently when supplier cost changes.

## Persistence and responsibility

- Root package/proposal catalogue, new Finance transactions/proof decisions and most Booking operations use component/page memory. Reload/remount can reset them.
- Notes, supplier cards/vehicles/tax profiles and accepted handoffs use separate browser stores where specified in source. They are not one database.
- A valid rate card and a calculated quote do not reserve a hotel, activity or vehicle. Unknown costs/tax/actuals stay unresolved; do not turn them into zero.
- Paryatech records external money movement. It does not execute a payment or transfer. Unverified proof does not reduce Agency Finance debt. Allocation and bank matching remain separate.
- Communication/upload/import/export/share-looking controls can be fixtures or stubs. Read the actual handler and preserve an honest label in the next agent's implementation report.

## How to use the HTML

The gallery, context, source listings, exact fixture JSON, coverage report and extractor code are static. Optional JavaScript provides search and downloads. Screens have permanent anchors and normal embedded images. The receiving agent can extract everything from one HTML file; no external screenshot attachment is required.

Each module HTML is below 20,000,000 bytes. Screenshots use high-quality WebP compression at their original resolution when it reduces size; already smaller images retain their original encoding. The builder chooses the highest quality from 95, 92, 90 and 88 that fits the size limit, recorded in the embedded metadata. All screen/image IDs, context, fixture data and byte-exact source remain included. Original capture files remain in the project's reference inputs. The image manifest records the original and embedded hashes and sizes; extraction validates the embedded images.

The reference documents meaningful UI states, not every possible field value, operating-system file chooser, calendar locale, viewport size, or absent backend screen. The coverage section explicitly lists conditional and uncaptured states. Expand that ledger when adding or discovering a state. Do not infer completeness from screenshot count alone.


# Destination: current source and UI audit

Reviewed: 5 October 2026. Destination is discovery over existing modules. It has no Add/Edit/Delete destination form or pricing/reservation workflow.

## Every current surface

Start page: region search combobox, featured Kerala/Bali/Bengaluru/Dubai cards. Search has clear, keyboard selection, suggestions, no results, debounce/abort, and conditional loading/API failure. Search suggestions can include workspace names. Static known region IDs restore from `?module=destination&region=...`; custom workspace/API suggestions do not all restore on reload.

Selected profile: hero/location/description/photos/counts, Change destination, six jump controls and horizontal rails. Photos are static hero images; there is no implemented photo gallery popup. Native rail scroll/arrows do not change record ownership.

| Rail | Current card action |
| --- | --- |
| Packages | Root package opens its exact record. Vendor package opens Vendor module only. Example package opens read-only illustrative drawer. |
| Services | Directory service opens service detail with facts/inclusions/providers. Itinerary-only service opens its first package/proposal source. |
| Activities | Directory activity opens service detail. Itinerary activity opens source package/proposal. |
| Guides | Read-only place/connections drawer; where a real service exists, View experience details opens that connected service. |
| Vendors | Current real supplier cards are nonclickable articles. They show based-here/serves-area, categories, linked-service count and setup state. |
| Trips | Proposal opens exact root proposal. Booking opens the Booking module only. Example trip opens an illustrative drawer. |

Three drawer templates are ServiceDetail, PlaceDetail and ExampleDetail. Close/backdrop/Escape dismiss where implemented; choosing/changing region clears open selections. Service → Open Vendor CRM is a module-level handoff, not precise supplier/card navigation.

## Bali data distinction

Current Bali Services/Activities/Vendors come from seeded real CRM supply; separate illustrative packages, guide places and trips carry Example labels. The current `baliExample.services` and `baliExample.vendors` arrays are empty. Example service/vendor render branches remain in source but have no default entry. Do not create duplicate “example” suppliers or claim a vendor detail drawer exists for the real cards.

An earlier guide lists generic example service/vendor surfaces. Current captures and source take precedence. Legacy images remain supporting evidence with dates. The screenshot ledger flags dormant example branches instead of calling them missing live functionality.

## Source resolver and operational responsibilities

The snapshot combines root packages/proposals, directory and profile services, vendor-owned connections/packages, itinerary services, and Booking HTML rows. Matching normalizes place terms and excludes broad country/group terms where required. This is text matching, not geocoding, route eligibility or availability.

Provider resolution uses seeded vendor data, not every newly created CRM store. Created directory services can be read while some newly created vendor/connection edits are not uniformly included. Name-based itinerary grouping is a discovery key, not a canonical rate-card or transaction identity.

Booking rows are fetched from prepared `/booking/index.html` and parsed with DOMParser. No live Booking API exists. That read does not include every later iframe DOM mutation or stored accepted handoff. Loading/error Trips messages are source-supported conditional states.

## Captures and coverage

Current screenshots cover start/search/no results, Bali profile/all six rails, five non-activity service families, activity details, example package/trip, guide details and exact guide→experience transition, Kerala/Dubai/Bengaluru profiles, and notes browse/compose. Connected counts derive from records, not availability.

Error/loading branches requiring network conditions, all-empty other regions, rail-end positions and dormant example service/vendor drawers are explicitly listed in the coverage ledger. Existing images and full source support context, but no claim is made that those states were independently screenshot verified on 5 October.


# Destination module — UX flows and operational context

Reviewed against the current main repository on **3 October 2026**. This describes current user flows, source relationships and implementation limits for another agent.

Visual companion: [Destination screens and user flows](destination-module-ui-context.html). It includes actual UI captures with small entry-point, purpose, action and next-screen notes.

## 1. Purpose

The **Destination** sidebar item provides a place-first view of the agency's existing workspace.

An employee chooses a city or region and discovers the packages, services, activities, places, vendors, proposals and bookings connected to it.

It is **discovery**, not a new inventory owner, quotation calculator, reservation system or accounting module. A service appearing in a destination does not prove supplier availability, an applicable transport route, an approved rate, or a confirmed booking.

```text
Destination
  → choose a featured place or search
  → selected destination profile
  → Packages / Services / Activities / Guides / Vendors / Trips
  → read local detail or open a source record/module
  → continue the real transaction in Packages, Vendor CRM or Booking
```

The first screen is a discovery start page, not a destination data table with Add/Edit/Delete.

## 2. Ownership map

| Information | Authority | Destination behavior |
| --- | --- | --- |
| Reusable package | Packages workspace | Displays its current identity, source, From price and status; opens the specific package |
| Customer proposal | Packages → Proposals | Displays proposal context; opens the specific proposal |
| Vendor package | Vendor CRM package fixtures | Displays source-labelled package card; opens Vendor CRM module |
| Service / offering | Vendor CRM service directory and profiles | Displays profile and providers; local service detail drawer |
| Supplier identity | Vendor CRM | Shows base, categories, contact and linked-service count |
| Vendor-owned tariff | Vendor CRM | Not recreated or owned by Destination |
| Booking | Booking module | Reads generated Booking-list data; currently opens the Booking module |
| Itinerary-only service | Package or proposal day | Displays the source itinerary link; does not turn free text into a verified supplier offering |
| Place guide | Destination aggregation plus labelled illustrative guides | Explains stops and connected content |
| Destination editorial copy/photos | Local destination profiles | Presentation context, not commercial authority |
| Example package/trip/guide | Destination-only demo data | Opens a labelled read-only example drawer; no source-module write |
| Notes | Shared WorkspaceNotes | Browser-local internal context |

No money, supplier cost, customer markup, tax or supplier confirmation is calculated by this module.

## 3. Current source map

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Global module selection, shell, package/proposal records and exact source-record callbacks |
| `src/DestinationPage.tsx` | Start screen, search, selected-place profile, six rails, details and module navigation |
| `src/DestinationPage.css` | Current destination layout |
| `src/destinationSources.ts` | Snapshot aggregation, place matching, provider connections, itinerary-service deduplication, Booking HTML reader |
| `src/regionSearch.ts` | Known places, aliases, featured places, optional search endpoint |
| `src/destinationProfiles.ts` | Destination descriptions and photo galleries |
| `src/destinationDemoData.ts` | Labelled Bali example packages, guides and trips |
| `src/destinationNavigation.ts` | Destination navigation support |
| `src/modules/vendors/data/vendorDirectory.ts` | Directory services and vendor-service connections |
| `src/modules/vendors/data/services.ts` | Existing service profiles |
| `src/modules/vendors/data/vendors.ts` | Seed vendor identities |
| `src/modules/vendors/data/packages.ts` | Vendor package fixtures |
| `public/booking/index.html` | Generated Booking list read for destination trip discovery |
| `src/WorkspaceNotes.tsx` | Destination notes surface and local persistence |

## 4. Entry and featured places

Entry: global sidebar **Destination**. Current route: `?module=destination`.

The screen has:

- Destination title.
- Search combobox: **Search a city, destination, or region**.
- Explore a destination heading and featured-place cards.
- Shared sidebar, breadcrumb, notes and global shell.

Current featured places are **Kerala, Bali, Bengaluru and Dubai**. Their ordering is derived from connected content counts, not a permanently fixed priority.

Each featured card contains photo/icon, place name, region/country, package count and service count. Bali identifies that example data is included.

The featured-card service count includes activity entries. Inside the selected profile, Services and Activities are split into separate counts; those labels do not represent the same subtotal.

Click a featured card → select region → show profile → hide the initial search and featured grid.

No new destination or supplier record is created by selecting a place.

## 5. Search and selection

Search accepts a city, region, country or known alias. Examples:

- Bangalore / BLR → Bengaluru.
- Bali / Denpasar → Bali.
- Kerala / Kochi / Munnar → Kerala in the configured fallback region catalog.

With no configured endpoint, search uses the local region catalog. If `VITE_REGION_SEARCH_API_URL` is configured, the module queries it with `q` and accepts an array or a `results` array.

It also adds place suggestions found in packages, proposals, Booking-list records, directory services, service profiles and vendor locations. This keeps workspace places searchable even if they are absent from the fallback catalog.

Search flow:

1. Type query.
2. After a short debounce, read matching places.
3. Show suggested-place list with name, region/country and optional image.
4. Arrow Up/Down changes highlighted suggestion; Enter selects; Escape dismisses.
5. Mouse selection selects the same suggestion.
6. Picking a result updates selected region and route `region` parameter.

States: loading, results, no matching place, search error. **Clear destination** clears the query/selection. **Change destination** returns from a profile to the initial discovery state.

The module normalizes a Bali selection to the known Bali identity so its local profile and labelled examples remain consistent.

### URL and reload limitation

Known fallback region IDs can be resolved from the URL. Workspace-generated suggestions use IDs such as `workspace-...`; `regionFromUrl` currently resolves only the fallback catalog. Selecting a custom workspace/API place can work for the current session but fail to restore the selection after reload if the ID is not in that catalog.

Do not assume every selected custom place is a durable destination master record.

## 6. Selected destination profile

Information hierarchy:

1. **Destination** page title and Change destination.
2. Destination hero: place, region/country, editorial description, photos.
3. Counts for Packages, Services, Activities, Guides and Vendors.
4. Example-data label when applicable.
5. Jump navigation: Packages, Services, Activities, Guides, Vendors, Trips.
6. Six horizontal content rails in that order.

Jump buttons scroll to the section; they are not separate pages or tabs that replace the profile.

Each rail has heading/count, left/right scroll controls, horizontally scrollable cards, and a specific empty-state explanation when there are no records.

The count includes the sources represented by that rail. It is not a count of available rooms, vehicles or supplier confirmations.

## 7. Packages rail

Three possible card sources:

| Source | Card information | Click result |
| --- | --- | --- |
| Packages workspace | Name, destination, duration/reference, From price or Price not set, status, Packages source label | Exact package detail through `onOpenRecord("package", id)` |
| Vendor CRM packages | Name, summary/service basis, sell-price string, status, Vendor CRM source label | Vendor CRM module; not currently a precise vendor-package detail |
| Destination example | Example source label, duration, illustrative From price/status | Example detail drawer |

The reusable From price is discovery context, not the final quote for a specific traveller group.

The current Bali fixtures include reusable agency packages and Destination-only examples such as **Ubud & Penida discovery**. Example identities do not enter the Packages source list.

## 8. Services rail

Displays **non-activity** services connected to the place:

1. Vendor CRM directory services.
2. Service profiles without a corresponding directory entry.
3. Distinct service blocks extracted from matching package/proposal itineraries.
4. Example services if supplied by demo data; the current example services array is empty because real Bali supply records are used instead.

CRM service cards show category, service name, location, detail and linked suppliers. Click → local **Service detail** drawer.

Itinerary-derived cards show category, In package / In proposal, name, day place, details and source context. Click → the first connected source package or proposal record. They are not new vendor-service identities.

### Service detail drawer

Shows category/location, image when available, service name, description, location/details, rate-card count when profile metadata provides one, inclusions and supplier names/locations.

**Open Vendor CRM** opens that module. It currently does not select the exact service/vendor/rate card. Close, Escape or backdrop dismiss returns to the profile.

The drawer does not show or calculate the supplier's complete pricing table. A displayed rate-card count is profile metadata.

## 9. Activities rail

Activities are separated from the Services rail so employees can discover experiences directly.

Card fields: image, activity name, place, operational description and supplier/source. Sources can be:

- Real Vendor CRM activity → Service detail drawer.
- Itinerary-derived activity → exact package/proposal source.
- Labelled example activity → example drawer if demo data provides one.

Current Bali supply examples available as real CRM records:

- Tegallalang rice terrace walk — Bali Heritage Studio.
- Uluwatu sunset visit — Bali Heritage Studio.
- Nusa Penida coastal day — Penida Coast Experiences.

The rail may also show authored activities from Bali package itineraries. Similar names are not evidence of one shared inventory allocation.

## 10. Guides rail

**Guides means place guides / stops, not people available as tour guides.**

Cards use kind/source, place name, image and short context. The aggregation extracts distinct places from connected itineraries, activities and service context. Bali adds labelled illustrative place guides.

Examples: Tegallalang rice terraces, Kelingking overlook, Uluwatu Temple, Campuhan Ridge Walk, Seminyak coastline, Ubud temple quarter.

Click → **Guide detail** drawer:

- Place name, image and explanation.
- Connected trips & experiences as source text.
- Example disclaimer where relevant.
- **View experience details** only if a real service is attached to the guide.

That experience action closes the guide and opens its service drawer. Connected source text is not currently a full set of clickable record links.

## 11. Vendors rail

Real vendor cards show:

- Image/initials, name and base location.
- Service categories.
- Contact name if available.
- Based here / Serves this area.
- Linked-service count and vendor status.

A vendor appears when its base location matches or when it provides a service matched to the destination. “Serves this area” follows service connections; it is not automatically derived from every possible vendor coverage rule.

Real vendor cards currently use read-only article cards with no vendor-opening click. Destination-only example vendors would open an example drawer, but the current example vendor array is empty.

Examples of real Bali supplier identities: Island Wheels Bali, Ubud Stay Collective, Bali Ground Desk, Bali Heritage Studio and Penida Coast Experiences. Keep their source IDs; do not recreate them as destination-owned vendors.

## 12. Trips rail

Combines proposals, Booking-list entries and labelled illustrative trips.

| Card | Information | Click result |
| --- | --- | --- |
| Real proposal | Proposal label/status, name, customer/destination, selling value | Exact proposal record |
| Real booking | Booking label/status, name, travel context, Booking ID | Booking module; not currently exact booking detail |
| Example proposal/booking | Example label, customer/location, travel/status | Read-only example detail |

Current labelled examples include **Ubud & Penida family plan** (Proposal) and **Bali coast arrival plan** (Booking). They are not real accepted offers or supplier reservations.

Loading Booking records and failure to load them produce dedicated Trips empty messages. A completed or cancelled Booking remains a record; Destination does not change its operational state.

## 13. How the source snapshot is built

### Place matching

Location/name/region text is normalized and matched against selected-region terms. Country/group terms are excluded where they would make every record in an entire broad area look like the selected place.

This is a text-based discovery heuristic, not geocoding, routing or supplier eligibility verification.

### Services and providers

Directory entries, created directory services and profile-only services are combined. Providers come from the profile vendor ID and vendor-service connection records; duplicate vendor IDs are removed.

Vendor resolution currently uses seed vendor data. A newly created service can be read from local storage, but new vendor/profile/connection state is not uniformly merged from all CRM stores.

### Itinerary services

Distinct service titles are grouped by kind and normalized title. Sources are attached to the grouped record.

- Existing CRM service names are suppressed from itinerary-only duplicates when they match by normalized title.
- Non-bookable labels such as Checkout, Breakfast at, Open time and Flight required are excluded.
- Legacy package profiles can supply generated itinerary content.

Name-based matching is not a guarantee that two similar services share the same supplier offering. Do not use these discovery deduplication keys as tariff or transaction identities.

### Bookings

`loadDestinationBookings` fetches the generated Booking HTML and parses `#bkBody .bk-row` to read ID, title/destination, travel text, stage and status.

This avoids a separate copied list of Booking fixtures, but it is not a live Booking API. It does not include every later DOM mutation, browser-local accepted handoff or new backend booking. Selector/source changes can break this reader.

## 14. Example data versus real supply

The hero clearly marks destinations that include examples. Example records retain their own IDs, source label and detail disclaimer.

Examples do not create:

- A Packages catalogue record.
- A proposal accepted by a customer.
- A Booking with confirmed suppliers.
- A Vendor CRM supplier offering or tariff.
- An invoice, payment or Finance obligation.

The current Bali demo uses **real seeded service/vendor supply** plus separate illustrative packages, guide places and trips. Do not recreate those real suppliers as example entities.

## 15. Notes and shared navigation

Destination notes use the shared notes browser, search/filter/pinned behavior and Write a note composition flow. They are internal context, stored locally, separate from source records.

Global sidebar navigation goes to the selected module. The source callbacks for Packages and Proposals preserve the selected record ID. Module-level Vendor/Booking links do not currently preserve a precise record destination.

Changing destination clears open service/place/example selections and the old region context.

## 16. Current limits and handoff rules

1. No Add/Edit/Delete destination workflow.
2. No supplier availability, rate selection, trip costing, agency markup, tax or money actions.
3. No destination-specific reservations.
4. Service/Booking/Vendor package source actions often open a module rather than the precise record.
5. Real vendor cards do not open vendor details.
6. Custom workspace/API region selections are not uniformly restorable from URL on reload.
7. Text matching is not reliable transport route coverage or geographic eligibility.
8. Provider resolution does not consume every newly created CRM entity/connection store.
9. Booking records are parsed from generated HTML, not queried as a live authoritative list.
10. Guide connections can be explanatory strings rather than navigable source links.
11. Counts combine real source content and explicitly labelled examples; do not treat them as availability counts.
12. The start page and profile support discovery, not a data-editing product.

Preserve these boundaries when extending the module. Keep real rates vendor-owned and accepted operational/financial values in their owning modules.

## 17. Information structure and UI components

The module keeps the shared global shell and notes. Inside it, discovery is composed from a search combobox, featured cards, a destination hero, count shortcuts, horizontal rails, source-labelled cards and right-side read-only drawers.

Images support place/service identification. The important UX information is the **source, record identity, what selecting the card does, and whether the record is illustrative**. The visual HTML guide records the current composition rather than introducing a new design system.

## 18. Example journeys for the next agent

### A. Reuse a Bali package

Destination → Bali → Packages → real Bali Indonesia package → exact package detail → use the Packages/Proposal flow for customer-specific travel. Destination does not calculate the final customer price.

### B. Find a local transport supplier

Destination → Kerala → Services → transport service → read providers → Open Vendor CRM → locate the supplier-owned offering/tariff. Route, capacity, tax and availability must still be checked in the transport flow.

### C. Investigate a sightseeing stop

Destination → Bali → Guides → Uluwatu Temple → read connected experiences → open a real experience only where a service link is provided. A guide explanation is not a booked activity.

### D. Continue an existing trip

Destination → place → Trips → real proposal → exact proposal. Booking cards currently open the Booking module, where the employee must locate the booking.

### E. Sparse destination

Destination → Bengaluru → inspect connected sections and empty states. Missing vendor links remain missing; the UI does not invent prices or supply.

For actual screenshots and screen-to-screen links, open [the HTML companion](destination-module-ui-context.html).
