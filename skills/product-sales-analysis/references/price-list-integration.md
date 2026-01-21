# Price List Integration Reference

## Overview

Distributor price lists enable cross-supplier comparison for sourcing decisions. Price data is stored in normalized tables that link to the `distributor_catalog`.

## Database Schema

### `canonical_products` - Standardized Product Definitions

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

### `distributor_prices` - SKU-Level Pricing

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

## Price Comparison Views

```sql
-- v_price_comparison: Full cross-distributor comparison
SELECT * FROM v_price_comparison 
WHERE brand = 'ZYN' ORDER BY unit_price;

-- v_best_prices: Best price per product with distributor
SELECT * FROM v_best_prices;
```

## Price List Extraction Workflow

### Method 1: PDF Price Lists (Email Attachments)

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

### Method 2: Login-Protected Websites (Chrome DevTools MCP)

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

### Method 3: Image-Based Price Lists

When PDFs contain images (poor text extraction):

1. User provides screenshot/image of price list
2. Read image with `read_file` tool (visual capability)
3. Manually extract pricing from visible data
4. Insert to database

## Mapping SKUs to Canonical Products

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

## Currency Considerations

- **GBP**: UK distributors (NicoDistribution, Snus Haven)
- **EUR**: EU/Swedish distributors (Nordicpouch, Swenico)
- **VAT**: Note whether prices include/exclude VAT in `notes` field

For comparison, convert at current rates or compare within same currency.

## Adding Price Data

```sql
INSERT INTO distributor_prices (
  distributor_id, distributor_sku, distributor_product_name,
  unit_price, currency, source_file, notes
) VALUES (
  '<distributor-uuid>', 'sku-code', 'Product Name',
  2.50, 'GBP', 'source-document.pdf', 'excl VAT'
);
```
