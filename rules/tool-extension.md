---
trigger: model_decision
description: Tool extension patterns. How to create project-specific tools that use the shared .windsurf/tools modules.
---
# Tool Extension Patterns

**Tags:** #tools #patterns #extension

## When this rule applies
- When creating new tools for a project
- When a role needs project-specific functionality
- When integrating with Google APIs, PDF processing, or other shared capabilities

---

## CRITICAL: Discovery First

Before creating any tools, **discover what already exists**:

1. Read /.windsurf/tools/README.md for available modules and API reference
2. Check if the functionality already exists in shared tools
3. Only create project-specific tools for business logic, not for API wrappers

---

## Pattern: Bridge Module

Every project that uses shared tools should have a **bridge module** that configures them with project-specific paths.

### Required: tools/google-client.js

```javascript
require('dotenv').config();
const path = require('path');
const google = require('.windsurf/tools/google');

// Project-specific paths - CONFIGURE THESE
const TOKEN_PATH = path.join(__dirname, '../credentials/oauth-tokens/google-tokens.json');
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, '../credentials/service-accounts/key.json');
const IMPERSONATE_USER = 'user@domain.com';

let _oauth2Client = null;

async function getOAuth2Auth() {
  if (!_oauth2Client) {
    _oauth2Client = await google.createOAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      tokenPath: TOKEN_PATH
    });
  }
  return _oauth2Client;
}

async function getServiceAccountAuth(scopes, impersonateUser = IMPERSONATE_USER) {
  return google.createServiceAccountClient({
    keyFilePath: SERVICE_ACCOUNT_KEY_PATH,
    scopes,
    impersonateUser
  });
}

async function getDrive() {
  const auth = await getOAuth2Auth();
  return google.createDriveClient(auth);
}

async function getDocs() {
  const auth = await getOAuth2Auth();
  return google.createDocsClient(auth);
}

async function getGmail(useServiceAccount = false) {
  if (useServiceAccount) {
    const auth = await getServiceAccountAuth(['https://www.googleapis.com/auth/gmail.send']);
    return google.createGmailClient(auth);
  }
  const auth = await getOAuth2Auth();
  return google.createGmailClient(auth);
}

module.exports = { getOAuth2Auth, getServiceAccountAuth, getDrive, getDocs, getGmail };
```

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

```javascript
// roles/my-role/orchestrator.js
const { getDrive, getDocs } = require('../../tools/google-client');

// Project-specific configuration
const CONFIG = {
  folders: {
    documents: '1abc123...',
    templates: '1def456...'
  },
  templateId: '1xyz789...'
};

// Business logic functions
async function listDocuments() {
  const drive = await getDrive();
  return drive.listFiles(CONFIG.folders.documents);
}

async function createDocument(name, data) {
  const drive = await getDrive();
  const docs = await getDocs();
  
  const copy = await drive.copyFile(CONFIG.templateId, name, CONFIG.folders.documents);
  await docs.replaceAllText(copy.id, data);
  
  return copy;
}

// CLI discovery - REQUIRED for role activation
if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  
  if (!cmd) {
    console.log(`
My Role Orchestrator

Commands:
  listDocuments              List all documents
  createDocument <name>      Create a new document

Usage:
  node orchestrator.js listDocuments
  node orchestrator.js createDocument "My Document"
`);
    process.exit(0);
  }
  
  // Command dispatch
  const commands = { listDocuments, createDocument };
  if (commands[cmd]) {
    commands[cmd](...args)
      .then(result => console.log(JSON.stringify(result, null, 2)))
      .catch(err => { console.error('Error:', err.message); process.exit(1); });
  } else {
    console.error('Unknown command:', cmd);
    process.exit(1);
  }
}

module.exports = { listDocuments, createDocument, CONFIG };
```

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

## Checklist: Creating New Project Tools

- [ ] Read /.windsurf/tools/README.md first
- [ ] Create tools/google-client.js bridge module
- [ ] Configure credential paths for your project
- [ ] Create orchestrator with CLI discovery
- [ ] Use shared tools for API operations
- [ ] Keep business logic (folder IDs, workflows) in orchestrator
- [ ] Test with `node orchestrator.js` (no args) to verify discovery works
