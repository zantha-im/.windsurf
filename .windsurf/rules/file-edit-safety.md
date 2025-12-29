---
trigger: always_on
description: Prevents accidental file regressions by requiring read-before-edit and diff awareness for large files.
---
Tags: safety, editing, regression-prevention

## When this rule applies
- **Always** - this is a safety rule that applies to all file edits

## Rule: Read Before Edit
Before editing ANY file >50 lines:
1. **MUST** call `read_file` first to understand current state
2. **MUST NOT** regenerate entire files - use targeted `edit` or `multi_edit` only
3. **MUST** preserve existing functionality unless explicitly asked to remove it

## Rule: No Silent Simplification
If an edit would:
- Remove columns from a table component
- Remove fields from an interface/type
- Remove imports that appear used
- Reduce file size by >20%
- Replace a complex implementation with a simpler one

Then **STOP** and confirm with user: "This edit will remove [X]. Proceed?"

## Rule: Interface/Type Changes
When modifying TypeScript interfaces or types:
1. Search for all usages before removing fields
2. Never remove fields without explicit instruction
3. Adding fields is safe; removing fields requires confirmation

## Rule: Checkpoint Commits
When making commits:
1. List ALL files being changed
2. Summarize the nature of changes per file (not just "checkpoint" or "WIP")
3. If a file is being simplified, explicitly note what is being removed