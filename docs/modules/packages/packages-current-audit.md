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
