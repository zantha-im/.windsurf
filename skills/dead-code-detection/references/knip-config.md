# Knip Configuration Guide

Knip works out of the box for most projects, but a config file helps reduce false positives.

## Basic Setup

Create `knip.json` in project root:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts"]
}
```

## Next.js Configuration

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "app/**/page.tsx",
    "app/**/layout.tsx",
    "app/**/route.ts",
    "app/**/loading.tsx",
    "app/**/error.tsx",
    "app/**/not-found.tsx",
    "middleware.ts"
  ],
  "project": [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.ts",
    "utils/**/*.ts"
  ],
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**"
  ],
  "ignoreDependencies": [
    "autoprefixer",
    "postcss"
  ]
}
```

## Key Configuration Options

### `entry`
Files that are entry points (not imported by other files). Knip won't report these as unused.

Common entry points:
- `app/**/page.tsx` - Next.js pages
- `app/**/route.ts` - Next.js API routes
- `src/index.ts` - Library entry
- `scripts/*.ts` - Build/dev scripts
- `*.config.{js,ts}` - Config files

### `project`
All files to analyze. Knip will check if these are used.

### `ignore`
Files to completely ignore (won't be analyzed or reported).

**Always ignore the `.windsurf/` subtree** - it's shared tooling, not project code:
```json
{
  "ignore": [".windsurf/**"]
}
```

### `ignoreDependencies`
Dependencies that knip reports as unused but are actually needed (e.g., PostCSS plugins loaded by config).

### `ignoreExportsUsedInFile`
Don't report exports that are used within the same file:

```json
{
  "ignoreExportsUsedInFile": true
}
```

## Framework-Specific Plugins

Knip has built-in plugins for common frameworks. They auto-detect entry points.

| Framework  | Auto-detected                              |
| ---------- | ------------------------------------------ |
| Next.js    | `app/**/page.tsx`, `app/**/route.ts`, etc. |
| React      | `src/index.tsx`                            |
| Express    | Routes, middleware                         |
| Jest       | Test files, setup files                    |
| ESLint     | Config files, plugins                      |
| TypeScript | `tsconfig.json` references                 |

## Workspace/Monorepo Support

```json
{
  "workspaces": {
    "packages/*": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  }
}
```

## CLI Options

### Output Control
```bash
# Limit issues shown (useful for large projects)
npx knip --max-show-issues 10

# Show only specific issue types
npx knip --include files,dependencies

# Exclude specific issue types
npx knip --exclude classMembers,nsExports

# JSON output (minified - must pipe through formatter)
npx knip --reporter json

# Compact output (one line per issue)
npx knip --reporter compact
```

**Note:** JSON output is minified (single line). Format before reading:
```powershell
# Windows
npx knip --reporter json | ConvertFrom-Json | ConvertTo-Json -Depth 10 > report.json

# macOS/Linux
npx knip --reporter json | python3 -m json.tool > report.json
```

### Auto-Fix Options
```bash
# Fix dependencies only (safe - just edits package.json)
npx knip --fix --fix-type dependencies

# Fix exports only (removes unused exports from source)
npx knip --fix --fix-type exports

# Fix files (DELETES files - requires explicit flag)
npx knip --fix --fix-type files --allow-remove-files

# Fix everything (use with caution)
npx knip --fix --allow-remove-files

# Format files after fixing
npx knip --fix --format
```

### Analysis Modes
```bash
# Strict mode (more thorough, slower)
npx knip --strict

# Production mode (ignore devDependencies)
npx knip --production

# Use caching for faster subsequent runs
npx knip --cache
```

## Recommended Workflow

1. **First run without config** - See what knip detects
2. **Limit output if overwhelming** - Use `--max-show-issues 10`
3. **Add entry points** - For files incorrectly marked as unused
4. **Add ignoreDependencies** - For deps used in ways knip can't detect
5. **Use `--fix` incrementally** - Start with `--fix-type dependencies`, then exports
6. **Run with `--strict`** - For thorough cleanup before major releases
