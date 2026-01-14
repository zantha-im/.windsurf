---
trigger: model_decision
description: Company Secretary tool usage. Always use the orchestrator tools/company-secretary.js instead of writing ad-hoc scripts.
---
# Company Secretary Tool Usage

**Tags:** #company-secretary #tools #orchestrator

## When this rule applies
- Any task involving Company Secretary role
- Reading company documents from Google Drive
- Managing company context or statutory records
- Any document access, indexing, or search operations

---

## CRITICAL: Use the Orchestrator

**ALWAYS use `tools/company-secretary.js` - NEVER write ad-hoc scripts.**

When you need to:
- List company documents -> Use `cs.listCompanyDocuments()`
- Find a specific document -> Use `cs.findCompanyDocument()`
- Read a document -> Use `cs.readCompanyDocument()`
- Load/save context -> Use `cs.loadCompanyContext()` / `cs.saveCompanyContext()`

### Quick Reference

```javascript
const cs = require('./tools/company-secretary');

// Document access
cs.listCompanies()                                    // ['AIL', 'Zantha']
cs.listCompanyDocuments('AIL', 'Company Docs')        // List subfolder
cs.findCompanyDocument('AIL', 'Certificate', 'Company Docs')  // Find by name
cs.readCompanyDocument(fileId)                        // Read with OCR support

// Context management
cs.loadCompanyContext()                               // Load _context/*.json
cs.saveCompanyContext('companies', data)              // Save to _context/

// Document indexing
cs.indexDocument(doc)                                 // Index in database
cs.searchDocuments(query, filters)                    // Search indexed docs
```

---

## Company Folder IDs

| Company | Folder ID |
|---------|-----------|
| AIL | `1WC-33OBaytREerzUHwnqxXrKLRSCi-LR` |
| Zantha | `1IDpMyJQJpS-qbfqPsgZNSYtNa9BXj4VX` |
| Shared Drive | `0ACL0gFmTvIaQUk9PVA` |

---

## Anti-Pattern: Ad-hoc Scripts

**DO NOT** create temporary script files like:
- `read-company-docs.js`
- `test-drive-access.js`
- `list-folder-contents.js`

Instead, use the orchestrator functions directly via Node one-liner or REPL.

---

## When to Extend the Orchestrator

If you need functionality not in the orchestrator:
1. **First** check if it can be composed from existing functions
2. **If not**, add the function to `tools/company-secretary.js`
3. **Never** create a separate script file

