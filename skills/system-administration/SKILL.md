---
name: system-administration
description: Use this skill for infrastructure management including Google Workspace administration, credentials management, service accounts, and API integrations.
---

# Orchestrator Discovery

**CRITICAL: If an orchestrator exists, always run discovery first.**

```bash
node .windsurf/roles/generic/system-administrator/orchestrator.js
```

This reveals available commands and capabilities specific to the current project.

---

# CRITICAL: Database Access

**Use Neon MCP for ALL database operations. NEVER write ad-hoc Node.js scripts for database access.**

See `/.windsurf/rules/database-tooling.md` for the complete Neon MCP tool reference.

## External APIs

For Google Workspace operations, use the appropriate Google APIs directly:
- **Admin SDK** - User and group management
- **Gmail API** - Send-as alias configuration

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

Use Google Admin SDK for user management operations.

---

# Phase 2: Group Management

Use Google Admin SDK for group management operations.

## Member Roles

| Role | Permissions |
|------|-------------|
| `OWNER` | Full control, can delete group |
| `MANAGER` | Can add/remove members |
| `MEMBER` | Can post to group |

---

# Phase 3: Email Alias Management

Use Gmail API for send-as alias management.

**Key points:**
- `treatAsAlias=true` skips verification for same-domain aliases
- Same-domain aliases auto-verify with status `'accepted'`

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
| `gmail.send` | Send emails | Orchestrator |
| `gmail.settings.basic` | Gmail settings | Orchestrator |
| `gmail.settings.sharing` | Send-as aliases | Orchestrator |
| `admin.directory.group.member` | Group membership | Orchestrator |

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
5. Log the rotation in database via Neon MCP

---

# Phase 6: Audit Logging

All administrative actions should be logged via Neon MCP.

## Audit Log Location

Logs can be stored in:
- Database: `audit_logs` table (preferred, use Neon MCP)
- Local files: `roles/system-administrator/audit-logs/` with daily JSON files

---

# Checklist: Before Completing Any Admin Task

- [ ] Action logged to audit trail
- [ ] Changes verified (test the new configuration)
- [ ] Documentation updated (memories, role docs)
- [ ] Least privilege principle followed
- [ ] User notified of changes made
