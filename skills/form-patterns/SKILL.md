---
name: form-patterns
description: Enforces consistent form and input patterns using shared CSS modules. Use when building forms, adding inputs, creating filter bars, or styling form elements. Triggers on: build form, form inputs, filter form, form layout, input field, select dropdown, search box, checkbox, date picker, form validation, refactor form.
---

# Skill: Form Patterns

This skill ensures consistent form and input implementation using shared CSS modules and established patterns.

---

## CRITICAL: Shared Modules First

**Before creating ANY form CSS, search shared modules for existing classes.**

Forms use the **Components module** for all input styling.

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
Form Patterns Checklist:
- [ ] Step 0: Read config to get canonical app path
- [ ] Step 1: Read components.module.css from canonical app
- [ ] Step 2: Read canonical page example for filter patterns
- [ ] Step 3: Apply input classes
- [ ] Step 4: Apply filter layout pattern
- [ ] Step 5: Verify zero inline styles
- [ ] Step 6: Protect imports from formatter
```

---

## CRITICAL: No Inline Styles

**Inline styles are BANNED.** Even conditional values must use classes:

```tsx
// ❌ BAD - inline style
<input style={{ opacity: disabled ? 0.5 : 1 }} />

// ✅ GOOD - conditional class
<input className={disabled ? styles.inputDisabled : styles.input} />
```

---

## Form Input Classes

| Input Type | Class | Notes |
|------------|-------|-------|
| Text input | `styles.input` | Standard text field, 42px height |
| Select dropdown | `styles.select` | Styled dropdown, 42px height |
| Date input | `styles.dateInput` | Dark theme date picker |
| Checkbox | `styles.checkboxLabel` | Wraps checkbox + label |
| Narrow input | `styles.input` + `styles.inputNarrow` | Max 120px width |
| Budget input | `styles.input` + `styles.inputBudget` | Fixed 100px width |
| Disabled input | `styles.input` + `styles.inputDisabled` | Muted, centered text |
| Uppercase input | `styles.input` + `styles.inputUppercase` | Forces uppercase |

---

## Filter Bar Pattern

Filter controls belong in a **section** with `filtersContainer`:

```tsx
import styles from '@/styles/components.module.css'

// Protect from formatter
const _styles = styles

<section className={styles.section}>
  <div className={styles.filtersContainer}>
    <div className={styles.filterGroup}>
      <label className={styles.label}>Supplier</label>
      <select className={styles.select} value={supplier} onChange={e => setSupplier(e.target.value)}>
        <option value="">All Suppliers</option>
        <option value="1">Supplier A</option>
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
      <label className={styles.label}>Budget</label>
      <input 
        type="number" 
        className={`${styles.input} ${styles.inputBudget}`}
        value={budget}
        onChange={e => setBudget(e.target.value)}
      />
    </div>
  </div>
</section>
```

**Pattern:** `section > filtersContainer > filterGroup > label + input/select`

**Key rule:** Filter controls that affect data display belong in filter sections, NOT floating above tables or in card headers.

---

## Search Box with Icon

```tsx
import { Search } from 'lucide-react'

<div className={styles.searchBox}>
  <Search size={16} className={styles.searchIcon} />
  <input 
    type="text"
    className={styles.searchInput}
    placeholder="Search products..."
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
    checked={showOnlyActive}
    onChange={e => setShowOnlyActive(e.target.checked)}
  />
  <span className={styles.checkboxLabelText}>Show only active items</span>
</label>
```

---

## Select with Inherited/Default Value

For selects that show an inherited or default value:

```tsx
<select 
  className={`${styles.select} ${!hasOverride ? styles.selectInherited : ''}`}
  value={value}
  onChange={e => setValue(e.target.value)}
>
  <option value="">Use default (inherited)</option>
  <option value="custom">Custom value</option>
</select>
```

The `selectInherited` class adds dashed border and muted text to indicate the value is inherited.

---

## Toggle Switch Pattern

```tsx
<div className={styles.toggleContainer}>
  <button 
    className={`${styles.toggle} ${isEnabled ? styles.active : ''}`}
    onClick={() => setIsEnabled(!isEnabled)}
  />
  <span className={styles.toggleLabel}>Enable feature</span>
</div>
```

---

## Modal Form Layout

For forms inside modals, use vertical stacking:

```tsx
import modalStyles from '@/styles/modal.module.css'
import styles from '@/styles/components.module.css'

<div className={modalStyles.modalBody}>
  <div className={styles.utilStackMd}>
    <div className={styles.filterGroup}>
      <label className={styles.formLabel}>Field Name</label>
      <input type="text" className={styles.input} />
    </div>
    
    <div className={styles.filterGroup}>
      <label className={styles.formLabel}>Select Option</label>
      <select className={styles.select}>
        <option>Option 1</option>
      </select>
    </div>
  </div>
</div>
```

**Note:** Use `styles.formLabel` (14px, bold) for modal forms instead of `styles.label` (12px, uppercase) used in filter bars.

---

## Import Protection

The formatter strips unused imports. Protect them immediately:

```tsx
import styles from '@/styles/components.module.css'
import modalStyles from '@/styles/modal.module.css'

// Protect from formatter
const _styles = styles
const _modalStyles = modalStyles
```

---

## Validation Checklist

Before completing the form implementation:

- [ ] Zero inline styles (`grep -n "style={{" <file>` returns nothing)
- [ ] Text inputs use `styles.input`
- [ ] Selects use `styles.select`
- [ ] Date inputs use `styles.dateInput`
- [ ] Filter bars use `section > filtersContainer > filterGroup` pattern
- [ ] Labels use `styles.label` (filter bars) or `styles.formLabel` (modal forms)
- [ ] Checkboxes use `styles.checkboxLabel`
- [ ] Disabled inputs use `styles.inputDisabled`
- [ ] Imports are protected from formatter
- [ ] No custom CSS duplicating shared patterns
