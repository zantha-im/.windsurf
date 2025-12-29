---
trigger: model_decision
description: Git commit and branch management rules to prevent regressions and maintain clean history.
---
Tags: git, workflow, safety, commits

## When to use this rule
- **Any git operation** (commit, merge, checkout, push)
- **Branch switching**
- **Multi-file changes**

## Commit Hygiene
1. **Atomic commits** - One logical change per commit
2. **Descriptive messages** - No "checkpoint", "WIP", or "updates" without context
3. **Review diffs** - Before committing, verify each file's changes make sense together
4. **File-by-file awareness** - If committing 10+ files, list them and their change type

## Branch Safety
1. **Never force-push** to main or production branches
2. **Pull before branching** - Ensure local is up-to-date with remote
3. **Stale branch warning** - If a branch hasn't been updated in >7 days, warn before merging

## Merge Conflicts
1. **Never auto-resolve** - Always ask user to review conflicts
2. **Preserve both sides** when uncertain - let user decide what to keep

## Push Protocol
1. **Never push to main** without explicit user permission
2. **Clarify intent** - If user says "push", ask: "Push dev to origin, or merge to main?"
3. **Test before main** - Remind user to test locally before pushing to main