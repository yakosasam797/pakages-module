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


# Booking: current source and UI audit

Reviewed: 5 October 2026. Read with the complete Booking operations context. Current captures use the unified root shell at 1280 × 800. Earlier screenshots are separately dated supporting evidence.

## Actual entry and structure

`App → BookingModule → /booking/index.html` embeds `src/modules/bookings/booking-redesign.html`. Asset preparation copies the source HTML; the public copy is not a separate authoritative implementation. The wrapper removes the older nested shell and connects module navigation and local Back history.

The directory contains seven seeded Booking rows: Upcoming 3, Travelling 1, Completed 2 and Cancelled 1. Search, Mine/Unassigned, selection and counts operate on row attributes. Every seeded row opens the same detailed XYZ Family Dubai fixture; choosing another row does not load its independent record. Never infer full multi-booking CRUD from that directory.

The detail has nine panels: Overview, Vendors (`services`), Tasks (`fulfilment`), Travellers, Documents, Finance, Vouchers, Communication and Activity. The screenshot atlas includes the panels, scroll continuations, queues, empty search, selection, task status menu, operational row menus and generic row details.

## Dialog audit: all named source dialogs

| Source dialog | Real entry / boundary | Submit effect in current HTML |
| --- | --- | --- |
| directBooking | Directory → Direct booking | Appends a local `BK-NEW` row; default title allowed; no full independent record |
| editBooking | Detail header → Edit | Updates displayed title and owner; entered travel dates are not fully propagated |
| manageMargin | Vendors → Manage margin | Scope/type/value controls; close; opens price amendment |
| priceAmend | Manage margin → Create price amendment | Closes only; no authoritative customer price amendment |
| catalog | Vendors → Add from catalog | Search hides static Dubai options; Add appends local service line |
| addService | Vendors → Add service line | Adds a local row from kind/title/vendor/cost; location/schedule are not fully authoritative |
| editPrice | Named source dialog, no current `data-open-modal` trigger found | Closes only |
| editCost | Named source dialog, no current `data-open-modal` trigger found | Closes only |
| assignVendor | Unassigned service → Assign vendor | Closes only; assignment is not persisted or confirmed |
| contact | Service → Contact | Closes only; no delivered supplier message |
| watchers | Named source dialog, no current trigger found | Closes only; no notification subscription |
| addTraveller | Travellers → Add traveller | Appends local traveller row with missing document status |
| addTask | Tasks → Add task | Appends local task when title is entered; no server assignment/notification |
| recordPayment | Booking Finance → customer Record payment | Marks a due row Paid/zero locally; not Agency Finance verification/allocation |
| addInstalment | Booking Finance → Add instalment | Appends local due instalment |
| editInstalment | Instalment View / row actions | Closes only |
| supplierPay | Supplier payable Record/Open | Closes only; no canonical money record |
| voucherFile | Sent voucher View | Displays fixture metadata; Replace opens upload form |
| uploadVoucher | Vouchers → Upload / Replace | Closes only; no uploaded durable voucher |
| requestDoc | Documents / Communication → Request documents | Prefills Communication reply; no message sent |
| attachFile | Documents upload / Communication attach | Closes only; no verified file storage |
| newMessage | Communication → New message | Closes only; no provider delivery |

All 22 named dialogs have current source-rendered screenshots. For editPrice/editCost/watchers the public modal handler was invoked directly for reference because no live trigger was found. These are marked source-exposed, not reachable completed user flows. A 23rd generated dialog, `booking-row-detail`, derives facts from the selected displayed row. Voucher rows with a file may open voucher metadata instead. Notes are an independent drawer with browse/compose/filter/search/pin behavior.

## Interactions and operational decisions

- Task status choices Open/In progress/Blocked/Done affect local rows and completed-work placement. A Done task does not confirm a supplier, settle money or verify a passport.
- Row menus copy only source-backed operational actions. Each table has different actions; a generic View details is not a complete editor.
- Documents keep traveller/type/evidence/status separate. Reminder/request routes create a reply draft. Voucher fulfilment files differ from passport/visa evidence.
- Communication threads and reply composition are local. “Save to Documents” navigates to Documents; it does not establish a verified file-management service.
- Activity filters use module and free text. Export/bulk/displayed pagination controls must be checked individually; a present button is not evidence of a durable export or shared API.
- Root Back may first undo a detail tab change before returning to the directory. Do not assume one Back always closes the record.

## Conditional accepted supplier handoffs

Above the iframe, transport and activity `<details>` appear only if accepted snapshot stores contain records. The clean source fixture baseline has no such accepted snapshots. The current default screenshots therefore do not show those panels.

