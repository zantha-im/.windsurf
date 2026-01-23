---
description: Perform a comprehensive CSS audit to identify and fix drift from canonical patterns
---

# CSS Audit Workflow

This workflow orchestrates a comprehensive CSS audit to bring an application back in line with canonical patterns.

---

## Step 1: Activate Senior Developer Role

Read and activate the Senior Developer role:

```
read_file .windsurf/roles/generic/senior-developer.md
```

Confirm role activation to user: "**Senior Developer role activated.** Ready to perform CSS audit."

---

## Step 2: Verify Configuration

Read the configuration file:

```
read_file .windsurf/config/senior-developer.json
```

**If file exists:**
- Extract `canonicalApp.path`
- Confirm: "**Canonical app configured:** [path]"
- Proceed to Step 3

**If file is missing:**
- Check for example: `read_file .windsurf/config/senior-developer.example.json`
- Inform user: "No canonical app configured. Please copy `senior-developer.example.json` to `senior-developer.json` and set your canonical app path."
- **STOP** - Cannot proceed without configuration

---

## Step 3: Load CSS Audit Skill

Read the CSS audit skill:

```
read_file .windsurf/skills/css-audit/SKILL.md
```

---

## Step 4: Discovery - Quantify the Problem

Run discovery commands to assess the scope:

// turbo
```bash
# Count inline styles in components
grep -rc "style={{" components/ --include="*.tsx" 2>/dev/null | grep -v ":0$" | sort -t: -k2 -nr || echo "No inline styles in components/"
```

// turbo
```bash
# Count inline styles in pages
grep -rc "style={{" app/ --include="*.tsx" 2>/dev/null | grep -v ":0$" | sort -t: -k2 -nr || echo "No inline styles in app/"
```

// turbo
```bash
# Find empty CSS modules
find . -name "*.module.css" -empty 2>/dev/null || echo "No empty CSS modules"
```

**Present findings to user:**
- Total files with inline styles
- Top offenders by count
- Empty CSS modules to delete

---

## Step 5: Create Audit Tracking Document

Ask user: "Would you like me to create an audit tracking document at `plans/css-audit.md`?"

If yes, create the document with:
- Discovery summary
- Files prioritized by inline style count
- Status tracking table

---

## Step 6: Triage and Prioritize

Categorize findings:

| Priority | Criteria | Action |
|----------|----------|--------|
| **Critical** | >50 inline styles | Fix first |
| **High** | 20-50 inline styles | Phase 1 |
| **Medium** | 10-20 inline styles | Phase 2 |
| **Low** | <10 inline styles | Phase 3 |

Present prioritized list to user and ask: "Which component would you like to start with?"

---

## Step 7: Component Audit Loop

For each component the user selects:

1. **Read the component** to understand current state
2. **Identify pattern types** needed (table, page, form, modal, button)
3. **Load relevant pattern skill(s)**
4. **Read canonical reference** from config
5. **Replace inline styles** with shared CSS classes
6. **Protect imports** from formatter stripping
7. **Verify zero inline styles:**
   ```bash
   grep -n "style={{" <component-path>
   ```
8. **Update tracking document** with completion status

Repeat for each component until all are complete.

---

## Step 8: Module Cleanup

After all components are fixed:

1. **Identify CSS modules with duplicates:**
   ```bash
   grep -l "\.section\s*{" styles/*.module.css components/*.module.css 2>/dev/null
   ```

2. **For each custom module:**
   - Check if classes exist in shared modules
   - Update component to use shared imports
   - Remove duplicated classes
   - Delete module if empty

---

## Step 9: Final Verification

// turbo
```bash
# Must return nothing
grep -rn "style={{" components/ app/ --include="*.tsx"
```

// turbo
```bash
# Build check
npm run build
```

Report to user:
- "**CSS Audit Complete**"
- Total inline styles eliminated
- CSS modules cleaned up
- Build status

---

## Step 10: Documentation

Update the audit tracking document with:
- Completion date
- Summary statistics
- Any new patterns added to shared modules
- Recommendations for preventing future drift
