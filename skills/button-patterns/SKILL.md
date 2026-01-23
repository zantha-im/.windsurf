---
name: button-patterns
description: Enforces consistent button styling using shared CSS modules. Use when adding buttons, icon buttons, action buttons, or styling interactive elements. Triggers on: button styles, icon button, action button, primary button, delete button, add button, submit button, cancel button, refactor button.
---

# Skill: Button Patterns

This skill ensures consistent button implementation using shared CSS modules and established patterns.

---

## CRITICAL: Shared Modules First

**Before creating ANY button CSS, search shared modules for existing classes.**

Buttons use the **Buttons module** exclusively. Never create custom button styles.

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
Button Patterns Checklist:
- [ ] Step 0: Read config to get canonical app path
- [ ] Step 1: Read buttons.module.css from canonical app
- [ ] Step 2: Identify button type needed
- [ ] Step 3: Apply appropriate class
- [ ] Step 4: Verify zero inline styles
- [ ] Step 5: Protect imports from formatter
```

---

## CRITICAL: No Inline Styles

**Inline styles are BANNED.** Even conditional values must use classes:

```tsx
// ❌ BAD - inline style
<button style={{ opacity: disabled ? 0.5 : 1 }}>Save</button>

// ✅ GOOD - use disabled attribute (native styling)
<button disabled={disabled}>Save</button>
```

---

## Button Categories

### Primary Action Buttons

| Class | Use Case | Appearance |
|-------|----------|------------|
| `btnStyles.btnPrimary` | Main action (Save, Submit) | Blue filled |
| `btnStyles.btnSuccess` | Positive action (Confirm, Approve) | Green filled |
| `btnStyles.btnDanger` | Destructive action (Delete) | Red filled |
| `btnStyles.btnSecondary` | Secondary action | Outlined |
| `btnStyles.btnSmall` | Compact button | Smaller size |
| `btnStyles.btnBlock` | Full width button | 100% width |
| `btnStyles.btnDashed` | Add/Create action | Dashed outline |
| `btnStyles.btnSuccessSmall` | Small positive action | Small green |

### Icon Buttons (with border)

| Class | Hover Color | Use Case |
|-------|-------------|----------|
| `btnStyles.btnIcon` | Base | Generic icon button |
| `btnStyles.btnIconEdit` | Blue | Edit action |
| `btnStyles.btnIconView` | Purple | View/Preview action |
| `btnStyles.btnIconDownload` | Green | Download action |
| `btnStyles.btnIconDelete` | Red | Delete action |
| `btnStyles.btnIconGhost` | Gray | Subtle action |

### Icon Buttons (no border)

| Class | Hover Color | Use Case |
|-------|-------------|----------|
| `btnStyles.btnIconAdd` | Green | Add inline |
| `btnStyles.btnIconDeleteNoBorder` | Red | Delete inline |

---

## Usage Examples

### Primary Button with Icon
```tsx
import btnStyles from '@/styles/buttons.module.css'
import { Save } from 'lucide-react'

// Protect from formatter
const _btnStyles = btnStyles

<button className={btnStyles.btnPrimary} onClick={handleSave}>
  <Save size={16} />
  Save Changes
</button>
```

### Success Button
```tsx
<button className={btnStyles.btnSuccess} onClick={handleConfirm}>
  Confirm Order
</button>
```

### Danger Button
```tsx
<button className={btnStyles.btnDanger} onClick={handleDelete}>
  Delete
</button>
```

### Secondary Button
```tsx
<button className={btnStyles.btnSecondary} onClick={handleCancel}>
  Cancel
</button>
```

### Small Button (in table headers)
```tsx
<button className={btnStyles.btnSmall} onClick={handleSync}>
  <RefreshCcw size={16} />
  Sync
</button>
```

### Icon Button with Edit
```tsx
import { Pencil } from 'lucide-react'

<button className={btnStyles.btnIconEdit} onClick={() => handleEdit(item.id)}>
  <Pencil size={16} />
</button>
```

### Icon Button with Delete
```tsx
import { Trash2 } from 'lucide-react'

<button className={btnStyles.btnIconDelete} onClick={() => handleDelete(item.id)}>
  <Trash2 size={16} />
</button>
```

### Add Button (Dashed)
```tsx
import { Plus } from 'lucide-react'

<button className={btnStyles.btnDashed} onClick={handleAdd}>
  <Plus size={16} />
  Add New Item
</button>
```

---

## Button Groups

For multiple buttons in a row (e.g., page header):

```tsx
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'

<div className={styles.headerActions}>
  <button className={btnStyles.btnSecondary}>Export</button>
  <button className={btnStyles.btnPrimary}>Add New</button>
</div>
```

---

## Table Row Actions

For action buttons in table rows, use `actionsCell` wrapper:

```tsx
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'
import { Eye, Pencil, Trash2 } from 'lucide-react'

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

**Note:** The `actionsCell` class provides proper flex alignment with `align-items: center`.

---

## Split Button Pattern

For buttons with dropdown options:

```tsx
<div className={styles.splitButtonGroup}>
  <div className={styles.splitButtonRow}>
    <button 
      className={`${btnStyles.btnPrimary} ${styles.splitButtonLeft}`}
      onClick={handleMainAction}
    >
      Generate PDF
    </button>
    <button 
      className={`${btnStyles.btnPrimary} ${styles.splitButtonRight}`}
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      <ChevronDown size={16} />
    </button>
  </div>
  {dropdownOpen && (
    <div className={styles.dropdownMenu}>
      <button className={styles.dropdownItem} onClick={handleOption1}>
        Option 1
      </button>
      <button className={styles.dropdownItem} onClick={handleOption2}>
        Option 2
      </button>
    </div>
  )}
</div>
```

---

## Loading State in Buttons

```tsx
import { Loader2 } from 'lucide-react'
import styles from '@/styles/components.module.css'

<button className={btnStyles.btnPrimary} disabled={loading} onClick={handleSave}>
  {loading ? (
    <>
      <Loader2 size={16} className={styles.spinnerIcon} />
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

---

## Import Protection

The formatter strips unused imports. Protect them immediately:

```tsx
import btnStyles from '@/styles/buttons.module.css'
import styles from '@/styles/components.module.css'

// Protect from formatter
const _btnStyles = btnStyles
const _styles = styles
```

---

## Validation Checklist

Before completing the button implementation:

- [ ] Zero inline styles (`grep -n "style={{" <file>` returns nothing)
- [ ] Primary actions use `btnStyles.btnPrimary` or `btnStyles.btnSuccess`
- [ ] Destructive actions use `btnStyles.btnDanger` or `btnStyles.btnIconDelete`
- [ ] Secondary/cancel actions use `btnStyles.btnSecondary`
- [ ] Icon buttons use appropriate `btnStyles.btnIcon*` class
- [ ] Table row actions wrapped in `styles.actionsCell`
- [ ] Loading states use `styles.spinnerIcon` for animation
- [ ] Imports are protected from formatter
- [ ] No custom CSS duplicating shared patterns
