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
