# Design-system usage — Vendor Rate Cards

Consumer app for the Vendor Rate Cards screenshot. Shared UI is imported from `@paryatech/design-system` (`github:yakosasam797/-Design-System-03-experiment`). Local files are compositions only; nothing from the design-system repository was copied or modified.

| Screenshot element | Imported component | Props/variant | Tokens/pattern used | Local composition or gap | Reason |
| --- | --- | --- | --- | --- | --- |
| App frame, sidebar, workspace, topbar | `AppShell` | `brandName`, `notes`, `navGroups`, `sidebarFooter`, `search`, `actions`; `listMode` off so Notes stay visible | `--ground`, `--panel-ground`, `--radius-lg`, `--panelShadow`, `--page-pad` on `.pt-content`; hide sidebar ≤1000px | — | Shell pattern is the documented application frame. |
| Brand mark + “paryatech” | `AppShell` default mark | `brandName="paryatech"` `brandAction` caret | `--type-heading-brand-*`, `--accent` | Caret SVG from AppShell story | Package brand chrome + story `brandAction`. |
| Notes strip | `NotesStrip` | `label="Module notes"` `badge={2}` | `--type-label-notes-*`, `--type-mono-badge-*`, `--pink-*`, `--radius-md` | — | AppShell story chrome (`With notification count`). |
| Sidebar groups and items | `SidebarNav` via `navGroups` | AppShell `exampleNav`: Home, All inbox, News, All tasks (badge 4), Queries, Packages, Bookings, Customers, Vendors (active), All finances, Team, Automations, long reports label | `--type-label-nav-*`, `--type-label-group-*`, `--pink-soft` active | Local icon SVGs (icons are not exported) | Copied from Patterns/AppShell stories, not the cropped product screenshot. |
| Credits 720 / 1000 + Upgrade | `CreditsMeter` | `remaining={720}` `total={1000}` | `--type-mono-credit-*`; Upgrade = `Button` `primary` `sm` | — | Sidebar footer recipe. |
| Collapse control | `AppShell` built-in | — | `--type-label-compact-*` | — | Shipped with the shell. |
| Top search | `SearchField` | placeholder “Search anything”; local wrapper for Query scope | `--type-body-search-*`, `--radius-md`, 36px control | **Gap → Query chip** | Package search has no trailing scope slot. Matches TopBar search + Query. |
| Owner / Admin / Member | — | — | `--type-label-account-size`, `--type-body-search-*`, `--accent-soft`, `--accent-ink`, `--radius-pill`, `--line` | **Gap → `RoleSwitcher`** | No Role Switch in the package. Local control follows TopBar Role Switch (pill track). |
| Settings / Info / Phone / Bell | `IconButton` | `label`; Bell `alert`; local round class | 36×36, `--line`, alert `--bad` | Phone icon is local; round radius is a TopBar override (`--radius-pill`) | Package IconButton is soft-rect; TopBar utilities are circular. |
| Account menu | `Avatar` | `tone="pink"` `size={26}` | `--pink-line`, `--radius-md` (booking `.acct` soft-rect) | **Gap → `account-btn`** + Avatar + caret | Matches new-direction-03 topbar account. |
| Rate-card detail header | — | — | Teal-tint record shell; title + tags; date + **`IdChip`** | **Reusable → `RecordHeader` + `IdChip`** | Ported from booking `.record` / `.bk-ref` / `.id-chip`. |
| Rate-card list lead | `LeadCell` | pin icon + title + mono ref subtitle | Booking list lead recipe | — | Same as Booking name + BK-ID. |
| Breadcrumbs in the page (CRM › Vendors › Example Hospitality) | — | — | `--type-body-copy-*`, `--type-body-copy-strong-weight` | **Gap → `page-crumbs`** | `AppShell` `crumbs` slot is topbar-only; screenshot puts crumbs in the record. |
| Vendor code / location / recency | — | — | `--type-mono-rec-id-*`, `--accent`, `--type-body-meta-*` | Part of `VendorProfileHeader` | No record-header pattern. Recency italic has no type role. |
| Vendor title “Example Hospitality” | — | — | `.type-heading-record` | Part of `VendorProfileHeader` | Record title, not `ListPage` `heading-page`. |
| Active supplier chip | `StatusChip` | `tone="done"` | `--ok` / `--ok-bg` / `--ok-line`, `--type-label-status-*`, `--radius-pill` | `StatusChipWithDot` (leading `currentColor` dot) | Semantic success tone; package chips have no status dot. |
| Accommodation category chip | `StatusChip` | `tone="open"` | `--info` / `--info-bg` / `--info-line` | — | Neutral/info tone for category, not a hardcoded grey. |
| Owner name, desk, AM | `Avatar` | `tone="pink"` `size={32}` | `--type-body-emphasis-*`, `--type-body-owner-sub-*` | **`VendorOwnerSummary`** | `OwnerCell` is table-density; this is a record aside. |
| Edit vendor | `Button` | `variant="primary"` `size="sm"` | `--type-label-button-sm-*`, `--accent`, `--radius-sm` | Pencil icon local | Compact list CTA, not `md`. |
| Section tabs + counts | `TabBar` | items + counts; `value="rate-cards"` | `--type-label-tab-*`, `--pink` active underline, `--type-mono-count-*` on chips | — | Section tabs, not `ListPage` (that pattern forces a list `h1`). |
| Rate-card search | `SearchField` | `fullWidth` | `.pt-search--full`, `--type-body-search-*` | — | List toolbar recipe. |
| Filter / date / refresh | `IconButton` + `Tooltip` | icon-only | IconButton 36×36 | **Gap:** `FilterSelect` cannot collapse to icon-only | Screenshot shows icon actions, not a labelled filter. |
| Import tariff | `Button` | `variant="brand"` `size="sm"` | Teal outline work style | Import icon local | Compact secondary CTA. |
| New rate card | `Button` | `variant="primary"` `size="sm"` | Filled teal work style | Plus icon local | Compact primary CTA. |
| Rate-card table | `DataSheet` + `Header` / `Row` / `Cell` | default variant + local column template | `--side` sheet header (`#FCFBFA`); `--type-label-table-head-*` (Public Sans 12/600/+0.01em, `--ink-2`, sentence case like DataSheet “Booking”); `--line` / `--line-2`, cell `min-height` 52px | **Gap:** only `booking` column template exists | Seven columns, different widths than Booking List. Do not use `label-field` uppercase for sheet columns. |
| Row checkboxes | `Checkbox` | `off` / `on` / `indeterminate` | `--checkbox-line`, `--pink` checked, `--radius-xs` | — | Sheet checkbox recipe. |
| Rate card title + type · INR | `LeadCell` | `title` + custom subtitle node | `--type-body-emphasis-*`; subtitle `--type-body-secondary-*` | Subtitle not `LeadCell` string (that role is mono ID) | Title matches LeadCell; kind line is sans, not mono. |
| Property | `DataSheetCell` | — | `--type-body-*` | — | Plain body cell. |
| Stay validity | `StackCell` + `StackLine` | `mono` + `muted` | `--type-mono-date-*` via `.pt-mono` (tabular nums), `--type-body-secondary-*` | **`RateCardValidityCell`** | Local wrapper only; helpers already exist. Do not promote. |
| Published / Expired / Draft | `StatusChip` | `done` / `open` / `progress` | Semantic status tokens, not label colours | `StatusChipWithDot` | Q2=A: four tones; labels map onto tones. |
| Coverage | `StackCell` + `StackLine` | count in `.pt-mono` | tabular nums on counts | **`RateCardCoverageCell`** | Local wrapper only; do not promote. |
| Open | `Button` | `brand` `sm` | Compact / table-row size (`sm`, not `md`); teal outline work style | — | Outline row action. No table-row size in the package. |
| Continue | `Button` | `primary` `sm` | Compact filled row action | — | Draft continuation CTA. |
| “Showing 1–n of n rate cards” + pager | `Pagination` | `rangeLabel` `page` `pageCount` | `--type-mono-range-*`, `--pink-soft` active page | — | Sheet footer recipe. |
| Empty other tabs / empty search | `EmptyState` | title + description | package empty pattern | — | Loading/Error are compose-only in this pilot. |
| Skip link | `SkipLink` | via `AppShell` | focus `--focus` 2px | — | Q7=B. |

