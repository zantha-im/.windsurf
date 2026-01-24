---
name: modal-patterns
description: Enforces consistent modal dialog patterns by reading from the canonical reference app. Use when the user mentions modal, dialog, popup, overlay, or needs to create, fix, or review modal components.
---

# Skill: Modal Patterns

This skill ensures consistent modal implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## MANDATORY FIRST ACTION

**1. ANNOUNCE:** Output this line first:
```
📋 Skill Invoked: @modal-patterns - Loading canonical modal patterns...
```

**2. THEN immediately read these files (no exploration first):**
- `.windsurf/config/senior-developer.json` - Get canonical app path
- `[canonicalApp.path]/[patterns.modal.css]` - Modal CSS patterns
- `[canonicalApp.path]/[patterns.modal.example]` - Modal component example

**DO NOT use Fast Context, code_search, or grep to explore the codebase first.**
**DO NOT ask the user what needs fixing before reading canonical patterns.**

The canonical files ARE your context. Read them first, then you'll know what patterns to apply.

---

## Workflow

```
Modal Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical modal CSS module
- [ ] Step 3: Read canonical modal component example
- [ ] Step 4: Read buttons CSS for footer actions
- [ ] Step 5: THEN explore the target component
- [ ] Step 6: Apply patterns learned from canonical files
- [ ] Step 7: Verify zero inline styles
- [ ] Step 8: Protect imports from formatter
```

---

## Step 1: Read Configuration (DO THIS FIRST)

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

## Step 5: Explore Target Component

Now that you have the canonical patterns loaded, explore the target component:

```
read_file <target-component-path>
```

Compare against the canonical patterns you just read.

---

## Step 6: Apply Patterns

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

## Step 7: Verify Zero Inline Styles

```
grep_search with Query="style={{" and SearchPath="<component-path>" and FixedStrings=true
```

Must return no matches. All styling must use CSS classes from the canonical modules.

---

## Step 8: Protect Imports

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
