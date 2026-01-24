---
description: Perform a comprehensive CSS audit to identify and fix drift from canonical patterns
---

# CSS Audit Workflow

This workflow orchestrates a comprehensive CSS audit to bring an application back in line with canonical patterns.

---

## Step 1: Activate Senior Developer Role

Execute the Senior Developer activation workflow:

```
read_file .windsurf/workflows/senior-developer.md
```

Follow all steps in that workflow. The activation report must include:
- Role status
- Orchestrator status
- Canonical app path (required for this audit)
- Database connection status

**If canonical app is not configured:** STOP - Cannot proceed without configuration.

---

## Step 2: Load CSS Audit Skill

Read the CSS audit skill:

```
read_file .windsurf/skills/css-audit/SKILL.md
```

---

## Step 3: Discovery - Quantify the Problem

Use the `grep_search` tool to assess the scope. Do NOT use bash grep commands.

**3.1 Find inline styles in components:**
```
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true
```

**3.2 Find inline styles in pages:**
```
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```

**3.3 Find empty CSS modules:**
```
find_by_name with Pattern="*.module.css" and SearchDirectory="." and Type="file"
```
Then check file sizes - any 0 byte files are empty.

**3.4 List ALL components to audit:**
```
find_by_name with Pattern="page.tsx" and SearchDirectory="app/" and Type="file"
find_by_name with Pattern="*.tsx" and SearchDirectory="components/" and Type="file"
```

**Present findings to user:**
- Total files with inline styles
- Top offenders by count
- Empty CSS modules to delete
- **Complete list of components** (every item MUST go through Step 5)

---

## Step 4: Triage and Prioritize

Categorize findings:

| Priority | Criteria | Action |
|----------|----------|--------|
| **Critical** | >50 inline styles | Fix first |
| **High** | 20-50 inline styles | Phase 1 |
| **Medium** | 10-20 inline styles | Phase 2 |
| **Low** | <10 inline styles | Phase 3 |
| **Zero inline styles** | 0 inline styles | **Still requires Step 5 pattern comparison** |

Present prioritized list to user and ask: "Which component would you like to start with?"

---

## Step 5: Component Audit Loop

**CRITICAL:** This step applies to EVERY component from Step 3.4, regardless of inline style count.

For each component:

### 5.1 Read Canonical Reference First

From the config's `canonicalApp.path`, read the canonical implementations:
```
read_file [canonicalApp.path]/app/(main)/purchase-order-generator/page.tsx
read_file [canonicalApp.path]/components/PORecommendationsTable.tsx
```

### 5.2 Compare Layout Patterns

1. **Read the component** to understand current state
2. **Compare structure against canonical:**

| Pattern | Canonical Structure | Check For |
|---------|---------------------|-----------|
| Page layout | `pageStyles.container > header > content` | Custom wrapper divs |
| Tabs | Directly inside `pageStyles.content` | Extra `tabsContainer` divs |
| Filter sections | `section > filtersContainer > filterGroup` | Floating filters |
| Tables | `tableStyles` from `Table.module.css` | Custom table classes |
| Info rows | `<strong>{count}</strong> Items` (no icons) | Icons in info rows |

3. **Document and fix deviations** before proceeding

### 5.3 Fix Inline Styles

1. **Identify pattern types** needed (table, page, form, modal, button)
2. **Load relevant pattern skill(s)**
3. **Replace inline styles** with shared CSS classes
4. **Protect imports** from formatter stripping
5. **Verify zero inline styles:**
   ```
   grep_search with Query="style={{" and SearchPath="<component-path>" and FixedStrings=true
   ```
   Must return no matches.

Repeat for EVERY component until all are complete.

---

## Step 6: Module Cleanup

After all components are fixed:

1. **Identify CSS modules with duplicates:**
   ```
   grep_search with Query=".section {" and SearchPath="styles/" and Includes=["*.module.css"] and FixedStrings=true
   grep_search with Query=".section {" and SearchPath="components/" and Includes=["*.module.css"] and FixedStrings=true
   ```

2. **For each custom module:**
   - Check if classes exist in shared modules
   - Update component to use shared imports
   - Remove duplicated classes
   - Delete module if empty

---

## Step 7: Final Verification

**7.1 Verify ALL components audited:**
Confirm every component from Step 3.4 has been through Step 5 (pattern comparison + inline style fix).

**7.2 Verify zero inline styles:**
```
grep_search with Query="style={{" and SearchPath="components/" and Includes=["*.tsx"] and FixedStrings=true
grep_search with Query="style={{" and SearchPath="app/" and Includes=["*.tsx"] and FixedStrings=true
```
Both must return no matches.

**7.3 Build check:**
// turbo
```bash
npm run build
```

Report to user:
- "**CSS Audit Complete**"
- Total components audited (must match Step 3.4 count)
- Total inline styles eliminated
- Layout pattern deviations fixed
- CSS modules cleaned up
- Build status

