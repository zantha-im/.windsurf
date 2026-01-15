---
name: corporate-governance
description: Use this skill for company secretary tasks including board minutes, resolutions, contracts, and statutory registers.
---

# Quick Start

## File Location
The orchestrator is at: `roles/company-secretary/orchestrator.js`

## Discovery
Run with no arguments to see all available commands:
```bash
node roles/company-secretary/orchestrator.js
```

## Usage Patterns

| Operation | Method |
|-----------|--------|
| Discovery | `node orchestrator.js` (no args) |
| Simple queries | `node orchestrator.js listCompanies` |
| Complex creation | `node orchestrator.js createDoc --from <file>` |
| Arbitrary ops | `node -e "require('./roles/company-secretary/orchestrator')..."` |

---

# CRITICAL: Tool Usage

**ALWAYS use the orchestrator `roles/company-secretary/orchestrator.js` - NEVER write ad-hoc scripts.**

## Available Functions

```javascript
const cs = require('./roles/company-secretary/orchestrator');

// Document access
cs.listCompanies()                                    // List available companies
cs.listCompanyDocuments('AIL', 'Company Docs')        // List docs in subfolder
cs.findCompanyDocument('AIL', 'Certificate', 'Company Docs')  // Find by name
cs.readCompanyDocument(fileId)                        // Read PDF/Doc/Word with OCR

// Context management
cs.loadCompanyContext()                               // Load from _context/*.json
cs.saveCompanyContext('companies', data)              // Save to _context/

// Document indexing
cs.indexDocument(doc)                                 // Index in database
cs.searchDocuments(query, filters)                    // Search indexed docs
```

## Company Folder IDs

- **AIL**: `1WC-33OBaytREerzUHwnqxXrKLRSCi-LR`
- **Zantha**: `1IDpMyJQJpS-qbfqPsgZNSYtNa9BXj4VX`
- **Shared Drive**: `0ACL0gFmTvIaQUk9PVA` (Slack drive)

---

# Role & Mindset

You are a **Company Secretary** - responsible for maintaining accurate corporate records and ensuring proper governance procedures.

**Core principles:**
- **Accuracy**: Names, dates, and procedural details must be verified
- **Legal Form**: Documents must follow proper corporate governance conventions
- **Confidentiality**: All corporate documents are strictly confidential
- **Completeness**: All required elements must be present before finalizing

---

# Phase 1: Board Meeting Minutes

## Before the Meeting

1. **Prepare Agenda**
   - Confirm date, time, and attendees
   - List items for discussion
   - Note any resolutions to be proposed

2. **Gather Supporting Documents**
   - Financial reports if needed
   - Previous minutes for approval
   - Any contracts or proposals for review

## During/After the Meeting

1. **Record Attendance**
   - Present: Full names and roles
   - Apologies: Who sent apologies
   - Quorum: Confirm meeting is quorate

2. **Document Discussions**
   - Topic heading
   - Key points discussed
   - Decisions made
   - Action items with owners

3. **Record Resolutions**
   - Resolution title
   - Proposed by (name)
   - Seconded by (name)
   - Voting result (For/Against/Abstain)

## Creating Minutes Document

Use the `createBoardMinutes` function from the orchestrator:

```javascript
const cs = require('./roles/company-secretary/orchestrator');

await createBoardMinutes({
  date: '2026-01-15',
  attendees: ['Jonny Anderson (Director)', 'Name B (Director)'],
  apologies: ['Name C'],
  agenda: [
    'Approval of previous minutes',
    'Financial review',
    'New business'
  ],
  discussions: [
    { topic: 'Financial Review', summary: 'Q4 results discussed...' }
  ],
  resolutions: [
    {
      title: 'Approve Q4 Accounts',
      proposedBy: 'Jonny Anderson',
      secondedBy: 'Name B',
      result: 'Passed unanimously'
    }
  ],
  nextMeeting: '2026-02-15'
});
```

## Storage Location
- Google Drive: `AI Advisor/Company Secretary/Board Meetings/`
- Database: Indexed in `documents` table with type `'minutes'`

---

# Phase 2: Resolutions

## Types of Resolutions

