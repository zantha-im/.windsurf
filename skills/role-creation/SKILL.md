---
name: role-creation
description: Guides creation of new AI roles, skills, and workflows following best practices. Use when designing a new role, creating a skill for a role, or setting up the activation workflow. Triggers on: create role, new role, design role, role template, skill template, workflow template, role architecture.
---

# Skill: Role Creation

This skill guides the creation of new roles, skills, and workflows that follow the established architecture patterns.

---

## CRITICAL: Where to Create Files

**All roles, skills, and tools are shared infrastructure.** They MUST be created in the `.windsurf` **source repository**, never in:
- Subtree copies (e.g., `my-project/.windsurf/`)
- Consuming projects directly

### Why?
- Roles operate across the same business domains
- Tools developed for one role benefit others
- The subtree is the single source of truth for AI behavior

### Before Creating Any Files

1. **Verify you're in the source project** - The workspace should include the `.windsurf` source repo
2. **If in subtree context** - Stop and ask user to add source project to workspace
3. **Create files in source** - Then commit, push, and `/subtree-pull` to consuming projects

---

## Architecture Overview

### Component Summary

| Component | Purpose | Location | Invocation |
|-----------|---------|----------|------------|
| **Role** | Identity (WHO) | `.windsurf/roles/[domain\|generic]/` | Read by workflow |
| **Skill** | Procedures (HOW) | `.windsurf/skills/[skill-name]/` | `@skill-name` or automatic |
| **Workflow** | Activation (WHEN) | `.windsurf/workflows/` | `/workflow-name` |
| **Rule** | Constraints (MUST/MUST NOT) | `.windsurf/rules/` | Trigger-based |

### How Components Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    ALWAYS ACTIVE                            │
│  Rules (always_on): file-edit-safety, global constraints    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONTEXT-TRIGGERED                           │
│  Rules (model_decision): database-tooling, git-workflow     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ROLE ACTIVATION                            │
│  /workflow-name → reads role → invokes @skill               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  STANDALONE SKILLS                          │
│  @tool-development (invoked when writing scripts)           │
└─────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

- **Role = Identity (WHO)** - Professional identity, principles, constraints, communication style. Keep concise (~50-80 lines).
- **Skill = Procedures (HOW)** - Step-by-step workflows, checklists, templates, reference data. Can have supporting files.
- **Rule = Constraints (MUST/MUST NOT)** - Behavioral guidelines that apply across conversations. Orthogonal to roles.
- **Workflow = Activation (WHEN)** - Steps to load role, invoke skill, discover tools, verify connections.

### Skill Invocation Methods

| Method | How | When |
|--------|-----|------|
| **Automatic** | Cascade matches request to skill description | Progressive disclosure |
| **Manual** | Type `@skill-name` in Cascade | Direct invocation |
| **From Role** | Role references `Use @skill-name for...` | Role activation |

### Workflow Types

| Type | Purpose | Example |
|------|---------|---------|
| **Role Activation** | Activates a role and its skills | `/senior-developer` |
| **Standalone** | Orchestrates a task, may activate a role | `/css-audit` activates senior-developer then runs audit |
| **Utility** | Simple task, no role needed | `/subtree-pull` |

### Config-Driven Skills

Skills that need project-specific paths should use configuration files:

```
.windsurf/config/[role-name].json        # Project-specific config
.windsurf/config/[role-name].example.json # Template for new projects
.windsurf/config/README.md               # Documentation
```

**Pattern:** Skill reads config first, extracts paths, then uses them throughout.

### Rule Activation Modes

| Mode | When Applied | Example |
|------|--------------|---------|
| **always_on** | Every conversation | `file-edit-safety.md` |
| **model_decision** | Model decides based on description | `database-tooling.md` |
| **glob** | Files matching pattern | `*.css` → css rules |
| **manual** | Only via `@mention` | Rarely used |

---

## Workflow: Creating a New Role

Copy this checklist and track your progress:

