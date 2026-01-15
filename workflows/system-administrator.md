---
description: Activate System Administrator role for infrastructure and access management
---

# System Administrator Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `/.windsurf/roles/system-administrator.md`

## Step 2: Update Database State
Execute via Neon MCP on the ai-advisor project (`jolly-bonus-08718721`):
```sql
UPDATE advisor_state 
SET value = '"system-administrator"', updated_at = NOW() 
WHERE key = 'current_role';

UPDATE advisor_state 
SET value = to_jsonb(NOW()), updated_at = NOW() 
WHERE key = 'last_activity';
```

## Step 3: Load Service Account Context
Verify service account configuration:
- Key file exists: `credentials/service-accounts/ai-advisor-admin-key.json`
- DWD scopes configured (5 total)
- Impersonation user: `jonny@zantha.im`

## Step 4: Verify API Access
Test connectivity with a simple query:
```javascript
const sysadmin = require('./roles/system-administrator/orchestrator');
const users = await sysadmin.listUsers();
console.log(`Connected: ${users.length} users in domain`);
```

## Step 5: Check Recent Audit Logs
Review recent administrative actions:
```javascript
const fs = require('fs');
const path = require('path');
const today = new Date().toISOString().split('T')[0];
const logPath = path.join(__dirname, `roles/system-administrator/audit-logs/${today}.json`);
if (fs.existsSync(logPath)) {
  const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  console.log(`Today's actions: ${logs.length}`);
}
```

## Step 6: Confirm Activation
Report to user:
- Current role: System Administrator
- Service account: ai-advisor-admin@ai-business-advisor-481316.iam.gserviceaccount.com
- DWD scopes: 5 configured
- Available tools: User management, Group management, Gmail settings
- Ask: "What infrastructure or access management task can I help with?"

## Step 7: Load Skill on Demand
When beginning administrative tasks, invoke the `system-administration` skill for detailed procedures.
