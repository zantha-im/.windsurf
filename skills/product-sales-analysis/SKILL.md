---
name: product-sales-analysis
description: Use this skill for product sales research and data analysis tasks including market research, sales data analysis, and evidence-based insights for purchasing decisions.
---

# Skill: Product Sales Analysis

This skill provides detailed procedures for the Sales Analyst role.

## Research Workflow

**CRITICAL - Follow this sequence before any recommendation:**

1. **Market demand analysis** - Research sales data, trends, consumer demand
2. **Sourcing feasibility check** - Verify product can actually be sourced (suppliers, availability, pricing)
3. **Final recommendation** - Only after both steps are complete

## Behavioral Rules

**CRITICAL - Follow these rules in order:**

1. **Don't jump to recommendations** - Research and discover data FIRST
2. **Verify sourcing before recommending** - Never recommend a product without confirming it can be sourced
3. **Cite actual sales data** - Not editorial opinions or rankings
4. **Cross-reference multiple sources** - Validate findings across independent data
5. **Be honest about data gaps** - State clearly what data was NOT found
6. **Document confidence levels** - Every claim needs an evidence quality rating (HIGH/MEDIUM/LOW)

## Data Source Hierarchy

| Quality | Sources | Use Case |
|---------|---------|----------|
| **HIGH** | Nielsen/Circana retail POS data, academic studies (PubMed/NIH) | Primary evidence for recommendations |
| **MEDIUM** | E-commerce retailer data (Prilla, Nicokick), industry reports | Supporting evidence, trend indicators |
| **LOW** | Editorial rankings, user polls, Reddit discussions | Directional signals only, never cite as primary |

## Data Source Discovery

### HIGH Quality Sources
1. **Nielsen** - Convenience store and retail sales data
2. **IRI/Circana** - Retail point-of-sale data
3. **PubMed/NIH** - Academic studies on nicotine products

### MEDIUM Quality Sources
1. **Euromonitor** - Market sizing and forecasts
2. **Industry reports** - Tobacco Reporter, ECigIntelligence
3. **E-commerce retailers** - Prilla, Nicokick (sales rankings, pricing)

### LOW Quality Sources (directional only)
1. **Amazon** - Sales rank, reviews, ratings trends
2. **Google Trends** - Search interest by region/time
3. **Reddit/social media** - Consumer sentiment, flavor preferences

### Regulatory Sources
1. **FDA PMTA database** - Product authorization status
2. **State legislation trackers** - State-by-state regulations

## Product Research Procedure

### Step 1: Market Scan
1. Search for new brands/products in US nicotine pouch market
2. Check competitor product lines (Zyn, On!, Velo, Rogue, etc.)
3. Identify gaps in current inventory vs market offerings

### Step 2: Data Gathering
1. Query stock-insights DB for current inventory and sales
2. Search for external sales data on target products
3. Gather pricing data from multiple sources

### Step 3: Analysis
1. Compare market opportunity vs current portfolio
2. Calculate potential margins based on supplier pricing
3. Assess demand signals (search trends, social mentions)

### Step 4: Document Findings
1. Create research summary in `sales-analyst/research/`
2. Include data sources and confidence levels
3. Flag any regulatory considerations

## Analytics Procedure

### Internal Data Analysis
```sql
-- Example: Current inventory performance
SELECT product_name, total_sales, margin_pct, stock_level
FROM inventory
WHERE category = 'nicotine_pouches'
ORDER BY total_sales DESC;
```

Use Neon MCP `mcp1_run_sql` for all database queries.

### Visualization Guidelines
- **Bar charts**: Product comparisons, market share
- **Line charts**: Trends over time, demand forecasting
- **Tables**: Detailed comparisons, pricing matrices

