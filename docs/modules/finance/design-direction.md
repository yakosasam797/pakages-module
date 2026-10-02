# Finance visual direction

Primary reference: [Paryatech Packages platform](https://github.com/yakosasam797/pakages-module), including its Packages list/detail/builder screens and shared navigation for Bookings, Vendors, and Destination. Its `design-qa.md` and `vendor-design-language-audit.md` capture the intended shell and visual rhythm. Packages and Finance now share the root app; preserve their existing screens when applying the shared design direction. Use the local `@paryatech/design-system` package for shared components.

## Shared Paryatech language

- Use the same white workspace inside the pale neutral shell. Keep the official Paryatech lockup at the same sidebar scale, module notes under it, credits above Collapse, and separate navigation groups with quiet rules. The sidebar destination order follows the Packages platform.
- Use Onest for page, section, and action headings; Public Sans for interface copy; mono only for references, dates, counts, and tabular money. Prefer the package type roles over new font declarations.
- Use the package palette: `--surface` (`#ffffff`), `--side` (`#fcfbfa`), `--ink` (`#16181d`), `--line` (`#e4e7ec`), `--accent` (`#0f6e63`), and `--pink` (`#a5537e`). Do not create a Finance palette.
- Teal identifies work actions and record links. Pink identifies the selected navigation or tab state and person/place context. Success, warning, and danger colours describe actual status, not decoration.
- Use compact soft rectangles for controls, restrained rounded cards for distinct entities, and open data sheets for registers and activity. A table should read as one continuous workspace surface, with column rules and an attached pager, not a card nested inside another card. Title, tab, toolbar and sheet edges must follow the same gutter as Packages, without a second page inset.

## Finance composition

- Keep the eight Finance destinations under one module header. Show one page title at a time; do not repeat it below the tabs. Use a pink underline for the selected destination and for secondary tab sets.
- On Overview, show scope and date before four linked metrics, followed by the work queue, cash outlook, and recent activity. Metrics use dark tabular values; semantic colour belongs on their small icon or status treatment.
- Combine related table facts into a readable cell when the workspace width is limited. Keep party and document references clickable, money right aligned, and due and review states next to their source record.
- Use short, literal labels for financial actions: `Record receipt`, `Review payment`, `Verify proof`. Keep the distinction between recorded money, verification, allocation, and bank match visible.
- At narrow widths, let large data sheets scroll within their own region. Keep page headings, actions, metrics, and explanations readable without horizontal page scrolling.

## Before handoff

Compare Overview and one record-heavy destination against the Packages platform's shell and sheet rhythm at desktop width. Check a narrow viewport, run `npm run lint` and `npm run build`, and verify the ₹1,20,000 booking fixture still reconciles.
