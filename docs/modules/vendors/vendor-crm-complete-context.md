# Vendor CRM — complete migration context

Reviewed **4 October 2026**, from the main repository at commit `cfc0335998cde94795561b7381bbfe1d6a2c35e9`. Documentation changes follow that baseline. The authoritative preview for this review was the root application at `http://127.0.0.1:4180/?module=vendors`, not a separate Vendor worktree.

Open [the complete visual reference](vendor-crm-migration-reference.html). It embeds current screenshots, earlier supplementary captures, this document, the complete module operations context, and the complete pricing/examples/personas context. It works as a standalone file. Use its screen search, flow navigation, screenshot zoom, control inventory, and text download.

This is a migration specification and evidence record. It does not change the product. A screenshot shows what rendered in the captured state; a source trace establishes the intended handler; a model test establishes only its tested calculation. These are different kinds of evidence.

## How to use this handoff

1. Read the ownership map and workflows below before reproducing pages.
2. Open a screen in the HTML and follow its **entry**, **purpose**, **data owner**, **actions**, **persistence**, and **migration checks**.
3. Reuse the named fixture records and exact IDs. Do not create a second dummy catalogue or copy a vendor's tariff under Services.
4. Compare the same record, tab, permission, input, and version in the migration. An attractive screenshot does not establish a correct supplier calculation.
5. Read the two complete backup references embedded in the HTML: [full operations](vendor-module-ux-operational-context.md) and [rates, examples and tests](vendor-rate-card-logic-examples-and-test-context.md). The dated observations in this document take precedence where the older references differ.
6. Mark every acceptance check as reproduced, intentionally changed, blocked, or not implemented. Preserve the distinction between an omission in the migration and a defect in the current reference.

## Coverage and limits

The atlas covers reachable page families, the five service creation variants, vendor tabs, focused transport tariff variants, accommodation and activity worksheets, Visa's current legacy screen, read/edit/test/policy/history states, vehicle dialogs, supporting operations, empty/validation states, and workspace utilities reached from Vendor CRM. Different vendor rows can use the same page family. Data-dependent combinations of every possible rate, date, traveller count, and permission are specified as tests, not represented as an infinite screenshot set.

Current captures are dated 4 October. Earlier 2 October captures are in a separate supplementary archive and never override a current observation. The atlas includes screen text and visible control labels/options as machine-readable evidence. Screenshot count and the full inventory are generated below when the guide is built.

**Current verification:** `npm run verify:models` passed **89 tests, 0 failures** on 4 October. This includes legacy and focused transport, activity, and handoff/Finance model tests. It does not prove that every UI entry uses the correct engine. The service-level Test Rate mismatch below is a counterexample.

No supplier records were created, deleted, activated, messaged, booked, or paid to prepare this guide. Forms/dialogs were opened and inspected, then cancelled or left without changing their values. Browser-only preferences or unchanged draft saves are not a production transaction.

## Ownership map — one supply graph, two browsing paths

| Entity | Owns | Must reference | Must not own |
|---|---|---|---|
| Vendor | Supplier identity, roles, contacts, base, coverage, bank/compliance references | Existing service connections, rate cards, operational records | Customer traveller counts or itinerary prices |
| Service | Discoverable offering, location, description, type, media and capability/options | Providers through vendor-service connections | A copied supplier rate card |
| Vendor-service connection | Which vendor provides/distributes which service and the relevant card references | `vendorId`, `serviceId`, `rateCardId` | Independent prices invented from the vendor's name or supplier type |
| Vehicle Offering | Vendor's reusable class/model, seats excluding driver, luggage, AC, attributes and service links | `vendorId`, `serviceIds` | Customer requirements, tariff prices, availability confirmation |
| Activity Option | Service's experience/session/unit capabilities and eligibility | Service option ID | Supplier-specific selling prices |
| Rate Card | One supplier's tariff, template, applicability, validity and contract rules | Existing vendor, service, vehicle/option IDs | Customer-specific travellers, accepted booking arrangement or agency tax |
| Agency markup default | A configurable selling preference stored on outer card metadata | Supplier calculation output at Proposal time | An extra amount payable to the supplier |
| Test Rate | Temporary trip/guest inputs and a traceable calculation | Selected existing tariff and capabilities | Proposal, Booking, confirmation, payment or permanent customer arrangement |
| Proposal | Customer requirement, selected supply, supplier calculation, selling decision and agreed terms | Exact supplier/card/version and calculated snapshot | Silent edits to an accepted commercial agreement |
| Booking | Accepted snapshot, supplier confirmation, actuals and amendments | Accepted Proposal version and requirement identity | A freshly reread mutable tariff used to replace accepted cost |
| Finance | Resulting obligations, invoices, payments, verified receipts and reconciliation | One current confirmed obligation per accepted hire/service | A new payable every time a tariff/test screen is opened |
| Tax configuration | Approved rates, treatment and credit policy | Shared approved profile identifier | Hardcoded transport-specific GST arithmetic inside a rate-card row |

```text
Vendor browsing:
Vendors → vendor → Services or Rate cards → exact vendor-owned card

Service browsing:
Services → service → Vendors (discover providers)
                   → Rate cards (discover their tariffs)
                   → exact card inside its owning vendor

Transport ownership:
Vendor → provided Transport service → reusable Vehicle Offerings
                                   → focused vendor-owned Rate Cards

Customer costing:
Requirement → travellers + luggage → suitable vehicle arrangement
            → eligible supplier + applicable card → supplier calculation
            → supplier tax/payable → agency selling decision + customer tax
            → accepted snapshot → supplier confirmation → Finance obligation
```

### Identity rules that a migration must preserve

- A vendor can provide many services. A service can be available through several suppliers. Do not use `profileVendorId` as proof that no other supplier offers the service.
- Connections are references. They may cover direct suppliers, DMCs or wholesalers, but these labels do not manufacture contractual prices.
- In `ServiceRateCardsPanel.tsx`, references are deduplicated by `vendorId:rateCardId`. Opening a row passes **both** IDs to the exact record route.
- A service Rate cards page gives priority to the tariff identity and names its vendor. A Vendors page gives priority to supplier identity. Their roles are different.
- Selecting a tariff from Services must open that tariff detail, not the vendor's entire Rate cards list and not a service-owned clone.
- Add rate card from a service requires a selected provider when several providers are available. The provider and service prefill the creation context.
- The same IDs must survive searching, filtering, pagination, returning to the vendor, editing, exporting and eventual Proposal use.

## Navigation map and screen roles

| Entry | Reachable surface | Employee's question | What the UI resolves |
|---|---|---|---|
| CRM → Vendors | Vendor directory | Who do we work with? | Supplier search/filter/selection, regions and offered services |
| Directory → Add vendor | Vendor identity/contact/business form | How do I register a supplier? | Required identity, roles, primary contact, location and internal owner |
| Directory → Services | Services directory | What can we source? | Category/location search across suppliers |
| Services → Add service | Provider-first service form | Who provides this offering? | Existing vendor plus type-specific capabilities |
| Vendor → Overview | Operating summary/profile/contacts/recent activity | Who is this supplier and what happened? | Relationship context and contact routes |
| Vendor → Services | This supplier's offerings | Which offerings are provided here? | Service detail, linking and vehicle capabilities where relevant |
| Service → Overview | Capability/media profile | What is the product? | Offering scope, supplier/card count, media and vehicle/options |
| Service → Vendors | Provider directory | Which supplier offers it? | Supplier relationships and relevant card access |
| Service → Rate cards | Tariffs from linked providers | What supplier rates can I inspect? | Search/filter and exact vendor-owned card opening |
| Service/card → Test rate | Calculation inputs and result | What does this scoped requirement cost? | Only if the correct product engine and exact tariff are used |
| Vendor → Rate cards | This vendor's tariff list | Which contract applies? | Service/type/validity filtering and exact tariff opening |
| Card → Rate card | Supplier numerical sheet | How does this supplier charge? | Appropriate matrix and once-only contract rules |
| Card → Policies | Terms/attachments | What conditions apply? | Full working policy text and source attachments |
| Card → Activity / Versions where present | Record history | Who changed the contract? | Events and stored revisions, not another tariff copy |
| Vendor → Packages / Bookings | Supplier use contexts | Where do we use this supplier? | Linked fixture contexts and downstream entry points |
| Vendor → Finance | Summary/banks/payables/statement | What do we owe and how do we pay? | Supplier financial context; no automatic payment from a test |
| Vendor → Docs / Tasks / Communications | Supporting operations | What information/work/contact is pending? | Compliance requests, work assignment, local messages/context |
| Vendor → Activity | Full timeline | What changed and who did it? | Search/selection/detail/actions and outside pagination |
| Top bar/sidebar utilities | Search/notes/notifications/account/settings | How do I work across the workspace? | Shared utilities, not new supplier-owned entities |

Vendor detail has ten tabs: **Overview, Services, Rate cards, Packages, Bookings, Finance, Docs, Tasks, Communications, Activity**. Service detail currently has five: **Overview, Vendors, Rate cards, Test rate, Policies**. Exact legacy/transport cards have Rate card, Test rate, Policies, Activity; focused Activity cards also expose Versions. Do not add a fictitious Versions tab to every family merely to make a diagram uniform.

Vendor/service/card navigation is largely React state under `?module=vendors`; opening the same URL after a reload does not encode the exact previous record. Hub utilities have pathname routes. A migration that introduces deep links must preserve exact owner/context instead of assuming the old UI already provided them.

## Complete employee workflows

### A. Find, create and maintain a vendor

1. Open Vendors. Search business name/reference; use filters for the available supplier classifications, operating location and roles. Selection checkboxes do not mean a supplier is approved or booked.
2. The current table shows checkbox, **Vendor, Regions served, Services offered, Action**. The list omits Status. Region precedes service categories.
3. Open the lead identity or three-dot Open vendor. Edit vendor enters that exact record's form; Delete vendor opens a confirmation with Keep vendor. Documentation does not execute deletion.
4. Add vendor captures name, generated identifier, service roles and labels; primary contact and reachable channels; base address/country; legal/business details, compliance IDs, internal owner and context.
5. Same-as-phone WhatsApp behavior and country dial code matter operationally. A base city is not automatically every region the supplier serves.
6. Duplicate warnings and disabled/incomplete Create draft vendor must remain visible. A button that is disabled on an empty form is an expected state, not a broken submit.
7. The current vendor array is React session state. Reload does not prove durable supplier CRUD. Preserve this as a documented prototype limit, or implement persistence explicitly in the migration's scope.
8. Overview shows a compact operating summary, a balanced six-field Profile and contact identities/roles. Status remains in the record header, not the removed Profile Status/Last updated cells.
9. Contact Call/Email/WhatsApp actions hand off to the respective channel. Opening a channel is not proof that a message was delivered.

### B. Discover/create/edit a service

1. From Vendors switch to Services. Filter All services, Accommodation, Transport, Activities, Visa or Flights; search and location/coverage filters narrow existing records.
2. Add service begins with **Vendor / Provided by**. The searchable picker shows actual vendor identity and supporting reference/location text. It is mandatory.
3. Choose type and enter service name, generated ID and base/operating location. A new service belongs to a provider but may later have other provider connections.
4. Accommodation details: property type, room types, check-in/out. Transport's current initial form has descriptive vehicle type, passenger capacity, route/coverage and luggage fields. These free-text fields are not a substitute for reusable Vehicle Offerings used by the engine.
5. Activities details: duration, group size, ages and meeting point, plus reusable experience options. Visa: category, validity, processing scope and documents. Flights: route, airline, cabin and baggage; a discoverable Flight service does not make the disabled Flight tariff engine available.
6. Submit validates provider/identity/type requirements. Cancel returns without a new offering. Created services and deletion markers use browser storage.
7. Open Overview for capability/media information. Edit service and Edit details lead to the appropriate existing form. Media editing handles title/banner/files locally; an uploaded image is not supplier confirmation.
8. Providers and tariffs are separate peer tabs. A supplier/card count in Overview is only a count; the complete navigable records must be available in Vendors and Rate cards.

### C. Follow the two paths to the same tariff

**Vendor path:** Trailmakers Experiences → Rate cards → Kochi fixed-transfer tariff.

**Service path:** Services → Kochi fixed transfers → Rate cards → Trailmakers Experiences' Kochi fixed-transfer tariff.

Expected in both: same underlying `rc-trail-fixed`, same owner, rates, draft/lifecycle, markup, policies and edits. A change through one path must be read through the other. Do not create a second independent worksheet.

For services with multiple providers: Munnar Ridge Trek → Vendors shows Trailmakers, Summit and Spice Route. Rate cards lists their separate supplier contracts. Each card row opens its own vendor/card, not a supplier list or the first available card.

For Transport, the Vendors table can show a count of a vendor's cards and filter the Rate cards tab to that vendor. The tariff rows themselves must then open the exact card. A count link and a card identity link have different destinations.

### D. Create and edit a rate card

1. Vendor → New rate card or Service → Rate cards → select provider → Add rate card.
2. The template picker preserves vendor and service context. Transport offers **Fixed transfer, Local package, Outstation per km, Daily hire**, each as a separate card. Activity needs an activity service with defined options. Accommodation and Visa retain their current templates; Flight/Trip/Cruise are disabled coming-soon entries.
3. In the current modal, service matching/requirement is strongest for Transport and Activities. Do not assume the accommodation/visa creation link is fully equivalent: inspect `needsService` and the resulting outer `serviceId` before treating a created card as discoverable from Services.
4. Create draft stores a new draft immediately in the local card stores. It is a real mutation, not just opening a blank mockup. No new drafts were created for this documentation; existing edit screens demonstrate the fields.
5. Edit the selected sheet's rates, relevant rules, charge treatment, validity and tax selection. Transport edits use one method; do not put all four methods into every card.
6. Save/update behavior differs between the legacy and focused families. Activity has validation, versions and approval controls; Transport has tariff validation. A successful visible edit is not proof of a server-side approval workflow.
7. Draft / Review / Active is the focused transport contract lifecycle. Legacy lists may display Published/Expired. Date validity is a separate eligibility condition from the label.
8. Test Rate can show illustrative Draft calculations with blockers. Active reuse requires supplier confirmation and complete applicable terms. Do not activate fixtures or invent tax profiles to make demonstrations appear production ready.
9. Policies and history remain attached to the same record. Download/export must include the actual selected record; a generic example download is not acceptable evidence of that contract.

### E. Maintain reusable vehicles

1. Vendor → Services → Transport service → Overview → Vehicle offerings.
2. Add vehicle opens a dialog; Edit opens the selected reusable record. Vendor is fixed by context. Service links are drawn from that vendor's Transport offerings.
3. Enter distinct name/category, relevant class/model, customer passenger seats **excluding driver**, medium/large/cabin luggage allowances, combined bag allowance, AC and attributes.
4. Blank capacity is unknown, not zero. A positive integer passenger capacity is required. Luggage values must be non-negative; combined allowance permits half units. Name duplicates for that vendor are rejected.
5. The current service link must remain selected. Save updates `paryatech:vehicle-offerings:v1`; Cancel/Escape leaves the existing record unchanged. Storage failure shows a dialog error.
6. Rate-card vehicle selection references these IDs. Adding a vehicle does not create a route price for it and does not reserve a physical vehicle.
7. Vehicle category is separate from service requirement and pricing method. A bus/coach is a vehicle, outstation is a service use, and per kilometre is a tariff method.

### F. Test private transport safely

1. Prefer an **exact vendor-owned card → Test rate** until the service-level selector gaps below are resolved.
2. Enter requirement-specific dates/times, route or operating area, customers plus staff seats, luggage by size, AC requirement and usage. Pickup/drop options for a Fixed Transfer come from that supplier's defined routes; reverse direction is not automatically eligible.
3. Select a suitable arrangement: quantities of the referenced offerings, including mixed vehicles. The same group's fare is calculated once for the selected arrangement, never as travellers × vehicle price.
4. Capacity checks include children and guides for seats and both size-specific and combined luggage constraints. A seat-valid arrangement can still fail baggage limits. Suggestions need staff selection; do not automatically select the cheapest regardless of suitability.
5. Resolve exactly the applicable tariff. Private Fixed Transfer stays a transfer even for an intercity route; don't silently switch to Per Km.
6. Apply base tariff, excess, driver allowance and applicable scoped charges. Missing required treatments or unknown amounts remain unresolved. Included charges are not added again; customer-direct actuals must not silently become agency supplier payable.
7. Apply an approved supplier tax profile separately. A valid mathematical commercial amount does not necessarily mean a final fixed payable can be offered.
8. Explain base, minimum/allowance, excess, known extras, tax, actuals and blockers separately. Test Rate creates no Proposal, Booking, payment, availability hold or confirmation.
9. Split arrivals are separate requirements; a continuous multi-day hire is one requirement referenced on multiple itinerary days. A single test of one card is not a full itinerary orchestration screen.

### G. Accommodation — the approved worksheet experience

Reference: **Example Hospitality → Accommodation tariff · 2026–27**, `rc-acc-2627`. The vendor list links it to Taj Exotica Resort & Spa / Example Lake Resort. Use the actual owning supplier shown by the exact record; do not assign it to Trailmakers because another vendor appears elsewhere in a screenshot.

- The matrix is room/product × meal plan × price set/season. Night-specific validity, occupancy, extra guest bands, supplements and restrictions resolve an accommodation quote.
- Edit mode changes numerical cells, room capabilities and guest rules. Add/edit season changes applicability, not a transport package.
- Each stay night selects an applicable price. Weekends, special dates, minimum stay, blackout and occupancy conflicts must not silently price as a generic average night.
- Children use age/bed bands. One guest must not stack a child charge and an extra-adult charge accidentally. Rooms and included occupancy are explicit.
- Exact card Test Rate reads `runQuote` and displays per-night trace/blockers. The Service-level comparison currently uses unrelated synthetic prices; that difference must be documented and corrected in any operational migration.
- Policies are contractual, Activity is historical, bottom Markup is the agency's selling default. Do not copy lodging seasons, rooms or nights into Activity/Transport/Visa pricing.

### H. Activities — experience, people/group/unit pricing

- A service owns reusable experience options. A supplier card references them and offers applicable per-person, private group/booking, or per-unit fares.
- Adults/children/infants can have age eligibility and different payment treatment. Complimentary guests still count toward capacity and participant eligibility where applicable.
- Unit examples: kayak type × duration/quantity, jeep session × capacity, private cruise group band. Do not multiply a private-group fare by every participant.
- Extras, inclusions, date adjustments, taxes, actuals and validation are scoped to the selected experience/tariff. Optional extras need explicit selection; unknown mandatory extras block a fixed total.
- Exact Activity card Test Rate is the proper reference. Read/edit/policies/versions/activity plus bottom Markup are captured separately.
- **Current service-level Activity Test Rate is wrong:** it renders accommodation fields. Preserve the correct card-level engine and record identity; do not reproduce the wrong calculator because it is visible in the old service page.

### I. Visa, Flights and other service boundaries

- Atlas Visa Services has a Visa tariff and a discoverable UAE service. Current exact Visa card still uses lodging-shaped seasons, product/fee columns and a stay test. Its displayed list reference and detail reference also differ. This is a reference defect, not proof of a complete Visa engine.
- Operational Visa tariffs should resolve destination/nationality/apply-from/category/applicant/processing/fee components, not rooms × nights. Government fee, processing partner fee and optional express charges have different responsibilities. The guide records the current screen and the required boundary without inventing a working migration.
- Flights service creation exists; Flight/Trip/Cruise tariff creation is currently disabled. A selectable offering is different from a working fare engine or external reservation.
- Supplier type/role is not a hidden pricing formula. Unconfirmed partner tariffs should remain pending instead of copying another supplier's amounts.

### J. Supporting operations throughout the vendor module

| Area | Operational purpose and flow | Boundary to preserve |
|---|---|---|
| Packages | Vendor → Packages → linked package detail; inspect use, itinerary/service references and owner | Package customer selling decisions are not supplier tariff edits |
| Bookings | Vendor → Bookings → search/filter/actions → View booking dialog and downstream context | Viewing fixture booking details does not create confirmation or an obligation |
| Finance | Four summary cells, bank accounts, payables and statement of account | Summary is a read context; no auto tax/payable from Test Rate |
| Bank details | Edit preferred account or add another; holder/type/number/IFSC/branch/copy controls | Local bank storage is not verified bank ownership or a payment instruction sent externally |
| Docs | Document list/status/context/actions and Request document dialog | Draft request is not proof of supplier delivery or uploaded authenticity |
| Tasks | Active/completed views, search/filter, create/assign/due/status/actions | Work assignment is not a supplier confirmation and is not durable server scheduling |
| Communications | Conversation list/detail, compose and templates | Current local message state must not be labelled a delivered email/WhatsApp integration |
| Activity | Search, select, details, remove confirmation, related-record navigation and pagination | A detail must add meaningful change context; missing detail remains explicit, never fabricated |
| Notes | Root shared notes drawer: browse/search/pinned/mine, compose/related label/pin/save | Browser-local workspace notes are distinct from card version history |
| Universal search | Top bar / Ctrl K → pages and existing record destinations | Search result must retain exact owner and record identity |
| Notifications | Bell panel, all notifications and preferences | Separate workspace notification state; not the supplier audit trail |
| Account | Personal profile/security/devices/preferences/membership sections | These share one scrollable Account page; not five separate vendor business flows |
| Settings | Organization/team/brand plus coming-later destinations | Workspace defaults and permissions must not masquerade as working supplier tax/admin backends |

Activity table structure matters because it communicates separate data roles: checkbox selection, connected event icon rail, date/time, event/context, actor with role, and row actions. Column dividers must align to the actual columns and not cut through the checkbox or icon rail. The line connects events; it is not the checkbox-column border. Pagination sits outside the stroked data table within the module shell. These are acceptance observations about the existing approved interaction, not a new visual redesign.

## Real fixture catalogue — reuse these records

The exact numerical and ID catalogue is embedded in the HTML under **Detailed rate logic, examples and tests**. The following orientation map is enough to find the screens without inventing records.

| Supplier | Offering | Exact focused tariff | Purpose |
|---|---|---|---|
| CityRide Transfers | Kochi fixed transfers (`cityride-fixed`) | `rc-city-fixed` — Kochi airport and intercity transfers | Fixed Transfer |
| Kochi Local Cabs | Kochi local duty (`kochi-local-duty`) | `rc-local-duty` — Kochi local duty packages | Local Package |
| Kerala Road Trips | Kerala outstation transport (`kerala-road-hire`) | `rc-road-trips` — Kerala outstation kilometre tariff | Outstation Per Km |
| South Coast Coaches | Van and coach daily hire (`south-coast-daily`) | `rc-south-coast` — South India coach day hire | Daily Hire |
| Trailmakers Experiences | Kochi fixed transfers | `rc-trail-fixed` | Fixed Transfer |
| Trailmakers Experiences | Kochi local sightseeing | `rc-trail-local` | Local Package |
| Trailmakers Experiences | Kerala outstation transport | `rc-trail-km` | Outstation Per Km |
| Trailmakers Experiences | Kerala daily vehicle hire | `rc-trail-daily` | Daily Hire |
| Example Hospitality | Accommodation supplier links | `rc-acc-2627` | Approved accommodation worksheet reference |
| Trailmakers / Summit / Spice Route | Munnar Ridge Trek | `rc-act-trek-trail`, `rc-act-trek-summit`, `rc-act-trek-spice` | Supplier-specific person/group alternatives |
| Trailmakers / Spice Route | Backwater Kayak | `rc-act-kayak-trail`, `rc-act-kayak-spice` | Person/unit/hour/group variants |
| Example Hospitality / Spice Route | Cardamom Plantation Tour | See full catalogue | Age-band/person/private group |
| Coastal / Spice Route / Summit / Heritage suppliers | Cruise / cooking / safari / admission | See full catalogue | Group band/unit/person eligibility |
| Atlas Visa Services | UAE Tourist Visa | `rc-visa-uae` record; legacy detail labels differ | Current Visa reference and identified limitations |

All focused transport/activity seed tariffs are illustrative Drafts with unconfirmed contract/tax context. They are not live market rates or evidence of actual vehicle availability. The number of providers for a service and cards for a vendor is data-driven.

## Numerical logic and acceptance examples

### Fixed Transfer

```text
Route                              Sedan   MUV     Van     Coach
Kochi Airport → Kochi Hotel         1,500   2,000   3,500    7,000
Kochi Airport → Munnar              4,500   5,500   8,500   14,000
Munnar → Thekkady                   3,500   4,500   7,000   12,000

One MUV Airport → Munnar: 5,500
Night supplement, if applicable: 500 per vehicle
Known commercial subtotal: 6,000 before unresolved actuals/tax context
Two MUVs on that route at night: 2 × 5,500 + 2 × 500 = 12,000
```

Rates are fixture values. Distance does not multiply the fixed fare. The required vehicle arrangement must pass seats and luggage. The couple with two large plus two cabin bags cannot be declared Sedan-suitable from a three-seat label alone.

### Local Package

```text
Selected MUV package 8 hr / 80 km:              4,200
Usage 9 hours / 95 km
Extra km: (95 − 80) × 25 =                       375
Extra hour: (9 − 8) × 400 =                      400
Known commercial amount:                       4,975
```

Both overages apply only where the supplier's rule allows both. At 7 hours / 65 km the same package charges 4,200, with no negative overage or unused-allowance credit. Jaipur/Bengaluru require an eligible local provider; a Kochi tariff does not become eligible by changing the city text.

### Outstation Per Km

```text
10 customers + 1 manager → 11 seats, luggage still checked
Van: ₹22/km, minimum 250 km/day, driver ₹500/day
5 days, 850 planned chargeable km
Pooled minimum: 5 × 250 = 1,250 km
Billable km: max(850, 1,250) = 1,250
Vehicle: 1,250 × 22 = 27,500
Driver: 5 × 500 = 2,500
Known commercial amount: 30,000 plus applicable actuals
```

Separate daily minimums require per-day distance; do not apply pooled arithmetic to that contract. For 4 days / 1,350 km / ₹25 per km / ₹600 driver per day: max(1,350, 1,000) × 25 + 4 × 600 = **₹36,150**. One continuous hire is not five independently charged copies.

### Daily Hire

```text
Van: ₹10,000/day, 200 km/day, 10 hours/day
Extra km ₹30, extra hour ₹500; no carry-forward
Day 1: 140 km / 9 hours → no excess
Day 2: 180 km / 12 hours → 2 excess hours
2 × 10,000 + 2 × 500 = 21,000 plus applicable actuals
```

Do not pool Day 1's unused hour into Day 2 when the contract says no carry-forward. Daily hire is a separate tariff, even when the same supplier also offers Per Km.

### Mixed vehicles, requirements and actuals

- An 18-person group can compare Van + MUV with a Coach only if baggage limits also pass. Each selected vehicle references its own tariff row; night/driver/vehicle-scoped charges scale with the applicable quantity. Staff chooses the arrangement.
- Five passengers at 10:00 and three at 18:30 are two transfers, not one eight-passenger allocation. Both can reference the same card without tariff duplication.
- A seven-day itinerary may contain fixed transfers, local package and continuous daily/per-km hire. Each requirement is priced independently; the customer total is the sum of selected selling components.
- A missing permit rule is not ₹0. Actual toll/parking stays outside a falsely fixed all-inclusive promise until verified amounts arrive.
- Inclusive price ₹5,250 remains supplier payable ₹5,250 for the known inclusive component. With an approved illustrative 5% profile, net/tax decomposition is ₹5,000 + ₹250. Exclusive ₹5,000 uses the approved profile to add tax; without an approved profile the payable is pending. This example does not prescribe a legal rate.
- Accepted 750 km becoming actual 900 km produces a 150 km delta, not a second charge for all 900 km. Customer price follows the agreed customer terms, not automatically the supplier delta.

