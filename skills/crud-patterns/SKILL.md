---
name: crud-patterns
description: Guides creation of CRUD (Create, Read, Update, Delete) pages following the canonical pattern. Use when building admin pages, data management interfaces, or any page that lists items with add/edit/delete functionality. Triggers on: crud page, admin page, data management, list with edit, table with actions, add edit delete, entity management.
---

# Skill: CRUD Patterns

This skill guides the creation of CRUD pages following the canonical pattern established in the stock-insights app.

---

## When to Use This Skill

- Building a new admin/management page for an entity
- Adding list/edit/delete functionality to existing data
- Refactoring an existing page to follow CRUD patterns
- Reviewing CRUD pages for pattern compliance

---

## Canonical Reference

**The UomsTab component is the canonical reference for CRUD patterns:**
- Tab component: `components/UomsTab.tsx`
- Edit modal: `components/UomEditModal.tsx`
- Delete modal: `components/UomDeleteModal.tsx`

Read these files from the canonical app (configured in `.windsurf/config/senior-developer.json`) before implementing any CRUD page.

---

## CRUD Page Checklist

Copy this checklist when creating a new CRUD page:

```
CRUD Page Implementation:
- [ ] Step 1: Read canonical reference (UomsTab.tsx, UomEditModal.tsx)
- [ ] Step 2: Define entity interface
- [ ] Step 3: Create page/tab component with table
- [ ] Step 4: Add sortable columns
- [ ] Step 5: Add filter section (search box + filters)
- [ ] Step 6: Create Add/Edit modal (reusable for both modes)
- [ ] Step 7: Add row click → edit functionality
- [ ] Step 8: Add action buttons column (edit, delete)
- [ ] Step 9: Integrate ConfirmDeleteModal or entity-specific delete modal
- [ ] Step 10: Wire up API calls (GET, POST, PUT, DELETE)
- [ ] Step 11: Add loading and error states
- [ ] Step 12: Test all CRUD operations
```

---

## Pattern Structure

### Page/Tab Component Structure

```tsx
// State management
const [items, setItems] = useState<Item[]>([])
const [loading, setLoading] = useState(true)
const [sortField, setSortField] = useState<SortField>('name')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
const [searchQuery, setSearchQuery] = useState('')

// Modal state
const [editingItem, setEditingItem] = useState<Item | null>(null)
const [isCreating, setIsCreating] = useState(false)
const [isSaving, setIsSaving] = useState(false)
const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
const [isDeleting, setIsDeleting] = useState(false)
```

### Layout Structure

```
section (tableStyles.section)
├── Header (tableStyles.tableHeaderThreeCol)
│   ├── Left: [optional filters]
│   ├── Center: Title (styles.textMuted)
│   └── Right: "Add [Item]" button (btnStyles.btnSmall)
├── Filter Section (if needed)
│   └── styles.section > searchBox
├── Table (tableStyles.tableContainer > table)
│   ├── Sortable column headers
│   ├── Clickable rows (tableStyles.clickableRow)
│   └── Actions column with edit/delete buttons
├── Add/Edit Modal
└── Delete Confirmation Modal
```

---

## Key Patterns

### 1. Row Click → Edit

```tsx
<tr
  key={item.id}
  onClick={() => setEditingItem(item)}
  className={tableStyles.clickableRow}
  title="Click to edit"
>
```

### 2. Action Buttons with stopPropagation

```tsx
<td onClick={(e) => e.stopPropagation()}>
  <div className={styles.actionsRow}>
    <button
      className={btnStyles.btnIconEdit}
      onClick={() => setEditingItem(item)}
      title="Edit"
    >
      <Icons.Pencil size={14} />
    </button>
    <button
      className={btnStyles.btnIconDelete}
      onClick={() => setDeleteTarget(item)}
      title="Delete"
    >
      <Icons.Trash2 size={14} />
    </button>
  </div>
</td>
```

### 3. Reusable Add/Edit Modal

The same modal handles both create and edit modes:

