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


# All Finance: current source and UI audit

Reviewed: 5 October 2026. Scope includes agency-wide Finance, shared supplier tax settings, confirmed-transport adapter, Booking Finance and Vendor Finance/bank/statement context. Similar-looking contextual screens currently use separate prototype fixtures.

## Primary and secondary destinations

| Primary area | Views and decisions |
| --- | --- |
| Overview | Derived outstanding, outgoing obligations, cash and review items; attention rows; dated cash assumptions; recent activity |
| Receivables | To collect, Invoices, Customer accounts, Credits & refunds; obligation detail; pending receipt review; advance and refund drawers |
| Payables | To pay, Bills, Vendor accounts, Credits & recoveries; supplier commitment detail; staff reimbursement; search/empty results |
| Transactions | Canonical money register; type/search filters; verified/pending records; record drawer; external reference, allocation and bank-match distinctions |
| Expenses | All scopes, Agency, Booking; expense/claim detail; incurred/due/review/payment/evidence; reimbursement action |
| Bank & cash | Recorded HDFC/petty cash; statement comparison; unmatched row; cash context; bank-match stubs |
| Reports | Customer ageing, Supplier ageing, Customer & vendor statements, Receipts & payments, Expenses & reimbursements, Booking profitability, Cash outlook, Advances & recoveries, Exceptions & closing |
| Approvals & closing | Period review, Payment approvals, Adjustments, Accounting export; current preview actions do not lock/export/post |

Global Activity opens a separate event trail/filter/detail. Shared Finance notes use WorkspaceNotes; FinanceApp's own standalone note panel is hidden by the unified wrapper. Supplier tax settings are above the main page in a collapsible section.

## Arithmetic and identity baseline

The evaluated baseline JSON contains 5 obligations, 7 canonical money records, 3 expenses, 2 accounts, 13 activity events, 7 forecast movements, one unallocated advance and one refund case. Amounts in FinanceModel are integer paise.

XYZ: accepted selling price ₹1,20,000, verified receipt ₹40,000, remaining ₹80,000. Hotel commitment ₹70,000 with ₹30,000 applied leaves ₹40,000; transport ₹25,000 remains. Supplier outstanding ₹65,000 plus staff ₹7,000 = ₹72,000 outgoing obligations. Direct projected margin ₹25,000 differs from recorded trip cash ₹10,000.

Kapoor's existing receipt ₹12,000 is unverified at baseline: agency customer outstanding ₹92,000. Rejecting proof keeps the debt. Verifying/applying the existing receipt reduces it once to ₹80,000; it does not create a second receipt. Both outcomes have current screenshots. Later screenshots from that same local session show the verified state and a test transfer; the embedded source baseline remains unchanged. An incidental toast on a later screenshot is not an action on that later page.

Recorded bank ₹2,36,800 plus cash ₹10,000 = ₹2,46,800. Statement difference ₹750, unmatched visible credit ₹7,500 and unexplained remainder −₹6,750 are distinct. Forecast minimum ₹1,81,800 and closing ₹2,58,300 are assumptions, not received money.

## Record money form and validation

Four modes: Receipt, Supplier payment, Agency payment, Account transfer. Select the applicable obligation/expense/party or source/destination account, amount, occurrence date, external reference and note/evidence fields as exposed. Recording does not execute movement.

The source checks positive amount rounded to integer paise, eligible targets, remaining obligation, available source account, distinct transfer accounts, required reference and duplicate external reference. Form dates use the fixed fixture review date, 26 September 2026. New records/events use React memory, remain awaiting verification/application, and do not update all reports/account totals.

Current screenshots include all four forms, over-source-balance error and a recorded-awaiting-verification transfer result. The documentation scenario used ₹100 and reference CONTEXT-AUDIT-TRANSFER after a rejected ₹3,00,000 attempt. It changed local UI state only; no money moved. Every other guard's exact text and handler is retained in source; each distinct validation permutation is not separately screenshot verified.

## Shared supplier tax and transport adapter

