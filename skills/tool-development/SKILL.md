---
name: tool-development
description: STOP before writing one-off scripts. Convert automation scripts into reusable orchestrator tools. Use this skill when you find yourself writing a script to automate a task, generate a report, or perform repeated operations. Instead of a throwaway script, create a proper tool in the orchestrator with CLI discovery. Triggers on: writing scripts, automating tasks, generating reports, creating utilities, one-off automation, repeated operations.
---

# Skill: Tool Development

**CRITICAL: Scripts become tools, tools become discoverable.**

When you need to automate something, don't write a one-off script. Instead:
1. Write it as a tool function in the role's orchestrator
2. Add it to the CLI discovery (help output)
3. Export it for programmatic use

This makes capabilities **reusable and discoverable** across sessions.

---

## Architecture: Domain vs Generic Roles

| Role Type | Orchestrator Location | Who Maintains |
|-----------|----------------------|---------------|
| **Domain** | `roles/[role-name]/orchestrator.js` in the consuming project | The project team |
| **Generic** | `.windsurf/roles/generic/[role-name]/orchestrator.js` in the subtree | This shared repository |

**Domain roles** (e.g., Sales Analyst, Company Secretary) have project-specific orchestrators maintained by each project.

**Generic roles** (e.g., Senior Developer, System Administrator) have shared orchestrators in this subtree that all projects can use.

### Shared Tools vs Role Tools

```
.windsurf/tools/           ← Shared API wrappers (Google, PDF, etc.) - in subtree
project/tools/             ← Project bridge modules - in consuming project
project/roles/my-role/     ← Domain role orchestrator - in consuming project
.windsurf/roles/generic/   ← Generic role orchestrators - in subtree
```

---

## Workflow

Copy this checklist and track your progress:

```
Tool Development Progress:
- [ ] Step 1: Read .windsurf/tools/README.md for available modules
- [ ] Step 2: Check if functionality already exists in shared tools
- [ ] Step 3: Create tools/google-client.js bridge module (if using Google APIs)
- [ ] Step 4: Configure credential paths for your project
- [ ] Step 5: Create orchestrator with CLI discovery
- [ ] Step 6: Test with `node orchestrator.js` (no args) to verify discovery
```

## Discovery First

**Before creating any tools, discover what already exists:**

1. Read `.windsurf/tools/README.md` for available modules and API reference
2. Check if the functionality already exists in shared tools
3. Only create project-specific tools for business logic, not for API wrappers

---

## Pattern: Bridge Module

Every project that uses shared tools should have a **bridge module** that configures them with project-specific paths.

### Required: tools/google-client.js

See [references/bridge-module-template.js](references/bridge-module-template.js) for the complete template.

**Key points:**
- Configure `TOKEN_PATH` for your project's OAuth tokens
- Configure `SERVICE_ACCOUNT_KEY_PATH` for service account credentials
- Set `IMPERSONATE_USER` for domain-wide delegation
- Export factory functions: `getOAuth2Auth`, `getDrive`, `getDocs`, `getGmail`

---

## Pattern: Role Orchestrator

Orchestrators combine shared tools with project-specific business logic.

### Structure

```
roles/
└── my-role/
    ├── orchestrator.js    # Business logic + CLI discovery
    ├── config.js          # Folder IDs, constants (optional)
    └── _context/          # Role-specific context files
```

### Orchestrator Template

See [references/orchestrator-template.js](references/orchestrator-template.js) for the complete template.

**Key points:**
- Import from bridge module, not directly from googleapis
- Define project-specific configuration (folder IDs, template IDs)
- Implement CLI discovery (required for role activation)
- Export functions for programmatic use

---

## Anti-Patterns

### ❌ DO NOT: Hardcode paths in shared tools
```javascript
// BAD - hardcoded path
const TOKEN_PATH = './credentials/tokens.json';
```

### ✅ DO: Accept paths as configuration
```javascript
// GOOD - configurable
async function createClient(config) {
  const tokenPath = config.tokenPath; // Caller provides path
}
```

### ❌ DO NOT: Duplicate API wrapper logic
```javascript
// BAD - reimplementing Drive API
const { google } = require('googleapis');
async function uploadFile(path, folderId) {
  const drive = google.drive({ version: 'v3', auth });
  // ... reimplementing what's already in .windsurf/tools/google/drive.js
}
```

### ✅ DO: Use shared tools, add business logic
```javascript
// GOOD - use shared tools, add project-specific logic
const { getDrive } = require('../../tools/google-client');
async function uploadToProjectFolder(path) {
  const drive = await getDrive();
  return drive.uploadFile(path, PROJECT_FOLDER_ID); // Business logic: knows the folder
}
```

---

## Adding a New Tool to an Existing Orchestrator

When you need to automate a new task (e.g., generate a specific report type):

### Step 1: Write the function
```javascript
async function generateSalesReport(startDate, endDate) {
  // Your business logic here
  const data = await queryDatabase(startDate, endDate);
  return formatReport(data);
}
```

### Step 2: Add to CLI discovery
```javascript
if (!cmd) {
  console.log(`
...existing commands...
  generateSalesReport <start> <end>   Generate sales report for date range
`);
}
```

### Step 3: Add to command dispatch
```javascript
const commands = { 
  ...existingCommands,
  generateSalesReport 
};
```

### Step 4: Export for programmatic use
```javascript
module.exports = { 
  ...existingExports,
  generateSalesReport 
};
```

### Step 5: Test discovery
```bash
node orchestrator.js
# Should show new command in help output
```

---

## Output Checklist

Before completing tool development:
- [ ] Bridge module created with project-specific paths
- [ ] Orchestrator has CLI discovery (run with no args shows help)
- [ ] All API operations use shared tools, not direct googleapis
- [ ] Business logic (folder IDs, workflows) in orchestrator, not shared tools
- [ ] Tested: `node orchestrator.js` shows available commands
