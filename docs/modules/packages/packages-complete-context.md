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


# Packages and Proposals: current source and UI audit

Reviewed: 5 October 2026. Includes catalogue, package detail/creation/editing, customer Proposals, supplier costing, review/sharing, revision/conversion and Booking/Finance relationships.

## Active components: do not infer from file names

`App → PackageBuilder → PackageComposer` is the current Package creation/edit path. It has three stages: Basic details, Build itinerary, Content & pricing. `App → ProposalBuilder → TripComposer(mode=proposal)` is the customer Proposal builder with Simple/Advanced formats and five stages. TripComposer also contains a package mode, but the current root does not mount it for Package creation. Fixed-departure controls in that alternate component are not a live new-package screen.

The evaluated baseline exports all nine packages and eight proposals, including complete days, service blocks and relationships. Source image paths remain reference assets, not embedded high-resolution source photos. Screenshot pixels are embedded separately.

## Catalogue and package detail

Search combines names/places and region suggestions. Source/region/status filters, row menus, select-all/bulk controls, empty results and height-responsive pagination are source-inventoried. Wait for resize-driven page-size updates before assuming a screenshot's initial range is final.

Package detail has Itinerary, Preview, Proposals, Inclusions, Policies, Commercials and Activity. Read the source record, starting price/basis, relative/fixed departure context, actual services, linked proposals, operational ownership and terms. Fixture details can display generated fallback narratives/numbers different from source catalogue totals. Do not silently reconcile them by inventing a data service.

View gallery, Duplicate/share header actions, some day Add/Change/More actions and preview enquiry/customization show toasts rather than complete persistence/delivery. Activity View/Remove is a real local dialog path; removal changes local event list. Platform (`Paryatech`) template edits create an agency copy and must not overwrite the original.

## Package creation and pricing

Basics require package name and destination. Itinerary defaults to three days, optional places, add/remove day (maximum 30), and seven block categories: Accommodation, Transport, Activities, Visa, Flights, DMC/Ground handling and Other. Supply picker options retain supplier-scoped identity; empty/search/API branches are separate. At least one service block is required to save.

Content & pricing keeps costs on individual blocks. Accommodation supports manual supplier quote or linked room/meal/season/guest tariff, nights/rooms/adults/children/supplements. Transport manual transfer/local/outstation fields differ from focused private tariff engines. Activity person/private/structured tariff and itemized Visa/Flight/Other charges remain category-specific. Included at no charge differs from unpriced; optional extras do not enter base cost.

Markup applies to confirmed included cost. Catalogue starting price/basis is entered separately and must not be mistaken for an exact customer offer. Supplier tax belongs to shared approved profiles; customer/agency selling tax is separate. Unknown quotes, charges, occupancy, date eligibility or tax remain unresolved, not zero.

## Observed publication defect

A documentation scenario created a three-day draft with one unpriced stay and no starting price. Choosing Published succeeded and displayed `Package status changed to published`. `PackageDetail` sends lowercase status values; the App guard compares `status === "Published"`, so the guard is bypassed. The source type assertion does not normalize the runtime string.

This is an observed prototype defect, not valid publishing behavior. The guide includes the screenshot and source lines. The documentation task has not fixed the application. Any older prose promising that publication reliably blocks incomplete pricing must be read with this correction.

## Proposal builder and meaningful branches

Simple supports day place/description/up to six photos; Advanced supports day title/place/description/highlights and six structured service kinds. Day stories/highlights are not automatically chargeable services. Required essentials and share-readiness checks differ from saving a draft.

Package foundation copies itinerary/content. Replacing it prompts only when the existing days contain a description/highlights (`plannedDays`), not merely when service blocks exist. Current screenshot includes the replacement confirmation after describing a day. Customer and quote survive replacement.

Service picker → selected supplier or custom → requirement form → save block. Accommodation, transport, activity, flight, meal and other forms have distinct fields. Focused transport has four canonical tariff methods, exact vehicle arrangements, customer/staff seats and baggage, split-group scope, continuous hire references, daily usage, charge triggers, actuals terms, approved tax and blockers. A hire appearing on several days is counted once only when identity/input matches.

Structured Activity uses vendor-owned card and service-owned option: per-person, per-booking/group, per-unit or time/day method where that card enables it; participant eligibility/session/capacity, optional/required extras and on-request supplier quote references remain explicit. The captured trek card is Draft and blocked from proposal application. Checking availability alone does not activate a draft card.

Share priced itinerary checks customer email, date pairs/order, intentionally described days, required supplier pricing and positive customer quote. Itinerary-only sharing deliberately hides price and offers changes without priced approval. Status-only team “Mark shared” remains a prototype action with weaker validation; it is not delivered communication.

## Customer response, revision, conversion and handoff

Priced customer view exposes Approve, Request a change and Decline as separate outcomes. Feedback must be nonempty before Send request. Current captures include feedback form, saved change request, Declined, Approved fixture and itinerary-only review. Responses are explicitly simulated.

Approval freezes applicable supplier values, preserves acceptedVersion and rejects unresolved pricing. Editing an approved Proposal saves a newer draft and records the older accepted revision. Earlier acceptance is not approval of the revision. Current captures show v2 draft with v1 acceptance history.

Advanced “Save as package” immediately creates a session Draft; there is no confirmation dialog. It strips customer-specific acceptance, starts with no catalogue starting price, and requires later operational review. Read exact snapshot retention in App: activitySnapshot is cleared, while private-transport references can remain; do not assume every customer-specific field is sanitized.

Open Bookings records accepted transport/activity snapshots where present and opens the module; it does not populate the entire embedded Booking detail. Supplier confirmation and actual-cost amendments stay in Booking. Confirmed transport adapter in Finance remains separate from static FinanceApp totals.

## Coverage and remaining states

The earlier Packages/Proposals atlas supplies 81 retained states, including all seven supply categories, service forms, linked tariff examples, four focused transport costing methods, package activity dialogs, customer flows and notes. Its unfinished block-types modal frame was excluded and is replaced by the complete current modal. An unfinished first shared-proposal frame was also excluded; its rendered continuation and current shared-customer captures remain. Current captures add main detail tabs, active builder validation, service no-results, draft result/publication defect, foundation replacement, draft activity guard, approved revision history, conversion and response outcomes.

