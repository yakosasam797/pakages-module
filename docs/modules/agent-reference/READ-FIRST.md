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
