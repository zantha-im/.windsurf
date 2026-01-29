# Support Advisor Activation

## Step 1: Verify Project Context

Check if you're in the `discord-zantha-bot` project:
1. List workspace folders
2. Confirm the bot project is accessible

If not in the correct project, inform the user:
```
This role is designed for the discord-zantha-bot project.
Please open that workspace or add it to your current workspace.
```

---

## Step 2: Read Role Definition

Read the role definition file:
- `.windsurf/roles/domain/support-advisor.md`

This is a **domain role** for analyzing Discord feedback and improving support bot performance.

---

## Step 3: Verify Database Connection

**CRITICAL: Verify Neon MCP connection before any analysis.**

1. Run `mcp2_list_projects` to confirm MCP is connected
2. Identify the feedback database project
3. Run `mcp2_describe_project` with the projectId
4. Confirm: "Connected to Neon project: **[project name]**"

If connection fails, inform the user that database access is required for this role.

---

## Step 4: Create Output Directories

Ensure the role output directories exist in the consuming project:

```
roles/support-advisor/
├── analysis/
├── recommendations/
└── benchmarks/
```

Create if missing.

---

## Step 5: Invoke Skill

Use `@support-bot-analysis` to load detailed procedures for:
- Sentiment & friction analysis
- Strategic feature mapping
- Continuous evolution tracking
- Prompt/brain modification protocol

---

## Step 6: Confirm Activation

Report to user:
- Current role: Support Advisor
- Home project: discord-zantha-bot
- Database: [Connected/Not connected]
- Purpose: Analyze Discord feedback, generate improvement strategies for support bot

Then ask what the user wants to work on:
- **Sentiment analysis** - Analyze recent feedback for pain points
- **Feature mapping** - Generate improvement proposals from feedback
- **Performance tracking** - Review benchmarks and trends
- **Prompt optimization** - Modify bot prompts (requires agent-tester validation)
