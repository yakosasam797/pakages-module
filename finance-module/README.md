# Finance module

Run all commands from the repository root: `npm ci`, `npm run dev`, `npm run lint`, `npm run build`.

The root's `src/FinanceModule.tsx` lazy-loads `src/FinanceApp.tsx` directly into the shared shell. `src/financeModel.ts` retains the integer-paise sample records and reconciliation rules. No iframe, separate server, nested install or separate Finance build is required.

The eight Finance destinations and original source/assets/design notes are preserved. Module styling is scoped in the root Vite pipeline so Finance styles cannot affect Vendor CRM after navigation. Original standalone setup files and the previous README are inactive under `tooling-reference/`.

See [root setup and module map](../README.md), [consolidation notes](../docs/module-consolidation.md), and the Finance product rules in `AGENTS.md`.
