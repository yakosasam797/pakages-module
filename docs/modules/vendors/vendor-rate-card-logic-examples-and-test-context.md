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
