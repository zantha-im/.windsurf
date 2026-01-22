---
name: page-patterns
description: Enforces consistent page layout patterns by reading from the canonical app. Use when creating new pages, building page scaffolds, adding sections, or refactoring page layouts. Triggers on: new page, create page, page layout, page scaffold, page structure, add section, page container, page header.
---

# Skill: Page Patterns

This skill ensures consistent page layout implementation by reading patterns from the canonical reference app.

**Canonical App:** `C:\Users\Jonny\Code\stock-insights`

---

## CRITICAL: Discovery Before Implementation

**You MUST use `read_file` to read the canonical files below. Do NOT rely on memory or cached knowledge of these files.**

Before building any page, execute this discovery workflow:

---

## Workflow

```
Page Patterns Checklist:
- [ ] Step 1: Read pages.module.css from canonical app
- [ ] Step 2: Read components.module.css for section/filter patterns
- [ ] Step 3: Read an example page from canonical app
- [ ] Step 4: Extract page scaffold pattern (container/header/content)
- [ ] Step 5: Extract section card pattern
- [ ] Step 6: Extract filter/stats patterns (if applicable)
- [ ] Step 7: Apply patterns to current project
- [ ] Step 8: Verify imports match canonical conventions
```

---

## Step 1: Read Pages CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\styles\pages.module.css
```

Extract:
- `.container` - Page container (max-width)
- `.header` - Page header with title
- `.content` - Main content area
- `.error` - Error banner
- `.tableContainer` - Table wrapper

---

## Step 2: Read Components CSS

**MANDATORY: Use read_file tool with this exact path:**

```
C:\Users\Jonny\Code\stock-insights\styles\components.module.css
```

Extract:
- Section classes (`.section`, `.sectionNoPadding`)
- Filter classes (`.filtersContainer`, `.filterGroup`)
- Stats classes (`.statsContainer`, `.statCard`, `.statLabel`, `.statValue`)
- State classes (`.loading`, `.emptyState`, `.errorAlert`)
- Header actions (`.headerActions`)

---

## Step 3: Read Example Page

**MANDATORY: Use read_file tool with one of these paths:**

For a page with filters and table:
```
C:\Users\Jonny\Code\stock-insights\app\(main)\orders\page.tsx
```

For a simpler page layout:
```
C:\Users\Jonny\Code\stock-insights\app\(main)\dashboard\page.tsx
```

---

## Canonical Page Structure

After reading the files, apply this structure:

```tsx
import pageStyles from '@/styles/pages.module.css';
import styles from '@/styles/components.module.css';

export default function MyPage() {
  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.header}>
        <h1>Page Title</h1>
        <div className={styles.headerActions}>
          {/* Optional: action buttons */}
        </div>
      </div>
      <div className={pageStyles.content}>
        {/* Page content - sections, tables, etc. */}
      </div>
    </div>
  );
}
```

---

## Section Cards

Group related content into card sections:

```tsx
// Default section with padding
<div className={styles.section}>
  <h2>Section Title</h2>
  {/* Content */}
</div>

// Section where inner component handles padding
<div className={styles.sectionNoPadding}>
  <TableComponent />
</div>
```

---

## Filters Pattern

```tsx
<div className={styles.filtersContainer}>
  <div className={styles.filterGroup}>
    <label className={styles.label}>Filter Label</label>
    <select className={styles.select}>
      <option>Option 1</option>
    </select>
  </div>
  <div className={styles.filterGroup}>
    <label className={styles.label}>Date</label>
    <input type="date" className={styles.dateInput} />
  </div>
</div>
```

---

## Stats/KPI Cards

```tsx
<div className={styles.statsContainer}>
  <div className={styles.statCard}>
    <span className={styles.statLabel}>Total Orders</span>
    <span className={styles.statValue}>1,234</span>
  </div>
  <div className={styles.statCard}>
    <span className={styles.statLabel}>Revenue</span>
    <span className={styles.statValueSuccess}>£45,678</span>
  </div>
</div>
```

**Value color variants:**
- `styles.statValue` - Default
- `styles.statValueSuccess` - Green (positive)
- `styles.statValueWarning` - Yellow (caution)
- `styles.statValueError` - Red (negative)
- `styles.statValuePrimary` - Blue (highlight)

---

## State Handling

```tsx
// Loading
if (loading) return <div className={styles.loading}>Loading...</div>;

// Error
if (error) return <div className={styles.errorAlert}>{error}</div>;

// Empty
if (!data) return <div className={styles.emptyState}>No data available</div>;

// Access denied
if (!authorized) return <div className={styles.accessDenied}>Access Denied</div>;
```

---

## Import Conventions

Always use these import aliases for consistency:

```tsx
import pageStyles from '@/styles/pages.module.css';
import styles from '@/styles/components.module.css';
import btnStyles from '@/styles/buttons.module.css';  // If page has buttons
```

---

## Validation Checklist

Before completing the page implementation, verify:

- [ ] Uses canonical page scaffold (container → header → content)
- [ ] Sections use `styles.section` or `styles.sectionNoPadding`
- [ ] Filters use `styles.filtersContainer` and `styles.filterGroup`
- [ ] Stats use `styles.statsContainer` and `styles.statCard`
- [ ] Loading/empty/error states use shared classes
- [ ] Imports use standard aliases
- [ ] No custom CSS duplicating shared patterns