## Local compositions (keep in the product)

| Composition | Promote to the design system? |
| --- | --- |
| `VendorProfileHeader` | **Propose later** as a domain-agnostic `RecordHeader` (id, meta, title, chips, aside, primary action). Too specific to ship as “Vendor*” in this trial. |
| `VendorOwnerSummary` | **No.** `Avatar` + type roles are enough. `OwnerCell` stays a table helper. |
| `RateCardValidityCell` / `RateCardCoverageCell` | **No.** Thin wrappers over `StackCell` / `StackLine`. |
| `RoleSwitcher` | **Yes, as a gap.** Need a compact segmented control (or FilterSelect icon-only mode). |
| `StatusChipWithDot` | **Yes, as a gap.** Optional leading indicator on `StatusChip`. |
| `page-crumbs` | **Yes, as a gap.** Breadcrumb component, or document `AppShell` crumbs for in-page use. |
| `account-btn` | Small. Booking-style soft-rect account with pink Avatar + caret. |
| `IdChip` | **Yes — reusable.** Booking ID chip (mono ref + copy). Promote later. |
| `RecordHeader` | **Yes — reusable.** Booking record header shell for any entity. Promote later. |

## Missing design-system capabilities

1. **Record / entity header** — `ListPage` is a list title + tabs + toolbar + sheet. This screen is a record with a nested list.
2. **In-page breadcrumbs** — crumbs slot lives in the topbar.
3. **Role / segmented control**.
4. **Icon-only filter / date trigger** — `FilterSelect` always shows a text label.
5. **DataSheet column templates** beyond `booking`.
6. **StatusChip leading dot**.
7. **Table-row button size** — only `sm` / `md` plus `IconButton`. Row actions use `sm`.
8. **Exported icon set** — Storybook icons are not package exports.
9. **Italic meta role** for “Updated 3 days ago”.
10. **Circular avatar** — `Avatar` uses `--radius-sm` (soft-rect).

