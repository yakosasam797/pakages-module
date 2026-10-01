# Private transport rate cards: implementation map

## Current implementation audit

- `regionalTransport` holds fixed, local, outstation, daily and whole-trip fares in one card. The workbook repeats minimum method, billable-day method, garage distance, rounding and trip type in each vehicle row.
- `regionalTransport.vehicles` and the older airport `transport.offerings` duplicate passenger and luggage capacity inside rate cards. Those facts belong to the vendor's reusable vehicle offerings.
- `regionalTransport.seasons`, per-fare tax profiles and tax rates make transport look like accommodation and embed tax configuration in supplier fares. The platform currently has no callable shared tax engine, so excluded tax must remain unresolved in Test Rate.
- `VENDOR_SERVICE_CONNECTIONS` sometimes points several vendors at one rate-card ID. This is incorrect for transport because the card represents a single supplier contract.
- The approved accommodation experience already supplies the record header, four tabs, edit state, policies, activity, table styling and CSV download. The transport redesign stays within that shell.

## Ownership and data model

`Vendor.id` owns one or more `DirectoryService` transport offerings. A transport service references reusable `VehicleOffering` records scoped to that vendor. Each `PrivateTransportRateCard` has exactly one `vendorId`, one `serviceId`, one `template`, and references the eligible vehicle IDs. A service can link several cards, but every link points to the same vendor-owned record. Vendor and Services views only query these links; neither copies the card.

`PrivateTransportRateCard` contains name, reference, currency, validity dates, source document, status, version, supplier tax mode/profile reference, one template-specific tariff, shared pricing rules and additional charges. It contains no traveller count or agency margin. A Vehicle Offering contains category, model/class, passenger seats excluding driver, luggage allowance, AC and attributes. These do not live in tariff rows.

Four template payloads:

| Template | Tariff rows | Shared rules |
| --- | --- | --- |
| Fixed transfer | Directed route × vehicle price | Route scope and optional transfer limits |
| Local package | Package definition; vehicle × package price; vehicle excess rates | Whether both excess dimensions are charged |
| Outstation per km | Vehicle rate/km, minimum km/day, driver/day | Minimum method, distance basis, billable days, rounding, fuel |
| Daily hire | Vehicle price/day, included km/day, included hours/day; vehicle excess rates | Carry-forward of unused usage, billable days |

Additional charges share `name`, `appliesTo`, `treatment`, nullable `amount`, `chargedPer`, and an optional trigger. Missing fixed amounts block numerical quoting. Actual charges leave the quote as a known base plus actuals. Who pays and who collects belong to the trip or booking arrangement, not the vendor's tariff sheet.

## Field migration

| Current field | Action |
| --- | --- |
| `enabledMethods`, `fare.service`, `fare.basis` | Replace with one immutable card template. Split the mega card into four records. |
| `vehicles` / `offerings` with seats, bags, model | Move to vendor-scoped Vehicle Offerings; keep vehicle IDs in tariffs. |
| `localPackages`, `fare.packageId`, `fare.amount` | Keep as package definitions and matrix amounts on Local Package cards. |
| `fare.minKmPerDay`, `fare.driverAllowancePerDay` | Keep as numerical vehicle tariff on Outstation cards. |
| `fare.minimumRule`, `billableDayMethod`, `distanceRounding`, `additionalGarageKm`, `additionalReturnKm` | Move to one Pricing Rules object on Outstation cards. |
| `fare.carryUnusedUsage` | Move to one Daily Hire rule. |
| `fare.includedKm`, `includedHours`, `extraKm`, `extraHour` | Keep only where the selected template uses them; excess rates form a separate table. |
| `seasons` | Remove from private transport; use card validity. |
| Per-fare tax profile/rate and `taxPresentation` | Replace with card-level inclusive/exclusive mode and shared profile ID. No transport GST arithmetic. |
| `availability` | Remove from tariff. A rate is not a reservation or supplier confirmation. |
| `markupPercent` | Ignore for private transport; agency selling price belongs in Proposal. |
| `charges`, `adjustments` | Keep only applicable additional charges; avoid unconfirmed values becoming zero. |

## Screen flow

Vendors → vendor → Rate cards → focused card → Rate card / Test rate / Policies / Activity. The list can filter service, template, status and validity. Creating a card chooses one of four transport templates under the current vendor. The detail page shows one numerical tariff sheet, shared rules, additional charges and validation state. Test Rate accepts trip details, resolves the vehicle offering and calls the same supplier-cost calculator intended for Proposal.

Services → Transport → service → Vendors → vendor → the same rate-card ID. This remains a discovery route. No Service-owned card is created.

## Fixture coverage

CityRide Transfers: fixed airport/intercity transfers. Kochi Local Cabs: local packages. Kerala Road Trips: outstation per km. South Coast Coaches: daily van/coach hire. Trailmakers Experiences: separate fixed, local, outstation and daily cards across multiple transport services. Jaipur and Bengaluru local operators cover the separate city examples. All fixture rupee amounts are illustrative. The prototype marks these fixtures Active so staff can exercise the full Proposal flow; this is not evidence of real supplier confirmation.

## Calculation and limits

Supplier commercial amount is derived once from the selected template, vehicle quantity, trip usage and applicable fixed charges. Passenger and luggage fit are checked against the referenced Vehicle Offering. Actual or unknown charges do not become zero. The prototype's local approved-tax-profile registry supplies a rate for inclusive extraction or exclusive addition; without an approved profile, an exclusive card cannot resolve supplier payable. This registry is a UI stand-in for the future shared platform tax engine, not a production tax source. Test Rate does not confirm vehicle availability.

## Rate-card UI and Test Rate follow-up

- The read view keeps vendor, transport service, template, currency, and validity. Source document, version, supplier verification, and activation checks are internal or edit-only details. Validation errors appear only when an employee attempts to activate an incomplete card.
- The former Shared tax profile control was an empty selector. The prototype now has an approved-profile registry with a recorded approval reference. Test Rate uses it for supplier tax, while an exclusive-tax payable remains pending if no approved profile is selected. The supplier tax is distinct from the agency's later customer tax; a production shared Tax Engine still needs integration.
- Fixed-transfer Test Rate selects pickup and final drop from the vendor's directed routes, with no duplicate route selector. Vehicle rows permit a mix of offerings and quantities. Each selected vehicle uses its own tariff; the combined arrangement must fit travellers and luggage. A charge billed once per hire is counted once across the arrangement.
