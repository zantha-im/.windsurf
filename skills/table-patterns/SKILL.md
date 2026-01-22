---
name: table-patterns
description: Enforces consistent data table patterns by reading from the canonical app. Use when building data tables, adding sortable columns, creating table layouts, or refactoring table styling. Triggers on: build table, data table, create table component, table layout, sortable table, table with sorting, grid component, data grid.
---

# Skill: Table Patterns

This skill ensures consistent table implementation by reading patterns from the canonical reference app.

**Canonical App:** `C:\Users\Jonny\Code\stock-insights`

---

## CRITICAL: Discovery Before Implementation

**You MUST use `read_file` to read the canonical files below. Do NOT rely on memory or cached knowledge of these files.**

Before building any table, execute this discovery workflow:

---

## Workflow

```
Table Patterns Checklist:
- [ ] Step 1: Read Table.module.css from canonical app
- [ ] Step 2: Read an example table component from canonical app
- [ ] Step 3: Extract the wrapper structure pattern
- [ ] Step 4: Extract column conventions (numeric, centered, SKU)
- [ ] Step 5: Extract sorting pattern (if applicable)
- [ ] Step 6: Extract state patterns (loading, empty, error)
- [ ] Step 7: Apply patterns to current project
- [ ] Step 8: Verify imports match canonical conventions
```

---

## Step 1: Read Table CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\components\Table.module.css
```

Extract:
- Wrapper structure classes (`.section`, `.tableContainer`, `.tableWrapper`, `.table`)
- Header classes (`.tableHeader`, `.tableHeaderThreeCol`)
- Column classes (`.numeric`, `.centerCell`, `.sku`)
- Sorting classes (`.sortable`, `.active`, `.arrow`)
- Row classes (`.clickableRow`, `.editButton`)

---

## Step 2: Read Example Component

**MANDATORY: Use read_file tool with this path:**

```
C:\Users\Jonny\Code\stock-insights\components\ProductsTab.tsx
```

This is a comprehensive example showing:
- Table wrapper structure in JSX
- Sortable header implementation
- Column type handling
- Loading/empty/error states
- Row click handling

---

## Step 3: Read Shared Components CSS

**MANDATORY: Use read_file tool with this path:**

```
C:\Users\Jonny\Code\stock-insights\styles\components.module.css
```

Extract state classes:
- `.loading` - Loading spinner
- `.emptyState` - No data message
- `.errorAlert` - Error banner

---

## Canonical Table Structure

After reading the files, apply this structure:

```tsx
import tableStyles from '@/components/Table.module.css';
import styles from '@/styles/components.module.css';

// Wrapper structure (MUST follow this hierarchy)
<div className={tableStyles.section}>
  <div className={tableStyles.tableHeader}>
    <h2>Table Title</h2>
    {/* Optional: action buttons */}
  </div>
  <div className={tableStyles.tableContainer}>
    <div className={tableStyles.tableWrapper}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Column</th>
            <th className={tableStyles.numeric}>Number Column</th>
          </tr>
        </thead>
        <tbody>
          {/* Rows */}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## Column Conventions

| Column Type | Class | Alignment |
|-------------|-------|-----------|
| Text (default) | none | Left |
| Numbers/Currency | `tableStyles.numeric` | Center |
| Centered content | `tableStyles.centerCell` | Center |
| SKU/Codes | `tableStyles.sku` | Left, monospace |

---

## Sortable Headers

```tsx
<th 
  className={`${tableStyles.sortable} ${sortField === 'name' ? tableStyles.active : ''}`}
  onClick={() => handleSort('name')}
>
  Name
  {sortField === 'name' && (
    <span className={tableStyles.arrow}>
      {sortDirection === 'asc' ? '↑' : '↓'}
    </span>
  )}
</th>
```

---

## State Handling

```tsx
// Loading
if (loading) return <div className={styles.loading}>Loading...</div>;

// Error
if (error) return <div className={styles.errorAlert}>{error}</div>;

// Empty
if (data.length === 0) return <div className={styles.emptyState}>No data found</div>;
```

---

## Import Conventions

Always use these import aliases for consistency:

```tsx
import tableStyles from '@/components/Table.module.css';
import styles from '@/styles/components.module.css';
import btnStyles from '@/styles/buttons.module.css';  // If table has action buttons
```

---

## Validation Checklist

Before completing the table implementation, verify:

- [ ] Uses canonical wrapper structure (section → tableContainer → tableWrapper → table)
- [ ] Numeric columns use `tableStyles.numeric`
- [ ] Sortable headers follow the canonical pattern
- [ ] Loading/empty/error states use shared classes
- [ ] Imports use standard aliases
- [ ] No custom CSS duplicating shared patterns
