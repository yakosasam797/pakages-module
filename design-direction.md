# Paryatech project design direction

Paryatech is a travel agency workspace. Staff move from a package catalogue to a day-by-day itinerary, a priced proposal, and then a booking. The interface should make the trip and its commercial state easy to inspect without making staff decode the software's internal structure.

## Shared visual language

| Role | Value | Use |
| --- | --- | --- |
| Workspace | `#ffffff` | Forms, tables, and records |
| Quiet surface | `#f6f8fa` | Supporting rails and grouped context |
| Ink | `#16181d` | Headings and primary data |
| Rule | `#e4e7ec` | Boundaries between working areas |
| Work teal | `#0f6e63` | Primary actions, selected work items, and editable service context |
| Navigation pink | `#a5537e` | Active navigation, tabs, and person or place context |

Use the shared design system tokens for these values. Status colours communicate status only. Use Onest for page, section, and action headings; Public Sans for fields, descriptions, and table content. Reserve JetBrains Mono for references, dates, counts, and tabular money. Keep the shared type scale: a page heading around 22–24px, a section heading around 15–18px, field labels around 13px, and secondary copy around 12–13px. Avoid adding a new type scale inside a single step.

## Page compositions

```text
Catalogue:       sidebar | title and actions
                         | tabs
                         | filters
                         | continuous data sheet and pager

Creation flow:   sidebar | record header
                         | stage navigation
                         | context rail | editable workspace
                         | bottom action bar

Itinerary:       sidebar | stage navigation
                         | day list with each day's services
                         | bottom action bar
```

Keep left alignment consistent across titles, tabs, filters, tables, and form content. A section label explains a group of fields; it should not repeat the page title. Numbering belongs on real sequences such as days and creation stages. A day can contain several service blocks. Service type is chosen before searching for a service, and all available matches appear in one list regardless of their source.

## Module rules

- **Packages:** Use the list as an operational catalogue. Keep source as a filter and row fact. Basic details, itinerary, and content should share one stage rhythm. Day cards show place and chosen services; an empty day offers one clear Add service block action.
- **Proposals:** Distinguish the customer-facing itinerary format from costing. Keep the template choice concise, then give itinerary building a full workspace. A customer preview should resemble the view opened from an existing proposal.
- **Destination and Vendor CRM:** Use destination imagery and supplier detail as useful evidence for selection. Preserve one coherent service search; do not expose separate technical source choices in the staff flow.
- **Bookings and Finance:** Reuse the same shell, typography, and work/action colour roles. Give financial amounts explicit currency and tabular alignment. Finance-specific composition and language follow `finance-module/docs/design-direction.md`.

## Interaction and review

Write actions as the result they create: Add day, Add service block, Continue to itinerary, Save package. Empty states should offer the next useful action. Keep controls keyboard reachable with visible focus, respect reduced motion, and make dense data sheets scroll within their region at narrow widths. Review the package list, both creation flows, detail views, and one embedded module at desktop and narrow widths after shared style changes.
