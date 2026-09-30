# Communication workspace design QA

## Evidence

- Source visual truth:
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\04fbb3fe-d12e-4d60-a180-a108fc27573f-f61a9ed0-bdce-4dcb-a4fa-7305a09842b1.png`
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\04fbb3fe-d12e-4d60-a180-a108fc27573f-d4bc3eac-108a-42c2-a165-f18f6b158e80.png`
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\04fbb3fe-d12e-4d60-a180-a108fc27573f-7c31b441-0b91-4178-97a8-b3bfa2ceba27.png`
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\04fbb3fe-d12e-4d60-a180-a108fc27573f-9d417427-9da4-4d66-987b-7e3fb6f30152.png`
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\04fbb3fe-d12e-4d60-a180-a108fc27573f-e116fd73-f898-4484-b3e9-dfc98b8c3721.png`
- Browser-rendered implementation:
  - `C:\Users\YAKSHITH\Vendor-CRM\qa-communications.png`
  - `C:\Users\YAKSHITH\Vendor-CRM\qa-communications-compose.png`
  - `C:\Users\YAKSHITH\Vendor-CRM\qa-communications-template.png`
  - `C:\Users\YAKSHITH\Vendor-CRM\qa-communications-sent.png`
  - `C:\Users\YAKSHITH\Vendor-CRM\qa-communications-read.png`
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\qa-comparison.png`
- Browser viewport: 1512 x 982 CSS pixels, desktop, device scale factor 1.
- Source pixels: primary All mail reference 1574 x 755. Implementation pixels: 1512 x 982. The source is a cropped content view while the implementation includes the complete ParyatechOS shell; density was normalized by rendering both at CSS pixel scale in the combined comparison.
- States checked: All mail, message read view, composer, template menu, successful send, automatic move to Sent, sent confirmation.
- Console errors checked: none.

## Full-view comparison

The implementation preserves the reference concept's identity header, folder rail, mailbox heading, compact message rows, inline composer, template menu, and large working canvas. It intentionally replaces the reference's nested rounded container with a continuous shell-connected surface using ParyatechOS borders, type, spacing, buttons, pink selection state, and green primary action.

## Focused comparison

The composer and template menu were captured separately because their labels, field rhythm, action placement, disabled Send state, and menu density were too small to judge from the full-page comparison. Both follow the reference interaction structure while using existing platform components and tokens. No raster imagery or non-standard assets are present in this interface; existing vector icon components remain sharp and consistent.

## Required fidelity surfaces

- Typography: existing platform display, body, and mono tokens are retained; hierarchy, truncation, weights, and small metadata remain readable.
- Spacing and layout: the 210 px folder rail, 66 px identity header, compact 82 px mailbox header, and 88 px message rows preserve the reference density without adding nested card padding.
- Colors and tokens: all surfaces, borders, selection states, success feedback, and actions use existing ParyatechOS variables.
- Image and asset fidelity: no content imagery is required; existing design-system icons and initials avatars are used.
- Copy and content: folder names, mail state labels, compose labels, and actions match the requested mail-only flow and use vendor-specific content.

## Findings

- No actionable P0, P1, or P2 differences remain.
- P3: the source concept hides the contact email under the name, while the implementation keeps it visible in the identity header for operational context. This is an intentional platform-language improvement.

## Comparison history

- Pass 1: P2 interaction finding — message rows had a clickable treatment without a resulting mail view.
- Fix: added a connected read view with message metadata, body, back navigation, and a reply handoff for received mail.
- Pass 2 evidence: `qa-communications-read.png` confirms the row now opens a complete read state without adding a nested card. No actionable P0/P1/P2 findings remain.

## Primary interactions tested

- Opened the vendor from the Vendors data table.
- Opened Communications.
- Opened an email and returned to the mailbox.
- Opened New email.
- Opened and applied a template.
- Sent a populated email.
- Confirmed immediate count update, Sent selection, inserted message, and success notice.

## Implementation checklist

- [x] Reusable mail workspace component.
- [x] All mail, Inbox, and Sent folder states.
- [x] Inline composer with recipient, subject, message, upload, templates, discard, and send.
- [x] Existing document-request entry point opens the same composer.
- [x] Responsive folder navigation and accessible focus states.
- [x] Platform shell integration with no nested outer card.

final result: passed

---

# Vendor and package record-header consistency QA

## Evidence

- Vendor profile reference: `C:\Users\YAKSHITH\.t3\userdata\attachments\54139921-ba3f-4f52-8ad4-aa0cd9b87e5e-a31f1af4-6934-4cb7-915d-5d3814388556.png` (1839 x 973 pixels).
- Package detail reference: `C:\Users\YAKSHITH\.t3\userdata\attachments\54139921-ba3f-4f52-8ad4-aa0cd9b87e5e-d1b199b4-e9a8-4e31-9fa6-544f057bcff2.png` (1553 x 962 pixels).
- Browser-rendered vendor record: `C:\Users\YAKSHITH\Vendor-CRM\vendor-header-record-qa.png` (1839 x 973 pixels).
- Browser-rendered package record: `C:\Users\YAKSHITH\Vendor-CRM\package-header-consistency-qa.png` (1839 x 973 pixels).
- State: Trailmakers Experiences vendor profile, followed by Packages > Kerala Backwaters Escape.

## Findings

