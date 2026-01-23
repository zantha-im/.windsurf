---
name: modal-patterns
description: Enforces consistent modal dialog patterns using shared CSS modules. Use when creating modals, dialogs, popups, confirmation dialogs, or edit forms in overlays. Triggers on: create modal, modal dialog, popup, confirmation modal, edit modal, delete confirmation, modal form, overlay dialog, refactor modal.
---

# Skill: Modal Patterns

This skill ensures consistent modal implementation using shared CSS modules and established patterns.

---

## CRITICAL: Shared Modules First

**Before creating ANY modal CSS, search shared modules for existing classes.**

Modals use THREE CSS modules:
1. **Modal module** - Structure, overlay, header, body, footer
2. **Components module** - Form inputs, text colors, utilities
3. **Buttons module** - Action buttons in footer

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
Modal Patterns Checklist:
- [ ] Step 0: Read config to get canonical app path
- [ ] Step 1: Read modal.module.css from canonical app
- [ ] Step 2: Read components.module.css for form inputs
- [ ] Step 3: Read canonical modal example
- [ ] Step 4: Apply modal structure pattern
- [ ] Step 5: Apply footer button pattern
- [ ] Step 6: Verify zero inline styles
- [ ] Step 7: Protect imports from formatter
```

---

## CRITICAL: No Inline Styles

**Inline styles are BANNED.** Even conditional values must use classes.

---

## Canonical Modal Structure

```tsx
import modalStyles from '@/styles/modal.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'
import { X } from 'lucide-react'

// Protect imports from formatter
const _modalStyles = modalStyles
const _styles = styles
const _btnStyles = btnStyles

interface MyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function MyModal({ isOpen, onClose, onConfirm }: MyModalProps) {
  if (!isOpen) return null

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>Modal Title</h2>
          <button className={modalStyles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
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
  )
}
```

**Key behaviors:**
- Overlay click closes modal
- Content click stops propagation (prevents closing when clicking inside)
- Close button (X) in header
- Footer has cancel + action buttons

---

## Modal with Icon in Title

```tsx
import { Trash2 } from 'lucide-react'

<div className={modalStyles.modalHeader}>
  <h2 className={modalStyles.modalTitleWithIcon}>
    <Trash2 size={20} />
    Delete Confirmation
  </h2>
  <button className={modalStyles.closeButton} onClick={onClose}>
    <X size={20} />
  </button>
</div>
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

For forms inside modals, use vertical stacking with `formLabel`:

```tsx
<div className={modalStyles.modalBody}>
  <div className={styles.utilStackMd}>
    <div className={styles.filterGroup}>
      <label className={styles.formLabel}>Name</label>
      <input 
        type="text" 
        className={styles.input} 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
    </div>
    
    <div className={styles.filterGroup}>
      <label className={styles.formLabel}>Type</label>
      <select 
        className={styles.select} 
        value={type} 
        onChange={e => setType(e.target.value)}
      >
        <option value="">Select type...</option>
        <option value="a">Type A</option>
      </select>
    </div>
    
    <div className={styles.filterGroup}>
      <label className={styles.formLabel}>Quantity</label>
      <input 
        type="number" 
        className={`${styles.input} ${styles.inputNarrow}`}
        value={quantity} 
        onChange={e => setQuantity(e.target.value)} 
      />
    </div>
  </div>
</div>
```

**Note:** Use `styles.formLabel` (14px, bold) for modal forms, not `styles.label` (12px, uppercase) which is for filter bars.

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
  <button className={btnStyles.btnDanger} onClick={onDelete}>Delete</button>
</div>
```

**Success action (Cancel + Confirm):**
```tsx
<div className={modalStyles.modalFooter}>
  <button className={modalStyles.cancelButton} onClick={onClose}>Cancel</button>
  <button className={btnStyles.btnSuccess} onClick={onConfirm}>Confirm</button>
</div>
```

---

## Loading State in Modal

```tsx
<div className={modalStyles.modalBody}>
  {loading ? (
    <div className={styles.loading}>Loading...</div>
  ) : (
    <div>{/* Content */}</div>
  )}
</div>

<div className={modalStyles.modalFooter}>
  <button className={modalStyles.cancelButton} onClick={onClose} disabled={loading}>
    Cancel
  </button>
  <button className={btnStyles.btnPrimary} onClick={onConfirm} disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </button>
</div>
```

---

## Import Protection

The formatter strips unused imports. Protect them immediately:

```tsx
import modalStyles from '@/styles/modal.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'

// Protect from formatter
const _modalStyles = modalStyles
const _styles = styles
const _btnStyles = btnStyles
```

---

## Validation Checklist

Before completing the modal implementation:

- [ ] Zero inline styles (`grep -n "style={{" <file>` returns nothing)
- [ ] Uses canonical structure (overlay → content → header → body → footer)
- [ ] Overlay click closes modal
- [ ] Content click stops propagation
- [ ] Close button (X icon) in header
- [ ] Footer has cancel + action buttons
- [ ] Form inputs use `styles.formLabel` (not `styles.label`)
- [ ] Form fields use `styles.utilStackMd` for vertical spacing
- [ ] Imports are protected from formatter
- [ ] No custom CSS duplicating shared patterns
