---
name: product-sales-analysis
description: Analyzes product market data and distributor pricing. Use when researching products to stock, comparing supplier prices, analyzing sales trends, or preparing purchase recommendations.
---

# Skill: Product Sales Analysis

Detailed procedures for the Sales Analyst role. Domain: nicotine pouches, US market, UK/EU distributors.

---

## CRITICAL: Output Location

**All research files MUST be saved to the consuming project's role folder, NOT the `.windsurf/` subtree.**

The path is `roles/sales-analyst/` (inside the `roles/` directory), NOT `sales-analyst/` at project root.

```
[project-root]/
├── roles/
│   └── sales-analyst/         # ← OUTPUT GOES HERE
│       ├── orchestrator.js    # Project-specific orchestrator
│       ├── research/          # Market research documents
│       ├── analysis/          # Data analysis reports
│       └── recommendations/   # Purchase recommendations
├── .windsurf/                 # Subtree - DO NOT write here
└── sales-analyst/             # ← WRONG! Do not create at root
```

**Before writing any file:** Verify the `roles/sales-analyst/` directory exists. If not, create it.

## Research Workflow

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Step 1: Market demand analysis (sales data, trends, consumer demand)
- [ ] Step 2: Sourcing feasibility check (suppliers, availability, pricing)
- [ ] Step 3: Cross-reference multiple sources
- [ ] Step 4: Document confidence levels (HIGH/MEDIUM/LOW)
- [ ] Step 5: Final recommendation (only after steps 1-4 complete)
```

**CRITICAL:** Never skip Step 2. Never recommend a product without confirming it can be sourced.

## Behavioral Rules

1. **Don't jump to recommendations** - Research and discover data FIRST
2. **Verify sourcing before recommending** - Query distributor catalog before web search
3. **Cite actual sales data** - Not editorial opinions or rankings
4. **Cross-reference multiple sources** - Validate findings across independent data
5. **Be honest about data gaps** - State clearly what data was NOT found
6. **Document confidence levels** - Every claim needs HIGH/MEDIUM/LOW rating

## Quick Reference

| Topic                                | Reference File                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Data source hierarchy                | [references/data-sources.md](references/data-sources.md)                     |
| Distributor catalog schema & queries | [references/distributor-catalog.md](references/distributor-catalog.md)       |
| Price list extraction workflows      | [references/price-list-integration.md](references/price-list-integration.md) |
| HTML report template                 | [assets/report-template.html](assets/report-template.html)                   |

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
1. Create research summary in `roles/sales-analyst/research/`
2. Include data sources and confidence levels
3. Flag any regulatory considerations

## Distributor Research

**Always query `distributor_catalog` first** before web searching for new suppliers.

See [references/distributor-catalog.md](references/distributor-catalog.md) for:
- Full table schema
- Common queries (by region, brand, wholesale availability)
- Adding new distributors
- Regional product availability differences

## Analytics & Visualization

Use Neon MCP `mcp1_run_sql` for all database queries.

**Visualization types:**
- **Bar charts**: Product comparisons, market share
- **Line charts**: Trends over time, demand forecasting
- **Tables**: Detailed comparisons, pricing matrices

See [assets/report-template.html](assets/report-template.html) for the standard HTML report format.

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