```
New Role Progress:
- [ ] Step 0: Verify working in source repo (not subtree)
- [ ] Step 1: Determine role type (domain or generic)
- [ ] Step 2: Define role identity and core principles
- [ ] Step 3: Create role file from template
- [ ] Step 4: Create associated skill with procedures
- [ ] Step 5: Create activation workflow
- [ ] Step 6: Verify all paths are relative
- [ ] Step 7: Test activation with /workflow-name
- [ ] Step 8: Commit and push changes to source repo
- [ ] Step 9: Run /subtree-pull in consuming projects
```

---

## Step 1: Determine Role Type

| Type | Location | Orchestrator | When to Use |
|------|----------|--------------|-------------|
| **Domain** | `.windsurf/roles/domain/` | In consuming project | Project-specific context (folder IDs, business logic) |
| **Generic** | `.windsurf/roles/generic/` | In this subtree | Portable across any project |

**Ask:** Does this role need project-specific configuration (folder IDs, API keys, business rules)?
- **Yes** → Domain role
- **No** → Generic role

---

## Step 2: Define Role Identity

Before writing the role file, answer these questions:

1. **Identity:** What is this role's professional identity? (1-2 sentences)
2. **Core Principles:** What 3-5 principles guide this role's behavior?
3. **Expertise:** What areas does this role specialize in?
4. **Tools:** What tools/APIs does this role use?
5. **Constraints:** What must this role NOT do?
6. **Communication:** How should this role communicate?

---

## Step 3: Create Role File

Use this template:

```markdown
---
trigger: manual
category: [domain|generic]
home_project: [project-name]  # domain roles only
output_paths:                  # domain roles only
  - [role-name]/output/
---

# Role: [Role Name]

**Identity:** [1-2 sentence description of WHO this role is]

## Core Principles

- **[Principle 1]** - [Brief explanation]
- **[Principle 2]** - [Brief explanation]
- **[Principle 3]** - [Brief explanation]

## Expertise Areas

1. **[Area 1]** - [What this covers]
2. **[Area 2]** - [What this covers]

## Available Tools

- **[Tool 1]** - [Purpose]
- **[Tool 2]** - [Purpose]

## Database Access

**CRITICAL: Use Neon MCP for ALL database operations.**

Connection verification (required before any DB work):
1. Run `mcp1_list_projects` to confirm MCP connection
2. Run `mcp1_describe_project` with target projectId
3. Confirm: "Connected to Neon project: **[project name]**"

See `.windsurf/rules/database-tooling.md` for the complete protocol.

## Orchestrator

If an orchestrator exists at `roles/[role-name]/orchestrator.js`, run discovery first.

## Active Skill

Use `@[skill-name]` for detailed procedures.

## Communication Style

- [Style point 1]
- [Style point 2]

## Constraints

- **[Constraint 1]**: [What this role must NOT do]
- **[Constraint 2]**: [What this role must NOT do]
```

**Key rules:**
- Keep under 80 lines
- No procedural content (move to skill)
- Use relative paths only
- Reference skill with `@skill-name`

---

## Step 4: Create Associated Skill

Create folder: `.windsurf/skills/[skill-name]/`

Use this template for `SKILL.md`:

```markdown
---
name: [skill-name]
description: [Clear description of WHAT this skill does and WHEN to use it. Include trigger keywords. Max 1024 chars.]
---

# Skill: [Skill Name]

[Brief intro - what this skill provides]

## Workflow

Copy this checklist and track your progress:

\`\`\`
[Skill Name] Progress:
- [ ] Step 1: [First step]
- [ ] Step 2: [Second step]
- [ ] Step 3: [Third step]
\`\`\`

---

## [Procedure 1]

[Detailed steps for this procedure]

---

## [Procedure 2]

[Detailed steps for this procedure]

---

## Output Checklist

Before completing:
- [ ] [Verification 1]
- [ ] [Verification 2]
```

