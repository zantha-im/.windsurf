---
description: Activate Sales Analyst role for data-driven product sales analysis
---

# Sales Analyst Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/domain/sales-analyst.md`

This is a **domain role** with project-specific output paths. Check the `home_project` and `output_paths` in the frontmatter.

## Step 2: Invoke Skill
Use `@product-sales-analysis` to load detailed procedures for market research, supplier comparison, and sales analysis.

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

For creating new tools, use `@tool-development` skill.

## Step 4: Discover Orchestrator
**If an orchestrator exists** at `roles/sales-analyst/orchestrator.js`, run discovery to load available commands and capabilities.

// turbo
```bash
node roles/sales-analyst/orchestrator.js
```

The orchestrator handles project-specific setup:
- Database state and context loading
- Available commands

If no orchestrator exists, use the role definition, skill procedures, and shared tools directly.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId (stock-insights).

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: Sales Analyst
- Orchestrator: [found/not found]
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Domain: Nicotine pouches, US market, UK distributors
- Ask: "What product or market research can I help with?"
