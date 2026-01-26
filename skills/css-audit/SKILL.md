---
name: css-audit
description: Performs a comprehensive staged audit of an application to identify and fix CSS drift from canonical patterns. Use when reviewing an app for design consistency, auditing CSS patterns, checking for inline styles, consolidating CSS modules, or bringing an app back in line with canonical patterns. Triggers on: css audit, design review, pattern review, css consistency, inline styles audit, css consolidation, design patterns review, canonical patterns check, css drift, style audit, refactor css, css cleanup, design consistency review.
---

# Skill: CSS Audit

This skill performs a comprehensive staged audit of an application to identify CSS drift from canonical patterns and systematically bring it back into compliance.

---

## When to Use This Skill

- Application has accumulated inline styles over time
- CSS modules have duplicated patterns from shared modules
- New developers have introduced non-canonical layouts
- Preparing for a major refactor or design system update
- Periodic maintenance to prevent technical debt

---

## CRITICAL: Config Discovery First

Read the configuration file to find the canonical reference app:

```
.windsurf/config/senior-developer.json
```

This contains `canonicalApp.path` pointing to the reference application with proven patterns.

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Canonical Reference

**The PO Generator feature is the canonical reference for all patterns:**
- Page layout: `purchase-order-generator/page.tsx`
- Table patterns: `PORecommendationsTable.tsx`
- Modal patterns: PO Generator modals

All components must be compared against these canonical implementations, not just checked for inline styles.

---

## Audit Workflow Overview

**MANDATORY: Copy this checklist into your plan and track each stage explicitly.**

```
CSS Audit Stages:
- [ ] Stage 1: Discovery - List ALL components and count inline styles
- [ ] Stage 2: Triage - Prioritize by impact
- [ ] Stage 3: Quick Wins - Delete empty/duplicate files
- [ ] Stage 4: Layout Pattern Comparison - Compare EACH component against canonical (BEFORE fixing anything)
- [ ] Stage 5: Inline Style Fixes - Fix inline styles per component
- [ ] Stage 6: Module Cleanup - Remove duplicate CSS classes
- [ ] Stage 7: Pre-Verification Gate - Confirm ALL components pattern-compared
- [ ] Stage 8: Verification - Confirm zero inline styles + build passes
```

**CRITICAL ENFORCEMENT:**
- Stage 4 MUST complete BEFORE Stage 5. Do not fix inline styles until all components are pattern-compared.
- Stage 7 is a GATE. You cannot proceed to Stage 8 until every component from Stage 1 is confirmed pattern-compared.
- If you skip Stage 4, the audit is INVALID regardless of inline style count.

---

## Stage 1: Discovery

**Goal:** Quantify inline styles, identify CSS module issues, AND list all components to audit.

### 1.1 Count Inline Styles

Use the `grep_search` tool (NOT bash grep):

```
# All components
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true

# All pages
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```

### 1.2 Identify CSS Module Issues

```
# Find CSS modules (check sizes for empty files)
find_by_name with Pattern="*.module.css" and SearchDirectory="." and Type="file"

# Find CSS modules with potential duplicates
grep_search with Query=".section {" and SearchPath="styles/" and Includes=["*.module.css"] and FixedStrings=true

# Check for duplicate @keyframes
grep_search with Query="@keyframes spin" and SearchPath="." and Includes=["*.module.css"] and FixedStrings=true
```

### 1.3 List ALL Components to Audit

**CRITICAL:** Create a complete list of components and pages. Every item on this list MUST go through Stage 4 (Layout Pattern Comparison).

```
# List all page components
find_by_name with Pattern="page.tsx" and SearchDirectory="app/" and Type="file"

# List all components
find_by_name with Pattern="*.tsx" and SearchDirectory="components/" and Type="file"
```

Present the full list to user with counts.

---

## Stage 2: Triage

**Goal:** Prioritize components by impact and effort.

### Priority Matrix

| Priority     | Criteria               | Action                |
| ------------ | ---------------------- | --------------------- |
| **Critical** | >50 inline styles      | Fix first             |
| **High**     | 20-50 inline styles    | Fix in phase 1        |
| **Medium**   | 10-20 inline styles    | Fix in phase 2        |
| **Low**      | <10 inline styles      | Fix in phase 3        |
| **Exclude**  | Auth pages, test files | Skip unless requested |