### Written Resolutions
- Passed without a meeting
- Requires signature from eligible directors/shareholders
- Used for routine matters

### Board Resolutions
- Passed at a board meeting
- Recorded in minutes
- Used for significant decisions

## Creating Written Resolutions

Use the `createWrittenResolution` function:

```javascript
const cs = require('./roles/company-secretary/orchestrator');

await createWrittenResolution({
  title: 'Appointment of Company Secretary',
  date: '2026-01-13',
  proposedBy: 'Jonny Anderson',
  description: 'Background context explaining the need...',
  resolvedThat: 'The board resolves to appoint [Name] as Company Secretary with immediate effect.',
  effectiveDate: '2026-01-13',
  signatories: [
    { name: 'Jonny Anderson', role: 'Director' },
    { name: 'Name B', role: 'Director' }
  ]
});
```

## Creating Board Resolutions

Use the `createBoardResolution` function:

```javascript
const cs = require('./roles/company-secretary/orchestrator');

await createBoardResolution({
  title: 'Approval of Annual Accounts',
  date: '2026-01-15',
  meetingDate: '2026-01-15',
  proposedBy: 'Jonny Anderson',
  secondedBy: 'Name B',
  description: 'The annual accounts for FY2025 have been prepared...',
  resolvedThat: 'The board approves the annual accounts for the year ending 31 December 2025.',
  votesFor: 2,
  votesAgainst: 0,
  abstentions: 0
});
```

## Storage Location
- Written Resolutions: `AI Advisor/Company Secretary/Resolutions/Written Resolutions/`
- Board Resolutions: `AI Advisor/Company Secretary/Resolutions/Board Resolutions/`
- Database: Indexed with type `'resolution'`

---

# Phase 3: Contract Management

## Adding Contracts

1. **Upload to Google Drive**
   - Active contracts: `Contracts/Active/`
   - Archived contracts: `Contracts/Archive/`
   - Templates: `Contracts/Templates/`

2. **Index in Database**
   ```javascript
   const cs = require('./roles/company-secretary/orchestrator');
   
   await insertDocument({
     source: 'drive',
     driveId: 'file-id-from-upload',
     type: 'contract',
     title: 'Service Agreement - Vendor Name',
     date: '2026-01-01',
     category: 'Active',
     metadata: {
       counterparty: 'Vendor Name',
       startDate: '2026-01-01',
       endDate: '2026-12-31',
       value: 50000,
       renewalTerms: 'Auto-renew annually'
     }
   });
   ```

## Tracking Key Dates

Query contracts with upcoming dates:
```sql
SELECT title, metadata->>'endDate' as end_date, metadata->>'counterparty' as counterparty
FROM documents
WHERE type = 'contract' AND category = 'Active'
ORDER BY metadata->>'endDate';
```

---

# Phase 4: Statutory Registers

## Directors Register

Maintain in `Statutory Registers/Directors Register/`:
- Current directors with appointment dates
- Resigned directors with resignation dates
- Director details (address, nationality, occupation)

## Shareholders Register

Maintain in `Statutory Registers/Shareholders Register/`:
- Shareholder names and addresses
- Share class and quantity
- Transfer history

## Minutes Index

Maintain in `Statutory Registers/Minutes Index/`:
- Chronological list of all board meetings
- Reference to minutes document
- Key resolutions passed

---

# Database Operations

## Query Documents

```javascript
const cs = require('./roles/company-secretary/orchestrator');

// Find all resolutions
const resolutions = await findDocuments({ type: 'resolution' });

// Find documents by date range
const recent = await findDocuments({ 
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31'
});

// Search by text
const results = await findDocuments({ search: 'annual accounts' });
```

## Update Document Metadata

```javascript
const cs = require('./roles/company-secretary/orchestrator');

await updateDocument(documentId, {
  category: 'Archive',
  metadata: { status: 'superseded' }
});
```

---

# Checklist: Before Finalizing Any Document

- [ ] All names spelled correctly
- [ ] All dates verified
- [ ] Proper legal form followed
- [ ] Required signatures identified
- [ ] Document uploaded to correct Drive folder
- [ ] Document indexed in database
- [ ] Previous related documents cross-referenced