Every arbitrary participant/price/vehicle permutation, API loading/failure, native file chooser, six-photo limit, unsupported TripComposer package-mode dates, all focused transport fleet/daily-usage/actuals permutations and every supplier on-request/unit branch are not individually photographed. Their exact source/fixture rules and explicit remaining-state ledger are embedded. Screenshots are evidence of captured states, not proof of a finished backend or exhaustive combinatorial testing.

Image QA excluded an incompletely painted first frame from the current Package itinerary capture. Its retained images show the scroll continuation; earlier atlas images retain the top-of-view layout. Do not mistake an omitted frame for an empty itinerary.


# Paryatech Packages and Proposals — UX and operational context

Reviewed: 2 October 2026. Scope: the current Packages workspace, including its Proposals tab, package creation/editor, customer proposal builder, supplier costing, and Booking handoff. Companion documents: [Vendor CRM context](../vendors/vendor-module-ux-operational-context.md) and [Booking context](../bookings/booking-module-ux-operational-context.md).

This is a handoff for the next product/UX agenda. It explains how the information and user journeys work today, including prototype limitations. It focuses on logic, operational responsibilities, and flows rather than visual styling. Packages inside a Vendor record are a separate supporting view; they are not automatically the same records as this root catalogue.

Visual companion: [Packages and Proposals UI and user-flow guide](packages-module-ui-context.html), with actual screenshots and field/action inventories.

## Contents

