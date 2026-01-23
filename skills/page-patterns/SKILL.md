---
name: page-patterns
description: Enforces consistent page layout patterns using shared CSS modules. Use when creating new pages, building page scaffolds, adding sections, tabs, or refactoring page layouts. Triggers on: new page, create page, page layout, page scaffold, page structure, add section, page container, page header, tabs, refactor page.
---

# Skill: Page Patterns

This skill ensures consistent page layout implementation using shared CSS modules and established patterns.

---

## CRITICAL: Shared Modules First

**Before creating ANY page CSS, search shared modules for existing classes.**

Pages use THREE CSS modules:
1. **Pages module** - Container, header, content structure
2. **Components module** - Sections, filters, stats, states, tabs
3. **Buttons module** - Action buttons in headers

---

## Config Discovery

Read the configuration file to find the canonical reference app:

```
.windsurf/config/senior-developer.json
```

This contains `canonicalApp.path` pointing to the reference application with proven patterns.

**If config missing:** Check for `.windsurf/config/senior-developer.example.json` and inform user to copy and configure it.

---

## Workflow

```
Page Patterns Checklist:
- [ ] Step 0: Read config to get canonical app path
- [ ] Step 1: Read pages.module.css from canonical app
- [ ] Step 2: Read components.module.css for sections/filters/tabs
- [ ] Step 3: Read canonical page example
- [ ] Step 4: Apply page scaffold pattern
- [ ] Step 5: Apply tab pattern (if needed)
- [ ] Step 6: Apply filter/stats patterns (if needed)
- [ ] Step 7: Verify zero inline styles
- [ ] Step 8: Protect imports from formatter
```

---

## Canonical Page Structure

```tsx
'use client'

import pageStyles from '@/styles/pages.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'
import * as Icons from 'lucide-react'

// Protect imports from formatter
const _styles = styles
const _btnStyles = btnStyles

export default function MyPage() {
  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.header}>
        <h1 className={styles.pageTitle}>
          <Icons.LayoutGrid size={24} />
          Page Title
        </h1>
        <div className={styles.headerActions}>
          <button className={btnStyles.btnPrimary}>Action</button>
        </div>
      </div>
      <div className={pageStyles.content}>
        {/* Tabs go directly here - NO wrapper divs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.tabActive}`}>Tab 1</button>
          <button className={styles.tab}>Tab 2</button>
        </div>
        {/* Tab content */}
      </div>
    </div>
  )
}
```

---

## CRITICAL: No Inline Styles

**Inline styles are BANNED.** Even conditional values must use classes.

---

## Page Title with Icon

All h1 elements with icons must use `.pageTitle` for proper flex alignment:

```tsx
<h1 className={styles.pageTitle}>
  <Icons.ShoppingCart size={24} />
  Page Title
</h1>
```

---

## Tabs Pattern

Tabs go **directly inside** `pageStyles.content` - NO wrapper divs:

```tsx
<div className={pageStyles.content}>
  {/* Tabs directly in content */}
  <div className={styles.tabs}>
    <button 
      className={`${styles.tab} ${activeTab === 'generator' ? styles.tabActive : ''}`}
      onClick={() => setActiveTab('generator')}
    >
      Generator
    </button>
    <button 
      className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
      onClick={() => setActiveTab('history')}
    >
      History
    </button>
  </div>
  
  {/* Tab content */}
  {activeTab === 'generator' && <GeneratorContent />}
  {activeTab === 'history' && <HistoryContent />}
</div>
```

**Anti-patterns to avoid:**
- ❌ `tabsContainer` wrapper div
- ❌ `settingsContainer` / `settingsHeader` - use `pageStyles.container` / `pageStyles.header`
- ❌ `settingsDivider` - creates double-line effect

---

## Filter Controls Pattern

Filter controls belong in a **section** with `filtersContainer`:

```tsx
<section className={styles.section}>
  <div className={styles.filtersContainer}>
    <div className={styles.filterGroup}>
      <label className={styles.label}>Supplier</label>
      <select className={styles.select} value={supplier} onChange={...}>
        <option value="">All Suppliers</option>
      </select>
    </div>
    <div className={styles.filterGroup}>
      <label className={styles.label}>Date From</label>
      <input type="date" className={styles.dateInput} value={dateFrom} onChange={...} />
    </div>
    <div className={styles.filterGroup}>
      <label className={styles.label}>Budget</label>
      <input type="number" className={`${styles.input} ${styles.inputBudget}`} value={budget} onChange={...} />
    </div>
  </div>
</section>
```

**Pattern:** `section > filtersContainer > filterGroup > label + input/select`

---

## Info Row Pattern

Info rows show item counts and metadata between filters and tables:

```tsx
<div className={styles.infoRow}>
  <div>
    <strong>{items.length}</strong> Items
  </div>
  <span className={styles.textMuted}>
    Last updated: {formatDate(lastUpdated)}
  </span>
</div>
```

**Rules:**
- No icons in info rows
- Use `<strong>` for counts
- Optional muted date/metadata on right

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
  <div className={styles.statCard}>
    <span className={styles.statLabel}>Pending</span>
    <span className={styles.statValueWarning}>23</span>
  </div>
</div>
```

**Value color variants:**
| Class | Color | Use Case |
|-------|-------|----------|
| `styles.statValue` | Default | Neutral values |
| `styles.statValueSuccess` | Green | Positive metrics |
| `styles.statValueWarning` | Yellow | Caution metrics |
| `styles.statValueError` | Red | Negative metrics |
| `styles.statValuePrimary` | Blue | Highlighted metrics |

---

## Section Cards

```tsx
// Section with padding (for content that needs it)
<section className={styles.section}>
  <h2>Section Title</h2>
  {/* Content */}
</section>

// Section without padding (for tables that handle their own padding)
<section className={styles.sectionNoPadding}>
  <TableComponent />
</section>
```

---

## State Handling

```tsx
// Loading
if (loading) return <div className={styles.loading}>Loading...</div>

// Error
if (error) return <div className={styles.errorAlert}>{error}</div>

// Empty
if (!data) return <div className={styles.emptyState}>No data available</div>

// Access denied
if (!authorized) return <div className={styles.accessDenied}>Access Denied</div>
```

---

## Import Protection

The formatter strips unused imports. Protect them immediately:

```tsx
import pageStyles from '@/styles/pages.module.css'
import styles from '@/styles/components.module.css'
import btnStyles from '@/styles/buttons.module.css'

// Protect from formatter
const _pageStyles = pageStyles
const _styles = styles
const _btnStyles = btnStyles
```

---

## Validation Checklist

Before completing the page implementation:

- [ ] Zero inline styles (`grep -n "style={{" <file>` returns nothing)
- [ ] Uses canonical page scaffold (container → header → content)
- [ ] Page title with icon uses `styles.pageTitle`
- [ ] Tabs go directly in content (no wrapper divs)
- [ ] Filters use `section > filtersContainer > filterGroup` pattern
- [ ] Stats use `statsContainer > statCard` with appropriate value colors
- [ ] Loading/empty/error states use shared classes
- [ ] Imports are protected from formatter
- [ ] No custom CSS duplicating shared patterns (check for duplicates before creating)
