# Distributor Catalog Reference

The `distributor_catalog` table in stock-insights DB contains verified distributors and manufacturers. **Always query this first** before web searching for new suppliers.

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Distributor/manufacturer name |
| `code` | TEXT | Short code (e.g., SNUSDADDY) |
| `website` | TEXT | Primary website URL |
| `region` | TEXT | Geographic region: UK, EU, Sweden, Denmark, Finland, etc. |
| `country_code` | VARCHAR(2) | ISO country code (SE, GB, DK, etc.) |
| `ships_to_iom` | BOOLEAN | Can ship to Isle of Man |
| `ships_to_uk` | BOOLEAN | Can ship to UK |
| `wholesale_available` | BOOLEAN | Offers B2B/wholesale pricing |
| `brands_carried` | TEXT[] | Array of brand names (query with `ANY()`) |
| `product_categories` | TEXT[] | Array: nicotine_pouches, snus, vapes, etc. |
| `price_per_can_min` | NUMERIC | Minimum price per can (EUR) |
| `price_per_can_max` | NUMERIC | Maximum price per can (EUR) |
| `bulk_discount_threshold` | INTEGER | Quantity for bulk pricing |
| `bulk_price_per_can` | NUMERIC | Bulk discounted price |
| `data_quality` | TEXT | Research confidence: HIGH, MEDIUM, LOW |
| `verified_at` | TIMESTAMPTZ | When data was last verified |
| `notes` | TEXT | Additional info (contains "MANUFACTURER" for factories) |
| `source_url` | TEXT | Where data was sourced from |

## Common Queries

```sql
-- Find all distributors that ship to Isle of Man
SELECT name, website, region, price_per_can_min, brands_carried
FROM distributor_catalog
WHERE ships_to_iom = true 
  AND region IN ('UK', 'EU', 'Sweden')
ORDER BY price_per_can_min;

-- Find distributors carrying a specific brand
SELECT name, website, price_per_can_min, bulk_price_per_can
FROM distributor_catalog
WHERE 'ZYN' = ANY(brands_carried)
  AND ships_to_iom = true;

-- Find MANUFACTURERS (for private label/white label)
SELECT name, website, region, notes
FROM distributor_catalog
WHERE notes LIKE '%MANUFACTURER%';

-- Find wholesale-only suppliers
SELECT name, website, region, data_quality
FROM distributor_catalog
WHERE wholesale_available = true
ORDER BY region, name;

-- Summary by region
SELECT region, COUNT(*) as total,
  COUNT(*) FILTER (WHERE wholesale_available) as wholesale,
  COUNT(*) FILTER (WHERE notes LIKE '%MANUFACTURER%') as manufacturers
FROM distributor_catalog
GROUP BY region ORDER BY total DESC;
```

## Data Quality Ratings

| Rating | Meaning | Action |
|--------|---------|--------|
| **HIGH** | Verified directly with distributor | Use with confidence |
| **MEDIUM** | Data from website/e-commerce | Verify before ordering |
| **LOW** | Unverified or limited info | Research further before use |

## Distinguishing Distributors vs Manufacturers

- **Distributors**: Resell existing brands (ZYN, VELO, etc.)
- **Manufacturers**: Produce pouches, offer private label/white label

Check the `notes` field — manufacturers contain "MANUFACTURER" keyword.

## Regional Product Availability

**CRITICAL:** Product availability varies by region. The same brand may have different flavors in different markets:

| Region | Example Differences |
|--------|--------------------|
| **US** | ZYN Wintergreen, Coffee, Cinnamon |
| **Sweden/EU** | ZYN Apple Mint, Bellini/Peach, higher strengths (11-20mg) |
| **UK** | Limited ZYN range (~6 flavors), max 6mg typical |

Always verify regional availability before recommending a product.

## Adding New Distributors

When discovering new distributors via web research, add them to the catalog:

```sql
INSERT INTO distributor_catalog (
  name, code, website, region, country_code,
  ships_to_iom, ships_to_uk, wholesale_available,
  brands_carried, product_categories,
  verified_at, data_quality, notes, source_url
) VALUES (
  'Distributor Name', 'CODE', 'https://example.com', 'Sweden', 'SE',
  true, true, true,
  ARRAY['ZYN', 'VELO'], ARRAY['nicotine_pouches'],
  NOW(), 'MEDIUM', 'Notes about this distributor', 'https://source-url.com'
);
```
