---
name: modal-patterns
description: Enforces consistent modal dialog patterns by reading from the canonical app. Use when creating modals, dialogs, popups, confirmation dialogs, or edit forms in overlays. Triggers on: create modal, modal dialog, popup, confirmation modal, edit modal, delete confirmation, modal form, overlay dialog.
---

# Skill: Modal Patterns

This skill ensures consistent modal implementation by reading patterns from the canonical reference app.

**Canonical App:** `C:\Users\Jonny\Code\stock-insights`

---

## CRITICAL: Discovery Before Implementation

**You MUST use `read_file` to read the canonical files below. Do NOT rely on memory or cached knowledge of these files.**

Before building any modal, execute this discovery workflow:

---

## Workflow

```
Modal Patterns Checklist:
- [ ] Step 1: Read modal.module.css from canonical app
- [ ] Step 2: Read an example modal component from canonical app
- [ ] Step 3: Extract modal structure pattern (overlay/content/header/body/footer)
- [ ] Step 4: Extract button placement pattern
- [ ] Step 5: Extract form-in-modal pattern (if applicable)
- [ ] Step 6: Apply patterns to current project
- [ ] Step 7: Verify imports match canonical conventions
```

---

## Step 1: Read Modal CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\styles\modal.module.css
```

Extract:
- Structure classes (`.modalOverlay`, `.modalContent`, `.modalHeader`, `.modalBody`, `.modalFooter`)
- Title classes (`.modalTitle`, `.modalTitleWithIcon`)
- Button classes (`.closeButton`, `.cancelButton`, `.pickedButton`)
- Content classes (`.modalDescription`, `.itemsContainer`, `.itemRow`)

---

## Step 2: Read Example Modal

**MANDATORY: Use read_file tool with one of these paths:**

For edit/form modal:
```
C:\Users\Jonny\Code\stock-insights\components\UserFormModal.tsx
```

For confirmation modal:
```
C:\Users\Jonny\Code\stock-insights\components\ConfirmDeleteModal.tsx
```

For complex modal with list:
```
C:\Users\Jonny\Code\stock-insights\components\OrderItemsModal.tsx
```

---

## Canonical Modal Structure

After reading the files, apply this structure:

```tsx
import modalStyles from '@/styles/modal.module.css';
import btnStyles from '@/styles/buttons.module.css';

interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MyModal({ isOpen, onClose, onConfirm }: MyModalProps) {
  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>Modal Title</h2>
          <button className={modalStyles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={modalStyles.modalBody}>
          {/* Modal content */}
        </div>
        
        <div className={modalStyles.modalFooter}>
          <button className={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={btnStyles.btnPrimary} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Modal with Icon in Title

```tsx
<h2 className={modalStyles.modalTitleWithIcon}>
  <span>🗑️</span>
  Delete Confirmation
</h2>
```

---

## Modal with Description

```tsx
<div className={modalStyles.modalBody}>
  <p className={modalStyles.modalDescription}>
    Are you sure you want to delete this item? This action cannot be undone.
  </p>
</div>
```

---

## Modal with Item List

```tsx
<div className={modalStyles.modalBody}>
  <div className={modalStyles.itemsContainer}>
    {items.map(item => (
      <div key={item.id} className={modalStyles.itemRow}>
        <span className={modalStyles.itemSku}>{item.sku}</span>
        <span className={modalStyles.itemName}>{item.name}</span>
        <span className={modalStyles.itemInfo}>{item.quantity}</span>
      </div>
    ))}
  </div>
  
  <div className={modalStyles.totalRow}>
    <span className={modalStyles.totalLabel}>Total:</span>
    <span className={modalStyles.totalValue}>{total}</span>
  </div>
</div>
```

---

## Modal with Form

```tsx
import modalStyles from '@/styles/modal.module.css';
import styles from '@/styles/components.module.css';

<div className={modalStyles.modalBody}>
  <div className={styles.filterGroup}>
    <label className={styles.label}>Name</label>
    <input type="text" className={styles.input} value={name} onChange={...} />
  </div>
  
  <div className={styles.filterGroup}>
    <label className={styles.label}>Type</label>
    <select className={styles.select} value={type} onChange={...}>
      <option>Option 1</option>
    </select>
  </div>
</div>
```

---

## Footer Button Patterns

**Standard (Cancel + Primary):**
```tsx
<div className={modalStyles.modalFooter}>
  <button className={modalStyles.cancelButton} onClick={onClose}>Cancel</button>
  <button className={btnStyles.btnPrimary} onClick={onConfirm}>Save</button>
</div>
```

**Destructive (Cancel + Delete):**
```tsx
<div className={modalStyles.modalFooter}>
  <button className={modalStyles.cancelButton} onClick={onClose}>Cancel</button>
  <button className={modalStyles.pickedButton} onClick={onDelete}>Delete</button>
</div>
```

---

## Import Conventions

Always use these import aliases for consistency:

```tsx
import modalStyles from '@/styles/modal.module.css';
import styles from '@/styles/components.module.css';  // If modal has form inputs
import btnStyles from '@/styles/buttons.module.css';  // If modal has action buttons
```

---

## Validation Checklist

Before completing the modal implementation, verify:

- [ ] Uses canonical structure (overlay → content → header → body → footer)
- [ ] Overlay click closes modal
- [ ] Content click stops propagation
- [ ] Close button in header
- [ ] Footer has cancel + action buttons
- [ ] Form inputs use shared component styles
- [ ] Imports use standard aliases
- [ ] No custom CSS duplicating shared patterns