The complete 18 transport personas and activity/accommodation tests are included in the HTML backup. Apply them through both browsing paths and through the exact card engine, with explicit input, fixture, calculation, status and reason. Do not translate 89 passing unit/model tests into a claim that every persona's complete UI/Booking/Finance journey was browser-tested.

## Tax, markup, validation and commercial responsibility

Tax applies to the relevant price basis; it is not a decorative record label. A tariff stores **supplier tax mode** and an approved shared profile reference. The shared/profile resolver determines tax and supplier credit treatment. A missing approved profile cannot silently turn Exclusive into zero tax. Inclusive must not add GST a second time.

The current `supplierTax.ts` is a browser-local approved-profile registry/resolver, not a demonstrated production Tax/Finance administration backend. Approval source and recoverable/non-recoverable context are required for meaningful reuse. A migration should preserve the interface and unresolved state, and not invent a transport-specific tax percentage.

Validation checks operational readiness: supplier confirmation, date applicability, required prices, capacity references, rules, scoped charge treatments and tax context. Remove unnecessary repeated explanatory UI, but do not remove the business gate that prevents a misleading fixed payable.

Agency markup remains in the approved bottom section for accommodation, transport and activities. It is outer metadata/default for a future selling decision, separate from supplier tariff arithmetic. Owner-only editing clamps 0–100%, rounded to one decimal. Apply once in Proposal or honor a selling override; do not apply it again to supplier payable or duplicate it at itinerary level.

Current paid-by/collector fields describe commercial responsibility for actuals; they can matter to supplier obligation even when they are hidden from the main tariff sheet. Simplifying visible columns must not cause parking paid directly by a customer to be included as agency cash payable to the supplier.

## Persistence and handoff map

| Data/state | Current mechanism | What the next agent must know |
|---|---|---|
| Vendors CRUD | App React state seeded from fixtures | Session-only; not a durable supplier database |
| Created/deleted services | `paryatech-vendor-directory-services` and `paryatech-vendor-directory-deleted-service-ids:v1` | Browser-local overrides; deleted IDs are separate from source seeds |
| Added provider connections | Linked-service storage in `vendorDirectory.ts` | Reference links; no independent tariff prices |
| Vehicle offerings | `paryatech:vehicle-offerings:v1` | Browser-local reusable records; blank baggage is unresolved |
| Focused transport cards | `paryatech:transport-rate:v3:<id>` and creation index | Reopening should resolve same ID; generic legacy transport uses v2 |
| Activity cards | Activity card store/creation index in `cards.ts` | Versions/snapshots and owner remain attached |
| Other created supplier cards | `paryatech:supplier-rate-cards:v1` | Creation link must include valid vendor/service context |
| Supplier tax profiles | `paryatech:supplier-tax-profiles:v1` | Approved local profiles, not legal assumptions |
| Bank accounts | Vendor-name-scoped browser storage in VendorFinancePanel | Local accounts; changing supplier name is a keying risk to assess |
| Root vendor notes | `paryatech-workspace-notes:vendors` | Shared notes drawer persists; local NotesPanel fallback is different |
| Tasks/comms/settings local edits | Component state where implemented | No server/workspace delivery or durability established |
| Proposal/Booking transport handoff | Root snapshot and amendment helpers/panels | Preserve requirement and accepted-version identity |
| Finance transport obligations | Confirmed accepted/amended supplier outcomes via root fixture helpers | Supersede prior current obligation once; pending actuals/confirmation are not fixed payables |

Source stores and adapters may be updated after this baseline. Inspect them before changing persistence, and do not clear a user's browser storage to make a screenshot match.

### Accepted values and downstream responsibility

1. Draft Proposal selects the exact card and arrangements. Requirement changes invalidate suitability/price and show a review; retain previous calculation context.
2. Acceptance snapshots the relevant card version, supplier, vehicle arrangement, commercial terms, tax result, known/actual cost basis and customer selling agreement.
3. Booking consumes that accepted snapshot. Later tariff edits do not silently rewrite it. Availability/confirmation is a separate supplier process.
4. Verified actual usage creates an amendment/delta and updates the current supplier outcome under the same hire identity.
5. Finance receives the confirmed current obligation once. A revised hire supersedes/revises it, rather than duplicating the original. Customer receivable follows agreed selling/amendment terms.
6. The root handoff models/panels exist and have tested invariants; the vendor's legacy Packages/Bookings/Finance tables are also illustrative contexts. Do not assume every displayed fixture row is automatically backed by those snapshots.

## Confirmed gaps and migration risk ledger

### G1 — live deployment is older than local main

Observed live path: `https://pakages-module.vercel.app/?module=vendors` → South Coast Coaches → Services → Van and coach daily hire. Live tabs: Overview, Vendors, Test rate, Policies. Current local tabs also include **Rate cards**. The guide embeds both screens.

At the prior deployment check, the GitHub status for the current main commit reported **Deployment was blocked**; an earlier status named Git-author access to the Vercel project. This is deployment provenance evidence, not proof that the current source omitted Rate cards. A new deployment must be verified separately; this documentation does not deploy or fix Vercel access.

### G2 — Activity service Test Rate invokes the wrong product calculator

Current reproduced route: Services → Activities → Munnar Ridge Trek → Test rate. It renders CHECK-IN, NIGHTS, ROOM TYPE, MEAL PLAN and synthetic stay amounts for Trailmakers/Summit/Spice Route. The exact Activity card Test Rate renders the proper experience/person/group/unit inputs.

Source: `ServicesPanel.tsx` falls back to `ServiceTestRate` for non-transport cards. `ServiceTestRate.tsx` contains fixed room and meal arrays, supplier-type adjustments and `stableRateOffset`. These are not the selected activity tariff's prices.

**Operational effect:** correct record links can coexist with the wrong costing engine. Migration must resolve product family + exact supplier card and call its engine, rather than render the old fallback as approved pricing.

### G3 — service-level accommodation comparison is synthetic

ServiceTestRate uses fixed ROOM_TYPES/MEAL_PLANS and a vendor/connection offset. It does not evaluate each supplier's accommodation contract via `runQuote`. Exact card Test Rate does.

**Operational effect:** rates can look reasonable while being unrelated to contracts, validity, missing rows or supplier-specific restrictions. Compare exact tariff outputs or label unavailable pricing; no invented vendor adjustments.

### G4 — Transport service Test Rate silently uses the first connection

Source: `ServicesPanel.tsx` checks `getDetailCard(testPriceConnections[0]?.rateCardId)?.privateTransport` and renders that card. There is no demonstrated complete provider/card comparison at this service entry.

**Operational effect:** a staff member may think they tested their preferred supplier while the first supplier/card was used. Exact card Test Rate remains the safe reference. Provide explicit applicable card selection when migrating this service flow.

### G5 — Visa retains accommodation-shaped calculations and inconsistent reference labels

Atlas's directory shows a Visa tariff/reference; the opened detail shows different legacy title/reference and lodging-shaped inputs. Its Test Rate asks for nights, room/product, fee component and extra-bed children, then may block on one-person occupancy.

**Operational effect:** a visibly available tariff is not a working per-applicant Visa quote. Fix product engine and identity mapping intentionally; do not infer readiness from the Published badge.

### G6 — import UI is a placeholder

`AnchoredImport.tsx` accepts a selected file, then closes and clears it. It has no file parser or record-write callback. Sample-template controls do not establish import processing.

**Operational effect:** the migration must not promise that supplier data has been imported. Preserve/label the boundary, or implement import under a separate approved scope.

### G7 — required offering/tariff link is uneven in creation

The template modal requires/selects service for focused Transport and Activity. Legacy Accommodation/Visa do not have the same `needsService` requirement when launched from a vendor. Inspect the resulting `serviceId` and discovery graph.

**Operational effect:** a new supplier card may appear in one list without the intended service connection. Preserve or explicitly resolve this link; no separate service-owned copy as a shortcut.

### G8 — local state and prototype approval are not production integration

Vendor CRUD, local tasks/communications, tax registry and fixture supporting tables have different persistence/integration levels. A confirmation-looking UI must not be interpreted as delivered communication, reserved vehicle or posted Finance transaction.

**Operational effect:** migration completion needs observed behavior/state and source evidence, not screenshots alone. Record remaining boundaries instead of marking the entire platform safe to quote/book.

## Smallest migration acceptance checklist

### Ownership and discovery

- [ ] Vendor owns every tariff; service links reference exact same IDs.
- [ ] Provider-first service creation works with the current searchable picker and helper text.
- [ ] A service shows Vendors **and Rate cards**, and exact card clicks open its own supplier detail.
- [ ] Vendor/service filters retain identity and empty/no-match states.
- [ ] Multiple suppliers do not share invented contractual prices or a cloned tariff record.
- [ ] Each newly created card has the intended service/provider connection.

### Numerical sheets and costing

- [ ] Accommodation experience remains the UI reference; product formulas stay separate.
- [ ] Four focused Transport templates; no mega-card and no per-seat/self-drive products.
- [ ] Vehicle capacities remain reusable offering data; correct sized luggage/guide/child/AC checks.
- [ ] Fixed routes are directional; quantities/mixed vehicles apply their own tariffs.
- [ ] Local base package and excess are separate; daily carry/minimum method are explicit.
- [ ] Required unknowns/actuals never silently become zero or a fixed all-inclusive quote.
- [ ] Tax profile/mode resolves once; supplier tax and customer tax stay separate.
- [ ] Bottom agency Markup appears for accommodation, focused transport and activities; supplier payable stays unchanged by it.
- [ ] Service Test Rate resolves the selected product/vendor/card engine; no synthetic stay fallback for Activities/Visa and no hidden first-card selection.

### Lifecycle and operations

- [ ] Validity and lifecycle are both evaluated, including expired Published records.
- [ ] Save/cancel/draft creation/activation have documented persistence and readiness gates.
- [ ] Source/policy/versions/activity are attached to the exact record; details add real context.
- [ ] Accepted Proposal snapshots are immutable; changes require reviewed revisions.
- [ ] Booking actuals calculate only deltas and preserve supplier confirmation separately.
- [ ] Finance receives one confirmed current obligation, without duplicated hire charges.
- [ ] Imports/messages/payments are called working only when their actual handlers/integrations exist.

### Screen completeness

- [ ] Main directory and all vendor tabs preserved, not only rate-card pages.
- [ ] All five service form variants and vehicle add/edit/errors included.
- [ ] Read/edit/test/policies/history and relevant versions captured for each supported family.
- [ ] Meaningful empty, disabled, missing input, Actual and invalid date states represented.
- [ ] Data table dividers, icon rail and outside pagination remain consistent with approved structure.
- [ ] The correct deployed commit/assets are checked before comparing localhost with Vercel.

## Source map

| Concern | Inspect |
|---|---|
| Root embedding/module selection/notes | `src/App.tsx`, `src/VendorModule.tsx`, `src/WorkspaceNotes.tsx` |
| Vendor CRM routing/state/owner callbacks | `src/modules/vendors/App.tsx`, `routing.ts`, `permissions.ts` |
| Directory CRUD | `components/VendorsListPage.tsx`, `NewVendorPage.tsx`, `VendorFormModal.tsx` |
| Services/provider creation/discovery | `components/NewServicePage.tsx`, `ServicesPanel.tsx`, `ServiceRateCardsPanel.tsx`, `ServiceRateCardTable.tsx` |
| Connection graph | `data/vendorDirectory.ts`, `data/serviceRateCards.ts` |
| Vehicle CRUD | `components/VehicleOfferingsPanel.tsx`, `data/vehicleOfferings.ts` |
| Tariff creation/identity/persistence | `components/CreateRateCardModal.tsx`, `rateCard/cards.ts`, `rateCard/types.ts` |
| Approved card page/read-edit/test/markup | `components/rateCard/RateCardDetailPage.tsx` |
| Accommodation quoting | `rateCard/engine.ts` and related accommodation rules; exact `runQuote` call |
| Focused private transport engine/UI | `rateCard/privateTransport.ts`, `components/PrivateTransportWorkspace.tsx` |
| Historical transport only | `rateCard/transportQuote.ts`, `regionalTransportQuote.ts`, related legacy workspaces |
| Activity engine/UI/options | `rateCard/activityPricing.ts`, `components/ActivityRateWorkspace.tsx` |
| Synthetic service test limitation | `components/ServiceTestRate.tsx`, its branches in `ServicesPanel.tsx` |
| Supplier profile resolver | `rateCard/supplierTax.ts` |
| Fixtures | `data/privateTransportFixtures.ts`, `activityRateFixtures.ts`, `supplierRateFixtures.ts` |
| Policies/history | `components/rateCard/PoliciesPanel.tsx`, `ActivityPanel.tsx`, `RecentActivityTimeline.tsx` |
| Supporting vendor tabs | `VendorFinancePanel`, `VendorDocsPanel`, `TasksPanel`, `CommunicationPanel`, `PackagesPanel`, `VendorBookingsPanel` |
| Shared utilities | `UniversalSearch`, notes adapter, notifications, `pages/account`, `pages/settings` |
| Accepted transport/Finance handoff | `src/bookingTransportHandoff.ts`, `TransportBookingHandoffPanel.tsx`, `proposalModel.ts`, finance fixture helpers |
| Full worked rates/personas | `vendor-rate-card-logic-examples-and-test-context.md` |

Paths above are relative to `src/modules/vendors/` unless prefixed with `src/`. The generated atlas adds screen-by-screen source/persistence hints and control inventories; source remains authoritative when a handler changes.

## Agent handoff instruction

Reproduce the complete supplier workflow, not a set of disconnected screenshots. Use the exact existing owner/service/card graph. Preserve the approved page shell and interactions. A service capability is not a supplier tariff; a rate is not availability; a test is not a Booking; a local message is not a delivered channel; an accepted cost is not a mutable draft; a supplier payable is not an agency selling price.

Compare all screens with their entry/purpose/owner/action/persistence context. Call out the eight confirmed reference gaps separately. Reuse the embedded numerical fixtures and persona tests rather than rebuilding generic dummy supply. For every change, show the exact affected screen and resulting commercial/operational behavior.

<!-- SCREEN_INVENTORY:START -->

## Captured screen inventory

142 current local states, 1 deployed comparison, 51 earlier supporting captures; 194 total images.