### Categorize Components

Group by type for batch processing:
1. **Pages** - `app/(main)/**/*.tsx`
2. **Tables** - Components with table structures
3. **Modals** - Dialog/overlay components
4. **Layout** - Shared layout components
5. **Utilities** - Small reusable components

---

## Stage 3: Quick Wins

**Goal:** Remove obvious waste before detailed work.

### 3.1 Delete Empty CSS Modules

```bash
# Find and list empty modules
find . -name "*.module.css" -empty

# Delete after verification
rm <empty-file>.module.css
```

### 3.2 Remove Unused Imports

After deleting CSS modules, remove their imports from components.

### 3.3 Identify Fully Duplicated Modules

If a CSS module only contains classes that exist in shared modules:
1. Update component to use shared module imports
2. Delete the custom module

---

## Stage 4: Layout Pattern Comparison

**Goal:** Compare EVERY component against canonical reference patterns, regardless of inline style count.

**CRITICAL:** This stage is MANDATORY. A component with zero inline styles may still use non-canonical layout patterns.

### 4.1 Read Canonical Reference

From the config's `canonicalApp.path`, read the canonical implementations:

```
# Canonical page layout
read_file [canonicalApp.path]/app/(main)/purchase-order-generator/page.tsx

# Canonical table component
read_file [canonicalApp.path]/components/PORecommendationsTable.tsx
```

### 4.2 Per-Component Pattern Check

For EACH component in the list from Stage 1.3:

1. **Read the component**
2. **Compare structure against canonical:**

| Pattern         | Canonical Structure                              | Check For                                    |
| --------------- | ------------------------------------------------ | -------------------------------------------- |
| Page layout     | `pageStyles.container > header > content`        | Custom wrapper divs, non-standard containers |
| Tabs            | Directly inside `pageStyles.content`, no wrapper | Extra `tabsContainer` divs                   |
| Filter sections | `section > filtersContainer > filterGroup`       | Floating filters, non-standard placement     |
| Tables          | `tableStyles` from `Table.module.css`            | Custom table classes duplicating shared      |
| Info rows       | `<strong>{count}</strong> Items` (no icons)      | Icons in info rows                           |

3. **Document deviations:**
   - List structural differences
   - Note non-canonical class names
   - Flag custom CSS modules that duplicate shared patterns

4. **Fix deviations** before moving to Stage 5

### 4.3 Common Anti-Patterns to Fix

| Anti-Pattern                           | Canonical Pattern                                 |
| -------------------------------------- | ------------------------------------------------- |
| `settingsContainer` / `settingsHeader` | `pageStyles.container` / `pageStyles.header`      |
| `tabsContainer` wrapper div            | Tabs directly in `pageStyles.content`             |
| Custom `.section` in component CSS     | Use `styles.section` from `components.module.css` |
| Custom `.table*` classes               | Use `tableStyles` from `Table.module.css`         |
| Icons in info rows                     | Plain text: `<strong>{n}</strong> Items`          |

---

## Stage 5: Component Audit

**Goal:** Fix inline styles in each component using pattern skills.

### CRITICAL: Read CSS First, Write Code Second

**LLMs tend to write inline styles first, then check for classes. This is backwards.**

The natural flow during code generation is to reach for the quickest solution (inline style), then realize a class exists. This creates unnecessary churn. **Force yourself to read CSS modules BEFORE writing any replacement code.**

### 5.1 Per-Component Process

For each component with inline styles:

1. **Count inline styles:**
   ```
   grep_search with Query="style={{" and SearchPath="<component>.tsx" and MatchPerLine=true and FixedStrings=true
   ```

2. **Read ALL relevant CSS modules FIRST (MANDATORY):**
   ```
   read_file [canonicalApp.path]/styles/components.module.css
   read_file [canonicalApp.path]/styles/buttons.module.css
   read_file [project]/styles/*.module.css
   ```
   
3. **Plan replacements BEFORE editing:**
   For each inline style, write out:
   - The inline style to remove
   - The existing class that replaces it (or "NEW" if none exists)

