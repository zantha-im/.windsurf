---
trigger: model_decision
description: Standard table layout + design patterns. Enforces canonical wrapper structure, consistent table headers, sorting affordances, numeric column conventions, and shared loading/empty/error states.
---
Tags: ui, tables, css, design-system

## When to use this rule
- **Any new data table/grid**
- **Adding sorting / numeric columns**
- **Refactoring table styling drift**

## Shared modules (project-relative paths + import aliases)
- `components/Table.module.css` as `tableStyles` (required)
- `styles/components.module.css` as `styles` (for loading/empty/error states)
- `styles/buttons.module.css` as `btnStyles` (if the table header has actions)

## Canonical table structure (required)
Use the wrapper structure below:
- `tableStyles.section`
- header above table:
  - `tableStyles.tableHeader` OR
  - `tableStyles.tableHeaderThreeCol`
- `tableStyles.tableContainer`
- `tableStyles.tableWrapper`
- `tableStyles.table`

## Column conventions
- Numeric: `tableStyles.numeric`
- Centered: `tableStyles.centerCell`
- SKU / monospace identifiers: `tableStyles.sku`

## Sortable headers (if sorting exists)
- Clickable label: `tableStyles.sortable`
- Active sort: `tableStyles.sortable active`
- Arrow indicator: `tableStyles.arrow`

## Row conventions
- Clickable row: `tableStyles.clickableRow`
- Row-hover edit affordance: `tableStyles.editButton`

## Table states (must be shared)
Do not create table-specific state styling.
Use:
- Loading: `styles.loading`
- Empty: `styles.emptyState`
- Error: `styles.errorAlert`

## Local CSS rule (allowed but constrained)
Component-level `.module.css` is allowed only when:
- The styling is genuinely table-specific for that component, AND
- It cannot be expressed with the shared modules.

Never recreate the shared table system in a component module.

## Import rule (formatter safety)
When adding new style/icon imports, ensure the import and its usage occur in the same edit to prevent unused-import stripping.