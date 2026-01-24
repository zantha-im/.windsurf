# Workflow Template

Use this template when creating a new activation workflow.

Create: `.windsurf/workflows/[role-name].md`

```markdown
---
description: Activate [Role Name] role for [brief purpose]
---

# [Role Name] Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/[domain|generic]/[role-name].md`

This is a **[domain|generic] role**. [Additional context if needed]

## Step 2: Invoke Skill
Use `@[skill-name]` to load detailed procedures for [what the skill covers].

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

## Step 4: Discover Orchestrator
**If an orchestrator exists** at `roles/[role-name]/orchestrator.js`, run discovery to load available commands and capabilities.

// turbo
Run the orchestrator discovery command:
\`\`\`bash
node roles/[role-name]/orchestrator.js
\`\`\`

If no orchestrator exists, use the role definition, skill procedures, and shared tools directly.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: [Role Name]
- Orchestrator: [found/not found]
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Ask: "[Relevant question for this role]"
```
