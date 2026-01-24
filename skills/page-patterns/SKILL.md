---
name: page-patterns
description: Enforces consistent page layout patterns by reading from the canonical reference app (stock-insights). Use when creating new pages, building page scaffolds, adding sections, tabs, or refactoring page layouts. Triggers on: new page, create page, page layout, page scaffold, page structure, add section, page container, page header, tabs, refactor page.
---

# Skill: Page Patterns

This skill ensures consistent page layout implementation by reading patterns from the **canonical reference app** (living document), not hardcoded examples.

---

## CRITICAL: Read From Canonical App

**DO NOT use hardcoded CSS class names or patterns from this skill file.**

Instead, read the actual files from the canonical reference app configured in `.windsurf/config/senior-developer.json`.

---

## Workflow

```
Page Patterns Checklist:
- [ ] Step 1: Read config to get canonical app path
- [ ] Step 2: Read canonical page CSS module
- [ ] Step 3: Read canonical page example (PO Generator)
- [ ] Step 4: Read components.module.css for sections/filters/tabs
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
- `patterns.page.css` - Path to page CSS module
- `patterns.page.example` - Path to canonical page (PO Generator)
- `patterns.components.css` - Path to shared components CSS

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Step 2: Read Canonical Page CSS

```
read_file [canonicalApp.path]/[patterns.page.css]
```

Learn from this file:
- Page container structure classes
- Header and content classes
- Any page-specific layout classes

**DO NOT assume class names** - read them from the file.

---

## Step 3: Read Canonical Page Example

```
read_file [canonicalApp.path]/[patterns.page.example]
```

The canonical page (PO Generator) demonstrates:
- Page scaffold structure (container → header → content)
- Tab implementation pattern
- Filter section structure
- Stats/KPI card layout
- State handling (loading, error, empty)

**Copy patterns from this living document**, not from static examples in this skill.

---

## Step 4: Read Components CSS

```
read_file [canonicalApp.path]/[patterns.components.css]
```

Learn available classes for:
- Tabs and tab states
- Filter containers and groups
- Sections and section variants
- Stats containers and cards
- Info rows
- State indicators (loading, error, empty)

---

## Step 5: Apply Patterns

Using what you learned from the canonical files:

1. **Match the page scaffold** from the canonical page
2. **Use the exact class names** from the CSS modules
3. **Follow the same patterns** for tabs, filters, stats
4. **Never invent new patterns** - if it's not in canonical, ask user

**Key structural rules learned from canonical:**
- Tabs go directly inside content (no wrapper divs)
- Filters use section → filtersContainer → filterGroup hierarchy
- Info rows are plain text (no icons)
- Page titles with icons need proper flex alignment class

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
import pageStyles from '@/styles/pages.module.css'
const _pageStyles = pageStyles // Protect from formatter
```

---

## Validation Checklist

Before completing:

- [ ] Read canonical page CSS module (not assumed class names)
- [ ] Read canonical page example (PO Generator)
- [ ] Structure matches canonical page scaffold
- [ ] Tabs follow canonical pattern (no wrapper divs)
- [ ] Filters follow canonical hierarchy
- [ ] Zero inline styles
- [ ] Imports protected from formatter
- [ ] No custom CSS duplicating canonical patterns
