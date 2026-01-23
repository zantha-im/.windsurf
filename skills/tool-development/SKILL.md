---
name: tool-development
description: STOP before writing one-off scripts. Convert automation scripts into reusable tools. Use when writing scripts, automating tasks, creating utilities, or building new API integrations. Covers both project-specific orchestrator tools AND shared tools in the .windsurf subtree. Triggers on: writing scripts, automating tasks, generating reports, creating utilities, one-off automation, repeated operations, create tool, new tool, build tool, shared tool, reusable tool, API wrapper, new integration.
---

# Skill: Tool Development

**CRITICAL: Scripts become tools, tools become discoverable.**

This skill covers two types of tool development:
1. **Shared Tools** - API wrappers in `.windsurf/tools/` (benefits all projects)
2. **Project Tools** - Orchestrators with business logic (project-specific)

---

## Decision: Shared Tool or Project Tool?

**Before writing any code, determine where it belongs:**

| Question | If Yes → | If No → |
|----------|----------|---------|
| Is this an API wrapper (AWS, Google, etc.)? | Shared tool | Project tool |
| Will multiple projects need this? | Shared tool | Project tool |
| Does it contain business logic (folder IDs, workflows)? | Project tool | Could be shared |
| Does it need project-specific credentials? | Project tool (or bridge) | Shared tool |

**Examples:**
- Route53 DNS management → **Shared tool** (`.windsurf/tools/aws/`)
- Sales report generator → **Project tool** (orchestrator)
- Google Drive API wrapper → **Shared tool** (already exists)
- Upload to specific Drive folder → **Project tool** (uses shared tool + folder ID)

---

## Creating Shared Tools (.windsurf/tools/)

**CRITICAL: Shared tools must be created in the `.windsurf` SOURCE repository, not in subtree copies.**

### Shared Tool Workflow

```
Shared Tool Development Progress:
- [ ] Step 1: Verify workspace has .windsurf SOURCE repo (not subtree)
- [ ] Step 2: Check .windsurf/tools/README.md - does similar tool exist?
- [ ] Step 3: Create tool in .windsurf/tools/[category]/
- [ ] Step 4: Update .windsurf/tools/README.md with documentation
- [ ] Step 5: Use relative paths only (./.windsurf/tools/...)
- [ ] Step 6: Test tool works in source context
- [ ] Step 7: Commit and push to .windsurf source repo
- [ ] Step 8: Run /subtree-pull in consuming projects
- [ ] Step 9: Install dependencies in consumer (npm install)
- [ ] Step 10: Add credentials to consumer's .env file
- [ ] Step 11: Test tool from consumer project
```

### Step 1: Verify Source Repo Access

**You MUST be working in the `.windsurf` source repository, not a subtree copy.**

Check your workspace:
- **Source:** `c:\Users\Jonny\Code\.windsurf` (this is the git root)
- **Subtree:** `my-project/.windsurf/` (this is embedded, DO NOT EDIT)

If you only have subtree access:
1. Add the source repo to your workspace
2. Or switch to the source repo to make changes
3. Then `/subtree-pull` to get changes in consumer projects

### Step 2: Create Tool Structure

```
.windsurf/tools/
├── [category]/           # e.g., aws/, google/, pdf/
│   ├── index.js          # Exports all tools in category
│   └── [tool-name].js    # Individual tool module
└── README.md             # Documentation (MUST UPDATE)
```

### Step 3: Tool Module Pattern

```javascript
/**
 * [Tool Name] Module
 * [Brief description]
 * 
 * Usage:
 *   const { createClient } = require('./.windsurf/tools/[category]/[tool]');
 *   const client = createClient({ /* config */ });
 */

const { SomeSDK } = require('some-sdk');

function createClient(config = {}) {
  // Accept config, use env vars as fallback
  const apiKey = config.apiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error('API key required. Set API_KEY env var or pass in config.');
  }
  
  // Return client with methods
  return {
    async doSomething() { /* ... */ },
    async doSomethingElse() { /* ... */ }
  };
}

module.exports = { createClient };
```

### Step 4: Update README.md

Add to `.windsurf/tools/README.md`:
- Tool name and purpose in the module table
- API reference section with usage examples
- Required dependencies (`npm install ...`)
- Required environment variables

### Step 5: Commit, Push, Subtree Pull

```bash
# In .windsurf source repo
git add tools/[category]/
git commit -m "Add [tool-name] tool for [purpose]"
git push

# In each consuming project
# Run /subtree-pull workflow
```

---

## Creating Project Tools (Orchestrators)

For project-specific business logic, create orchestrator tools.

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

### Project Tool Workflow

Copy this checklist and track your progress:

```
Project Tool Development Progress:
- [ ] Step 1: Read .windsurf/tools/README.md for available modules
- [ ] Step 2: Check if functionality already exists in shared tools
- [ ] Step 3: Create tools/google-client.js bridge module (if using Google APIs)
- [ ] Step 4: Configure credential paths for your project
- [ ] Step 5: Create orchestrator with CLI discovery
- [ ] Step 6: Test with `node orchestrator.js` (no args) to verify discovery
```

### Discovery First

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
