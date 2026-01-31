---
trigger: model_decision
description: Shopify data caching protocol. Use delta detection with collection hashes to avoid redundant API calls. Check on startup if data has changed, only refresh if needed.
---

# Shopify Data Caching Protocol

**Tags:** #shopify #caching #performance #api

## When this rule applies
- Any task involving Shopify data retrieval (products, orders, customers, collections, etc.)
- Startup/initialization of Shopify-related analysis
- Repeated queries within a session

---

## Core Principle: Delta Detection

**Do NOT fetch full datasets on every request.** Use collection hashes to detect changes and only refresh when needed.

---

## Startup Check Pattern

Before fetching any Shopify collection:

1. **Check for cached hash** - Look for `[collection]-hash.json` in cache location
2. **Fetch current hash** - Use lightweight API call to get collection count/updated_at
3. **Compare hashes** - If unchanged, use cached data
4. **Refresh if needed** - Only fetch full dataset when hash differs

```
Startup Check:
├── Cache exists?
│   ├── No → Fetch full dataset, store hash
│   └── Yes → Compare hash
│       ├── Hash matches → Use cached data
│       └── Hash differs → Refresh dataset, update hash
```

---

## Hash Generation Strategy

| Collection | Hash Components |
|------------|-----------------|
| **Products** | `count + max(updated_at)` |
| **Orders** | `count + max(updated_at) + date_range` |
| **Customers** | `count + max(updated_at)` |
| **Collections** | `count + max(updated_at)` |
| **Inventory** | `sum(quantities) + max(updated_at)` |

### Example Hash File

Save to project's cache location (e.g., `roles/[role-name]/cache/products-hash.json`):

```json
{
  "collection": "products",
  "hash": "1547_2026-01-30T15:42:00Z",
  "generated_at": "2026-01-30T21:00:00Z",
  "record_count": 1547,
  "last_updated": "2026-01-30T15:42:00Z"
}
```

---

## Implementation with Shopify MCP

### Step 1: Get Collection Metadata (Lightweight)

```
# For products - use limit=1 to get count efficiently
mcp3_listProducts with limit=1
→ Extract: pageInfo.hasNextPage, first item's updatedAt
```

### Step 2: Compare with Cached Hash

```python
# Pseudocode
cached = read_json("products-hash.json")
current_hash = f"{count}_{max_updated_at}"

if cached["hash"] == current_hash:
    print("Using cached data - no changes detected")
    return load_cached_data()
else:
    print(f"Changes detected - refreshing ({cached['hash']} → {current_hash})")
    return fetch_and_cache_full_dataset()
```

### Step 3: Cache Full Dataset (When Needed)

```
# Only when hash differs
mcp3_listProducts with limit=250 (paginate as needed)
→ Save to roles/[role-name]/cache/products.json
→ Update products-hash.json
```

---

## Session Behavior

| Scenario | Action |
|----------|--------|
| **First query in session** | Run startup check |
| **Subsequent queries (same collection)** | Use in-memory/cached data |
| **User requests "refresh"** | Force full fetch, update hash |
| **Different collection** | Run startup check for that collection |

---

## Cache Location

**Domain roles:** `[project-root]/roles/[role-name]/cache/`
**Generic roles:** `[project-root]/.cache/shopify/`

Create cache directory if it doesn't exist before writing.

---

## Reporting to User

When using cached data, inform the user:

```
Using cached product data (1,547 products, last synced 2 hours ago).
Hash unchanged - no new updates detected.
To force refresh, say "refresh products".
```

When refreshing:

```
Detected 12 new/updated products since last sync.
Refreshing dataset... Done (1,559 products cached).
```

---

## Constraints

- **Never fetch full datasets repeatedly** - Always check hash first
- **Respect rate limits** - Shopify API has call limits; caching reduces risk
- **Cache expiry** - Consider data stale after 24 hours regardless of hash
- **User override** - Always allow explicit "refresh" command to bypass cache
