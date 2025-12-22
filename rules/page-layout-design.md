---
trigger: model_decision
description: Standard page layout + design patterns. Enforces reuse-first styling with shared CSS modules, consistent page scaffolding (container/header/content), section cards, filters, stats, and consistent loading/empty/error states.
---
Tags: ui, layout, css, design-system, pages

## When to use this rule
- **New pages/screens/routes**
- **Refactoring layout drift**
- **Adding filters/stats/sections to existing pages**

## Shared modules (project-relative paths + import aliases)
- `styles/components.module.css` as `styles`
- `styles/buttons.module.css` as `btnStyles`
- `styles/pages.module.css` as `pageStyles`
- `styles/modal.module.css` as `modalStyles`
- `components/Table.module.css` as `tableStyles` (only if the page renders a table)

## Page scaffold (standard structure)
Use the standard page container + header + content pattern:
- `pageStyles.container`
- `pageStyles.header`
- `pageStyles.content`

## Sections (cards)
Group related content into card sections:
- `styles.section` (default)
- `styles.sectionNoPadding` (when inner component handles padding)

## Filters + header actions
If the page has filters:
- `styles.filtersContainer`
- `styles.filterGroup`
- labels: `styles.label` or `styles.formLabel`
- inputs: `styles.input`, `styles.select`, `styles.dateInput`
If the header has multiple actions:
- `styles.headerActions`

## Stats / summary cards (when applicable)
For KPI-style summaries:
- `styles.statsContainer`
- `styles.statCard`
- `styles.statLabel`
- values: `styles.statValue`
- color variants: `styles.statValueSuccess`, `styles.statValueWarning`, `styles.statValueError`, `styles.statValuePrimary`

## Standard UI states (must be consistent)
Always use shared state components/classes:
- Loading: `styles.loading`
- Empty: `styles.emptyState`
- Error: `styles.errorAlert`
- Access denied: `styles.accessDenied`

## Local CSS rule (allowed but constrained)
Component-level `.module.css` is allowed only when:
- The styling is genuinely component-specific, AND
- It cannot be expressed cleanly using shared modules.

Do not duplicate shared patterns inside component modules.

## Import rule (formatter safety)
When adding new style/icon imports, ensure the import and its usage occur in the same edit to prevent unused-import stripping.