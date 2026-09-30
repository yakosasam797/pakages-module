# Paryatech Finance

This module is an ordinary folder in the unified root repository. Run the verification commands below from the repository root; standalone setup files under `tooling-reference/` are historical references.

This repository owns the agency-wide Finance workspace. Booking, Customer CRM, and Vendor CRM are contextual views of the same finance records, not separate finance implementations.

## Product rules

- Paryatech records external money movement. Never imply that the product sends, receives, or processes money.
- One real-world transaction has one canonical ID. Contextual modules display allocations from that record.
- Do not add a confirmed commitment and its matching invoice or supplier bill together. The document reclassifies or consumes the linked commitment.
- Store money as integer minor units. Never use floating-point amounts as financial authority.
- Derive outstanding balances from authorised obligations, effective cash allocations, credits, set-offs, and write-offs. Never make a balance directly editable.
- Keep document lifecycle, cash verification, allocation, settlement, due state, review, bank match, refund case, and financial-close status separate.
- Unverified proof does not reduce confirmed outstanding. Bank matching is separate from applying money to an invoice or bill.
- Customer price does not change when a supplier cost changes. Use an explicit approved booking amendment.
- A completed or cancelled booking can remain financially open.
- Agency expenses do not require a fake booking.
- Supplier and customer positions are not silently netted, even when the party has both roles.
- Historical payment and beneficiary snapshots do not change when CRM master data changes.

## Interface rules

- Reuse `@paryatech/design-system` components and tokens. Do not create a separate Finance design system.
- Follow `docs/design-direction.md` for the shared Vendor CRM visual language and Finance-specific composition rules.
- Teal means work. Pink is reserved for person/place context. Status colours remain semantic.
- Finance has eight primary destinations: Overview, Receivables, Payables, Transactions, Expenses, Bank & cash, Reports, and Controls.
- Every metric must open the records that produce it. Dashboard and detail totals must share calculation rules.
- Write labels in plain operational language. Actions name the real event: “Record receipt,” “Allocate,” or “Verify proof.”
- Explain why an exception exists and what changes when the user resolves it.
- Use right-aligned tabular money, explicit currency, and the shared ActivityLog pattern.
- Avoid redundant “View” columns. Record names and references open details.

## Verification

Before handoff:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Check the Overview at desktop and narrow widths.
4. Confirm the INR 1,20,000 fixture reconciles across accepted price, receipts, supplier commitments, supplier payments, remaining balances, margin, and recorded trip cash.
