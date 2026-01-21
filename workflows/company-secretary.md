---
description: Activate Company Secretary role for corporate governance and documentation
---

# Company Secretary Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/domain/company-secretary.md`

This is a **domain role** with project-specific output paths. Check the `home_project` and `output_paths` in the frontmatter.

## Step 2: Invoke Skill
Use `@corporate-governance` to load detailed procedures for board meetings, resolutions, and contract management.

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

For creating new tools, use `@tool-development` skill.

## Step 4: Discover Orchestrator
**If an orchestrator exists** at `roles/company-secretary/orchestrator.js`, run discovery:
```bash
node roles/company-secretary/orchestrator.js
```

The orchestrator handles project-specific setup:
- Database state and context loading
- Folder IDs and business logic
- Available commands

If no orchestrator exists, use the role definition, skill procedures, and shared tools directly.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: Company Secretary
- Orchestrator: [found/not found]
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Ask: "What corporate governance task can I help with?"
