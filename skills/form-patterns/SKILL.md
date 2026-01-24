---
name: form-patterns
description: Enforces consistent form and input patterns by reading from the canonical reference app (stock-insights). Use when building forms, adding inputs, creating filter bars, or styling form elements. Triggers on: build form, form inputs, filter form, form layout, input field, select dropdown, search box, checkbox, date picker, form validation, refactor form.
---

# Skill: Form Patterns

This skill ensures consistent form and input implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## CRITICAL: Read From Canonical App

**DO NOT use hardcoded CSS class names or patterns from this skill file.**

Instead, read the actual files from the canonical reference app configured in `.windsurf/config/senior-developer.json`.

---

## Workflow

```
Form Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical components CSS module
- [ ] Step 3: Read canonical page example for filter patterns
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
- `patterns.components.css` - Path to components CSS module
- `patterns.form.example` - Path to canonical form example
- `patterns.page.example` - Path to canonical page with filters

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Step 2: Read Canonical Components CSS

```
read_file [canonicalApp.path]/[patterns.components.css]
```

Learn from this file:
- Input field classes
- Select dropdown classes
- Date input classes
- Checkbox/label classes
- Filter container and group classes
- Form label classes

**DO NOT assume class names** - read them from the file.

---

## Step 3: Read Canonical Page Example

```
read_file [canonicalApp.path]/[patterns.page.example]
```

The canonical page (PO Generator) demonstrates:
- Filter bar structure and hierarchy
- Input/select usage in context
- Label patterns (filter vs form)
- Search box implementation

**Copy patterns from this living document**, not from static examples in this skill.

---

## Step 4: Apply Patterns

Using what you learned from the canonical files:

1. **Match the filter structure** from the canonical page
2. **Use the exact class names** from the CSS module
3. **Follow the same patterns** for inputs, selects, checkboxes
4. **Never invent new patterns** - if it's not in canonical, ask user

**Key structural rules learned from canonical:**
- Filter controls belong in sections with proper hierarchy
- Different label classes for filter bars vs modal forms
- Inline styles are banned - use conditional classes

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
import styles from '@/styles/components.module.css'
const _styles = styles // Protect from formatter
```

---

## Validation Checklist

Before completing:

- [ ] Read canonical components CSS module (not assumed class names)
- [ ] Read canonical page example for filter patterns
- [ ] Filter structure matches canonical hierarchy
- [ ] Zero inline styles
- [ ] Imports protected from formatter
- [ ] No custom CSS duplicating canonical patterns
