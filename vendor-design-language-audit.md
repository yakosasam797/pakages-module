# Vendor CRM design-language audit

Audit date: 26 September 2026. Reference: `yakosasam797/Vendor-CRM` at commit `a20fa66563cd3a7d05ca6058a5f2aaf7403f57ed`. The reference was inspected in source and its repository QA captures, including `packages-row-actions-qa.png`, `package-header-consistency-qa.png`, `vendor-header-record-qa.png`, and `activity-standardized-implementation.png`. The comparison covers this standalone Packages module's shell, Packages and Proposals lists, package detail, creation journey, and responsive states.

| Surface | Drift found in Packages module | Alignment made |
| --- | --- | --- |
| Brand | The shared shell showed a generic brand mark instead of Vendor CRM's Paryatech lockup. | Applied the same full lockup and compact mark to the expanded and collapsed sidebar. |
| Sidebar | Active navigation, notes, and credits used a teal or neutral emphasis; group labels were visible; Settings was in the top bar. | Restored pink navigation, notes, and credits; used section dividers without visible group labels; moved Settings into the sidebar. |
| Top bar | Search was wider than the Vendor CRM shell and competed with the account actions. | Matched the 280 px search treatment and retained the help, notification, and account cluster. |
| Package and proposal tables | Rows relied on a separate Open button, duplicated the row action, and had smaller thumbnails. | Made each row open on click or keyboard activation, left one overflow action in the Action column, and used 40 px thumbnails. |
| Status language | Package Draft appeared as an amber in-progress state and status chips lacked Vendor CRM's dot cue. | Applied dot chips and the neutral package Draft tone; kept green for Published. |
| Package record header | The package name appeared without its image and secondary actions crowded the primary action. | Added the package thumbnail, matched the tinted and bordered record header, and kept Edit package primary with secondary actions in an overflow menu. |
| Narrow detail | The six composition metrics extended beyond a phone width. | Reflowed them into two columns so all metrics are visible without horizontal page overflow. |
| Interaction and focus | New table actions needed consistent row activation and visible keyboard focus. | Added row link semantics, Enter/Space activation, menu labels, and focus outlines. |

The module keeps its own package-specific information architecture, route builder, pricing, media, and proposal data. Those are different product surfaces from a vendor profile, so the audit aligned their shared visual grammar rather than replacing their content.

## Verification

- `npm run build`: passed.
- `npm run verify:ui`: passed across Packages, Proposals, filtering, package creation, seven package details, row menu, keyboard row activation, and mobile views; no browser console errors.
- Compared fresh `design-qa-implementation.png`, `design-qa-detail-top.png`, `design-qa-builder-foundation.png`, `design-qa-proposals.png`, and `design-qa-detail-mobile.png` against the Vendor CRM QA captures above.
- Mobile detail has no document-level horizontal overflow and retains all six composition metrics.
- Local preview: `http://127.0.0.1:4180/`.

The official logo images are loaded from commit-pinned Vendor CRM asset URLs. Other package imagery is already local to this module. The standalone module uses sample records and local UI actions; this audit does not add a backend or change the Vendor CRM repository.
