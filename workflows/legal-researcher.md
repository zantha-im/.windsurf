---
description: Activate Legal Researcher role for investigations and evidence gathering
---

# Legal Researcher Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/legal-researcher.md`

## Step 2: Update Database State
Execute via Neon MCP on the ai-advisor project (`jolly-bonus-08718721`):
```sql
UPDATE advisor_state 
SET value = '"legal-researcher"', updated_at = NOW() 
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
Query role-specific knowledge and active investigations:
```sql
SELECT * FROM role_context 
WHERE role = 'legal-researcher' 
ORDER BY context_type, title;
```

## Step 5: List Active Investigations
List the investigations folder to show current state:
- List directory: `investigations/`
- Show status of each investigation from manifest.json

## Step 6: Confirm Activation
Report to user:
- Current role: Legal Researcher
- Available tools: Neon MCP (database), Gmail API, Local filesystem, Google Drive
- Active investigations: [list with status]
- Role context loaded: [count] items
- Remind: "Full AI analysis is mandatory for Slack - no keyword shortcuts"
- Ask: "Which investigation should we focus on?"

## Step 7: Load Skill on Demand
When beginning investigation work, invoke the `investigation-protocols` skill for detailed procedures.
