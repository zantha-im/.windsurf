# Skill Template

Use this template when creating a new skill file.

Create folder: `.windsurf/skills/[skill-name]/`

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

## Key Rules

- Strong description with trigger keywords
- Include copyable workflow checklist
- **Keep SKILL.md under ~200 lines** - extract detailed content to reference files
- Add supporting files in `references/` or `assets/` subdirectories
- Reference files with relative paths: `[references/file.md](references/file.md)`

## Skill Length Best Practice

**SKILL.md should be a concise orchestrator, not a comprehensive manual.**

| Content Type | Location | Example |
|--------------|----------|---------|
| Workflow overview | SKILL.md | Checklist, stage summaries |
| Detailed procedures | `references/` | Step-by-step guides |
| Templates | `references/` | Role/skill/workflow templates |
| Reference data | `references/` | Lookup tables, mappings |
| Assets | `assets/` | HTML templates, images |

**Why?**
- Shorter skills load faster and are easier to follow
- Reference files can be read on-demand (progressive disclosure)
- Updates to templates don't bloat the main skill file
- Easier to maintain and test individual components