- The package title previously used a larger 21–25 px page-hero scale while the vendor title used the shared 18–22 px record scale.
- Kerala Backwaters Escape now uses the same record-heading token as Trailmakers Experiences: Onest, 22 px at the reference viewport, weight 700, 33 px line-height, and -0.66 px tracking.
- Both rectangular headers now use 16 px vertical and 22 px horizontal padding. Package metadata also uses the shared 12.5 px Public Sans metadata scale.
- The package thumbnail and commercial summary remain package-specific. They make the package card 108.5 px tall versus the vendor card's 97 px, but no longer change the title hierarchy.

## Interaction and browser checks

- Opened Trailmakers Experiences from the vendor directory, selected Packages, and opened Kerala Backwaters Escape.
- Computed style comparison confirms the two titles match in family, size, weight, line-height, tracking, and card padding.
- Typecheck and production build pass. Lint completes with only pre-existing warnings in unrelated files.

final result: passed

---

# Linked-vendor row actions QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-244dcc99-626e-4717-b606-6ab6b0356a29.png` (1544 x 552 pixels; focused source crop).
- Browser-rendered global-service implementation: `C:\Users\YAKSHITH\Vendor-CRM\qa-linked-vendors.png` (1536 x 960 pixels).
- Browser-rendered vendor-scoped service implementation: `C:\Users\YAKSHITH\Vendor-CRM\qa-linked-vendors-vendor-scope.png` (1536 x 960 pixels).
- Browser viewport: 1536 x 960 CSS pixels at device scale factor 1.
- State: Services directory or vendor Services tab → service detail → Vendors tab.
- Density normalization: all captures are 1x. The source is a focused crop and contains a different service dataset, so comparison was limited to the linked-vendor table structure and action behavior.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested table action correction.
- The persistent View buttons are removed from both linked-vendor table implementations.
- Every linked-vendor row remains keyboard-focusable and opens its vendor record when the non-control row surface is activated.
- Each Action cell now uses the same compact three-dot control as the other CRM data tables.

## Required fidelity surfaces

- Typography: existing table heading, body, metadata, and status-chip typography is unchanged.
- Spacing and layout: action controls are centered in the fixed action column; measured table scroll width and client width are both 1254 px, with no unintended horizontal overflow.
- Colors and tokens: the existing neutral icon-button, border, surface, hover, and focus tokens are reused.
- Image and asset fidelity: existing vendor thumbnails and the product's `IconMore` asset are retained; no placeholder asset was introduced.
- Copy and content: the visible View label is removed. The contextual menu exposes only `Open vendor` for now, leaving room for future row actions.

## Interaction and browser checks

- Global service detail: zero View buttons, three three-dot actions, the menu opens, and clicking a row navigates to Example Hospitality.
- Vendor-scoped service detail: zero View buttons, three three-dot actions, the menu opens and closes with Escape.
- Checkbox, rate-card link, and action-button clicks remain isolated from row navigation.
- No browser console errors occurred in either tested route.
- Production build passes.

## Full-view and focused comparison

- The full implementation captures show the linked-vendor tables in context and confirm alignment with the surrounding summary and pagination.
- The source crop and implementation captures were opened together for focused comparison; action-cell content is clearly legible, so an additional crop was not needed.

## Comparison history

- Pass 1: replaced the remaining View button with the shared three-dot action and verified row navigation, menu behavior, alignment, and overflow. No P0/P1/P2 follow-up fix was required.

final result: passed

---

# Standalone directory table height and pagination QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-090692ab-64a9-4ea1-a8a1-d125f66a5150.png` (1533 x 985 pixels), with the Booking reference at `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-c9bd9978-5f58-4116-841c-37dd788def40.png` (1533 x 985 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\.t3\userdata\browser-artifacts\browser-screenshot-localhost-mue5k6ym-8dead1ca.png` (1280 x 822 pixels).
- Combined full-view comparison: `C:\Users\YAKSHITH\.t3\userdata\browser-artifacts\browser-screenshot-localhost-mue5oeb9-e121fb38.png` (1280 x 720 pixels).
- Browser viewport: 1533 x 985 CSS pixels. The collaborative preview normalized the saved implementation capture to 1280 x 822; the comparison page scales both full views proportionally.
- State: CRM > Services > Accommodation with five rows; secondary validation used Transport with one row and Vendors with twelve rows.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested table-only layout rule.
- The standalone directory DataSheet now owns the remaining workspace height, continues its column dividers through unused space, and places pagination against the bottom boundary like Bookings.
- When real data exceeds the available height, the filler collapses to zero and the table continues normally instead of forcing pagination over the rows.

## Required fidelity surfaces

- Typography: existing directory titles, table labels, row copy, status chips, and monospaced pagination copy are unchanged.
- Spacing and layout: the data rows keep their existing 61 px rhythm; only the empty table canvas expands. Pagination ends at 974 CSS pixels while the workspace ends at 975 CSS pixels.
- Colors and tokens: the existing surface, border, status, active-tab, and pagination tokens are preserved.
- Image and asset fidelity: all service thumbnails and product icons remain the existing source assets; no replacement or generated imagery was introduced.
- Copy and content: category names, service details, row counts, and range labels are unchanged.

## Interaction and browser checks

- Accommodation: five data rows, 280 px flexible filler, pagination anchored to the bottom.
- Transport: one data row, 524 px flexible filler, pagination anchored to the bottom.
- Vendors: twelve data rows, filler collapses to 0 px so longer content flows naturally.
- The filler is `aria-hidden` and adds no false record to the accessibility tree.
- No horizontal viewport overflow was detected.
- Category switching and row actions remain interactive.
- Browser console contained only the collaborative Electron sandbox bootstrap warning; no application runtime errors occurred.
- Typecheck, lint, and production build pass. Lint reports only pre-existing warnings in unrelated components.

