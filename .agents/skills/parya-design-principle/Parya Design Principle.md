---
name: parya-design-principle
description: Apply Paryatech-wide UI design rules when creating, editing, or reviewing screens in any module. Covers the shared shell, cross-module component review, global utilities, and data-table actions.
---

# Parya Design Principle

Use these rules throughout Paryatech, across all modules. They are product design conventions, not Vendor CRM-specific behavior.

## Shared workspace shell

Treat the interface as two connected layers:

1. **Workspace shell:** The persistent Paryatech sidebar and top navigation. It owns the brand, module navigation, notes entry, usage/upgrade and collapse controls, Back and breadcrumbs, universal search, help, notifications, and account access.
2. **Module workspace:** The page inside that shell. It owns the module's title, actions, tabs, filters, tables, record details, and workflows. Module content can change without creating a second sidebar or top bar.

Use the finalized Vendor CRM shell as the current visual and interaction reference for both layers. Reuse the shared shell and design-system components rather than rebuilding its chrome in each module. A new module or embedded view should supply its content and navigation state to the shell. It should not show a duplicate sidebar, header, search, or account control.

- Keep the Paryatech lockup, sidebar width and collapse behavior, navigation order and grouping, active-state treatment, and footer placement consistent across modules. The active destination changes; the shell's structure does not.
- Keep the top bar in the same position and hierarchy: contextual Back and breadcrumbs on the left, global search and utilities on the right. Back returns to the previous meaningful view; breadcrumbs identify the current module and record.
- Distinguish **global search** in the top bar from a page's table or record search. Each searches its stated scope, and opening a local search does not replace the global control.
- Keep shell layout, spacing, typography, color roles, and responsive behavior on shared tokens. If another module's chrome differs from the finalized Vendor CRM pattern, align the shared shell rather than adding a module-specific visual fork.

## Notes and global utilities

- Keep one recognizable notes entry directly below the brand in the sidebar. Its main action opens notes for the current module or record; its add action opens the compose state. Change the contextual label and related records, while preserving the shared notes component and interaction pattern.
- Notes, universal search, notifications, account, and settings open through their established shared drawer, panel, menu, or dialog patterns. Match the Vendor CRM placement and behavior for each control; do not force every utility into the same kind of modal.
- Keep global utilities available when moving between modules and detail pages. Opening one should not leave conflicting menus or panels open. Closing it should return focus to its trigger where appropriate.
- Settings is a shared workspace destination with permission-aware entries. Account and profile actions use the shared account control. Help keeps the same top-bar entry point. Modules may provide relevant content or destinations, but should not invent separate copies of these controls.
- When a shell detail is unclear, inspect the current Vendor CRM implementation and the shared design-system component before designing a new variant. Preserve the module's own data and workflow; reuse the global chrome.

## Temporary cross-module component review

Use this review rule until Yakshith says the design inconsistencies across modules have been resolved. It applies when introducing a component or materially changing a shared pattern.

- Inspect comparable components in the relevant modules, including Vendor CRM, Customers, and Bookings where they exist. Record which existing component is closest, where it comes from, and what differs in appearance or behavior. Use the finalized Vendor CRM and the shared design system as references, while checking the actual use case.
- Prefer adapting an established component through its content or supported variants. For example, one record header may need an image and another may not; that content difference alone does not justify a different shell, spacing system, or interaction pattern.
- Before introducing a new component or variant into the product, show Yakshith a reviewable HTML comparison: the existing source component beside the proposed version in its intended context. Label the source module/component, the changes, and the reason they fit the shared design language. Prepare this concrete comparison first, then ask for approval of the proposed version.
- Introduce the new component or variant only after that approval. Do not create another visual pattern solely from agent preference. Once approved, put reusable behavior and styling in the shared component or design-system layer where appropriate, so other modules can follow the same pattern.

## Data tables

For any table whose rows represent records with a detail view:

- The full row opens its record when clicked. Its primary name opens the same record. A focused row opens with Enter or Space.
- Do not add a separate **View** or **Open** CTA button in a table cell or a dedicated view column.
- The three-dot action menu includes **Open** or **View** for that record. It can also contain relevant actions such as Edit and Delete. Row click and the menu's Open/View action lead to the same record.
- Checkboxes, links to other records, and the three-dot button act independently. Using them must not also trigger row navigation.
- Give menu actions clear labels that name the record type when useful, such as **Open service**, **Edit vendor**, or **Delete booking**.
- Confirm a destructive action in a dialog that names the record and states its immediate effect. Offer Cancel and update the table only after confirmation.
- Keep the row, menu, and confirmation dialog keyboard accessible with visible focus.

Apply this convention to service, vendor, booking, customer, and other Paryatech data tables whenever a row has its own detail view.

## Instruction history

When Yakshith adds or corrects a design principle, append a brief entry here in the order he gave it. Use two or three plain-language lines per entry, preserve earlier entries, and record his request rather than the implementation steps.

1. **Data-table actions:** Make the full row open its record. Do not put a separate View button in the table; include Open or View in the three-dot menu, alongside relevant actions.
2. **Shared shell:** Use the finalized Vendor CRM sidebar, top navigation, notes, and global account, help, notification, and settings patterns throughout Paryatech. Keep one workspace shell around each module's own content.
3. **Keep this history:** Add a short record whenever Yakshith gives or corrects a design principle so he can review what he asked for later. Keep it simple and retain the previous entries.
4. **Temporary component review:** Compare similar components across modules before designing a new one. Show the existing source and proposed adaptation together in HTML, explain the changes, and wait for Yakshith's approval before introducing a new component or variant.
