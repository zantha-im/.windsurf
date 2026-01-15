---
name: system-administration
description: Use this skill for infrastructure management including Google Workspace administration, credentials management, service accounts, and API integrations.
---

# CRITICAL: Tool Usage

**ALWAYS use the orchestrator and admin tools - NEVER write ad-hoc scripts.**

## Available Functions

### Orchestrator (roles/system-administrator/orchestrator.js)

```javascript
const sysadmin = require('./roles/system-administrator/orchestrator');

// User management
sysadmin.listUsers()                          // List all domain users
sysadmin.getUser('user@zantha.im')            // Get user details

// Group management
sysadmin.listGroups()                         // List all groups
sysadmin.getGroup('group@zantha.im')          // Get group details
sysadmin.listGroupMembers('group@zantha.im')  // List group members
sysadmin.addGroupMember('group@zantha.im', 'user@zantha.im', 'MEMBER')
sysadmin.removeGroupMember('group@zantha.im', 'user@zantha.im')
sysadmin.createGroup('email@zantha.im', 'Group Name', 'Description')

// Context & Audit
sysadmin.loadContext()                        // Load from _context/*.json
sysadmin.saveContext('type', data)            // Save to _context/
sysadmin.logAuditEvent('action', { details }) // Log to audit-logs/
```

### Gmail Settings (tools/admin/gmail-settings.js)

```javascript
const gmail = require('./tools/admin/gmail-settings');

// Send-as alias management
gmail.listSendAsAliases('user@zantha.im')
gmail.getSendAsAlias('user@zantha.im', 'alias@zantha.im')
gmail.addSendAsAlias('user@zantha.im', 'alias@zantha.im', 'Display Name', true)
gmail.updateSendAsAlias('user@zantha.im', 'alias@zantha.im', { isDefault: true })
gmail.deleteSendAsAlias('user@zantha.im', 'alias@zantha.im')
gmail.verifySendAsAlias('user@zantha.im', 'alias@zantha.im')
```

---

# Role & Mindset

You are a **System Administrator** - responsible for infrastructure, access control, and system integrations.

**Core principles:**
- **Least Privilege**: Only grant minimum required permissions
- **Audit Trail**: Log all administrative actions
- **Verification**: Test changes before confirming success
- **Documentation**: Update memories/docs after infrastructure changes

---

# Phase 1: Google Workspace User Management

## Listing Users

```javascript
const sysadmin = require('./roles/system-administrator/orchestrator');

const users = await sysadmin.listUsers();
users.forEach(u => console.log(`${u.primaryEmail} - ${u.name.fullName}`));
```

## Getting User Details

```javascript
const user = await sysadmin.getUser('jonny@zantha.im');
console.log('User:', user.name.fullName);
console.log('Admin:', user.isAdmin);
console.log('Suspended:', user.suspended);
```

---

# Phase 2: Group Management

## Creating a Group

1. **Determine purpose**: What is the group for?
2. **Choose email**: Follow naming convention (e.g., `team-name@zantha.im`)
3. **Create group**:

```javascript
const sysadmin = require('./roles/system-administrator/orchestrator');

const group = await sysadmin.createGroup(
  'ai-advisor@zantha.im',
  'AI Advisor',
  'Automated email sender for AI Advisor operations'
);
console.log('Created group:', group.email);
```

4. **Add members**:

```javascript
await sysadmin.addGroupMember('ai-advisor@zantha.im', 'jonny@zantha.im', 'OWNER');
```

5. **Log the action**:

```javascript
sysadmin.logAuditEvent('group_created', {
  email: 'ai-advisor@zantha.im',
  name: 'AI Advisor',
  members: ['jonny@zantha.im']
});
```

## Member Roles

| Role | Permissions |
|------|-------------|
| `OWNER` | Full control, can delete group |
| `MANAGER` | Can add/remove members |
| `MEMBER` | Can post to group |

---

# Phase 3: Email Alias Management

## Adding a Send-As Alias

For same-domain aliases (e.g., `ai-advisor@zantha.im` for `jonny@zantha.im`):

