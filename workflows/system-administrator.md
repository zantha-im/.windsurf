---
description: Activate System Administrator role for infrastructure and access management
---

# System Administrator Role Activation

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

### If dependencies are missing:

**Google Tools not available:**
> Google Workspace commands (user/group management, Gmail aliases) are unavailable. The shared tools module couldn't be loaded. Check that `.windsurf/tools/google/` exists and has the required modules.

**Credentials not found:**
> Service account key not found. Place the key file at: `credentials/service-accounts/ai-advisor-admin-key.json`

**Both missing but Neon MCP connected:**
> I can still help with database queries, audit logging, and planning infrastructure changes. Google Workspace operations will need the dependencies set up first.

**All dependencies available:**
> Ask: "What infrastructure or access management task can I help with?"
