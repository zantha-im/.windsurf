---
description: Activate Legal Researcher role for investigations and evidence gathering
---

# Legal Researcher Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/domain/legal-researcher.md`

This is a **domain role** with project-specific output paths. Check the `home_project` and `output_paths` in the frontmatter.

## Step 2: Load Skill
Invoke the `investigation-protocols` skill to load detailed procedures.

## Step 3: Discover Tools
Read the tool documentation:
- `/.windsurf/tools/README.md` - Available tool modules and API reference
- `/.windsurf/rules/tool-extension.md` - Patterns for creating project-specific tools

## Step 4: Discover Orchestrator
**If an orchestrator exists** at `roles/legal-researcher/orchestrator.js`, run discovery:
```bash
node roles/legal-researcher/orchestrator.js
```

The orchestrator handles project-specific setup:
- Database state and context loading
- Investigation folder structure
- Available commands

If no orchestrator exists, use the role definition, skill procedures, and shared tools directly.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: Legal Researcher
- Orchestrator: [found/not found]
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Ask: "Which investigation should we focus on?"