## Full-view and focused comparison

- The combined full view makes the corrected vertical relationship clear: the source pagination floats immediately below the fifth row, while the implementation preserves the same content and extends the table grid to the bottom pagination boundary.
- A separate focused crop was not required because the row-to-footer relationship, continuous column borders, and pagination placement are all legible in the combined full view.

## Comparison history

- Pass 1: reused the existing dashboard table-fill component for both directory perspectives. Browser geometry confirmed the sparse and dense states without any remaining P0/P1/P2 issues.

final result: passed

---

# Standardized activity log QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-61168b75-81b4-4e6d-a7c0-0f8a8b4b341a.png` (1516 x 861 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\activity-standardized-implementation.png` (1536 x 1000 pixels).
- Combined comparison evidence: `C:\Users\YAKSHITH\Vendor-CRM\activity-standardized-comparison.png` (1536 x 1933 pixels).
- Browser viewport: 1536 x 1000 CSS pixels at device scale factor 1.
- State: Trailmakers Experiences vendor record with Activity selected and six events visible.
- Density normalization: both artifacts are 1x captures. The source is a content-region screenshot, while the implementation includes the complete application shell; the activity table itself is shown at the same desktop density.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested activity-log structure.
- The column order is now Date, Event, Member, with the responsible member consistently last.
- The former Module column and All modules control are removed. Event location is retained as a short secondary line inside Event, so context is visible without a redundant table section.
- Long sentences are replaced with standardized action labels such as “Coverage reviewed,” “Base location confirmed,” and “Contact routing verified.”

## Required fidelity surfaces

- Typography: primary event labels use the existing body-emphasis treatment; event context, time, and member role use the existing secondary text scale.
- Spacing and layout: the four-column grid gives Event the largest track, keeps date compact, and gives Member a stable final column. Row density and surrounding table rhythm remain consistent with the other vendor tabs.
- Colors and tokens: text, dividers, avatar tones, icons, selection controls, and active navigation retain existing product tokens.
- Image and asset fidelity: no raster assets were required. Existing design-system module icons, calendar/clock icons, avatars, and checkboxes are reused.
- Copy and content: each event is concise and standardized, while its originating area appears directly below it as contextual metadata.

## Interaction and browser checks

- Search by embedded context works: searching “Services” returns the two service events even though there is no separate Module column.
- Six activity records render in the expected order.
- The Activity tab, search field, row selection controls, and pagination remain present.
- The page has no horizontal viewport overflow.
- Browser console errors: none.
- Typecheck, lint, and production build pass. Lint reports only pre-existing warnings in unrelated components.

## Full-view and focused comparison

- The combined comparison clearly shows the requested structural change from five data columns to the standardized Date → Event → Member sequence.
- A separate focused crop was not needed because all dense table text, icons, column boundaries, and row states remain legible at full resolution in the combined 1536 px comparison.

## Comparison history

- Pass 1: the updated implementation removed the standalone Module treatment, moved member attribution to the last column, and placed concise module context under every event. No P0/P1/P2 follow-up fix was required.

## Implementation checklist

- [x] Put date/time first.
- [x] Put the concise event next and show where it happened.
- [x] Remove the Module column and module filter.
- [x] Put the responsible member last.
- [x] Reuse the same ActivityPanel structure across vendor and rate-card activity records.
- [x] Keep context searchable.

final result: passed

---

# Package itinerary and block-picker QA

- Source visual truth:
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\eed81fd1-bcf4-4597-b9e1-a15c2c63dbc4-807ba701-11a4-4713-85df-4183afbf2e4c.png`
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\eed81fd1-bcf4-4597-b9e1-a15c2c63dbc4-0a04b6de-5fec-4920-9111-b671740cf128.png`
- State: Vendor > Packages > Kerala Backwaters Escape > Build, plus Add block picker.
- Intended viewport: desktop light appearance matching the supplied references.
- Implementation screenshot: unavailable because the T3 collaborative preview has no automation host.

## Findings

- [P2] Browser-rendered comparison is blocked. The production build and local Vite HMR pass, but no implementation screenshot, browser interaction trace, or console capture can be produced in the required browser.
- Source-level implementation now enlarges the Itinerary heading, formats day dates in full, replaces ambiguous “Linked” language with “CRM service” and “Select service,” keeps price and design-system edit/delete controls visible, assigns a distinct semantic color to every block type, adds “Add another city” at both the top and end, and replaces the add form with a searchable grouped block picker.

## Required fidelity surfaces

- Typography: Itinerary uses the platform display token at 18px; day summaries use readable body-secondary sizing.
- Spacing/layout: top and bottom city actions are present; day-level Add block remains contextual.
- Colors/tokens: flight, transfer, accommodation, activity, meal, visa, checkout, and note use distinct restrained icon colors; ambiguous orange linking state is removed.
- Images/assets: existing CRM/service media remains intact; existing icon components are reused for block types.
- Copy/content: Day 1 uses “Monday, 12 October,” “Arrive in Kochi,” and “Bangalore to Kochi”; linkage copy explains the CRM relationship.

## Primary interactions

- Build passes.
- Lint passes with existing unrelated warnings.
- Add block picker search and selection are wired; choosing a block inserts it into the selected day.
- Add another city, Select service, edit, delete, collapse, tabs, and media controls remain wired.
- Browser interaction and responsive visual testing are blocked by the unavailable preview host.

final result: blocked

---

# Vendor communication recipients and avatar QA