### HTML Report Template
```html
<!DOCTYPE html>
<html>
<head>
  <title>[Report Title]</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .chart-container { width: 100%; max-width: 600px; margin: 20px auto; }
  </style>
</head>
<body>
  <h1>[Report Title]</h1>
  <p><strong>Date:</strong> [Date]</p>
  <p><strong>Prepared by:</strong> Sales Analyst (AI-assisted)</p>
  
  <h2>Executive Summary</h2>
  <p>[Summary]</p>
  
  <h2>Data Analysis</h2>
  <div class="chart-container">
    <canvas id="chart1"></canvas>
  </div>
  
  <h2>Findings</h2>
  <p>[Key findings with supporting evidence]</p>
  
  <h2>Data Sources</h2>
  <ul>
    <li>[Source 1]</li>
    <li>[Source 2]</li>
  </ul>
</body>
</html>
```

## Insight Generation Procedure

### Required Elements
1. **Product identification** - Brand, SKU, specifications
2. **Market opportunity** - Size, growth, demand signals
3. **Financial analysis** - Cost, margin, potential ROI
4. **Competitive landscape** - How this fills a gap
5. **Risk assessment** - Regulatory, supply chain, market risks
6. **Insight summary** - Clear findings with confidence level

### Confidence Levels
- **HIGH**: Multiple corroborating HIGH-quality data sources (Nielsen, Circana, academic studies)
- **MEDIUM**: HIGH-quality source + MEDIUM-quality corroboration, or multiple MEDIUM sources
- **LOW**: Only MEDIUM/LOW sources available, or single uncorroborated source - flag for additional research

## Vendor Research Procedure

### Distributor Catalog

The `distributor_catalog` table in stock-insights DB contains verified distributors and manufacturers. **Always query this first** before web searching for new suppliers.

#### Table Schema

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

#### Common Queries

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

#### Data Quality Ratings

| Rating | Meaning | Action |
|--------|---------|--------|
| **HIGH** | Verified directly with distributor | Use with confidence |
| **MEDIUM** | Data from website/e-commerce | Verify before ordering |
| **LOW** | Unverified or limited info | Research further before use |

#### Distinguishing Distributors vs Manufacturers

- **Distributors**: Resell existing brands (ZYN, VELO, etc.)
- **Manufacturers**: Produce pouches, offer private label/white label

Check the `notes` field — manufacturers contain "MANUFACTURER" keyword.

### Regional Product Availability

**CRITICAL:** Product availability varies by region. The same brand may have different flavors in different markets:

| Region | Example Differences |
|--------|--------------------|
| **US** | ZYN Wintergreen, Coffee, Cinnamon |
| **Sweden/EU** | ZYN Apple Mint, Bellini/Peach, higher strengths (11-20mg) |
| **UK** | Limited ZYN range (~6 flavors), max 6mg typical |

Always verify regional availability before recommending a product.

### Distributor Evaluation
1. Query `distributor_catalog` for suppliers in target region
2. Verify product availability (regional flavor differences)
3. Compare pricing, MOQ, lead times
4. Assess reliability (`data_quality` field, `verified_at` date)
5. Document import/logistics considerations

### Adding New Distributors

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

### Comparison Matrix
| Supplier | Region | Price/Can | Bulk Price | Ships to IoM | Notes |
|----------|--------|-----------|------------|--------------|-------|
| [Name]   | [Region] | €X.XX   | €X.XX      | Yes/No       | [Notes] |

## Price List Integration

### Overview

Distributor price lists enable cross-supplier comparison for sourcing decisions. Price data is stored in normalized tables that link to the `distributor_catalog`.

### Database Schema

#### `canonical_products` - Standardized Product Definitions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `brand` | TEXT | Brand name (ZYN, VELO, Killa, Pablo) |
| `product_name` | TEXT | Flavor/variant name |
| `strength_mg` | NUMERIC | Nicotine strength in mg |
| `format` | TEXT | Pouch format (Slim, Mini, Regular) |
| `pouches_per_can` | INTEGER | Count per can |
| `category` | TEXT | Product category |
| `region_availability` | TEXT[] | Regions where available |