The baseline has zero shared approved supplier tax profiles. Add requires name, 0–100% rate, approved credit treatment and Finance approval reference. Saving writes an approved local browser profile. The handoff does not invent an approved 0% rate to resolve suppliers.

Confirmed transport obligations appear conditionally above FinanceApp when Booking snapshot storage contains supplier-confirmed hires. This adapter is not merged into dashboard/Payables/static obligations. It uses currency units while Finance fixtures use paise; a durable integration needs explicit conversion and identity reconciliation. The conditional adapter has source context but no current default screenshot.

## Contextual Finance included in this guide

Booking Finance: instalments, supplier payables, customer/supplier record forms, add/edit instalment and local row facts. Booking's Record customer payment can immediately mark a row Paid, unlike agency proof verification. Do not treat this as a safe shared posting implementation.

Vendor Finance: four summary measures, supplier payables, bank details/edit form and statement of account. Current Vendor reference screenshots are embedded in this guide, not merely linked externally. Bank master data does not execute a payment and must not rewrite historical beneficiary snapshots. Add-bank form/source branches are included in the source inventory; existing edit capture is not proof that every add-form variant was photographed.

## Unsupported/conditional boundaries

No production bank feed, money processing, general verification/allocation editor for every new transaction, invoice issuance, bill matching, refund disbursement, accounting journal/period lock/export, durable permissions or posting service is implemented. Visible preview/CSV controls and records must be read at their actual handler boundary.

Finance notes composition, a related/pinned draft, and its saved result were captured after a screenshot-tool recovery. The marked local example was deleted after capture. Other conditional or uncaptured states remain identified in the coverage ledger. Source-only states must never be reported as screenshot verified.

Image QA replaced the incompletely painted Finance overview with a clean-baseline capture. In the receipts/payments and cash-outlook reports, sharp current scroll continuations and earlier full-view images are retained. Additional report recaptures were blurred by the browser capture tool and were rejected. Final gallery QA also excluded one unfinished current supplier drawer frame and two unfinished earlier customer/activity drawer states. Complete current drawers supply their replacement evidence. The coverage section names each exclusion; no source fixture was changed.


# Finance module — UX flows and operational context

Reviewed against the current main-repository implementation on **3 October 2026**. This is an implementation handoff for another agent, not a proposed redesign or an accounting/legal policy.

Visual companion: [Finance screens and user flows](finance-module-ui-context.html). The HTML contains actual browser captures, entry points, actions, short operational explanations, and field/control inventories.

## 1. What this module does

**All finances** in the global sidebar opens the agency-wide Finance workspace. It brings together customer amounts to collect, supplier amounts to pay, external money records, agency expenses, bank/cash positions, reports, and review work.

Paryatech **records money that moved outside the platform**. Recording a receipt or payment does not send or receive money. It also does not reserve a service, confirm a supplier, or approve a customer price.

The current workspace is a **sample UI with integer-paise fixtures and local interactions**. It demonstrates financial meanings, but it is not a durable accounting ledger. Some contextual financial surfaces elsewhere in Paryatech still have independent fixture data.

### Main journey

```text
All finances
  → Overview → select a metric / item needing attention
  → Receivables / Payables / Transactions / Expenses / Bank & cash
  → specific source record drawer
  → record an already-completed external movement where supported
  → transaction awaiting verification, not yet applied
  → effective application changes outstanding only through an implemented verification path
  → source-linked activity and reports
```

Eight primary destinations:

1. Overview.
2. Receivables.
3. Payables.
4. Transactions.
5. Expenses.
6. Bank & cash.
7. Reports.
8. Approvals & closing.

The code internally calls the eighth destination `controls`. The visible label is **Approvals & closing**.

## 2. Ownership and boundaries

