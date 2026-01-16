# .windsurf/tools

Reusable tool modules for common operations. These tools are designed to be **configurable** - they accept paths and credentials as parameters rather than hardcoding them.

## Quick Start

```javascript
// Import the tools
const tools = require('.windsurf/tools');

// Or import specific modules
const google = require('.windsurf/tools/google');
const pdf = require('.windsurf/tools/pdf');
```

## Available Modules

### Google APIs (`tools/google/`)

Configurable wrappers for Google APIs with OAuth2 and Service Account authentication.

| Module | Purpose |
|--------|---------|
| `auth.js` | OAuth2 and Service Account authentication |
| `drive.js` | Google Drive file operations |
| `docs.js` | Google Docs read/write operations |
| `gmail.js` | Gmail send and search |
| `admin.js` | Admin SDK (users, groups) and Gmail Settings |

### PDF (`tools/pdf/`)

PDF text extraction and OCR.

| Module | Purpose |
|--------|---------|
| `extract.js` | Extract text from PDFs (pdfjs-dist) |
| `ocr.js` | OCR for scanned PDFs (tesseract.js) |

---

## Pattern: Creating Project-Specific Tools

The subtree tools are **building blocks**. Projects create their own tools by:

1. **Creating a bridge module** that configures shared tools with project-specific paths
2. **Creating orchestrators** that combine tools with project-specific business logic

### Step 1: Create a Bridge Module

Create `tools/google-client.js` in your project:

```javascript
// tools/google-client.js
require('dotenv').config();
const path = require('path');
const google = require('.windsurf/tools/google');

// Project-specific paths
const TOKEN_PATH = path.join(__dirname, '../credentials/oauth-tokens/google-tokens.json');
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, '../credentials/service-accounts/my-key.json');
const IMPERSONATE_USER = 'user@domain.com';

// Cached client
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

module.exports = {
  getOAuth2Auth,
  getServiceAccountAuth,
  getDrive,
  getDocs,
  getGmail,
  TOKEN_PATH,
  SERVICE_ACCOUNT_KEY_PATH
};
```

### Step 2: Create Role Orchestrators

Orchestrators combine tools with project-specific business logic:

```javascript
// roles/my-role/orchestrator.js
const { getDrive, getDocs } = require('../../tools/google-client');

// Project-specific folder IDs
const FOLDER_IDS = {
  documents: '1abc123...',
  templates: '1def456...'
};

async function listDocuments() {
  const drive = await getDrive();
  return drive.listFiles(FOLDER_IDS.documents);
}

async function createFromTemplate(templateId, name, replacements) {
  const drive = await getDrive();
  const docs = await getDocs();
  
  // Copy template
  const copy = await drive.copyFile(templateId, name, FOLDER_IDS.documents);
  
  // Replace placeholders
  await docs.replaceAllText(copy.id, replacements);
  
  return copy;
}

// CLI discovery
if (require.main === module) {
  console.log(`
My Role Orchestrator

Available commands:
  listDocuments     - List all documents
  createFromTemplate - Create document from template

Usage:
  node orchestrator.js listDocuments
  node orchestrator.js createFromTemplate <templateId> <name>
`);
}

module.exports = {
  listDocuments,
  createFromTemplate,
  FOLDER_IDS
};
```

---

## Tool API Reference

### Google Auth (`tools/google/auth.js`)

```javascript
const { createOAuth2Client, createServiceAccountClient } = require('.windsurf/tools/google/auth');

// OAuth2 (user tokens)
const auth = await createOAuth2Client({
  clientId: 'xxx',           // or GOOGLE_CLIENT_ID env var
  clientSecret: 'xxx',       // or GOOGLE_CLIENT_SECRET env var
  tokenPath: './tokens.json' // REQUIRED - where to load/save tokens
});

// Service Account (domain-wide delegation)
const auth = await createServiceAccountClient({
  keyFilePath: './key.json', // REQUIRED
  scopes: ['https://...'],   // REQUIRED
  impersonateUser: 'user@domain.com' // Optional, for DWD
});
```