## Raw values (unavoidable)

| Value | Where | Why |
| --- | --- | --- |
| `220px` width | `RoleSwitcher` | TopBar Role Switch contract; no width token. |
| `32px` height | Query scope chip | Matches `Button` `sm` (32px); no compact-height token. |
| `36px` | `account-btn` / Role Switch outer | Matches `IconButton`. |
| `calc(var(--page-pad) + 46px)` and `minmax(240px, 2.2fr)` etc. | `.rate-card-sheet` | Same check-column recipe as `DataSheet` `booking`; widths follow that pattern because no rate-card template exists. |
| `min-width: 880px` | sheet rows | Copied from `.pt-sheet--booking`. |
| `0.5em` | status dot | No indicator-size token; avoids a new hex/px colour. |
| `font-style: italic` | recency | No italic type role. |

No raw hex colours were added. Focus rings use `--focus` from the package.

## Visual differences from the screenshot

- Screenshot pager copy says “1–4 of 4” while five rows are visible; this app shows five rows and “1–5 of 5”.
- Tab count “Rate cards 1” is copied from the screenshot even though five cards are listed.
- `StatusChip` has no built-in dot; dots are composed with `currentColor`.
- Avatars are soft-rect (`--radius-sm`), not circular.
- `Button` `sm` uses `--radius-sm` (8px); some screenshot CTAs look closer to `--radius-md` (10px).
- Active tab underline is `--pink` (person), per TabBar — matches the system, not a teal tab.
- Checkbox checked fill is `--pink`, per Checkbox — not teal.
- Pagination current page is pink-soft, per Pagination.
- No dedicated table-row button; Open / Continue use `sm`.
- Other vendor tabs are `EmptyState` placeholders.
- Filter / date / refresh are icon buttons without working panels (`FilterSelect` would change the screenshot).

---

# Rate Card detail

Detail experience ported from `references/Vendor-Rate-Card.dc.html`. List **Open** / **Continue** navigate here; topbar back + crumbs return to the vendor list.

| Detail element | Imported component | Props/variant | Tokens/pattern used | Local composition or gap | Reason |
| --- | --- | --- | --- | --- | --- |
| Shell + back | `AppShell` | `leading` back `IconButton`; `crumbs` Vendors › vendor › card | package topbar slots | Crumb links styled locally | HTML topbar back + crumbs |
| Preview as | — | — | same as list Role Switch | **`RoleSwitcher`** under content | HTML places Preview as in the page, not topbar |
| Record header | — | — | `--surface-2`, `--radius-lg`, `--type-heading-record-*`, `--type-mono-ref-*`, `--accent` | **`RateCardHeader` region in `RateCardDetailPage`** | No DS record header |
| Status / ready / tax chips | `StatusChip` (+ local dot) | tone map from card tones | semantic status tokens | `StatusChipWithDot` for state | Pills only for status |
| Switch card menu | `Button` `brand` `sm` + menu | — | `--menuShadow`, `--radius-lg`, `--accent-soft` | **`CardSwitcherMenu`** | No DS menu/popover |
| Download PDF / Edit rates | `Button` | brand / primary `sm` | teal = work | Print stub for PDF | Matches prototype |
| Notes panel | `IconButton` trigger | — | `--overlayShadow`, `--surface` | **`rc-notes` side panel** | No Notes panel pattern beyond strip |
| Page tabs | `TabBar` | Rate card / Test rate / Policies (count) / Versions / Activity | `--pink` active | — | Section tabs |
| Season workspace bar | — | sticky | `--blockShadow`, `--radius-lg` | **`SeasonWorkspaceBar`** | Product-specific sticky scope |
| Seasons / pricing / guests / supplements / activities / services | — | CSS grid matrices | `--pink-soft` head, `--line`, price chips via `--ok-*` / `--warn-*` / `--bad-*` | **`PriceMatrix` / `PriceChip`** | Dynamic meal columns; DataSheet booking template does not fit |
| Test rate | `Button`, `StatusChip` | inputs token-styled | `--radius-md` fields | Quote UI + `src/rateCard/engine.ts` | Engine is domain logic, not UI |
| Policies | `StatusChip` | cancel / terms / stay rules | semantic tones | Local tables | No PolicyList in DS |
| Versions | `Checkbox`, `Pagination`, `Button`, `StatusChip` | bulk discard bar | `--bad-bg` selection bar | Version table composition | Sheet helpers reused conceptually |
| Activity | `Avatar`, `StatusChip` | `tone` pink/default | soft-rect avatar | Activity log table | Append-only log |
| Template picker | — | modal | `--overlayShadow` | **`TEMPLATES` modal** | Create flow from HTML |
| Blank / new drafts | — | editable title when editing | same matrices | `rc-new-hotel` / `rc-new-visa` seeds | Accommodation + Visa templates enabled |