| Object / decision | Responsible area | Finance meaning |
| --- | --- | --- |
| Customer trip and selling price | Proposal, then accepted Booking snapshot | Basis of the authorised customer obligation |
| Supplier offering and tariff | Vendor CRM | Source pricing, not a posted payment |
| Supplier reservation / confirmation | Booking | Evidence of the operational commitment |
| Customer or supplier obligation | Shared Finance domain in the intended architecture | Amount owed, due date, party and supporting document |
| External receipt/payment | Finance | One money record with one canonical identity |
| Application of money to debt | Finance | Effective allocation; not the bank match |
| Bank match / reconciliation | Finance | Connection to statement evidence; independent of invoice settlement |
| Supplier tax profile | Finance-owned shared configuration | Approved rate, approval reference and recoverability |
| Customer refund / supplier recovery | Separate Finance cases | Do not silently net the two |
| Activity event | Linked to its source record | Explains a change; does not create another charge |
| Vendor bank details | Vendor CRM master data | Beneficiary data; historical payments need their own snapshots |
| Contextual Booking/Vendor financial views | Readers of the shared domain in the intended architecture | Current preview adapters are not a completed shared ledger |

No direct edit of the outstanding balance is offered. It is derived from original obligations and effective applications. A commitment and its matching bill represent the same cost; adding them together would double-count.

## 3. Current source map

| Source | Role |
| --- | --- |
| `src/App.tsx` | Global module selection and shared outer shell |
| `src/FinanceModule.tsx` | Lazy Finance entry, supplier-tax panel, confirmed-transport obligation summary, local navigation adapter |
| `src/modules/finance/FinanceApp.tsx` | Eight destinations, record drawers, money forms, sample receipt verification, reports and internal notes |
| `src/modules/finance/financeModel.ts` | Integer-paise fixtures, balances, due-state and report arithmetic |
| `src/SupplierTaxProfilesPanel.tsx` | Shared approved-profile entry form |
| `src/modules/vendors/rateCard/supplierTax.ts` | Browser-local supplier tax profiles and approved-profile lookup |
| `src/bookingTransportHandoff.ts` | Accepted transport snapshots, actual-cost amendments, supplier confirmation, one confirmed obligation per hire |
| `src/modules/vendors/components/VendorFinancePanel.tsx` | Vendor-scoped bank details, payable fixtures and statement presentation |
| `src/modules/vendors/data/vendorFinance.ts` | Vendor Finance fixture records |
| `public/booking/index.html` | Generated Booking UI with its contextual Finance screens |

See the [Booking context](../bookings/booking-module-ux-operational-context.md) and [Vendor context](../vendors/vendor-module-ux-operational-context.md) for those contextual flows. The older [Finance source audit](finance-v1-source-audit.md) describes historical standalone paths; use the current source map above for this consolidated repository.

## 4. Overview

Entry: sidebar **All finances**, or Finance → **Overview**.

Information order:

1. Agency/branch scope, balance date, INR, **Sample workspace**.
2. Four linked metrics: customer outstanding, outgoing obligations, recorded bank & cash, review needed.
3. **Needs attention**: party/booking, due item and review/document, remaining amount, due state, next action.
4. **Cash outlook**: opening recorded cash, lowest projected balance, forecast closing balance, dated assumed movements.
5. **Recent activity**: four recent events by default; searchable, with **View all activity**.

Metric → corresponding destination:

- Customer outstanding → Receivables.
- Outgoing obligations → Payables.
- Recorded bank & cash → Bank & cash.
- Review needed → Approvals & closing.
- Recent Activity / View all activity → Transactions → Activity.

Click a party, source reference or next action to open the source drawer. Forecast items open their source context; some forecast references only have an explanatory drawer, not a complete document.

The review date is **26 September 2026**, even if the current calendar date is later. The preview does not refresh it automatically.

## 5. Receivables

Entry: Finance → **Receivables**.

Summary: total outstanding, overdue subset, receipts awaiting verification, unallocated customer money.

| Secondary tab | Content | User flow |
| --- | --- | --- |
| To collect | Searchable obligation table | Party/document/action → obligation drawer → Record receipt |
| Invoices | Fixture issued-document rows | Document → the same obligation drawer |
| Customer accounts | Open party positions represented by the fixture rows | Party → same obligation context |
| Credits & refunds | Singh Family advance, Nair Family refund | Case → informational case drawer |

