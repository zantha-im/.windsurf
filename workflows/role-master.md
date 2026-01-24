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

If not included, add the `.windsurf` source folder to the workspace file using a **relative path**:
```json
{
  "folders": [
    { "path": "." },
    { "path": "../.windsurf" }
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
Create a new workspace file at `[project-name].code-workspace` using a **relative path**:
```json
{
  "folders": [
    {
      "path": "."
    },
    {
      "path": "../.windsurf"
    }
  ],
  "settings": {}
}
```

**Note:** The relative path `../.windsurf` assumes the `.windsurf` source repo is a sibling directory. Adjust if your directory structure differs.

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

This is a **generic role** - used to create new roles and refine existing ones based on real-world feedback.

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
- Purpose: Design new roles and iteratively refine existing ones based on feedback

Then use the `ask_user_question` tool to present the choice:
- Question: "What would you like to work on?"
- Options:
  1. **Create a new role** - Design a new role with its identity, skills, and workflow
  2. **Refine an existing role** - Improve or fix an existing role or its skills
  3. **Add a workflow to a role** - Add new capability to an existing role (may create/update skills)

---

## Step 6: If "Refine an existing role" Selected

### 6a: Enumerate Existing Roles
Scan the roles directories and present them as selectable options:

```
Directories to scan:
- .windsurf/roles/domain/*.md
- .windsurf/roles/generic/*.md
```

Use `ask_user_question` with up to 4 roles at a time (tool limit). If more than 4 roles exist, group by category:
- Option 1-3: Individual roles
- Option 4: "Show more roles..."

### 6b: After Role Selection - Present Action Menu
Once a role is selected, use `ask_user_question` to present:
- Question: "What would you like to do with [role-name]?"
- Options:
  1. **Fix a problem** - The role failed to act as expected; diagnose and fix
  2. **Work on skills** - Add, modify, or improve the role's associated skills
  3. **Other** - Describe what you want to change

### 6c: Route to Appropriate Workflow

**If "Fix a problem":**
Follow the Role Refinement workflow in `@role-creation`:
1. Gather failure details (what happened vs expected)
2. Identify the component (role, skill, workflow, or rule)
3. Read the relevant file(s)
4. Diagnose root cause
5. Propose fix (confirm before editing)
6. Apply targeted edit
7. Test the fix

**If "Work on skills":**
1. List the role's associated skills (from the role file's "Active Skill" section)
2. Use `ask_user_question` to let user select a skill or create new
3. For existing skill: read SKILL.md and ask what to improve
4. For new skill: follow skill creation workflow in `@role-creation`

**If "Other":**
Ask the user to describe what they want to change, then proceed accordingly.

---

## Step 7: If "Add a workflow to a role" Selected

This option adds new capability to an existing role. The AI determines which skills to create or modify.

### 7a: Enumerate Existing Roles
Same as Step 6a - scan and present roles as selectable options.

### 7b: Gather Workflow Requirements
After role selection, ask the user:
- "Describe the new workflow you want to add to [role-name]. What should the role be able to do?"

Let the user describe their goals in natural language.

### 7c: AI Analysis and Proposal
Based on the user's description:

1. **Read the selected role file** to understand current skills and capabilities
2. **Read existing skills** referenced by the role
3. **Analyze the request** and determine:
   - Does this fit an existing skill? → Propose skill update
   - Does this need a new skill? → Propose new skill creation
   - Does this need reference files? → Plan reference file creation

4. **Present a proposal** to the user:
   ```
   To add [workflow description], I propose:
   
   **Skills to modify:**
   - @skill-name: Add [specific capability]
   
   **New skills to create:**
   - @new-skill-name: [purpose]
   
   **Reference files to create:**
   - references/file-name.md: [content description]
   
   Proceed?
   ```

5. **Wait for user confirmation** before making changes

### 7d: Execute the Proposal
Once confirmed:
1. Create/update skill files following `@role-creation` templates
2. Create reference files as needed (keep SKILL.md under ~200 lines)
3. Update the role file's "Active Skills" section if adding new skills
4. Update the role's activation workflow if needed
