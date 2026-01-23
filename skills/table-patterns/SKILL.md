---
name: table-patterns
description: Enforces consistent data table patterns using shared CSS modules. Use when building data tables, adding sortable columns, creating table layouts, or refactoring table styling. Triggers on: build table, data table, create table component, table layout, sortable table, table with sorting, grid component, data grid, refactor table.
---

# Skill: Table Patterns

This skill ensures consistent table implementation using shared CSS modules and established patterns.

---

## CRITICAL: Shared Modules First

**Before creating ANY table CSS, search shared modules for existing classes.**

Tables use TWO CSS modules:
1. **Table module** - Structure, headers, columns, rows
2. **Components module** - States, text colors, row highlighting

---

## Config Discovery

Read the configuration file to find the canonical reference app:

```
.windsurf/config/senior-developer.json
```

This contains `canonicalApp.path` pointing to the reference application with proven patterns.

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Workflow

```
Table Patterns Checklist:
- [ ] Step 0: Read config to get canonical app path
- [ ] Step 1: Read Table.module.css from canonical app
- [ ] Step 2: Read components.module.css for state/text classes
- [ ] Step 3: Read canonical table component example
- [ ] Step 4: Apply wrapper structure pattern
- [ ] Step 5: Apply column conventions
- [ ] Step 6: Apply sorting pattern (if needed)
- [ ] Step 7: Apply row state classes (if needed)
- [ ] Step 8: Verify zero inline styles
- [ ] Step 9: Protect imports from formatter
```

---

## Canonical Table Structure

```tsx
import tableStyles from '@/components/Table.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'

// Protect imports from formatter stripping
const _styles = styles
const _btnStyles = btnStyles

// Wrapper hierarchy: section → tableContainer → tableWrapper → table
<section className={`${tableStyles.section} ${loading ? styles.sectionLoading : ''}`}>
  {/* Optional: Header row with controls */}
  <div className={tableStyles.tableHeaderThreeCol}>
    <div>{/* Left: checkbox/filter */}</div>
    <div>{/* Center: status indicator */}</div>
    <div>{/* Right: action button */}</div>
  </div>
  
  <div className={tableStyles.tableContainer}>
    <div className={tableStyles.tableWrapper}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Column</th>
            <th className={tableStyles.numeric}>Number</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className={tableStyles.clickableRow}>
              <td>{row.name}</td>
              <td className={tableStyles.numeric}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</section>
```

---

## CRITICAL: No Inline Styles

**Inline styles are BANNED.** Even conditional values must use classes:

```tsx
// ❌ BAD - inline style
<td style={{ color: isError ? '#ef4444' : '#10b981' }}>{value}</td>

// ✅ GOOD - conditional class
<td className={isError ? styles.textError : styles.textSuccess}>{value}</td>
```

**Available conditional classes:**
| State | Class |
|-------|-------|
| Success (green) | `styles.textSuccess` |
| Error (red) | `styles.textError` |
| Warning (yellow) | `styles.textWarning` |
| Muted (gray) | `styles.textMuted` |
| Loading opacity | `styles.sectionLoading` |
| Dimmed row | `styles.dimmedRow` |
| Excluded row | `styles.excludedRow` |

---

## Column Classes

| Column Type | Class | Notes |
|-------------|-------|-------|
| Text (default) | none | Left-aligned |
| Numbers/Currency | `tableStyles.numeric` | Center, monospace |
| Centered content | `tableStyles.centerCell` | Center-aligned |
| SKU/Codes | `tableStyles.sku` | Left, monospace, muted |
| Selectable text | `tableStyles.selectableCell` | Allows text selection |
| Expandable | `tableStyles.expandoColumn` | Fills available space |
| Fit content | `tableStyles.dataFitColumn` | Width fits content |

---

## Sortable Headers

```tsx
const [sortField, setSortField] = useState<string>('name')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

const handleSort = (field: string) => {
  if (sortField === field) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    setSortField(field)
    setSortOrder('asc')
  }
}

// In JSX:
<th 
  onClick={() => handleSort('name')}
  className={`${tableStyles.sortable} ${sortField === 'name' ? tableStyles.active : ''}`}
>
  Name
  <span className={tableStyles.arrow}>
    {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
  </span>
</th>
```

---

## Row States

```tsx
<tr 
  className={`
    ${tableStyles.clickableRow}
    ${isExcluded ? styles.excludedRow : ''}
    ${!isIncluded ? styles.dimmedRow : ''}
  `}
  onClick={() => handleRowClick(row.id)}
>
```

---

## Table Header Variants

**Two-column header** (left + right):
```tsx
<div className={tableStyles.tableHeader}>
  <h2>Title</h2>
  <button className={btnStyles.btnSmall}>Action</button>
</div>
```

**Three-column header** (left + center + right):
```tsx
<div className={tableStyles.tableHeaderThreeCol}>
  <label className={styles.checkboxLabel}>
    <input type="checkbox" /> Filter option
  </label>
  <SyncStatusIndicator />
  <button className={btnStyles.btnSmall}>Sync</button>
</div>
```

---

## State Handling

```tsx
// Loading state - apply to section
<section className={`${tableStyles.section} ${loading ? styles.sectionLoading : ''}`}>

// Empty state
if (data.length === 0) {
  return <div className={styles.emptyState}>No data found</div>
}

// Error state
if (error) {
  return <div className={styles.errorAlert}>{error}</div>
}
```

---

## Import Protection

The formatter strips unused imports. Protect them immediately:

```tsx
import tableStyles from '@/components/Table.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'

// Protect from formatter
const _tableStyles = tableStyles
const _styles = styles
const _btnStyles = btnStyles
```

---

## Actions Cell Pattern

```tsx
<td>
  <div className={styles.actionsCell}>
    <button className={btnStyles.btnIconView} onClick={() => handleView(row.id)}>
      <Eye size={16} />
    </button>
    <button className={btnStyles.btnIconEdit} onClick={() => handleEdit(row.id)}>
      <Pencil size={16} />
    </button>
    <button className={btnStyles.btnIconDelete} onClick={() => handleDelete(row.id)}>
      <Trash2 size={16} />
    </button>
  </div>
</td>
```

**Note:** `.actionsCell` needs `align-items: center` to prevent flex children from stretching vertically.

---

## Validation Checklist

Before completing the table implementation:

- [ ] Zero inline styles (`grep -n "style={{" <file>` returns nothing)
- [ ] Uses canonical wrapper structure (section → tableContainer → tableWrapper → table)
- [ ] Numeric columns use `tableStyles.numeric`
- [ ] Conditional colors use `styles.textSuccess/textError/textWarning`
- [ ] Row states use `styles.dimmedRow/excludedRow`
- [ ] Sortable headers follow the canonical pattern
- [ ] Imports are protected from formatter
- [ ] No custom CSS duplicating shared patterns
- [ ] Actions cell uses `styles.actionsCell` with proper alignment