**To collect** columns: Party / booking; Due item / review; Remaining; Due; Next action. Search uses customer, booking and document. **Clear filters** resets the search. **Export CSV** downloads the current rows.

The current Invoices and Customer accounts tabs are presentations of the filtered open obligations. They are not full invoice issuance or customer-ledger management products.

### Customer obligation drawer

Shows remaining amount, party, Booking reference, supporting document, due date/state, document state, owner, original amount, why the record exists, and related activity. **Close** returns to the list. **Record receipt** opens a form already linked to that obligation.

### Kapoor proof-review example

The ₹12,000 receipt already exists as `RCPT-2026-0088`. Its instalment remains unpaid while proof is pending.

- **Verify and apply existing receipt**: changes the existing receipt to Verified, applies ₹12,000 to `COL-00029`, adds a verification event, and removes that amount from confirmed outstanding.
- **Reject proof**: keeps the debt open, records rejection and leaves the original receipt identity intact.
- These are local React-state interactions specific to this sample receipt. They are not a general verifier for every newly created transaction.

The guide captures the pending state without choosing either decision.

### Advance and refund

Singh Family's ₹10,000 advance belongs to that customer and is not applied to an invoice. It must not reduce another family's debt.

Nair Family's ₹18,000 refund is approved and due, but approval is not payment. Supplier recovery is separate. The current case drawer explains this; it has no implemented refund disbursement or allocation form.

## 6. Payables

Entry: Finance → **Payables**.

Summary: all outgoing outstanding, supplier outstanding, staff reimbursement due.

| Secondary tab | Operational meaning |
| --- | --- |
| To pay | Supplier and reimbursement obligations, search and CSV export |
| Supplier bills | Supplier document/commitment references supporting open amounts |
| Vendor accounts | Supplier positions from the same obligations |
| Credits & recoveries | Explanatory empty state; linked refund case |

**Record payment** opens a Supplier payment form. Rows open an obligation drawer with original amount, remaining balance, due state, document state and reason.

Trailmakers' hotel amount remains a confirmed commitment even though the bill has not arrived. Later receiving a bill must consume/reclassify that commitment, not add another ₹70,000 cost.

Staff reimbursement is included in outgoing obligations but is not a supplier bill. The relevant action is **Record reimbursement**.

The current preview does not implement supplier bill creation, commitment-to-bill matching, vendor credits, recovery approval, or a payable adjustment writer.

## 7. Record money — all four forms

Entry: page action **Record money**, **Record receipt**, **Record payment**, or **Record reimbursement**; an obligation drawer can preselect the target.

The same right-hand form contains four record types:

| Type | Eligible target | Direction / operational meaning |
| --- | --- | --- |
| Receipt | Existing customer obligation | Incoming external money |
| Supplier payment | Existing supplier obligation | Outgoing external money |
| Agency payment | Approved reimbursement obligation in this preview | Outgoing reimbursement; not a general expense creator |
| Account transfer | Fixed HDFC → Petty cash route | Internal movement; neither revenue nor expense |

Fields:

- Target obligation where relevant.
- Amount in INR.
- **When money moved**, distinct from recorded timestamp.
- External reference: bank UTR, UPI reference or cash voucher.

Actions: select type; select target; enter details; **Record for verification**; **Cancel**; close form.

Validation in the current form:

1. Amount converted to integer paise; positive and safe integer required.
2. Existing eligible target required unless account transfer.
3. Amount cannot exceed target remaining balance.
4. Transfer cannot exceed the fixture source-account balance.
5. External reference required.
6. Case-insensitive duplicate reference blocked against currently loaded transactions.
7. Required fields/date constraint are also enforced by native inputs. The maximum date is the fixed sample date, 26 September 2026.

On a valid save:

```text
One new local money record
  Verification: Awaiting verification
  Allocation: Not applied (or Not applicable for transfer)
  Bank match: Unmatched
  → one Money activity event
  → form closes / confirmation appears
  → outstanding balances remain unchanged
```

