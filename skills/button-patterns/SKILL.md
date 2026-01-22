---
name: button-patterns
description: Enforces consistent button styling by reading from the canonical app. Use when adding buttons, icon buttons, action buttons, or styling interactive elements. Triggers on: button styles, icon button, action button, primary button, delete button, add button, submit button, cancel button.
---

# Skill: Button Patterns

This skill ensures consistent button implementation by reading patterns from the canonical reference app.

**Canonical App:** `C:\Users\Jonny\Code\stock-insights`

---

## CRITICAL: Discovery Before Implementation

**You MUST use `read_file` to read the canonical files below. Do NOT rely on memory or cached knowledge of these files.**

Before adding any buttons, execute this discovery workflow:

---

## Workflow

```
Button Patterns Checklist:
- [ ] Step 1: Read buttons.module.css from canonical app
- [ ] Step 2: Identify button type needed (primary, icon, destructive, etc.)
- [ ] Step 3: Extract the appropriate class
- [ ] Step 4: Apply pattern to current project
- [ ] Step 5: Verify imports match canonical conventions
```

---

## Step 1: Read Buttons CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\styles\buttons.module.css
```

Extract all button classes and their purposes.

---

## Button Categories

### Primary Action Buttons

| Class | Use Case | Appearance |
|-------|----------|------------|
| `btnStyles.btnPrimary` | Main action (Save, Submit) | Blue filled |
| `btnStyles.btnSuccess` | Positive action (Confirm, Approve) | Green filled |
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

### Primary Button
```tsx
import btnStyles from '@/styles/buttons.module.css';

<button className={btnStyles.btnPrimary} onClick={handleSave}>
  Save Changes
</button>
```

### Success Button
```tsx
<button className={btnStyles.btnSuccess} onClick={handleConfirm}>
  Confirm Order
</button>
```

### Secondary Button
```tsx
<button className={btnStyles.btnSecondary} onClick={handleCancel}>
  Cancel
</button>
```

### Icon Button with Edit
```tsx
<button className={btnStyles.btnIconEdit} onClick={() => handleEdit(item.id)}>
  ✏️
</button>
```

### Icon Button with Delete
```tsx
<button className={btnStyles.btnIconDelete} onClick={() => handleDelete(item.id)}>
  🗑️
</button>
```

### Add Button (Dashed)
```tsx
<button className={btnStyles.btnDashed} onClick={handleAdd}>
  + Add New Item
</button>
```

---

## Button Groups

For multiple buttons in a row:

```tsx
import styles from '@/styles/components.module.css';
import btnStyles from '@/styles/buttons.module.css';

<div className={styles.headerActions}>
  <button className={btnStyles.btnSecondary}>Export</button>
  <button className={btnStyles.btnPrimary}>Add New</button>
</div>
```

---

## Table Row Actions

For action buttons in table rows:

```tsx
<td>
  <button className={btnStyles.btnIconView} onClick={() => handleView(row.id)}>
    👁️
  </button>
  <button className={btnStyles.btnIconEdit} onClick={() => handleEdit(row.id)}>
    ✏️
  </button>
  <button className={btnStyles.btnIconDelete} onClick={() => handleDelete(row.id)}>
    🗑️
  </button>
</td>
```

---

## Import Conventions

Always use this import alias for consistency:

```tsx
import btnStyles from '@/styles/buttons.module.css';
```

---

## Validation Checklist

Before completing the button implementation, verify:

- [ ] Primary actions use `btnStyles.btnPrimary` or `btnStyles.btnSuccess`
- [ ] Secondary/cancel actions use `btnStyles.btnSecondary`
- [ ] Icon buttons use appropriate `btnStyles.btnIcon*` class
- [ ] Delete actions use red-themed buttons
- [ ] Add actions use `btnStyles.btnDashed` or `btnStyles.btnIconAdd`
- [ ] Import uses standard alias `btnStyles`
- [ ] No custom CSS duplicating shared patterns
