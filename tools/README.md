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

| Module     | Purpose                                      |
| ---------- | -------------------------------------------- |
| `auth.js`  | OAuth2 and Service Account authentication    |
| `drive.js` | Google Drive file operations                 |
| `docs.js`  | Google Docs read/write operations            |
| `gmail.js` | Gmail send and search                        |
| `admin.js` | Admin SDK (users, groups) and Gmail Settings |

### PDF (`tools/pdf/`)

PDF text extraction and OCR.

| Module       | Purpose                             |
| ------------ | ----------------------------------- |
| `extract.js` | Extract text from PDFs (pdfjs-dist) |
| `ocr.js`     | OCR for scanned PDFs (tesseract.js) |

### AWS (`tools/aws/`)

AWS service wrappers for infrastructure management.

| Module       | Purpose                                  |
| ------------ | ---------------------------------------- |
| `route53.js` | DNS record management (CNAME, A records) |

### Excel (`tools/excel/`)

Excel file parsing and data extraction.

| Module     | Purpose                                  |
| ---------- | ---------------------------------------- |
| `index.js` | Read and parse Excel files (.xlsx, .xls) |

### Git (`tools/git/`)

Git utilities for subtree management and file synchronization.

| Module     | Purpose                                                   |
| ---------- | --------------------------------------------------------- |
| `index.js` | Subtree sync, remote file listing, missing file detection |

---

## Pattern: Creating Project-Specific Tools

> **For detailed guidance, use the `@tool-development` skill.**

The subtree tools are **building blocks**. Projects create their own tools by:

1. **Creating a bridge module** that configures shared tools with project-specific paths
2. **Creating orchestrators** that combine tools with project-specific business logic

**Key principle:** Don't write one-off scripts. Convert automation into orchestrator tools that are discoverable via CLI.

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

// Attachments
const attachments = await gmail.getAttachments(messageId);
// Returns: [{ id, filename, mimeType, size }, ...]
const buffer = await gmail.downloadAttachment(messageId, attachmentId);
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

### AWS Route53 (`tools/aws/route53.js`)

```javascript
const { createRoute53Client } = require('.windsurf/tools/aws/route53');

// Create client (uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars)
const route53 = createRoute53Client({ region: 'eu-west-2' });

// List hosted zones
const zones = await route53.listHostedZones();
// Returns: [{ id, name, recordCount, comment }, ...]

// Get zone ID by domain
const zoneId = await route53.getHostedZoneId('zantha.im');

// List DNS records
const records = await route53.listRecords(zoneId);

// Create CNAME record
const result = await route53.createCnameRecord(
  'zantha.im',           // domain
  'cs-bot',              // subdomain
  'target.railway.app',  // target
  300                    // TTL (optional, default 300)
);

// Create A record
await route53.createARecord('zantha.im', 'api', '1.2.3.4', 300);

// Delete record
await route53.deleteRecord('zantha.im', 'old-subdomain', 'CNAME');
```

**Required dependency:**
```bash
npm install @aws-sdk/client-route-53
```

**Required env vars:**
- `AWS_ACCESS_KEY_ID` - IAM user access key
- `AWS_SECRET_ACCESS_KEY` - IAM user secret key
- `AWS_REGION` (optional, default: eu-west-2)

### Excel (`tools/excel/`)

```javascript
const excel = require('.windsurf/tools/excel');

// Read workbook (async)
const workbook = await excel.readWorkbook('./file.xlsx');

// Get sheet names
const sheets = excel.getSheetNames(workbook);
// Returns: ['Sheet1', 'Sheet2', ...]

// Get workbook summary
const summary = excel.getWorkbookSummary(workbook);
// Returns: { sheetCount: 2, sheets: [{ name, rows, cols }, ...] }

// Get sheet data as JSON (first row as headers)
const data = excel.getSheetData(workbook, 'Sheet1');
// Returns: [{ col1: 'val1', col2: 'val2' }, ...]

// Get sheet as 2D array (no headers)
const rows = excel.getSheetAsArray(workbook, 'Sheet1');
// Returns: [['A1', 'B1'], ['A2', 'B2'], ...]

// Get specific cell
const value = excel.getCell(workbook, 'Sheet1', 'A1');

// Get cell with metadata
const cell = excel.getCellFull(workbook, 'Sheet1', 'A1');
// Returns: { value, formatted, type, formula }

// Get sheet range
const range = excel.getSheetRange(workbook, 'Sheet1');
// Returns: { startRow, startCol, endRow, endCol, ref }
```

**Required dependency:**
```bash
npm install exceljs
```

### Git (`tools/git/`)

```javascript
const git = require('.windsurf/tools/git');

// Check if remote exists
const exists = git.remoteExists('windsurf_subtree');

// Ensure remote exists (add if missing)
const { added, url } = git.ensureRemote('windsurf_subtree', 'https://github.com/zantha-im/.windsurf.git');

// Fetch from remote
git.fetchRemote('windsurf_subtree');

// List all files in a remote branch
const files = git.listRemoteFiles('windsurf_subtree', 'main');
// Returns: ['README.md', 'tools/index.js', ...]

// Get content of a file from remote
const content = git.getRemoteFileContent('windsurf_subtree', 'main', 'README.md');

// Find files missing locally
const { missing, existing, total } = git.findMissingFiles('windsurf_subtree', 'main', '.windsurf');
// Returns: { missing: ['new-file.js'], existing: ['README.md', ...], total: 50 }

// Sync missing files from remote to local
const { synced, errors } = git.syncMissingFiles('windsurf_subtree', 'main', '.windsurf');
// Returns: { synced: ['new-file.js'], skipped: [], errors: [] }

// Compare remote with local (summary)
const comparison = git.compareWithRemote('windsurf_subtree', 'main', '.windsurf');
// Returns: { summary: 'All 50 files present locally', missing: [], existing: [...], total: 50 }

// Full subtree sync operation (all-in-one)
const result = await git.subtreeSync({
  remoteName: 'windsurf_subtree',
  remoteUrl: 'https://github.com/zantha-im/.windsurf.git',
  branch: 'main',
  localPrefix: '.windsurf'
});
// Returns: { remote, fetch, comparison, sync }
```

**CLI usage:**
```bash
# List files in remote
node .windsurf/tools/git/index.js list-remote

# Find missing files
node .windsurf/tools/git/index.js find-missing

# Sync missing files
node .windsurf/tools/git/index.js sync

# Full sync operation
node .windsurf/tools/git/index.js full-sync
```

**No additional dependencies required** - uses Node.js built-ins and git CLI.