This is not a payment gateway. There is no general UI in this preview that verifies and allocates the newly recorded money later. Do not describe this form as a fully closed settlement workflow.

## 8. Transactions

Entry: Finance → **Transactions**.

### Register

Columns: Reference / date; Type & party; Linked record(s); Amount; Verification; Account.

Linked-record cells also show allocation and bank-match states. Search uses transaction identity, party, links and type. **Export CSV** exports current rows. A record reference opens its drawer.

### Money record drawer

Fields: amount, party, occurred timestamp, recorded timestamp, recorded by, linked records, external reference, verification, allocation, bank match, account. Related activity opens event details.

The same money movement is not separately duplicated under an invoice, vendor, booking and account. Those are contextual links/applications in the intended model.

### Activity

Columns: Date; Event; Record; Member. Date distinguishes happened from recorded. Member shows initials/name/role.

Search covers event, category, record, party, actor and context. Category filter: All events, Money, Verification, Allocation, Review, Bank match. CSV exports event identity and timestamps.

Event → event drawer → **Open source record**. The drawer explains **What changed**. Activity never stands in for a money record.

Current pagination on Finance lists is a single-page presentation of all matching fixture rows. It does not fetch additional pages.

## 9. Expenses

Entry: Finance → **Expenses**.

Summary: listed expenses, agency expenses, booking expenses, reimbursement due. Reimbursement due is an unpaid subset, not another expense to add.

Columns: Expense; Payee / scope; Incurred / due; Amount; Review; Payment. Search by expense/payee/ID. Scope filter: All scopes, Agency, Booking. CSV exports the filtered list.

Expense → drawer showing payee, scope, incurred/due dates, review, payment, evidence label and linked payment.

- Paid software subscription → **Open linked payment**.
- Approved trip incidentals → **Record reimbursement** → Agency payment form linked to approved claim.

There is no create-expense, upload-receipt, approve-claim or full reimbursement-policy workflow in the current Finance UI. Evidence is fixture metadata, not a functioning attachment viewer.

## 10. Bank & cash

Entry: Finance → **Bank & cash**.

Two selectable account cards:

- HDFC Bank, ending 2163, ₹2,36,800 recorded, reconciled through 25 September.
- Petty cash, Kochi office, custodian Meera Iyer, ₹10,000 recorded, count due.

### HDFC

Shows statement date, reconciliation context, unresolved banner, four comparison amounts, and an unmatched incoming row.

**Review statement row** / unmatched row → explanatory statement drawer. There is no accept-match, import-statement or reconcile action in this preview.

### Petty cash

Shows custodian and cash-count requirement. The UI explains the count workflow, but no counted amount/date form is implemented.

Recorded bank/cash is a stock balance, not the sum of customer invoices, forecast receipts, or unverified proofs.

## 11. Reports — every current report

Entry: Finance → **Reports** → choose a report card → report basis/totals/source rows → source drawer.

**All reports** returns to the catalogue. Most report detail screens support CSV download.

| Report | Basis and current behavior |
| --- | --- |
| Customer ageing | Remaining customer obligations by current due-state labels |
| Supplier ageing | Remaining supplier commitments, including bill-not-received cases |
| Customer & vendor statements | Choose Customer/Supplier, then party; charges less verified effective applications gives a running balance |
| Receipts & payments | Verified external movements; internal account transfers excluded; signed net movement is not profit |
| Expenses & reimbursements | Listed incurred costs; unpaid reimbursement remains a status of that cost |
| Booking profitability | One fixture booking: accepted ₹1,20,000 less confirmed direct ₹95,000 = projected ₹25,000 |
| Cash outlook | Dated expected movements separate from opening recorded cash |
| Advances & recoveries | Party advance and customer refund displayed separately; no misleading combined total |
| Exceptions & closing | Pending receipt proof and unexplained statement row |

The sample statement opens with a zero opening balance for its fixture period. Only verified transactions whose allocation label ends in “applied” become statement applications. A pending Kapoor receipt appears as a warning, not as a settled invoice.

