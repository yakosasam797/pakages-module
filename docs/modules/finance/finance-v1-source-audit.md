# Finance v1 source audit and integration boundary

Reviewed on 26 September 2026 against the attached Finance v1 audit brief. This is a code and UI inspection of the available local repositories, not a backend audit.

| Surface | Inspected source | Current authority and action | Production connection needed |
| --- | --- | --- | --- |
| Booking Finance | `D:\Finance module  26 sep T3\booking-redesign.html`, Finance panel and `handleSubmit` | HTML fixture and DOM mutations. `modal-recordPayment` marks an instalment paid in the DOM; `modal-supplierPay` closes without a financial posting. No reusable service or canonical transaction is present. | Booking supplies approved price, schedules and confirmed service commitments. Recording a receipt or supplier payment must call the shared Finance service with booking context and idempotency. Supplier confirmation remains in Booking. |
| Vendor CRM Finance | `D:\Vendor-CRM\src\components\VendorFinancePanel.tsx`, `src/data/vendorFinance.ts` | Payables, balances and statement rows come from static constants. Account bank details can be stored in browser localStorage. Statement/CSV views are local presentations, not a shared posting service. | Read supplier-scoped obligations, applications, advances, credits and statement entries from the same financial records as Booking and Agency Finance. Keep the vendor identity and historical beneficiary snapshot distinct. |
| Vendor CRM Activity | `D:\Vendor-CRM\src\components\ActivityPanel.tsx` and `VendorActivityPanel.tsx` | Existing table pattern with search, event, member and time. Events originate from vendor fixture/API state, not a shared cross-module ActivityLog. | One shared event identity and event-detail contract, filtered by agency, booking and party permissions. |
| Agency Finance | `src/FinanceApp.tsx`, `src/financeModel.ts` | UI preview with one integer-paise fixture model. The sample verification, record form and activity updates exist in React memory only. | Bind all reads and writes to the shared finance domain; enforce tenant, currency, permissions, atomic allocation, idempotency and durable event/audit records server-side. |

## Existing-code conflict to resolve before shared writes

The Booking HTML currently treats a submitted receipt form as an immediate paid state, while the agreed Finance rule requires separate money recording, verification and effective allocation. Vendor CRM supplies its own static payable and statement amounts. These behaviours cannot be made authoritative by linking the frontends alone. A shared finance service and migration/cutover plan must be agreed before replacing either module's write path.

## Activity event contract

The UI uses the same Activity table interaction pattern as Vendor CRM, with a read-only event detail. For production, the shared ActivityLog should provide one stable event ID, source record ID, event category, actor, agency scope, applicable booking/party scopes, occurred timestamp, recorded timestamp, and permission-filtered detail. A recorded payment, its verification, its allocation and its bank match are separate events linked to one money record. Activity explains history; the source record remains the place for financial actions.

## Release gates still open

- Durable canonical obligations, money records, allocations, account movements and event log.
- Server-side permissions, idempotency, exact money arithmetic, concurrent allocation limits and reversal/amendment policy.
- Real Booking/Vendor/Customer CRM adapters and one source of totals across scopes.
- Bank statement import, duplicate detection, matching, reconciliation and petty-cash count workflows.
- Approved expense entry, invoices/bills, credits/refunds, configurable approvals, period lock and accounting export setup.
- Acceptance tests from the supplied brief against real services, including cross-booking allocations, retries, history cutover and restricted exports.

The current preview intentionally labels itself **Sample workspace**. Its browser interactions validate the proposed screen meanings, not these release gates.