#### `distributor_prices` - SKU-Level Pricing

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `distributor_id` | UUID | FK to `distributor_catalog` |
| `canonical_product_id` | UUID | FK to `canonical_products` (nullable) |
| `distributor_sku` | TEXT | Distributor's SKU code |
| `distributor_product_name` | TEXT | Distributor's product name |
| `unit_price` | NUMERIC | Price per unit |
| `bulk_price` | NUMERIC | Bulk/volume price |
| `bulk_threshold` | INTEGER | Quantity for bulk pricing |
| `currency` | VARCHAR(3) | GBP, EUR, USD |
| `in_stock` | BOOLEAN | Current availability |
| `last_updated` | DATE | When price was captured |
| `source_file` | TEXT | Source document/URL |
| `notes` | TEXT | Additional info (e.g., "excl VAT") |

### Price Comparison Views

```sql
-- v_price_comparison: Full cross-distributor comparison
SELECT * FROM v_price_comparison 
WHERE brand = 'ZYN' ORDER BY unit_price;

-- v_best_prices: Best price per product with distributor
SELECT * FROM v_best_prices;
```

### Price List Extraction Workflow

#### Method 1: PDF Price Lists (Email Attachments)

1. **Retrieve attachment** via orchestrator:
   ```javascript
   const { getEmailAttachments, downloadEmailAttachment } = require('./orchestrator');
   const attachments = await getEmailAttachments(messageId);
   await downloadEmailAttachment(messageId, attachmentId, './price-list.pdf');
   ```

2. **Extract text** using PDF tools:
   ```javascript
   const pdf = require('.windsurf/tools/pdf');
   const text = await pdf.extractTextFromFile('./price-list.pdf');
   ```

3. **Parse and insert** - Create parsing script for specific format, batch insert via Node.js

#### Method 2: Login-Protected Websites (Chrome DevTools MCP)

When distributor websites require login to view prices:

1. **Open site**: `mcp0_new_page` with distributor URL
2. **Navigate to login**: `mcp0_navigate_page` to account page
3. **User signs in** manually in browser
4. **Take snapshot**: `mcp0_take_snapshot` to capture page structure
5. **Extract data**: Parse product names and prices from snapshot
6. **Insert to DB**: Use `mcp1_run_sql` to insert pricing

**Example snapshot parsing:**
```
uid=5_71 link "ZYN APPLE MINT 8MG"
uid=5_75 StaticText "£"
uid=5_76 StaticText "2.55"
uid=5_78 StaticText "excl VAT"
```

#### Method 3: Image-Based Price Lists

When PDFs contain images (poor text extraction):

1. User provides screenshot/image of price list
2. Read image with `read_file` tool (visual capability)
3. Manually extract pricing from visible data
4. Insert to database

### Mapping SKUs to Canonical Products

After inserting raw prices, map to canonical products for comparison:

```sql
-- Map by product name pattern
UPDATE distributor_prices 
SET canonical_product_id = (
  SELECT id FROM canonical_products 
  WHERE brand = 'ZYN' AND product_name = 'Cool Mint' AND strength_mg = 6.0
)
WHERE distributor_product_name ILIKE '%ZYN%Cool Mint%6%';
```

Use `mcp1_run_sql_transaction` for multiple UPDATE statements.

### Currency Considerations

- **GBP**: UK distributors (NicoDistribution, Snus Haven)
- **EUR**: EU/Swedish distributors (Nordicpouch, Swenico)
- **VAT**: Note whether prices include/exclude VAT in `notes` field

For comparison, convert at current rates or compare within same currency.

### Adding Price Data

```sql
INSERT INTO distributor_prices (
  distributor_id, distributor_sku, distributor_product_name,
  unit_price, currency, source_file, notes
) VALUES (
  '<distributor-uuid>', 'sku-code', 'Product Name',
  2.50, 'GBP', 'source-document.pdf', 'excl VAT'
);
```

## Output Checklist

Before finalizing any analysis:
- [ ] Data sources cited with dates and quality ratings (HIGH/MEDIUM/LOW)
- [ ] Confidence level stated for each claim
- [ ] Data gaps explicitly documented (what was NOT found)
- [ ] Multiple sources cross-referenced where possible
- [ ] Regulatory considerations flagged
- [ ] Financial projections included (where applicable)
- [ ] Risks identified
- [ ] Clear findings for human decision-makers (NOT recommendations to act)
