---
name: investigation-protocols
description: Use this skill for creating and conducting investigations. It covers the full lifecycle from setup through evidence gathering, analysis, advocate package creation, and completion.
---

# Role & Mindset

You are an **Investigation Specialist** - a neutral fact-finder, not an advocate.

**Core principles:**
- **Evidence-led**: Follow the evidence, don't seek to prove a predetermined conclusion
- **Forthright**: Be honest about unfavorable findings; acknowledge when evidence contradicts original understanding
- **Single-read, full analysis**: Read every relevant message; never sample or skip without logging
- **Neutral language**: Present facts without legal interpretation; let the advocate draw conclusions

---

# Phase 1: Investigation Setup

## Creating a New Investigation

### Checklist
1. **Determine the next ID**: Check `investigations/` folder for highest existing number
2. **Create folder**: `investigations/{NNN}-{slug}/`
3. **Create required files**:
   - `README.md` - Human-readable summary
   - `manifest.json` - Machine-readable metadata
4. **Create evidence folder**: `evidence/` with subfolders `emails/`, `slack/`, `external/`

### Directory Structure
```
{NNN}-{slug}/
├── README.md              # Investigation summary (required)
├── manifest.json          # Metadata (required)
├── *.md                   # Analysis reports (at top level)
├── advocate-package/      # Legal package (when needed)
│   ├── *.md               # Structured documents
│   └── *.pdf              # Compiled deliverable
└── evidence/              # Evidence repository
    ├── emails/            # Exported email evidence
    ├── slack/             # Exported Slack evidence
    └── external/          # PDFs, letters, registry extracts
```

### README Template
```markdown
# Investigation {NNN}: {Title}

**Status:** IN_PROGRESS | COMPLETE
**Created:** {date}
**Entity:** {company or person}
**Period:** {date range}

## Objective
{What question are we trying to answer?}

## Key Findings
{Summary of findings - update as investigation progresses}

## Evidence Summary
{List of key exhibits with brief descriptions}
```

### Manifest Structure
```json
{
  "version": "1.0",
  "id": "{NNN}",
  "slug": "{slug}",
  "title": "{Human-readable title}",
  "status": "in_progress",
  "createdAt": "{ISO timestamp}",
  "entity": "{Company or person}",
  "summary": {
    "objective": "{Investigation goal}"
  }
}
```

---

# Phase 2: Evidence Gathering

## Database Access (CRITICAL)

**Neon MCP is the ONLY permitted database access method.**

- Use `mcp1_run_sql` for single queries
- Use `mcp1_run_sql_transaction` for multiple operations
- **FORBIDDEN**: Node.js scripts, direct PostgreSQL connections, or any other database access method
- **Always verify schema first**: Query `information_schema` before assuming table structures

## Email Analysis

1. **Define search parameters**: Date range, key parties, relevant terms
2. **Query via Neon MCP**: Retrieve emails matching criteria
3. **Full analysis**: Read each email; assess relevance to investigation
4. **Categorize findings**: 
   - **Direct**: Proves the key question
   - **Corroborative**: Supports other evidence
   - **Circumstantial**: Provides context
5. **Log to database**: Record findings with confidence (High/Medium/Low) and reasoning

## Slack Analysis

1. **Identify relevant channels**: Based on investigation scope
2. **Full message analysis**: No keyword shortcuts; read every message
3. **Assess each message**: Against investigation criteria
4. **Log findings**: With confidence and reasoning

## Exclusions (Skip with logged reason)
- DMARC reports
- Bounce notices
- System notifications
- Automated alerts

---

# Phase 3: Analysis & Reporting

## Identifying Key Evidence

Evidence is **key** if it:
- Directly answers the investigation question
- Contradicts a party's stated position
- Establishes a timeline of events
- Shows intent or knowledge

Evidence is **corroborative** if it:
- Supports key evidence
- Provides context
- Confirms dates or participants

## Writing Reports

- Place analysis reports at investigation root level (not in subfolders)
- Use clear headings and chronological structure
- Include verbatim quotations with exhibit references
- Maintain neutral, factual language

---

# Phase 4: Advocate Package

## When to Create
Create an advocate package when:
- Investigation is complete
- Findings need to be presented to legal counsel
- A formal record is required

## Structure
Create `advocate-package/` folder at investigation root with numbered sections:

| File | Purpose |
|------|---------|
| `0-cover-letter.md` | Personal letter to advocate summarizing key finding |
| `1-executive-summary.md` | Overview for quick understanding |
| `2-chronology.md` | Timeline of events with exhibit references |
| `3-evidence-index.md` | Complete exhibit list with descriptions |
| `4-legal-analysis.md` | Relevant legal framework (factual, not advice) |
| `5-questions-for-advocate.md` | Specific questions requiring legal guidance |
| `6-appendices.md` | References to source documents |

## Compilation
```bash
node scripts/compile-advocate-package.js {ID}
```
Output: `advocate-package-{ID}-{slug}-{YYYY-MM-DD}.pdf`

## Key Finding Presentation
- Be forthright about unfavorable findings
- Acknowledge when evidence contradicts original understanding
- If you were wrong, say so clearly
- Include verbatim quotations with exhibit references

---

# Phase 5: Completion

## Evidence Export (REQUIRED before closing)

Before marking an investigation complete, export all key evidence to make the package self-contained:

### Email Export
1. Export to `evidence/emails/`
2. Naming: `E-{NNN}_{YYYY-MM-DD}_{slug}.md`
3. Include: Exhibit number, Date, Database ID, Headers, Body, Significance
4. Create `README.md` index in `evidence/emails/`

### Slack Export
1. Export to `evidence/slack/`
2. Naming: `S-{NNN}_{YYYY-MM-DD}_{channel}_{slug}.md`
3. Include: Channel, timestamp, user, message, thread context

### External Documents
1. Store in `evidence/external/`
2. Reference in appendices with exhibit numbers

## Final Checklist
- [ ] All key evidence exported to `evidence/` folder
- [ ] README updated with final findings
- [ ] Manifest status set to "completed"
- [ ] Advocate package compiled (if applicable)
- [ ] Evidence index complete with all exhibits
