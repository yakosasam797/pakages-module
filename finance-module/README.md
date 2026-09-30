# Paryatech agency Finance

This repository contains the agency-wide Finance UI preview. It keeps the eight approved destinations and Paryatech design system. The app currently uses sample records in `src/financeModel.ts`; there is no finance API or durable shared ledger in these repositories yet.

## What the preview demonstrates

- Receivables from effective obligations: ₹80,000 for XYZ Family plus ₹12,000 for Kapoor Group = ₹92,000 outstanding. The pending receipt is separate from due ageing.
- Supplier dues of ₹65,000 and an approved unpaid ₹7,000 staff claim = ₹72,000 outgoing obligations. The claim is counted once in September expenses of ₹84,800.
- HDFC book balance ₹2,36,800 and statement close ₹2,37,550 leave a raw ₹750 difference. A visible unmatched ₹7,500 credit does not make the period reconciled.
- A transaction register with linked booking, document, expense and account context.
- Activity inside Transactions, reachable from the header and Overview. Events show when something happened, when it was recorded, who recorded it, its source record, and a read-only explanation.
- A sample verification decision applies or rejects the *existing* Kapoor receipt, with receivables and Activity updating together. New money entries remain awaiting verification and do not settle balances.
- Report drill-downs and CSV export for the displayed sample data.

Preview changes are held in memory and reset on reload. The UI does not send or receive money. It is not a production ledger, bank integration, accounting export, or tax system.

## Related modules and integration boundary

See [Finance v1 source audit](docs/finance-v1-source-audit.md) for the inspected Booking and Vendor CRM components, current conflicts, and the shared service contract required before production.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5174
```

## Checks

```bash
npm run lint
npm run build
```
