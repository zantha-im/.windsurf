# Configuration Files

This directory contains configuration files for roles that need project-specific settings.

## How It Works

1. **Example files** (`.example.json`) live in this directory as templates
2. **Consuming projects** copy the example to their `.windsurf/config/` directory and customize
3. **Roles/skills** read from the consuming project's config, falling back to defaults

## Available Configurations

### `senior-developer.json`

Configures the canonical reference app for UI pattern skills and CSS audits.

**Setup in your project:**

```bash
# Copy the example to your project's .windsurf/config/
cp .windsurf/config/senior-developer.example.json .windsurf/config/senior-developer.json

# Edit the path to point to your canonical app
```

**Fields:**

| Field | Description |
|-------|-------------|
| `canonicalApp.path` | Absolute path to the reference application |
| `canonicalApp.description` | Human-readable description |
| `patterns.table` | Table CSS module and example component paths |
| `patterns.page` | Page CSS module and example page paths |
| `patterns.components` | Shared components CSS module path |
| `patterns.buttons` | Buttons CSS module path |
| `patterns.modal` | Modal CSS module and example component paths |
| `patterns.form` | Form example component path |

**Example:**

```json
{
  "$schema": "./senior-developer.schema.json",
  "canonicalApp": {
    "path": "/path/to/your/canonical-app",
    "description": "Reference app for UI patterns. Canonical feature: [feature name]"
  },
  "patterns": {
    "table": {
      "css": "components/Table.module.css",
      "example": "components/MyTable.tsx",
      "description": "Canonical table with sorting, filtering, row states"
    },
    "page": {
      "css": "styles/pages.module.css",
      "example": "app/(main)/my-feature/page.tsx",
      "description": "Canonical page with tabs, filters, state management"
    },
    "components": {
      "css": "styles/components.module.css",
      "description": "Shared styles: sections, filters, stats, states, text colors"
    },
    "buttons": {
      "css": "styles/buttons.module.css",
      "description": "All button variants: primary, secondary, icon buttons"
    },
    "modal": {
      "css": "styles/modal.module.css",
      "example": "components/MyModal.tsx",
      "description": "Modal structure: overlay, content, header, body, footer"
    },
    "form": {
      "example": "app/(main)/my-feature/page.tsx",
      "description": "Filter controls, inputs, selects, checkboxes"
    }
  }
}
```

**Note:** The `canonicalApp.path` must be an absolute path to the reference application on your machine.

**Used by:**
- `@table-patterns` skill
- `@page-patterns` skill
- `@form-patterns` skill
- `@modal-patterns` skill
- `@button-patterns` skill
- `@css-audit` skill
- `/css-audit` workflow

## For Role Authors

When creating skills that need external references:

1. Define an example config in this directory
2. In your skill, instruct the AI to read the config first
3. Provide fallback behavior if config is missing
4. Document required fields in this README
