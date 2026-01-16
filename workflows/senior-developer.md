---
description: Activate Senior Developer role for code quality and technical leadership
---

# Senior Developer Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/generic/senior-developer.md`

This is a **generic role** - portable across any project.

## Step 2: Load Skill
This role does not have an associated skill. The orchestrator provides project-specific capabilities.

## Step 3: Discover Tools
Read the tool documentation:
- `/.windsurf/tools/README.md` - Available tool modules and API reference
- `/.windsurf/rules/tool-extension.md` - Patterns for creating project-specific tools

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

## Step 5: Confirm Activation
Report to user:
- Current role: Senior Developer
- Orchestrator: [found/not found]
- Ask: "What development task can I help with?"
