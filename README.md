# .windsurf Subtree

Portable developer tooling and documentation shared across Windsurf projects. The `.windsurf/` folder is managed as a Git subtree pointing to an independent repository so that improvements can be pushed from one project and pulled into others without coupling main project history.

What this contains:
- `.windsurf/tools/`: reusable tool modules (Google APIs, PDF processing)
- `.windsurf/roles/`: role definitions (generic and domain-specific)
- `.windsurf/skills/`: detailed procedures for each role (invoked via `@skill-name`)
- `.windsurf/workflows/`: activation workflows and runbooks
- `.windsurf/rules/`: conditional rules for specific contexts

Policy and intent:
- Treat `.windsurf/` as a portable, shared subtree. Make improvements here, publish them upstream to the subtree repo, and consume them in other projects via subtree pulls.
- Keep your main project history independent by using `--squash` when adding/pulling.

Repository source (upstream of this subtree):
- Remote name: `windsurf_subtree`
- Remote URL: `https://github.com/zantha-im/.windsurf.git`

## Quick start

- New project (no `.windsurf/` yet):
  - Bootstrap manually (commands in Section 1 below)

- Existing project (already has `.windsurf/`):
  - Run workflow: `/subtree-pull` (Update existing installation)

## 1) Getting started in a new project (no workflows yet)

Manual bootstrap:
```cmd
cmd /c git remote add windsurf_subtree https://github.com/zantha-im/.windsurf.git
cmd /c git fetch windsurf_subtree
cmd /c git subtree add --prefix=.windsurf windsurf_subtree main --squash
cmd /c npm --prefix .windsurf\review ci
```

After bootstrap:
- Workflows are now available under `.windsurf/workflows/`.
- Read `.windsurf/tools/README.md` for available tool modules and extension patterns.

## 2) Using Roles

Activate a role via its workflow (e.g., `/company-secretary`, `/senior-developer`). The workflow will:
1. Load the role definition from `.windsurf/roles/`
2. Invoke the associated skill via `@skill-name` for detailed procedures
3. Discover tools and orchestrator (if one exists in the project)
4. Verify database connection (if applicable)

### Available Roles

| Role | Type | Skill | Workflow |
|------|------|-------|----------|
| Senior Developer | generic | — | `/senior-developer` |
| System Administrator | generic | `@system-administration` | `/system-administrator` |
| Role Master | generic | `@role-creation` | `/role-master` |
| Company Secretary | domain | `@corporate-governance` | `/company-secretary` |
| Legal Researcher | domain | `@investigation-protocols` | `/legal-researcher` |
| Sales Analyst | domain | `@product-sales-analysis` | `/sales-analyst` |

### Role Categories

| Category | Description |
|----------|-------------|
| **Generic** | Portable across any project. Orchestrators live in this subtree. |
| **Domain** | Project-specific output paths. Orchestrators live in consuming projects. |

### Creating New Roles

Use `/role-master` to create new roles, skills, and workflows following best practices.

### Creating Project-Specific Tools

Use `@tool-development` skill for patterns on:
- Creating a bridge module (`tools/google-client.js`)
- Building role orchestrators with CLI discovery
- Converting one-off scripts into reusable tools

## 3) Everyday use with workflows

Once the project contains `.windsurf/workflows/`, use these:

- Subtree pull (bring down latest upstream improvements into this project)
  - See: `.windsurf/workflows/subtree-pull.md`
  - Supports both Bootstrap (first-time) and Update (existing installation)

Notes and troubleshooting:
- Conflicts, if any, will be limited to files under `.windsurf/`. Resolve, then `cmd /c git add -A` and `cmd /c git commit`.
- To keep repos independent, always use `--squash` for `subtree add/pull`.
- If the upstream main branch is protected, push your split to a feature branch (e.g., `project-<name>`) in the subtree repo and open a PR there.
