---
name: table-patterns
description: Enforces consistent data table patterns by reading from the canonical reference app (stock-insights). Use when building data tables, adding sortable columns, creating table layouts, or refactoring table styling. Triggers on: build table, data table, create table component, table layout, sortable table, table with sorting, grid component, data grid, refactor table.
---

# Skill: Table Patterns

This skill ensures consistent table implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## CRITICAL: Read From Canonical App

**DO NOT use hardcoded CSS class names or patterns from this skill file.**

Instead, read the actual files from the canonical reference app configured in `.windsurf/config/senior-developer.json`.

---

## Workflow

```
Table Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical table CSS module
- [ ] Step 3: Read canonical table component example
- [ ] Step 4: Read components.module.css for state/text classes
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
- `patterns.table.css` - Path to table CSS module
- `patterns.table.example` - Path to canonical table component
- `patterns.components.css` - Path to shared components CSS

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Step 2: Read Canonical Table CSS

```
read_file [canonicalApp.path]/[patterns.table.css]
```

Learn from this file:
- Available table structure classes
- Column type classes (numeric, centered, etc.)
- Sortable header classes
- Row state classes

**DO NOT assume class names** - read them from the file.

---

## Step 3: Read Canonical Table Component

```
read_file [canonicalApp.path]/[patterns.table.example]
```

The canonical table component (e.g., `PORecommendationsTable.tsx`) demonstrates:
- Wrapper hierarchy structure
- How to apply CSS classes
- Sorting implementation
- Row click handling
- State management patterns

**Copy patterns from this living document**, not from static examples in this skill.

---

## Step 4: Read Components CSS

```
read_file [canonicalApp.path]/[patterns.components.css]
```

Learn available utility classes for:
- Text colors (success, error, warning, muted)
- Loading states
- Row highlighting
- Empty states

---

## Step 5: Apply Patterns

Using what you learned from the canonical files:

1. **Match the wrapper structure** from the canonical component
2. **Use the exact class names** from the CSS modules
3. **Follow the same patterns** for sorting, states, etc.
4. **Never invent new patterns** - if it's not in canonical, ask user

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
import tableStyles from '@/components/Table.module.css'
const _tableStyles = tableStyles // Protect from formatter
```

---

## Validation Checklist

Before completing:

- [ ] Read canonical table CSS module (not assumed class names)
- [ ] Read canonical table component example
- [ ] Structure matches canonical wrapper hierarchy
- [ ] Zero inline styles
- [ ] Imports protected from formatter
- [ ] No custom CSS duplicating canonical patterns
