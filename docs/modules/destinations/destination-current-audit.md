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