### Google Drive (`tools/google/drive.js`)

```javascript
const { createDriveClient } = require('.windsurf/tools/google/drive');
const drive = createDriveClient(auth);

// List files
const files = await drive.listFiles(folderId);
const sharedFiles = await drive.listSharedDriveFiles(driveId, folderId);

// File operations
const metadata = await drive.getFileMetadata(fileId);
const buffer = await drive.downloadFile(fileId);
const exported = await drive.exportFile(fileId, 'text/plain');

// Upload
const file = await drive.uploadFile('./local.pdf', folderId);
const doc = await drive.uploadContent(content, 'name.txt', folderId);

// Copy/Move/Delete
const copy = await drive.copyFile(fileId, 'New Name', targetFolderId);
await drive.moveFile(fileId, newFolderId);
await drive.deleteFile(fileId);

// Folders
const folder = await drive.createFolder('Name', parentId);
const found = await drive.findFolder('Name', parentId);
```

### Google Docs (`tools/google/docs.js`)

```javascript
const { createDocsClient } = require('.windsurf/tools/google/docs');
const docs = createDocsClient(auth);

// Read
const doc = await docs.getDocument(docId);
const text = await docs.getDocumentText(docId);

// Write
await docs.replaceAllText(docId, { '[PLACEHOLDER]': 'value' });
await docs.applyTextStyle(docId, 'text to style', { bold: true });
await docs.insertText(docId, index, 'text');
await docs.deleteText(docId, startIndex, endIndex);

// Advanced
await docs.batchUpdate(docId, [{ insertText: {...} }, { updateTextStyle: {...} }]);
```

### Gmail (`tools/google/gmail.js`)

```javascript
const { createGmailClient } = require('.windsurf/tools/google/gmail');
const gmail = createGmailClient(auth);

// Send
await gmail.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  body: '<h1>HTML content</h1>',
  html: true,
  from: 'alias@domain.com' // Optional, for send-as
});

// Search
const messages = await gmail.searchMessages('from:user@example.com after:2024/01/01');
const message = await gmail.getMessage(messageId);
const headers = await gmail.getMessageHeaders(messageId);
const { text, html } = await gmail.getMessageBody(messageId);
```

### Admin SDK (`tools/google/admin.js`)

```javascript
const { createAdminClient, createGmailSettingsClient } = require('.windsurf/tools/google/admin');

// Users & Groups
const admin = createAdminClient(auth);
const users = await admin.listUsers('domain.com');
const groups = await admin.listGroups('domain.com');
await admin.addGroupMember('group@domain.com', 'user@domain.com', 'MEMBER');

// Gmail Settings (send-as aliases)
const settings = createGmailSettingsClient(auth);
const aliases = await settings.listSendAsAliases('user@domain.com');
await settings.addSendAsAlias('user@domain.com', 'alias@domain.com', 'Display Name', true);
```

### PDF (`tools/pdf/`)

```javascript
const pdf = require('.windsurf/tools/pdf');

// Extract text
const text = await pdf.extractTextFromFile('./document.pdf');
const text = await pdf.extractTextFromBuffer(buffer);

// OCR (for scanned PDFs)
if (await pdf.needsOcr('./scanned.pdf')) {
  const text = await pdf.extractTextWithOcr('./scanned.pdf');
}
```

---

## Required Dependencies

Add these to your project's `package.json`:

```json
{
  "dependencies": {
    "googleapis": "^100.0.0",
    "pdfjs-dist": "^3.0.0",
    "pdf-to-png-converter": "^3.0.0",
    "tesseract.js": "^5.0.0",
    "mammoth": "^1.6.0"
  }
}
```

Or install via npm:
```bash
npm install googleapis pdfjs-dist pdf-to-png-converter tesseract.js mammoth
```
