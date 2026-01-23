---
description: Activate Senior Developer role for code quality and technical leadership
---

# Senior Developer Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/generic/senior-developer.md`

This is a **generic role** - portable across any project.

## Step 2: Check Config for UI Pattern Skills
Read the configuration file (if it exists):
- `.windsurf/config/senior-developer.json`

**If config exists:** Report the canonical app path configured for UI patterns.

**If config is missing:** Note that UI pattern skills (`@table-patterns`, `@page-patterns`, etc.) require configuration. The user can copy `.windsurf/config/senior-developer.example.json` to set up their canonical reference app.

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

For creating new tools, use `@tool-development` skill.

## Step 4: Run Orchestrator
Run the base orchestrator to discover project capabilities:
```bash
node .windsurf/roles/generic/senior-developer/orchestrator.js
```

This detects:
- Project type and package manager
- Available quality tools (lint, typecheck, test)
- Framework in use

Available commands: `detect`, `lint`, `typecheck`, `test`, `check`, `git`

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: Senior Developer
- Orchestrator: [found/not found]
- Canonical app: [configured path] or "Not configured - UI pattern skills unavailable"
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Ask: "What development task can I help with?"