4. **Identify pattern types needed:**
   - Tables → Use `@table-patterns` skill
   - Pages → Use `@page-patterns` skill
   - Forms → Use `@form-patterns` skill
   - Modals → Use `@modal-patterns` skill
   - Buttons → Use `@button-patterns` skill

5. **Replace inline styles with classes (only after steps 2-4):**
   ```tsx
   // ❌ Before
   style={{ color: isError ? '#ef4444' : '#10b981' }}
   
   // ✅ After
   className={isError ? styles.textError : styles.textSuccess}
   ```

6. **Protect imports from formatter:**
   ```tsx
   import styles from '@/styles/components.module.css'
   const _styles = styles // Protect from formatter
   ```

7. **Verify zero inline styles:**
   ```
   grep_search with Query="style={{" and SearchPath="<component>.tsx" and FixedStrings=true
   ```
   Must return no matches.

### 5.2 Common Inline Style Replacements

| Inline Style                | Replacement Class        |
| --------------------------- | ------------------------ |
| `color: '#ef4444'` (red)    | `styles.textError`       |
| `color: '#10b981'` (green)  | `styles.textSuccess`     |
| `color: '#f59e0b'` (yellow) | `styles.textWarning`     |
| `color: '#6b7280'` (gray)   | `styles.textMuted`       |
| `opacity: 0.6`              | `styles.sectionLoading`  |
| `marginLeft: '4px'`         | `styles.marginLeft`      |
| `textAlign: 'center'`       | `tableStyles.centerCell` |
| `fontFamily: 'monospace'`   | `tableStyles.sku`        |

### 5.3 Dynamic Values Pattern

Even conditional values must use classes:

```tsx
// ❌ BAD - dynamic inline style
<td style={{ 
  color: value > 0 ? '#10b981' : value < 0 ? '#ef4444' : '#6b7280' 
}}>

// ✅ GOOD - conditional class
<td className={
  value > 0 ? styles.textSuccess : 
  value < 0 ? styles.textError : 
  styles.textMuted
}>
```

---

## Stage 6: Module Cleanup

**Goal:** Remove duplicate CSS classes from custom modules.

### 6.1 Identify Duplicates

Check each custom CSS module for classes that exist in shared modules:

```
grep_search with Query=".section" and SearchPath="<custom>.module.css" and MatchPerLine=true and FixedStrings=true
# Also search for: .table, .label, .input, .button
```

### 6.2 Migration Process

1. **List classes in custom module**
2. **Check if each exists in shared modules**
3. **Update component imports to use shared module**
4. **Remove duplicated classes from custom module**
5. **Delete custom module if empty**

### 6.3 Shared Module Reference

| Pattern                  | Shared Module                    | Import As     |
| ------------------------ | -------------------------------- | ------------- |
| Sections, filters, forms | `@/styles/components.module.css` | `styles`      |
| Buttons                  | `@/styles/buttons.module.css`    | `btnStyles`   |
| Page layout              | `@/styles/pages.module.css`      | `pageStyles`  |
| Modals                   | `@/styles/modal.module.css`      | `modalStyles` |
| Tables                   | `@/components/Table.module.css`  | `tableStyles` |

---

## Stage 7: Pre-Verification Gate (MANDATORY)

**Goal:** Confirm ALL components have been pattern-compared before declaring success.

**STOP. You cannot proceed to Stage 8 until this gate passes.**

### 7.1 Component Checklist Review

List every component from Stage 1.3 and confirm each was pattern-compared:

```
Component Pattern Comparison Status:
- [ ] app/products/page.tsx - Compared: YES/NO
- [ ] app/settings/page.tsx - Compared: YES/NO
- [ ] components/ProductWizard.tsx - Compared: YES/NO
... (list ALL components)
```

### 7.2 Gate Criteria

**ALL of the following must be true:**
- [ ] Every component from Stage 1.3 is listed above
- [ ] Every component shows "Compared: YES"
- [ ] Deviations from canonical patterns have been documented and fixed

**If ANY component shows "Compared: NO":**
1. STOP
2. Go back to Stage 4
3. Complete pattern comparison for that component
4. Return here and update the checklist

### 7.3 Explicit Confirmation

Before proceeding, state: "All [N] components have been compared against canonical patterns. Gate passed."

---

## Stage 8: Verification

**Goal:** Confirm all inline styles are eliminated.