Transport snapshots retain tariff, input, vehicles, tax profiles, version, owner and result. A continuous hire referenced on several days is recorded once. Actual kilometres and supplier invoice charges require a reason and a fully resolvable preview. The amendment records only the supplier delta. Confirmation requires a nonempty supplier booking reference and the latest amount/amendment count. The Finance adapter reads the latest confirmed obligation for each proposal/hire, even when another hire/revision is pending. It does not insert the obligation into FinanceApp's static tables.

Activity handoffs show accepted supplier total and whether the selected session was confirmed. A price snapshot with pending availability is not a reservation. The panel has no complete confirmation editor equivalent to transport.

These conditional states are documented from the exact source and tests, and have an explicit screenshot-gap entry. Do not manufacture an approved supplier/tax record as baseline merely to show them. A future scenario capture must label its test-only inputs and restore storage afterward.

## Source and screenshot limits

Operating-system file dialogs, native select popups, every possible row/field value and narrower More-tab overflow are not individually pictured. Their controls/options and source branches are retained in the inventory. This is a comprehensive module reference with an honest remaining-state ledger, not proof that every arbitrary visual permutation has been captured.


# Paryatech Booking — UX and operational context

Reviewed: 2 October 2026. Scope: the Booking module in the current main repository and its accepted transport/activity handoff panels. Companion documents: [Packages context](../packages/packages-module-ux-operational-context.md) and [Vendor CRM context](../vendors/vendor-module-ux-operational-context.md).

Visual companion: [Booking UI and user-flow atlas](booking-module-ui-flow-context.html) shows the current screens, dialogs, controls, entry points and next steps in a standalone HTML file.

This document explains user journeys, information structure, operational decisions, and current behavior. It is a handoff for subsequent product work, not a redesign. It distinguishes a working local interaction from a connected booking or financial process.

## Contents

