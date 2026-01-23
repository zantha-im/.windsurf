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

## Audit Workflow Overview

```
CSS Audit Stages:
- [ ] Stage 1: Discovery - Quantify the problem
- [ ] Stage 2: Triage - Prioritize by impact
- [ ] Stage 3: Quick Wins - Delete empty/duplicate files
- [ ] Stage 4: Component Audit - Fix inline styles per component
- [ ] Stage 5: Module Cleanup - Remove duplicate CSS classes
- [ ] Stage 6: Verification - Confirm zero inline styles
```

---

## Stage 1: Discovery

**Goal:** Quantify inline styles and identify CSS module issues.

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

---

## Stage 2: Triage

**Goal:** Prioritize components by impact and effort.

### Priority Matrix

| Priority | Criteria | Action |
|----------|----------|--------|
| **Critical** | >50 inline styles | Fix first |
| **High** | 20-50 inline styles | Fix in phase 1 |
| **Medium** | 10-20 inline styles | Fix in phase 2 |
| **Low** | <10 inline styles | Fix in phase 3 |
| **Exclude** | Auth pages, test files | Skip unless requested |

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

## Stage 4: Component Audit

**Goal:** Fix inline styles in each component using pattern skills.

### 4.1 Per-Component Process

For each component with inline styles:

1. **Count inline styles:**
   ```
   grep_search with Query="style={{" and SearchPath="<component>.tsx" and MatchPerLine=true and FixedStrings=true
   ```

2. **Identify pattern types needed:**
   - Tables → Use `@table-patterns` skill
   - Pages → Use `@page-patterns` skill
   - Forms → Use `@form-patterns` skill
   - Modals → Use `@modal-patterns` skill
   - Buttons → Use `@button-patterns` skill

3. **Read canonical reference** from config

4. **Replace inline styles with classes:**
   ```tsx
   // ❌ Before
   style={{ color: isError ? '#ef4444' : '#10b981' }}
   
   // ✅ After
   className={isError ? styles.textError : styles.textSuccess}
   ```

5. **Protect imports from formatter:**
   ```tsx
   import styles from '@/styles/components.module.css'
   const _styles = styles // Protect from formatter
   ```

6. **Verify zero inline styles:**
   ```
   grep_search with Query="style={{" and SearchPath="<component>.tsx" and FixedStrings=true
   ```
   Must return no matches.

### 4.2 Common Inline Style Replacements

| Inline Style | Replacement Class |
|--------------|-------------------|
| `color: '#ef4444'` (red) | `styles.textError` |
| `color: '#10b981'` (green) | `styles.textSuccess` |
| `color: '#f59e0b'` (yellow) | `styles.textWarning` |
| `color: '#6b7280'` (gray) | `styles.textMuted` |
| `opacity: 0.6` | `styles.sectionLoading` |
| `marginLeft: '4px'` | `styles.marginLeft` |
| `textAlign: 'center'` | `tableStyles.centerCell` |
| `fontFamily: 'monospace'` | `tableStyles.sku` |

### 4.3 Dynamic Values Pattern

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

## Stage 5: Module Cleanup

**Goal:** Remove duplicate CSS classes from custom modules.

### 5.1 Identify Duplicates

Check each custom CSS module for classes that exist in shared modules:

```
grep_search with Query=".section" and SearchPath="<custom>.module.css" and MatchPerLine=true and FixedStrings=true
# Also search for: .table, .label, .input, .button
```

### 5.2 Migration Process

1. **List classes in custom module**
2. **Check if each exists in shared modules**
3. **Update component imports to use shared module**
4. **Remove duplicated classes from custom module**
5. **Delete custom module if empty**

### 5.3 Shared Module Reference

| Pattern | Shared Module | Import As |
|---------|---------------|-----------|
| Sections, filters, forms | `@/styles/components.module.css` | `styles` |
| Buttons | `@/styles/buttons.module.css` | `btnStyles` |
| Page layout | `@/styles/pages.module.css` | `pageStyles` |
| Modals | `@/styles/modal.module.css` | `modalStyles` |
| Tables | `@/components/Table.module.css` | `tableStyles` |

---

## Stage 6: Verification

**Goal:** Confirm all inline styles are eliminated.

### 6.1 Final Inline Style Check

```
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```
Both must return no matches.

### 6.2 Build Verification

```
run_command: npm run build
```

Ensure no CSS-related build errors.

### 6.3 Visual Verification

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

- [ ] `grep_search` for `style={{` returns no matches in components/ and app/
- [ ] No empty CSS modules remain
- [ ] No duplicate classes in custom modules
- [ ] `npm run build` succeeds
- [ ] Key pages visually verified
- [ ] Pattern skills referenced where applicable

---

## Related Skills

This skill orchestrates the following pattern skills:
- `@table-patterns` - For table component fixes
- `@page-patterns` - For page layout fixes
- `@form-patterns` - For form/input fixes
- `@modal-patterns` - For modal dialog fixes
- `@button-patterns` - For button styling fixes