| Screen | Entry / flow | Responsibility |
|---|---|---|
| [Vendor directory](vendor-crm-migration-reference.html#screen-directory) | Sidebar → Vendors | Supplier-first discovery: suppliers, regions and service roles. |
| [Vendor directory filters](vendor-crm-migration-reference.html#screen-directory-filters) | Vendor directory → Filters | Narrow businesses by role and relationship; this does not change supplier records. |
| [Add vendor — identity](vendor-crm-migration-reference.html#screen-vendor-new) | Vendor directory → Add vendor | Create business identity and contact information before services and pricing. |
| [Add vendor — location and business](vendor-crm-migration-reference.html#screen-vendor-new-business) | Add vendor → scroll below contacts | Set operating location, legal fields, categories and internal owner. |
| [Add vendor — incomplete form](vendor-crm-migration-reference.html#screen-vendor-new-validation) | Add vendor → incomplete required fields | The create action is disabled until required supplier identity fields are supplied. |
| [Services directory](vendor-crm-migration-reference.html#screen-services-directory) | Vendor CRM → Services | Browse offerings across suppliers; this is an alternate discovery path to the same vendor-owned contracts. |
| [Add service — accommodation](vendor-crm-migration-reference.html#screen-service-new-accommodation) | Services → Add service | Select a providing vendor, service identity and property capability. |
| [Add service — transport](vendor-crm-migration-reference.html#screen-service-new-transport) | Add service → Transport | Define transport scope, operating area and delivery capability separately from supplier price. |
| [Add service — activities](vendor-crm-migration-reference.html#screen-service-new-activities) | Add service → Activities | Define experience, delivery and option-level participation constraints. |
| [Add service — activity options](vendor-crm-migration-reference.html#screen-service-new-activity-options) | Add service → Activities → scroll to options | Create option/session structure before supplier-specific pricing. |
| [Add service — visa](vendor-crm-migration-reference.html#screen-service-new-visa) | Add service → Visa | Define visa destination, category, turnaround and document requirements. |
| [Add service — flights](vendor-crm-migration-reference.html#screen-service-new-flights) | Add service → Flights | Describe flight capability; the rate-card creation template remains a separate support boundary. |
| [Transport service overview](vendor-crm-migration-reference.html#screen-transport-service-overview) | Services directory → Kochi fixed transfers | The offering's identity and capability are common discovery context; prices remain supplier-owned. |
| [Transport service — Vendors](vendor-crm-migration-reference.html#screen-transport-service-vendors) | Kochi fixed transfers → Vendors | Show businesses that supply this particular service, not every transport vendor. |
| [Transport service — Rate Cards](vendor-crm-migration-reference.html#screen-transport-service-rate-cards) | Kochi fixed transfers → Rate cards | Card-first list: card, owning vendor, served regions and action; click opens exact tariff. |
| [Create rate card from service](vendor-crm-migration-reference.html#screen-service-create-card) | Service → Rate cards → Add rate card | Choose a focused template for the selected service and vendor. |
| [Transport service — Test Rate](vendor-crm-migration-reference.html#screen-transport-service-test) | Kochi fixed transfers → Test rate | Tests the first matched transport card in the current service path; it does not expose complete vendor/card comparison. |
| [Transport service — Policies](vendor-crm-migration-reference.html#screen-transport-service-policies) | Kochi fixed transfers → Policies | Service-level guidance differs from supplier-specific contract policy rows. |
| [Reusable vehicle offerings](vendor-crm-migration-reference.html#screen-transport-vehicle-offerings) | Transport service → Overview → Vehicle offerings | Vendor-owned passenger, luggage and AC capability reused by that vendor's linked service tariffs. |
| [Add vehicle](vendor-crm-migration-reference.html#screen-vehicle-new) | Transport service → Vehicle offerings → Add vehicle | Set category/model, confirmed seats, separate bag allowances, combined allowance and AC. |
| [Add vehicle — required-field errors](vendor-crm-migration-reference.html#screen-vehicle-validation) | Vehicle form → Add vehicle before required fields | Shows validation for name, category, seats and service link. |
| [Edit reusable vehicle](vendor-crm-migration-reference.html#screen-vehicle-edit) | Vehicle offerings → Edit Sedan | Update the vendor's existing offering without copying it into every tariff. |
| [Fixed Transfer — read tariff](vendor-crm-migration-reference.html#screen-fixed-card) | Service → Rate cards → Kochi airport and intercity transfers | Opened exact CityRide card rc-city-fixed from the service discovery path. |
| [Fixed Transfer — charges, tax and markup](vendor-crm-migration-reference.html#screen-fixed-card-charges-markup) | Fixed-transfer card → scroll to bottom | Charge treatment, tax reference and bottom agency markup have separate responsibilities. |
| [Fixed Transfer — edit](vendor-crm-migration-reference.html#screen-fixed-card-edit) | Exact rate card → Edit rate card | Edit route rows and per-vehicle prices referencing existing offerings. |
| [Fixed Transfer — edit charge scopes and tax](vendor-crm-migration-reference.html#screen-fixed-card-edit-charges) | Edit tariff → charges and supplier tax | Manage Included/Fixed/Actual/Not applicable by route and trigger, with shared tax profile reference. |
| [Fixed Transfer — Test Rate](vendor-crm-migration-reference.html#screen-fixed-test) | Exact CityRide card → Test rate | Trip-specific route, places, dates, time, travellers, bag sizes, AC and arrangement. |
| [Fixed Transfer — arrangement and result](vendor-crm-migration-reference.html#screen-fixed-test-arrangement) | Test Rate → arrangement and supplier calculation | Capacity suggestions and individual vehicle cost lines retain the group total. |
| [Transport card — Policies](vendor-crm-migration-reference.html#screen-fixed-policies) | Exact transport rate card → Policies | Conditions of this supplier's contract, not generic service marketing copy. |
| [Transport card — Activity](vendor-crm-migration-reference.html#screen-fixed-activity) | Exact transport rate card → Activity | Changes/history within the tariff context; separate from Activity as a supplied service category. |
| [Kochi Local Cabs overview](vendor-crm-migration-reference.html#screen-local-vendor) | Vendors → Kochi Local Cabs | Business identity and Transport role; template describes the pricing method. |
| [Local supplier — rate cards](vendor-crm-migration-reference.html#screen-local-rate-list) | Kochi Local Cabs → Rate cards | One focused Local Package contract linked to its supplier service. |
| [Local Package — tariff sheet](vendor-crm-migration-reference.html#screen-local-card) | Kochi Local Cabs → Rate cards → Kochi local duty packages | Vehicle × data-driven hours/km package columns; excess rates are separate. |
| [Local Package — excess rules and markup](vendor-crm-migration-reference.html#screen-local-card-rules) | Local Package tariff → lower sections | Supplier defines excess charging behavior once, followed by charge treatment, shared tax reference and bottom markup. |
| [Local Package — edit package matrix](vendor-crm-migration-reference.html#screen-local-edit) | Local Package → Edit rate card | Add package defines a name and included hours/km; then enter each vehicle's supplier price. |
| [Local Package — Test Rate](vendor-crm-migration-reference.html#screen-local-test) | Exact local card → Test rate | Select package and planned usage, then resolve allowance and excess through the selected supplier rules. |
| [Outstation Per Km — tariff sheet](vendor-crm-migration-reference.html#screen-outstation-card) | Kerala Road Trips → exact outstation tariff | Simple vehicle row: rate/km, minimum km/day and driver/day. |
| [Outstation Per Km — pricing rules](vendor-crm-migration-reference.html#screen-outstation-rules) | Outstation tariff → Pricing rules | Supplier-defined pooled versus per-day minimum, billable days, measured distance, garage/return and rounding. |
| [Outstation Per Km — edit](vendor-crm-migration-reference.html#screen-outstation-edit) | Outstation card → Edit rate card | Change tariff numbers while retaining reference to reusable vehicle offerings. |
| [Outstation Per Km — Test Rate](vendor-crm-migration-reference.html#screen-outstation-test) | Exact outstation card → Test rate | Dates/times define billable days; total or per-day distance follows the selected minimum method. |
| [Outstation Per Km — daily usage and result](vendor-crm-migration-reference.html#screen-outstation-test-usage) | Outstation Test Rate → usage/results | Day rows support daily minimum contracts; result explains billable distance, driver allowance and actuals. |
| [Vendor — Services](vendor-crm-migration-reference.html#screen-vendor-services) | South Coast Coaches → Services | Supplier-first offerings list, distinct from tariffs list. |
| [Vendor-origin service detail](vendor-crm-migration-reference.html#screen-daily-service-overview) | South Coast Coaches → Services → Van and coach daily hire | Same service structure reached from the vendor's offerings list. |
| [Vendor-origin service — Rate Cards](vendor-crm-migration-reference.html#screen-daily-service-cards) | Vendor → Services → daily hire → Rate cards | Relevant vendor-owned tariff, with card-first priority and exact-record navigation. |
| [Daily Hire — tariff sheet](vendor-crm-migration-reference.html#screen-daily-card) | South Coast Coaches → service → exact Daily Hire card | Price/day and included km/hours/day are the base; excess rates are separate. |
| [Daily Hire — excess and carry rules](vendor-crm-migration-reference.html#screen-daily-rules) | Daily Hire → lower tables | Supplier explicitly permits or forbids carrying unused km and hours between service days. |
| [Daily Hire — edit](vendor-crm-migration-reference.html#screen-daily-edit) | Daily Hire → Edit rate card | Maintain day tariffs and shared usage rules within the approved tariff-sheet structure. |
| [Daily Hire — Test Rate](vendor-crm-migration-reference.html#screen-daily-test) | Exact Daily Hire card → Test rate | Trip dates define service days; day-specific km and hours resolve excess without pooling unless permitted. |
| [Daily Hire — day rows and supplier result](vendor-crm-migration-reference.html#screen-daily-test-day-usage) | Daily Hire Test Rate → usage rows | Separate day allowances and mixed vehicle lines explain the supplier commercial amount. |
| [Established vendor — Overview](vendor-crm-migration-reference.html#screen-vendor-overview) | Vendors → Trailmakers Experiences | One business can offer accommodation, transport and activities; profile, contacts and relationship history sit here. |
| [Edit vendor launcher](vendor-crm-migration-reference.html#screen-vendor-edit) | Vendor header → Edit vendor | Profile sections expose editable supplier/contact/business context without turning services or tariffs into profile fields. |
| [Edit vendor — operational fields](vendor-crm-migration-reference.html#screen-vendor-edit-operations) | Edit vendor → profile → lower sections | Reservations/emergency contacts, SLA/channel, payment terms and internal notes describe supplier fulfillment context. |
| [Multi-service vendor — Rate Cards](vendor-crm-migration-reference.html#screen-vendor-rate-cards) | Trailmakers Experiences → Rate cards | One vendor's focused cards across services; service/type/status filters act on the same records used in discovery. |
| [Create rate card — vendor entry](vendor-crm-migration-reference.html#screen-vendor-create-card) | Vendor → Rate cards → New rate card | Provider is fixed to the current vendor; choose the relevant service and enabled pricing template. |
| [Create rate card — complete template set](vendor-crm-migration-reference.html#screen-vendor-create-card-templates) | Template picker → lower choices | Activity, visa and future-state families shown in approved creation flow. |
| [Vendor — Packages](vendor-crm-migration-reference.html#screen-vendor-packages) | Vendor record → Packages | Related agency products that reference supply; package price is not a tariff row. |
| [Vendor-linked package record](vendor-crm-migration-reference.html#screen-vendor-package-detail) | Vendor → Packages → Kerala Backwaters Escape | Read itinerary/service blocks, pricing summary and relationship context in the vendor module. |
| [Vendor — Bookings](vendor-crm-migration-reference.html#screen-vendor-bookings) | Vendor record → Bookings | Supplier-linked accepted trip/service records with search, filters, actions and pagination. |
| [Vendor — Finance summary](vendor-crm-migration-reference.html#screen-vendor-finance) | Vendor record → Finance | Four summary amounts and bank information are supplier-context financial references. |
| [Vendor — payables](vendor-crm-migration-reference.html#screen-vendor-finance-payables) | Vendor Finance → lower table | Supplier invoices, linked booking/service, amount and payment status. |
| [Edit bank details](vendor-crm-migration-reference.html#screen-vendor-bank-edit) | Vendor Finance → Edit bank details | Validated supplier bank beneficiary details and preferred account. |
| [Statement of account](vendor-crm-migration-reference.html#screen-vendor-statement) | Vendor Finance → Statement of account | Period-filtered supplier balance movements with running balance and export. |
| [Vendor — Docs](vendor-crm-migration-reference.html#screen-vendor-docs) | Vendor record → Docs | Compliance/source documents, expiry and requested/received state. |
| [Document actions](vendor-crm-migration-reference.html#screen-doc-actions) | Vendor Docs → document three-dot menu | Document view/download, renewal/update and request actions retain document context. |
| [Document request → editable communication draft](vendor-crm-migration-reference.html#screen-doc-request) | Docs → Request | Requesting a document opens the message context for review; no external send has happened. |
| [Vendor — Communications](vendor-crm-migration-reference.html#screen-vendor-communications) | Vendor record → Communications | Context inbox and sent conversations tied to this supplier. |
| [Compose email](vendor-crm-migration-reference.html#screen-communication-compose) | Vendor Communications → New email | Review recipient, subject/body, local attachment and template before an authorized send. |
| [Communication templates](vendor-crm-migration-reference.html#screen-communication-templates) | New email → Template | Populate the draft with operational request copy; recipient/context remain editable. |
| [Vendor — Tasks](vendor-crm-migration-reference.html#screen-vendor-tasks) | Vendor record → Tasks | Assignee, priority, due dates and linked supplier context support operational follow-up. |
| [Add task](vendor-crm-migration-reference.html#screen-task-new) | Vendor Tasks → Add task | Create a scoped follow-up with owner, due time, linked service/card/package/booking and status. |
| [Completed tasks](vendor-crm-migration-reference.html#screen-tasks-completed) | Vendor Tasks → Completed | Review completed follow-up independently from supplier or finance lifecycle. |
| [Vendor — Activity timeline](vendor-crm-migration-reference.html#screen-vendor-activity) | Vendor record → Activity | All supplier events use the shared dated timeline, actor/role column, selection and record actions. |
| [Activity row actions](vendor-crm-migration-reference.html#screen-activity-actions) | Vendor Activity → three-dot menu | View event detail or remove this local history entry; actions use this event ID. |
| [Activity detail](vendor-crm-migration-reference.html#screen-activity-details) | Activity row → View Activity | Event narrative, changed fields and related context should add information beyond the row summary. |
| [Remove activity confirmation](vendor-crm-migration-reference.html#screen-activity-remove) | Activity row → Remove Activity | Confirmation makes event removal explicit; cancellation preserves existing history. |
| [Activity — supplier tariff](vendor-crm-migration-reference.html#screen-activity-card) | Trailmakers → Rate cards → Munnar trek supplier rates | Supplier prices attach to service options; participant/group/unit methods remain explicit. |
| [Activity — adjustments, extras, tax and markup](vendor-crm-migration-reference.html#screen-activity-card-extras-markup) | Activity card → lower sections | Option-scoped extras, date adjustments and agency default markup stay distinct from supplier base. |
| [Activity — edit supplier prices](vendor-crm-migration-reference.html#screen-activity-card-edit) | Activity card → Edit rate card | Maintain priced/complimentary/on-request states and age/group/unit rows. |
| [Activity — Test Rate](vendor-crm-migration-reference.html#screen-activity-test) | Activity card → Test rate | Option, session, participant ages, method and scope determine vendor-specific commercial cost. |
| [Activity — supplier Policies](vendor-crm-migration-reference.html#screen-activity-policies) | Activity card → Policies | Commercial conditions of this supplier's priced offering. |
| [Activity — Versions](vendor-crm-migration-reference.html#screen-activity-versions) | Activity card → Versions | Saved supplier tariff snapshots preserve review history independently of a customer Booking. |
| [Activity tariff — change history](vendor-crm-migration-reference.html#screen-activity-history) | Activity card → Activity | Events about this card; not a list of experience products. |
| [Accommodation tariff · 2026–27](vendor-crm-migration-reference.html#screen-accommodation-card) | Example Hospitality → Rate cards → Accommodation tariff 2026–27 | Approved interaction reference: header, price sets, room/meal matrix, lower extras, Policies, Test Rate and Markup. |
| [Accommodation — extra guests and children](vendor-crm-migration-reference.html#screen-accommodation-extra-guests) | Accommodation tariff → lower guest/age tables | Room occupancy and extra guest/child/bed conditions control applicable supplier charges. |
| [Accommodation — supplements and optional services](vendor-crm-migration-reference.html#screen-accommodation-supplements) | Accommodation tariff → supplements | Mandatory supplements, weekend adjustments and optional services apply only in their scope. |
| [Accommodation — bottom Markup](vendor-crm-migration-reference.html#screen-accommodation-markup) | Accommodation tariff → bottom | Owner-only selling preference is visually retained and separated from supplier tariff. |
| [Markup edit](vendor-crm-migration-reference.html#screen-markup-edit) | Rate card bottom → Markup → Edit | Set an agency preference with Save/Cancel; edit permission is Owner-only. |
| [Accommodation — edit matrix](vendor-crm-migration-reference.html#screen-accommodation-edit) | Accommodation tariff → Edit rate card | Maintain per-room/per-meal/per-season amounts and reusable occupancy details. |
| [Add accommodation season](vendor-crm-migration-reference.html#screen-accommodation-season-new) | Edit accommodation tariff → Add season | Named date range/priority defines a price set; seasons belong to accommodation. |
| [Accommodation — edit occupancy and guest rules](vendor-crm-migration-reference.html#screen-accommodation-edit-guest-rules) | Accommodation Edit → guest rows | Edit room maximum/base occupancy, extra-bed limit and age/bed charge rows. |
| [Accommodation — Test Rate inputs](vendor-crm-migration-reference.html#screen-accommodation-test) | Exact accommodation tariff → Test rate | Dates, nights, room/meal, adults, rooms and children with age/bed preference resolve against this card. |
| [Accommodation — nightly calculation trace](vendor-crm-migration-reference.html#screen-accommodation-test-trace) | Accommodation Test Rate → result and rules | Nightly room/meal values plus scoped extra guest and mandatory supplement lines explain the supplier total. |
| [Accommodation — Policies](vendor-crm-migration-reference.html#screen-accommodation-policies) | Exact accommodation card → Policies | Supplier contract documents and commercial/cancellation conditions, with unresolved policy state. |
| [Accommodation — Activity](vendor-crm-migration-reference.html#screen-accommodation-history) | Exact accommodation card → Activity | Tariff-specific operational events appear in the shared activity pattern. |
| [Accommodation service overview](vendor-crm-migration-reference.html#screen-accommodation-service-overview) | Vendor → Services → Example Lake Resort | Property capability, media and common service identity discovered through a supplier. |
| [Accommodation service — Vendors](vendor-crm-migration-reference.html#screen-accommodation-service-vendors) | Example Lake Resort → Vendors | Direct supplier/DMC/wholesaler relationships show their own supply context. |
| [Accommodation service — Rate Cards](vendor-crm-migration-reference.html#screen-accommodation-service-cards) | Example Lake Resort → Rate cards | Separate supplier contracts for the same property are discoverable without copying the tariff. |
| [Accommodation service — demo comparison](vendor-crm-migration-reference.html#screen-accommodation-service-test) | Example Lake Resort → Test rate | Current screen compares suppliers using synthetic room/meal offsets, unlike exact-card Test Rate. |
| [Accommodation service — Policies](vendor-crm-migration-reference.html#screen-accommodation-service-policies) | Example Lake Resort → Policies | Category/service-level reference wording, distinct from supplier-specific cancellation contract. |
| [Edit service capability](vendor-crm-migration-reference.html#screen-service-edit) | Service Overview → Profile → Edit details | Edit descriptive capability and guest constraints; supplier price rows are not changed here. |
| [Edit service media](vendor-crm-migration-reference.html#screen-service-media-edit) | Service Overview → Media → Edit media | Caption, banner assignment and image removal are descriptive content operations. |
| [Activity services directory](vendor-crm-migration-reference.html#screen-activity-services-directory) | Vendor CRM → Services → Activities | Experience discovery shared across supplying vendors; filter does not alter the relationship graph. |
| [Activity service — options](vendor-crm-migration-reference.html#screen-activity-service-overview) | Services → Activities → Munnar Ridge Trek | Common experience options/capacity/session structure exist before supplier-specific price selection. |
| [Activity service — several vendors](vendor-crm-migration-reference.html#screen-activity-service-vendors) | Munnar Ridge Trek → Vendors | Trailmakers, Summit and Spice Route supply options of the same experience through distinct contracts. |
| [Activity service — vendor-owned cards](vendor-crm-migration-reference.html#screen-activity-service-cards) | Munnar Ridge Trek → Rate cards | Card-first records show the owner and open the specific supplier's activity tariff. |
| [Activity service — Test Rate comparison](vendor-crm-migration-reference.html#screen-activity-service-test) | Munnar Ridge Trek → Test rate | Observed migration gap: the service-level Test Rate renders accommodation room/meal/night inputs for an activity and synthetic prices. |
| [Visa vendor — rate cards](vendor-crm-migration-reference.html#screen-visa-rate-list) | Vendors → Atlas Visa Services → Rate cards | Visa tariffs retain the same supplier-owned list and exact record opening. |
| [Visa tariff — current pricing sheet](vendor-crm-migration-reference.html#screen-visa-card) | Atlas Visa Services → Rate cards → Visa services tariff · UAE | Visa product/processing fees reuse the legacy rate-card experience; this is not a transport tariff. |
| [Visa tariff — Test Rate boundary](vendor-crm-migration-reference.html#screen-visa-test) | Visa tariff → Test rate | Document the visible test implementation rather than asserting a visa application engine exists. |
| [Visa tariff — policies](vendor-crm-migration-reference.html#screen-visa-policies) | Visa tariff → Policies | Vendor contract conditions are distinct from travel advisories or visa approval guarantees. |
| [Import tariff — anchored upload](vendor-crm-migration-reference.html#screen-tariff-import) | Vendor → Rate cards → Import tariff | Source files are an import entry, not automatically an approved numerical tariff. |
| [Booking row actions](vendor-crm-migration-reference.html#screen-booking-actions) | Vendor → Bookings → row actions | Booking context is linked to the supplier; opening a view is distinct from booking confirmation. |
| [Linked booking — detail dialog](vendor-crm-migration-reference.html#screen-vendor-booking-detail) | Vendor → Bookings → actions → View booking | Shows supplier-related booking details and any available downstream links; does not create or confirm bookings. |
| [Universal search](vendor-crm-migration-reference.html#screen-universal-search) | Top bar → Search anything / Ctrl K | Discovery routes into existing records and global modules. Results must preserve owner and exact identity. |
| [Vendor notes drawer](vendor-crm-migration-reference.html#screen-vendor-notes) | Sidebar → Vendor notes | Vendor notes are contextual information, not rate-card rows or a transaction log. |
| [Notifications panel](vendor-crm-migration-reference.html#screen-notification-panel) | Top bar → bell | Workspace notifications and deep links; not the vendor activity audit. |
| [Account launcher](vendor-crm-migration-reference.html#screen-account-launcher) | Top bar → avatar | Personal profile/security/preferences are distinct from organization and supplier records. |
| [Organization settings](vendor-crm-migration-reference.html#screen-settings-organization) | Sidebar → Settings → Organization | Workspace settings exist alongside Vendor CRM; only implemented destinations should be presented as available. |
| [Team and permissions](vendor-crm-migration-reference.html#screen-settings-access) | Workspace utility → Team and permissions | Roles and invitations are workspace controls, not supplier confirmation. |
| [Brand kit](vendor-crm-migration-reference.html#screen-settings-brand) | Workspace utility → Brand kit | Document brand settings stay shared across modules. |
| [Settings — coming later boundary](vendor-crm-migration-reference.html#screen-settings-stub) | Workspace utility → Settings — coming later boundary | A visible destination may be a stub. Do not invent its operation. |
| [My profile](vendor-crm-migration-reference.html#screen-account-profile) | Workspace utility → My profile | Personal profile data is independent of vendor contacts. |
| [Security and sign-in](vendor-crm-migration-reference.html#screen-account-security) | Workspace utility → Security and sign-in | Account sign-in settings are not supplier compliance documents. |
| [Devices and sessions](vendor-crm-migration-reference.html#screen-account-sessions) | Workspace utility → Devices and sessions | Session management is a workspace utility. |
| [Personal preferences](vendor-crm-migration-reference.html#screen-account-preferences) | Workspace utility → Personal preferences | Language/timezone/display preferences do not change supplier tariff rules. |
| [Workspace memberships](vendor-crm-migration-reference.html#screen-account-workspaces) | Workspace utility → Workspace memberships | Workspace roles govern access; do not turn them into vendor categories. |
| [Notification preferences](vendor-crm-migration-reference.html#screen-notification-preferences) | Workspace utility → Notification preferences | Notification preferences are shared utility settings. |
| [All notifications](vendor-crm-migration-reference.html#screen-notifications-page) | Workspace utility → All notifications | Workspace feed can route to records; it does not replace supplier activity history. |
| [Write a contextual vendor note](vendor-crm-migration-reference.html#screen-vendor-note-compose) | Sidebar notes + → compose | The root shared note store saves notes in browser storage; select a related label and pin if useful. |
| [Add contract policy](vendor-crm-migration-reference.html#screen-policy-new) | Rate card → Policies → Add a policy | A structured policy with text and optional supporting attachment belongs to this supplier card. |
| [Attach policy source document](vendor-crm-migration-reference.html#screen-policy-document-new) | Rate card → Policies → Add document | Source attachment carries document context; extracting text and applying terms are separate steps. |
| [Read supplier policy](vendor-crm-migration-reference.html#screen-policy-detail) | Rate card → Policies → policy row | Shows full terms and source context, not just the short table summary. |
| [Import vendors](vendor-crm-migration-reference.html#screen-vendors-import) | Vendor directory → Import | Current upload UI closes and resets the file; it does not parse files or insert supplier records. |
| [Vendor row actions — current](vendor-crm-migration-reference.html#screen-vendor-row-menu) | Vendor directory → CityRide Transfers → three dots | Record operations must preserve exact supplier identity and permissions. |
| [Delete vendor confirmation](vendor-crm-migration-reference.html#screen-vendor-delete-confirm) | Vendor directory → row actions → Delete vendor | Destructive record removal requires explicit confirmation. Documentation stops at this reviewable dialog. |
| [Add service — provider picker](vendor-crm-migration-reference.html#screen-service-vendor-picker) | Services → Add service → Provided by | Choose an existing supplier by searchable identity. A service cannot be created without its provider. |
| [Add Accommodation service — details and finish](vendor-crm-migration-reference.html#screen-service-new-accommodation-lower) | Add service → Accommodation → scroll to details | Type-specific capabilities describe the offering; prices belong to a supplier tariff. |
| [Add Transport service — details and finish](vendor-crm-migration-reference.html#screen-service-new-transport-lower) | Add service → Transport → scroll to details | Type-specific capabilities describe the offering; prices belong to a supplier tariff. |
| [Add Activities service — details and finish](vendor-crm-migration-reference.html#screen-service-new-activities-lower) | Add service → Activities → scroll to details | Type-specific capabilities describe the offering; prices belong to a supplier tariff. |
| [Add Visa service — details and finish](vendor-crm-migration-reference.html#screen-service-new-visa-lower) | Add service → Visa → scroll to details | Type-specific capabilities describe the offering; prices belong to a supplier tariff. |
| [Add Flights service — details and finish](vendor-crm-migration-reference.html#screen-service-new-flights-lower) | Add service → Flights → scroll to details | Type-specific capabilities describe the offering; prices belong to a supplier tariff. |
| [Add vendor — primary contact and location](vendor-crm-migration-reference.html#screen-vendor-new-contact) | Vendors → Add vendor → Primary contact | Primary person, phone/email/WhatsApp and actual base location establish operational contact and identity. |
| [Deployed service detail — missing Rate cards tab](vendor-crm-migration-reference.html#screen-deployed-service-tabs) | Vercel → South Coast Coaches → Services → Van and coach daily hire | Observed deployment difference: live shows four tabs; the current main reference shows five. |
| [Vendor directory  The supplier-first entry: search, region, category, relationship filter, row actions and pagination.](vendor-crm-migration-reference.html#screen-archive-01) | Earlier visual reference → Vendor directory  The supplier-first entry: search, region, category, relationship filter, row actions and pagination. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Directory filters  Service category and supplier relationship narrow the supplier list.](vendor-crm-migration-reference.html#screen-archive-02) | Earlier visual reference → Directory filters  Service category and supplier relationship narrow the supplier list. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor row actions  Open, edit and delete are record-level actions.](vendor-crm-migration-reference.html#screen-archive-03) | Earlier visual reference → Vendor row actions  Open, edit and delete are record-level actions. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Import popover  A file can be selected; the current handler does not parse or create supplier rows.](vendor-crm-migration-reference.html#screen-archive-04) | Earlier visual reference → Import popover  A file can be selected; the current handler does not parse or create supplier rows. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Add vendor · identity  Business identity, categories, generated code and contact details.](vendor-crm-migration-reference.html#screen-archive-05) | Earlier visual reference → Add vendor · identity  Business identity, categories, generated code and contact details. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Add vendor · location and business  Location, legal reference and internal ownership continue below the first screen.](vendor-crm-migration-reference.html#screen-archive-06) | Earlier visual reference → Add vendor · location and business  Location, legal reference and internal ownership continue below the first screen. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Edit vendor  The modal exposes profile fields and the vendor's surrounding operational sections.](vendor-crm-migration-reference.html#screen-archive-07) | Earlier visual reference → Edit vendor  The modal exposes profile fields and the vendor's surrounding operational sections. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Delete confirmation  The UI asks for explicit confirmation before removing a vendor from the current directory state.](vendor-crm-migration-reference.html#screen-archive-08) | Earlier visual reference → Delete confirmation  The UI asks for explicit confirmation before removing a vendor from the current directory state. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Established vendor overview  Example Hospitality shows profile, contacts and operating context.](vendor-crm-migration-reference.html#screen-archive-09) | Earlier visual reference → Established vendor overview  Example Hospitality shows profile, contacts and operating context. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Services directory  The service-first entry for discovering offerings across vendors.](vendor-crm-migration-reference.html#screen-archive-10) | Earlier visual reference → Services directory  The service-first entry for discovering offerings across vendors. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Accommodation service form  Service identity, providing vendor and accommodation-specific profile.](vendor-crm-migration-reference.html#screen-archive-11) | Earlier visual reference → Accommodation service form  Service identity, providing vendor and accommodation-specific profile. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Transport service form  The transport category changes the required capability fields.](vendor-crm-migration-reference.html#screen-archive-12) | Earlier visual reference → Transport service form  The transport category changes the required capability fields. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Activities service form  Experience details and service options are defined before supplier pricing.](vendor-crm-migration-reference.html#screen-archive-13) | Earlier visual reference → Activities service form  Experience details and service options are defined before supplier pricing. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Visa service form  Destination, visa type, processing and document information.](vendor-crm-migration-reference.html#screen-archive-14) | Earlier visual reference → Visa service form  Destination, visa type, processing and document information. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Flights service form  Route, airline, cabin and baggage describe the offering; the tariff template is still unavailable.](vendor-crm-migration-reference.html#screen-archive-15) | Earlier visual reference → Flights service form  Route, airline, cabin and baggage describe the offering; the tariff template is still unavailable. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Service overview  Example Lake Resort's service record is the common object reached from service or vendor discovery.](vendor-crm-migration-reference.html#screen-archive-16) | Earlier visual reference → Service overview  Example Lake Resort's service record is the common object reached from service or vendor discovery. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Service · Vendors  Supplier relationships appear separately from tariff records.](vendor-crm-migration-reference.html#screen-archive-17) | Earlier visual reference → Service · Vendors  Supplier relationships appear separately from tariff records. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Service · Rate Cards  Relevant tariffs are shown with owning vendors and open the exact card.](vendor-crm-migration-reference.html#screen-archive-18) | Earlier visual reference → Service · Rate Cards  Relevant tariffs are shown with owning vendors and open the exact card. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Service · Test Rate  This entry is convenient but can use demo calculations; exact-card Test Rate is the source for tariff logic.](vendor-crm-migration-reference.html#screen-archive-19) | Earlier visual reference → Service · Test Rate  This entry is convenient but can use demo calculations; exact-card Test Rate is the source for tariff logic. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Service · Policies  Category-level reference copy, distinct from the supplier's card policies.](vendor-crm-migration-reference.html#screen-archive-20) | Earlier visual reference → Service · Policies  Category-level reference copy, distinct from the supplier's card policies. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Services  One vendor's offerings, including shared activity linking and service actions.](vendor-crm-migration-reference.html#screen-archive-21) | Earlier visual reference → Vendor · Services  One vendor's offerings, including shared activity linking and service actions. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Transport service overview  The transport record joins service identity, vendor and reusable vehicle offerings.](vendor-crm-migration-reference.html#screen-archive-22) | Earlier visual reference → Transport service overview  The transport record joins service identity, vendor and reusable vehicle offerings. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vehicle offerings  Supplier fleet capability is recorded apart from numerical tariff rows.](vendor-crm-migration-reference.html#screen-archive-23) | Earlier visual reference → Vehicle offerings  Supplier fleet capability is recorded apart from numerical tariff rows. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Add vehicle  Seats, bag allowances, category and AC shape suitability.](vendor-crm-migration-reference.html#screen-archive-24) | Earlier visual reference → Add vehicle  Seats, bag allowances, category and AC shape suitability. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Rate Cards  Supplier tariffs across services, with separate status and validity.](vendor-crm-migration-reference.html#screen-archive-25) | Earlier visual reference → Vendor · Rate Cards  Supplier tariffs across services, with separate status and validity. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Rate-card template picker · top  Enabled accommodation, visa and transport starting points.](vendor-crm-migration-reference.html#screen-archive-26) | Earlier visual reference → Rate-card template picker · top  Enabled accommodation, visa and transport starting points. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Rate-card template picker · lower  Activity is enabled; Flight, Trip and Cruise show future-state templates.](vendor-crm-migration-reference.html#screen-archive-27) | Earlier visual reference → Rate-card template picker · lower  Activity is enabled; Flight, Trip and Cruise show future-state templates. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Accommodation tariff  The established season, room and meal matrix.](vendor-crm-migration-reference.html#screen-archive-28) | Earlier visual reference → Accommodation tariff  The established season, room and meal matrix. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Accommodation · Test Rate  Dates, rooms and party resolve through that exact supplier card.](vendor-crm-migration-reference.html#screen-archive-29) | Earlier visual reference → Accommodation · Test Rate  Dates, rooms and party resolve through that exact supplier card. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Accommodation · Policies  Supplier-specific policy rows and document references.](vendor-crm-migration-reference.html#screen-archive-30) | Earlier visual reference → Accommodation · Policies  Supplier-specific policy rows and document references. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Fixed transfer tariff  A focused private-vehicle route × vehicle price sheet.](vendor-crm-migration-reference.html#screen-archive-31) | Earlier visual reference → Fixed transfer tariff  A focused private-vehicle route × vehicle price sheet. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Transport · Test Rate  Route, traveller, luggage and vehicle suitability before a supplier amount is usable.](vendor-crm-migration-reference.html#screen-archive-32) | Earlier visual reference → Transport · Test Rate  Route, traveller, luggage and vehicle suitability before a supplier amount is usable. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Activity · Test Rate  Option, session, participant and pricing-method inputs with readiness warnings.](vendor-crm-migration-reference.html#screen-archive-33) | Earlier visual reference → Activity · Test Rate  Option, session, participant and pricing-method inputs with readiness warnings. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Activity tariff · Policies  Conditions of the supplier's experience tariff.](vendor-crm-migration-reference.html#screen-archive-34) | Earlier visual reference → Activity tariff · Policies  Conditions of the supplier's experience tariff. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Activity tariff · Versions  Saved tariff snapshots for review.](vendor-crm-migration-reference.html#screen-archive-35) | Earlier visual reference → Activity tariff · Versions  Saved tariff snapshots for review. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Packages  Products that reference this supplier's services.](vendor-crm-migration-reference.html#screen-archive-36) | Earlier visual reference → Vendor · Packages  Products that reference this supplier's services. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Package record  Itinerary blocks, policy and summary context.](vendor-crm-migration-reference.html#screen-archive-37) | Earlier visual reference → Package record  Itinerary blocks, policy and summary context. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Bookings  Bookings already linked to this supplier.](vendor-crm-migration-reference.html#screen-archive-38) | Earlier visual reference → Vendor · Bookings  Bookings already linked to this supplier. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Booking read modal  Trip, service, amount and status are inspected from the vendor record.](vendor-crm-migration-reference.html#screen-archive-39) | Earlier visual reference → Booking read modal  Trip, service, amount and status are inspected from the vendor record. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Finance  The four summary measures and bank details precede payables.](vendor-crm-migration-reference.html#screen-archive-40) | Earlier visual reference → Vendor · Finance  The four summary measures and bank details precede payables. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Payables  Booking, service, supplier invoice and payment status can be searched and exported.](vendor-crm-migration-reference.html#screen-archive-41) | Earlier visual reference → Payables  Booking, service, supplier invoice and payment status can be searched and exported. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Bank details editor  Account entry validates number, IFSC, preferred account and duplicate data.](vendor-crm-migration-reference.html#screen-archive-42) | Earlier visual reference → Bank details editor  Account entry validates number, IFSC, preferred account and duplicate data. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Statement of account  Date range, running balance and CSV export.](vendor-crm-migration-reference.html#screen-archive-43) | Earlier visual reference → Statement of account  Date range, running balance and CSV export. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Docs  Compliance records, expiry states, upload and renewal actions.](vendor-crm-migration-reference.html#screen-archive-44) | Earlier visual reference → Vendor · Docs  Compliance records, expiry states, upload and renewal actions. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Document request draft  A Docs action opens Communications with an editable message; it has not contacted the vendor.](vendor-crm-migration-reference.html#screen-archive-45) | Earlier visual reference → Document request draft  A Docs action opens Communications with an editable message; it has not contacted the vendor. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Tasks  Open and Completed operational follow-ups.](vendor-crm-migration-reference.html#screen-archive-46) | Earlier visual reference → Vendor · Tasks  Open and Completed operational follow-ups. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Add task  Assignee, linked context, priority, due information and status.](vendor-crm-migration-reference.html#screen-archive-47) | Earlier visual reference → Add task  Assignee, linked context, priority, due information and status. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Communications  All mail, Inbox and Sent within the prototype workspace.](vendor-crm-migration-reference.html#screen-archive-48) | Earlier visual reference → Vendor · Communications  All mail, Inbox and Sent within the prototype workspace. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Compose email  Recipient, template, body and optional local attachment.](vendor-crm-migration-reference.html#screen-archive-49) | Earlier visual reference → Compose email  Recipient, template, body and optional local attachment. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Email detail  A selected message's content and context.](vendor-crm-migration-reference.html#screen-archive-50) | Earlier visual reference → Email detail  A selected message's content and context. | Supplementary prior capture; current captures and dated observations take precedence. |
| [Vendor · Activity  A timeline of recorded or seeded events; separate from Activity services.](vendor-crm-migration-reference.html#screen-archive-51) | Earlier visual reference → Vendor · Activity  A timeline of recorded or seeded events; separate from Activity services. | Supplementary prior capture; current captures and dated observations take precedence. |
<!-- SCREEN_INVENTORY:END -->


---

# Complete earlier module operational context (2 October)

Current dated observations above take precedence.

# Paryatech Vendor CRM — UX and operational context

Reviewed: 2 October 2026. Scope: the current Vendor module in the main repository, including the latest Service Rate Cards, markup, and Vehicle Offering changes in the working copy.

This is a handoff for the next product or UX task. It describes how staff move through the module, what information each screen owns, and how the current implementation supports that work. It is not a new specification or a design-language guide.

For detailed supplier pricing, read [Rate card logic, examples, and test context](vendor-rate-card-logic-examples-and-test-context.md). It supplies the existing supplier/service/card inventory, tariff amounts, worked calculations, all 18 transport personas, activity and accommodation cases, and the difference between verified engine behavior and remaining UI or integration gaps. The default focused transport and activity fixtures are Draft and unconfirmed; controlled passing tests do not make them approved contracts.

## Contents

1. [Purpose and operating model](#1-purpose-and-operating-model)
2. [Ownership and relationships](#2-ownership-and-relationships)
3. [Complete screen map](#3-complete-screen-map)
4. [Users and permissions](#4-users-and-permissions)
5. [Vendor directory](#5-vendor-directory)
6. [Add vendor](#6-add-vendor)
7. [Edit and remove vendor](#7-edit-and-remove-vendor)
8. [Vendor record and Overview](#8-vendor-record-and-overview)
9. [Services directory](#9-services-directory)
10. [Add, edit, and remove service](#10-add-edit-and-remove-service)
11. [Service detail](#11-service-detail)
12. [Vendor Services tab](#12-vendor-services-tab)
13. [Vehicle Offerings](#13-vehicle-offerings)
14. [Rate-card discovery and creation](#14-rate-card-discovery-and-creation)
15. [Rate-card read, edit, and approval](#15-rate-card-read-edit-and-approval)
16. [Accommodation tariffs and Test Rate](#16-accommodation-tariffs-and-test-rate)
17. [Transport tariffs and Test Rate](#17-transport-tariffs-and-test-rate)
18. [Activity service tariffs and Test Rate](#18-activity-service-tariffs-and-test-rate)
19. [Visa and other service types](#19-visa-and-other-service-types)
20. [Markup](#20-markup)
21. [Policies](#21-policies)
22. [Packages](#22-packages)
23. [Bookings](#23-bookings)
24. [Finance](#24-finance)
25. [Docs](#25-docs)
26. [Tasks](#26-tasks)
27. [Communications](#27-communications)
28. [Activity history](#28-activity-history)
29. [Search, notes, and navigation](#29-search-notes-and-navigation)
30. [Module boundaries and handoff](#30-module-boundaries-and-handoff)
31. [Persistence and implementation boundaries](#31-persistence-and-implementation-boundaries)
32. [Example journeys](#32-example-journeys)
33. [Rules to preserve in subsequent work](#33-rules-to-preserve-in-subsequent-work)
34. [Source map](#34-source-map)

## 1. Purpose and operating model

Vendor CRM is the agency's supply workspace. Staff use it to answer:

- Who supplies this service?
- Where does that vendor operate, and whom should we contact?
- What can the vendor actually provide?
- What tariff and conditions apply to the requested service?
- Can that tariff price this specific trip or party?
- Which packages, bookings, invoices, documents, conversations, and follow-ups relate to the vendor?

There are two starting points within the same directory:

| Starting point | Staff's question | Next steps |
|---|---|---|
| Vendors | “I know the supplier. What do they offer?” | Vendor record → Services or Rate Cards → a specific offering or tariff |
| Services | “I know what I need. Who can supply it?” | Service record → Vendors or Rate Cards → supplier or exact tariff |

Both paths discover the same supplier records. A rate card remains owned by its vendor even when opened from Services.

The module contains three different kinds of operational information:

1. **Supplier identity and capability:** vendor, contacts, locations, services, activity options, vehicles.
2. **Commercial terms:** vendor tariffs, charge rules, validity, policies, supplier tax reference, agency markup default.
3. **Relationship follow-up:** linked packages/bookings, payables, documents, tasks, communications, activity history.

The current application is a browser-based UI implementation with fixture data and a mixture of browser storage and session state. A visible action is not automatically evidence of a connected production process. Section 31 documents this distinction.

## 2. Ownership and relationships

| Record | What it describes | Owned by / related to | What it must not be confused with |
|---|---|---|---|
| Vendor | Business the agency works with | Agency supplier directory | A particular trip or one specific tariff |
| Service | Discoverable property, transfer offering, experience, visa service, etc. | Has a primary providing vendor and can have other supplier connections | A supplier price or a customer's booking |
| Vendor–service connection | A vendor supplies or distributes a particular service | Vendor + service; relationship may be Direct supplier, DMC, or Wholesaler | A copied service tariff |
| Activity option | Session/format of an experience, delivery type, age and group constraints | Service | A vendor's price for that option |
| Vehicle Offering | Vehicle class/model, passenger seats, luggage, AC, attributes | Vendor; reusable across that vendor's transport services | A vehicle reservation or tariff row copied into every card |
| Rate card | Supplier's tariff for the offering and applicable validity | Vendor; linked to service | Service-owned copy, live availability, or customer quotation |
| Test Rate request | Temporary trip/party inputs for trying a tariff | Calculation screen | Proposal, booking, supplier confirmation, or payment |
| Agency markup default | Agency percentage used as a selling-price preference | Stored with rate-card metadata in the current UI | Supplier's price or supplier tax |
| Package | Reusable itinerary/product that uses services | Related to vendor through included services | A customer-specific accepted booking |
| Booking / payable | Accepted arrangement / resulting supplier obligation | Downstream Booking and Finance responsibilities | A side effect of testing a tariff |

Core relationships:

```text
Vendor
  → Vendor service / offering
      → Activity options, where applicable
      → Vehicle Offerings, for transport
      → Vendor-owned Rate Cards

Alternative discovery:
Service
  → Vendors providing the service
  → Vendor-owned Rate Cards relevant to the service
      → The exact same rate-card record under its owning vendor
```

One vendor can offer several service categories, multiple services within a category, and several tariffs. A Transport role does not classify the vendor as a hardcoded “airport vendor” or “outstation vendor.” Its services and rate-card templates describe those capabilities.

The code currently has both directory service IDs and older vendor service/profile IDs. Those IDs are linked; similar names do not establish identity. Navigation and new tariffs need the actual linked IDs.

## 3. Complete screen map

```text
Vendor CRM
├── Vendors directory
│   ├── Search / location / filters / selection / pagination
│   ├── Import
│   ├── Add vendor → Create draft vendor → Vendor record
│   └── Row / actions → Open vendor, Edit vendor, Delete vendor
│
├── Services directory
│   ├── All / Accommodation / Transport / Activities / Visa / Flights
│   ├── Search / location / supplier relationship filters
│   ├── Import
│   ├── Add service → Choose vendor → Create service
│   └── Service record
│       ├── Overview
│       ├── Vendors
│       ├── Rate Cards → Exact vendor-owned card
│       ├── Test Rate
│       └── Policies
│
└── Vendor record
    ├── Overview → Profile, contacts, operating history, recent activity
    ├── Services → List → Service detail (same five sections)
    │   └── Transport Overview → Vehicle Offerings → Add / Edit vehicle
    ├── Rate Cards → List / filters / New rate card
    │   └── Specific card
    │       ├── Rate Card → Tariff, rules, charges, supplier tax, Markup
    │       ├── Test Rate
    │       ├── Policies
    │       ├── Versions (Activity tariffs)
    │       └── Activity
    ├── Packages → Package list → Itinerary / Policies / Summary
    ├── Bookings → Vendor bookings list → Booking read modal
    ├── Finance → Summary / bank accounts / payables / statement
    ├── Docs → Document list / upload / preview / renewal request
    ├── Tasks → Open / Completed / Add task / Task detail
    ├── Communications → All mail / Inbox / Sent / Compose
    └── Activity → Search / selection / detail / related record
```

Opening a nested service or package gives that record the page context and a return action. Opening a rate card changes context to its owning vendor and that exact card. The current back action from a rate card returns to the vendor record; it does not restore every prior Service-list filter or tab.

## 4. Users and permissions

The permission model has Owner, Admin, and Member roles. The currently mounted Vendor application runs as **Owner**; the model is not a production authentication system.

| Action | Owner | Admin | Member |
|---|---|---|---|
| View vendors | Yes | Yes | Yes, limited to assigned vendors |
| Add/edit vendor and operational details | Yes | Yes | No |
| Deactivate vendor | Yes | Yes | No |
| Archive vendor / manage access | Yes | No | No |
| Add vendor task | Yes | Yes | No |
| Edit rate-card markup | Yes | No | No |

Permission checks determine whether many creation/edit buttons are offered. Some prototype controls do not yet enforce the same permissions consistently; for example, rate-card policy composition has its own local state and no role argument. Do not assume server-side enforcement from these UI checks.

## 5. Vendor directory

**Entry:** sidebar Vendors, or CRM → Vendors.

**Purpose:** find a supplier by identity, services, or operating region before opening its relationship workspace.

Information order is selection → Vendor → Regions served → Services offered → Action. Status is not a column on this first directory screen. A vendor's base location and service coverage are different: displayed regions are derived from its related services, with fallback information when no service coverage exists.

Staff can:

- Search vendor name, code, or internal owner.
- Find a vendor through a matching linked service; the row identifies that indirect match.
- Search a city/region and match vendor location or related service location.
- Filter by offered service category and supplier relationship (Direct supplier, DMC, Wholesaler).
- Select individual rows or all rows on the current page.
- Move through the directory in pages of six rows.
- Open a vendor by row, name, keyboard, or its action menu.
- Start Add vendor, edit a vendor, or confirm directory deletion.

Search/filter changes reset paging/selection where wired. Selection is independent from opening a row. The selection bar includes Export and Clear; the directory Export button currently has no download implementation.

**Import flow:** Import → sample template choices → choose XLS/XLSX/CSV → Import file or Cancel. The current shared import component accepts a file and closes; it does not parse rows or create records. Its sample download buttons are also placeholders. The displayed 10 MB limit is copy, not an enforced import pipeline.

## 6. Add vendor

**Entry:** Vendors directory → Add vendor.

**Flow:** complete a full-page form → review possible duplicate → Create draft vendor → open the new vendor record.

| Form section | Information collected | Operational purpose |
|---|---|---|
| Identity | Business name, generated vendor code, service categories, comma-separated labels | Identify the supplier and its scope |
| Conditional DMC information | Domestic/International/Both scope, specializations | Describe ground-handling capability |
| Primary contact | Name, phone/dial code, email, WhatsApp, same-as-phone option | Establish how staff reach the supplier |
| Location | City suggestions, state/region, country, address, postal code | Base and mailing location |
| Business details | Legal name, internal owner, GSTIN, PAN, internal notes | Agency ownership and supplier reference information |

Required: business name, at least one service category, city, country, internal owner, and at least one phone/email contact method. Entered email must be valid. The vendor code is generated from identity and existing records. GSTIN/PAN are stored as supplier identity information; entering them does not approve a tax profile.

Duplicate detection compares similar names, normalized phone, and email. It offers **View existing vendor**. This is advisory; it does not universally prevent creating a similar supplier.

Creation produces:

- Stable vendor ID/code.
- Draft status.
- Profile-complete setup flag; service, docs, rate-card, activation flags initially false.
- A “Created vendor draft” activity event.
- The saved form information available on Draft Overview.

It does not invent services, tariffs, bookings, invoices, or financial history. Vendor creation itself is held in application session state, so a reload currently rebuilds the vendor list from fixtures.

## 7. Edit and remove vendor

**Edit entries:** directory row actions → Edit vendor; vendor header → Edit vendor; relevant setup/profile entry.

The edit modal exposes identity/status/categories, location/address, contact methods, operational contact details such as reservations email and emergency phone, confirmation SLA/channel, payment terms, internal owner, and notes. It uses the core vendor validation and duplicate warning.

Saving preserves ID/code, updates profile values, records an activity event, and closes the modal. From the vendor page it returns to Overview.

Statuses supported are Draft, Setup incomplete, Active, Inactive, and Archived. Archive is restricted to Owner. Removing a category has a dependency check, but the current implementation checks linked fixture dependencies for one legacy vendor rather than all canonical relationships. Activation through profile editing is not a comprehensive document/tariff readiness gate.

**Directory deletion:** Delete vendor → confirmation explaining removal from directory/linked discovery → Keep vendor or Delete. The handler removes the vendor from the current in-memory list. It does not delete the underlying tariff/vehicle browser-storage records or perform a production cascade.

## 8. Vendor record and Overview

Every vendor record offers Overview, Services, Rate Cards, Packages, Bookings, Finance, Docs, Tasks, Communications, and Activity.

**Established vendor Overview:**

1. Operating history: relationship record, recent activity, operating scope, last updated.
2. Profile: vendor/business name, vendor ID, service categories, base location, internal owner, country.
3. Vendor contacts: named people with functional roles and Call, Email, WhatsApp actions.
4. Recent activities: latest four events; search, event detail, related-record navigation, and View all → Activity tab.

Status is retained at vendor-record/header level. It is not repeated in the six-field profile panel. Last updated appears in operating history rather than in that profile grid.

The contacts answer “who do I contact for this operational issue?” rather than treating the vendor business as one anonymous inbox. Contact actions use the corresponding phone/email/WhatsApp links where present.

**Draft Overview:** displays populated fields from Add vendor and a prompt to add the first service. It does not show the established vendor's sample operating history as if it belonged to the new vendor.

The setup checklist, when shown for a Setup incomplete record, describes profile → service → compliance documents → rate card → activation, with jumps to relevant sections. Those steps describe intended readiness; the current flags are not a fully synchronized onboarding process.

Draft records have a special rendering path: Services uses a simpler draft list; many other tabs show empty states. Some empty-state buttons are not connected, and the Draft Rate Cards tab does not yet behave like the established vendor's complete list. This matters when planning a new onboarding agenda.

## 9. Services directory

**Entry:** Vendors directory → Services.

**Purpose:** discover what the agency can source across suppliers without first knowing the vendor.

The category switcher offers All services, Accommodation, Transport, Activities, Visa, Flights. This is narrower than the vendor identity category list, which also allows DMC, Cruise, and Other.

Table information: selection → Service → Service type → Location → Vendors → Action. The vendor count indicates linked suppliers. Service location describes the property's location or the offering's operating area.

Search matches service name/category/location and linked vendor identity. An indirect vendor match is indicated on the row. Location and supplier relationship filters narrow discovery. Staff can open, edit, or confirm deletion of a service. The current directory paginates in groups of six.

The Add service action opens the same form used from a vendor's Services tab. Import uses the placeholder shared import flow described in section 5.

## 10. Add, edit, and remove service

**Add entries:** Services directory → Add service; Vendor → Services → Add service.

Flow:

1. **Vendor / Provided by:** required searchable vendor picker. On a vendor-originated flow it starts with that vendor selected. The user can change it during creation; creation then routes to the selected vendor when necessary.
2. **Service identity:** select category, enter service name, inspect generated service ID, provide base location/destination.
3. **Category-specific information.**
4. For Activities, define service options.
5. Create service or cancel.

| Category | Profile fields |
|---|---|
| Accommodation | Required property type; room types; check-in/check-out times |
| Transport | Required vehicle type description; passenger capacity text; route/coverage; luggage description |
| Activities | Required duration; group size; age suitability; meeting point; structured service options |
| Visa | Required visa type; validity; typical processing time; key documents; destination country |
| Flights | Required route; airline; cabin; baggage |

For transport, the creation form still contains descriptive capacity/luggage fields. Operational suitability is determined by the separate Vehicle Offering records, not by this free-text profile. The next task should preserve that distinction.

An Activity option defines a named format, category (admission, guided tour, class/workshop, cruise, adventure, rental), shared/private delivery, duration/session, optional min/max participants, min/max ages, session times, and included/excluded components. These are service capability definitions; supplier prices are entered later in a tariff. Activity creation validates missing names, invalid age/group constraints, and contradictory inclusions/exclusions.

Creation requires a valid vendor, name, location, and required category detail. It rejects the same service name/category for the same primary vendor. Another vendor with an equivalent name is not automatically merged into the original service.

Creating a service does not create a rate card. The service initially has a supplier relationship with no price linked. New/edited directory services persist in browser storage.

**Edit from the directory:** opens the populated full-page form. The existing vendor remains locked. Saving updates the record while preserving its ID. **Edit inside the vendor's nested service Overview:** edits a local profile/media state; it is not the same persisted directory form (see section 31).

**Delete service:** confirm removal from Services and vendor service discovery. The deleted service ID is remembered in browser storage. Rate cards remain vendor-owned; the confirmation explicitly states that they stay with their vendors. This is a visibility/deletion marker, not a complete cascading commercial-record deletion.

## 11. Service detail

Current tabs are exactly **Overview → Vendors → Rate Cards → Test Rate → Policies**.

### Overview

Shows identity/location/type, a summary of base location, vendor coverage, rate-card count, media, and a profile describing the service. Description, inclusions, exclusions, category-specific details, and available photos/videos provide scope before staff compare suppliers.

Transport adds the primary vendor's Vehicle Offerings underneath Overview. Activity options remain part of the service definition. Media lets staff understand the actual property/experience rather than infer it from the tariff title.

### Vendors

One row per linked vendor, rather than one row per tariff.

- Non-transport: vendor, supplier relationship, location, linked rate card, actions.
- Transport: vendor, service coverage, vehicle offerings, rate-card count, actions.

Open vendor navigates to that vendor record. A transport rate-card count switches to the service's Rate Cards tab filtered to that vendor. A named non-transport card link opens the exact card.

This separates “who provides it?” from “which tariff applies?”

### Rate Cards

All relevant vendor-owned cards appear, including new saved cards resolved through the shared card registry.

Information order: selection → Rate card → Vendor → Regions served → Action. Search matches tariff name/reference/vendor. A Vendor filter narrows the list. Selection does not change the active tariff or open a row.

Opening the row or **Open rate card** navigates to that exact card under its vendor. It does not stop at the vendor's entire card list and does not create a Service-owned copy.

**Add rate card:** if one vendor supplies the service, that owner is resolved automatically. For multiple vendors, staff must select an owner through the Vendor filter first. The service is preselected and only compatible templates appear in the creation modal.

### Test Rate

This entry exists for convenience, but its current behavior differs from a card's own Test Rate:

- Transport uses the first resolved linked transport tariff and its appropriate calculator; legacy transport branches remain for older data.
- It does not currently offer the same complete card/vendor selection and comparison flow as Proposal.
- Non-transport services fall back to `ServiceTestRate`, which uses demonstration accommodation-style pricing, not the selected vendor's canonical tariff engine.
- Activity services therefore need their exact Activity rate card opened for the dedicated Activity calculator.
- Without a linked rate card, the intended empty state asks staff to add one before testing.

For reliable context, the authoritative calculation entry is **Service → Rate Cards → exact card → Test Rate**.

### Policies

Displays cancellation, refund, and terms text generated from service name/type. The text explains that the ultimately selected vendor/card determines confirmed conditions. It is generic reference copy, not an aggregation of verified supplier contracts.

## 12. Vendor Services tab

**Purpose:** inspect and maintain a known vendor's offerings.

The list supports search, service-type filtering, selection, service opening, media preview, and Add service. Opening a service gives its five-tab detail view and a return to the vendor's service list.

An established vendor can also **Offer an existing activity**: choose an Activity already defined for another supplier → Link activity. This stores a vendor–service relationship without duplicating the Activity's options. That vendor then creates its own supplier tariff for those shared options.

The nested Overview offers inline profile editing and media upload, primary-banner selection, and removal. These currently change the mounted screen's state; uploaded files use temporary browser object URLs. Directory editing and Vehicle Offering saving have different persistence paths.

A Draft vendor uses a simpler created-services list. Creating its first service records the relationship but does not automatically change the vendor's status to Active or fill every readiness flag.

## 13. Vehicle Offerings

**Entry:** a Transport service → Overview → Vehicle Offerings → Add vehicle; edit through the vehicle row's action.

These are reusable supplier capabilities. They are not seats sold individually and do not represent a booked vehicle registration.

| Field | Meaning |
|---|---|
| Vehicle name | Distinct offering label staff will select |
| Category | Sedan, MUV, van, coach, or the vendor's existing category |
| Class/model | Specific model or permitted equivalent |
| Passenger seats | Customer/guide seats excluding the driver |
| Medium / large / cabin bags | Confirmed allowances by bag type |
| Combined luggage allowance | Confirmed total in current medium-bag-equivalent units |
| AC / non-AC | Suitability attribute |
| Other attributes | Descriptive equipment/accessibility/etc. information |
| Available transport services | Reuse the same offering across multiple services of this vendor |

Flow: open form → fill capability → select additional applicable services → Add vehicle/Save changes → updated offering table. Cancel/Escape abandons the form. The current service stays linked.

Validation requires a name, category, and positive whole passenger-seat count. Bag counts must be nonnegative whole numbers where supplied; combined capacity must be finite and nonnegative. Another offering of the same vendor cannot use the identical label. Storage errors keep the form open with an error.

Blank bag capacities remain unconfirmed rather than becoming zero. The current suitability engine uses separate bag-type limits and a combined allowance (medium = 1, large = 2, cabin = 0.5). This is the application's normalization convention, not a physical universal luggage rule.

Saving persists the offering in this browser. It becomes eligible for selection in the vendor/service's tariffs. Existing rate cards still explicitly select the offerings they price; adding a vehicle does not invent its tariff or automatically add it to every card.

## 14. Rate-card discovery and creation

### Vendor entry

Vendor → Rate Cards lists that supplier's cards across services. Current columns are selection, Rate card, Services, Type, Status, Action. Earlier “Property / Stay validity / Coverage” labels should not be treated as the latest model.

Search matches card/service; filters include Service, Type, Validity, and Status. Row actions open the card or copy its reference. The vendor card list currently renders all filtered rows with a one-page footer; it is not the same six-row paging logic as the directory.

### Service entry

Service → Rate Cards lists tariffs from all linked suppliers. Vendor names accompany the tariff. Both paths resolve the same card IDs and stored records.

### New rate card

1. Start New rate card from a vendor, or Add rate card from a service with the supplying vendor selected.
2. Choose an enabled template.
3. Select the relevant service when required; service-originated creation already supplies it.
4. Create draft.
5. Open the new card in editing mode, populate supplier tariff, then test/approve it.

Enabled templates: Accommodation, Visa, Activity, Fixed Transfer, Local Package, Outstation Per Km, Daily Hire. Flight, Trip, and Cruise appear as disabled future templates in the general picker.

Transport creation requires a linked transport service; Activity requires a linked activity with options. For service-originated creation, the category restricts template choices. The general vendor-originated Accommodation/Visa path does not yet require the same explicit service selection, which can leave a new generic card without a discoverable service link.

New transport cards start with empty validity/rules/prices/charges and reusable vehicle references. New Activity cards start with no selected methods or price rows. A draft is not prefilled with another supplier's live prices.

The creation action saves the new record in browser storage, so service and vendor discovery can refer to it again. Draft vendor tab behavior remains a separate limitation.

## 15. Rate-card read, edit, and approval

**Header:** card identity/reference, vendor context, validity/currency/status, Download rate card, Edit rate card. The default tab is Rate Card, followed by Test Rate, Policies, Activity; Activity tariffs also expose Versions.

The page shows a supplier tariff sheet, then the controls relevant to its product. The same record can be opened through either discovery route.

**Editing differs by tariff family:**

- Accommodation/generic and Transport updates save as fields change through the card update handler; the top Save changes button exits editing. Canceling an unrelated local dialog should not be assumed to undo already stored tariff edits.
- Changing an Active transport tariff makes it Draft again, clears supplier confirmation, and increments the version. Active is not preserved after changing the supplier contract.
- Transport's status control supports Draft → Review → Active. Active validates supplier confirmation, dates, coverage, vehicles, prices, rules, required charge treatments, and approved supplier tax configuration.
- Activity edits stay in a local draft until Save changes validates and records a saved tariff version. Activate rate card performs further source/tax/readiness checks. Versions show saved snapshots with dates/row counts.
- Accommodation's older Published/Draft/Expired states and readiness messages remain part of its implementation; they do not implement the exact transport approval model.

**Download:** exports a CSV tariff representation for the applicable card family. It is not a booking, supplier confirmation, or invoice export.

Transport's read screen deliberately omits the earlier source-document/version/supplier-demo rows and generic “Before activation” instructions. Supplier provenance/version still exist internally for approval and handoff.

## 16. Accommodation tariffs and Test Rate

**Reference example:** Accommodation tariff · 2026–27 (`rc-acc-2627`). This is the established interaction example used for the rate-card experience.

The rate-card information is structured around:

1. Price sets/seasons with date ranges and priority.
2. Room/product definitions, base/max occupancy, extra-bed limits.
3. Room × meal plan × price-set matrix.
4. Weekend extras where configured.
5. Extra guest/child/bed charges by room, age band, meal/bed condition.
6. Supplements, optional activities and services.
7. Rules, Policies, Activity, and bottom Markup.

In edit mode staff can adjust numeric rates, room details/occupancy, guest rows, supplements, activities/services, and add/edit date ranges through the season modal. A blank monetary value represents an unpriced combination.

**Card Test Rate inputs:** available check-in date, nights, room type, meal plan, adults, rooms, children with ages and extra-bed requests.

**Resolution:** each consecutive night selects its own price set; room rate × rooms; weekend addition if applicable; extra adult/child amounts; mandatory supplements. The result shows night-by-night resolution, calculation lines, and a rule trace.

The engine can refuse an unpriced night/cell, a configured minimum-stay failure, maximum occupancy violation, or an applicable unknown guest price. The reference card includes a specific blackout fixture. It does not simply multiply one selected season rate across a boundary.

Important current boundaries:

- Available check-in choices come from a fixture date list; this is not a full unrestricted calendar.
- Some rules, blackout/supplement behavior, and fallback date resolution are tailored to fixtures.
- Tax is represented as confirmed included or unconfirmed indicative, rather than using the transport shared-profile engine.
- Missing child bands are not handled identically to explicit unknown amounts in all branches; do not claim universal child-rule coverage.
- Service-level Test Rate uses a different synthetic comparison implementation. Card Test Rate is the one that reads this card's matrix.

## 17. Transport tariffs and Test Rate

### Scope

Private chauffeured transport only. The focused model excludes self-drive, public/scheduled buses, shared transfers, and per-seat transport. Traveller numbers determine suitability; they do not multiply a private vehicle's base fare.

### Four distinct templates

| Template | Primary tariff table | Pricing meaning |
|---|---|---|
| Fixed Transfer | Route × vehicle offering | Price per private vehicle for that directed route |
| Local Package | Vehicle × configurable hours/km package | Package base plus relevant excess usage |
| Outstation Per Km | Vehicle, rate/km, minimum km/day, driver/day | Distance-based hire with supplier-confirmed minimum rules |
| Daily Hire | Vehicle, price/day, included km/day, included hours/day | Retained vehicle charged per billable day |

One card displays one template. A vendor offering several methods has several cards. Trailmakers has separate fixed-transfer, local-package, outstation, and daily-hire tariffs. Other fixtures demonstrate focused suppliers such as CityRide Transfers, Kochi Local Cabs, Kerala Road Trips, and South Coast Coaches; Jaipur and Bengaluru local fixtures support regional test cases.

### Shared structure

Rate-card information → selected numerical tariff → excess table where relevant → compact shared pricing rules → Additional charges → trigger conditions where necessary → supplier tax setting → Markup.

Staff select reusable vehicle IDs in edit mode. The card does not recreate passenger/luggage/AC tables. Operating places describe coverage for non-fixed methods. Seasons are not part of the focused transport model; header validity determines the card's period. The focused schema does not currently expose a dedicated transport special-date-adjustment section, even though older regional transport code has adjustments.

### Calculation rules

**Fixed Transfer:** directed route price × each selected vehicle quantity + triggered extras. Reverse routes need their own stored price; the removed explanation text does not change this rule. No automatic distance multiplication.

**Local Package:** package price + excess km charge + excess hour charge according to the supplier's chosen method (both, higher amount, km only, or hours only). Package names/hours/km are editable data. A package suggestion considers entered usage and vehicle arrangement; staff can choose another package.

**Outstation:** pooled, separate daily, or no minimum. For pooled minimum:

```text
billable km = max(planned chargeable km + applicable garage/return km,
                  minimum km/day × billable days)
base = billable km × vehicle rate/km
driver = driver/day × billable days
```

Separate daily minimum requires daily distance inputs. Garage/empty-return distance treatment, rounding, fuel, timezone, and calendar/24-hour billable-day method are shared rules rather than repeated vehicle columns. A one-way route is not automatically doubled.

**Daily Hire:** days × daily rate, plus excess usage. Carry-forward behavior for unused km and hours is explicit and independent. If not pooled, daily usage is checked against that day's allowance.

Illustrative expected calculations:

- Local MUV: ₹4,200 + 15 km × ₹25 + 1 hour × ₹400 = **₹4,975**, before further charges/tax.
- Five-day van: max(850, 5 × 250) = 1,250 km; 1,250 × ₹22 + 5 × ₹500 = **₹30,000**, before extras/tax.
- Two-day van: 2 × ₹10,000 + 2 extra hours × ₹500 = **₹21,000**, when each day includes 200 km/10 hours, entered daily use is 140 km/9 hours then 180 km/12 hours, and hours do not carry forward.

These are calculation illustrations, not live supplier quotations.

### Additional charges

The reusable charge model contains name, scope, treatment, amount, charging unit, optional route/vehicle restrictions, and trigger. Treatments are Included, Fixed, Actual, Not applicable, or unresolved/Unconfirmed.

Charging units include hire, vehicle, day, night, hour, km. Conditions include night time window, waiting beyond allowance, and distance beyond allowance. Route/vehicle restrictions prevent applying a charge where it does not belong. A hire-level charge is not duplicated across every vehicle line; vehicle-level charges scale with the relevant quantities.

Paid by / Collected by are absent from the ordinary read table after the requested simplification. Responsibility remains in the underlying model where needed to avoid adding a customer-direct cost to supplier payable. These fields do not turn the tariff into a payment transaction.

Required charge names need an explicit treatment covering the applicable routes/vehicles. Unknown required values do not become zero. Included charges are not added again. Actuals produce a known base plus actuals rather than a false all-inclusive final amount.

### Supplier tax

Listed supplier prices are Inclusive or Exclusive. A card references an approved shared supplier tax profile; the profile contains the rate, approval source, and Finance-approved recoverability information outside the tariff's numerical vehicle tables.

Inclusive extracts the included breakdown rather than adding tax again. Exclusive adds resolved supplier tax to supplier payable. No universal transport GST percentage is hardcoded into this tariff.

Without the required approved profile/confirmation, the screen may show a commercial illustration but withholds a final approved supplier payable. The tax-profile management screen belongs to Finance, not the Vendor tariff editor.

### Card Test Rate

1. Open the exact vendor tariff → Test Rate.
2. Enter date/time; end date/time when retained hire applies.
3. Fixed Transfer pickup is selected from the stored route origins; final drop narrows to destinations supported from that origin. Other methods use pickup/drop text plus operating-coverage checks.
4. Enter all traveller seats, guide/staff seats, medium/large/cabin luggage, AC requirement.
5. Choose a suggested arrangement or manually add vehicle allocation rows and quantities. A van plus MUV is possible; it is not limited to “number of identical vehicles.”
6. Enter relevant planned km/hours/waiting and daily usage where required. Billable days resolve from dates/time and supplier rule.
7. Read the supplier calculation and blockers.

Results separate base vehicle tariff, driver allowance, excess usage, fixed extras, supplier tax, payable, billable distance, individual vehicle lines, and pending actual charges.

Suitability checks passenger seats including guide/staff, each luggage type, combined allowance, and AC. A valid price does not prove availability. Suggestion search is intentionally bounded; it does not solve every possible fleet combination or validate every free-text attribute.

The calculator checks vehicle ownership/service membership, directed route, validity, scope, missing tariff inputs, charge conditions, and approval/tax readiness. Test Rate creates no Proposal, Booking, payment, or supplier confirmation.

## 18. Activity service tariffs and Test Rate

Here **Activities** means experiences/tours/admissions. The singular **Activity tab** elsewhere means change history.

Service options describe what can be delivered. Each supplying vendor owns its own price card against those options. Staff can enable only supported pricing methods:

| Method | What it charges |
|---|---|
| Per person | Participant category/age/group bands × relevant participant quantities |
| Per booking/group | One charge for the party within its group slab |
| Per unit | Equipment/boat/etc. quantity × session/hour/day basis |

The card shows only enabled sections. It also supports minimum booking charges, additions/inclusions, scope/age/capacity conditions, charge tax exceptions, date adjustments, supplier tax/commercial terms, and bottom Markup.

Price states are Priced, Complimentary, On request, Missing, Not offered. Explicit Complimentary is different from an unknown empty price. On request needs a confirmed supplier amount, quotation source, and valid-until information for the specific calculation.

**Dedicated card Test Rate:** date/session → service option → pricing method → participant categories/ages/quantities or group/unit arrangement → optional extras → included/external component checks → supplier breakdown.

The engine checks option eligibility, age and party constraints, rate coverage, applicable date adjustments, unit capacity, included versus extra components, unresolved prices/tax, and known/unconfirmed session availability. Multiple unit types can be selected. A transfer marked as already costed elsewhere is relevant to avoiding duplicate transport additions.

Output includes calculation lines, additional charges, supplier tax/total, actuals, included components, external requirements, and availability information. Active status/source approval matter for later reuse; listed session availability still is not a supplier booking confirmation.

Save changes validates and stores a version. Activate validates provenance and approved tax information. Versions preserves saved tariff snapshots. The Activity tax editor currently uses approved-profile reference/rate/source fields rather than the exact shared selector used by focused transport; do not describe those tax UIs as fully unified.

## 19. Visa and other service types

Visa exists as a discoverable service and enabled tariff template. Service profile captures destination/visa type/validity/processing/documents. The template describes supplier processing fees across applicant/product dimensions and should not be interpreted as a visa application case.

The current generic rate-card data/view still reuses accommodation-style room/product arrays and the generic quote engine. It is not a complete visa eligibility/application/processing system. Service-level Test Rate also uses the generic demonstration screen.

Flights is available in the service directory/creation form; its rate-card template is disabled. Trip and Cruise templates are also disabled. Vendor identity may advertise additional categories without those categories having a complete tariff engine or service-creation flow.

## 20. Markup

Every relevant card's Rate Card view ends with **Markup**, including Accommodation, Transport, and Activities. It stores a percentage default for the agency's selling-price preference.

Owner → Edit → enter percentage → Save; Cancel/Escape abandons the markup edit. The current UI clamps to 0–100 and stores one decimal place. Other roles can read it.

This value remains separate from supplier tariff/tax/lifecycle. Transport and Activity supplier engines do not add it to supplier costs. The downstream Proposal must apply its selling-price decision once; the mere existence of the card default does not prove every Proposal path currently imports it.

The UI calls this **Markup**, although conversation sometimes uses “margin.” They are not interchangeable formulas:

```text
10% markup on ₹10,000 cost → ₹11,000 selling price
10% gross margin on selling price → ₹10,000 / 0.90
```

Describe the current control as a markup percentage unless a subsequent task explicitly changes its meaning.

## 21. Policies

Two different levels exist:

- **Service Policies:** generic cancellation/refund/terms reference text, selected by service category.
- **Rate-card Policies:** supplier-specific policy rows with title/category, short summary, readable full text, optional document metadata, and Resolved/Unresolved/None state.

Card workflow: search → open row to read → Add a policy or Add document → enter title/category/summary/text, optionally attach file → Save → new Unresolved row opens for review.

Document-to-text conversion currently generates demonstration text; it is not OCR or contract extraction. Added policy rows stay in local component state rather than saving back into the canonical tariff record. File metadata is not durable document storage. Unresolved policy status is therefore a review affordance, not a completed legal/operational approval pipeline.

## 22. Packages

**Entry:** Vendor → Packages.

Purpose: see products/itineraries using this supplier, rather than require staff to search the global package workspace first.

List: search, Live/Re-price/Draft filter, selection, package open, Build package, and row operations including duplicate-to-Draft/status changes. Build package collects name, route/duration detail, summary, selling price and creates a local Draft product.

Open package → **Itinerary / Policies / Summary**.

- Itinerary groups service blocks by day; collapse/expand days, inspect blocks, view linked service.
- Edit package enables package settings, add day, add block by service kind, update/remove an itinerary item, upload/manage media, choose banner.
- Service preview shows the included service and can open that vendor/service record.
- Policies shows package cancellation/refund/terms.
- Summary describes service groups, readiness, estimated cost/selling price.

The editor is a usable local UI flow but its cost summary contains estimates/demo values; it is not automatically the shared supplier-engine result for every block. New/duplicated/edited package records remain in component state and are not a production publication flow.

## 23. Bookings

**Entry:** Vendor → Bookings; or Finance payable → Open booking.

Purpose: inspect bookings already linked to the supplier and understand travel, service, booking/finance status, owner, and amount.

List columns: selection, Booking, Travel, Service, Status, Owner, Action. Search and booking-status filtering narrow the vendor's fixture bookings. Row/action opens the read modal; actions can copy the booking reference.

The read modal contains reference, travel dates/party, service, amount, owner, and booking/finance status. **Open full booking** is displayed but has no handoff handler in this Vendor modal.

This tab is a contextual read surface. It is not where Test Rate creates bookings, issues confirmations, or changes supplier obligations. The separate root Booking transport handoff is discussed only as a module boundary in section 30.

## 24. Finance

**Entry:** Vendor → Finance.

Information sequence:

1. Four summary measures only: Billed to date, Settled, Outstanding, Overdue.
2. Bank details with account-specific edit and Add another account.
3. Payables linked to bookings/services.
4. Statement of account through the summary action.

The earlier second KPI row for credit limit/headroom/advance/margin is not part of the current visible summary.

**Bank flow:** Add/Edit → account holder, bank name, account type, number, IFSC, branch, preferred-account flag → Save. Required fields, 6–20 digit account number, 11-character IFSC pattern, and duplicate account+IFSC checks protect data entry. Setting one preferred account clears that preference on others. Copy actions support number/IFSC. Bank accounts persist in browser storage keyed by vendor name; the edit records actor/time. This is account reference maintenance, not money movement.

**Payables:** search booking/service/invoice; status filter (including unpaid); selection; CSV export; row actions open linked booking/service or copy invoice reference. Current table is Booking, Service, Vendor invoice, Total payable, Status, Action. Data is vendor-filtered fixture information.

**Statement:** choose date range → opening balance, debit/credit movements, running balance, closing totals → CSV export. Invalid ranges show an empty/error state. Summary measures and transaction source are sample/shared data rather than live vendor-specific ledger calculations.

Vendor Finance does not currently create/pay invoices or manage approved supplier tax profiles. The broader Finance module owns tax configuration and resulting confirmed obligations.

## 25. Docs

**Entry:** Vendor → Docs.

Purpose: see which supplier/compliance records exist, which need renewal, and whom to follow up with.

Table: Document, Reference, Valid to, Owner, Status, Action, plus selection. Search/status filters include expired, expiring, awaiting, verified.

**Upload:** choose local file → document name/reference → No expiry or Expires on/date → preview resulting lifecycle status → Add → open preview. Expiry is evaluated relative to today; within 30 days is expiring, past dates expired. Uploaded documents without expiry are marked Verified by the prototype automatically; that does not represent an external verification.

**Preview:** uploaded PDFs/images can be displayed through temporary browser URLs. Fixture files may provide metadata rather than real downloadable content.

**Renewal/chase:** a row requiring renewal/follow-up prepares a document-request body → switches to Communications with that draft → staff chooses recipient/reviews/sends. Request documents also starts this flow. The click prepares communication; it does not silently contact the supplier.

**Delete:** confirmation → remove document from local list.

The current Docs panel uses a shared sample document list and local uploaded-file state, not a fully vendor-scoped durable document store.

## 26. Tasks

**Entry:** Vendor → Tasks.

Open and Completed are separate lists with counts. Open tasks have search and status filtering; completed tasks have search. Rows show task/context, assignee/team, due information, and status.

**Add task:** title, description, priority, assignee, linked section/record, due/status information → Create → appear in Open or Completed according to status. Linked sections include vendor Overview, services, rate cards, packages, bookings, Finance invoice, docs, conversations when supplied as options. Title is required.

**View:** opens a detail modal containing ID, linked context, description, priority, assignee/team, due, status.

The purpose is operational follow-up: obtain missing tariffs, chase documents, confirm terms, or complete supplier work. Current tasks use shared fixture lists and component state. A task's context identifies the related record, but the modal does not implement every possible deep link or a full edit/complete workflow.

## 27. Communications

**Entry:** Vendor → Communications; Docs renewal/request → draft here.

Current workspace is email: **All mail / Inbox / Sent**, contact context, messages, and New email.

**Compose:** select vendor contact → subject/body → optionally apply a template or attach a local file → Send, or discard. Templates include document requests and service-detail confirmation. Required recipient/subject/message prevents an empty send action.

Sending adds an in-session Sent record and confirmation notice. Reading a message shows its content/context. This implementation does not deliver email through a real mail provider or guarantee attachment transmission. Inbox items are fixtures, not synchronized live supplier messages.

Contact selection uses vendor contacts when available; otherwise the primary/reservations email is the fallback. The Docs flow prepopulates request wording for staff review rather than sending automatically.

## 28. Activity history

**Entries:** vendor Overview → Recent activities → View all; vendor Activity tab; rate-card Activity tab.

Purpose: explain what changed, who did it, when, and where to inspect the affected information. This is separate from the Activities service category.

Recent Overview shows four rows. Full vendor Activity uses the complete event list with search, selection, row actions, and pagination outside the activity rectangle. Timeline icons connect related rows; date/time is beside the icon; event/context occupies the central area; actor and role appear at the right.

**View Activity:** shows event title, time/context, What happened explanation, additional fact rows where recorded, and actor/role. A related-record action opens the appropriate vendor section or service.

**Remove Activity:** confirmation removes the event from the currently displayed history. This is local display behavior, not an immutable production audit ledger. The rate-card event list contains fixture/derived history; field autosaving should not be assumed to emit a complete auditable event for every change.

## 29. Search, notes, and navigation

- **Universal search:** top search or Ctrl/Cmd+K → pages/vendor results/settings → select result to navigate. It includes vendor identities; it is not yet a complete index of every service/tariff/document.
- **Breadcrumb/back:** reflects directory, vendor, service, package, or tariff context. Most Vendor record routes are internal React state; refresh does not restore every nested CRM record from the URL.
- **Notes:** record context labels module/vendor/rate-card notes. In the integrated workspace, notes-strip actions delegate to the shared workspace notes handler; the standalone local NotesPanel mainly displays notes and has a placeholder Write note button. Do not claim every note is stored against the vendor/card without checking that integration.
- **External modules:** Packages, Bookings, Destination, and Finance can navigate through the root application. Those products are outside this Vendor-module screen inventory.
- **Help/account/notifications/settings:** shared workspace utilities are present but are not vendor-specific operational records. They should not be mixed into a new Vendor-flow agenda merely because they share the sidebar/header.

## 30. Module boundaries and handoff

Vendor CRM supplies capability and tariff context. Customer requirements, accepted arrangements, and actual obligations have separate owners.

```text
Vendor CRM:
  Supplier + offering + tariff + conditions
        ↓ referenced by ID/version
Proposal:
  Customer requirement + travellers/luggage + arrangement
  → selected supplier calculation → selling decision → customer quotation
        ↓ accepted snapshot
Booking:
  Accepted arrangement + supplier confirmation + usage amendments
        ↓ one confirmed obligation per accepted hire
Finance:
  Supplier obligation + invoices/payments/ledger
```

Current repository connections exist for focused transport:

- Proposal transport costing and card Test Rate call the same commercial engine.
- The option resolver examines actual vendor-owned cards, service/vehicle scope, route/coverage, validity and approval. Alternatives keep their pricing method identity.
- Proposal can represent multiple requirements; continuous hire references avoid charging the same hire on each itinerary day.
- Accepted transport stores tariff, input, vehicles, tax profiles and result in a snapshot.
- Booking handoff records accepted version/hire, calculates usage amendments as deltas, and requires supplier confirmation before producing the resulting confirmed Finance obligation.
- Finance obligation helpers select current confirmed records rather than adding the same accepted hire repeatedly.
- Activity acceptance has a separate snapshot/handoff path. Its complete downstream handling should not be assumed identical to transport just because both have tariff tests.

These are root product integrations and browser-storage helpers, not actions performed by Vendor Test Rate. The Vendor Bookings/Finance fixture tabs do not automatically become views of every newly accepted handoff. Subsequent work must verify the specific consuming screen and snapshot path rather than connect only by matching displayed names.

## 31. Persistence and implementation boundaries

Use this table when interpreting “Save,” “Send,” “Import,” or “Verified.” It prevents carrying prototype behavior into the next agenda as an assumed production capability.

| Area | Current implementation |
|---|---|
| Vendor add/edit/delete | App-level session state initialized from seed vendors; reload resets it |
| Directory service create/edit | Browser local storage; edits overlay seeded services |
| Service deletion | Browser-stored deleted-ID list |
| Link existing activity to vendor | Stored vendor–service connection; no duplicate option definition |
| Nested service inline profile/media edits | Component state / temporary file URLs |
| Vehicle Offering Add/Edit | Browser local storage; reusable vendor/service references |
| Transport tariffs | Stored by canonical card ID; created-card index; approval/rule checks |
| Activity tariffs | Stored by canonical card ID; explicit saved versions |
| Generic Accommodation/Visa cards | Browser storage and canonical created-card registry |
| Rate-card Markup | Browser-stored card metadata; independent supplier amount |
| Card policy additions | Local PoliciesPanel state; no durable write to canonical card |
| Docs upload/delete | Local state and temporary object URLs; shared fixture source |
| Tasks | Local component state / shared fixture source |
| Vendor Packages | Local component state / fixture mapping; estimated commercial summary |
| Vendor Bookings | Vendor-filtered fixtures and read modal |
| Bank accounts | Browser storage keyed by vendor name |
| Vendor Finance KPIs/statement | Sample/shared data; not calculated from a live supplier ledger |
| Vendor payables | Vendor-filtered fixtures; actual CSV export/navigation |
| Supplier tax profiles | Separate approved profile browser store; managed outside Vendor tariffs |
| Communications send | Adds local Sent entry; no real email delivery |
| Import/sample downloads | Picker/popover only; no parsing/download handler |
| Directory bulk Export | Visible control without export handler |
| Rate-card CSV / Finance CSV | Implemented client-side downloads |
| Activity removal | Local removal from visible history |
| Proposal/Booking transport handoff | Separate browser snapshot/amendment/confirmation helpers |

Browser storage is not a shared server/database: another browser/device does not automatically see these edits. Some records persist while their newly created vendor owner does not, so a reload can expose incomplete relationships. No database/network CRUD should be inferred from the name `vendorApi.ts`; it contains local operations and validation.

Legacy airport/regional transport code remains alongside focused private transport. New template creation uses the focused model. Do not use old seasons/whole-trip/capacity-in-card schemas as the default for new work.

This handoff is based on current source inspection and read-only preview navigation. It is not a new full financial audit or a claim that all screen actions have been production-tested.

## 32. Example journeys

### A. Agency adds a new transport supplier

Vendors → Add vendor → Transport category/contact/base/owner → Create draft vendor → Services → Add service with vendor preselected → create transport offering → edit vendor status when ready → service Overview → Add vehicle → define seats/bags/AC → Rate Cards → choose focused template → complete prices/rules/charges/tax → Test Rate → confirm/activate tariff.

Current onboarding caveat: Draft tabs and readiness flags are not fully coordinated; selecting a vendor status is not proof of comprehensive setup. Vehicle/tariff work requires the complete service/established-record flow.

### B. Staff know the property but need a supplier

Services → Accommodation → search property → Overview for scope → Vendors for suppliers → Rate Cards for their tariffs → open a named vendor-owned card → Test Rate for dates/rooms/party → review Policies → use that supplier record later in Proposal.

Do not use the service-level demonstration comparison as an authoritative supplier calculation.

### C. Staff test an airport transfer for a family

Services → Transport → Kochi fixed transfers → Rate Cards → CityRide card → Test Rate → supported pickup/drop, arrival time, all adults/children plus bags → inspect suitable arrangement → select van or mixed vehicles → inspect route base/night charge/actuals/tax → resolve blockers. No booking or vehicle reservation is created.

### D. A supplier offers another vendor's activity

Vendor → Services → Offer an existing activity → Link activity → open service → Rate Cards → select supplying vendor → Add rate card → Activity → price the shared options → Save version → Test Rate → activate after required supplier/tax confirmation.

The service/options remain shared; the new vendor's commercial tariff stays separate.

### E. Staff chase an expiring document

Vendor → Docs → filter Expiring → renewal action → Communications draft → choose correct contact → review subject/body → send in the prototype. Real email integration is still required for delivery.

### F. Staff inspect a supplier payable

Vendor → Finance → search invoice → Open booking / Open service → inspect linked operational context → return → Statement of account → choose period → export CSV. This is inspection/reference; the Vendor tab does not pay the supplier.

## 33. Rules to preserve in subsequent work

1. Vendors and Services are two browsing paths into linked supply data.
2. Every service creation requires a supplying vendor.
3. Rate cards are vendor-owned; opening through Services must use the exact same record.
4. Keep Vendors and Rate Cards separate in service detail: suppliers first in one tab, tariffs first in the other.
5. Keep the five service tabs and exact-card navigation clear.
6. Vehicle suitability comes from reusable Vehicle Offerings, not free-text service capacity or copied tariff attributes.
7. Transport has four focused private-vehicle pricing methods; do not combine them into one mega sheet or charge by traveller by default.
8. Shared supplier rules appear once; numerical vehicle prices remain easy to inspect.
9. Missing/unconfirmed differs from zero; included differs from additional; actual differs from a fixed all-inclusive total.
10. Pricing validity and capability do not mean supplier availability or confirmation.
11. Agency markup is separate from supplier tariff/tax and must be applied once in the selling decision.
12. Test Rate is a calculator, not transaction creation.
13. Accepted tariff/input/result values are snapshotted downstream; later edits must not silently rewrite accepted arrangements.
14. Booking amendments update the difference; Finance receives one resulting confirmed obligation.
15. Activities service pricing and Activity history are different concepts.
16. Staff must be able to trace an amount back to supplier, service, exact card/version, scope and conditions.
17. Preserve empty, unpriced, unsupported, and unresolved states rather than borrowing another vendor's example values.
18. Before changing a workflow, distinguish implemented local behavior, persisted browser behavior, and intended backend/product behavior from section 31.

## 34. Source map

The links below point to the current implementation. They are included for the next collaborator; the user-facing flows above do not depend on knowing React.

| Area | Primary sources |
|---|---|
| Module entry/navigation/context | [src/VendorModule.tsx](../../../src/VendorModule.tsx), [src/modules/vendors/App.tsx](../../../src/modules/vendors/App.tsx), [routing.ts](../../../src/modules/vendors/routing.ts), [pageNavigation.ts](../../../src/modules/vendors/pageNavigation.ts) |
| Vendor identity/create/edit/permissions | [data/vendors.ts](../../../src/modules/vendors/data/vendors.ts), [vendorApi.ts](../../../src/modules/vendors/vendorApi.ts), [permissions.ts](../../../src/modules/vendors/permissions.ts), [components/NewVendorPage.tsx](../../../src/modules/vendors/components/NewVendorPage.tsx), [VendorFormModal.tsx](../../../src/modules/vendors/components/VendorFormModal.tsx) |
| Directories and service relationships | [components/VendorsListPage.tsx](../../../src/modules/vendors/components/VendorsListPage.tsx), [data/vendorDirectory.ts](../../../src/modules/vendors/data/vendorDirectory.ts), [data/services.ts](../../../src/modules/vendors/data/services.ts), [data/serviceRateCards.ts](../../../src/modules/vendors/data/serviceRateCards.ts) |
| Vendor detail/Overview | [components/VendorRateCardsPage.tsx](../../../src/modules/vendors/components/VendorRateCardsPage.tsx), [VendorOverview.tsx](../../../src/modules/vendors/components/VendorOverview.tsx), [VendorSetupChecklist.tsx](../../../src/modules/vendors/components/VendorSetupChecklist.tsx), [data/vendorOverview.ts](../../../src/modules/vendors/data/vendorOverview.ts) |
| Service create/detail/media | [components/NewServicePage.tsx](../../../src/modules/vendors/components/NewServicePage.tsx), [ServicesPanel.tsx](../../../src/modules/vendors/components/ServicesPanel.tsx) |
| Service tariff discovery | [components/ServiceRateCardsPanel.tsx](../../../src/modules/vendors/components/ServiceRateCardsPanel.tsx), [ServiceRateCardTable.tsx](../../../src/modules/vendors/components/ServiceRateCardTable.tsx) |
| Vehicles | [components/VehicleOfferingsPanel.tsx](../../../src/modules/vendors/components/VehicleOfferingsPanel.tsx), [data/vehicleOfferings.ts](../../../src/modules/vendors/data/vehicleOfferings.ts) |
| Card registry/create/detail/markup | [rateCard/cards.ts](../../../src/modules/vendors/rateCard/cards.ts), [types.ts](../../../src/modules/vendors/rateCard/types.ts), [components/CreateRateCardModal.tsx](../../../src/modules/vendors/components/CreateRateCardModal.tsx), [components/rateCard/RateCardDetailPage.tsx](../../../src/modules/vendors/components/rateCard/RateCardDetailPage.tsx) |
| Accommodation calculation | [rateCard/engine.ts](../../../src/modules/vendors/rateCard/engine.ts), [components/rateCard/SeasonEditorModal.tsx](../../../src/modules/vendors/components/rateCard/SeasonEditorModal.tsx) |
| Service-level demo test | [components/ServiceTestRate.tsx](../../../src/modules/vendors/components/ServiceTestRate.tsx) |
| Focused transport | [rateCard/privateTransport.ts](../../../src/modules/vendors/rateCard/privateTransport.ts), [transportOptions.ts](../../../src/modules/vendors/rateCard/transportOptions.ts), [supplierTax.ts](../../../src/modules/vendors/rateCard/supplierTax.ts), [components/PrivateTransportWorkspace.tsx](../../../src/modules/vendors/components/PrivateTransportWorkspace.tsx), [data/privateTransportFixtures.ts](../../../src/modules/vendors/data/privateTransportFixtures.ts) |
| Legacy transport | [rateCard/transportQuote.ts](../../../src/modules/vendors/rateCard/transportQuote.ts), [regionalTransportQuote.ts](../../../src/modules/vendors/rateCard/regionalTransportQuote.ts), [components/TransportRateWorkspace.tsx](../../../src/modules/vendors/components/TransportRateWorkspace.tsx), [RegionalTransportWorkspace.tsx](../../../src/modules/vendors/components/RegionalTransportWorkspace.tsx) |
| Activity tariff | [rateCard/activityPricing.ts](../../../src/modules/vendors/rateCard/activityPricing.ts), [components/ActivityRateWorkspace.tsx](../../../src/modules/vendors/components/ActivityRateWorkspace.tsx), [data/activityRateFixtures.ts](../../../src/modules/vendors/data/activityRateFixtures.ts) |
| Supplier-owned example cards | [data/supplierRateFixtures.ts](../../../src/modules/vendors/data/supplierRateFixtures.ts), [data/rateCards.ts](../../../src/modules/vendors/data/rateCards.ts) |
| Policies | [components/ServicePolicies.tsx](../../../src/modules/vendors/components/ServicePolicies.tsx), [components/rateCard/PoliciesPanel.tsx](../../../src/modules/vendors/components/rateCard/PoliciesPanel.tsx) |
| Packages | [components/PackagesPanel.tsx](../../../src/modules/vendors/components/PackagesPanel.tsx), [PackageDetailPage.tsx](../../../src/modules/vendors/components/PackageDetailPage.tsx), [data/packages.ts](../../../src/modules/vendors/data/packages.ts) |
| Bookings | [components/VendorBookingsPanel.tsx](../../../src/modules/vendors/components/VendorBookingsPanel.tsx), [BookingViewModal.tsx](../../../src/modules/vendors/components/BookingViewModal.tsx) |
| Finance and Docs | [components/VendorFinancePanel.tsx](../../../src/modules/vendors/components/VendorFinancePanel.tsx), [VendorDocsPanel.tsx](../../../src/modules/vendors/components/VendorDocsPanel.tsx), [data/vendorFinance.ts](../../../src/modules/vendors/data/vendorFinance.ts) |
| Tasks and email | [components/TasksPanel.tsx](../../../src/modules/vendors/components/TasksPanel.tsx), [CommunicationPanel.tsx](../../../src/modules/vendors/components/CommunicationPanel.tsx), [data/tasks.ts](../../../src/modules/vendors/data/tasks.ts) |
| Event history | [components/ActivityPanel.tsx](../../../src/modules/vendors/components/ActivityPanel.tsx), [VendorActivityPanel.tsx](../../../src/modules/vendors/components/VendorActivityPanel.tsx), [RecentActivityTimeline.tsx](../../../src/modules/vendors/components/RecentActivityTimeline.tsx), [activityFromEvents.ts](../../../src/modules/vendors/components/activityFromEvents.ts) |
| Search/import/notes | [components/UniversalSearch.tsx](../../../src/modules/vendors/components/UniversalSearch.tsx), [AnchoredImport.tsx](../../../src/modules/vendors/components/AnchoredImport.tsx), [NotesPanel.tsx](../../../src/modules/vendors/components/NotesPanel.tsx); root workspace notes integration |
| Downstream boundaries only | [src/PrivateTransportProposalCosting.tsx](../../../src/PrivateTransportProposalCosting.tsx), [bookingTransportHandoff.ts](../../../src/bookingTransportHandoff.ts), [bookingActivityHandoff.ts](../../../src/bookingActivityHandoff.ts), [TransportBookingHandoffPanel.tsx](../../../src/TransportBookingHandoffPanel.tsx), [SupplierTaxProfilesPanel.tsx](../../../src/SupplierTaxProfilesPanel.tsx) |

### Short context to carry into the next agenda

Paryatech Vendor CRM manages agency suppliers, their offerings, and vendor-owned tariffs. Vendors and Services are alternate discovery routes into the same records. Vendor detail has Overview, Services, Rate Cards, Packages, Bookings, Finance, Docs, Tasks, Communications, Activity. Service detail has Overview, Vendors, Rate Cards, Test Rate, Policies. Service Rate Cards prioritizes the tariff and shows its vendor; opening it goes to that exact supplier card. Transport uses reusable vendor/service Vehicle Offerings and four separate pricing templates. Activity service options are shared capabilities with supplier-specific person/group/unit tariffs. Accommodation remains the established matrix-based rate-card reference. Test Rate verifies a scope without creating transactions. Markup is separate agency metadata at the bottom of each relevant card. Proposal owns customer needs/selling, Booking owns accepted snapshots/confirmation/amendments, Finance owns resulting obligations. Current screens mix fixtures, local state, and browser persistence; use section 31 before assuming production connectivity. Subsequent UX work should preserve these ownership and operational boundaries.


---

# Complete rate-card examples and persona context (2 October)

Current dated observations above take precedence.

# Paryatech Vendor CRM rate card logic examples and test context

Reviewed on 2 October 2026 against the main repository working copy.

This handoff gives the next agent the supplier records, commercial rules, worked examples, and operational test requirements needed to continue Vendor CRM work. Use it with the [complete Vendor module flow context](vendor-module-ux-operational-context.md). It expands the pricing context so an agent can reuse the existing examples instead of creating another set of dummy vendors, services, or rate cards.

The agreed model and the implemented model are identified separately throughout this document. A successful calculation test does not establish that every screen, customer approval, booking, payment, and financial ledger is connected. Current limitations are part of the context and must remain visible to the next agent.

All supplier amounts below are illustrative application fixtures or explicitly labelled calculation scenarios. They are not market rates, genuine supplier contracts, or tax advice. No new supplier records were created to prepare this document.

## Contents

- [Start here](#start-here)
- [Ownership and operational responsibilities](#ownership-and-operational-responsibilities)
- [Vendor and service flows](#vendor-and-service-flows)
- [Supported service types and tariff families](#supported-service-types-and-tariff-families)
- [Existing accommodation suppliers and cards](#existing-accommodation-suppliers-and-cards)
- [Accommodation numerical reference](#accommodation-numerical-reference)
- [Accommodation worked tests](#accommodation-worked-tests)
- [Existing transport suppliers services and cards](#existing-transport-suppliers-services-and-cards)
- [Reusable vehicle offerings](#reusable-vehicle-offerings)
- [Four transport tariff sheets](#four-transport-tariff-sheets)
- [Transport charges tax and markup](#transport-charges-tax-and-markup)
- [Transport Test Rate flow](#transport-test-rate-flow)
- [All eighteen transport personas](#all-eighteen-transport-personas)
- [Existing activity suppliers services and cards](#existing-activity-suppliers-services-and-cards)
- [Activity calculations and operational tests](#activity-calculations-and-operational-tests)
- [Visa flights and ground services](#visa-flights-and-ground-services)
- [Accepted costing Booking and Finance](#accepted-costing-booking-and-finance)
- [Data fields and boundaries](#data-fields-and-boundaries)
- [Evidence and remaining implementation gaps](#evidence-and-remaining-implementation-gaps)
- [Regression checklist for the next agent](#regression-checklist-for-the-next-agent)
- [Source map](#source-map)
- [Copyable context for the next agent](#copyable-context-for-the-next-agent)

## Start here

The employee needs to understand a supplier tariff, apply it to a real requirement, and keep the resulting supplier cost consistent through Proposal, Booking, and Finance.

The primary reference for the rate-card interaction is **Accommodation tariff · 2026–27**, ID `rc-acc-2627`. Reuse its record header, read/edit structure, numerical sheets, Test Rate, Policies, Activity, and bottom Markup. Its room and season calculations belong to accommodation; transport and activities need their own commercial formulas inside that approved experience.

Use existing focused transport records with `privateTransport`, and activity records with `activityTariff`. The old airport and regional transport workbooks remain in source but are historical examples. Do not use them as the specification for new transport behavior.

The current focused transport and activity seed cards are **Draft**, with supplier confirmation and tax configuration unresolved. They are available for illustration. An approved operational result requires the relevant source, tariff, tax, scope, and lifecycle conditions to be resolved. Do not mark illustrative cards Active to hide a blocker.

## Ownership and operational responsibilities

| Record | What it owns | Operational example |
|---|---|---|
| Vendor | Supplier identity, roles, contacts, base, coverage, bank/compliance references | CityRide Transfers is a business; Transport is one role |
| Service | Discoverable offering, location, capability and service options | Munnar Ridge Trek describes the experience; Kochi fixed transfers describes the transport offering |
| Vendor service connection | Which supplier offers or distributes the service | Three vendors offer Munnar Ridge Trek, with different tariffs |
| Vehicle Offering | Vendor/service vehicle, model or equivalent, seats excluding driver, luggage, AC, attributes | `city-van` has 12 customer seats and confirmed luggage allowances |
| Rate card | One vendor's supplier prices and applicable contract rules | CityRide's MUV transfer to Munnar costs ₹5,500; Trailmakers' costs ₹5,200 |
| Test Rate | Temporary requirement and calculation | Six travellers at 23:45, selected vehicle, route, and charges |
| Agency markup default | Selling-price preference stored with outer rate-card metadata | A 15% default does not increase supplier payable |
| Proposal | Customer requirements, selected supply, calculated supplier cost, agency selling decision and customer terms | Two arrivals are two requirements even if they use one tariff |
| Booking | Accepted commercial snapshot, supplier confirmation, actuals and amendments | A trip sheet changes 750 quoted km to 900 actual km |
| Finance | Confirmed obligations, invoices, receipts, payments and reconciliation | One current supplier obligation per confirmed hire |
| Shared tax configuration | Approved supplier/customer tax treatment and credit eligibility | Tax profile resolves a rate; the transport sheet does not invent GST |

Relationship:

```text
Vendor → offered service → reusable vehicle or activity options → vendor-owned tariff

Services browsing → service → supplying vendors and their tariffs
                  → exact existing vendor-owned rate-card ID

Customer requirement → suitable supply → applicable vendor tariff
                     → supplier commercial amount → supplier tax → supplier payable
                     → agency cost basis → selling decision → customer price and tax
```

A rate card has one supplier owner. Multiple discovery links to that same owner's card are valid. A different supplier needs its own contract record even when the property, route, activity, or brand is the same. Tariff data must not be copied merely because the user entered through Services.

## Vendor and service flows

### Vendors directory and supplier creation

Vendors directory → Add vendor → business/name, service roles, base and regions served, primary contact, internal owner and applicable commercial/document references → create Draft vendor → add or link services → add capability and tariffs → resolve readiness.

One supplier can have several roles and many offerings. Trailmakers is the existing example: it has several focused transport services and activity offerings. Do not introduce a hardcoded vendor category such as fixed-transfer vendor or outstation vendor. Those distinctions describe offerings and tariff templates.

Vendor detail contains Overview, Services, Rate Cards, Packages, Bookings, Finance, Docs, Tasks, Communications, and Activity. Overview describes the relationship. Services describes capability. Rate Cards describes supplier charging. The remaining tabs provide contextual operational follow-up.

### Services directory and service creation

Services directory → Add service → required providing vendor → service type/name/ID/base → category-specific capability → save → service detail. Vendor selection is necessary; a newly created service must not become an orphan supplier identity.

For an existing property or experience, link an additional supplier to the existing service when appropriate. That supplier then adds its own rate card. Creating a duplicate activity or property solely to attach another supplier is unnecessary.

Service detail tabs are **Overview, Vendors, Rate Cards, Test Rate, Policies**. Overview contains capability/media. Vendors lists supplying partners. Rate Cards lists tariffs first, with the owning vendor beside each one. Clicking a rate card must open that exact card under its vendor, rather than the vendor's entire rate-card list.

From service Rate Cards, select a supplying vendor before Add rate card when there is more than one possible supplier. Creation keeps the service context and vendor ownership. The existing callback passes both `vendorId` and `rateCardId` for direct navigation.

### Vehicle capability flow

Transport service Overview → Vehicle Offerings → Add vehicle → category, label/model or equivalent, passenger seats excluding driver, medium/large/cabin bags, combined luggage allowance, AC and relevant attributes → save → select that offering in applicable transport cards.

A vehicle can reference several transport services of the same supplier. Adding a vehicle creates capability; it does not create a price, inventory hold, booking, or confirmation. Missing capacity must remain unresolved. Capacity changes require review of draft customer arrangements, while accepted bookings keep their snapshot.

### Tariff creation and editing

Vendor Rate Cards → New rate card → relevant offered service → correct enabled template → Draft → enter supplier numerical prices, scope, conditions and tax reference → Test Rate → confirm supplier provenance and resolve validation → applicable approval state.

Transport uses Draft → Review → Active. Activity uses its own saved versions and activation checks. Accommodation still uses Published/Draft/Expired. Preserve these current distinctions when describing behavior; there is no fully unified approval implementation yet.

Changing an Active transport tariff returns it to Draft and clears supplier confirmation. Activity edits use a draft and save validated versions. Accommodation and transport fields currently persist through update handlers as they change, so the top Save action is not a universal transaction rollback boundary.

Test Rate creates no Proposal, Booking, supplier confirmation, invoice, or payment. Download exports the tariff; it does not issue a voucher or contract.

## Supported service types and tariff families

| Service type | Supplier charging model | Present examples | Current support |
|---|---|---|---|
| Accommodation | Room × meal plan × dated price set, plus relevant guest charges and supplements | Example Lake Resort and Hill Retreat | Established numerical matrix and card-specific quote engine |
| Transport | Exactly one of Fixed Transfer, Local Package, Outstation Per Km, Daily Hire per focused card | CityRide, Kochi Local Cabs, Kerala Road Trips, South Coast Coaches, Trailmakers | Focused private chauffeured transport engine |
| Activities | Enabled person, booking/group, or unit pricing against service options | Trek, kayak, plantation, cruise, class, safari, admission | Dedicated activity engine and versions |
| Visa | Supplier fee components per eligible application/product | Atlas UAE tourist products | Enabled template; generic arrays and quote engine are not a complete visa calculator |
| Flights | Supplier ticketing/handling fees and sourced live fare where appropriate | Kerala Flight Ticketing; Bali flight coordination | Service references exist; Flight tariff template disabled |
| DMC or ground handling | Contracted scope or sourced package/handling quotation | Bali ground coordination; DMC supply links | Vendor service type exists; no complete focused tariff engine |
| Trip and Cruise templates | Contracted itinerary/person or cabin/sailing pricing | Template descriptions | Disabled; no active numerical example to invent |

An **activity cruise** such as Alleppey Sunset Cruise is an experience with person/group fares. It does not imply the disabled cabin-based Cruise template is implemented. Shared experiences are allowed in Activities; shared seats or public buses are outside the private transport model.

## Existing accommodation suppliers and cards

Use these existing IDs rather than create replacement sample records.

| Vendor | Service or property in the card | Existing card ID and name | Seed state |
|---|---|---|---|
| Example Hospitality `exhosp` | Example Lake Resort | `rc-acc-2627` Accommodation tariff · 2026–27 | Published numerical reference |
| Example Hospitality | Example Lake Resort | `rc-acc-2526` Accommodation tariff · 2025–26 | Expired historical tariff |
| Example Hospitality | Example Hill Retreat | `rc-hill-2627` Hill Retreat tariff · 2026–27 | Draft with unresolved prices/rules |
| Wanderlust Trails `wanderlust` | Taj Exotica Resort & Spa | `rc-taj-goa-wanderlust` Taj Goa contracted rates | Draft, supplier prices pending |
| Coastal Stay Properties `coastal` | Taj Exotica Resort & Spa | `rc-taj-goa-coastal` Winter FIT tariff | Draft, supplier prices pending |
| Kerala Heritage Hotels `kerala-heritage` | Taj Lake Palace | `rc-palace-heritage` Palace stay tariff 2026–27 | Draft, supplier prices pending |
| Horizon DMC Partners `horizon` | Taj Lake Palace | `rc-palace-horizon` Rajasthan DMC rates | Draft, supplier prices pending |
| Coastal Stay Properties | Taj Bekal Resort & Spa | `rc-bekal-coastal` Bekal direct tariff | Draft, supplier prices pending |
| Wanderlust Trails | Taj Bekal Resort & Spa | `rc-bekal-wanderlust` Bekal contracted rates | Draft, supplier prices pending |
| Horizon DMC Partners | Taj Bekal Resort & Spa | `rc-bekal-horizon` Seasonal hotel allotment | Draft, supplier prices pending |
| Wanderlust Trails | Example Lake Resort | `rc-lake-wanderlust` Backwater stay rates | Draft, supplier prices pending |
| Horizon DMC Partners | Example Hill Retreat | `rc-hill-horizon` Munnar winter rates | Draft, supplier prices pending |

**Existing fixture inconsistency:** `rc-acc-2627` describes Example Lake Resort, but legacy connections also attach it to Taj Exotica. Some legacy service links still point unrelated properties or categories at old cards. Treat the numerical card's actual property as the calculation reference. Do not infer that the same room tariff is a real Taj contract. Eight supplier-specific draft records have replaced some reused links, but the legacy data is not completely normalized.

Directory IDs include `example-lake`, `example-hill`, `taj-exotica`, `taj-lake-palace`, and `taj-bekal`. Older profile IDs use forms such as `svc-lake` and `svc-taj-exotica`. These are references in different structures; do not blindly add or remove an `svc-` prefix to find a tariff.

## Accommodation numerical reference

**Supplier:** Example Hospitality. **Property:** Example Lake Resort. **Card:** `rc-acc-2627`. **Currency:** INR. **Header validity:** 1 April 2026 to 31 March 2027. **Tax label:** included. **Markup default:** 15%, separate from supplier costs.

Price sets:

| Set | Dates |
|---|---|
| Low | 15 April to 30 September 2026 |
| Shoulder | 1 October to 19 December 2026 |
| Peak | 20 December 2026 to 14 April 2027 |

The Peak range extends beyond header validity. A production eligibility check must honor both the card validity and nightly rate coverage; the current generic engine does not fully reconcile these limits.

Each matrix amount below is **per room per night**, with base occupancy, for Low / Shoulder / Peak respectively.

| Room | Base and maximum occupancy | EP room only | CP breakfast | MAP breakfast and one meal | AP all meals |
|---|---|---|---|---|---|
| Garden View | 2 / 3, maximum 1 extra bed | ₹5,200 / ₹6,400 / ₹8,600 | ₹6,000 / ₹7,200 / ₹9,400 | ₹7,100 / ₹8,300 / ₹10,500 | ₹8,400 / ₹9,600 / ₹11,800 |
| Lake View | 2 / 3, maximum 1 extra bed | ₹6,800 / ₹8,200 / ₹11,000 | ₹7,600 / ₹9,000 / ₹11,800 | ₹8,700 / ₹10,100 / ₹12,900 | ₹10,000 / ₹11,400 / ₹14,200 |
| Lake View Suite | 2 / 4, maximum 1 extra bed | ₹11,500 / ₹13,800 / ₹18,400 | ₹12,300 / ₹14,600 / ₹19,200 | ₹13,400 / ₹15,700 / ₹20,300 | ₹14,700 / ₹17,000 / ₹21,600 |

Weekend additions are per room per Saturday/Sunday night. Garden: ₹900 / ₹1,100 / ₹1,600; Lake: ₹1,200 / ₹1,500 / ₹2,100; Suite: ₹1,800 / ₹2,200 / ₹3,200. They are additions to the relevant nightly base, not a replacement fare.

Guest charges on each of these rooms:

| Guest rule | Condition | Amount per guest per night |
|---|---|---|
| Extra adult | Age 12+, extra bed | ₹2,400 |
| Child | Age 6–11, extra bed | ₹1,600 |
| Child | Age 6–11, no extra bed | ₹900 |
| Child | Age 2–5, existing bed | Confirmed ₹0 |
| Infant | Age 0–1, cot | Confirmed ₹0 |

One guest must not receive both the child charge and extra-adult charge. A free child still counts toward occupancy. Room/bed limits remain capacity checks regardless of the monetary amount.

Other supplier terms: festive minimum three nights; 25 December 2026 hard blackout; Christmas Eve gala ₹3,500 per adult on 24 December; New Year gala ₹4,500 per adult on 31 December. Check-out night is not charged. Optional pickup/drop costs ₹2,200 per vehicle each; laundry is unpriced. These optional services are not automatically part of a room quote.

Cancellation reference: free at least 30 days before check-in, 25% at 15–29 days, 50% at 7–14 days, 100% under seven days. This is supplier reference text, not an implemented refund transaction. Deposit is 50% at confirmation, balance 21 days before arrival; inside 21 days, full payment at confirmation.

## Accommodation worked tests

The first six calculations below were checked directly against the current accommodation engine without changing repository data. The boundary calculation substituted the check-in date in memory because the current card Test Rate uses a sample date list.

| Case | Trip inputs | Expected supplier calculation | Current result or boundary |
|---|---|---|---|
| Family on normal nights | 12 October, 3 nights, Garden CP, 1 room, 2 adults, child age 8 without bed | 3 × ₹7,200 + 3 × ₹900 | ₹24,300 |
| Weekend night | 20 September, 2 nights, Garden CP, 2 adults | Sunday ₹6,000 + ₹900; Monday ₹6,000 | ₹12,900 |
| Extra adult | 12 October, 3 nights, Garden CP, 3 adults | 3 × ₹7,200 + 3 × ₹2,400 | ₹28,800 |
| New Year gala | 31 December, 3 nights, Garden CP, 2 adults | ₹9,400 + ₹9,400 + ₹11,000 + 2 × ₹4,500 | ₹38,800, tax already included |
| Blackout | 24 December, 3 nights | Stay includes 25 December | Refused, total unresolved |
| Excess occupancy | 12 October, 1 Garden room, 4 adults | Capacity 3 exceeded | Refused; add/change room arrangement |
| Season boundary | 19 December, 3 nights, Garden CP, 2 adults | Shoulder Saturday ₹8,300 + Peak Sunday ₹11,000 + Peak Monday ₹9,400 | ₹28,700; each night uses its own set |
| Festive short stay | 22 December, 2 nights | Three-night minimum not met | Must refuse rather than charge a third fictitious night |
| Unknown child price | Hill Retreat, child age 8 without bed | Applicable child row is null | Must refuse; null is not complimentary |
| Missing Winter rate | Hill Retreat, genuine uncovered winter date | No released winter tariff | Must refuse; sample date fallback is a current risk |
| Unmatched age or bed rule | Party input has no applicable guest rule | Obtain supplier terms or correctly classify guest | Current engine can skip unmatched children; this remains a gap |
| Optional hotel transfer | Family also needs airport pickup | Room amount plus one separately selected vehicle transfer | Do not automatically add a listed optional service or duplicate Proposal transport |

The reference demonstrates the approved worksheet experience. It does not prove a complete room allocation, tax, eligibility, or availability engine. Current generic `runQuote` has fixture-specific blackout/minimum/supplement handling, sample-calendar fallback, and incomplete enforcement of guest rule limits and per-room bed allocation. Reuse the experience without copying these shortcuts into a new tariff family.

## Existing transport suppliers services and cards

These are the ten **current focused private transport** fixture cards. Validity is 1 October 2026 to 31 March 2027; currency INR. Seed status is Draft, source unconfirmed, illustrative true, supplier tax mode Inclusive, tax profile unresolved.

| Vendor and ID | Service and directory ID | Existing card and ID | Template |
|---|---|---|---|
| CityRide Transfers `cityride` | Kochi fixed transfers `cityride-fixed` | Kochi airport and intercity transfers `rc-cityride-fixed` | Fixed Transfer |
| Kochi Local Cabs `kochi-local-cabs` | Kochi local sightseeing `kochi-local-duty` | Kochi local duty packages `rc-local-cabs` | Local Package |
| Jaipur Local Cabs `jaipur-local-cabs` | Jaipur local sightseeing `jaipur-local-duty` | Jaipur local sightseeing tariff `rc-jaipur-local` | Local Package |
| Bengaluru City Rides `bengaluru-city-rides` | Bengaluru local sightseeing `bengaluru-local-duty` | Bengaluru local sightseeing tariff `rc-bengaluru-local` | Local Package |
| Kerala Road Trips `kerala-road-trips` | Kerala outstation transport `kerala-road-hire` | Kerala outstation kilometre tariff `rc-road-trips` | Outstation Per Km |
| South Coast Coaches `south-coast-coaches` | Van and coach daily hire `south-coast-daily` | South India coach day hire `rc-south-coast` | Daily Hire |
| Trailmakers Experiences `trailmakers` | Kochi fixed transfers `trail-fixed` | Kochi fixed-transfer tariff `rc-trail-fixed` | Fixed Transfer |
| Trailmakers Experiences | Kochi local sightseeing `trail-local` | Kochi local-package tariff `rc-trail-local` | Local Package |
| Trailmakers Experiences | Kerala outstation transport `trail-outstation` | Kerala outstation per-km tariff `rc-trail-km` | Outstation Per Km |
| Trailmakers Experiences | Kerala daily vehicle hire `trail-daily` | Kerala daily-hire tariff `rc-trail-daily` | Daily Hire |

Kochi and Kerala cards cover their stored areas, including Fort Kochi, Munnar, Thekkady and Alleppey where configured. Jaipur and Bengaluru cards cover their own cities. South Coast's stored coverage includes Kochi, Bengaluru, Mysuru and Coorg. A vendor's marketing region does not establish a tariff for every place in that region.

**Historical source records:** `rc-air-2026` Airport transfer rates · 2026, `rc-kerala-private-hire` Kerala private hire rates, `rc-kochi-local-transfers` Kochi airport and local transfers, and `rc-kerala-km-tariff` Kerala outstation kilometre tariff. These use the older `transport`/`regionalTransport` structures. The last name resembles the focused Kerala Road Trips card; distinguish by ID and payload. Whole-trip and accommodation-style seasons in these older structures are not part of the finalized four-template private model.

## Reusable vehicle offerings

These allowances are fixture data, not universal limits for each vehicle category. Passenger seats exclude the driver. Children and accompanying staff need seats.

| Fixture vehicle | Customer seats | Medium bags | Large bags | Cabin bags | Combined bag units | AC |
|---|---:|---:|---:|---:|---:|---|
| Sedan | 3 | 2 | 2 | 2 | 5 | Yes |
| MUV | 6 | 3 | 4 | 3 | 10 | Yes |
| 12-seat Van | 12 | 10 | 8 | 10 | 25 | Yes |
| CityRide or South Coast Coach | 35 | 30 | 25 | 30 | 60 | Yes |
| Kochi Local, Kerala Road Trips or Trailmakers Coach | 27 | 20 | 25 | 30 | 60 | Yes |

Current combined luggage calculation uses medium = 1 unit, large = 2, cabin = 0.5. Check each category allowance **and** the combined total. These conversion weights are implementation assumptions; they do not replace an operator's confirmation of real luggage volume.

Vehicle IDs:

| Vendor | Existing IDs |
|---|---|
| CityRide | `city-sedan`, `city-muv`, `city-van`, `city-coach` |
| Kochi Local Cabs | `local-sedan`, `local-muv`, `local-van`, `local-coach` |
| Jaipur Local Cabs | `jaipur-muv` |
| Bengaluru City Rides | `bengaluru-muv` |
| Kerala Road Trips | `road-sedan`, `road-muv`, `road-van`, `road-coach` |
| South Coast Coaches | `coast-van`, `coast-coach` |
| Trailmakers | `trail-sedan`, `trail-muv`, `trail-van`, `trail-coach`, reusable across its four transport services |

Ten people and ten bags cannot be placed in one fixture Sedan. The employee can select a suitable Van, a Coach, or a valid combination. For identical vehicles, the required quantity is the highest of the seat, each bag category, and combined luggage requirements, rounded upward. Mixed vehicles sum the relevant allowances but still require staff to confirm a workable distribution and availability.

Vehicle suggestions are bounded: identical fleets up to eight vehicles; combinations of two types up to four of each; at most 24 suggestions. The comparison helper currently retains one lowest commercial-cost arrangement per card. Staff selection remains necessary; this is not unrestricted fleet optimization or a guarantee of operational preference.

## Four transport tariff sheets

### Fixed Transfer

Used for one defined, directed private transfer. Intercity geography alone does not turn a fixed fare into an outstation kilometre calculation.

CityRide `rc-cityride-fixed`:

| Route and ID | Sedan | MUV | Van | Coach |
|---|---:|---:|---:|---:|
| Kochi Airport → Kochi Hotel `route-1` | ₹1,500 | ₹2,000 | ₹3,500 | ₹7,000 |
| Kochi Airport → Munnar `route-2` | ₹4,500 | ₹5,500 | ₹8,500 | ₹14,000 |
| Munnar → Thekkady `route-3` | ₹3,500 | ₹4,500 | ₹7,000 | ₹12,000 |
| Kochi Airport → Fort Kochi hotel `route-fort-kochi` | ₹1,800 | ₹2,400 | ₹4,000 | ₹7,500 |
| Kochi Airport → Kochi Resort `route-resort` | ₹2,200 | ₹2,900 | ₹4,800 | ₹8,000 |
| Kochi Hotel → Kochi Airport `route-return` | ₹1,500 | ₹2,000 | ₹3,500 | ₹7,000 |

Trailmakers `rc-trail-fixed` uses the same fixture table except Airport → Munnar MUV is **₹5,200**. Supplier ownership makes this a separate tariff, not an override of CityRide's record.

```text
Base supplier amount = sum(each selected vehicle's route price × quantity)
Known commercial amount = base + applicable fixed extras
```

No passenger multiplier and no kilometre multiplier on the base fare. Reverse direction needs its own row; equal numeric prices do not establish permission to reverse another route. A separately contracted extra-distance or waiting condition can add an excess charge without converting the base into per-km hire.

### Local Package

Kochi Local Cabs and Trailmakers local cards use:

| Vehicle | 4 hr / 40 km | 8 hr / 80 km | 12 hr / 120 km | Extra km | Extra hour |
|---|---:|---:|---:|---:|---:|
| Sedan | ₹1,800 | ₹3,000 | ₹4,200 | ₹20 | ₹300 |
| MUV | ₹2,500 | ₹4,200 | ₹6,000 | ₹25 | ₹400 |
| Van | ₹4,000 | ₹6,500 | ₹8,500 | ₹30 | ₹500 |
| Coach | ₹7,000 | ₹11,000 | ₹15,000 | ₹50 | ₹800 |

The UI uses a package matrix and a separate excess table; they are combined here only to make the handoff compact. Jaipur and Bengaluru have the MUV row. Package IDs are `half`, `full`, `extended`; staff can define additional packages with name, hours, and kilometres.

```text
Extra km = max(0, planned km − package km)
Extra hours = max(0, planned hours − package hours)
Amount per vehicle = package price + supplier-defined excess calculation
```

Supplier excess method can be both, higher amount, km only, or hours only. Under both, 100 km/9 hours on a Sedan 8/80 package costs ₹3,000 + 20 × ₹20 + 1 × ₹300 = **₹3,700**. Under higher amount it costs ₹3,400. Do not apply an unrelated outstation tariff on top.

The package recommendation evaluates package plus excess amount and sorts alternatives. Staff still chooses the applicable contract package. Unused allowance is not a refund or credit unless separately contracted.

### Outstation Per Km

Kerala Road Trips and Trailmakers outstation cards use:

| Vehicle | Rate per km | Minimum km per day | Driver per day |
|---|---:|---:|---:|
| Sedan | ₹14 | 250 | ₹400 |
| MUV | ₹20 | 250 | ₹500 |
| Van | ₹22 | 250 | ₹500 |
| Coach | ₹45 | 300 | ₹800 |

Stored shared fixture rules: pooled minimum; pickup to final drop; calendar service dates; Asia/Kolkata; garage km 0; empty-return km 0; round billable km upward; fuel included. These are explicit fixture contract inputs, not platform-wide assumptions.

```text
Pooled billable km = max(planned chargeable km + agreed garage/return km,
                        minimum km per day × billable days)

Supplier commercial amount = billable km × rate per km
                           + driver per day × billable days
                           + applicable fixed extras
```

With daily minimum, sum `max(day km, daily minimum)` for each day instead. For 400/150/100 km at 250/day, pooled = 750 km; daily = 900 km. At ₹22/km plus three ₹500 driver days, amounts are **₹18,000** and **₹21,300** respectively. Difference **₹3,300** comes from the agreed minimum rule.

For daily minimum plus garage/return km, the supplier must say whether those distances enter their respective day's minimum or are added after the minima. Daily km must reconcile with the planned trip total. A one-way journey is not automatically doubled.

Calendar billing counts touched service dates; ten October through fourteen October is five days. A 24-hour contract uses elapsed blocks instead. Start/end times and supplier timezone are required; an arbitrary entered day count cannot replace them. Current timezone arithmetic assumes a consistent local offset and is not a full daylight-saving implementation.

### Daily Hire

Trailmakers daily card uses all four rows; South Coast uses Van and Coach:

| Vehicle | Price per day | Included km per day | Included hours per day | Extra km | Extra hour |
|---|---:|---:|---:|---:|---:|
| Sedan | ₹5,000 | 150 | 10 | ₹20 | ₹300 |
| MUV | ₹6,500 | 150 | 10 | ₹25 | ₹400 |
| Van | ₹10,000 | 200 | 10 | ₹30 | ₹500 |
| Coach | ₹16,000 | 200 | 10 | ₹50 | ₹800 |

```text
Base = price per day × billable days × quantity
No carry: excess = sum(each day's excess km and hours at the saved rates)
Carry allowed: compare trip totals with pooled permitted allowance
```

Kilometre carry and hour carry are separate confirmed rules. Without carry, two-day Van usage of 140 km/9 hours then 180 km/12 hours costs ₹20,000 + 2 × ₹500 = **₹21,000**, before unresolved actuals. Pooling the unused first-day hour would incorrectly reduce it to ₹20,500.

Do not add a distance-based base fare to a daily base fare. This template retains the vehicle by day even when another card from the same vendor offers per-km pricing.

## Transport charges tax and markup

### Additional charges

The supplier sheet describes possible costs and their applicability. Current columns identify charge, applies to, treatment, amount, and billing unit; conditional inputs define triggers and scope. Paid by/Collected by should not clutter this supplier price table. Payment responsibility belongs to the accepted arrangement; optional fields still exist internally and need careful downstream handling.

| Treatment | Operational meaning | Numerical behavior |
|---|---|---|
| Included | Already covered by the base price | Add nothing again |
| Fixed | Agreed amount and billing unit | Add when its condition applies |
| Actual | Charge applies, invoice amount unresolved | Known base plus actuals; final payable pending |
| Not applicable | Confirmed exclusion of the charge for this scope | Add nothing |
| Unconfirmed | Applicability or amount is not known | Needs clarification; no fixed total |

Null and confirmed zero differ. An actual permit entered as ₹0 after verification is resolved; leaving its amount empty is not. Missing mandatory treatment or overlapping treatments for the same charge/route/vehicle block a fixed price.

Existing fixed-card charge definitions:

- Night pickup: fixed ₹500 per vehicle, 22:00 inclusive to 06:00 exclusive.
- Toll: Actual on Airport → Munnar and Munnar → Thekkady; Not applicable on the other listed routes.
- Parking: Included on listed arrival airport routes; Not applicable on the intercity and return rows specified by the card.
- Permit: Not applicable on the listed routes.
- Fuel: Included.

Local cards have Toll and Parking Actual, Fuel Included, Permit Not applicable. Outstation cards have Toll, Parking and Permit Actual, Fuel Included. Daily cards have Toll and Parking Actual, Fuel Included, Permit Not applicable.

One per-hire dispatch amount is charged once across a mixed fleet. Per-vehicle night supplements are charged for each applicable vehicle. Driver per day is applied per hired vehicle where the tariff says so. Scope by route and vehicle IDs prevents unrelated charges leaking into another arrangement.

Example contract extension, **calculation scenario only**: one Sedan plus one Van on route-1 costs ₹1,500 + ₹3,500. A dispatch fee ₹300 per hire and Van-only permit ₹250 per hire produce **₹5,550**, not a dispatch fee on both allocation rows. This uses an existing controlled engine test; it is not an extra seeded vendor/card.

Another existing controlled test extends CityRide route-1 with 30 included waiting minutes, ₹200 per started 60-minute excess interval, and 40 included km with ₹20 per extra km. At 45 waiting minutes and 50 km, the Sedan base remains ₹1,500; waiting adds ₹200 and distance adds 10 × ₹20 = ₹200. **Known amount ₹1,900**. This is a specific saved-rule scenario; neither extra is charged on an untouched fixed fare without that supplier rule. Missing interval/allowance terms require clarification.

For billable-day comparison, 12 October 10:00 to 13 October 10:00 counts as **two calendar service dates** under a calendar contract and **one block** under a 24-hour contract. A manual day entry of nine does not override those rules. End before start is invalid.

Date-specific adjustments are implemented in the older regional workbook and in Activity tariffs. The current focused `PrivateTransportTariff` has no equivalent dated-adjustment collection. A holiday transport premium cannot be assumed or generated from an accommodation season; obtain an explicitly applicable supplier tariff/quote. A future scoped adjustment feature would need its own regression checks without returning to the old mega-card.

### Supplier tax

Card setting: Inclusive or Exclusive, plus an approved shared supplier tax profile reference. A profile contains approval source, rate as a decimal, and Finance-approved recoverability. The default browser registry is empty; the existence of an Inclusive label does not resolve a rate or approve the tariff.

**Arithmetic scenario only:** use a hypothetical approved rate of 10% to demonstrate behavior; it is not a legal transport GST rate.

| Supplier quotation | Commercial input | Tax result with whole-rupee rounding | Supplier payable |
|---|---:|---:|---:|
| ₹5,250 Inclusive | ₹5,250 | Included breakdown ₹477, net ₹4,773 | ₹5,250 |
| ₹5,000 Exclusive | ₹5,000 | Additional ₹500 | ₹5,500 |

With approved recoverable supplier tax, the respective agency cost bases are ₹4,773 and ₹5,000. With non-recoverable tax, they are ₹5,250 and ₹5,500. Supplier payable remains distinct from margin cost basis.

Actual invoice charge amounts currently enter the transport actuals calculation as amounts including their own tax. Do not apply the base profile a second time to an invoice amount already entered inclusive. Production approval, statutory treatment, exemptions, and tax credit policy belong to the shared Finance/Tax engine, not a new cab-specific GST algorithm.

### Agency markup

Accommodation, transport and activity cards have a bottom **Markup** default in the current UI. The outer rate-card record holds `markupPercent`; the supplier tariff and supplier engine do not add it to supplier amounts. Transport/activity seeds start at zero; the accommodation reference has 15%.

```text
Supplier cost ₹10,000 with 15% markup → customer selling base ₹11,500
15% gross margin target → ₹10,000 ÷ 0.85 = ₹11,764.71
```

The current control means markup, even when discussion calls it margin. Proposal applies one explicit selling-price decision. If staff supplies a final selling override, do not mark it up again. Do not assume every composer already imports the card default. Customer tax is a separate approved customer-side calculation.

## Transport Test Rate flow

1. Open the **exact focused card** → Test Rate. This fixes the supplier and charging template for the test.
2. Enter service date and local pickup time; retained hire also needs final date/time.
3. For fixed transfer, choose pickup from stored origins and drop from destinations reachable from that origin. The route ID must agree with both places and direction.
4. For local/outstation/daily, specify actual pickup/drop and relevant area. Current coverage checking is text matching; a production route resolver is still a boundary.
5. Enter all travellers, guide/staff seats, medium/large/cabin bags, and AC requirement. Do not silently treat children as seat-free.
6. Inspect suitable arrangements. Choose one or manually add several vehicle types and quantities. The selected offerings must belong to that supplier and service and have a tariff on this card.
7. Enter relevant package, planned km/hours, waiting, or daily usage. Daily breakdown is necessary when minima or non-carry rules depend on each day.
8. Read individual vehicle calculations, base, driver, excess, fixed extras, billable km, unresolved actuals, supplier tax/payable, and blockers.
9. Change a requirement and re-evaluate. A valid numerical illustration still does not reserve availability.

Vendor comparison is a **requirement-level** operation. It compares actual supplier-owned cards. A card's own Test Rate should not silently switch supplier. Keep Fixed Transfer and Per Km alternatives visibly distinct. Unknown distance must prevent a invented per-km alternative. The current comparison helper sorts prices and retains one arrangement per card; it does not make the final supplier decision for staff.

## All eighteen transport personas

### Test conditions and evidence

The source suite `privateTransport.personas.test.mjs` covers all 18 personas at different levels of depth. It clones the existing tariff into a controlled Active, source-confirmed record, injects an approved **zero-rate scenario profile** with recoverability false to isolate fare arithmetic, and supplies suitable vehicle data. Some tests change Actual charges to Included or set scenario rates. These changes exist inside tests and must not be mistaken for the default browser fixtures or genuine tax approval.

Each persona below gives the precise operational acceptance criterion. Where a result includes actuals, the known amount is not an all-inclusive final payable. Scenarios that need changed tariff rates are labelled. A regression report must distinguish engine results, handoff tests, and browser workflows rather than award one blanket Pass.

### Persona 1 Couple airport arrival

Rohan and Ananya: two adults, two large suitcases, two cabin bags; 10 October 2026 13:30; AC; Airport → Fort Kochi hotel. Use CityRide `rc-cityride-fixed`, `route-fort-kochi`, one `city-sedan`.

Seats 2 ≤ 3; large 2 ≤ 2; cabin 2 ≤ 2; combined 2 × 2 + 2 × 0.5 = 5 ≤ 5. Route base **₹1,800**, not ₹3,600. Fuel/parking included and local toll/permit not applicable; no night supplement. Controlled engine payable ₹1,800. Default Draft card can illustrate the amount but must withhold approved payable. More luggage can change the vehicle even when passenger count stays two.

### Persona 2 Family arriving late at night

Four adults plus two children; four large bags and three cabin bags; Airport → Munnar at 23:45. Children make the seating requirement six. Use CityRide, `route-2`, one `city-muv`: six seats, four-large/three-cabin allowance, combined 9.5 ≤ 10.

Base ₹5,500 + night ₹500 = **₹6,000 plus Actual toll**. Driver/fuel already follow the fixed fare; no per-km base. Two suitable Sedans use ₹4,500 × 2 + ₹500 × 2 = **₹10,000 plus applicable toll**, provided the party and luggage can be distributed safely. A Van uses ₹8,500 + ₹500 = ₹9,000 plus toll. Staff chooses an operationally suitable arrangement, with one understandable group quotation downstream.

### Persona 3 Jaipur sightseeing beyond allowance

Five adults, no bags, AC MUV; 09:00–18:00, 95 km. Use Jaipur Local Cabs `rc-jaipur-local`, `jaipur-muv`, package `full`.

₹4,200 + (95 − 80) × ₹25 + (9 − 8) × ₹400 = **₹4,975**. Show 15 excess km and one excess hour separately. Both are allowed by the saved rule. Actual toll/parking remain separate; no outstation fare is added. The stored package chooser recommends this ahead of the more expensive alternatives.

### Persona 4 Bengaluru within package

Four adults; 10:00–17:00, 65 km. Use Bengaluru City Rides `rc-bengaluru-local`, `bengaluru-muv`, `full`.

Base **₹4,200**, excess km/hours ₹0. No unused-allowance credit. Toll/parking Actual remain unresolved unless confirmed. Require included 8 hr/80 km and planned 7 hr/65 km to be understandable in the result.

### Persona 5 Fixed intercity transfer

Six adults and six medium suitcases; Munnar → Thekkady, no retention. Use CityRide `route-3`, one `city-van`, base **₹7,000 plus Actual toll**. One MUV has enough seats but only three medium bags and must be rejected. The route remains Fixed Transfer. Trailmakers' matching fixed card can be a separate supplier alternative; do not copy or share CityRide's contract record.

### Persona 6 Five day Kerala continuous hire

Ten customers plus one tour manager; ten medium bags; 10–14 October; Kochi → Munnar → Thekkady → Kochi Airport; 850 km. Use Kerala Road Trips `rc-road-trips`, `road-van`.

Eleven seats and ten bags fit. Minimum 5 × 250 = 1,250 km exceeds 850. Base 1,250 × ₹22 = ₹27,500; driver 5 × ₹500 = ₹2,500; **known commercial amount ₹30,000 plus Actual toll, parking and permit**. One continuous `transportHireId` appears on several itinerary days but is costed once. The engine arithmetic is tested; complete itinerary links are a separate UI test.

### Persona 7 Distance above minimum

Fourteen adults, fourteen medium bags, four days, 1,350 km. Use Kerala Road Trips' Coach capacity because its Van cannot carry fourteen people/bags. **Scenario tariff override:** rate ₹25/km, minimum 250/day, driver ₹600/day, as supplied in this persona. Those are not the Coach's seed rates.

Minimum 1,000 km; actual planned 1,350 wins. Base ₹33,750 + driver ₹2,400 = **₹36,150 before extras/tax**. The controlled test marks actuals included to isolate payable. With the untouched seed Coach rates, the same usage costs 1,350 × ₹45 + 4 × ₹800 = **₹63,950 plus actuals**. An agent must not change a real tariff merely to match a scenario's expected number.

### Persona 8 Production team daily hire

Seven adults, two days; Bengaluru; Van. Use South Coast `rc-south-coast`, `coast-van`; daily km `[140,180]`, hours `[9,12]`; totals 320 km/21 hours.

Two days × ₹10,000 = ₹20,000. Day 1 has no excess; Day 2 two hours × ₹500 = ₹1,000. **₹21,000 plus Actual toll/parking**. No kilometre excess; no carry of unused first-day hours; no unrelated per-km base.

### Persona 9 Coach for alumni group

Thirty-one adults, twenty-five medium bags, AC; three days Bengaluru → Mysuru → Coorg → Bengaluru. A single `coast-coach` fits 35 seats/30 medium bags. One Van or the 27-seat Coach from another fixture does not.

Use South Coast Daily Hire. With three daily usages each within 200 km/10 hours, illustrative base **3 × ₹16,000 = ₹48,000 plus actuals**. The original persona did not specify usage, so that ₹48,000 is a conditional example, not an asserted exact quotation. If daily usage is absent, Test Rate must request it. If no single vehicle fits, show valid multiple-vehicle options with separate tariffs. The existing persona test verifies capacity suggestions; full three-day quoting needs the additional inputs.

### Persona 10 Wedding group and mixed fleet

Eighteen adults, sixteen large bags; Airport → Resort. Use CityRide `route-resort`.

One Van plus one MUV has 18 seats but only 8 + 4 = **12 large bags** capacity: reject for sixteen large bags. One CityRide Coach fits, base **₹8,000**. Two Vans fit 24 seats/16 large bags, base **2 × ₹4,800 = ₹9,600**. A staff preference cannot override insufficient luggage capacity. With a smaller party's luggage that fits, Van + MUV is permitted and priced as ₹4,800 + ₹2,900, not by 18 passengers.

### Persona 11 Split arrival

Five travellers at 10:00 and three at 18:30; same airport, hotel and date. Two independent Transfer requirements using CityRide `route-1` can select MUV ₹2,000 and Sedan ₹1,500. **Combined known base ₹3,500**, assuming luggage fits each arrangement; the persona supplied no bag counts, so confirm them.

Give the requirements separate IDs and pickup times. Reuse one vendor-owned card. Do not select a single eight-person vehicle merely by aggregating the day. The engine test prices the two inputs; it does not itself build the whole customer trip.

### Persona 12 Several needs in one trip

Four adults; seven days. A coherent example is Day 1 Airport → Kochi Hotel MUV ₹2,000; Day 2 Kochi local MUV full package ₹4,200 within allowance; Day 3 Kochi Hotel → Munnar; Days 4–6 retained MUV Daily Hire ₹19,500 within each daily allowance, ending at Kochi Hotel; Day 7 Kochi Hotel → Airport MUV ₹2,000.

The four known components total **₹27,700 before actuals/tax**. Day 3 Hotel → Munnar is not a stored directed fixed route. The existing Airport → Munnar rate must not be substituted. Obtain a scoped supplier quote or use an eligible per-km alternative with distance and service times. **Calculation-only contract variation:** if the supplier specifically confirms Day 3 at ₹5,200, the five components sum to **₹32,900** before further applicable charges/tax. Without that confirmation the full trip total remains unresolved.

Five requirements can use the appropriate focused cards from the same vendor; Days 4–6 reference one retained hire. The source persona test confirms separate fixed inputs and Trailmakers' four cards; it does not prove this entire itinerary and customer total through every UI step. The unresolved route illustrates a required refusal, not permission to invent a tariff.

### Persona 13 Compare suppliers and methods

Five adults, Airport → Munnar. If luggage fits the MUV, CityRide fixed = ₹5,500 and Trailmakers fixed = ₹5,200, each plus its own applicable toll/terms. Staff can prefer either supplier.

Kerala Road Trips MUV Per Km is a different option. With confirmed 300 chargeable km and one billable day: 300 × ₹20 + ₹500 driver = **₹6,500 plus actuals**. Without chargeable distance/end details, do not invent that alternative. Preserve method/inclusions/approval beside the price. Sorting does not authorize automatic final vendor selection.

### Persona 14 Required charge unresolved

Outstation rate and driver known; Toll/Parking Actual; Permit applicability unconfirmed. Use `rc-road-trips` with the scenario permit treatment Unconfirmed.

Required permit uncertainty blocks a finalized numerical commercial quote; never substitute ₹0. When permit applicability is confirmed Actual, show the known base plus actuals and withhold fixed all-inclusive supplier payable. When an invoice confirms an actual amount, record the amount, source and arrangement responsibility. An explicitly verified ₹0 is allowed.

### Persona 15 Inclusive supplier quotation

Scenario quotation ₹5,250 inclusive, applicable approved profile supplied separately. Supplier payable remains **₹5,250**; do not add tax again. The 10% arithmetic demonstration yields ₹477 included tax and ₹4,773 net; this profile is a test input, not a tax rule. Proposal selling and customer-side tax are independent.

### Persona 16 Exclusive supplier quotation

Scenario quotation ₹5,000 exclusive. Commercial input stays **₹5,000**. With the hypothetical 10% profile, tax ₹500 and payable **₹5,500**. Approved credit treatment decides whether agency cost basis is ₹5,000 or ₹5,500. Unknown profile/recoverability keeps approved payable unresolved.

### Persona 17 Travellers change after costing

Original eight travellers/eight medium bags on CityRide Resort Van: **₹4,800**. Changed requirement fifteen travellers/fifteen bags invalidates the same single Van. Two Vans can fit and have base ₹9,600; staff must choose and reprice.

Draft calculation should flag review. Issued/accepted data must stay snapshotted; create a revision rather than mutate its old price or suitability evidence. The capacity invalidation is tested. Root Proposal revision/history exists but catalogue/proposal records still use session state; durable accepted-history behavior is not proved by this one engine test.

### Persona 18 Actual distance and financial amendment

Three-day Road Trips Van: quoted 750 billable km × ₹22 + 3 × ₹500 = **₹18,000**. Actual 900 km gives ₹19,800 + ₹1,500 = **₹21,300**. Difference **₹3,300**, not a second ₹21,300 charge on top of ₹18,000.

Invoice example adds verified permit ₹0, toll ₹500, parking ₹300: revised payable **₹22,100**; difference from original known ₹18,000 is **₹4,100**. Incomplete actuals must not post an obligation. Record an amendment identifier and reason, then supplier confirmation. Repeating the same amendment ID must not duplicate it. Finance takes the resulting confirmed amount once; customer selling terms remain independently agreed. Dedicated handoff tests cover these behaviors.

## Existing activity suppliers services and cards

Activities describe experiences, tickets, rentals and tours; the Activity tab elsewhere is history. Activity service options are reusable capability records. Vendor-specific prices reference their option IDs.

All 11 activity fixture cards below are Draft, valid 1 October 2026 to 31 March 2027, source unconfirmed, tax Exclusive with profile/rate unresolved. Prices can be inspected, but approved total and proposal acceptance need confirmation and tax resolution.

| Vendor | Service ID | Card ID | Enabled methods and stored supplier rates |
|---|---|---|---|
| Trailmakers Experiences | `munnar-trek` | `rc-act-trek-trail` | Shared person: Adult 12+ ₹1,800, Child 6–11 ₹1,100; private group 1–10 ₹9,800 |
| Summit Adventures `summit` | `munnar-trek` | `rc-act-trek-summit` | Shared Everyone ₹2,100 per person |
| Spice Route Experiences `spice-route` | `munnar-trek` | `rc-act-trek-spice` | Private group 1–8 ₹11,200 |
| Trailmakers Experiences | `backwater-kayak` | `rc-act-kayak-trail` | Guided Everyone ₹1,800/person; rental single ₹2,500 per two-hour session, tandem ₹3,600 per two-hour session |
| Spice Route Experiences | `backwater-kayak` | `rc-act-kayak-spice` | Private group 2–8 ₹9,800; single rental ₹900/hour |
| Example Hospitality | `cardamom-tour` | `rc-act-cardamom-exhosp` | Shared Adult 12+ ₹1,400, Child 6–11 ₹700 |
| Spice Route Experiences | `cardamom-tour` | `rc-act-cardamom-spice` | Shared Everyone ₹1,600/person; private 1–12 ₹8,700/booking |
| Coastal Stay Properties | `sunset-cruise` | `rc-act-cruise-coastal` | Shared Adult 12+ ₹2,200, Child 5–11 ₹1,100, Infant 0–4 complimentary; private 1–6 ₹14,500, 7–12 ₹21,000 |
| Spice Route Experiences | `spice-cooking-class` | `rc-act-class-spice` | Shared Everyone ₹3,200/person; private 1–8 ₹14,500/group |
| Summit Adventures | `periyar-safari` | `rc-act-safari-summit` | Jeep ₹6,800/four-hour session, capacity 6 per unit |
| Kerala Heritage Hotels | `heritage-admission` | `rc-act-admission-heritage` | Adult 13+ ₹600, Child 5–12 ₹300, Infant 0–4 complimentary |

Service option references:

| Service | Options and capability |
|---|---|
| Munnar Ridge Trek | `trek-shared`, half day, morning, capacity 12; `trek-private`, by arrangement, capacity 10 |
| Backwater Kayak | `kayak-guided`, two hours, capacity 12; `kayak-private`, two hours, capacity 8; `kayak-rental`, capacity follows selected units |
| Cardamom Plantation Tour | `cardamom-shared`, three hours, capacity 15; `cardamom-private`, half day, capacity 12 |
| Alleppey Sunset Cruise | `cruise-shared`, two hours at 17:00, capacity 30; `cruise-private`, two hours at 17:00, capacity 12 |
| Kerala Spice Cooking Class | `class-shared`, three hours at 11:00, capacity 12; `class-private`, three hours, capacity 8 |
| Periyar Wildlife Safari | `safari-jeep`, four hours, morning/afternoon; capacity from jeep units |
| Fort Kochi Heritage Admission | `heritage-ticket`, admission during opening hours |

One card can enable more than one activity method for genuinely different options of the same experience. Select one base method for the request. Person and private-group base rates are alternatives, not amounts to add together. This differs from transport's one-template-per-card rule.

Price states: Priced, Complimentary, On request, Missing, Not offered. Explicit Complimentary means confirmed zero. An On request quote is scoped to the request, with source and validity; it does not replace the reusable unknown master rate globally.

## Activity calculations and operational tests

The following first examples use existing fixture amounts. Commercial amounts exclude unresolved supplier tax and source approval unless stated. Further contract variations come from the existing controlled persona tests and are labelled so another agent does not confuse them with seed tariffs.

| Scenario using existing card | Calculation | Expected operational behavior |
|---|---|---|
| Heritage family: 2 adults, child age 8, infant age 3 | 2 × ₹600 + ₹300 + ₹0 = **₹1,500** | Age-specific rates; complimentary infant still belongs to party |
| Shared cruise same party | 2 × ₹2,200 + ₹1,100 + ₹0 = **₹5,500** | Shared option only; no private group fare stacked |
| Private cruise for 5 | **₹14,500 once** | Group slab 1–6; not five times ₹14,500 |
| Private cruise for 8 | **₹21,000 once** | Slab 7–12; capacity 12 still applies |
| Cruise dinner for 3 selected diners | Base + 3 × ₹650 | Optional dinner scoped to shared cruise, only selected eligible participants |
| Cruise hotel pickup | Add **₹1,200 once per booking** | Omit if not selected; prevent duplicate same transport already costed elsewhere |
| Cruise safety equipment | Included | Never add a second equipment price |
| Cruise holiday sailing 24–26 December | Add stored **₹350 once** | Current fixture date adjustment is one flat quote surcharge, not per-person; do not infer another unit |
| Trek: 2 adults and child age 8, Trailmakers shared | 2 × ₹1,800 + ₹1,100 = **₹4,700** | Child age/option eligibility must pass |
| Trek: 4 eligible adults, shared versus private | Shared **₹7,200**; private **₹9,800** | Staff chooses format and applicable base |
| Trek: 7 private participants, supplier comparison | Trailmakers **₹9,800**; Spice Route **₹11,200** | Same service, different vendor-owned cards/slabs |
| Guided kayak for 5 | 5 × ₹1,800 = **₹9,000** | Guided-person rate, not rental rate |
| Rental kayak for 5 with 2 tandems and 1 single | 2 × ₹3,600 + ₹2,500 = **₹9,700** | Five seats; session price charged per unit, not multiplied again by two hours |
| Spice Route 2 single kayaks for 3 hours | 2 × 3 × ₹900 = **₹5,400** | Party capacity two; requesting three people needs another suitable unit |
| Plantation: 2 adults and child age 8 | 2 × ₹1,400 + ₹700 = **₹3,500** | Example Hospitality card; another supplier's rates are separate |
| Cooking class: 4 people | Shared 4 × ₹3,200 = **₹12,800**; private **₹14,500** | Private capacity eight and supplied method apply |
| Safari: 7 people | 2 jeeps × ₹6,800 = **₹13,600** | One six-seat jeep rejected; admission/guide inclusion must be explicitly sourced |

The current Cruise dinner charge is a generic per-person row and does not encode an age-specific dinner exemption. If only some people receive dinner, the request needs an explicit eligible quantity; do not silently guess that infants are exempt. Follow the actual saved applicability rules.

### Further supported contract tests

These are **isolated scenario contracts already present in `activityPricing.personas.test.mjs`**, not additional vendors to create in the UI.

| Contract variation | Exact expected result or refusal |
|---|---|
| Group-size person tiers ₹2,000 at 1–5, ₹1,800 at 6–10, ₹1,600 at 11–15 | 5 people ₹10,000; 6 ₹10,800; 11 ₹17,600; 16 refused; choose one whole-party tier |
| Private guide 1–4 ₹3,000 and 5–8 ₹4,500 | Seven people ₹4,500 once; nine refused, not automatically split |
| Minimum two participants at ₹1,000/person | Solo refused until supplier minimum bill ₹2,000 is explicitly recorded |
| Jeep ₹6,000/session, 6 seats; admission adult ₹500, child ₹250 | Five adults/two children, two jeeps: ₹12,000 + ₹2,500 + ₹500 = **₹15,000**; one jeep refused |
| Tandem ₹800/hour and single ₹500/hour | Two tandems plus one single for two hours: **₹4,200**, five-person capacity |
| Option minimum age | Zipline min 12 rejects age 10; a different eligible scuba option can price that child |
| Pickup ₹800/booking optional, dinner Included | Base ₹6,400, selected pickup total ₹7,200; separately costed same pickup blocks duplicate |
| Dated replacement adult ₹1,400, child ₹800, booking fee ₹200 | Two adults/one child during window **₹3,800**; outside normal ₹2,600 |
| Supplier comparison with different inclusions | A: three × ₹1,500 dinner Included = ₹4,500; B: three × ₹1,350 plus dinner ₹300 each = ₹4,950 |
| On request booking | Missing stays unresolved; confirmed ₹8,000 with supplier email and unexpired quote can resolve only that request |
| Sold-out exact session | Price may still calculate, but availability Unavailable prevents representing it as bookable |
| Saved accepted snapshot | Original class/cruise total ₹7,000 remains after master edit; a fresh draft calculation can become ₹7,400 |
| Mandatory admission on private group fare | Four people, group ₹1,000 plus ₹100/person admission = ₹1,400; absent participant detail blocks total |
| Unknown unit party size | Unit tariff cannot pass capacity until traveller count is supplied |

Validation checks overlapping age/group bands, duplicate unit definitions, missing session duration, conflicting included/additional treatments, missing extra amounts and unavailable options. A per-person extra may need participant categories even when the base is per booking or per unit.

Activity tax currently stores a referenced approved rate/source on the activity tariff; transport resolves the separate shared profile registry. They are not identical integrations. Activity Inclusive currently adds zero tax rather than producing transport's included-tax breakdown. Both must preserve total and avoid adding inclusive tax again; complete shared-engine unification remains a gap.

## Visa flights and ground services

### Visa

Existing vendor Atlas Visa Services `atlas-visa`, service `uae-visa` UAE Tourist Visa, card `rc-visa-uae`, Published, validity April–September 2026. It is **outside validity for a new October application** despite its Published label. Horizon has separate Draft `rc-visa-horizon`; do not price its supplier contract from Atlas's amounts.

The existing Atlas matrix uses fee components:

| Product | Current April to June components | Announced July to September components |
|---|---|---|
| Tourist 30 days single entry | Government ₹3,200; centre ₹1,800; vendor ₹2,500; biometrics ₹900 | ₹3,400; ₹1,900; ₹2,600; ₹900 |
| Tourist 60 days single entry | ₹4,800; ₹1,800; ₹2,800; ₹900 | ₹5,100; ₹1,900; ₹2,900; ₹900 |
| Tourist 90 days multiple entry | ₹7,200; ₹2,200; ₹3,200; ₹1,200 | ₹7,600; ₹2,300; ₹3,400; biometrics missing |

Express processing is listed at ₹4,500 per applicant; document review Included. Scope references Indian passport holders applying from India. These are application fixture terms, not current immigration guidance.

**Worked operational specification, not a verified current visa engine:** if the contract requires all four 30-day Current components, one applicant costs ₹8,400 before applicable tax, two ₹16,800; express for both adds ₹9,000. Announced 90-day biometrics is missing, so an all-component quote remains unresolved. Do not omit it or invent ₹0.

The generic visa implementation reuses accommodation room/product, meal/component, and date-set arrays. A Visa fee component is not an alternative meal plan; the present generic quote engine does not reliably aggregate an application fee schedule or resolve nationality/apply-from/processing eligibility. Preserve the intended applicant basis and flag this gap; do not claim these worked visa totals pass the current UI.

A supplier visa tariff is distinct from an application case, document review, submission, government decision, or guaranteed approval. Do not calculate room nights for visa processing.

### Flights

Kerala Flight Ticketing `kerala-flights` is a directory service; Denpasar flight coordination `svc-denpasar-flight-coordination` is a vendor service reference. The Flight rate-card template is disabled. A legacy profile links an air-ticketing label to `rc-air-2026`, which is actually an airport-transfer tariff; this is an inconsistent fixture link, not a valid flight cost.

**Illustrative workflow only:** a sourced ticket fare ₹8,000 plus a confirmed supplier handling fee ₹300 per ticket gives two tickets ₹16,600 before the appropriate approved tax/components. An open-ended market fare cannot be manufactured from a vehicle or hotel matrix. No new flight card or universal GST rate should be invented to make that example look implemented.

### DMC and ground handling

DMC is also a supplier relationship/role. It can provide accommodation, transport and activities through its own vendor-owned tariffs. That does not require a new mega-card with unrelated prices.

Existing Bali ground coordination `svc-bali-ground-coordination` describes supplier handoffs and requires a confirmed scope/handling quotation. **Illustrative scenario:** an agreed coordination fee ₹2,000 once plus separately sourced stay ₹20,000 and transfer ₹3,000 = ₹25,000 supplier scope, provided the coordination quote excludes those underlying services. If a contracted DMC package already includes them, count that package once and link included components; do not add the same hotel and transfer again.

Other Bali profiles exist for DPS transfer, Ubud day car, Ubud Garden Suites, Seminyak Coastal Stay, Tegallalang rice walk, Uluwatu sunset, Nusa Penida coastal day, and arrival assistance. They are supplier-quote-pending capability examples without a completed numerical tariff. Reuse them for unpriced/manual-quote flows; do not imply approved tariff data exists.

## Accepted costing Booking and Finance

### Reusable rates versus a particular customer

The tariff is reusable supplier data. Customer date, ages, passengers, bags, route, quantity and usage live in the requirement. Recalculating a Draft reads eligible current tariffs. Acceptance freezes the selected supply and agreed commercial values.

Transport snapshots retain owning vendor/service, card name/currency/version, request, result, tariff, vehicle records and tax profiles. Activity snapshots retain owner/service, version, time, request and result. These snapshots have different current shapes; do not claim activity already freezes every tariff/capability field in the same way as transport.

Changing travellers, date, route, vehicle, session or usage triggers draft review. Changing a master tariff must not mutate an accepted supplier amount. A revision keeps the earlier accepted values and records the new selling decision; customer changes do not automatically rewrite Finance.

### Continuous hire and separate requirements

Use one `transportHireId` for a vehicle retained across several itinerary days. Repeated appearances reference one costing. Separate arrival times or independently booked movements get distinct requirement/hire IDs. Equal routes do not prove they are the same service occurrence.

Proposal's retained-hire logic and Booking handoff deduplicate repeated hire IDs. It checks conflicting repeated card/input definitions rather than adding every day's full charge. Activity transfer inclusion checks also protect against adding the same pickup in an activity and transport block. Different actual movements must remain separate even when their suppliers or names match.

### Booking actuals and confirmation

Accepted Proposal → Booking handoff → supplier arrangement confirmation → actual usage/invoice → amendment delta → revised supplier confirmation → resulting current Finance obligation.

Transport handoff posting is repeat-safe for the same accepted version and hire. An amendment requires a reason and unique identifier; the same ID returns the existing amendment. Revised amounts use the accepted tariff snapshot rather than a freshly edited supplier rate.

Known base plus actuals can be accepted only with explicit customer actuals terms and the required supplier approvals. Until actual amounts and supplier confirmation are resolved, Finance must not post a fictitious fixed full obligation. Current helpers retain independently confirmed hires while other hires or revised versions await confirmation; replacing one hire must not erase another valid obligation.

The visible transport Booking panel supports actual km for Outstation and actual invoice charge amounts, then supplier confirmation reference. It is not a complete daily-hour, vehicle substitution, cancellation, supplier invoice, or payment workflow. The wider Booking HTML and Vendor Bookings/Finance tabs still include sample/local UI behavior. See the [Booking handoff](../bookings/booking-module-ux-operational-context.md) for these boundaries.

### Agency selling and customer tax

Supplier payable, agency cost basis and customer total are three values. Recoverable supplier tax can alter cost basis without altering money owed to the supplier. Agency markup applies once to the chosen agency cost basis. Customer tax follows the agency's own approved treatment. A supplier cost amendment does not authorize a new customer charge unless the agreed customer terms allow it.

Example: accepted supplier amount ₹18,000, later ₹21,300. Supplier delta ₹3,300. The customer price remains the accepted selling amount pending the separate customer amendment process. Finance must receive the revised supplier obligation once, not original plus a second full trip cost.

## Data fields and boundaries

| Area | Retain | Location and reason |
|---|---|---|
| Identity | Owner vendor ID, linked service ID, card ID/name/currency/validity | One canonical supplier contract |
| Provenance | Source, supplier confirmation, version, illustrative flag | Internal/edit/approval/snapshot evidence; removed read-screen rows need not return |
| Vehicle | Seats, each bag allowance, combined allowance, AC/model/attributes | Reusable Vehicle Offering; tariff references IDs |
| Fixed pricing | Directed routes, route × vehicle amount | Exactly one transfer template |
| Local pricing | Data-driven package definitions, matrix, separate excess rates/method | Local template only |
| Outstation pricing | Vehicle km rate, minimum/day, driver/day; shared minimum/day/distance rules | Shared rules once, not repeated low-level columns |
| Daily pricing | Vehicle day rate and included km/hours; separate excess; carry rules | Daily template only |
| Additional charges | Treatment, nullable amount, billing unit, route/vehicle/option scope and triggers | Supplier commercial terms; not a universal unexplained Other charges total |
| Tax | Inclusive/Exclusive plus approved shared reference | Shared Finance/Tax resolution; no transport GST table or guessed rate |
| Agency markup | Outer card default; explicit Proposal selling decision | Keep supplier cost unchanged |
| Customer inputs | Party, bag types, dates, service occurrence, route and planned usage | Test request or Proposal; never saved as a reusable vendor tariff |
| Availability | Supplier-held/confirmed arrangement or session state | Capability and price validity alone do not reserve supply |
| Payment responsibility | Agreed arrangement and obligation treatment | Booking/Finance; avoid cluttering the tariff price sheet |
| Seasons | Accommodation date-based room tariffs | Do not reintroduce accommodation seasons into focused transport |

Current private tariff has one template and nullable numerical fields. Preserve null through editors/storage/calculation. A default UI value must not silently convert supplier uncertainty into a confirmed zero, false, or Included state.

## Evidence and remaining implementation gaps

### What was verified for this handoff

`npm run verify:models` passed **89 of 89** tests on 2 October 2026. It covers finance fixtures, transport handoff, old transport regressions, focused private transport calculations/personas, and activity calculations/personas. Seven additional accommodation cases were evaluated directly in memory against the existing engine, including refusal results and season-boundary pricing.

This is model/source evidence. No complete browser replay of all persona journeys, real supplier contract verification, live availability, external message delivery, banking, or production tax integration was performed for this documentation task.

### Gaps the next agent must keep explicit

1. **Service Test Rate is not a universal authoritative calculator.** Generic `ServiceTestRate.tsx` constructs room prices and supplier offsets without reading the actual supplier tariffs. If the first resolved service connection has a focused transport card, the screen dispatches to that card's transport test component; an older regional card uses its older tester. Other categories can fall back to the generic demonstration. This is not a complete multi-vendor tariff selector. Test Rate should resolve the selected actual card/engine in each intended flow.
2. **Supplier-tax readiness is unresolved in untouched fixtures.** The shared profile browser registry starts empty. Illustrative Drafts are expected to withhold approved payables. Approved-profile CRUD and production tax resolution are not supplied by the Vendor module.
3. **Model tests use controlled records.** They establish arithmetic and safeguards, not that default seed cards are live contracts or that all 18 complete UI journeys pass. P9/P10 focus on suitability; P11/P12 have narrower assertions than the entire trip workflow.
4. **Legacy ownership/property links remain inconsistent.** Some reused accommodation, activity and flight profile links do not match a canonical card's property/type. Resolve the actual IDs and owner before costing; never use a rate merely because a display label sounds right.
5. **Accommodation has implementation shortcuts.** Sample dates/fallback, fixture-specific blackout/minimum/supplement handling, unmatched child rules and incomplete room/bed allocation remain. These are not approved general pricing rules to copy.
6. **Visa and disabled families are not completed tariff engines.** The presence of a service or fee table does not prove correct applicant aggregation or ticket/live-fare costing.
7. **Supplier eligibility is bounded.** Area checks are text matching, fleet suggestions limited, and comparison returns one arrangement per card. Exact operating geography, stock and actual allocation are not fully modeled.
8. **Tax implementations differ across families.** Activity approval/rates and inclusive output differ from transport's shared registry/breakdown. Customer tax is not uniformly resolved throughout root Proposal pricing.
9. **Browser persistence is not a backend.** Tariffs/vehicles/handoffs have local storage, while several UI tabs and root package/proposal records remain session/fixture state. Reloads, separate browsers and accepted-history durability need separate verification.
10. **Downstream connection is partial.** Transport amendment/confirmation helpers protect current obligations, but generic booking services, supplier payments, refund flows, activity finance posting and cross-module updates are not a complete synchronized ledger.
11. **Metadata and document evidence differ.** A source-document label/file metadata is not durable uploaded proof. Policy rows and some attachments remain local demonstrations.
12. **Payment responsibility and actuals need review.** Focused tariff UI omits payment columns but optional model fields remain. Validate direct customer-paid charges against supplier payable and agency obligation; do not infer invoice responsibility from a hidden default.

A correct refusal is an operational success when required inputs or supplier terms are missing. Showing a numeric total for every persona regardless of these conditions would remove the protections the model needs.

## Regression checklist for the next agent

Use the existing fixtures and controlled test scenarios above. Change isolated inputs or test clones where a contract variation is required; do not add another parallel supplier catalogue.

### Discovery and ownership

- Vendors → exact supplier → Rate Cards → exact ID, and Services → exact service → Rate Cards → same ID.
- Vendors tab opens supplying businesses; Rate Cards tab prioritizes actual tariffs and shows each supplier.
- Adding a service requires a vendor; adding a card from a service requires a selected supplier.
- Two suppliers' rates for one service stay distinct; adding discovery does not copy tariffs.
- New vehicle appears for its owner/service and can be selected in a relevant card without creating a reservation.

### Calculation and suitability

- All 18 transport personas, their missing-input refusals and changed-condition variants.
- Room/meal/season crossing, weekend, guest ages, beds, occupancy, gala, minimum stay, blackout and unknown prices.
- Activity person/group/unit, shared/private, ages, tiers, minimums, quantity, session/duration, extras, date replacements and unresolved rates.
- Fixed fare remains per vehicle; intercity can remain fixed; reverse route independently resolves.
- All travellers plus staff count; luggage categories and combined allowance both pass; AC is checked.
- Mixed fleets use each tariff; per-hire charges counted once; per-vehicle charges multiplied correctly.
- Daily minima and unused allowances follow supplier rules; daily entries reconcile to totals.
- Actual and Unknown charges stay visible; no blank-to-zero fallback; overlapping required charge treatments refuse.

### Tax approval and selling

- Inclusive price is not taxed twice; Exclusive price needs approved resolution.
- Missing tax profile/recoverability does not become a fixed payable.
- Supplier payable differs from agency cost basis where approved credit applies.
- Card markup default remains separate; Proposal applies one selling decision and customer tax independently.
- Draft or illustrative tariff cannot become approved supply merely by bypassing a UI warning.
- Validity covers the service occurrence/hire, not just a convenient selected start date.

### Handoff and history

- Several itinerary days referencing one hire cost it once.
- Split arrivals and separate transport services remain independent requirements.
- Accepted snapshots survive master-card edits; revised requirements do not silently mutate accepted values.
- Actual 900 km against quoted 750 posts a ₹3,300 difference using the same tariff in the controlled no-actuals scenario.
- Invoice actuals and repeated amendment IDs behave as in Persona 18.
- Supplier confirmation is explicit; Finance shows one current confirmed obligation while independent hires remain.
- Test Rate creates no Booking/Proposal/payment; price validity never implies supplier confirmation.

Record each result with actual inputs, selected vendor/card/vehicle or option IDs, expected amount, actual amount, unresolved charges, approval/availability, and the tested layer. Passing one helper is insufficient evidence for the whole cross-module journey.

### Coverage of the original thirty six audit areas

| Original audit areas | Context and cases to use |
|---|---|
| 1 Requirement selection | Four templates, Test Rate inputs, Personas 5 and 12 |
| 2–5 Suitability, passengers, luggage and AC | Vehicle Offering inventory; Personas 1, 2, 5, 6, 9, 10 and 17 |
| 6–9 Vendor eligibility, service relationship, ownership and card selection | Ownership/discovery flows; real record IDs; Persona 13; legacy-link gap |
| 10–13 Four fare calculations | Numerical sheets; Personas 1–8 and conditional Persona 9 |
| 14–15 Multi-day and minimum km | Pooled/daily distinction, garage/return/day rules; Personas 6–8 |
| 16–18 Included and excess km/hours | Local and Daily sheets; Personas 3, 4 and 8 |
| 19–20 Driver and night charges | Outstation driver column; scoped night trigger; Personas 2, 6 and 7 |
| 21–24 Tolls, parking, permits and treatments | Actual/Included/Fixed/Not applicable/Unconfirmed definitions; Personas 2 and 14 |
| 25–26 Inclusive/exclusive tax and shared profile | Supplier tax examples and unresolved registry boundary; Personas 15 and 16 |
| 27–29 Multiple vehicles, vendors and requirements | Allocation rows; Personas 9–13; one retained-hire identity |
| 30 Requirement changes | Draft review and accepted snapshots; Persona 17 |
| 31 Card validity | Whole service occurrence, expired Visa example, Activity date rules, accommodation mismatch |
| 32 Unresolved inputs | Null versus zero, missing charge/rate/usage/eligibility/refusal cases |
| 33–35 Proposal resolution, Booking handoff and duplicate prevention | Accepted costing section; Personas 11, 12, 17 and 18; handoff tests |
| 36 Tariff usability | Accommodation reference interaction; one relevant numerical sheet; shared rules once; correct supplier/card navigation |

## Source map

| Subject | Current source |
|---|---|
| Full module UX flow | [Vendor operational context](vendor-module-ux-operational-context.md) |
| Supplier identities | [vendors.ts](../../../src/modules/vendors/data/vendors.ts) |
| Directory and supplier links | [vendorDirectory.ts](../../../src/modules/vendors/data/vendorDirectory.ts), [serviceRateCards.ts](../../../src/modules/vendors/data/serviceRateCards.ts) |
| Vendor service profiles and legacy references | [services.ts](../../../src/modules/vendors/data/services.ts) |
| Canonical tariff registry and creation | [cards.ts](../../../src/modules/vendors/rateCard/cards.ts), [types.ts](../../../src/modules/vendors/rateCard/types.ts) |
| Accommodation quote logic | [engine.ts](../../../src/modules/vendors/rateCard/engine.ts) |
| Private transport records and vehicles | [privateTransportFixtures.ts](../../../src/modules/vendors/data/privateTransportFixtures.ts), [vehicleOfferings.ts](../../../src/modules/vendors/data/vehicleOfferings.ts) |
| Focused transport logic and comparison | [privateTransport.ts](../../../src/modules/vendors/rateCard/privateTransport.ts), [transportOptions.ts](../../../src/modules/vendors/rateCard/transportOptions.ts) |
| Shared supplier profile prototype | [supplierTax.ts](../../../src/modules/vendors/rateCard/supplierTax.ts) |
| Transport persona and rule tests | [privateTransport.personas.test.mjs](../../../src/modules/vendors/rateCard/privateTransport.personas.test.mjs), [privateTransport.test.mjs](../../../src/modules/vendors/rateCard/privateTransport.test.mjs) |
| Activity records and logic | [activityRateFixtures.ts](../../../src/modules/vendors/data/activityRateFixtures.ts), [activityPricing.ts](../../../src/modules/vendors/rateCard/activityPricing.ts) |
| Activity scenario tests | [activityPricing.personas.test.mjs](../../../src/modules/vendors/rateCard/activityPricing.personas.test.mjs), [activityPricing.test.mjs](../../../src/modules/vendors/rateCard/activityPricing.test.mjs) |
| Supplier-specific accommodation drafts | [supplierRateFixtures.ts](../../../src/modules/vendors/data/supplierRateFixtures.ts) |
| Card UI | [RateCardDetailPage.tsx](../../../src/modules/vendors/components/rateCard/RateCardDetailPage.tsx), [PrivateTransportWorkspace.tsx](../../../src/modules/vendors/components/PrivateTransportWorkspace.tsx), [ActivityRateWorkspace.tsx](../../../src/modules/vendors/components/ActivityRateWorkspace.tsx) |
| Service discovery and test dispatch | [ServicesPanel.tsx](../../../src/modules/vendors/components/ServicesPanel.tsx), [ServiceRateCardsPanel.tsx](../../../src/modules/vendors/components/ServiceRateCardsPanel.tsx), [ServiceTestRate.tsx](../../../src/modules/vendors/components/ServiceTestRate.tsx) |
| Vehicle creation | [VehicleOfferingsPanel.tsx](../../../src/modules/vendors/components/VehicleOfferingsPanel.tsx) |
| Transport booking and financial handoff | [bookingTransportHandoff.ts](../../../src/bookingTransportHandoff.ts), [transport-handoff.test.mjs](../../../scripts/transport-handoff.test.mjs) |
| Package and Proposal flow boundaries | [Packages operational context](../packages/packages-module-ux-operational-context.md) |
| Booking flow boundaries | [Booking operational context](../bookings/booking-module-ux-operational-context.md) |

## Copyable context for the next agent

Continue in the main Paryatech repository. Preserve the approved Vendor CRM shell and accommodation-style tariff experience. Reuse existing supplier, service, vehicle and card records listed in this handoff. Vendors and Services are discovery paths into the same vendor-owned rate cards; Service Rate Cards opens the exact owner/card ID. Vehicle capacity belongs to reusable vendor/service Vehicle Offerings. Customer requirements belong to Test Rate or Proposal.

Transport has four focused private chauffeured templates: Fixed Transfer, Local Package, Outstation Per Km, Daily Hire. Use CityRide `rc-cityride-fixed`, Kochi Local `rc-local-cabs`, Jaipur `rc-jaipur-local`, Bengaluru `rc-bengaluru-local`, Road Trips `rc-road-trips`, South Coast `rc-south-coast`, and Trailmakers `rc-trail-fixed`, `rc-trail-local`, `rc-trail-km`, `rc-trail-daily`. Historical regional mega-cards are not the finalized model. Default focused fixtures are illustrative Drafts, not approved supplier contracts.

Use the numerical accommodation reference `rc-acc-2627` and the 11 activity tariffs listed above. Activity supports enabled person/group/unit methods against reusable service options, with one selected base method per requirement. Visa's generic implementation and disabled Flights/Trip/Cruise families are incomplete; do not invent working engines or confirmed prices for them.

Test every transport persona and relevant accommodation/activity variation with the exact inputs and expected calculations in this document. A refusal for missing supplier terms, insufficient capacity, unsupported route, unknown charge, invalid dates or unresolved tax is required behavior. Model tests passed 89/89, but they use controlled confirmed tariffs and do not establish all browser/Proposal/Booking/Finance journeys. Generic Service Test Rate still calculates demonstration hotel amounts and must not be trusted as the actual supplier tariff engine.

Keep base, driver, excess, fixed extras, actuals, supplier tax/payable, agency cost basis and customer selling decision distinct. Included never adds again; Unknown never becomes zero; mixed fleets price their own vehicles; one retained hire costs once; split arrivals remain separate. Bottom Markup is agency metadata applied once in Proposal, not supplier cost. Tax comes from approved shared configuration; no invented transport GST. Accepted values are snapshotted, master changes do not rewrite them, amendments use differences and repeat-safe IDs, supplier confirmation is explicit, and Finance receives the same confirmed obligation once. Keep the remaining implementation gaps visible while improving the relevant flow.