Several report dates and schedules are labels over fixture arrays, not implemented date-filter queries. Do not describe ageing as a full bucketed ageing engine or the CSV as a posted accounting batch.

## 12. Approvals & closing

| Tab | Present interaction |
| --- | --- |
| Payment approvals | Empty explanation; no approval request form |
| September review | Bank explanation → Bank & cash; missing hotel bill → obligation; pending receipt → Activity |
| Adjustments | Empty explanation; no direct balance edits or posted adjustment form |
| Accounting export | Not configured; no account mapping or batch preview/export |

The period remains open. Properly recorded open debts can carry forward; resolving evidence/reconciliation differs from paying every debt.

## 13. Supplier tax profiles

A collapsible panel above the main Finance UI manages shared supplier tax configuration.

Fields: profile name, approved rate (%), credit treatment (Recoverable / Not recoverable), Finance approval reference.

**Record approved profile** is enabled only when name, 0–100 rate, credit treatment and approval reference are present. Saves a profile with a stable local ID, fractional rate, approval flag, reference and recoverability.

Profiles are stored at `paryatech:supplier-tax-profiles:v1` and read by Vendor CRM and supplier costing. This is browser-local shared configuration. The UI does not provide profile editing/deactivation, jurisdiction rules, approval permissions or a production tax service.

Operational separation:

- Supplier tax mode on a tariff says inclusive or exclusive.
- The selected approved shared profile resolves the supplier tax and cost basis.
- Customer-side tax and agency selling-price decisions remain separate.
- Never infer a statutory GST rate from the vehicle label or this illustrative guide.

## 14. Confirmed transport obligations

When supported accepted transport handoffs exist and Booking records supplier confirmation, the Finance wrapper can show **Confirmed transport supplier obligations**.

Flow:

```text
Approved proposal
  → accepted tariff/request/result snapshot
  → Booking actual-cost amendment, if necessary
  → explicit supplier confirmation reference and current payable
  → one Finance summary obligation per proposal + continuous hire
```

The reader chooses the latest confirmed version per proposal/hire. It includes only amendments covered by the supplier confirmation. A newer unconfirmed draft must not replace an earlier confirmed obligation.

The displayed obligation summary is **not currently merged into FinanceApp's static OBLIGATIONS, Payables, dashboard or cash register**. It is a separate adapter view. This is a material integration boundary for the next agent.

Handoff storage: `paryatech:transport-booking-handoffs:v1`. The transport engine uses numeric currency-unit amounts, while FinanceApp fixtures use integer paise. A durable integration must convert explicitly and reconcile identities; linking two views alone does not achieve that.

## 15. Contextual Finance elsewhere

### Vendor CRM → vendor → Finance

Shows billed, settled, outstanding, overdue; bank details; supplier payable rows; statement of account. Bank add/edit fields include bank name, registered holder, account number, IFSC, optional type/branch and preferred-account setting. Bank master details can be stored locally.

Vendor statement/search/CSV presentation is supplier context. Its static monetary fixtures are not automatically the same numbers as agency Finance. Payment-beneficiary history must eventually snapshot the account used.

### Booking → booking → Finance

Shows customer instalments and supplier payables in a Booking context. The generated HTML still contains local DOM interactions; some receipt submission behavior can mark an instalment paid immediately. That differs from Agency Finance's pending-verification rule.

Neither a Booking status change nor a Vendor Finance fixture makes a shared posting service exist. The next agent must preserve one canonical obligation/money identity when connecting these surfaces.

## 16. Fixture arithmetic — examples to reuse

All following amounts are rupees displayed from integer-paise Finance fixtures:

