# Workflow Improvements - Implementation Instructions

## Overview
This document provides comprehensive instructions to fix ambiguities in the `/hello-ai` and `/context-critical` workflows that cause AI to skip required setup steps and jump to goal establishment prematurely.

## Problem Summary
- **hello-ai.md**: Missing Step 2, typo in Step 1 numbering, no explicit completion barriers
- **context-critical.md**: Critical schema query buried in NOTES section, no explicit sequencing between steps
- **Result**: AI interprets setup as optional and skips to final step

## Files to Modify
1. `.windsurf/workflows/hello-ai.md`
2. `.windsurf/workflows/context-critical.md`

---

## Change 1: Fix `hello-ai.md`

### Current State
```markdown
---
description: Initialize new conversations with goal establishment and approval gating
auto_execution_mode: 3
---

# Hello AI - A New Chat Conversation Initialization

## Purpose
This workflow establishes conversation goals, loads critical context files and sets approval gates

##Step 1 - Load Critical Conext
- Set the project working directory
/run context-critical

### Step 3: Establish Goal(s)
**AI ACTION REQUIRED**: 
 - Establish the goal of this conversation.
```

### Issues
1. Line 11: `##Step` should be `## Step` (missing space)
2. Line 11: Typo "Conext" should be "Context"
3. Line 11: Step numbering jumps from 1 to 3 (Step 2 missing)
4. No explicit "wait for completion" barrier between Step 1 and Step 3
5. Step 3 description is vague about what "establish goal" means

### Target State
Replace entire file content with:

```markdown
---
description: Initialize new conversations with goal establishment and approval gating
auto_execution_mode: 3
---

# Hello AI - A New Chat Conversation Initialization

## Purpose
This workflow establishes conversation goals, loads critical context files and sets approval gates.

**IMPORTANT: All steps must be completed sequentially. Do not skip steps.**

---

## Step 1: Load Critical Context (REQUIRED)
Execute the following workflow to load all essential context, guides, and database schema:

/run context-critical

**⚠️ Wait for Step 1 to complete before proceeding to Step 2.**

---

## Step 2: Establish Conversation Goal (REQUIRED)

**AI ACTION REQUIRED**: 

Based on the loaded context, establish the goal of this conversation:

1. **Summarize the current project state** - What has been completed, what's in progress, what's next
2. **Identify the user's intent** - Ask clarifying questions if the request is ambiguous
3. **Confirm understanding** - State back what you understand the goal to be
4. **Set expectations** - Explain what you will do and any constraints or dependencies

### Example Goal Statement
```
Goal: Implement Neon Auth integration with Stack Auth SDK
- Scope: Create auth pages (login, OTP, callback), implement middleware, test OTP flow
- Constraints: Must follow fail-fast error handling patterns from engineering guides
- Dependencies: Database schema already loaded; auth configuration needed from user
- Approval: Seeking user approval before making code changes
```

---

## Workflow Completion Checklist

Before proceeding with actual work, verify:
- ✅ All commands in `context-critical` Step 1 have been executed
- ✅ All guide workflows (core, API, UI) have completed
- ✅ Database schema has been loaded via `schema-query.js --index`
- ✅ You have reviewed the loaded guides and schema information
- ✅ Conversation goal has been established and confirmed with user

Only after all items are checked should you proceed with implementation.
```

### Implementation Steps
1. Open `.windsurf/workflows/hello-ai.md`
2. Delete all content
3. Paste the target state above
4. Save file

---

## Change 2: Fix `context-critical.md`

### Current State
```markdown
---
description: Essential context refresh for AI conversations
auto_execution_mode: 3
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

## Step 1: Understand your core tools
Set the project working directory then run the following commands to determine the tool usage.
```bash
cmd /c node .windsurf\tools\schema-query.js --help
```

```bash
cmd /c node .windsurf\tools\file-delete.js --help
```

```bash
cmd /c npm run --prefix .windsurf\review review:repo -- --help
```

## Step 2- Load Core Engineering Guides (Always)
These short guides are always relevant and should be loaded for any task.
/run load-core-guides

## Step 3 - Load Task-Specific Guides
- API/server/auth/networking:
  /run load-api-guides
- UI/React/components/hooks:
  /run load-ui-guides

## Step 4 - Workng with Window cmd
  /run context-cmd

# NOTES
## Git commit messages (required convention)
- Use no-spaces commit messages to avoid shell/quoting issues.
- Example: `git commit -m docs_update_ui_guidelines` (good)
- Avoid: `git commit -m "docs: update ui guidelines"` (spaces not allowed by convention)

## Load Current Schema Index
```bash
cmd /c node .windsurf\tools\schema-query.js --index
```
```

