---
name: modal-patterns
description: Enforces consistent modal dialog patterns by reading from the canonical reference app (stock-insights). Use when creating modals, dialogs, popups, confirmation dialogs, or edit forms in overlays. Triggers on: create modal, modal dialog, popup, confirmation modal, edit modal, delete confirmation, modal form, overlay dialog, refactor modal.
---

# Skill: Modal Patterns

This skill ensures consistent modal implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## CRITICAL: Read From Canonical App

**DO NOT use hardcoded CSS class names or patterns from this skill file.**

Instead, read the actual files from the canonical reference app configured in `.windsurf/config/senior-developer.json`.

---

## Workflow

```
Modal Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical modal CSS module
- [ ] Step 3: Read canonical modal component example
- [ ] Step 4: Read buttons CSS for footer actions
- [ ] Step 5: Apply patterns learned from canonical files
- [ ] Step 6: Verify zero inline styles
- [ ] Step 7: Protect imports from formatter
```

---

## Step 1: Read Configuration

```
read_file .windsurf/config/senior-developer.json
```

Extract:
- `canonicalApp.path` - Base path to reference app
- `patterns.modal.css` - Path to modal CSS module
- `patterns.modal.example` - Path to canonical modal component
- `patterns.buttons.css` - Path to buttons CSS module

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Step 2: Read Canonical Modal CSS

```
read_file [canonicalApp.path]/[patterns.modal.css]
```

Learn from this file:
- Modal overlay classes
- Modal content/container classes
- Header, body, footer classes
- Title and close button classes

**DO NOT assume class names** - read them from the file.

---

## Step 3: Read Canonical Modal Component

```
read_file [canonicalApp.path]/[patterns.modal.example]
```

The canonical modal component (e.g., `POEditModal.tsx`) demonstrates:
- Modal structure (overlay → content → header → body → footer)
- Click handling (overlay closes, content stops propagation)
- Close button implementation
- Footer button patterns
- Form layout inside modals

**Copy patterns from this living document**, not from static examples in this skill.

---

## Step 4: Read Buttons CSS

```
read_file [canonicalApp.path]/[patterns.buttons.css]
```

Learn available button classes for:
- Primary action buttons
- Danger/destructive buttons
- Success buttons
- Cancel buttons

---

## Step 5: Apply Patterns

Using what you learned from the canonical files:

1. **Match the modal structure** from the canonical component
2. **Use the exact class names** from the CSS modules
3. **Follow the same patterns** for headers, footers, forms
4. **Never invent new patterns** - if it's not in canonical, ask user

**Key behavioral rules learned from canonical:**
- Overlay click closes modal
- Content click stops propagation
- Close button (X) in header
- Footer has cancel + action buttons

---

## Step 6: Verify Zero Inline Styles

```
grep_search with Query="style={{" and SearchPath="<component-path>" and FixedStrings=true
```

Must return no matches. All styling must use CSS classes from the canonical modules.

---

## Step 7: Protect Imports

The formatter strips unused imports. After adding imports, protect them:

```tsx
import modalStyles from '@/styles/modal.module.css'
const _modalStyles = modalStyles // Protect from formatter
```

---

## Validation Checklist

Before completing:

- [ ] Read canonical modal CSS module (not assumed class names)
- [ ] Read canonical modal component example
- [ ] Structure matches canonical (overlay → content → header → body → footer)
- [ ] Click behaviors match canonical
- [ ] Zero inline styles
- [ ] Imports protected from formatter
- [ ] No custom CSS duplicating canonical patterns
