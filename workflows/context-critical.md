---
description: Essential context refresh for AI conversations
auto_execution_mode: 3
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## Step 1: Understand your core tools
Set the project working directory then run the following commands to determine the tool usage.
```bash
cmd /c node .windsurf\tools\schema-query.js --help
```

```bash
cmd /c node .windsurf\tools\file-delete.js --help
```

```bash
cmd /c npm run --prefix .windsurf\review review:repo -- --help
```

## Step 2- Load Core Engineering Guides (Always)
These short guides are always relevant and should be loaded for any task.
/run load-core-guides

## Step 3 - Load Task-Specific Guides
- API/server/auth/networking:
  /run load-api-guides
- UI/React/components/hooks:
  /run load-ui-guides

## Step 4 - Workng with Window cmd
  /run context-cmd

# NOTES
## Git commit messages (required convention)
- Use no-spaces commit messages to avoid shell/quoting issues.
- Example: `git commit -m docs_update_ui_guidelines` (good)
- Avoid: `git commit -m "docs: update ui guidelines"` (spaces not allowed by convention)

## Load Current Schema Index
```bash
cmd /c node .windsurf\tools\schema-query.js --index
```