### Issues
1. Step 1 commands are in code blocks without explicit "run these" instructions
2. Step 2 has typo: "Step 2-" should be "Step 2:"
3. Step 4 has typo: "Workng" should be "Working"
4. Critical schema query is buried in NOTES section (appears optional)
5. No explicit "wait for completion" barriers between steps
6. No statement that all steps must complete before workflow is done

### Target State
Replace entire file content with:

```markdown
---
description: Essential context refresh for AI conversations
auto_execution_mode: 3
---

# Critical Context Refresh

This workflow loads the most critical constraints and patterns that AIs regularly forget, plus ways of working and current schema information.

**IMPORTANT: All steps must be completed sequentially. Do not skip steps.**

---

## Step 1: Understand Your Core Tools (REQUIRED)

Run the following commands to understand available tools:

### 1a. Schema Query Tool
```bash
cmd /c node .windsurf\tools\schema-query.js --help
```

### 1b. File Delete Tool
```bash
cmd /c node .windsurf\tools\file-delete.js --help
```

### 1c. Code Review Tool
```bash
cmd /c npm run --prefix .windsurf\review review:repo -- --help
```

**⚠️ All three commands above must complete before proceeding to Step 2.**

---

## Step 2: Load Core Engineering Guides (REQUIRED)

These short guides are always relevant and should be loaded for any task.

/run load-core-guides

**⚠️ Wait for Step 2 to complete before proceeding to Step 3.**

---

## Step 3: Load Task-Specific Guides (REQUIRED)

Choose based on your task:

- **For API/server/auth/networking tasks:**
  /run load-api-guides

- **For UI/React/components/hooks tasks:**
  /run load-ui-guides

**⚠️ Wait for Step 3 to complete before proceeding to Step 4.**

---

## Step 4: Load Windows CMD Context (REQUIRED)

/run context-cmd

**⚠️ Wait for Step 4 to complete before proceeding to Step 5.**

---

## Step 5: Load Current Database Schema (REQUIRED)

Run this command to inspect the current database schema:

```bash
cmd /c node .windsurf\tools\schema-query.js --index
```

This provides the schema index. Use this to query specific tables as needed:

```bash
cmd /c node .windsurf\tools\schema-query.js --table <table_name>
```

**⚠️ All steps above must complete before this workflow is considered finished.**

---

# Reference: Important Conventions

## Git Commit Messages (Required Convention)
- Use no-spaces commit messages to avoid shell/quoting issues.
- Example: `git commit -m docs_update_ui_guidelines` (good)
- Avoid: `git commit -m "docs: update ui guidelines"` (spaces not allowed by convention)

## Schema Query Examples
Once you have the schema index, use these commands to explore:

```bash
# View specific table
cmd /c node .windsurf\tools\schema-query.js --table products

# View tables matching pattern
cmd /c node .windsurf\tools\schema-query.js --pattern stock_*

# Execute custom SQL
cmd /c node .windsurf\tools\schema-query.js --sql "SELECT COUNT(*) FROM products"

# Execute SQL from file with pagination
cmd /c node .windsurf\tools\schema-query.js --sql-file path/to/query.sql --page 1 --page-size 10
```
```

### Implementation Steps
1. Open `.windsurf/workflows/context-critical.md`
2. Delete all content
3. Paste the target state above
4. Save file

---

## Verification Checklist

After making changes, verify:

- [ ] `hello-ai.md` has correct numbering (Step 1, Step 2, no gaps)
- [ ] `hello-ai.md` has explicit "wait for completion" barriers
- [ ] `hello-ai.md` includes workflow completion checklist
- [ ] `context-critical.md` has all 5 steps clearly numbered
- [ ] `context-critical.md` has "REQUIRED" labels on all steps
- [ ] `context-critical.md` has explicit "wait for completion" barriers between steps
- [ ] `context-critical.md` schema query moved from NOTES to Step 5
- [ ] All typos fixed (Conext→Context, Workng→Working, Step 2-→Step 2:)
- [ ] Schema query examples added to Reference section
- [ ] Both files start with "IMPORTANT: All steps must be completed sequentially"

---

## Testing the Changes

After implementing, test by:

1. Start a new conversation
2. Run `/hello-ai` workflow
3. Verify that:
   - Step 1 executes all context-critical steps (including schema query)
   - No steps are skipped
   - AI waits for each step to complete before proceeding
   - Goal establishment step is clear and interactive
   - AI does not jump to implementation without confirming goal

---

## Expected Outcomes

### Before Changes
- AI skips setup steps and jumps to goal establishment
- Schema query is treated as optional reference
- Workflow sequencing is ambiguous

### After Changes
- AI executes all steps sequentially
- Each step has explicit completion barriers
- Schema query is part of required Step 5
- Goal establishment is clear and interactive
- No ambiguity about required vs optional steps
