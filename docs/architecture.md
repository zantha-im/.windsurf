# Windsurf Architecture: Workflows, Roles, Skills, and Rules

This document describes how the components of the `.windsurf` subtree work together to create an informed AI that plays its role effectively.

---

## Component Overview

| Component | Purpose | Location | Invocation |
|-----------|---------|----------|------------|
| **Workflow** | Activation sequence | `.windsurf/workflows/` | `/workflow-name` slash command |
| **Role** | Identity & constraints | `.windsurf/roles/` | Read by workflow |
| **Skill** | Procedures & knowledge | `.windsurf/skills/` | `@skill-name` or automatic |
| **Rule** | Behavioral constraints | `.windsurf/rules/` | Trigger-based (always-on, glob, model_decision) |

---

## How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    ALWAYS ACTIVE                            │
│  Rules (always_on): file-edit-safety, global constraints    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONTEXT-TRIGGERED                           │
│  Rules (model_decision): database-tooling, git-workflow,    │
│                          css-architecture, etc.             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ROLE ACTIVATION                            │
│  /sales-analyst → reads role → invokes @skill               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  STANDALONE SKILLS                          │
│  @tool-development (invoked when writing scripts)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Separation of Concerns

### Role = Identity (WHO)
- Professional identity and expertise
- Core principles and constraints
- Communication style
- Available tools (list only)
- Reference to active skill

**Roles should be concise (~50-80 lines).** Move procedural content to skills.

### Skill = Procedures (HOW)
- Step-by-step workflows
- Checklists and templates
- Reference data and examples
- Supporting resource files

**Skills can have supporting files** in their folder (templates, examples, reference docs).

### Rule = Constraints (MUST/MUST NOT)
- Behavioral guidelines that apply across conversations
- Coding style preferences
- Safety constraints
- Project conventions

**Rules are orthogonal to roles** - they apply based on trigger conditions regardless of active role.

### Workflow = Activation (WHEN)
- Steps to load role and skill
- Tool discovery
- Orchestrator execution
- Database connection verification

---

## Skill Invocation

### Automatic (Progressive Disclosure)
Cascade reads skill descriptions and automatically invokes when a request matches.

### Manual
Type `@skill-name` in Cascade input.

### From Role
Roles reference their active skill:
```markdown
## Active Skill
Use `@product-sales-analysis` for detailed procedures.
```

---

## Domain vs Generic Roles

| Type | Location | Orchestrator | Maintained By |
|------|----------|--------------|---------------|
| **Domain** | `.windsurf/roles/domain/` | `project/roles/[role]/orchestrator.js` | Consuming project |
| **Generic** | `.windsurf/roles/generic/` | `.windsurf/roles/generic/[role]/orchestrator.js` | This subtree |

**Domain roles** have project-specific context (folder IDs, business logic).

**Generic roles** are portable across any project.

---

## File Path Conventions

Since this project is a git subtree embedded in other projects:

| Reference Type | Format | Example |
|----------------|--------|---------|
| **Skills** | By name | `@product-sales-analysis` |
| **Roles** | Relative path | `.windsurf/roles/domain/sales-analyst.md` |
| **Rules** | Relative path | `.windsurf/rules/database-tooling.md` |
| **Skill resources** | Relative to skill | `references/data-sources.md` |

**Never use absolute paths** starting with `/` - they won't work when the subtree is embedded.

---

## Rule Activation Modes

| Mode | When Applied | Example |
|------|--------------|---------|
| **always_on** | Every conversation | `file-edit-safety.md` |
| **model_decision** | Model decides based on description | `database-tooling.md` |
| **glob** | Files matching pattern | `*.css` → css rules |
| **manual** | Only via `@mention` | Rarely used |

---

## Orchestrator Pattern

Every role can have an orchestrator that provides:
- CLI discovery (run with no args shows help)
- Project-specific business logic
- Reusable tool functions

**Key principle:** Don't write one-off scripts. Convert automation into orchestrator tools.

See `@tool-development` skill for patterns.

---

## Quick Reference

### Activate a role
```
/sales-analyst
```

### Invoke a skill directly
```
@product-sales-analysis
```

### Check orchestrator capabilities
```bash
node roles/sales-analyst/orchestrator.js
```

### Verify database connection
```
mcp1_list_projects
mcp1_describe_project
```
