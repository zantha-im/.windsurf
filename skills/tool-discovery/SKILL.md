---
name: tool-discovery
description: Discovers available tools in role orchestrators. Use when needing to find available functions, commands, or capabilities in a role's orchestrator file.
---

# Skill: Tool Discovery

Discovers and presents available tools from role orchestrator files.

---

## When This Skill Applies

Trigger this skill when:
- User asks "what tools are available"
- User mentions "orchestrator" in context of finding functions
- AI needs to discover available commands before executing a task
- User asks about "available functions" or "available commands"
- Starting work in a new role context

---

## Discovery Method

**ALWAYS use the `--help` flag to discover tools.** Do NOT grep or read orchestrator files to find available functions.

### Step 1: Identify the Relevant Orchestrator

| Role | Orchestrator Path |
|------|-------------------|
| Legal Researcher | `roles/legal-researcher/orchestrator.js` |
| Sales Analyst | `roles/sales-analyst/orchestrator.js` |
| Company Secretary | `roles/company-secretary/orchestrator.js` |
| Agent Tester | `roles/agent-tester/orchestrator.js` |

### Step 2: Run Help Command

```bash
node {orchestrator-path} --help
```

Or if the orchestrator exports a `showHelp()` function:

```javascript
const orchestrator = require('./{orchestrator-path}');
orchestrator.showHelp();
```

### Step 3: Present Available Tools

Format the output clearly for the user, grouping by category if the help text provides categories.

---

## Example Usage

**User asks:** "What tools do I have for the legal researcher?"

**AI should run:**
```bash
node roles/legal-researcher/orchestrator.js --help
```

**NOT:**
```bash
grep -r "function" roles/legal-researcher/orchestrator.js
```

---

## Anti-Patterns to Avoid

| Wrong Approach | Correct Approach |
|----------------|------------------|
| `grep_search` for function names | Run `--help` flag |
| `read_file` on orchestrator.js | Run `--help` flag |
| Guessing available functions | Run `--help` flag |
| Searching for "module.exports" | Run `--help` flag |

---

## When Help Is Not Available

If an orchestrator doesn't have a `--help` flag:

1. Note this as a gap
2. Fall back to reading the `module.exports` section
3. Suggest adding help text to the orchestrator

---

## Orchestrator Help Text Standard

All orchestrators should include help text. Standard format:

```javascript
function showHelp() {
  console.log(`
Role Name Orchestrator
======================

Investigation Management:
  listInvestigations()        - List all investigations
  createInvestigation(slug)   - Create new investigation

Evidence Tools:
  addFinding(id, finding)     - Add finding to investigation
  exportEvidence(id)          - Export evidence to files

Usage:
  node orchestrator.js --help
  node orchestrator.js list
`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  }
}

module.exports = { showHelp, /* other exports */ };
```