### 8.1 Final Inline Style Check

```
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```
Both must return no matches.

### 8.2 Build Verification

```
run_command: npm run build
```

Ensure no CSS-related build errors.

### 8.3 Visual Verification

Manually check key pages to ensure styling is correct:
- [ ] Page layouts render correctly
- [ ] Tables display properly
- [ ] Modals open/close with correct styling
- [ ] Buttons have correct hover states
- [ ] Loading states display correctly

---

## Incremental Audit Mode

For ongoing maintenance (not full audit):

```
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```

If any found, fix immediately before they accumulate.

**Recommendation:** Run quick check before each major PR merge.

---

## Validation Checklist

Before marking audit complete:

- [ ] **Stage 7 Gate PASSED** - All components confirmed pattern-compared
- [ ] **ALL components compared** against canonical reference (Stage 4)
- [ ] `grep_search` for `style={{` returns no matches in components/ and app/
- [ ] No empty CSS modules remain
- [ ] No duplicate classes in custom modules
- [ ] `npm run build` succeeds
- [ ] Key pages visually verified
- [ ] Pattern skills referenced where applicable

---

## Lessons Learned

These lessons were captured during the stock-insights CSS consolidation audit. Apply them to all audits.

### 1. Audit Protocol
**Always grep for inline styles FIRST** and create a complete component list. Must return zero results before marking any component complete.

### 2. Dynamic Values Are Not Exceptions
Even conditional inline styles must be converted to conditional classes.

### 3. Inline Style Objects Are Anti-Patterns
```tsx
// ❌ BAD
const tabStyles = { padding: '8px', ... }
<div style={tabStyles}>

// ✅ GOOD
<div className={styles.tab}>
```

### 4. Filter Controls Belong in Filter Sections
- Dropdowns/selects that control data → `<section className={styles.section}>` with `filtersContainer`
- NOT floating above tables or in card headers
- Pattern: `section > filtersContainer > filterGroup > label + select`

### 5. Info Rows Are Plain Text
- No icons in info rows
- Pattern: `<strong>{count}</strong> Items` with optional muted date range

### 6. `actionsCell` Needs `align-items: center`
Without it, flex children stretch vertically to fill container height.

### 7. Page Titles with Icons Need `.pageTitle`
All h1 elements with icons: `className={styles.pageTitle}` — ensures consistent flex alignment.

### 8. Search Shared Modules Before Creating Classes
Before creating ANY new class, search shared modules for existing solution.

### 9. Import Protection
The formatter strips unused imports. Protect them:
```typescript
import btnStyles from '@/styles/buttons.module.css'
const _btnStyles = btnStyles // Protect from formatter
```

### 10. Canonical Page Layout Pattern
All pages should follow this structure (PO Generator is the reference):
```tsx
<div className={pageStyles.container}>
  <div className={pageStyles.header}>
    <h1><Icon /> Title</h1>
    {/* Action buttons */}
  </div>
  <div className={pageStyles.content}>
    {/* Tabs directly inside content - NO wrapper divs */}
    <div className={componentStyles.tabs}>
      <button className={`${componentStyles.tab} ${active ? componentStyles.tabActive : ''}`}>
        Tab Name
      </button>
    </div>
    {/* Tab content */}
  </div>
</div>
```

**Anti-patterns to avoid:**
- `settingsContainer` / `settingsHeader` — use `pageStyles.container` / `pageStyles.header`
- `tabsContainer` wrapper div — tabs go directly in `pageStyles.content`
- `settingsDivider` — creates double-line effect, not needed

### 11. Removing Features Can Break Other User Flows
When consolidating UI:
- **Check access control:** If the target feature is admin-only, non-admins lose access
- **Verify all user roles:** Test partner, warehouse, and admin flows
- **Document intentional restrictions**

### 12. Custom CSS Modules Often Duplicate Shared Patterns
Before refactoring a component, check if its CSS module duplicates shared styles. Delete custom modules after migrating to shared patterns.

---

## Related Skills

This skill orchestrates the following pattern skills:
- `@table-patterns` - For table component fixes
- `@page-patterns` - For page layout fixes
- `@form-patterns` - For form/input fixes
- `@modal-patterns` - For modal dialog fixes
- `@button-patterns` - For button styling fixes
