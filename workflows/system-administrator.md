---
description: Activate System Administrator role for infrastructure and access management
---

# System Administrator Role Activation

## Step 0: Verify git-crypt (Encrypted Credentials)

Check if git-crypt is installed and repo is unlocked:
```powershell
git-crypt status 2>&1 | Select-Object -First 1
```

**If git-crypt not installed or repo locked:**
- Invoke `@git-crypt-setup` skill for installation and unlock instructions
- Do not proceed until credentials are accessible

**If working:** Continue to Step 1.

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/generic/system-administrator.md`

This is a **generic role** - portable across any project that needs infrastructure management.

## Step 2: Invoke Skill
Use `@system-administration` to load detailed procedures for user management, credentials, and API integrations.

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

For creating new tools, use `@tool-development` skill.

## Step 4: Run Orchestrator
First, verify the orchestrator file exists:
```bash
Test-Path .windsurf/roles/generic/system-administrator/orchestrator.js
```

If the file exists, run it to check infrastructure status:
```bash
node .windsurf/roles/generic/system-administrator/orchestrator.js status
```

This returns a JSON status showing:
- `sharedToolsAvailable`: Whether Google API tools are loaded
- `keyFileFound`: Whether service account credentials exist
- `keyFilePath`: Location of credentials (if found)

Available commands: `status`, `listUsers`, `listGroups`, `listMembers`, `listAliases`, etc.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: System Administrator
- Orchestrator: [file exists / file not found]
- Google Tools: [available / not available] (from `sharedToolsAvailable`)
- Credentials: [found at path / not found] (from `keyFileFound`)
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)

### If Google Tools not available:
This indicates the subtree dependencies weren't installed. Run:
```bash
cd .windsurf && npm install
```
Then re-run the orchestrator status check.

### If credentials not found:
Credentials are stored encrypted in `.windsurf/config/`. If not found:
1. Verify git-crypt is unlocked: `git-crypt status`
2. If locked, invoke `@git-crypt-setup` skill

### If all ready:
Ask: "What infrastructure or access management task can I help with?"
