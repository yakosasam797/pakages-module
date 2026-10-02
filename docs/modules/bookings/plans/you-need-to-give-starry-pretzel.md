# Booking Detail — Redesign (Overview + Vouchers)

## Revision 2 — enterprise "inset shell / bento" restyle (current task)
The full-bleed pink-accent version is built (`booking-redesign.html`, mirrored into `src/App.tsx` via iframe). This revision restyles it toward a clean, techy, enterprise-SaaS design language. Scope of THIS pass:

1. **Design language = inset workspace shell + bento blocks.** Neutral ground with content as modular, softly-rounded, hairline-bordered **white** surfaces (record header, trip summary, itinerary, vouchers each a block). Restrained shadows, consistent spacing, clear hierarchy without heaviness. NOT a single frame wrapping the whole app (that pop-up look was rejected) — sidebar stays flush-left, blocks float on the ground.
2. **Cooler surface palette.** Replace the warm cream (`--canvas:#F7F5F1`, warm papers) with a cool neutral enterprise system: ground `#F6F7F9`, surfaces `#FFFFFF`, subtle inner surface `#F8F9FB`, hairlines `#E7E9EC`, ink `#1A1D21` / `#5F6570` / `#9AA0AA`. Keep green (`#0F6E63` primary/identity) and pink (`#A5537E`/`#FCEFF4`/`#EFBDD5` secondary) as the only chromatic accents.
3. **Full tab bar (all 9), underline style.** Replace the 2-item segmented toggle with the complete booking tab list: Overview, Services & Vendors, Fulfilment & Tasks, Travellers, Documents, Finance, Vouchers, Communication, Activity — underline-active style with mono count chips, horizontally scrollable. Only **Overview** and **Vouchers** render designed content; the other 7 show a minimal empty placeholder ("This section isn't part of this design yet"). Tab counts from V3 TABS (services 2, fulfilment 5, documents 3, finance 2, vouchers 3, communication 2).
4. **Bare content icons.** Remove the `.rowicon` bordered/filled square around inline content icons (itinerary route icons, voucher kind icons). Render just the glyph (muted ink) directly beside its text. Property-label and date icons are already bare — keep. Functional topbar/credit buttons keep their button chrome.

Everything else (faithful V3 content, interactions, tooltips, responsive) stays. Edit the single file `booking-redesign.html`.

## Context
The user has an existing booking module (`src/imports/Booking_V3_-_Direction_01__backup_.dc.html`) — a light-theme travel-ops SaaS with a **dark** sidebar, stacked white cards, underline tabs, and rounded pill chips. They want the **booking detail page** rebuilt with a *new design language* — defined not by color but by **layers, structure, and personality**. The reference image (`src/imports/image.png`, Linear-style) shows the target personality: one unified **framed surface** ("rectangular inside one table"), structured rows grouped under section headers with counts, squared tags, monospace IDs, a **lighter** sidebar (the reference's dark sidebar is explicitly rejected), and a denser, more tabular enterprise rhythm.

Scope is **two tabs only**, redesigned faithfully in content but new in form:
1. **Overview** — Trip summary + Itinerary
2. **Vouchers** — voucher table with toolbar, states, bulk actions, pagination

Deliverable: a **single standalone, self-contained HTML file** (matches "give an HTML file" and the attached import's format). Real static markup + a small amount of vanilla JS for tab switching and row/checkbox interactions — no template engine.

## New design language (the "personality" shift)
- **One framed workspace.** The whole app lives inside a single rounded, hairline-bordered surface floating on a soft off-white canvas with breathing-room padding — the "everything inside one table" feel from the reference, replacing V3's separate stacked cards.
- **Lighter sidebar.** Warm off-white/paper sidebar with hairline separators and subtle active-state fill (squared, small radius) — not the V3 dark `#35342F`.
- **Rows over cards.** Content is expressed as structured rows within the frame: hairline dividers, hover highlight, section header rows carrying a status dot + monospace count chip.
- **Segmented tabs** (pill/segmented control) instead of underline tabs.
- **Squared tags** (4–6px radius) for status/kind instead of fully-round pills; monospace (JetBrains Mono) for IDs, dates, counts.
- **Property list** for Trip summary (label ↔ value hairline rows) instead of a 3-col card grid — Linear "properties panel" personality.
- Retain the Onest / Public Sans / JetBrains Mono trio for continuity; refine a calm light palette (paper, ink, hairline, one accent + status colors). Follow `aesthetic-stance` at implementation for exact tokens/craft.

## Content to reproduce faithfully (from V3 data)
- **Header band:** breadcrumb (Operations › Bookings › XYZ Family · Dubai), booking id `BK-2026-000003`, source `Q-1042`, title "XYZ Family · Dubai", status tags (Confirmed / Upcoming / At risk), owner "Vrushabh Jain +2" with avatar, Edit booking.
- **Trip summary:** Customer=XYZ Family, Route=Mumbai → Dubai, Lead traveller=Amit XYZ (link), Travel start=18 Aug 2026, Original query=Q-1042 (link), Accepted proposal=Proposal v3 (link).
- **Itinerary:** 5 days (Day 1–5, 18–22 Aug) with route + services, per-row checkbox, select-all, bulk action bar (Export / Add to voucher / Clear). Data at lines 1551–1557.
- **Vouchers:** 5 rows (Tamara Hotel=Blocked, Arrival transfer=Sent, City tour=Sent, UAE visa=Awaiting, Return transfer=Blocked), columns Service/Voucher file/State/Details/Action + more menu; toolbar with search, kind filter, Upload voucher; bulk bar; pagination footer. Data at lines 1619–1625.

## Implementation
Create **one new file**: `/workspaces/default/code/booking-redesign.html`

Structure:
- `<head>`: Google Fonts (`Onest`, `Public Sans`, `JetBrains Mono`) via `@import`/`<link>` first; scoped `<style>` with design tokens (CSS custom properties), the framed-shell layout, sidebar, header band, segmented tabs, row/table primitives, tag/chip styles, hover/reveal rules, tooltip pattern.
- `<body>`: app grid = light sidebar + framed main. Main contains header band, segmented tab control, and two tab panels (`#panel-overview`, `#panel-vouchers`).
- Minimal vanilla JS: tab switching, checkbox toggling + select-all + bulk-bar visibility, hover reveals. No external JS deps.

Keep it accessible/polished: strong contrast, tabular-nums for numbers, clear focus/hover, ellipsis+tooltip on truncating cells (reuse the `[data-tip]` pattern from V3).

## Verification
- Open `booking-redesign.html` directly in a browser.
- Confirm: single framed surface renders; light sidebar; Overview shows Trip-summary property list + Itinerary rows; tab switch to Vouchers shows the voucher table; checkboxes + select-all toggle the bulk bar; hover highlights rows and reveals row actions; tooltips appear; all fonts load.
- No console errors.