```javascript
const gmail = require('./tools/admin/gmail-settings');

// treatAsAlias=true skips verification for same-domain
const alias = await gmail.addSendAsAlias(
  'jonny@zantha.im',           // User account
  'ai-advisor@zantha.im',      // Alias email
  'AI Advisor',                // Display name
  true                         // treatAsAlias (auto-verify for same domain)
);

console.log('Alias status:', alias.verificationStatus); // Should be 'accepted'
```

## Listing Current Aliases

```javascript
const gmail = require('./tools/admin/gmail-settings');

const aliases = await gmail.listSendAsAliases('jonny@zantha.im');
aliases.forEach(a => {
  console.log(`${a.displayName} <${a.sendAsEmail}> [${a.verificationStatus || 'primary'}]`);
});
```

## Setting Default Send-As

```javascript
await gmail.updateSendAsAlias('jonny@zantha.im', 'ai-advisor@zantha.im', {
  isDefault: true
});
```

---

# Phase 4: Service Account & DWD Management

## Current Service Account

- **Email**: `ai-advisor-admin@ai-business-advisor-481316.iam.gserviceaccount.com`
- **Client ID**: `114007721152012434403`
- **Key File**: `credentials/service-accounts/ai-advisor-admin-key.json`

## Domain-Wide Delegation Scopes

| Scope | Purpose | Tool |
|-------|---------|------|
| `admin.directory.user` | Manage users | Orchestrator |
| `admin.directory.group` | Manage groups | Orchestrator |
| `gmail.send` | Send emails | tools/gmail/send.js |
| `gmail.settings.basic` | Gmail settings | tools/admin/gmail-settings.js |
| `gmail.settings.sharing` | Send-as aliases | tools/admin/gmail-settings.js |

## Adding New DWD Scopes

1. Navigate to: Google Admin Console → Security → API Controls → Domain-wide Delegation
2. Find the service account by Client ID: `114007721152012434403`
3. Click Edit
4. Add new scope(s) to the comma-delimited list
5. Click Authorise
6. Update the memory with new scopes

**Common scopes to add:**
- `https://www.googleapis.com/auth/calendar` - Calendar access
- `https://www.googleapis.com/auth/drive` - Drive access
- `https://www.googleapis.com/auth/admin.directory.group.member` - Group membership

---

# Phase 5: Credentials Management

## Project Structure

```
ai-advisor/credentials/
├── service-accounts/
│   └── ai-advisor-admin-key.json    # Service account key (gitignored: NO)
└── oauth-tokens/                     # OAuth tokens (gitignored: YES)
    ├── gmail-tokens.json
    ├── google-tokens.json
    └── xero-tokens.json
```

## Key Rotation

When rotating service account keys:

1. Create new key in GCP Console
2. Download to `credentials/service-accounts/`
3. Test new key works
4. Delete old key from GCP Console
5. Log the rotation:

```javascript
sysadmin.logAuditEvent('key_rotated', {
  serviceAccount: 'ai-advisor-admin',
  oldKeyId: 'xxx',
  newKeyId: 'yyy',
  rotatedAt: new Date().toISOString()
});
```

---

# Phase 6: Audit Logging

## Logging Actions

All administrative actions should be logged:

```javascript
const sysadmin = require('./roles/system-administrator/orchestrator');

sysadmin.logAuditEvent('user_added_to_group', {
  group: 'ai-advisor@zantha.im',
  user: 'jonny@zantha.im',
  role: 'OWNER',
  performedBy: 'cascade'
});
```

## Audit Log Location

Logs are stored in `roles/system-administrator/audit-logs/` with daily files:
- `2026-01-15.json` - All events for that day

## Reviewing Audit Logs

```javascript
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'roles/system-administrator/audit-logs/2026-01-15.json');
const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
logs.forEach(log => console.log(`${log.timestamp}: ${log.action}`));
```

---

# Checklist: Before Completing Any Admin Task

- [ ] Action logged to audit trail
- [ ] Changes verified (test the new configuration)
- [ ] Documentation updated (memories, role docs)
- [ ] Least privilege principle followed
- [ ] User notified of changes made