| Calculation | Result |
| --- | ---: |
| XYZ accepted selling price | ₹1,20,000 |
| XYZ verified receipt | ₹40,000 |
| XYZ customer remaining | ₹80,000 |
| Hotel confirmed cost | ₹70,000 |
| Hotel payment applied | ₹30,000 |
| Hotel remaining | ₹40,000 |
| Transport confirmed cost / remaining | ₹25,000 |
| Supplier outstanding | ₹65,000 |
| Staff reimbursement due | ₹7,000 |
| Outgoing obligations | ₹72,000 |
| Projected direct margin: 1,20,000 − 70,000 − 25,000 | ₹25,000 |
| Recorded trip cash: 40,000 received − 30,000 paid | ₹10,000 — not profit |
| Customer outstanding with pending Kapoor ₹12,000 | ₹92,000 |
| After verifying/applying that existing receipt | ₹80,000 |
| HDFC + petty cash | ₹2,46,800 |
| Statement ₹2,37,550 − HDFC books ₹2,36,800 | ₹750 |
| Raw difference ₹750 − unmatched credit ₹7,500 | −₹6,750 unexplained |
| Cash outlook opening | ₹2,46,800 |
| Lowest projected balance through scheduled movements | ₹1,81,800 |
| Forecast closing, assuming all listed movements | ₹2,58,300 |

The seven forecast movements are −40,000; −7,000; −18,000; +35,000; −25,000; +80,000; −13,500. Their sum is +11,500. Forecast receipts are not received cash.

## 17. Persistence, usability and current limitations

| Surface | Current persistence |
| --- | --- |
| New Finance money records, events, sample proof decision | React memory; reload/remount resets |
| Finance fixture balances and account stock | Static source constants |
| Shared supplier tax profiles | Browser localStorage |
| Accepted transport handoffs / confirmations | Browser localStorage |
| Global Finance workspace notes | Shared WorkspaceNotes browser-local store |
| FinanceApp internal notes when used standalone | React memory |
| Vendor bank details | Browser-local master data |
| Booking HTML financial actions | Local page/DOM behavior; not shared durable writes |

Important boundaries:

- New records have no general verify/allocate workflow after recording.
- Record form date is constrained to the fixed sample date.
- No real payment processing, bank feed, cash count, posting journal, invoice issuance, bill matching, refund disbursement, credit allocation, period lock or accounting export.
- Approval, cash verification, allocation, settlement, due state, review, bank match and financial close must stay independent.
- Reports and balances do not automatically incorporate every new adapter record or every current browser-local supplier confirmation.
- The customer selling price must not change just because supplier cost changes.
- Backend tenant/role permissions, durable audit, concurrent allocations and server idempotency are not implemented by these mockups.
- Money is held as integer paise in the Finance fixtures, but the current display formatter rounds to whole rupees. The screen is not a full precision financial statement presentation.

These are observations of current behavior, not instructions to redesign the UI.

## 18. Information hierarchy and components

The outer workspace keeps the shared sidebar, module notes and breadcrumb. Finance uses a page title, primary destination tabs, secondary view tabs, summary amounts, list toolbar, data sheet, pagination, and right-side source/record drawers.

Shared components include AppShell, Button, DataSheet/rows/cells, SearchField, StatusChip, IconButton, Avatar, Tooltip and Pagination. Existing Finance composition keeps numerical amounts, references, states and source links visible. The HTML companion reproduces the current screens; it does not establish a new design system.

## 19. Operational checks for the next agent

1. Customer proof pending does not reduce ₹92,000 outstanding.
2. Verifying the original Kapoor receipt reduces outstanding once, without a second receipt.
3. Rejecting proof keeps ₹12,000 due.
4. Hotel bill receipt must not turn ₹70,000 commitment into ₹1,40,000 cost.
5. Supplier payment does not confirm vehicle/hotel availability.
6. Advance and refund keep their party identity and separate obligations.
7. Reimbursement is an outgoing obligation linked to an expense counted once.
8. Account transfer is not sales or expense.
9. Statement comparison keeps the −₹6,750 unexplained difference visible.
10. Forecast movements do not change recorded opening cash.
11. Supplier-cost amendment does not silently rewrite the accepted customer quotation.
12. Confirmed continuous transport hire appears once in Finance and is explicitly integrated before being added to totals.
13. Transaction, Booking, Vendor and bank contexts point to one canonical record when shared writes are implemented.

For screen-level entry points, field lists and screenshots, open [the HTML guide](finance-module-ui-context.html).
