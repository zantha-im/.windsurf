---
name: product-sales-analysis
description: Use this skill for product sales research and data analysis tasks including market research, sales data analysis, and evidence-based insights for purchasing decisions.
---

# Skill: Product Sales Analysis

This skill provides detailed procedures for the Sales Analyst role.

## Data Source Discovery

### Reputable Sales Data Sources
1. **Nielsen** - Convenience store and retail sales data
2. **IRI/Circana** - Retail point-of-sale data
3. **Euromonitor** - Market sizing and forecasts
4. **Industry reports** - Tobacco Reporter, ECigIntelligence

### Online Market Signals
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
- **High**: Multiple corroborating data sources, strong market signals
- **Medium**: Limited data but consistent indicators
- **Low**: Sparse data, speculative - flag for additional research

## Vendor Research Procedure

### UK Distributor Evaluation
1. Identify potential UK-based suppliers
2. Request pricing, MOQ, lead times
3. Assess reliability (reviews, references)
4. Document import/logistics considerations

### Comparison Matrix
| Supplier | Price/Unit | MOQ | Lead Time | Notes |
|----------|------------|-----|-----------|-------|
| [Name]   | £X.XX      | X   | X weeks   | [Notes] |

## Output Checklist

Before finalizing any analysis:
- [ ] Data sources cited with dates
- [ ] Confidence level stated
- [ ] Regulatory considerations flagged
- [ ] Financial projections included (where applicable)
- [ ] Risks identified
- [ ] Clear findings for human decision-makers
