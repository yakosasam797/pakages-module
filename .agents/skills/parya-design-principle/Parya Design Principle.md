---
name: parya-design-principle
description: Apply Paryatech-wide UI design rules when creating, editing, or reviewing screens in any module. Includes the shared data-table row and action-menu convention.
---

# Parya Design Principle

Use these rules throughout Paryatech, across all modules. They are product design conventions, not Vendor CRM-specific behavior.

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
