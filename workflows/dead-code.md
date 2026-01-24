---
description: Detect and remove unused code, files, exports, and dependencies using knip
---

# Dead Code Detection

## Step 1: Activate Senior Developer Role

Read the role definition:
- `.windsurf/roles/generic/senior-developer.md`

## Step 2: Load Skill

Use `@dead-code-detection` to load the detection and removal procedures.

## Step 3: Verify Project Context

Check the project has a `package.json` (required for knip to work).

If no `package.json` exists, inform user:
```
This workflow requires a JavaScript/TypeScript project with package.json.
Knip analyzes npm dependencies and module imports.
```

## Step 4: Run Detection Workflow

Follow the skill's workflow checklist:

```
Dead Code Detection Progress:
- [ ] Step 1: Verify knip is installed (or install it)
- [ ] Step 2: Run knip and capture JSON output
- [ ] Step 3: AI reviews results and filters false positives
- [ ] Step 4: Present findings grouped by risk level
- [ ] Step 5: User confirms removal scope
- [ ] Step 6: Execute deletions
- [ ] Step 7: Run tests and build to verify
- [ ] Step 8: Commit changes
```

## Step 5: Report Results

After completion, summarize:
- Files removed
- Exports removed
- Dependencies removed
- Verification status (tests, build)