1. [Purpose and operating model](#1-purpose-and-operating-model)
2. [Ownership and data relationships](#2-ownership-and-data-relationships)
3. [Complete screen map](#3-complete-screen-map)
4. [Package catalogue](#4-package-catalogue)
5. [New package](#5-new-package)
6. [Service discovery and block selection](#6-service-discovery-and-block-selection)
7. [Package supplier costing](#7-package-supplier-costing)
8. [Accommodation costing](#8-accommodation-costing)
9. [Transport costing](#9-transport-costing)
10. [Activity and other service costing](#10-activity-and-other-service-costing)
11. [Markup, starting price, and tax](#11-markup-starting-price-and-tax)
12. [Save, edit, customize, and publication](#12-save-edit-customize-and-publication)
13. [Package detail and its seven tabs](#13-package-detail-and-its-seven-tabs)
14. [Proposals directory](#14-proposals-directory)
15. [Create a proposal](#15-create-a-proposal)
16. [Proposal itinerary and service blocks](#16-proposal-itinerary-and-service-blocks)
17. [Proposal content, costing, and sharing](#17-proposal-content-costing-and-sharing)
18. [Proposal detail and customer response](#18-proposal-detail-and-customer-response)
19. [Supplier approval and accepted snapshots](#19-supplier-approval-and-accepted-snapshots)
20. [Revisions and changed requirements](#20-revisions-and-changed-requirements)
21. [Continuous hires and duplicate-cost prevention](#21-continuous-hires-and-duplicate-cost-prevention)
22. [Save a proposal as a package](#22-save-a-proposal-as-a-package)
23. [Booking and Finance handoff](#23-booking-and-finance-handoff)
24. [Search, notes, media, and navigation](#24-search-notes-media-and-navigation)
25. [Persistence and implementation boundaries](#25-persistence-and-implementation-boundaries)
26. [Example journeys](#26-example-journeys)
27. [Rules to preserve](#27-rules-to-preserve)
28. [Source map and reusable context](#28-source-map-and-reusable-context)

## 1. Purpose and operating model

The Packages workspace supports two jobs:

| Job | Staff's question | Result |
|---|---|---|
| Maintain reusable packages | What trips can our agency offer again? | Catalogue itinerary, supplier assumptions, content, starting price |
| Prepare customer proposals | What will we offer this customer for these dates and people? | Tailored journey, supplier costing, customer quote, accepted version |

The two root tabs are **Packages** and **Proposals**. They are related but have different responsibilities:

```text
Vendor CRM service + vendor-owned tariff
  → reusable package service blocks and costing assumptions
  → customer proposal with actual dates, party, scope, supplier choices
  → customer review / approval of a version
  → accepted supplier snapshots
  → Booking fulfilment and supplier confirmation
  → resulting Finance obligations
```

A catalogue starting price is not an exact price for every future party. A day description is not a supplier service, and a service block with a title is not automatically priced or reserved.

## 2. Ownership and data relationships

| Record | Owns | Does not imply |
|---|---|---|
| Platform package/template | Reusable Paryatech-provided starting itinerary | Agency may overwrite the original platform template |
| Agency package | Agency's reusable route/days, blocks, copy, pricing assumptions | Customer acceptance or live availability |
| Package day | Relative itinerary position and service blocks | Every day has a separate whole-trip supplier charge |
| Service block | Supplier/source references and service-specific pricing inputs | A new canonical Vendor CRM service or tariff |
| Vendor-owned rate card | Supplier tariff and conditions | Service-owned copy, agency margin, confirmed availability |
| Proposal | Customer brief, dates, party, tailored days, customer total | Automatic modification of the source package |
| Supplier snapshot | Accepted tariff/input/result values for transport/activity | Live prices that change when a vendor edits the card |
| Accepted proposal version | Agreed customer arrangement and price | Supplier booked or payment received |
| Booking | Supplier confirmation and accepted arrangement fulfilment | Catalogue publishing |
| Finance | Resulting receivables/payables and money | Supplier Test Rate output is already a transaction |

Service block types are Accommodation, Road transport, Activity, Flight, Meal, Other. The catalogue picker also classifies Visa and DMC/Ground handling; these map to Other service blocks in the Proposal model.

Source metadata can retain service ID, vendor ID/name, source type, and rate-card ID. Focused transport/activity calculations reference canonical supplier cards rather than copying a tariff into a service-owned record. Accepted snapshots are deliberate historical copies for the agreed booking, not new editable tariffs.

Root catalogue/proposal records currently live in App session state. Supplier tariffs, some services, vehicles, notes, tax profiles, and accepted handoffs have separate browser persistence. This is not one shared database.

## 3. Complete screen map

```text
Sidebar → Packages
  ├─ Packages tab
  │   ├─ Search/region suggestions + Source/Region/Status filters
  │   ├─ Catalogue rows, row actions, selection, pagination
  │   ├─ New package
  │   │   ├─ Basic details
  │   │   ├─ Build itinerary → day → service picker
  │   │   └─ Content & pricing → service costs → markup → starting price
  │   └─ Package detail
  │       ├─ Itinerary
  │       ├─ Preview
  │       ├─ Proposals
  │       ├─ Inclusions
  │       ├─ Policies
  │       ├─ Commercials
  │       ├─ Activity
  │       └─ Edit / Customize as agency copy / Use in proposal
  └─ Proposals tab
      ├─ Search/customer/query/region + Status filters
      ├─ Rows, linked query, row actions, pagination
      ├─ New proposal / Create from package
      │   ├─ Simple / Advanced format
      │   ├─ Basic details + optional package foundation
      │   ├─ Itinerary → days + service selection/details
      │   ├─ Content & policies
      │   ├─ Costing → supplier calculation + customer price
      │   └─ Preview → Save draft / Share itinerary / Share priced itinerary
      └─ Proposal detail
          ├─ Itinerary
          ├─ Customer brief
          ├─ Commercials + accepted version history
          ├─ Activity
          ├─ Customer preview → approve / request changes / decline
          ├─ Edit proposal
          ├─ Save as package, for Advanced proposals
          └─ Approved → Open Bookings

Package notes → stored workspace notes
Destination → linked catalogue/proposal discovery → root detail
```

The active New/Edit package flow is `PackageComposer`. `TripComposer` still contains package-mode branches, but the root PackageBuilder currently uses PackageComposer. Do not describe every legacy TripComposer package control as an available New package step.

## 4. Package catalogue

**Entry:** `/` or `/?module=packages` → Packages tab.

Columns: selection, Package/reference, Destination/region, Duration, Price basis/starting amount, Source/mode, Status, Action.

Packages can be Published, Draft, Archived. Source distinguishes Paryatech templates from Your catalog. Search matches name, destination, region, and reference. Filters combine source, region, and status; sort uses most recently updated first.

Region suggestions are available for queries of at least two characters. Choosing a suggestion searches its associated destination/package terms rather than treating it as a literal package name. A region dropdown also provides direct region filtering.

Pagination is real client-side slicing of filtered records. Page size adapts to available viewport height and compact-card presentation. Header checkbox selects/deselects visible rows; selected IDs may span pages until cleared. Empty state offers Clear filters.

Row actions:

- **Open package:** opens that package record.
- **Archive:** changes the record's session status to Archived.
- **Duplicate:** currently only shows a confirmation message; no copy is created.

Bulk Archive currently only shows a ready-for-bulk-action message. It does not archive selected records. There is no complete delete/unarchive-management workflow or server catalogue publication behind the list.

## 5. New package

**Entry:** Packages → New package.

### Step 1 — Basic details

Enter required Package name and Destination; optional Region. Continue requires both required fields. A blank region later defaults to Other.

### Step 2 — Build itinerary

New packages begin with three empty days. Each day has relative day number, optional place/city, and service blocks. Staff can:

- Add a day, up to 30.
- Remove a day, retaining at least one.
- Set the place/city.
- Open Add service block, choose a category, and select a service.
- Remove a chosen block.

This composer does not provide the full Advanced Proposal day narrative/photo/reorder workspace. A saved day title becomes its place, or a generic Day N plan. The current package draft flow establishes relative days and supplier blocks first.

### Step 3 — Content & pricing

Price each supplier service, inspect included/optional totals, enter markup, and separately set catalogue starting price/basis. Then write overview, inclusions, exclusions.

Back moves to the previous stage; stage buttons can also jump between stages. Cancel at the first step leaves creation. Changes remain in the open form until Save; there is no server autosave or recoverable package draft when the browser reloads.

### Create draft

Submit requires name/destination and at least one service block anywhere in the itinerary. It does not require every day populated or every supplier cost resolved. An incomplete product can therefore be saved as a Draft.

Save creates a random `PKG-…` reference, agency source, duration from day count, saved day/block data, copy, markup, price basis/starting amount, and a destination image fallback. It opens the new package detail. Random references do not implement database uniqueness guarantees.

## 6. Service discovery and block selection

The package service picker starts with category choice:

- Accommodation
- Transport
- Activities
- Visa
- Flights
- DMC/Ground handling
- Other

Then it shows matching Vendor CRM results and optional external search results with name, location, supplier/context, and source. Staff can filter by name/location/vendor/description. External search is optional, starts after two characters, and displays loading/failure states. Without `VITE_SERVICE_SEARCH_API_URL`, it returns no additional API results.

Selecting a service adds a block to the chosen day with title/detail, category, source IDs, supplier and available media. It does not create or modify a Vendor CRM service or reserve it.

Initial pricing behavior:

- Transport starts unpriced with one vehicle/trip and charges To confirm.
- Activity with a linked tariff gets tariff/option/method references and an initial request. A resolved numeric price still requires valid request inputs and an Active tariff.
- Other Activity/Visa/Flight/Other blocks get editable charge-component templates.
- Accommodation requires a tariff or manual supplier quote in pricing.

Current discovery boundaries:

- The picker builds supplier rows from seeded vendor/connection data plus browser-created services.
- It does not universally consume newly linked vendor–service relationships, deleted-service markers, or session-created vendor identities from the Vendor module.
- Created edits and seeded services can overlap in the combined array.
- A listed supplier name is not the same as validated route/date/capability eligibility.
- Accommodation tariff association still relies on property names/older fixture mappings in several paths.

The user should therefore treat the picker as discovery; the selected tariff calculator validates commercial applicability.

## 7. Package supplier costing

Costing stays attached to the service blocks. A description or written highlight does not create a supplier charge.

Each block has a pricing state:

| State | Meaning |
|---|---|
| Unpriced / awaiting supplier rate | Required input/price is unresolved; not a zero-cost service |
| Priced / supplier confirmed | A calculator or confirmed quote provides a cost |
| Included at no charge | Explicitly no separate supplier charge |
| Optional extra | Cost exists but stays outside the base package total |

The aggregate reports confirmed included supplier cost, optional supplier cost, and unpriced required services. Cost lines have their actual basis: room-night, vehicle/trip, package/excess, person/group/unit, applicant, etc. Traveller count is not a universal multiplier.

Known partial cost can be displayed while required items remain unresolved. It must be identified as partial, not a finished quotation. Package saving allows incomplete Drafts; publication/readiness needs separate validation.

## 8. Accommodation costing

**Supplier-card path:** select a Published accommodation card for the property → choose Room, Meal plan, pricing reference check-in, Nights, Rooms, Adults, Children with age/bed → inspect breakdown.

The intent is to use the Vendor tariff's seasonal/nightly matrix, occupancy constraints, guest rules, weekend adjustments, mandatory supplements, and tax treatment. Future proposals replace reference dates with customer travel dates.

**Manual path:** supplier, meal/scope, confirmed price per room-night, rooms/nights, pricing state. Applicable manually entered guest supplements can be retained in the service model, especially through Proposal editing.

Commercial basis:

```text
room nights and selected meal/season rates
  + applicable extra adults/children
  + mandatory date-specific supplements
  = supplier stay cost
```

Current boundaries:

- Accommodation card discovery/calculation still uses the older fixture registry in several functions, unlike the dynamic focused transport/activity registry.
- Matching by exact property/title can miss otherwise relevant newly created cards.
- Date-range parsing and first matching season differ from the dedicated accommodation Card Test Rate engine; do not assume these paths are identical.
- Missing guest prices can block. Some unknown mandatory supplements are skipped by this costing implementation instead of creating a blocker.
- Tax requires confirmed treatment and is represented as included here, not a full shared supplier-profile calculation.

These are implementation distinctions relevant to the next agenda, not a new pricing specification.

## 9. Transport costing

There are three current paths:

1. **Focused private transport tariff:** Active vendor-owned Fixed Transfer, Local Package, Outstation Per Km, or Daily Hire; uses the shared private-transport calculator.
2. **Legacy published transport card:** older route/vehicle/season matrix.
3. **Confirmed manual supplier vehicle quote:** explicit class/rate/usage/charge assumptions.

### Focused tariff path

After selecting an Active focused tariff, the shared costing panel captures dates/time, pickup/drop, customers and guide seats, bag types, AC, mixed vehicle allocations, and applicable usage. It can compare eligible supplier tariffs without converting Fixed Transfer into an indistinguishable per-km product.

Pricing meaning:

| Template | Supplier formula |
|---|---|
| Fixed Transfer | Directed route price per selected private vehicle + triggered extras |
| Local Package | Hours/km package + allowed excess km/hour charges |
| Outstation Per Km | Billable distance under confirmed minimum method × vehicle rate + driver/day + extras |
| Daily Hire | Billable days × daily vehicle price + excess under carry-forward rules |

Passenger/bag/AC capability comes from reusable Vehicle Offerings, not inferred from a label or entered again in each tariff. Multiple allocations such as van + MUV use their individual tariffs. Route direction, dates, ownership/service scope, charge triggers, approvals, and supplier tax profile are checked.

Actual charges produce base plus actuals. Proposal decisions explicitly assign whether the agency absorbs them or the customer pays separately. Valid tariff/capacity does not mean supplier availability.

### Legacy/manual paths

The manual form offers Transfer, Local by day, Outstation by km, exact class/standard, pickup/drop, usable seats excluding driver, quantity, reference date, usage/allowances/excess rates, waiting, driver, tolls/parking/permits/tax treatment.

Missing supplier/route/class/rate/charge treatment can block. Local/manual paths have fewer supplier-rule options than the focused engine and do not offer the same rich luggage/tax/acceptance safeguards. They should not be presented as equivalent to a fully validated focused tariff.

### Package versus customer scope

Package inputs are reusable costing assumptions. Customer dates/people/route may differ. The focused calculator can be reused in Proposal, but a package's numerical example is not guaranteed to be the next customer's cost.

## 10. Activity and other service costing

### Activity with supplier tariff

Choose the vendor-owned Activity card → reference date → shared service option → enabled pricing method → participants/category/age or group/unit quantities → relevant additional components → result.

Methods are per person, per booking/private group, or per unit/session/hour/day. Option age/capacity and supplier tariff validity are checked. On-request rows stay unresolved until the customer-specific confirmed amount/source/validity is recorded; they should not receive an invented package price.

Activity transport/admission/meal components can be included, additional, actual, or externally required. Proposal approval later checks separately linked required services and possible duplicate transport. Session availability is separate from numeric price.

### Other confirmed supplier quotes

Without a dedicated tariff, the package form uses itemized charge rows. Default examples:

- Activity: experience, admission, guide.
- Visa: government fee, processing, biometrics.
- Flight: airfare, airline charges, baggage, booking fee.
- Other: supplier rate, additional charge.

Staff edit name, quantity, unit, and rate; add/remove charges; supply supplier, reference, validity, notes, optional flag, and pricing status. Total is the sum of quantity × confirmed component rate. At least one positive confirmed component is needed for the itemized Priced path; Included is an explicit alternative.

A Flight block is a quoted itinerary component, not a live airline booking. Visa rows do not file an application. DMC/Other entries do not automatically retrieve a multi-supplier contract or Tax Engine result.

## 11. Markup, starting price, and tax

The current package aggregate uses:

```text
indicative selling basis = round(markup cost basis × (1 + markup % / 100))
```

Optional and unresolved required services are not silently included in this base. Where focused transport has approved recoverability data, its markup basis can differ from gross supplier payable.

Catalogue starting price is entered separately with a basis such as “Per adult, twin sharing.” This is a catalogue presentation decision, not automatic conversion of group vehicle cost into per-person supplier pricing. The current package markup default is 9% unless inherited; it does not automatically apply every rate card's owner-set markup default.

Proposal likewise allows a final customer-total override or Use calculated amount. These are alternative ways to set the customer quote, not successive markups that should be applied twice.

Tax boundaries:

- Focused transport uses approved shared supplier tax profiles and Inclusive/Exclusive mode. Inclusive does not add tax again.
- Activity has its dedicated approved supplier-tax configuration/calculation.
- Older accommodation/legacy/manual/component paths have different tax treatment and must not be described as uniformly using one shared engine.
- The root customer quote form does not currently implement a complete separate customer-side Tax Engine calculation. A number displayed as total or sample “taxes included” copy is not proof that customer GST was independently resolved.

The workspace distinguishes commercial supplier amount, supplier tax/payable, markup cost basis, and agency selling decision where implemented. Further work must preserve that ownership without implying full tax/ledger integration everywhere.

## 12. Save, edit, customize, and publication

### Agency edit

Open an agency package → Edit package → same composer with existing content/days/costs → Save package → replace that record in App state → return to detail. Existing status, departure metadata, and stored policies are retained by the wrapper. Saving is session-level, not server persistence.

### Platform template customization

Open a Paryatech template → Customize as agency copy → composer prefilled with template content → Save → new agency ID/source. The platform template remains unchanged. Direct detail-status changes on a platform template are rejected with a message.

The list Archive action does not have the same platform-protection check; it can locally mark any listed item Archived. Do not treat the template guard as universal authorization.

### Publication

The detail status selector offers Published, Draft, Archived. Root code intends to block publishing saved-day packages with incomplete planned blocks, unresolved required supplier costs, or no starting price/basis.

**Current implementation mismatch:** the selector emits lowercase values (`published`, etc.), while the root publication guard compares to `Published`. The callback casts instead of normalizing. The intended publication check can therefore be bypassed, and stored casing can disagree with declared statuses/tone mappings. It is a context finding; this documentation task does not modify the implementation.

New-package submit also rewrites planned block count to the actual current block count. That means planned-count validation cannot by itself prove a fully designed itinerary. No public catalogue deployment or external customer publication occurs from changing status.

## 13. Package detail and its seven tabs

The header provides package identity, source/reference, destination/region, duration, status, owner/team sample context, Edit/Customize, and More actions. Owner/team are static here, not an editable permission workflow. The “Advanced itinerary” header label is also not consistently derived from the saved mode.

### Itinerary

Shows gallery, composition counts, package story/highlights, relative day plan, expandable service blocks, and a rail with starting price/coverage/commercial context and Use in proposal.

Saved packages read their saved days; older fixtures use a generated destination profile itinerary. Opening one day normally replaces the open-day selection; Show all/Collapse all controls the full plan.

View gallery and line-level actions primarily show messages. Add item opens a type/name/details form, but Add to day only closes and reports success; it does not update the package. To actually change blocks, use Edit package.

The sample fallback itinerary can have different duration/date/party/commercial figures from the catalogue row. Unknown legacy packages can fall back to the Bali profile. Saved-day detail counts are more data-driven, but several rail labels still describe sample or review-needed context.

### Preview

Shows the customer-facing package cover, destination/duration, overview, From price/price basis, day-by-day journey, inclusions/exclusions/notes/payment/cancellation terms. Simple mode hides detailed service presentation in this package preview. Supplier costing and margin are not a customer promise.

Enquire about this trip and Request customization show preview messages; they do not send an enquiry or create a Query. No public URL/lead-capture workflow is implemented.

### Proposals

Lists root proposals whose source package ID matches this package. Each proposal is an independent customer copy. Open proposal navigates to it; Create proposal copies the foundation into the customer builder.

### Inclusions

Saved-day packages show service names grouped by day. Older fixtures show fixed inclusion/exclusion examples. This tab does not automatically prove that each listed component is costed, available, or supplier-confirmed; the customer-facing Preview separately reads authored inclusion/exclusion copy.

### Policies

Legacy packages show sample cancellation/date-change windows/fees/terms. Saved-day packages show a Policy setup reminder instead of a fully structured supplier-policy aggregation. Authored customer terms can be seen in Preview and Proposal content, but this tab is not a universal policy engine.

### Commercials

Legacy packages show sample costs/tax/markup. Saved-day packages show setup guidance/starting price and remind staff that customer-specific quotes should not be reused blindly. This is not a detailed live ledger or the full editable costing view.

### Activity

Searchable/selectable event rows include actor/role/date/context. View Activity shows event details and can jump to the relevant tab/day. Remove Activity hides the local record after confirmation. New saved packages start without the legacy sample history; builder/status actions do not consistently generate immutable events.

Detail More → Duplicate and Share are message-only. “Share link copied” does not currently copy a real link. The catalogue duplicate action is similarly message-only.

## 14. Proposals directory

**Entry:** Packages workspace → Proposals tab.

Columns: selection, Proposal, Customer, Query, Travel/party, Quoted total, Last updated, Status, Action.

Search includes proposal/customer/package/destination/reference/query; Region and Status filters combine. Statuses are Draft, Itinerary shared, Changes requested, Approved, Declined. It uses adaptive client pagination and visible-row selection like the package catalogue.

Linked Query opens a brief modal when query context exists: customer, destination, dates, party, requirements. It is a context reference, not a complete Query workspace integration.

Row actions:

- Open proposal: actual selected record.
- Duplicate proposal: creates a session Draft with new reference, version 1, cleared query/accepted-version/change request and copied days.
- Export: message-only; bulk Export is also message-only.

The duplicate clears Activity snapshots but does not uniformly clear transport snapshots, accepted revision history, or all customer-specific input. It also retains customer details and warns staff to edit them. Do not describe Duplicate as a fully sanitized new-customer proposal.

New proposal and Create from package enter the same builder; the latter is not a separate fully preselected package flow from the directory. A package detail's Use in proposal does provide a selected foundation.

## 15. Create a proposal

Entry routes:

1. Proposals → New proposal, from scratch.
2. Package detail → Use in proposal / Create proposal, with foundation.
3. Existing proposal → Edit proposal.
4. Query context can prefill the builder through its data interface; a complete Query module flow is not implemented here.

Without an existing/selected package, choose **Simple itinerary** or **Advanced itinerary** first. This is customer presentation/authoring mode, not a different supplier pricing model.

Builder stages are Basic details, Itinerary, Content & policies, Costing, Preview.

Basic details capture customer name/email, adults/children, requirements, proposal name, destination/region, start/end dates. Package foundation can be selected inside the builder. Applying another package replaces the itinerary/content/default markup and selects Advanced mode; when existing day narratives are already planned, a confirmation asks before replacement.

Dates can be open in a Draft. When one date is entered, both must be in valid order. Date range is not a universal automatic generator of matching itinerary-day count. Children are party counts here; service-level age/seat requirements are captured separately.

Cancelling a package-originated builder returns to the source package and prior navigation context. Saving opens the new/updated Proposal detail and switches the workspace to Proposals.

## 16. Proposal itinerary and service blocks

### Simple mode

Each day centers on place name, description, and photos. It can still contain real supplier service blocks for costing. Simple presentation does not eliminate operational services or make written descriptions billable.

### Advanced mode

Each day has title, place, description, highlights, optional image, and ordered service blocks. A day rail identifies which day is active and whether narrative is planned.

Staff add/remove/reorder days, retain at least one, move blocks up/down, edit/remove blocks, and add services from the itinerary or costing screen. Removing the visual block changes draft costing, not an accepted booking automatically.

### Add block flow

Type → search/select supplier service or custom entry → details → Add/Save block. Types are Accommodation, Road transport, Activity, Flight, Meal, Other.

The detail form branches by type:

- Stay: saved supplier card or manual quote, room/meal/guest/night/date inputs.
- Transport: focused card/shared calculator, legacy card, or explicit manual vehicle quote.
- Activity: supplier option/method/session/participants/unit/extra rules, or manual confirmed amount/reference/validity.
- Flight/meal/other: descriptive supplier scope, price state, quantity/unit/rate and relevant existing components.

Live breakdown explains why a cost is priced/included/unpriced. A saved rate-card ID alone does not make an invalid request safely priced. Service editing preserves source/cost data selectively; changes are local draft inputs.

## 17. Proposal content, costing, and sharing

### Content & policies

Author cover, introduction, inclusions, exclusions, important notes, payment terms, cancellation policy, and other terms. These explain the offer presented to the customer. They do not automatically compute contract cancellation fees or reserve services.

### Costing

Group service amounts by itinerary day with edit access. Aggregate included supplier cost, optional cost, unpriced count. Supplier calculations use actual trip start/day context where supported. Set markup and optionally Use calculated amount, or enter the final customer-total override.

The proposed customer total belongs to this proposal, not the package's per-adult starting price. The interface does not apply a second tariff markup automatically.

### Sharing choices

| Action | Gate and outcome |
|---|---|
| Save draft | Name/destination/customer and valid date pairing; allows incomplete service costs |
| Share itinerary for review | Required customer email and day planning; customer price hidden |
| Share priced itinerary | Same narrative requirements plus all required services resolved and positive customer total |

Every shared day needs a description or meaningful highlight; Simple mode also requires a place for every day. A leisure day can be planned with narrative and no chargeable activity.

Share marks status **Itinerary shared**. It does not send email/WhatsApp or generate an externally hosted customer link. The builder preview simulates responses until saved.

A separate Draft-detail “Mark shared” action changes status directly and does not run the same builder sharing checks. Sharing validation is therefore not enforced consistently at every entry point.

## 18. Proposal detail and customer response

Header: title, customer/destination/dates, Simple/Advanced, version/reference, Preview customer view, Edit proposal.

### Team tabs

- **Itinerary:** customer introduction, day plan/services, customer-total rail, brief/source package, sharing/Booking actions.
- **Customer brief:** requirements/change request, customer/email/party/dates, source package access.
- **Commercials:** total proposal price, supplier service costing, optional/unpriced figures, approval/Booking readiness, accepted history when present.
- **Activity:** current update and change-request information; not a complete immutable event stream.

### Customer preview

Shows journey, trip content/terms, actuals exclusions where the customer pays them separately, and an understandable total or Price not shown for itinerary-only review. Supplier costs/margin are kept out of the intended customer view.

Responses:

- Approve proposal, when a priced offer is presented.
- Request a change with nonempty feedback.
- Decline offer, distinct from requesting changes.

Responses are local simulations, explicitly described as such in the UI. Draft has no active customer response; approved version is displayed separately. Builder preview-only responses do not save to App state; saved-detail preview responses can change the session proposal through callbacks.

Customer approval is not supplier availability or confirmation. The accepted version proceeds to Booking for fulfilment.

## 19. Supplier approval and accepted snapshots

When status changes to Approved, the root app validates/freezes Activity pricing first, then focused Transport pricing.

### Activity checks

Require an Active supplier card, resolved supplier amount, and acceptable session availability state. Where excluded components require separately priced itinerary services, those links must resolve to included, priced blocks. If Activity transport and another transfer coexist on the same day, staff must confirm distinct movements rather than pay for duplicate transport.

Accepted snapshot retains supplier/card/service/version, currency, request, result, and pricing time. Price and session confirmation remain distinguishable.

### Transport checks

Validate selected approved supplier tariff, actual request/capacity/luggage, group coverage, dates/route, charge conditions, tax profile, and actuals terms. Freeze tariff, vehicles, profiles, input, and result. A retained hire is snapshotted/costed once.

### Boundaries

Approval is stronger than merely displaying a total, but it is not a universal gate for every service family. The root approval handler does not uniformly re-run all generic/accommodation required pricing and customer tax/terms checks. Already frozen snapshots bypass live recalculation by design. Subsequent work must distinguish intended completeness from the checks actually implemented.

## 20. Revisions and changed requirements

Editing an Approved proposal first records its existing accepted handoff. The editor clears Activity/Transport snapshots for live recalculation in the new draft, while the accepted arrangement remains in the handoff store/history.

Saving increments the proposal version and can append the old accepted days/customer price into Accepted version history. A revised draft needs new review/approval; it does not silently rewrite the accepted Booking snapshot.

If transport covers Entire proposal group, changed adults/children affect its capacity validation. Selected travellers/split arrivals retain their own requirement count. Luggage/date/route inputs remain explicit; changing group size does not infer new bag quantities or pickup schedule.

Service inputs/results can remain stale if copied through paths that do not clear snapshots correctly. Duplicate proposal and Save as package are two such boundaries. Existing accepted-version metadata also remains on a revised Draft; staff must read current status and version rather than an acceptedVersion field alone.

Earlier Accepted dates use the current local recording time where not previously stored; they are not a verified external signature timestamp.

## 21. Continuous hires and duplicate-cost prevention

Outstation/Daily Hire services can use a continuous hire reference. Add-block discovery offers **Vehicle already hired for this trip** so staff can show the same retained vehicle on another day without rebuilding its supplier charge.

The costing aggregator counts the first occurrence of that hire. Subsequent occurrences with the same card and identical trip inputs are Included at zero additional cost. If another day carries conflicting details for the same hire reference, it becomes unpriced with an issue rather than silently billing a second whole hire.

Split arrivals use separate requirements/service IDs with distinct pickup times/people; they should not share a retained-hire identifier merely because the route is the same.

This deduplication also carries into accepted transport handoff. It is based on explicit IDs and matching data, not a heuristic that two similar titles must be the same hire.

Activity transport has separate duplicate checks at approval. They do not constitute a universal deduplication engine for hotel stays, meal components, or all manual services.

## 22. Save a proposal as a package

**Entry:** Advanced Proposal detail → Save as package. Simple proposals do not expose this action.

Creates an agency Draft with flexible relative days, new reference/name, source/template linkage, copied itinerary, no starting price, and a flag that it came from a proposal. It opens the new Package detail and preserves return navigation to the proposal.

The intended reason is to reuse a successful itinerary without carrying the exact customer selling quote forward. Supplier assumptions must be reviewed for the next customer.

Current copying is not fully sanitized:

- It clears Activity snapshots but does not clear every transport snapshot/input, customer-specific service date, or quote assumption.
- The accepted selling total is omitted, but authored policies/content are not all copied consistently.
- Reference tariff/data can therefore remain tied to the old customer's trip unless reviewed.

Do not describe this action as producing a fully generic, automatically recalculable package without checking its service inputs.

## 23. Booking and Finance handoff

Only Approved proposals expose Open Bookings. That action records Activity and Transport snapshots, then changes module.

Transport handoff deduplicates by proposal/accepted version and hire. Booking's separate panel accepts actuals/usage amendments and supplier confirmation. Finance helpers select the latest confirmed obligation per proposal/hire and include recorded deltas, preventing repeated full supplier costs.

Activity handoff stores accepted price/session states and is displayed separately. It does not currently have the same transport confirmation/amendment/Finance flow.

This does **not** create a fully populated booking row in the embedded HTML operations directory, a customer invoice, payment, voucher, supplier reservation, or synchronized agency ledger. Booking, Vendor side panels, and Finance still retain independent fixtures.

The approved customer amount and supplier payable remain different numbers with different responsibilities. Later supplier actuals do not automatically change the customer's accepted total.

## 24. Search, notes, media, and navigation

### Search

Catalogue/proposal list search is implemented. Region search can use local suggestions or an optional configured endpoint. Service API search is optional and cancellable. Global shell search focuses through Ctrl/Cmd+K but is not the same as a complete indexed global record resolver.

### Notes

Root WorkspaceNotes provides module notes linked to displayed package/proposal records. Notes use browser storage and are supporting agency context, not supplier contractual approval. They are separate from the embedded Booking notes implementation.

### Media

Package Composer inherits cover/default destination imagery; Proposal supports cover/day media and Simple multi-image day content. Browser-selected images use client-side media handling, not a shared file library/CDN upload or verified licensing workflow. Sample external media can require internet access.

### Navigation

App tracks module, workspace, record, and detail-tab trails. Opening a proposal from a package or source package from a proposal can return to the prior record/tab. Selecting the module entry can reset to its directory. Root module query parameters select Packages/Vendors/Booking/Finance/Destination; they do not provide complete deep links for every in-memory package/proposal detail.

Destination's linked package/proposal paths use root records and can open detail. Vendor record Packages uses separate mapped sample data and local editor state; do not assume edits there update this catalogue.

## 25. Persistence and implementation boundaries

| Area/action | Current behavior |
|---|---|
| Root catalogue/proposal records | App session state seeded on load; reload resets records |
| New/Edit agency package | Real local record creation/update in that session |
| Customize Paryatech template | Creates separate agency record; original unchanged through this flow |
| Package Archive row action | Changes session status |
| Package Duplicate/Share/detail Add item/gallery actions | Confirmation messages; no complete mutation/share/gallery workflow |
| Bulk Archive/Export and Proposal Export | Message-only |
| Package status/publication | Local status; casing mismatch weakens intended gate; no public deployment |
| Proposal Duplicate | Creates Draft but incompletely clears customer/accepted transport metadata |
| Supplier service picker | Seeded/vendor browser-service discovery plus optional external API |
| Accommodation costing | Older published fixture registry; several differences from Card Test Rate |
| Focused Transport costing | Shared tariff engine, reusable vehicles, approved supplier tax |
| Activity costing | Dedicated supplier tariff engine with approval/snapshot checks |
| Manual/component costing | Explicit quote/itemized amounts, not universal shared tax/availability integration |
| Share proposal/customer responses | Local status/feedback simulation; no external delivery/signature |
| Accepted revisions | Proposal session history plus separate durable supplier handoffs |
| Transport/Activity accepted handoffs | Browser storage; separate from HTML Booking rows |
| Transport supplier actuals/confirmation | Browser records; latest confirmed obligation used downstream |
| Notes | Browser-stored WorkspaceNotes |
| Finance/Booking/Vendor contextual fixtures | Independent sample amounts/records |

Important current limitations to retain in the next agenda:

1. Session records and browser-stored supplier data can outlive one another, producing incomplete relationships after reload.
2. Package publication and Proposal sharing have inconsistent validation entry points.
3. Accommodation supplier-card discovery and calculation do not uniformly use the latest canonical registry/engine.
4. Service-picker ownership/connection discovery is partly seeded, not the complete current Vendor directory state.
5. Converting/duplicating customer records does not remove every accepted or trip-specific supplier input.
6. Customer tax, permissions, external customer delivery, live availability and full booking conversion are not complete connected systems.
7. Static Package policy/commercial detail should not be treated as an authoritative generated contract or ledger.

This handoff is based on current source inspection and read-only preview of the catalogue. It is not a new full financial/persona audit or proof that every button has been exercised in production.

## 26. Example journeys

### A. Create an agency Kerala product

Packages → New package → name/destination/region → three relative days, add/remove as needed → add CRM stay/transfer/activity blocks → Content & pricing → select valid tariffs or confirmed quotes → inspect unresolved/optional costs → markup → separate starting price/basis → reusable copy → Create draft → inspect Preview → Edit to refine → review publication readiness.

The current status casing issue means staff cannot rely on the Publish control alone as a validation gate.

### B. Customize a platform template

Paryatech-source package → Customize as agency copy → modify relative days/services/content/costing → Save → agency Draft with new ID. Original platform template remains separate.

### C. Tailor a package for a family

Package → Use in proposal → customer/party/dates/brief → Advanced itinerary → adjust stays/vehicles/experiences → content/terms → supplier calculations → customer total → customer preview → Share priced itinerary → simulated review/approval → supplier snapshots → Open Bookings.

Every new party/date/scope requires applicable costing; starting price is not blindly multiplied into a final quote.

### D. Share a simple route before supplier pricing

Proposals → New proposal → Simple → basic customer details → place/story/photos for every day, add any known service blocks → content → Preview → Share itinerary for review. Customer sees Price not shown and can request changes. A later priced offer needs required supplier costs and a positive customer total.

### E. Five-day retained van

Proposal → Road transport → Active Outstation/km tariff → dates, ten customers + guide, luggage, route/850 km → suitable van → billable minimum 1,250 km at 250/day → ₹22/km + ₹500 driver/day = ₹30,000 before other charges/tax → retained hire ID → reuse on later itinerary days → one supplier cost → approved snapshot → Booking confirmation/actuals.

### F. Revise an accepted family trip

Approved proposal → Edit → accepted version preserved in handoff/history → change group/dates/route → snapshots cleared in draft → reselect suitable supplier arrangement → save new version → share/reapprove → new accepted version. The old booking obligation remains separate until a new supplier arrangement is confirmed.

## 27. Rules to preserve

1. Catalogue package and customer proposal are independent records.
2. Services and vendor-owned tariffs retain their original ownership/identity.
3. Relative package days are a reusable plan, not live traveller dates by default.
4. Customer descriptions do not create supplier costs without service blocks.
5. Priced, Included, Optional, and Unpriced remain explicit states.
6. Group transport is priced per vehicle/hire under supplier rules, not automatically per traveller.
7. Vehicle capacity/luggage belongs to reusable Vehicle Offerings.
8. Supplier tax, recoverable-cost basis, agency markup, and customer tax are separate responsibilities.
9. Apply the selling decision once; a final override is not an additional markup layer.
10. Reference prices need recalculation for new customer scope/dates/party.
11. Shared itinerary review can proceed without pretending the price is complete.
12. Customer approval is version-specific and does not confirm suppliers.
13. Accepted snapshots remain fixed while a revised draft recalculates.
14. A retained hire is charged once across its itinerary references.
15. Activity included/external transport and meal/admission components need clear scope to avoid duplication.
16. Booking manages confirmation/actuals; Finance consumes resulting obligations once.
17. Do not present message-only actions, sample totals, or local simulations as finished production flows.

## 28. Source map and reusable context

| Area | Current sources |
|---|---|
| Catalogue/proposals lists, records, navigation | [App.tsx](../../../src/App.tsx) |
| Active package creation/edit wrapper | [PackageBuilder.tsx](../../../src/PackageBuilder.tsx) |
| Active three-stage package composer | [PackageComposer.tsx](../../../src/PackageComposer.tsx) |
| Package detail and legacy profiles | [PackageDetail.tsx](../../../src/PackageDetail.tsx) |
| Package costing/component charges | [PackagePricing.tsx](../../../src/PackagePricing.tsx) |
| Supplier-family pricing forms | [PackageStructuredPricing.tsx](../../../src/PackageStructuredPricing.tsx) |
| Supplier discovery/API search | [packageServiceSearch.ts](../../../src/packageServiceSearch.ts), [regionSearch.ts](../../../src/regionSearch.ts) |
| Proposal creation/version wrapper | [ProposalBuilder.tsx](../../../src/ProposalBuilder.tsx) |
| Proposal itinerary/content/costing editor | [TripComposer.tsx](../../../src/TripComposer.tsx) |
| Proposal detail/customer preview | [ProposalDetail.tsx](../../../src/ProposalDetail.tsx) |
| Data model and hire deduplication | [proposalModel.ts](../../../src/proposalModel.ts) |
| Supplier costing and accepted freezing | [serviceCosting.ts](../../../src/serviceCosting.ts) |
| Focused transport costing UI | [PrivateTransportProposalCosting.tsx](../../../src/PrivateTransportProposalCosting.tsx) |
| Supplier option resolver | [transportOptions.ts](../../../src/modules/vendors/rateCard/transportOptions.ts) |
| Downstream snapshots/obligations | [bookingTransportHandoff.ts](../../../src/bookingTransportHandoff.ts), [bookingActivityHandoff.ts](../../../src/bookingActivityHandoff.ts) |
| Notes and detail history | [WorkspaceNotes.tsx](../../../src/WorkspaceNotes.tsx), [useStepNavigation.ts](../../../src/useStepNavigation.ts) |

### Short context to carry into the next agenda

Paryatech Packages contains a reusable catalogue and a Proposals workspace. The active PackageComposer creates relative days with supplier service blocks, itemized/reference costing, markup and a separately authored starting price. Agency editing updates a session record; platform customization creates an independent agency copy. Package detail has Itinerary, Preview, Proposals, Inclusions, Policies, Commercials, Activity. Proposals use Simple/Advanced itinerary modes and five stages: Basic details, Itinerary, Content & policies, Costing, Preview. Supplier costs follow service-specific formulas; customer selling total is separate. Review can be itinerary-only or priced, and customer responses are local simulations. Activity/focused Transport approval freezes supplier request/result/version; continuous vehicle hires cost once. Approved proposals can hand accepted snapshots to Booking for confirmation/actuals, with Finance using confirmed supplier obligations. Catalogue/proposals remain session data; many detail/bulk/export actions are placeholders, and publication, discovery, accommodation engine consistency, copy sanitization and customer tax still have explicit limits. Preserve ownership, accepted versions, unresolved states and operational boundaries from section 25.
