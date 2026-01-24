# Common False Positives in Dead Code Detection

Knip is accurate but can't detect all usage patterns. This guide helps identify false positives.

## Entry Points

These files are loaded directly, not imported:

| Pattern                | Why It's Used       |
| ---------------------- | ------------------- |
| `app/**/page.tsx`      | Next.js page routes |
| `app/**/route.ts`      | Next.js API routes  |
| `app/**/layout.tsx`    | Next.js layouts     |
| `middleware.ts`        | Next.js middleware  |
| `*.config.{js,ts,mjs}` | Tool configuration  |
| `scripts/*.ts`         | Build/dev scripts   |
| `bin/*.js`             | CLI entry points    |

**Fix:** Add to `entry` in knip.json

## Dynamic Imports

Code loaded at runtime that knip can't trace:

```typescript
// Knip can't follow this
const Component = await import(`./components/${name}`)

// Or this
const handler = require(`./handlers/${type}`)
```

**Fix:** Add the directory to `entry` or use `ignore`

## Type-Only Exports

Types exported for external consumers but not used internally:

```typescript
// types/index.ts
export type ApiResponse = { ... }  // Used by consumers, not internally
```

**Fix:** 
- If library: Add to `entry`
- If internal: Safe to remove

## Dependencies Used in Config Files

Packages used by tools, not code:

| Package                            | Used By                             |
| ---------------------------------- | ----------------------------------- |
| `autoprefixer`                     | PostCSS config                      |
| `postcss`                          | Next.js/build tools                 |
| `@types/*`                         | TypeScript (implicit)               |
| `eslint-*`                         | ESLint config                       |
| `@typescript-eslint/eslint-plugin` | ESLint config (extends)             |
| `@typescript-eslint/parser`        | ESLint config (parser)              |
| `prettier-*`                       | Prettier config                     |
| `dotenv`                           | Scripts via `node -r dotenv/config` |

**Fix:** Add to `ignoreDependencies`:
```json
{
  "ignoreDependencies": [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "dotenv"
  ]
}
```

## CLI Tools

Packages used via `npx` or scripts, not imported:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev"
  }
}
```

Knip may report `prisma` as unused.

**Fix:** Add to `ignoreDependencies`

## Barrel File Re-exports

Index files that re-export for convenience:

```typescript
// components/index.ts
export { Button } from './Button'
export { Modal } from './Modal'  // Knip may say unused if not imported via barrel
```

**Fix:** Usually safe to remove unused re-exports, but verify external usage first

## CSS/Asset Imports

Side-effect imports that don't export anything:

```typescript
import './styles.css'
import 'normalize.css'
```

Knip handles these correctly, but custom loaders may confuse it.

## Global Type Augmentation

Files that augment global types:

```typescript
// types/global.d.ts
declare global {
  interface Window {
    analytics: Analytics
  }
}
```

**Fix:** Add to `entry`

## Test Utilities

Shared test helpers that are only imported by test files:

```typescript
// test/utils.ts
export function renderWithProviders() { ... }
```

If test files are ignored, these appear unused.

**Fix:** Include test files in analysis or add to `ignore`

## Decision Tree

When knip reports something as unused:

```
Is it an entry point (page, route, config)?
  → YES: Add to `entry` in knip.json
  → NO: Continue

Is it dynamically imported?
  → YES: Add to `entry` or `ignore`
  → NO: Continue

Is it a type exported for external consumers?
  → YES: Add to `entry` (if library) or remove (if internal)
  → NO: Continue

Is it a dependency used by a tool/config?
  → YES: Add to `ignoreDependencies`
  → NO: Continue

Is it actually unused?
  → YES: Safe to remove
  → NO: Investigate why knip can't detect usage
```

## Verification Before Removal

For any item you're unsure about:

1. **Search for usage:**
   ```bash
   grep -r "ComponentName" --include="*.tsx" --include="*.ts"
   ```

2. **Check dynamic imports:**
   ```bash
   grep -r "import(" --include="*.ts" --include="*.tsx"
   ```

3. **Check external usage** (if library):
   - Is this exported in package.json `exports`?
   - Do downstream projects import it?

4. **Test removal:**
   - Comment out the export
   - Run `tsc --noEmit`
   - Run tests
   - If all pass, safe to remove