```tsx
interface ItemEditModalProps {
  item: Item | null      // null when creating
  isNew: boolean         // true when creating
  onClose: () => void
  onSave: (data: ItemData) => Promise<void>
  isSaving: boolean
}

// In modal:
if (!item && !isNew) return null

// Reset form when modal opens
useEffect(() => {
  if (item) {
    setFormData({ ...item })
  } else if (isNew) {
    setFormData({ /* defaults */ })
  }
}, [item, isNew])
```

### 4. Opening Create vs Edit Modal

```tsx
// Create new
<button onClick={() => setIsCreating(true)}>
  <Icons.Plus size={16} />
  Add Item
</button>

// Edit existing (from row click or edit button)
onClick={() => setEditingItem(item)}

// Modal props
<ItemEditModal
  item={editingItem}
  isNew={isCreating}
  onClose={() => {
    setEditingItem(null)
    setIsCreating(false)
  }}
  onSave={handleSave}
  isSaving={isSaving}
/>
```

### 5. Delete Confirmation Flow

**Option A: Generic ConfirmDeleteModal (simple cases)**

```tsx
<ConfirmDeleteModal
  isOpen={deleteTarget !== null}
  title="Delete Item"
  message="This will permanently remove the item."
  itemName={deleteTarget?.name}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteTarget(null)}
  isDeleting={isDeleting}
/>
```

**Option B: Entity-specific delete modal (when showing references)**

```tsx
// Load references before showing modal
const handleDeleteClick = async (item: Item) => {
  setDeleteTarget(item)
  setIsLoadingRefs(true)
  const refs = await fetch(`/api/items/${item.id}/references`)
  setDeleteReferences(refs)
  setIsLoadingRefs(false)
}

<ItemDeleteModal
  isOpen={!!deleteTarget && !isLoadingRefs}
  itemName={deleteTarget?.name}
  references={deleteReferences}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setDeleteTarget(null)}
  isDeleting={isDeleting}
/>
```

---

## API Pattern

### Standard CRUD Endpoints

| Operation | Method | Endpoint | Body |
|-----------|--------|----------|------|
| List | GET | `/api/items` | - |
| Create | POST | `/api/items` | `{ ...data }` |
| Update | PUT | `/api/items` | `{ id, ...data }` |
| Delete | DELETE | `/api/items?id={id}` | - |

### Save Handler Pattern

```tsx
const handleSave = async (data: ItemData) => {
  setIsSaving(true)
  try {
    const isUpdate = !!data.id
    const res = await fetch('/api/items', {
      method: isUpdate ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to save')
    }

    onRefresh()  // Reload list
    onClose()    // Close modal
  } finally {
    setIsSaving(false)
  }
}
```

---

## CSS Classes Reference

| Element | Class | Source |
|---------|-------|--------|
| Table section | `tableStyles.section` | `Table.module.css` |
| Table container | `tableStyles.tableContainer` | `Table.module.css` |
| Clickable row | `tableStyles.clickableRow` | `Table.module.css` |
| Sortable header | `tableStyles.sortable` | `Table.module.css` |
| Actions row | `styles.actionsRow` | `components.module.css` |
| Edit button | `btnStyles.btnIconEdit` | `buttons.module.css` |
| Delete button | `btnStyles.btnIconDelete` | `buttons.module.css` |
| Add button | `btnStyles.btnSmall` | `buttons.module.css` |
| Modal overlay | `modalStyles.modalOverlay` | `modal.module.css` |
| Modal content | `modalStyles.modalContent` | `modal.module.css` |

---

## Related Skills

This skill orchestrates patterns from:
- `@table-patterns` - Table structure and sorting
- `@modal-patterns` - Modal structure and behavior
- `@form-patterns` - Form inputs in modals
- `@button-patterns` - Action buttons

---

## Anti-Patterns to Avoid

| Anti-Pattern | Correct Pattern |
|--------------|-----------------|
| Separate "Add" and "Edit" modals | Single modal with `item: Item | null` + `isNew: boolean` |
| Inline delete confirmation | Use `ConfirmDeleteModal` component |
| Delete without confirmation | Always show confirmation modal |
| Non-clickable rows with only edit button | Rows should be clickable + have edit button |
| Missing `stopPropagation` on action buttons | Always prevent row click when clicking actions |
| Hardcoded delete messages | Pass `title`, `message`, `itemName` to modal |
