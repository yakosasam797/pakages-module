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