**Key rules:**
- Strong description with trigger keywords
- Include copyable workflow checklist
- Add supporting files in `references/` or `assets/` subdirectories
- Reference files with relative paths: `[references/file.md](references/file.md)`

---

## Step 5: Create Activation Workflow

Create: `.windsurf/workflows/[role-name].md`

Use this template:

```markdown
---
description: Activate [Role Name] role for [brief purpose]
---

# [Role Name] Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/[domain|generic]/[role-name].md`

This is a **[domain|generic] role**. [Additional context if needed]

## Step 2: Invoke Skill
Use `@[skill-name]` to load detailed procedures for [what the skill covers].

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

## Step 4: Discover Orchestrator
**If an orchestrator exists** at `roles/[role-name]/orchestrator.js`, run discovery to load available commands and capabilities.

// turbo
Run the orchestrator discovery command:
\`\`\`bash
node roles/[role-name]/orchestrator.js
\`\`\`

If no orchestrator exists, use the role definition, skill procedures, and shared tools directly.

## Step 5: Verify Database Connection
Run `mcp1_list_projects` to confirm Neon MCP is connected, then `mcp1_describe_project` with the target projectId.

Report the connection status with the **project name** (not ID).

## Step 6: Confirm Activation
Report to user:
- Current role: [Role Name]
- Orchestrator: [found/not found]
- Database: Connected to Neon project: **[project name]** (or "MCP not connected" if failed)
- Ask: "[Relevant question for this role]"
```

---

## Step 6: Verify Paths

Check all files for:
- ❌ Absolute paths starting with `/`
- ✅ Relative paths starting with `.windsurf/`
- ✅ Skill references using `@skill-name`

---

## Step 7: Test Activation

1. Run `/[role-name]` in Cascade
2. Verify role file is read
3. Verify skill is invoked
4. Verify orchestrator discovery (if applicable)
5. Verify database connection check

---

## Anti-Patterns

### ❌ DO NOT: Put procedures in roles
```markdown
## How to Generate Reports
1. Query the database
2. Format the data
3. Create the output file
```
→ Move to skill

### ❌ DO NOT: Use absolute paths
```markdown
- `/.windsurf/roles/domain/my-role.md`
```
→ Use `.windsurf/roles/domain/my-role.md`

### ❌ DO NOT: Reference skills by file path
```markdown
Read the skill file at `.windsurf/skills/my-skill/SKILL.md`
```
→ Use `@my-skill`

### ❌ DO NOT: Create one-off scripts
```javascript
// scripts/generate-report.js
```
→ Add to orchestrator, make discoverable

### ❌ DO NOT: Use bash commands in skills/workflows
```markdown
## Discovery
```bash
grep -rn "pattern" components/
find . -name "*.css" -empty
```
```
→ Use Windsurf tools instead:
```markdown
## Discovery
```
grep_search with Query="pattern" and SearchPath="components/" and FixedStrings=true
find_by_name with Pattern="*.css" and SearchDirectory="." and Type="file"
```
```

### ❌ DO NOT: Require tracking documents
```markdown
## Step 5: Create Tracking Document
Create `plans/audit.md` to track progress...
```
→ Keep workflows lean - track progress in conversation, not files

### ❌ DO NOT: Hardcode project-specific paths in skills
```markdown
Read the canonical reference at `C:\Users\Jonny\Code\my-project\...`
```
→ Use config files: `.windsurf/config/[role-name].json`

---

## Examples

### Existing Roles to Reference

| Role | Type | Skill | Good Example Of |
|------|------|-------|-----------------|
| `sales-analyst` | domain | `@product-sales-analysis` | Identity-focused role, data source hierarchy in skill |
| `company-secretary` | domain | `@corporate-governance` | Google Drive integration, e-signature workflow |
| `senior-developer` | generic | `@table-patterns`, `@css-audit`, etc. | Config-driven skills, multiple skills per role |
| `system-administrator` | generic | `@system-administration` | Infrastructure management |
