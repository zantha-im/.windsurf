---
name: form-patterns
description: Enforces consistent form and input patterns by reading from the canonical app. Use when building forms, adding inputs, creating filter bars, or styling form elements. Triggers on: build form, form inputs, filter form, form layout, input field, select dropdown, search box, checkbox, date picker, form validation.
---

# Skill: Form Patterns

This skill ensures consistent form and input implementation by reading patterns from the canonical reference app.

**Canonical App:** `C:\Users\Jonny\Code\stock-insights`

---

## CRITICAL: Discovery Before Implementation

**You MUST use `read_file` to read the canonical files below. Do NOT rely on memory or cached knowledge of these files.**

Before building any form, execute this discovery workflow:

---

## Workflow

```
Form Patterns Checklist:
- [ ] Step 1: Read components.module.css from canonical app
- [ ] Step 2: Read an example component with forms from canonical app
- [ ] Step 3: Extract input styling classes
- [ ] Step 4: Extract filter layout pattern
- [ ] Step 5: Extract search box pattern (if applicable)
- [ ] Step 6: Apply patterns to current project
- [ ] Step 7: Verify imports match canonical conventions
```

---

## Step 1: Read Components CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\styles\components.module.css
```

Extract form-related classes:
- `.input` - Text input
- `.select` - Dropdown select
- `.dateInput` - Date input (dark theme)
- `.searchBox`, `.searchIcon`, `.searchInput` - Search with icon
- `.checkboxLabel` - Checkbox with label
- `.filtersContainer` - Filter bar container
- `.filterGroup` - Label + input group
- `.label` - Uppercase label

---

## Step 2: Read Example Component

**MANDATORY: Use read_file tool with one of these paths:**

For filter forms:
```
C:\Users\Jonny\Code\stock-insights\components\OrdersTab.tsx
```

For modal forms:
```
C:\Users\Jonny\Code\stock-insights\components\UserFormModal.tsx
```

---

## Form Input Classes

| Input Type | Class | Notes |
|------------|-------|-------|
| Text input | `styles.input` | Standard text field |
| Select dropdown | `styles.select` | Styled dropdown |
| Date input | `styles.dateInput` | Dark theme date picker |
| Checkbox | `styles.checkboxLabel` | Wraps checkbox + label |

---

## Filter Bar Pattern

```tsx
import styles from '@/styles/components.module.css';

<div className={styles.filtersContainer}>
  <div className={styles.filterGroup}>
    <label className={styles.label}>Status</label>
    <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
      <option value="">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
  
  <div className={styles.filterGroup}>
    <label className={styles.label}>Date From</label>
    <input 
      type="date" 
      className={styles.dateInput}
      value={dateFrom}
      onChange={e => setDateFrom(e.target.value)}
    />
  </div>
  
  <div className={styles.filterGroup}>
    <label className={styles.label}>Search</label>
    <input 
      type="text" 
      className={styles.input}
      placeholder="Search..."
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
  </div>
</div>
```

---

## Search Box with Icon

```tsx
<div className={styles.searchBox}>
  <span className={styles.searchIcon}>🔍</span>
  <input 
    type="text"
    className={styles.searchInput}
    placeholder="Search..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
  />
</div>
```

---

## Checkbox Pattern

```tsx
<label className={styles.checkboxLabel}>
  <input 
    type="checkbox"
    checked={isChecked}
    onChange={e => setIsChecked(e.target.checked)}
  />
  Checkbox Label Text
</label>
```

---

## Modal Form Layout

For forms inside modals, use the modal body structure:

```tsx
import modalStyles from '@/styles/modal.module.css';
import styles from '@/styles/components.module.css';

<div className={modalStyles.modalBody}>
  <div className={styles.filterGroup}>
    <label className={styles.label}>Field Name</label>
    <input type="text" className={styles.input} />
  </div>
  
  <div className={styles.filterGroup}>
    <label className={styles.label}>Select Option</label>
    <select className={styles.select}>
      <option>Option 1</option>
    </select>
  </div>
</div>
```

---

## Import Conventions

Always use these import aliases for consistency:

```tsx
import styles from '@/styles/components.module.css';
import modalStyles from '@/styles/modal.module.css';  // If form is in modal
```

---

## Validation Checklist

Before completing the form implementation, verify:

- [ ] Text inputs use `styles.input`
- [ ] Selects use `styles.select`
- [ ] Date inputs use `styles.dateInput`
- [ ] Filter bars use `styles.filtersContainer` and `styles.filterGroup`
- [ ] Labels use `styles.label`
- [ ] Checkboxes use `styles.checkboxLabel`
- [ ] Imports use standard aliases
- [ ] No custom CSS duplicating shared patterns
