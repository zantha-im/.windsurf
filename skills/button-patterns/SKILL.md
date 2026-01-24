---
name: button-patterns
description: Enforces consistent button styling by reading from the canonical reference app. Use when the user mentions button, icon button, action button, or needs to create, fix, or review button components.
---

# Skill: Button Patterns

This skill ensures consistent button implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## MANDATORY FIRST ACTION

**1. ANNOUNCE:** Output this line first:
```
📋 Skill Invoked: @button-patterns - Loading canonical button patterns...
```

**2. THEN immediately read these files (no exploration first):**
- `.windsurf/config/senior-developer.json` - Get canonical app path
- `[canonicalApp.path]/[patterns.buttons.css]` - Button CSS patterns
- `[canonicalApp.path]/[patterns.table.example]` - Component with action buttons

**DO NOT use Fast Context, code_search, or grep to explore the codebase first.**
**DO NOT ask the user what needs fixing before reading canonical patterns.**

The canonical files ARE your context. Read them first, then you'll know what patterns to apply.

---

## Workflow

```
Button Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical buttons CSS module
- [ ] Step 3: Read canonical component examples for button usage
- [ ] Step 4: THEN explore the target component
- [ ] Step 5: Apply patterns learned from canonical files
- [ ] Step 6: Verify zero inline styles
- [ ] Step 7: Protect imports from formatter
```

---

## Step 1: Read Configuration (DO THIS FIRST)

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

## Step 4: Explore Target Component

Now that you have the canonical patterns loaded, explore the target component:

```
read_file <target-component-path>
```

Compare against the canonical patterns you just read.

---

## Step 5: Apply Patterns

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

## Step 6: Verify Zero Inline Styles

```
grep_search with Query="style={{" and SearchPath="<component-path>" and FixedStrings=true
```

Must return no matches. All styling must use CSS classes from the canonical modules.

---

## Step 7: Protect Imports

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
