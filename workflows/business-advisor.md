---
description: Activate Business Advisor role for financial analysis and strategic guidance
---

# Business Advisor Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/business-advisor.md`

## Step 2: Update Database State
Execute via Neon MCP on the ai-advisor project (`jolly-bonus-08718721`):
```sql
UPDATE advisor_state 
SET value = '"business-advisor"', updated_at = NOW() 
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
WHERE role = 'business-advisor' 
ORDER BY context_type, title;
```

## Step 5: Confirm Activation
Report to user:
- Current role: Business Advisor
- Available tools: Xero API, Google Drive, Database
- Company context loaded: [count] items
- Role context loaded: [count] items
- Ask: "How can I assist with your business analysis?"