## Scope

- Vendor identity uses the product's soft-corner avatar treatment.
- Individual contacts and message senders retain circular avatars.
- New email requires a recipient selected from the current vendor's related contacts.
- Documents > Request keeps the predefined subject and message but leaves the recipient unselected.

## Browser verification

- Trailmakers Experiences exposes 3 related contacts: Partnerships, Reservations, and Accounts.
- Vendor avatar computed radius: `10px`.
- Person avatar computed radius: `50%`.
- New email opens with the recipient placeholder selected and Send disabled.
- Selecting a contact and entering subject/message enables Send.
- Documents > Request opens with `Document request` and the compliance-request body prefilled; recipient remains empty and Send remains disabled.
- Production build passes.
- Lint completes with only pre-existing warnings in unrelated files.

final result: passed

---

# Add vendor form QA

## Evidence

- Source visual truth:
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\0cac0ad3-9ed9-4199-bf77-b41cb9b4f8c7-9f049159-6eed-4d4b-bd53-6a596152365f.png` (1524 x 707 pixels)
  - `C:\Users\YAKSHITH\.t3\userdata\attachments\0cac0ad3-9ed9-4199-bf77-b41cb9b4f8c7-36000cf3-b151-4343-89bf-5abb07472ecc.png` (1393 x 700 pixels)
- Implementation: `http://localhost:5173/`, returning HTTP 200.
- Browser-rendered implementation screenshot: unavailable because the T3 collaborative preview reports no automation host.
- Intended viewport: desktop light appearance matching the supplied references.
- Density normalization: not available without a browser-rendered implementation capture.
- State: CRM > Vendors > Add vendor, empty form with DMC unselected.

## Full-view comparison

Blocked. The source references were opened at original resolution, but the current implementation could not be captured in the required collaborative browser. Build output and source inspection are not substitutes for a rendered comparison.

## Focused comparison

Blocked for the same reason. The most important focused regions are Identity with the conditional DMC panel, Primary contact with WhatsApp linking, Location with city recommendations, and the sticky action footer.

## Required fidelity surfaces

- Typography: source-level implementation uses the module heading families and a 13–15 px control scale; rendered fidelity remains unverified.
- Spacing and layout: one attached sheet with 212 px neutral section rails and responsive field grids; rendered rhythm remains unverified.
- Colors and tokens: section rails and conditional content use `--surface-2`; no green-tinted section background is introduced.
- Image and asset fidelity: no raster imagery is required. Existing platform icon components are used.
- Copy and content: Identity, service categories, labels, DMC scope, specializations, full contact and WhatsApp data, location and address, owner, tax identifiers, and internal notes are present.

## Findings

- [P2] Visual comparison and interaction QA are blocked by the unavailable collaborative browser host.
- Source-level checks pass: production build, targeted lint, and diff whitespace validation.

## Primary interactions

- Category selection, DMC conditional fields, phone-to-WhatsApp synchronization, city recommendation selection, duplicate warning, Cancel, and Create draft vendor are wired in code.
- Browser interaction, responsive visual testing, and console inspection remain blocked.

## Comparison history

- Pass 1 implementation restored the complete form content and replaced the green-tinted Primary contact treatment with the module's neutral surface token.
- Post-fix visual evidence could not be captured because the browser host is unavailable.

## Implementation checklist

- [x] Restore all fields represented by the supplied references.
- [x] Keep one continuous shell-connected form instead of a stepper.
- [x] Use neutral module surface and divider tokens.
- [x] Preserve accessible labels, focus states, and responsive grids.
- [ ] Capture and compare the rendered implementation when the collaborative browser is available.

final result: blocked

---

# Bank details balance QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-6dbba881-2e30-4f74-ad12-0461f5ab387c.png` (1512 × 333 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\bank-details-implementation.png` (1215 × 221 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\bank-details-comparison.png`.
- Browser viewport: 1512 × 982 CSS pixels at device scale factor 1.
- State: CRM > Vendors > Trailmakers Experiences > Finance, Bank details section.
- Density normalization: both captures are 1×. The implementation is a tighter section-only crop; comparison uses the full Bank details content region in both captures.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested change.
- The six bank values form two equal-height rows across three equal 405 px columns.
- “Saved details,” “Added manually · Not bank-verified,” its audit line, and “Copy all details” are absent.
- Existing per-field copy controls remain available for Account number and IFSC code.

## Required fidelity surfaces

- Typography: existing section, field-label, value, mono-number, and button typography is unchanged.
- Spacing and layout: the former uneven 4-column/record-span arrangement is replaced by a balanced 3 × 2 grid with consistent cell padding and dividers.
- Colors and tokens: existing surface, border, accent, status, and action tokens are preserved.
- Image and asset fidelity: no raster assets are required; existing design-system icons remain unchanged.
- Copy and content: all six operational bank fields remain present, while the explicitly unwanted manual-verification and bulk-copy content is removed.

## Interaction and browser checks

- Edit bank details opens and closes successfully.
- Add another account remains available.
- Field count: 6; rendered columns: 3; horizontal overflow: none.
- Browser console errors: none.
- Production build passes. Lint completes with only pre-existing warnings in unrelated files.

## Comparison history

- Pass 1 found the requested 3 × 2 balance, no legacy content, and no responsive overflow. No P0/P1/P2 follow-up fix was required.

## Implementation checklist

- [x] Retain the six bank fields.
- [x] Arrange three fields per row.
- [x] Remove the manual-save / bank-verification record.
- [x] Remove “Copy all details.”
- [x] Preserve edit, add-account, and individual copy actions.

