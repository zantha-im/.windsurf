# Anti-Patterns to Avoid

Common mistakes when creating roles, skills, and workflows.

---

## ❌ DO NOT: Put procedures in roles

```markdown
## How to Generate Reports
1. Query the database
2. Format the data
3. Create the output file
```
→ Move to skill

---

## ❌ DO NOT: Use absolute paths

```markdown
- `/.windsurf/roles/domain/my-role.md`
```
→ Use `.windsurf/roles/domain/my-role.md`

---

## ❌ DO NOT: Reference skills by file path

```markdown
Read the skill file at `.windsurf/skills/my-skill/SKILL.md`
```
→ Use `@my-skill`

---

## ❌ DO NOT: Create one-off scripts

```javascript
// scripts/generate-report.js
```
→ Add to orchestrator, make discoverable

---

## ❌ DO NOT: Use bash commands in skills/workflows

```markdown
## Discovery
```bash
grep -rn "pattern" components/
find . -name "*.css" -empty
```
```
→ Use Windsurf tools instead:
```markdown
## Discovery
```
grep_search with Query="pattern" and SearchPath="components/" and FixedStrings=true
find_by_name with Pattern="*.css" and SearchDirectory="." and Type="file"
```
```

---

## ❌ DO NOT: Require tracking documents

```markdown
## Step 5: Create Tracking Document
Create `plans/audit.md` to track progress...
```
→ Keep workflows lean - track progress in conversation, not files

---

## ❌ DO NOT: Hardcode project-specific paths in skills

```markdown
Read the canonical reference at `C:\Users\Jonny\Code\my-project\...`
```
→ Use config files: `.windsurf/config/[role-name].json`

---

## ❌ DO NOT: Create long monolithic skills

```markdown
# Skill: My Skill
[500+ lines of procedures, templates, and reference data]
```
→ Keep SKILL.md under ~200 lines, extract to `references/` subdirectory

---

## ❌ DO NOT: Confuse subtree paths with role output paths

When creating tools for **domain roles**, outputs go to the **consuming project** (e.g., `ai-advisor/roles/my-role/`), NOT the `.windsurf` subtree.

```javascript
// WRONG - references subtree location
const REPORTS_DIR = '.windsurf/tools/my-tool/reports';
```

```javascript
// CORRECT - uses __dirname to resolve relative to tool location
const REPORTS_DIR = path.join(__dirname, 'reports');

// OR - resolves from project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'roles', 'my-role', 'reports');
```

**Key distinction:**
- **Roles, skills, workflows** → Created in `.windsurf` source repo (shared infrastructure)
- **Domain role tools & outputs** → Created in consuming project's `roles/` folder (project-specific)
