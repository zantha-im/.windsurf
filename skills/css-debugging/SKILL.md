---
name: css-debugging
description: Debugs CSS that isn't applying. Use when styles don't work, CSS modules classes fail, variables are undefined, or specificity issues occur.
---

# Skill: CSS Debugging

Systematic approach to debugging CSS that isn't applying. Use this when you've made CSS changes but they have no visible effect.

---

## When to Use This Skill

- CSS changes don't appear in the browser
- CSS module classes seem to be ignored
- Styles work in dev tools but not in code
- Conditional/dynamic styles aren't applying
- Colors or backgrounds are transparent when they shouldn't be

---

## CRITICAL: The Debugging Checklist

**MANDATORY: Work through this checklist IN ORDER. Do not skip steps.**

```
CSS Debugging Checklist:
- [ ] Step 1: Verify class is in rendered HTML (inspect DOM)
- [ ] Step 2: Verify CSS module exports the class (standalone selector check)
- [ ] Step 3: Verify CSS variables exist (grep theme file)
- [ ] Step 4: Check cascade order (base styles before overrides)
- [ ] Step 5: Check specificity (more specific selectors win)
```

**Stop at the first failure.** Fix that issue before continuing.

---

## Step 1: Verify Class in Rendered HTML

Before debugging CSS, confirm the class is actually being applied.

### How to Check

Ask user to inspect the element and share the HTML, or use Chrome DevTools MCP:

```
mcp0_take_snapshot to see current DOM state
```

### What to Look For

```html
<!-- ✅ GOOD - class is present -->
<div class="components-module__8llB-a__wizardStep components-module__8llB-a__completed">

<!-- ❌ BAD - class is missing -->
<div class="components-module__8llB-a__wizardStep">
```

### If Class is Missing

The issue is in JSX, not CSS. Check:
- Is `styles.completed` defined? (CSS modules may not export it)
- Is the conditional logic correct? (`step > 1` vs `step >= 1`)
- Is there a typo in the class name?

---

## Step 2: CSS Modules Class Export Rule

**This is the most common cause of CSS debugging failures.**

### The Rule

CSS modules only export class names defined as **standalone selectors**.

```css
/* ❌ DOES NOT EXPORT `completed` */
.wizardStep.completed {
  color: green;
}

/* ✅ EXPORTS `completed` as usable class */
.completed {
  color: green;
}
```

### Why This Matters

When you write `.wizardStep.completed`, CSS modules sees this as a compound selector. It doesn't create a separate export for `completed`. So `styles.completed` is `undefined`.

### How to Verify

Search for standalone class definition:

```
grep_search with Query="^\.completed" and SearchPath="styles/" and Includes=["*.module.css"]
```

If no results, the class isn't exported.

### The Fix

Change compound selectors to standalone + descendant:

```css
/* ❌ Before - compound selector */
.wizardStep.completed .stepNumber {
  background: green;
}

/* ✅ After - standalone selector with descendant */
.completed .stepNumber {
  background: green;
}
```

---

## Step 3: CSS Variable Existence

**CSS variables fail silently.** Using `var(--undefined)` results in transparent/nothing, not an error.

### How to Verify

Search for the variable definition:

```
grep_search with Query="--success:" and SearchPath="styles/" and Includes=["*.css"]
```

### Common Pitfalls

| You Used          | Actually Defined | Fix                          |
| ----------------- | ---------------- | ---------------------------- |
| `var(--success)`  | `--btn-success`  | Use `var(--btn-success)`     |
| `var(--error)`    | `--text-error`   | Use `var(--text-error)`      |
| `var(--primary)`  | Not defined      | Add to theme.css             |

### The Fix

Either use the correct variable name, or add the missing variable to theme.css:

```css
:root {
  --success: #22c55e;
}
```

---

## Step 4: CSS Cascade Order

**Later rules override earlier rules at equal specificity.**

### The Problem

```css
/* Line 100 - your override */
.completed .stepNumber {
  background: green;
}

/* Line 200 - base styles (WINS because it's later) */
.stepNumber {
  background: grey;
}
```

### How to Verify

Check line numbers of both rules:

```
grep_search with Query=".stepNumber" and SearchPath="styles/components.module.css" and MatchPerLine=true
```

### The Fix

Move base styles BEFORE overrides:

```css
/* Base styles first */
.stepNumber {
  background: grey;
}

/* Overrides after */
.completed .stepNumber {
  background: green;
}
```

---

## Step 5: CSS Specificity

**More specific selectors always win, regardless of order.**

### Specificity Hierarchy (highest to lowest)

1. `!important` (avoid)
2. Inline styles (`style={{}}`)
3. ID selectors (`#id`)
4. Class selectors (`.class`)
5. Element selectors (`div`)

### How to Check

Use browser dev tools:
1. Inspect the element
2. Look at "Computed" styles
3. See which rule is winning and why

### Common Fixes

| Problem                          | Solution                                    |
| -------------------------------- | ------------------------------------------- |
| Inline style overriding class    | Remove inline style                         |
| More specific selector winning   | Increase your selector's specificity        |
| `!important` blocking your style | Remove the `!important` or add your own     |

---

## Quick Reference: Debugging Decision Tree

```
CSS not applying?
│
├─ Class missing in HTML?
│  └─ Fix JSX (styles.foo undefined, wrong conditional)
│
├─ Class present but no effect?
│  ├─ CSS module compound selector issue?
│  │  └─ Change to standalone selector
│  │
│  ├─ CSS variable undefined?
│  │  └─ Add to theme.css or use correct name
│  │
│  ├─ Cascade order wrong?
│  │  └─ Move base styles before overrides
│  │
│  └─ Specificity issue?
│     └─ Increase specificity or remove competing rule
│
└─ Still not working?
   └─ Hard refresh (Ctrl+Shift+R), restart dev server
```

---

## Anti-Patterns

### 1. Tweaking Without Tracing

❌ **Bad:** Keep adjusting CSS values hoping something works
✅ **Good:** Trace the full path from JSX → class → CSS rule → variable

### 2. Assuming Variables Exist

❌ **Bad:** Use `var(--success)` without checking
✅ **Good:** Grep theme file first to confirm variable exists

### 3. Compound Selectors in CSS Modules

❌ **Bad:** `.parent.modifier { }` — modifier won't be exported
✅ **Good:** `.modifier { }` as standalone, then `.modifier .child { }`

### 4. Ignoring Rendered HTML

❌ **Bad:** Debug CSS when the class isn't even in the DOM
✅ **Good:** Always verify class appears in rendered HTML first

---

## Related Skills

- `@css-audit` - Proactive CSS architecture review and consolidation
- `@button-patterns` / `@table-patterns` / etc. - Canonical UI patterns
