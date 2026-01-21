---
description: Activate Role Master for designing and creating new AI roles, skills, and workflows
---

# Role Master Activation

## Step 1: Detect Workspace Context

**CRITICAL: Roles, skills, and tools are shared infrastructure. They MUST be created in the `.windsurf` source repository, not in subtree copies.**

Check the current workspace:

1. **List workspace folders** to identify what projects are open
2. **Determine if `.windsurf` is the source or a subtree:**
   - **Source:** The workspace root IS the `.windsurf` project (e.g., `c:\Users\Jonny\Code\.windsurf`)
   - **Subtree:** The `.windsurf` folder exists inside another project (e.g., `my-project/.windsurf/`)

### If Source Project (Direct Access)
Continue to Step 2. You can create files directly.

### If Subtree Context (No Direct Access)
**STOP.** Do not edit subtree files. Set up workspace access to the source repository:

#### Option A: Workspace File Exists
Check if a `.code-workspace` file exists in the project root (e.g., `project-name.code-workspace`).

If it exists, check if it already includes the `.windsurf` source path:
```json
{
  "folders": [
    { "path": "." },
    { "path": "../.windsurf" }  // or absolute path
  ]
}
```

If the source is already included, continue to Step 2.

If not included, add the `.windsurf` source folder to the workspace file:
```json
{
  "folders": [
    { "path": "." },
    { "path": "c:/Users/Jonny/Code/.windsurf" }
  ]
}
```

Then instruct the user:
```
I've updated the workspace file to include the .windsurf source repository.

Please reload the workspace:
1. Close this workspace
2. Open: [project-name].code-workspace

Then tell me when ready to continue.
```

#### Option B: No Workspace File
Create a new workspace file at `[project-name].code-workspace`:
```json
{
  "folders": [
    {
      "path": "."
    },
    {
      "path": "c:/Users/Jonny/Code/.windsurf"
    }
  ],
  "settings": {}
}
```

Then instruct the user:
```
I've created a workspace file that includes both this project and the .windsurf source repository.

Please open the workspace:
1. File → Open Workspace from File...
2. Select: [project-name].code-workspace

Then tell me when ready to continue.
```

#### After Workspace is Loaded
Once the user confirms the workspace is loaded with both folders:
1. Verify the `.windsurf` source is accessible (not the subtree copy)
2. Continue to Step 2

**After role creation is complete, remind the user:**
```
Role creation complete! To use the new role in this project:
1. Commit and push changes in the `.windsurf` source project
2. Run `/subtree-pull` in this project to pull the changes
```

---

## Step 2: Read Role Definition
Read the role definition file:
- `.windsurf/roles/generic/role-master.md`

This is a **generic role** - used to create new roles following best practices.

## Step 3: Invoke Skill
Use `@role-creation` to load detailed procedures for creating roles, skills, and workflows.

## Step 4: Review Existing Examples
Familiarize yourself with existing patterns by reviewing:
- `.windsurf/roles/domain/sales-analyst.md` - Example domain role (identity-focused)
- `.windsurf/roles/generic/senior-developer.md` - Example generic role
- `.windsurf/skills/product-sales-analysis/SKILL.md` - Example skill with workflow checklist

## Step 5: Confirm Activation
Report to user:
- Current role: Role Master
- Workspace context: [Source project / Subtree - source added]
- Purpose: Design and create new AI roles, skills, and workflows
- Ask: "What new role would you like to create? Please describe its purpose and responsibilities."
