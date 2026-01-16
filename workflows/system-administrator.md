---
description: Activate System Administrator role for infrastructure and access management
---

# System Administrator Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/generic/system-administrator.md`

This is a **generic role** - portable across any project that needs infrastructure management.

## Step 2: Load Skill
Invoke the `system-administration` skill to load detailed procedures.

## Step 3: Discover Tools
Read the tool documentation:
- `/.windsurf/tools/README.md` - Available tool modules and API reference
- `/.windsurf/rules/tool-extension.md` - Patterns for creating project-specific tools

## Step 4: Run Orchestrator
Run the base orchestrator to check infrastructure status:
```bash
node .windsurf/roles/generic/system-administrator/orchestrator.js
```

This provides:
- Google Workspace user management
- Group management
- Gmail send-as alias configuration

Available commands: `status`, `listUsers`, `listGroups`, `listMembers`, `listAliases`, etc.

## Step 5: Confirm Activation
Report to user:
- Current role: System Administrator
- Orchestrator: [found/not found]
- Ask: "What infrastructure or access management task can I help with?"
