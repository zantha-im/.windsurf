---
name: dead-code-detection
description: Detects and removes unused code, files, exports, and dependencies using knip. Use when cleaning up technical debt, removing unused components, finding dead exports, auditing dependencies, or preparing for a major refactor. Triggers on: dead code, unused code, unused files, unused exports, unused dependencies, technical debt cleanup, knip, code cleanup, remove unused, find dead code.
---

# Skill: Dead Code Detection

Hybrid approach using **knip** for detection and **AI judgment** for safe removal. Prevents wasted effort from other workflows enumerating dead code.

---

## When to Use This Skill

- Project has accumulated unused files/components over time
- Other workflows are fixing or enumerating dead code
- Preparing for a major refactor or version bump
- Periodic maintenance to reduce technical debt
- After removing a feature to clean up orphaned code

---

## Workflow

Copy this checklist and track your progress:

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

---

## Step 1: Verify Knip Installation

### Check if knip is installed

```bash
npm list knip
```

If installed, output shows version. If not, you'll see `empty` or an error.

### Install if missing

**Recommended (creates config + adds script):**
```bash
npm init @knip/config
```

This automatically:
- Installs `knip` as devDependency
- Creates `knip.json` with sensible defaults
- Adds `"knip": "knip"` script to package.json

**Manual install (if you prefer):**
```bash
npm install -D knip typescript @types/node
```

Then add to package.json scripts:
```json
"scripts": {
  "knip": "knip"
}
```

**Note:** See [references/knip-config.md](references/knip-config.md) for advanced configuration.

---

## Step 2: Run Knip Analysis

### Quick overview (human-readable)
```bash
npm run knip
```

Or if not in scripts:
```bash
npx knip
```

### For large projects - limit output
```bash
npx knip --max-show-issues 10
```

### JSON output for AI processing

**IMPORTANT:** Always output to a file to avoid truncation.

**Output location:** `roles/senior-developer/` in the consuming project (NOT in `.windsurf/` subtree).

**Step 1: Create output folder (if needed)**
```bash
mkdir -p roles/senior-developer
```

**Step 2: Run knip with JSON output**

**IMPORTANT:** Exclude the `.windsurf/` subtree - it's shared tooling, not project code.

```bash
npx knip --reporter json --ignore ".windsurf/**" > roles/senior-developer/knip-report.json
```

Or add to `knip.json` config (preferred):
```json
{
  "ignore": [".windsurf/**"]
}
```

**Step 3: Read results**

**CRITICAL:** You MUST use the `read_file` tool to read the JSON file. Do NOT:
- Use `cat` or `type` commands (output will be truncated)
- Try to read command output directly (will be truncated)
- Use `run_command` to view the file

**Correct approach:**
```
read_file(file_path="<absolute-path>/roles/senior-developer/knip-report.json")
```

For large files (>1000 lines), use `offset` and `limit` parameters to read in chunks.

**For very large projects**, process incrementally by issue type:
```bash
npx knip --include files --reporter json > roles/senior-developer/knip-files.json
npx knip --include dependencies --reporter json > roles/senior-developer/knip-deps.json
npx knip --include exports --reporter json > roles/senior-developer/knip-exports.json
```

Then use `read_file` tool on each file separately.

**Cleanup:** Delete report files after processing is complete.

### What Knip Detects

| Category                   | Description                                     |
| -------------------------- | ----------------------------------------------- |
| **Unused files**           | Files not imported anywhere                     |
| **Unused exports**         | Exported functions/classes/types never imported |
| **Unused dependencies**    | npm packages in package.json but never used     |
| **Unused devDependencies** | Dev packages not used in scripts/config         |
| **Unlisted dependencies**  | Used but not in package.json                    |
| **Duplicate exports**      | Same thing exported multiple times              |

---

## Step 3: AI Review and Filtering

**CRITICAL:** Not all knip findings are safe to remove. Review each category:

### Safe to Remove (High Confidence)
- Unused files in `components/` that aren't dynamic imports
- Unused exports that are clearly internal
- Unused devDependencies for removed tooling

### Requires Judgment (Medium Confidence)
- Files that might be dynamically imported
- Exports that might be used by external consumers
- Dependencies used only in scripts not tracked by knip

### Keep (False Positives)
- Entry points (pages, API routes, config files)
- Files imported via path aliases knip doesn't understand
- Dependencies used in ways knip can't detect (e.g., CLI tools)

See [references/false-positives.md](references/false-positives.md) for common patterns.

---

## Step 4: Present Findings

Group findings by risk level for user review:

```
## Dead Code Analysis Results

### 🟢 Safe to Remove (X items)
- `components/OldFeature.tsx` - Not imported anywhere
- `utils/deprecated.ts` - No imports found
- `lodash.merge` - Unused dependency

### 🟡 Likely Safe (Y items) - Verify before removing
- `types/legacy.ts` - Only type exports, check external usage
- `@types/node` - May be needed for global types

### 🔴 Keep (Z items) - False positives filtered
- `app/api/*/route.ts` - Entry points
- `tailwind.config.js` - Config file
```

---

## Step 5: User Confirmation

Present removal scope and wait for confirmation:

```
Ready to remove:
- X unused files
- Y unused exports  
- Z unused dependencies

This will NOT remove items marked as "Likely Safe" without explicit approval.

Proceed with safe removals?
```

---

## Step 6: Execute Deletions

### Option A: Let Knip Auto-Fix (Recommended for dependencies)

```bash
# Fix dependencies only (safe)
npx knip --fix --fix-type dependencies

# Fix exports only
npx knip --fix --fix-type exports

# Fix files (requires explicit flag)
npx knip --fix --fix-type files --allow-remove-files

# Fix everything (use with caution)
npx knip --fix --allow-remove-files
```

**Note:** `--allow-remove-files` is required to delete files. Without it, knip only fixes dependencies and exports.

### Option B: Manual Removal

**For Unused Files:**
Use IDE or shell to delete files after AI review confirms they're safe.

**For Unused Exports:**
Edit the source file to remove the export. If the entire file becomes empty, delete it.

**For Unused Dependencies:**
```bash
npm uninstall <package-name>
```

**For Unused Exports in Barrel Files:**
Edit `index.ts` files to remove re-exports of deleted items.

---

## Step 7: Verification

After removals, verify the project still works:

```bash
# Type check
npx tsc --noEmit

# Run tests
npm test

# Build
npm run build
```

If any fail, investigate and fix before committing.

---

## Step 8: Commit Changes

Commit with descriptive message:

```bash
git add -A
git commit -m "chore: remove dead code detected by knip

Removed:
- X unused files
- Y unused exports
- Z unused dependencies

Verified: tsc, tests, and build pass"
```

---

## Quick Reference

| Topic                   | Reference File                                                 |
| ----------------------- | -------------------------------------------------------------- |
| Knip configuration      | [references/knip-config.md](references/knip-config.md)         |
| False positive patterns | [references/false-positives.md](references/false-positives.md) |

---

## Output Checklist

Before marking complete:
- [ ] Knip ran successfully
- [ ] All findings reviewed and categorized
- [ ] User confirmed removal scope
- [ ] Deletions executed
- [ ] `tsc --noEmit` passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Changes committed