## Local compositions (Rate Card detail)

| Composition | Promote to the design system? |
| --- | --- |
| `RateCardDetailPage` header / switcher / season bar / matrices / notes / template modal | **Propose later** as domain-agnostic pieces (`RecordHeader`, `Menu`, `StickyWorkspaceBar`, `PriceChip`) — keep product-specific naming out of the package for now. |
| `src/rateCard/engine.ts` | **No.** Domain quoting logic. |
| Detail CSS price chips | **Maybe** as a money-status chip if other modules need missing/warn/ok money cells. |

## Seed data

- `src/rateCard/cards.ts` — accommodation, hill draft, visa, expired, transport, blank hotel/visa.
- `src/rateCard/types.ts` — section model + `TEMPLATES`.
- Reference HTML: `references/Vendor-Rate-Card.dc.html` (non-runtime).

---

# Communication & Activity (new-direction-03)

Layouts follow [`yakosasam797/new-direction-03`](https://github.com/yakosasam797/new-direction-03) (`booking-redesign.html` Communication + Activity panels). Reference copy: `references/Booking-ND03-communication-activity.html`.

| Surface | Where | Pattern |
| --- | --- | --- |
| Communication | Vendor tab **Communications** | Split pane: conversation list (320px) + thread + composer; pink selection rail; channel pills (WhatsApp=`--ok-*`, Email=`--info-*`); unread=`--pink-*`; outbound bubbles=`--pink` |
| Activity | Rate Card tab **Activity** | ND03 **open sheet** (DataSheet bleed, column rules, `--side` head) — not a bordered card; toolbar search + module filter; rate-card event content |

| Element | Imported | Local |
| --- | --- | --- |
| Composer Send / New message / Request document | `Button` primary/brand | — |
| Attach | `IconButton` + `Tooltip` | — |
| Activity checkboxes / pager | `Checkbox`, `Pagination` | — |
| Activity search | `SearchField` | — |
| Member avatar | `Avatar` | — |
| Activity open sheet | `DataSheet` + `StackCell` / `LeadCell` | Column template `--act-cols` (local, like rate-card sheet) |
| Conversation list / thread / channel chips / message bubbles | — | **`CommunicationPanel`** |
| Activity stamp icons + module filter wrap | — | Local icons / `act-filter` only |
| Seed threads | — | `src/data/communications.ts` (vendor-adapted ND03 sample) |

Colours use DS tokens only (no ND03 hex). Soft-rect controls; pills only for channel / unread / status. Activity must **not** use a bordered rounded card around the table — that fights the ND03 open-sheet language.
---

# Settings, Account & Notifications (hub-and-spoke)

No nested Settings sidebar. Top-bar entry points stay independent:

| Entry | Surface | Behavior |
| --- | --- | --- |
| Gear | `SettingsLauncherModal` | Navigation launcher only ? dedicated `/settings/*` pages |
| Bell | `NotificationPanel` | Right-side center ? `/notifications` or `/account/notification-preferences` |
| Avatar | `AccountLauncher` | Compact popover ? `/account/*`; Sign out demo |

Reusable local compositions (promote to DS later � package has no Modal/Popover/Sheet):

- `SettingsLauncherModal`, `LauncherGroup`, `LauncherItem`
- `SettingsPageHeader`, `SettingsSectionCard`, `PermissionState` (page-level Read only), `UnsavedChangesBar`
- `AccountLauncher`, `NotificationPanel`, `WorkspaceSetupStrip` / setup checklist items

Permissions: `permissions.ts` `canSettings` / `settingsAccess` � Owner edit-all; Admin operational edit + billing/domains view; Member none. Call logs / phone util removed from the top bar.
