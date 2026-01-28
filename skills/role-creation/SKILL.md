---
name: role-creation
description: Guides creation of AI roles, skills, and workflows. Use when designing a new role, refining roles based on feedback, creating skills, or setting up activation workflows.
---

# Skill: Role Creation & Refinement

This skill guides the creation of new roles and the iterative refinement of existing ones based on real-world feedback when they fail to act as expected.

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

| Component    | Purpose                     | Location                             | Invocation                 |
| ------------ | --------------------------- | ------------------------------------ | -------------------------- |
| **Role**     | Identity (WHO)              | `.windsurf/roles/[domain\|generic]/` | Read by workflow           |
| **Skill**    | Procedures (HOW)            | `.windsurf/skills/[skill-name]/`     | `@skill-name` or automatic |
| **Workflow** | Activation (WHEN)           | `.windsurf/workflows/`               | `/workflow-name`           |
| **Rule**     | Constraints (MUST/MUST NOT) | `.windsurf/rules/`                   | Trigger-based              |

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

| Method        | How                                          | When                   |
| ------------- | -------------------------------------------- | ---------------------- |
| **Automatic** | Cascade matches request to skill description | Progressive disclosure |
| **Manual**    | Type `@skill-name` in Cascade                | Direct invocation      |
| **From Role** | Role references `Use @skill-name for...`     | Role activation        |

### Workflow Types

| Type                | Purpose                                  | Example                                                 |
| ------------------- | ---------------------------------------- | ------------------------------------------------------- |
| **Role Activation** | Activates a role and its skills          | `/senior-developer`                                     |
| **Standalone**      | Orchestrates a task, may activate a role | `/css-audit` activates senior-developer then runs audit |
| **Utility**         | Simple task, no role needed              | `/subtree-pull`                                         |

### Config-Driven Skills

Skills that need project-specific paths should use configuration files:

```
.windsurf/config/[role-name].json        # Project-specific config
.windsurf/config/[role-name].example.json # Template for new projects
.windsurf/config/README.md               # Documentation
```

**Pattern:** Skill reads config first, extracts paths, then uses them throughout.

### Rule Activation Modes

| Mode               | When Applied                       | Example               |
| ------------------ | ---------------------------------- | --------------------- |
| **always_on**      | Every conversation                 | `file-edit-safety.md` |
| **model_decision** | Model decides based on description | `database-tooling.md` |
| **glob**           | Files matching pattern             | `*.css` → css rules   |
| **manual**         | Only via `@mention`                | Rarely used           |

---

## Workflow: Refining an Existing Role

Use this workflow when a role fails to act as expected. Copy this checklist:

```
Role Refinement Progress:
- [ ] Step 1: Gather failure details (what happened vs expected)
- [ ] Step 2: Identify the component (role, skill, workflow, or rule)
- [ ] Step 3: Read the relevant file(s)
- [ ] Step 4: Diagnose root cause
- [ ] Step 5: Propose fix (confirm with user before editing)
- [ ] Step 6: Apply targeted edit
- [ ] Step 7: Test the fix
- [ ] Step 8: Commit and push changes to source repo
- [ ] Step 9: Run /subtree-pull in consuming projects
```

### Gathering Failure Details

Ask the user:
1. **What role/workflow were you using?** (e.g., `/sales-analyst`)
2. **What did you ask it to do?**
3. **What actually happened?** (copy/paste the problematic output if possible)
4. **What did you expect to happen?**

### Diagnosing Root Cause

Common failure patterns:

| Symptom                   | Likely Cause           | Fix Location       |
| ------------------------- | ---------------------- | ------------------ |
| Role ignores instructions | Missing/weak principle | Role file          |
| Wrong procedure followed  | Skill steps unclear    | Skill file         |
| Skips important step      | Missing workflow step  | Workflow file      |
| Does something forbidden  | Missing constraint     | Role or rule file  |
| Uses wrong tool           | Tool guidance missing  | Role or skill file |
| Wrong output location     | Path not specified     | Skill file         |

### Applying Fixes

**Principle:** Make minimal, targeted edits. Don't rewrite entire files.

1. **Add missing principle** → Edit role's Core Principles section
2. **Clarify procedure** → Edit skill's workflow steps
3. **Add constraint** → Edit role's Constraints section
4. **Fix workflow order** → Edit workflow steps
5. **Add rule** → Create/edit rule file if behavior should apply globally

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

| Type        | Location                   | Orchestrator         | When to Use                                           |
| ----------- | -------------------------- | -------------------- | ----------------------------------------------------- |
| **Domain**  | `.windsurf/roles/domain/`  | In consuming project | Project-specific context (folder IDs, business logic) |
| **Generic** | `.windsurf/roles/generic/` | In this subtree      | Portable across any project                           |

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

Use the role template: [references/role-template.md](references/role-template.md)

**Key rules:**
- Keep under 80 lines
- No procedural content (move to skill)
- Use relative paths only
- Reference skill with `@skill-name`

---

## Step 4: Create Associated Skill

Create folder: `.windsurf/skills/[skill-name]/`

Use the skill template: [references/skill-template.md](references/skill-template.md)

**Key rules:**
- **CRITICAL: Description must be under 200 characters** - longer descriptions won't appear in Windsurf's Skills panel
- Follow the description pattern: `[Brief purpose]. Use when [trigger words], or needs to [actions].`
- Include copyable workflow checklist
- **Keep SKILL.md under ~200 lines** - extract detailed content to reference files
- Add supporting files in `references/` or `assets/` subdirectories
- Reference files with relative paths: `[references/file.md](references/file.md)`

### Skill Description Formula

```
[Brief purpose]. Use when [trigger words], or needs to [actions].
```

**Example (good - 163 chars):**
```
Guides evidence-based legal investigations. Use when gathering evidence, analyzing emails/Slack, creating chronologies, or compiling advocate packages.
```

**Example (bad - 450+ chars, won't appear):**
```
Conducts evidence-based investigations with neutral fact-finding, evidence gathering from emails/Slack, chronological analysis, and advocate package creation. Use when starting a new investigation, gathering evidence, analyzing communications, creating legal packages, or documenting findings. Triggers on: investigation, evidence gathering, fact-finding, legal package, advocate package, email analysis, Slack analysis, chronology.
```

---

## Step 5: Create Activation Workflow

Create: `.windsurf/workflows/[role-name].md`

Use the workflow template: [references/workflow-template.md](references/workflow-template.md)

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

See [references/anti-patterns.md](references/anti-patterns.md) for common mistakes to avoid, including:
- Putting procedures in roles
- Using absolute paths
- Referencing skills by file path
- Creating one-off scripts
- Using bash commands instead of Windsurf tools
- Requiring tracking documents
- Hardcoding project-specific paths
- Creating long monolithic skills

---

## Examples

### Existing Roles to Reference

| Role                   | Type    | Skill                                 | Good Example Of                                       |
| ---------------------- | ------- | ------------------------------------- | ----------------------------------------------------- |
| `sales-analyst`        | domain  | `@product-sales-analysis`             | Identity-focused role, data source hierarchy in skill |
| `company-secretary`    | domain  | `@corporate-governance`               | Google Drive integration, e-signature workflow        |
| `senior-developer`     | generic | `@table-patterns`, `@css-audit`, etc. | Config-driven skills, multiple skills per role        |
| `system-administrator` | generic | `@system-administration`              | Infrastructure management                             |
