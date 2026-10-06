# Product module agent references

Open [the module index](../agent-context-index.html) to choose Booking, All Finance, Destination, or Packages and Proposals. Each module HTML contains its own screenshots, operational context, current audit, evaluated fixtures, source snapshot, coverage ledger, and Python extraction helper. Give the receiving agent the relevant HTML; screenshots do not need separate attachments.

## What the agent must do

Read [READ-FIRST.md](READ-FIRST.md) and the embedded instructions. Extract the HTML, inspect every screenshot, read every context chapter and applicable source file, and complete the review ledgers. An HTML text fetch alone does not inspect images. Report missing states and unsupported operations before implementing the agreed agenda. Screenshot presence, source review, image inspection, handler verification, and durable integration are different evidence.

## Current evidence

Reviewed 5 October 2026 at source commit `cfc0335998cde94795561b7381bbfe1d6a2c35e9`, including the working source at capture time.

| Reference | Documented states | Embedded images | Embedded source files | Remaining state groups |
| --- | ---: | ---: | ---: | ---: |
| Booking | 89 | 104 | 48 | 4 |
| All Finance | 113 | 136 | 59 | 5 |
| Destination | 43 | 65 | 49 | 5 |
| Packages and Proposals | 128 | 203 | 62 | 7 |

The 508 embedded images include scroll continuations, earlier captures, and contextual Finance images. They are not 508 distinct current states. Current T3 imports total 177 states and 266 images; three unfinished drawer frames are excluded by the gallery QA rules. Evidence dates and local scenario notes are attached to each state. Default screenshots do not establish every supplier approval, API failure, viewport variant, or financial guard permutation; these remain explicit in each guide's coverage section.

Screenshot QA replaced the incomplete Finance overview and excluded three incomplete current report/itinerary first frames. Final gallery QA additionally excludes seven unfinished drawer/modal/main-view frames with rendered continuation or replacement evidence. Kept continuations are labeled. Additional report recaptures were blurred and were rejected. The T3 screenshot tool became intermittently unavailable near the end; source-only states are not marked screenshot verified. The temporary Finance note example was deleted after capture. No product source or source fixture was changed for this documentation.

## Files and regeneration

All four standalone HTML guides are below 20 MB (20,000,000 bytes each). The builder uses WebP compression at the original screenshot dimensions when smaller, and keeps existing smaller images unchanged. It chooses the highest quality from 95, 92, 90 and 88 that fits the limit, recorded in each guide's metadata. It preserves every screen/image ID, all context and fixture data, and the byte-exact source snapshot. Original capture inputs remain unchanged. Embedded image hashes/sizes and original hashes/sizes are recorded separately. The build rejects an HTML that cannot meet the size limit.

- `current-captures.json`: current screenshot metadata, page/control inventories, relative paths, and image hashes.
- `assets/`: lossless WEBP imports of real T3 screenshots.
- `product-source-fixtures.json`: evaluated source fixture baseline; separate from transient browser scenarios.
- `handoff-build-report.json`: generated guide counts and sizes.
- `handoff-validation-report.json`: successful extraction, image decoding, source-byte equality, anchor and count checks.
- Each module folder contains the standalone HTML, complete Markdown context, current audit, screenshot manifest, and source coverage JSON.
- Existing module UI atlases and operational context files remain inputs. Earlier screenshots are labeled separately.

Run from the repository root:

```powershell
node scripts/export-product-context.mjs
python scripts/build-product-agent-handoffs.py
python scripts/extract-product-agent-handoff.py docs/modules/bookings/booking-agent-handoff.html NEW_OUTPUT_FOLDER
```

The build/import scripts require Python Markdown and Pillow. For this run they were installed under `%TEMP%\paryatech-context-tools`, without adding project dependencies. Fixture export uses the project's installed Vite/esbuild. Extraction uses only Python's standard library and refuses to overwrite a nonempty folder. It validates counts and every embedded image/source SHA256.

`scripts/import-product-context-captures.py` consumes a fresh `current-capture-input.json` containing original screenshot paths, creates lossless imports, and merges/replaces states by module and ID in the existing manifest, then removes the temporary input. Finish importing before building. No new capture input is required to rebuild the existing references.
