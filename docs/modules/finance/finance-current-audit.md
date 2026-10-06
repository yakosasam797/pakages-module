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
