---
trigger: model_decision
description: This rule is triggered whenever the agent needs to style a React component, page, or UI element. It enforces a strict "Reuse-First" policy to prevent CSS duplication and maintain design consistency across the application. The agent must use this reference to locate existing CSS modules and select the appropriate semantic classes for layouts, buttons, tables, modals, and form elements before attempting to write any new CSS.
---
Tags: css, architecture, styling, components, buttons, tables, modals

## When to use this rule
- **Initial Styling:** When building a new feature or component.
- **Refactoring:** When cleaning up inline styles or component-specific CSS to align with the global system.
- **UI Updates:** When adding buttons, tables, or form inputs to existing views.
- **Standardizing Layouts:** When creating pages, headers, or section wrappers.

## Rules for Application
1. **Search Before Creation:** First search the shared modules listed in **File Locations & Import Patterns** for an existing class that fits.
2. **Standardized Imports:** Use the "Import As" aliases defined below (e.g., `btnStyles`, `tableStyles`) to keep imports consistent across the repo.
3. **Reuse-First (Local CSS allowed only when necessary):**
   - Prefer shared modules for common UI patterns (layout, tables, modals, buttons, stats, form controls).
   - Component-level `.module.css` is allowed **only** when the styling is genuinely component-specific and cannot be expressed cleanly using existing shared classes.
   - Do not duplicate shared patterns inside component modules (no re-creating shared button/table/modal/layout styles).
   - If you add a new reusable style, it must go into a shared module (not a component module).
4. **Theme Alignment:** Use existing state classes (e.g., `.statValueSuccess`, `.btnIconDelete`) to keep color/interaction consistent.

## CSS Architecture - Shared Modules

**CRITICAL: Before creating ANY new CSS, search these files for existing classes.**

### File Locations & Import Patterns

| Module | Path | Import As |
|--------|------|-----------|
| Components | `@/styles/components.module.css` | `styles` |
| Buttons | `@/styles/buttons.module.css` | `btnStyles` |
| Pages | `@/styles/pages.module.css` | `pageStyles` |
| Modals | `@/styles/modal.module.css` | `modalStyles` |
| Tables | `@/components/Table.module.css` | `tableStyles` |

### components.module.css - Key Classes

**Layout:**
- `.section` / `.sectionNoPadding` - Card containers
- `.filtersContainer` - Horizontal filter bar
- `.filterGroup` - Label + input group
- `.headerActions` - Button group in headers
- `.infoRow` - Row between filters and table

**Form Elements:**
- `.select` - Dropdown select
- `.input` - Text input
- `.dateInput` - Date input (dark theme)
- `.searchBox` / `.searchIcon` / `.searchInput` - Search with icon
- `.checkboxLabel` - Checkbox with label

**Stats/Cards:**
- `.statsContainer` - Grid of stat cards
- `.statCard` - Individual stat card
- `.statLabel` / `.statValue` - Label and value
- `.statValueSuccess` / `.statValueWarning` / `.statValueError` / `.statValuePrimary` - Colored values

**States:**
- `.loading` - Centered spinner
- `.emptyState` - No data message
- `.errorAlert` - Error banner
- `.accessDenied` - Access denied page

**Tabs:**
- `.tabs` - Tab container
- `.tab` / `.tabActive` - Tab buttons

**Text:**
- `.label` - Uppercase label
- `.textMuted` / `.textPrimary` / `.textSuccess` / `.textError`

### buttons.module.css - Key Classes

**Primary Actions:**
- `.btnPrimary` - Blue primary button
- `.btnSuccess` - Green success button
- `.btnSecondary` - Outlined button
- `.btnSmall` - Compact button
- `.btnBlock` - Full width button
- `.btnDashed` - Dashed outline (add actions)
- `.btnSuccessSmall` - Small green button

**Icon Buttons:**
- `.btnIcon` - Base icon button with border
- `.btnIconEdit` - Blue on hover
- `.btnIconView` - Purple on hover
- `.btnIconDownload` - Green on hover
- `.btnIconDelete` - Red on hover
- `.btnIconGhost` - Gray on hover
- `.btnIconAdd` - Green on hover (no border)
- `.btnIconDeleteNoBorder` - Red on hover (no border)

### Table.module.css - Key Classes

**Structure:**
- `.section` - Table section wrapper
- `.tableHeader` / `.tableHeaderThreeCol` - Header above table
- `.tableContainer` - Border wrapper
- `.tableWrapper` - Scroll wrapper
- `.table` - The table element

**Sortable Headers:**
- `.sortable` / `.sortable.active` - Sortable header text
- `.arrow` - Sort direction indicator

**Rows:**
- `.clickableRow` - Clickable row with hover
- `.editButton` - Edit icon (turns green on row hover)

**Columns:**
- `.sku` - Monospace SKU column
- `.numeric` - Center-aligned numbers
- `.centerCell` - Center alignment

### modal.module.css - Key Classes

**Structure:**
- `.modalOverlay` - Backdrop
- `.modalContent` - Modal container
- `.modalHeader` - Header with border
- `.modalTitle` / `.modalTitleWithIcon` - Title text
- `.closeButton` - X button
- `.modalBody` - Scrollable content
- `.modalFooter` - Footer with buttons

**Content:**
- `.modalDescription` - Description text
- `.itemsContainer` / `.itemRow` - List of items
- `.itemSku` / `.itemName` / `.itemInfo` - Item details
- `.quantityInput` - Input field in modal
- `.totalRow` / `.totalLabel` / `.totalValue` - Summary row

**Buttons:**
- `.cancelButton` - Secondary cancel
- `.pickedButton` - Red action button

### pages.module.css - Key Classes

- `.container` - Page container (max-width)
- `.header` - Page header with title
- `.content` - Main content area
- `.error` - Error banner
- `.tableContainer` - Table wrapper
