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
