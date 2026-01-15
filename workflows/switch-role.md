---
description: Switch between advisor roles or check current role status
---

# Role Switcher

Use this workflow to check current role or switch between roles.

## Step 1: Check Current Role
Query current state from database via Neon MCP (`jolly-bonus-08718721`):
```sql
SELECT key, value, updated_at FROM advisor_state;
```

## Step 2: Infer or Confirm Role
Based on user's request, determine which role is needed:

| Request Pattern | Suggested Role |
|-----------------|----------------|
| Investigation, evidence, advocate package | Legal Researcher |
| Minutes, resolution, board meeting, contract | Company Secretary |
| Financial analysis, strategy, contracts review | Business Advisor |
| Users, groups, email aliases, service accounts, API access | System Administrator |

If unclear, ask: "This could be handled by [Role A] or [Role B]. Which role should I activate?"

## Step 3: Activate Selected Role
Run the appropriate workflow:
- `/business-advisor` - Financial and strategic analysis
- `/legal-researcher` - Investigations and evidence gathering
- `/company-secretary` - Corporate governance and documentation
- `/system-administrator` - Infrastructure and access management

## Available Roles

### Business Advisor
- Financial analysis (P&L, balance sheets, cash flow)
- Contract review and optimization
- Strategic insights and pattern recognition

### Legal Researcher
- Investigation management
- Evidence gathering (email, Slack, documents)
- Advocate package compilation

### Company Secretary
- Board meeting minutes
- Written and board resolutions
- Contract management
- Statutory registers

### System Administrator
- Google Workspace user and group management
- Email alias configuration (send-as)
- Service account and DWD scope management
- Credentials and API integration