final result: passed

---

# Contextual bank editor panel QA

## Evidence

- Current-state source: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-0e4204d9-3fec-4a20-9c15-2c5b91c295dc.png` (1550 × 984 pixels).
- Existing product pattern: `C:\Users\YAKSHITH\Vendor-CRM\settings-panel-reference.png` (1512 × 982 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\bank-panel-edit-implementation.png` (1512 × 982 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\bank-panel-comparison.png`.
- Browser viewport: 1512 × 982 CSS pixels at device scale factor 1.
- State: Trailmakers Experiences > Finance > Edit bank details open.
- Density normalization: all browser captures are 1×; the supplied current-state image is 1550 × 984 and was proportionally normalized in the combined comparison.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The bank form now follows the existing Settings contextual-panel behavior: it opens eight pixels below the invoking action, aligns to that action’s right edge, uses a transparent page overlay, and retains the 640 px panel width and 16 px radius.
- The form body scrolls within the available viewport height while the header and footer remain visible.

## Required fidelity surfaces

- Typography: existing bank-form labels, values, title hierarchy, and button typography are preserved.
- Spacing and layout: the centered dialog is replaced by the established trigger-anchored panel geometry; mobile falls back to eight-pixel side insets.
- Colors and tokens: the dark overlay is removed; existing surface, border, shadow, focus, and action tokens match the Settings pattern.
- Image and asset fidelity: no raster assets are required; all existing design-system icons remain unchanged.
- Copy and content: Edit and Add modes retain their correct titles, fields, validation, and save actions.

## Interaction and browser checks

- Edit bank details opens with current values and autofocuses Bank name.
- Add another account opens with blank Bank name and Account holder fields.
- Escape and outside click close the panel.
- Focus returns to the action that opened the panel.
- Body scrolling is locked while the panel is open.
- Browser console errors: none.
- Production build passes. Lint completes with only pre-existing warnings in unrelated files.

## Comparison history

- Pass 1: the generic backdrop selector still overrode the transparent panel overlay, and positioning was fixed rather than tied to the invoking action.
- Fix: increased the bank-overlay selector specificity and added trigger-relative position calculation matching Settings.
- Pass 2 evidence: `bank-panel-edit-implementation.png` and `bank-panel-comparison.png` confirm transparent background, contextual alignment, internal scrolling, and consistent panel chrome.

## Implementation checklist

- [x] Remove the darkened backdrop.
- [x] Anchor Edit and Add panels to their invoking action.
- [x] Match Settings panel width, radius, shadow, and animation.
- [x] Preserve form behavior and responsive layout.
- [x] Support Escape, outside-click close, focus containment, and focus return.

final result: passed

---

# Services media-cell visual count QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-eedc0577-b3e0-411e-a141-9c7556cef32c.png` (1556 x 733 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\services-media-implementation.png` (1540 x 1000 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\services-media-comparison.png` (1556 x 1285 pixels).
- Browser viewport: 1540 x 1000 CSS pixels at device scale factor 1.
- State: CRM > Vendors > Trailmakers Experiences > Services.
- Density normalization: both captures are 1x; the implementation comparison uses a focused crop of the matching tabs, toolbar, and service table region.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested Media-column refinement.
- Each Media cell displays exactly one representative image thumbnail.
- Services with additional images use a compact circular `+1` badge; the single-image service has no redundant badge or visible count text.
- The complete image count remains available through each media button's accessible label.

## Required fidelity surfaces

- Typography: removed the visible `1 image` / `2 images` labels, leaving the surrounding table typography unchanged.
- Spacing and layout: the 36 px thumbnail and 20 px overlapping badge remain within the existing row height and do not introduce horizontal overflow.
- Colors and tokens: the thumbnail border, soft radius, badge foreground, background, and focus ring use existing surface and ink tokens.
- Image and asset fidelity: every Media cell reuses the service's real primary media image with an object-fit crop; no placeholder or synthetic asset was introduced.
- Copy and content: the column communicates one visible image plus only the number of additional images, without repeating the word `image` in every row.

## Interaction and browser checks

- Four Media cells render four representative images.
- The three two-image services render `+1`; the one-image service renders no badge.
- Clicking a Media cell opens the existing media panel; Escape closes it.
- The page has no horizontal viewport overflow.
- Browser console errors: none.
- Production build passes. Lint completes with only pre-existing warnings in unrelated files.

## Comparison history

- Pass 1 confirmed the compact thumbnail-and-badge treatment, consistent soft corners, unchanged row density, and working media-panel interaction. No P0/P1/P2 follow-up fix was required.

## Implementation checklist

- [x] Show one representative thumbnail per service.
- [x] Show only additional-image count in a circular badge.
- [x] Remove verbose visible image-count labels.
- [x] Preserve the full accessible count and media-panel interaction.
- [x] Preserve table density and responsive overflow behavior.

final result: passed

---

# Multi-vendor Test price QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-fbaa9234-d036-4b47-9d34-3212fcd2d333.png` (1533 x 976 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\test-price-implementation.png` (1536 x 1000 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\test-price-comparison.png` (1536 x 1982 pixels).
- Browser viewport: 1536 x 1000 CSS pixels at device scale factor 1.
- State: Trailmakers Experiences > Kerala Flight Ticketing > Test price.
- Density normalization: source and implementation are 1x desktop captures; the source is normalized to the implementation width in the combined evidence.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested refinement.
- Test price now compares three vendors linked to the same service, ordered from lowest to highest total.
- The redundant header band and its service ID, `Stay inputs`, supporting sentence, `Live comparison`, linked-vendor summary, and global Best price title are removed.
- The lowest quote is selected by default and retains the compact Best status within the comparison list.

## Required fidelity surfaces

- Typography: existing input labels, vendor names, supplier metadata, prices, nightly breakdown, and totals retain the product type tokens and hierarchy.
- Spacing and layout: the two-column proportion is unchanged; removing the 100 px header band brings both the input form and vendor comparison directly below the active tab.
- Colors and tokens: selected quote, Best status, borders, avatars, controls, and totals continue using the existing surface, accent, pink, and success tokens.
- Image and asset fidelity: the existing service image and design-system icons are preserved; no new image assets were required.
- Copy and content: removed all specifically called-out redundant copy and added distinct vendor names, supplier types, rate-card names, and totals for comparison.

## Interaction and browser checks

- Three quote rows render: Wanderlust Trails, Trailmakers Experiences, and Horizon DMC Partners.
- Vendor totals are distinct and ordered: INR 23,820, INR 25,200, and INR 25,560.
- Selecting another vendor updates the detailed breakdown and leaves exactly one selected row.
- Open rate card remains available for the selected vendor.
- All eight input controls remain present and the page has no horizontal overflow.
- Browser console errors: none.
- Production build passes. Lint completes with only pre-existing warnings in unrelated files.

## Comparison history

- Pass 1: the new vendor records existed, but the service detail page still filtered connections to the current vendor, leaving one quote visible.
- Fix: changed the Test price connection source to include every vendor linked to the same directory service.
- Pass 2 evidence: `test-price-implementation.png` confirms three selectable quotes, redundant copy removed, and a complete selected-vendor breakdown.

## Implementation checklist

- [x] Compare multiple vendors for one service.
- [x] Sort vendors by total price and identify the best quote.
- [x] Remove the redundant header titles and summary copy.
- [x] Keep the left-side inputs and two-column width balance.
- [x] Preserve vendor switching and rate-card access.

final result: passed

---

# Service category navigation QA

## Evidence

- Current directory source: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-49b96cda-6420-4fc5-b626-06b3a1e8f79d.png` (1522 x 952 pixels).
- Information-architecture reference: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-2d190242-a9c4-42c5-acfd-8c4c91fcfa5f.jpg` (736 x 559 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\service-categories-implementation.png` (1536 x 1000 pixels).
- Filtered-state implementation: `C:\Users\YAKSHITH\Vendor-CRM\service-categories-filtered.png` (1536 x 1000 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\service-categories-comparison.png` (1536 x 2520 pixels).
- Browser viewport: 1536 x 1000 CSS pixels at device scale factor 1.
- State: CRM directory with Services selected; All services and Accommodation category states.
- Density normalization: all product captures are 1x; the current directory screenshot is normalized to implementation width. The external design is used only as a navigation-hierarchy cue, not a visual styling target.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested service-type navigation.
- Services now exposes a persistent second-level tab row above search with All services, Accommodation, Transport, Activities, Visa, and Flights.
- Every category includes an existing product icon and live service count, making hotel, transport, activity, visa, and flight inventory directly scannable.
- The selected category uses a restrained teal underline while the primary Services tab retains the pink module underline, preserving hierarchy without copying the external reference's hover treatment.

## Required fidelity surfaces

- Typography: category labels use the existing 12.5 px semibold UI scale; counts use the mono token already used throughout the directory.
- Spacing and layout: the 40 px secondary navigation sits between the primary tabs and toolbar, with horizontal scrolling on narrow screens and no page-level overflow.
- Colors and tokens: active, inactive, count, border, focus, and background states use existing accent, ink, line, and surface tokens.
- Image and asset fidelity: no new raster assets were required; existing service-type icon components are reused.
- Copy and content: the page title and search placeholder both change to Services context, and all six service scopes are directly named.

## Interaction and browser checks

- All services displays 11 records and is selected by default.
- Accommodation displays five records, all with Accommodation as the service type.
- Returning to All services restores all 11 records.
- Category counts render as 11, 5, 1, 3, 1, and 1 for the current dataset.
- The service-category controls expose tab roles and selected state; keyboard focus styling is present.
- Service categories are removed from the Services filter popover to avoid duplicate controls; supplier filtering remains available.
- No horizontal viewport overflow and no browser console errors.
- Production build passes. Lint completes with only pre-existing warnings in unrelated files.

## Comparison history

- Pass 1 confirmed the requested second navigation row, direct category filtering, responsive overflow treatment, correct counts, and clear primary-versus-secondary hierarchy. No P0/P1/P2 follow-up fix was required.

## Implementation checklist

- [x] Add persistent service-type navigation when Services is active.
- [x] Position it above search and the data table.
- [x] Use CRM-native underline styling rather than copied hover cards.
- [x] Add live category counts and service icons.
- [x] Keep category selection, supplier filters, search, and location filtering logically separate.

final result: passed

---

# Upgrade button alignment QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-eed1b503-55a3-4036-857c-89e9c0dfdcb9.png` (401 x 519 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\upgrade-button-aligned-implementation.png` (272 x 138 pixels).
- Combined focused comparison: `C:\Users\YAKSHITH\Vendor-CRM\upgrade-button-alignment-comparison.png` (700 x 195 pixels).
- Browser viewport: 1536 x 1000 CSS pixels at device scale factor 1.
- State: expanded desktop sidebar footer with usage meter, Upgrade CTA, and Collapse control visible.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The decorative icon and Upgrade label are now separate, explicit flex children rather than an SVG beside an anonymous text node.
- Browser geometry confirms the button, icon, and label all share the exact same vertical center at 822 CSS pixels.

## Required fidelity surfaces

- Typography: the existing compact button font, weight, and line height are preserved.
- Spacing and layout: the icon occupies a fixed 14 x 14 alignment box, the label has an explicit line box, and the existing 5 px gap remains.
- Colors and tokens: the teal primary button and white foreground remain unchanged.
- Image and asset fidelity: the existing product icon is retained at 13 x 13 pixels; no substitute asset or placeholder was introduced.
- Copy and content: the Upgrade label is unchanged and remains on one line.

## Interaction and browser checks

- Upgrade button renders at 90.375 x 32 CSS pixels.
- Icon center Y: 822; label center Y: 822; button center Y: 822.
- No overlap, wrapping, or vertical displacement is visible in the focused capture.
- Typecheck, lint, and production build pass. Lint reports only pre-existing warnings in unrelated components.

## Comparison history

- Pass 1: explicit icon and label wrappers corrected the optical and line-box alignment. No P0/P1/P2 follow-up fix was required.

final result: passed

---

# Simplified service test-price QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-695342bd-9d71-485a-889f-4341cfa87460.png` (1559 x 975 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\Vendor-CRM\test-price-simple-list-implementation.png` (1536 x 1000 pixels).
- Combined comparison: `C:\Users\YAKSHITH\Vendor-CRM\test-price-simple-list-comparison.png` (1559 x 2047 pixels).
- Browser viewport: 1536 x 1000 CSS pixels at device scale factor 1.
- State: Kerala Flight Ticketing service detail, Test price selected, three nights, default room/meal/occupancy inputs.
- Density normalization: both source and implementation are 1x desktop captures; the source width differs by 23 pixels, which does not materially alter the two-column structure.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested simplification.
- The Test service tab and its row-menu entry are removed.
- Test price retains the complete input structure on the left and shows only vendor identity, rate-card context, and calculated price on the right.
- Best ranking, selected-row styling, rate-card action, nightly table, and summary breakdown are removed.

## Required fidelity surfaces

- Typography: existing input labels, vendor names, secondary supplier details, and monospaced prices retain the product type hierarchy.
- Spacing and layout: the original two-column split remains; the right side now uses three evenly spaced 65 px quote rows and intentionally leaves the remaining canvas quiet.
- Colors and tokens: inputs, dividers, avatars, text, and active-tab styling continue to use the existing design-system tokens.
- Image and asset fidelity: the supplied service image and existing vendor initials avatars remain unchanged; no new assets were required.
- Copy and content: the service tabs now read Overview, Test price, and Rate cards. The results contain no Best, breakdown, or Open rate card copy.

## Interaction and browser checks

- Three vendor prices render for Trailmakers Experiences, Wanderlust Trails, and Horizon DMC Partners.
- Changing Nights from 3 to 4 recalculates all three totals, confirming the simplified rows remain live results rather than static text.
- No Best label, breakdown table, summary block, selected quote state, or Open rate card action is present.
- No horizontal viewport overflow and no browser console errors.
- Typecheck, lint, and production build pass. Lint reports only pre-existing warnings in unrelated components.

## Full-view and focused comparison

- The full-view comparison clearly shows the removed tab and the reduction from a selected quote plus breakdown to a direct three-row price list.
- A focused crop was not required because the relevant tabs, inputs, vendor names, prices, and removed regions are all legible at full resolution.

## Comparison history

- Pass 1: the simplified implementation matched the requested information level and preserved live price recalculation. No P0/P1/P2 follow-up fix was required.

final result: passed

---

# Rate-card header action system QA

## Evidence

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\0cac0ad3-9ed9-4199-bf77-b41cb9b4f8c7-a9f25af0-ec36-46b7-8a9c-f3c1718538fb.png` (1844 x 974 pixels).
- Browser-rendered implementation: `C:\Users\YAKSHITH\.t3\userdata\browser-artifacts\browser-screenshot-localhost-muf632oc-065899b8.png` (1280 x 676 rendered artifact from the 1844 x 974 reference viewport).
- Combined full-view comparison: `C:\Users\YAKSHITH\Vendor-CRM\rate-card-actions-qa.png` (1280 x 1352 pixels; source normalized above implementation).
- Browser viewport setting: 1844 x 974 CSS pixels at device scale factor 1.
- State: Accommodation tariff · 2026–27 rate-card detail, Rate card tab, view mode.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested header-action correction.
- The ambiguous icon-only actions are replaced with explicit `Download rate card` and `Edit rate card` labels.
- The actions now follow the module hierarchy: outlined secondary download action followed by the filled primary edit action.
- The record header, status, metadata, tabs, season controls, and pricing content remain unchanged.

## Required fidelity surfaces

- Typography: both actions use the established small button size, label weight, and icon-to-label spacing from the existing button component.
- Spacing and layout: actions remain right-aligned in the header with an 8 px gap and wrap safely on narrower layouts.
- Colors and tokens: download uses the existing outlined brand treatment; edit uses the existing filled primary treatment.
- Icon fidelity: the platform's existing download and pencil icons are reused; no substitute assets were introduced.
- Copy and behavior: download exports the selected season as CSV, while edit enters the existing editing state and changes to `Done editing`.

## Interaction and browser checks

- `Edit rate card` enters editing mode and the action changes to `Done editing`.
- `Done editing` exits editing mode cleanly.
- `Download rate card` triggers a CSV download for the currently selected season.
- Typecheck and production build pass. Lint completes with only pre-existing warnings in unrelated files.
- No new application console errors were observed.

## Comparison history

- Pass 1: button hierarchy, labels, spacing, and interactions matched the requested platform button system. No P0/P1/P2 follow-up fix was required.

final result: passed

---

# Design QA â€” Vendor overview recent activity

## Comparison target

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-6597fddd-e764-4da4-b554-08d976da58ec.png`
- Browser-rendered implementation: `C:\Users\YAKSHITH\.t3\userdata\browser-artifacts\browser-screenshot-localhost-muhzlrt5-b5547212.png`
- Source pixels: 1519 Ã— 444, cropped reference region at 1Ã— density.
- Implementation pixels: 1280 Ã— 800, CSS viewport 1280 Ã— 800 at 1Ã— density.
- State: Trailmakers Experiences â†’ Overview, scrolled to Recent activities.

## Full-view comparison evidence

The implementation keeps the existing vendor CRM frame and converts only the Recent activities region. The source's chronological reading order is preserved: date, connected stage marker, event, and supporting context. Member attribution is added as the final column because it is required by the vendor CRM information model. The surrounding CRM spacing, typography, borders, and teal/pink accents remain consistent with the existing product rather than copying the source's unrelated shell.

## Focused region comparison evidence

The timeline region was reviewed at its rendered desktop size. Row height is compact, the date column remains stable, the rail is continuous between events, the latest event has a stronger teal marker, event context stays secondary, and member attribution is visually quieter than the event. No table headers, checkboxes, search field, or pagination remain in the Overview summary.

## Required fidelity surfaces

- Fonts and typography: Existing CRM font tokens and hierarchy are preserved. Dates use the established mono treatment; event titles remain the strongest row text; context, time, and member role are secondary.
- Spacing and layout rhythm: Four evenly separated rows use the product's existing page padding and hairline dividers. The rail aligns consistently through every row and the responsive layout collapses to a single reading column below 620px.
- Colors and visual tokens: Existing surface, ink, line, accent, and focus tokens are used. The only emphasized marker is the newest event.
- Image quality and asset fidelity: No raster imagery is required. Existing design-system avatars and the product's icon library are used; no placeholder or improvised image assets were introduced.
- Copy and content: Existing vendor activity data is preserved and shortened to event title plus source context. The member remains last, matching the requested operational reading order.

## Interaction and accessibility checks

- Semantic ordered-list structure and a descriptive timeline label are present.
- The `View all` control uses the existing vendor tab callback to open the full Activity workspace.
- Visible keyboard focus is provided for `View all`.
- Desktop rendering was checked in the collaborative browser at 1280 Ã— 800.
- Browser console contained only the preview host's pre-existing Electron sandbox error; there were no application runtime errors.

## Findings

- No actionable P0, P1, or P2 issues remain.
- P3: The compact mobile composition is implemented in CSS but could not be re-captured after the collaborative preview host disconnected.

## Comparison history

- Initial implementation removed the duplicate table workflow and introduced the chronological stream.
- Browser review confirmed the event hierarchy and showed no desktop overflow or alignment problems; no P0/P1/P2 correction pass was required.

## Implementation checklist

- [x] Replace the Overview data table with a timeline summary.
- [x] Keep date and time first.
- [x] Show event and module context together.
- [x] Keep the responsible member last.
- [x] Make `View all` hand off to the detailed Activity tab.
- [x] Preserve responsive and keyboard-accessible behavior.

final result: passed

---

# Design QA — Operating history summary

## Comparison target

- Source visual truth: `C:\Users\YAKSHITH\.t3\userdata\attachments\8d85a0b4-8554-45af-9df6-b26129e4a521-fd2c1d40-da35-4364-b876-50b121b01d0f.png`
- Browser-rendered implementation: `C:\Users\YAKSHITH\.t3\userdata\browser-artifacts\operating-history-icon-leading.png`
- Source pixels: 372 × 419, focused reference crop at 1× density.
- Implementation pixels: 1107 × 139, focused component capture from a 1440 × 900 CSS viewport at 1× density.
- State: Trailmakers Experiences → Overview → Operating history.

## Visual comparison

The reference's icon-leading composition is preserved across all four fields: a softly tinted icon tile anchors the left side, and one uppercase label plus one mono value forms the text stack. Supporting notes are intentionally omitted. Existing CRM dividers, page padding, palette, and typography tokens keep the component native to the product.

## Required fidelity surfaces

- Fonts and typography: Existing label and mono value tokens match the reference hierarchy and remain legible without a tertiary line.
- Spacing and layout rhythm: The 48px icon tile, 14px gap, and 100px field height match the reference proportions while preserving the four-column strip.
- Colors and visual tokens: Existing pink-soft and pink tokens reproduce the reference's icon treatment without introducing a new palette.
- Image quality and asset fidelity: The product's existing icon library is used; no raster or placeholder assets are required.
- Copy and content: Each field contains exactly one label and one value. The former descriptive notes are not rendered in this variant.

## Verification

- Four fields rendered with zero `.summary-strip__note` elements.
- Document width matched the 1440px viewport, with no page-level horizontal overflow.
- Browser console and page-error capture returned no application errors.
- Production build and lint completed successfully; lint reports only pre-existing warnings outside this change.

## Findings

- Initial comparison found the icon tile too small relative to the source; padding was increased from 10px to 14px.
- Post-fix comparison found no remaining P0, P1, or P2 mismatch.

final result: passed
