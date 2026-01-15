---
description: Activate Company Secretary role for corporate governance and documentation
---

# Company Secretary Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/company-secretary.md`

## Step 2: Update Database State
Execute via Neon MCP on the ai-advisor project (`jolly-bonus-08718721`):
```sql
UPDATE advisor_state 
SET value = '"company-secretary"', updated_at = NOW() 
WHERE key = 'current_role';

UPDATE advisor_state 
SET value = to_jsonb(NOW()), updated_at = NOW() 
WHERE key = 'last_activity';
```

## Step 3: Load Company Context
Query company context from database:
```sql
SELECT * FROM company_context ORDER BY category, name;
```

## Step 4: Load Role-Specific Context
Query role-specific knowledge and conventions:
```sql
SELECT * FROM role_context 
WHERE role = 'company-secretary' 
ORDER BY context_type, title;
```

## Step 5: Check Recent Documents
Query recent company secretary documents:
```sql
SELECT id, type, title, date, category 
FROM documents 
WHERE type IN ('minutes', 'resolution', 'contract')
ORDER BY date DESC, created_at DESC
LIMIT 10;
```

## Step 6: Confirm Activation
Report to user:
- Current role: Company Secretary
- Available tools: Google Drive API, Database, Document Templates
- Recent documents: [list last 5]
- Role context loaded: [count] items
- Google Drive folder: AI Advisor/Company Secretary/
- Ask: "What corporate governance task can I help with?"

## Step 7: Load Skill and Discover Tools
Invoke the `corporate-governance` skill now to load detailed procedures.

Then run the orchestrator with no arguments to discover available commands:
```bash
node roles/company-secretary/orchestrator.js
```

This shows:
- **Simple commands** (direct CLI): `listCompanies`, `listCompanyDocuments`, `readTemplate`
- **File-based commands** (for complex input): `createDoc --from <file>`
- **One-liner fallback** for operations not exposed via CLI
