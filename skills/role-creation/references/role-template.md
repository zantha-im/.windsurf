# Role Template

Use this template when creating a new role file.

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

## Key Rules

- Keep under 80 lines
- No procedural content (move to skill)
- Use relative paths only
- Reference skill with `@skill-name`
