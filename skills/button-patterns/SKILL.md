---
name: button-patterns
description: Enforces consistent button styling by reading from the canonical reference app (stock-insights). Use when adding buttons, icon buttons, action buttons, or styling interactive elements. Triggers on: button styles, icon button, action button, primary button, delete button, add button, submit button, cancel button, refactor button.
---

# Skill: Button Patterns

This skill ensures consistent button implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## CRITICAL: Read From Canonical App

**DO NOT use hardcoded CSS class names or patterns from this skill file.**

Instead, read the actual files from the canonical reference app configured in `.windsurf/config/senior-developer.json`.

---

## Workflow

```
Button Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical buttons CSS module
- [ ] Step 3: Read canonical component examples for button usage
- [ ] Step 4: Apply patterns learned from canonical files
- [ ] Step 5: Verify zero inline styles
- [ ] Step 6: Protect imports from formatter
```

---

## Step 1: Read Configuration

```
read_file .windsurf/config/senior-developer.json
```

Extract:
- `canonicalApp.path` - Base path to reference app
- `patterns.buttons.css` - Path to buttons CSS module
- `patterns.table.example` - Path to canonical table (for action buttons)
- `patterns.page.example` - Path to canonical page (for header buttons)

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Step 2: Read Canonical Buttons CSS

```
read_file [canonicalApp.path]/[patterns.buttons.css]
```

Learn from this file:
- Primary action button classes
- Success/danger/secondary button classes
- Icon button classes (with and without borders)
- Small/compact button classes
- Dashed/add button classes

**DO NOT assume class names** - read them from the file.

---

## Step 3: Read Canonical Component Examples

```
read_file [canonicalApp.path]/[patterns.table.example]
read_file [canonicalApp.path]/[patterns.page.example]
```

The canonical components demonstrate:
- Button usage in page headers
- Action buttons in table rows
- Button groups and alignment
- Loading states in buttons

**Copy patterns from these living documents**, not from static examples in this skill.

---

## Step 4: Apply Patterns

Using what you learned from the canonical files:

1. **Use the exact class names** from the buttons CSS module
2. **Follow the same patterns** for button placement and grouping
3. **Match the icon button styles** from canonical components
4. **Never invent new button styles** - if it's not in canonical, ask user

**Key rules learned from canonical:**
- Inline styles are banned - use native `disabled` attribute
- Table row actions use a wrapper class for proper alignment
- Loading states use spinner icon class

---

## Step 5: Verify Zero Inline Styles

```
grep_search with Query="style={{" and SearchPath="<component-path>" and FixedStrings=true
```

Must return no matches. All styling must use CSS classes from the canonical modules.

---

## Step 6: Protect Imports

The formatter strips unused imports. After adding imports, protect them:

```tsx
import btnStyles from '@/styles/buttons.module.css'
const _btnStyles = btnStyles // Protect from formatter
```

---

## Validation Checklist

Before completing:

- [ ] Read canonical buttons CSS module (not assumed class names)
- [ ] Read canonical component examples for button usage
- [ ] Button classes match canonical patterns
- [ ] Zero inline styles
- [ ] Imports protected from formatter
- [ ] No custom CSS duplicating canonical patterns