1. [Purpose and operating model](#1-purpose-and-operating-model)
2. [Ownership and relationships](#2-ownership-and-relationships)
3. [Complete screen map](#3-complete-screen-map)
4. [Users, assignment, and access](#4-users-assignment-and-access)
5. [Booking directory](#5-booking-directory)
6. [Direct booking](#6-direct-booking)
7. [Opening and editing a booking](#7-opening-and-editing-a-booking)
8. [Overview and itinerary](#8-overview-and-itinerary)
9. [Vendors and service fulfilment](#9-vendors-and-service-fulfilment)
10. [Supplier costs, selling price, and margin](#10-supplier-costs-selling-price-and-margin)
11. [Tasks and readiness](#11-tasks-and-readiness)
12. [Travellers](#12-travellers)
13. [Documents](#13-documents)
14. [Finance](#14-finance)
15. [Vouchers](#15-vouchers)
16. [Communication](#16-communication)
17. [Activity history](#17-activity-history)
18. [Booking notes](#18-booking-notes)
19. [Accepted transport handoff](#19-accepted-transport-handoff)
20. [Transport actuals and supplier confirmation](#20-transport-actuals-and-supplier-confirmation)
21. [Accepted activity handoff](#21-accepted-activity-handoff)
22. [Navigation and related modules](#22-navigation-and-related-modules)
23. [Persistence and action boundaries](#23-persistence-and-action-boundaries)
24. [Example operational journeys](#24-example-operational-journeys)
25. [Rules to preserve](#25-rules-to-preserve)
26. [Source map and reusable context](#26-source-map-and-reusable-context)

## 1. Purpose and operating model

Booking is the agency's fulfilment workspace after the customer and agency agree on a journey. Its central question is: **What still needs to happen for this trip to run as promised?**

The staff member needs to know:

- Who is travelling, when, and on which accepted arrangement?
- Which service suppliers are assigned and confirmed?
- What documents, payments, vouchers, or tasks are outstanding?
- Who owns the next action, and when is it due?
- Has the supplier cost changed after acceptance?
- Which confirmed supplier obligation should Finance use?

The intended responsibility sequence is:

```text
Customer request / Query
  → Proposal with itinerary and customer price
  → Accepted proposal version
  → Booking fulfilment and supplier confirmation
  → Customer/supplier payment tracking
  → Travel delivery and closure
```

The current implementation has two connected but distinct parts:

1. **The Booking operations prototype:** a directory and a detailed Dubai booking with nine tabs. It uses HTML fixtures and local DOM interactions.
2. **Accepted supplier handoff panels:** React panels above the embedded Booking page, populated from browser-stored Proposal transport/activity snapshots. Transport has actual-cost amendments and supplier confirmation.

These panels do not automatically populate every row, traveller, voucher, or KPI in the HTML booking detail. That integration boundary matters when planning further work.

## 2. Ownership and relationships

| Information | Operational owner | Meaning |
|---|---|---|
| Query/customer brief | Sales / Proposal context | Original customer requirements |
| Reusable package | Packages | Starting itinerary, independent of one booking |
| Customer proposal and selling price | Proposal | Offer to this customer; acceptance is version-specific |
| Supplier capability and live tariff | Vendor CRM | What the supplier offers and how it charges |
| Accepted supplier snapshot | Proposal → Booking handoff | The tariff, request, and result that were accepted |
| Booking service line | Booking | A movement, stay, visit, visa, or other delivery to fulfil |
| Vendor assignment and confirmation | Booking operations | Who will deliver that service and the confirmation reference |
| Traveller and document readiness | Booking operations | People and evidence required for delivery |
| Voucher | Booking | Service fulfilment document, distinct from passport/visa evidence |
| Supplier actual-cost amendment | Booking | Revised payable and its difference from the previous amount |
| Customer receivable / supplier payable | Finance | Resulting obligations; recording an obligation is not executing payment |
| Task, note, conversation | Booking context | Follow-up work and supporting communication |

An approved customer offer is not the same as supplier confirmation. A valid tariff, recorded price, sent message, or task marked Done is not by itself evidence that the supplier reserved the service.

## 3. Complete screen map

```text
Sidebar → Bookings
  ├─ Accepted transport supplier obligations, when recorded
  │   └─ Actual usage / actual charges → amendment → supplier confirmation
  ├─ Accepted activity supplier prices, when recorded
  │   └─ Accepted price, version, and session availability state
  └─ Booking directory
      ├─ Upcoming / Travelling / Completed / Cancelled
      ├─ Search + All bookings / Mine / Unassigned
      ├─ Selection, bulk controls, displayed pagination
      ├─ Direct booking dialog
      └─ Booking detail
          ├─ Header → Edit booking
          ├─ Overview → Trip summary + itinerary
          ├─ Vendors → Service lines, assignment, commercial context
          ├─ Tasks → Readiness + Open + Completed
          ├─ Travellers → Party and document status
          ├─ Documents → Evidence, request/reminder actions
          ├─ Finance → Customer instalments + supplier payables
          ├─ Vouchers → Blocked / awaiting / sent documents
          ├─ Communication → Threads and reply
          └─ Activity → Cross-section event history

Booking notes → Browse / compose / filter / pin
```

The user-facing tab called **Vendors** has an internal identifier of `services`; **Tasks** has the internal identifier `fulfilment`. Those identifiers should not be mistaken for different screens.

## 4. Users, assignment, and access

The screen models an agency owner and an operations team. The sample owner is Vrushabh Jain; team members include Neha Kapoor, Meera Iyer, and Rahul Sharma.

- Header ownership gives staff a point of accountability for the whole booking.
- Service assignment identifies the staff member following up on a supplier.
- Task assignment identifies who performs a particular next action.
- Watchers are people intended to receive updates, separate from the task assignee.
- Mine/Unassigned are directory work queues.

These are fixture labels and local selectors. Booking does not currently implement authenticated role permissions, staff notification delivery, or a server-enforced ownership system. The Mine queue uses a stored row attribute rather than a logged-in user's record query.

## 5. Booking directory

**Entry:** sidebar → Bookings. The initial stage is Upcoming.

| Column | Staff decision it supports |
|---|---|
| Checkbox | Select rows without opening them |
| Booking | Customer/trip title and booking reference |
| Travel | Travel dates and short party/timing context |
| Status | Operational state such as At risk, On trip, Completed |
| Next action | Immediate follow-up and due time |
| Finance | Amount/status requiring financial attention |
| Owner | Booking accountability / unassigned state |

There are four stage tabs: Upcoming, Travelling, Completed, Cancelled. Search matches displayed row text. The scope selector narrows to All bookings, Mine, or Unassigned. Filters combine; an empty state appears when no row matches.

Checkbox groups support selection and Clear. The footer updates the displayed range to the number of matching rows. Its page controls are a one-page presentation, not actual multi-page retrieval. Stage counts and many timing/status labels are fixtures; they are not derived continuously from today's date or operational changes.

Opening a row by click or keyboard reveals booking detail. **Current limitation:** the handler changes the visible view; it does not load the selected booking's record. Different sample rows open the same detailed XYZ Family · Dubai screen. This is a major context boundary, not separate real booking records.

Refresh and bulk Export are visible controls without refresh/export logic. Cancelled rows demonstrate a refund state; there is no complete cancellation/refund workflow implemented behind the tab.

## 6. Direct booking

**Entry:** Booking directory → Direct booking.

The dialog asks for booking name, travel start, and travel end. Create booking appends a local directory row with Upcoming/Mine attributes, Draft status, a `BK-NEW` reference, and a Set up booking next action.

Current result:

- Name defaults to “New booking” if blank.
- Travel start is shown in the row.
- Travel end is not used to build a complete trip record.
- A Settled finance badge is inserted as a placeholder, not derived from money received.
- No customer party, supplier services, accepted proposal, unique durable ID, or ledger is created.
- The row disappears when the embedded page reloads; opening it still shows the shared Dubai detail.

Therefore the current direct-booking interaction demonstrates an entry point, not a completed operational onboarding flow. It does not bypass supplier confirmation, create payment obligations, or reserve inventory.

## 7. Opening and editing a booking

The detail header provides booking title, travel context/reference, owner/team, and Edit. Its nine tabs organize operations by responsibility rather than forcing everything into one overview.

**Edit booking dialog:** name, travel start/end, and owner, with working-team context. Save currently updates the record title and the first displayed owner name. Dates, directory entries, breadcrumb text, traveller data, supplier scope, and finance figures are not recalculated from those fields.

Back and breadcrumb controls return to the directory inside the embedded page. The root application's Back control can retrace tab history before moving to a prior module. Tab overflow uses a More menu so the same sections remain accessible when space is limited.

## 8. Overview and itinerary

The Trip summary answers six questions:

1. Which customer/party is this?
2. What route and itinerary are agreed?
3. Who is the lead traveller/contact?
4. What is the travel start and return context?
5. Which original query led here?
6. Which accepted proposal version is the basis?

The Dubai example refers to query Q-1042 and Proposal v3. Lead traveller opens Travellers. Query/proposal labels give provenance but do not currently open a real query/proposal record from this HTML screen.

The itinerary table shows Day, Date, Destination/route, and Services. It lets operations locate delivery within the trip: arrival transfer/check-in, city tour, leisure days, and return transfer. Checkboxes and bulk controls exist, but View full itinerary, Export, and Add to voucher are not complete downstream flows.

Dates, nights, and duration copy are fixtures and can disagree; they are not validated against a shared itinerary model. An itinerary row describes when something occurs; it should not create another charge for a retained vehicle or included meal.

## 9. Vendors and service fulfilment

**Entry:** booking → Vendors.

This tab groups the actual service lines that operations must fulfil. Service summary shows count, confirmations, unassigned/vendor context, supplier cost, and projected margin. Each block contains:

- Service title/type and confirmation state.
- Location/schedule and internal assignee.
- Vendor name and supplier reference, or Not assigned.
- Supplier cost and any displayed difference from the proposal.
- Selling price.
- Voucher readiness/state.
- Contact or Assign vendor; a jump to Vouchers.

Search, service-type, and confirmation-status filters work against these local blocks. The primary fulfilment states are Confirmed, Confirmation pending, and Unassigned.

### Add from catalog

Open Add from catalog → search the sample Dubai catalogue → choose a hotel upgrade, transfer, activity, or visa item → Add. This appends a service block using the item's supplied title/vendor/cost.

This is a fixed local catalogue, not the current Vendor CRM service discovery/eligibility engine. It does not retrieve canonical vendor-owned tariff records or run route/capacity/tax checks.

### Add service line

The form offers Kind, Title, Location, Schedule, optional Vendor, and Supplier cost. Types include Hotel, Transfer, Activity, Visa, Flight, Insurance.

Add currently uses kind/title/vendor/cost. Location/schedule are not applied; the new row says Date to confirm. A named vendor produces a pending service; a blank vendor produces an unassigned one. A default internal assignee and blocked voucher are inserted.

Supplier cost is converted with a zero fallback; selling price is automatically `round(cost × 1.1)`. This is prototype behavior, not the approved Proposal selling decision or a shared tax calculation. Adding the block does not recompute the service-summary or Finance KPIs.

### Assignment and contact

Assign vendor asks for a name; Contact opens a prewritten confirmation follow-up; Watchers offers staff choices. Their submission handlers currently close the form without saving assignment, sending a message, or notifying watchers.

The screen expresses the intended workflow—assign supplier → request confirmation → record supplier acceptance → prepare voucher—but the HTML service blocks do not implement that full state transition. The separate transport handoff has a real local supplier-confirmation record, described in section 20.

## 10. Supplier costs, selling price, and margin

The UI distinguishes supplier cost from selling price and shows a projected margin at booking level. The example is ₹1,20,000 customer value and ₹86,000 supplier cost: ₹34,000 difference, approximately 28.3% of selling value.

Manage margin offers overall markup or per-service selling price, with percentage/fixed amount. It leads to Create price amendment rather than directly implying that an accepted customer price should silently change.

Other dialogs offer:

- Edit selling price: old and new amount.
- Edit supplier cost: old/new amount and reason, such as revised supplier rate or scope change.
- Create price amendment: reason, increase/decrease, amount, internal note.

These forms currently close without updating commercial records. Their displayed old amounts are not reliably bound to the clicked service. The HTML implementation has no shared tax profile selection or tax calculation in these forms.

Operational boundary to preserve: a supplier cost increase changes the agency's obligation. A change to the customer's agreed selling price requires a separate customer amendment governed by agreed terms. The transport actual-cost panel already retains this separation.

## 11. Tasks and readiness

**Entry:** booking → Tasks.

Readiness consolidates supplier confirmations, traveller completeness, verified documents, money to collect, vouchers needing action, and unread communication. Its purpose is to explain why a booking is not yet ready to travel.

Current readiness metrics are static examples; they are not recomputed from tasks, messages, document uploads, or payments.

The task workspace has Open and Completed sections. Rows contain Task/context, Assignee/role, Due, Status, Action. Search works independently in each section; Open can filter Open/In progress/Blocked.

**Create task:** enter title, assignee, priority, due, related context → Create. A nonempty title appends an Open row. Assignee/due/context are used; priority is present in the form but not carried into the created row's operational data.

**Status update:** Open → In progress / Blocked / Done through the row selector. Done moves the row into Completed and clears its selection. There is no equivalent implemented reopen flow from the static completed state.

Task changes do not confirm suppliers, verify documents, or settle payments. “Blocked by supplier confirmation” is explanatory context, not an enforced dependency engine.

## 12. Travellers

Rows show name and party context, phone, document/readiness status, and Documents action. Examples include a lead adult, another adult requiring a visa, and a child linked to a guardian.

Search and status filter support In review, Requested, Missing. Documents jumps to the Documents tab without automatically narrowing it to that traveller. Bulk Request documents opens the shared request form.

**Add traveller:** full name, details, optional phone → Add. A nonempty name creates a row with initials and Missing state. Detail is free text; the current form does not collect structured birth date, nationality, passport, child age, luggage, or transport-seat requirements.

Adding a traveller does not recalculate proposal acceptance, supplier vehicle suitability, hotel occupancy, payment value, or readiness KPIs. Traveller count/capability changes need downstream scope review rather than silent alteration of accepted supplier snapshots.

## 13. Documents

Documents are traveller evidence: passport, visa copy, birth certificate, etc. This is distinct from a supplier voucher.

Table: Document/type, Traveller, Status, Details, Action. Search combines with traveller and type filters. States shown include Verified, In review, Requested, Missing. Details identify receipt/verification channel/time/member or explain the missing requirement.

### Requests and reminders

Request documents opens a message form. Submit opens Communication and places the message into the current thread's reply box. A row reminder inserts a traveller/document-specific reminder in that same way.

This drafts a reply; it does not send a request automatically or reliably select the correct recipient thread. Staff must inspect the active recipient before sending.

### Upload and review

Upload file opens a filename form. Submit currently closes without uploading a file or adding a document. View details can expose the displayed row's facts; it is not a complete PDF/image viewer or verification process. Bulk export/request controls are not all implemented.

There is no automatic validity, passport-expiry, missing-required-document, or verification pipeline. Displayed Verified states are fixtures rather than new evidence checked by the application.

## 14. Finance

**Purpose:** inspect the booking's customer collection and supplier obligations separately.

### Finance summary

Four cells show Booking value, Received, To collect, Supplier cost. The sample value is ₹1,20,000, received ₹45,000, outstanding ₹75,000, supplier cost ₹86,000. These figures are static and not recomputed by payment actions.

### Customer instalments

Rows show instalment/name/method, Due, Amount, Balance, Status, Action. Search and Paid/Due filtering work.

- **Add instalment:** label, due date, amount → appends a local Due row; entered amount is shown as both amount and balance.
- **Edit instalment:** label/due/amount/status → form closes without saving.
- **Record customer payment:** amount/date/method/reference/note → marks the first Due row (or fallback row) Paid and sets its visible balance to zero. It does not allocate the entered amount, support partial payment correctly, append a receipt, or update summary/ledger.

Thus recording ₹1 must not be interpreted as evidence that the displayed ₹75,000 receivable was settled; the current handler does not use the amount to calculate balance.

### Supplier payables

Rows show Service, Vendor, Cost, Paid, Balance, Status, Action. Search and status filters work; fixtures include Paid, Overdue, Scheduled, Blocked. Unassigned supplier lines are shown as blocked obligations.

Record supplier payment asks for vendor/service/amount/method/reference. Submit currently closes without changing paid/balance/status or writing a Finance transaction. No bank payment is executed.

### Relationship to agency Finance

The HTML amounts are not a shared live ledger. The same booking ID can carry different fixture amounts in All finances. Only the separate confirmed transport obligation helpers have a defined browser-stored handoff to the root Finance integration. Do not reconcile modules by displayed name or assume a Booking payment button updates agency Finance.

## 15. Vouchers

**Purpose:** ensure each supplier service has a usable fulfilment document before travel.

Rows prioritize the service, then voucher filename/state, details, and actions. States distinguish:

- **Blocked:** supplier not assigned/confirmed; jump to Vendors for resolution.
- **Awaiting:** supplier is confirmed but voucher has not been supplied/uploaded.
- **Sent:** a voucher version has been shared, with filename and time.

View exposes voucher metadata: file, received from/via, sent to, version. It does not load a real stored file. Replace/Upload use the filename-only upload dialog and do not persist a replacement. Send vouchers and export do not perform delivery/download.

The intended dependency is service assignment/confirmation → obtain voucher → validate version → send to traveller. Current states illustrate this dependency; they do not implement automatic blocking/unblocking when other tabs change.

## 16. Communication

The workspace separates conversations from the selected thread. Each conversation identifies contact, traveller/vendor role, WhatsApp/Email channel, preview/time, unread state.

- Opening a thread changes the current conversation and clears its unread flag locally.
- The thread shows incoming/outgoing messages, actor/time, and attachment metadata.
- Reply → Send appends a local outgoing message to that thread. Blank replies are rejected by focusing the field.
- New message asks for recipient/channel/message, but its submit handler currently closes without creating or delivering the message.
- Request documents and reminders route into the reply composer.
- Save to Documents from an attachment jumps to Documents; it does not save a file. Attachment Preview has no complete file preview behavior.

No WhatsApp/email provider is called. Local reply, unread changes, and attachment labels are not transmission/receipt evidence. The tab badge can remain at its fixture count even when the conversation list's unread count changes.

## 17. Activity history

The Activity table shows date/time, member/role, event, and module. Filters search displayed text and narrow to Bookings, Services, Documents, Finance, Vouchers, or Tasks. This helps staff reconstruct the example booking's operational history.

Events are seeded. The local payment/task/service/message handlers do not consistently append immutable activity records. Selection and Export are displayed; export is not implemented.

This is booking history, not the Activities service category. It should not be used as an authoritative financial audit trail without actual mutation/event integration.

## 18. Booking notes

The root Booking notes controls open the embedded notes drawer. Staff can browse/search notes, use All/Pinned/My notes filters, and compose a note with a related record and pin setting.

Save requires nonempty text and inserts a local note with current-owner label and “just now.” Notes are useful for unconfirmed requests and team context—such as adjoining rooms requested but not promised.

Current behavior is session-only. The removal action removes a displayed element, not necessarily the backing note array; rerendering can restore it. The initial badge is sample content and is not a consistent derived pin count until updates run. Pinning a note is not assigning a task or updating supplier scope.

## 19. Accepted transport handoff

**Entry:** approved Proposal → Open Bookings, or open Bookings after handoff records have been stored.

The panel is outside the embedded sample booking. It groups accepted services by proposal ID and accepted version, and displays supplier name, tariff version, accepted amount, and confirmation state.

The stored service snapshot contains:

- Vendor/service/card identity and currency/version.
- Trip inputs and selected vehicle arrangement.
- Supplier tariff/rules at acceptance.
- Reusable Vehicle Offering values at acceptance.
- Approved supplier tax profiles used in that calculation.
- Calculation breakdown, payable, actuals, and conditions.

It therefore uses the accepted terms even if Vendor CRM later edits a tariff. It is not a new service-owned rate card.

One continuous hire can appear on several itinerary days. Handoff creation deduplicates by `transportHireId`, falling back to service ID. Reopening the same proposal/accepted version reuses its existing transport handoff rather than duplicating obligations.

The Booking panel shows the latest accepted version per proposal. Finance's selection rule separately preserves the latest **confirmed** obligation per proposal/hire, so a new unconfirmed accepted version does not automatically replace the last confirmed amount.

An accepted handoff does not create a populated HTML directory/detail booking. That record integration remains separate.

## 20. Transport actuals and supplier confirmation

### Resolve actual usage and charges

For an Outstation/km service, enter Actual chargeable km. If the accepted tariff has applicable Actual charges, fields ask for supplier invoice amounts for those charges, tax included. Add an adjustment reason/invoice/trip-sheet reference.

The preview recalculates with the **accepted tariff, vehicles, and tax profiles**. Missing actual charges or failed scope/rule checks prevent recording. Record supplier actuals stores the revised supplier payable and the delta from the previous payable; it does not add the whole revised amount again.

Example, before unchanged extras/tax:

```text
Previously billed: 750 km × ₹22 = ₹16,500
Revised billable distance: 900 km × ₹22 = ₹19,800
Additional supplier amount: ₹3,300
```

The engine applies minimum/day rules before deciding billable distance. “150 extra km” is correct only where the resulting billable distance increases from 750 to 900. Driver costs and other unchanged components must not be charged a second time.

Record requires a reason and uses an amendment ID; a repeated amendment ID returns the existing record. Latest amended payable becomes the next comparison basis.

**Current UI limits:** the form exposes total km and Actual amounts, not every possible daily-usage/time amendment. It builds the new input from the original snapshot; repeated adjustments should explicitly re-enter complete current actuals. It has no actual service-day log, vendor invoice upload, or vehicle dispatch workflow.

### Confirm supplier booking and payable

Once a payable is resolved, enter supplier acceptance/booking reference → Confirm supplier booking and payable. This records reference, confirmed amount/time, and the amendment count included in that confirmation.

After a new amendment, the panel asks for confirmation again. Finance can keep the previous confirmed obligation until the new payable is confirmed. This preserves the difference between an estimated/revised amount and a supplier-agreed obligation.

Confirmation does not execute payment, change the customer's selling price, or issue a voucher. Amendment history explicitly instructs staff to review customer terms separately.

## 21. Accepted activity handoff

Approved activity services carry a price snapshot with supplier, card version, currency, request, result, and availability state. The Booking wrapper displays these under Accepted activity supplier prices.

- Available/confirmed session is distinguished from an unconfirmed supplier session.
- An accepted price alone is not a reservation.
- Storage uses proposal ID and accepted version.
- Re-recording replaces that same proposal/version entry; older versions remain in the store.

This panel is primarily inspection. It does not offer the transport panel's confirmation, actual-cost amendment, or Finance obligation workflow. It can display multiple accepted versions and should not be interpreted as an automatically deduplicated activity ledger.

## 22. Navigation and related modules

Direct module link: `/?module=bookings`. The working HTML is embedded through `/booking/index.html`; that file is generated from the source during preparation/development.

The root app provides the common sidebar/topbar and intercepts cross-module navigation. Original embedded sidebar/topbar are hidden. Bookings' internal tab history remains distinct from the root module history.

Connected responsibilities:

| From/to | Current relationship |
|---|---|
| Packages/Proposal → Booking | Approved transport/activity snapshots recorded on Open Bookings; not full conversion into HTML booking rows |
| Vendor CRM → Booking | Canonical tariffs/capabilities feed costing before acceptance; sample HTML catalogue and vendor labels are separate |
| Booking → Finance | Confirmed transport obligation helpers; HTML customer/supplier payments remain fixtures/local interactions |
| Booking → Destination | Shared module navigation; no live dispatch/location tracking |

Global search/notifications/account chrome does not imply a full cross-booking indexed search or authenticated account integration.

## 23. Persistence and action boundaries

| Flow/control | Current result |
|---|---|
| Stage/search/scope filters | Work against local rows |
| Open booking | Opens common Dubai detail, not selected-record data |
| Direct booking | Adds session-only placeholder row |
| Edit booking | Changes displayed title/owner only |
| Add service/catalogue item | Appends local block; hardcoded 10% selling increase; no KPI recalculation |
| Assign vendor/contact/watchers | Dialog closes; no saved assignment/send/notification |
| Margin/price/cost/amendment dialogs | Dialog closes; no commercial mutation |
| Create task/status/Done | Local row creation/status/move |
| Add traveller | Local Missing row |
| Request/remind document | Prefills current communication reply; not automatically sent |
| Document/voucher upload | Filename dialog only |
| Record customer payment | Marks one displayed row Paid, independent of entered amount |
| Add instalment | Appends local Due row |
| Supplier payment / edit instalment | Dialog closes without ledger change |
| Existing thread reply | Appends local message; no provider delivery |
| Notes | Local array/DOM; reset on reload |
| Activity/readiness/KPIs/badges | Mostly seeded, not a consistent derived event model |
| Refresh/export/send vouchers/full itinerary | No complete handler |
| Transport accepted snapshots | Browser local storage; original accepted version preserved |
| Transport actuals/confirmation | Browser-stored amendments and confirmed payable |
| Activity accepted snapshots | Browser local storage; read panel |

Browser storage is device/browser-specific, not a shared server ledger. Reloading or leaving/re-entering the embedded page resets its local operations, while snapshot records can remain. The visible Booking UI and Finance fixtures must not be described as one synchronized database.

Review basis: source inspection plus read-only preview inspection of the Booking directory and embedded tab structure. This document does not claim every mutation has been retested end to end.

## 24. Example operational journeys

### A. Operations resolves a pending hotel

Bookings → Upcoming → search trip → open booking → Vendors → identify pending hotel/vendor/reference → Contact for confirmation → obtain supplier acceptance → prepare/upload voucher → send to traveller → complete follow-up task.

Today the navigation and sample context work; supplier confirmation/upload/delivery in the HTML flow remain incomplete. Do not claim a contact-dialog submit completed this sequence.

### B. Missing child's passport

Booking → Travellers → child Missing → Documents → traveller/type filter → passport reminder → Communication draft → check guardian's recipient thread → Send local reply → follow up on Tasks.

Current document verification/readiness do not automatically change after the reply.

### C. Accepted transport changes after travel

Proposal Approved → Open Bookings → accepted transport panel → enter complete chargeable km/actual charges + reason → inspect revised payable/delta → record actuals → obtain supplier agreement → enter confirmation reference → confirm payable → Finance reads one confirmed obligation.

Customer collection is a separate decision under the accepted actuals terms.

### D. Customer collection follow-up

Booking → Finance → customer Due instalment → inspect amount/balance → Record payment form → reconcile with real payment evidence.

The last step requires a real receipt/ledger implementation; current row styling must not be used to prove money received.

## 25. Rules to preserve

1. Booking fulfils an accepted arrangement; Proposal owns customer needs and selling decisions.
2. Accepted versions and supplier snapshots must survive later tariff/proposal edits.
3. Customer approval, supplier confirmation, voucher issuance, and payment are different states.
4. Each service retains supplier assignment/reference, scope, cost, selling context, and readiness.
5. Travellers and their evidence remain distinct from service vouchers.
6. Tasks/notes/messages support fulfilment; changing them must not silently alter money or confirmation.
7. A continuous vehicle hire is counted once even when referenced on several days.
8. Unknown/Actual amounts remain unresolved until confirmed; zero needs an explicit basis.
9. Amendments calculate a delta from the previous supplier obligation.
10. Supplier changes do not automatically rewrite accepted customer prices.
11. Finance consumes one latest confirmed obligation per accepted hire, not repeated full amounts.
12. Preserve recipient checks when document actions draft communication.
13. Keep prototype labels, working local mutations, durable browser records, and future integrations distinguishable.

## 26. Source map and reusable context

| Area | Current sources |
|---|---|
| Booking directory, detail, dialogs, local interactions | [booking-redesign.html](../../../src/modules/bookings/booking-redesign.html) |
| Root Booking entry and handoff panels | [BookingModule.tsx](../../../src/BookingModule.tsx) |
| Accepted transport/amendment/confirmation UI | [TransportBookingHandoffPanel.tsx](../../../src/TransportBookingHandoffPanel.tsx) |
| Snapshot/obligation selection | [bookingTransportHandoff.ts](../../../src/bookingTransportHandoff.ts) |
| Accepted activity snapshots | [bookingActivityHandoff.ts](../../../src/bookingActivityHandoff.ts) |
| Proposal accepted-value model | [proposalModel.ts](../../../src/proposalModel.ts), [serviceCosting.ts](../../../src/serviceCosting.ts) |
| Module navigation/frame integration | [App.tsx](../../../src/App.tsx), [embeddedModuleFrame.ts](../../../src/embeddedModuleFrame.ts) |
| HTML preparation | [prepare-assets.mjs](../../../scripts/prepare-assets.mjs) |

### Short context to carry into the next agenda

Paryatech Booking is the fulfilment workspace for an accepted customer journey. Its directory has Upcoming, Travelling, Completed, Cancelled, with search and owner queues. Detail has Overview, Vendors, Tasks, Travellers, Documents, Finance, Vouchers, Communication, Activity. Staff organize supplier confirmation, evidence, vouchers, collection and follow-up around individual service lines. The current embedded HTML is a detailed operations prototype, not a shared booking database: all directory rows open one Dubai example, many forms only close, and finance/readiness data are mostly seeded. Separate React panels display accepted Proposal transport/activity price snapshots. Transport additionally records actual-cost deltas and supplier confirmation, with Finance reading the latest confirmed obligation per hire. Preserve accepted versions, single-count retained hires, unknown/actual charges, and separation of supplier payable from customer selling price. Use section 23 before assuming an action persists or posts to another module.
