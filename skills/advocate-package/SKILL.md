---
name: advocate-package
description: Compiles investigation findings into advocate packages. Use when creating legal briefs, preparing for counsel, finalizing investigations, or packaging evidence for lawyers.
---

# Skill: Advocate Package Compilation

Transforms investigation findings into a structured package for legal counsel.

---

## CRITICAL: Output Location

**All advocate package files MUST be saved to the investigation's `advocate-package/` folder:**

```
roles/legal-researcher/investigations/{NNN}-{slug}/
└── advocate-package/           # ← Package files go here
    ├── README.md               # Package index
    ├── 0-cover-letter.md       # Personal letter to advocate
    ├── 1-executive-summary.md  # Quick overview
    ├── 2-chronology.md         # Timeline with exhibits
    ├── 3-evidence-index.md     # Complete exhibit list
    ├── 4-legal-analysis.md     # Factual legal framework
    ├── 5-questions-for-advocate.md  # Questions for counsel
    └── 6-appendices.md         # Source document references
```

---

## When to Create

Create an advocate package when:
- Investigation is complete
- Findings need to be presented to legal counsel
- A formal record is required
- Evidence needs to be packaged for external review

---

## Package Structure

### Required Files

| File                     | Purpose                     | Key Content                               |
| ------------------------ | --------------------------- | ----------------------------------------- |
| `README.md`              | Package index               | Contents list, status, cross-references   |
| `0-cover-letter.md`      | Personal letter to advocate | Key findings summary, recommended actions |
| `1-executive-summary.md` | Quick overview              | 1-2 page summary for busy readers         |
| `2-chronology.md`        | Timeline of events          | Dated entries with exhibit references     |
| `3-evidence-index.md`    | Complete exhibit list       | All evidence with descriptions            |

### Optional Files

| File                          | Purpose                    | When to Include                       |
| ----------------------------- | -------------------------- | ------------------------------------- |
| `4-legal-analysis.md`         | Relevant legal framework   | When legal context aids understanding |
| `5-questions-for-advocate.md` | Questions for counsel      | When guidance is needed               |
| `6-appendices.md`             | Source document references | For complex investigations            |

---

## File Templates

### README.md Template

```markdown
# {Investigation Title} - Advocate Package

**Investigation:** {NNN} - {Title}  
**Status:** {Draft|Complete}  
**Last Updated:** {DD Month YYYY}  

---

## Package Contents

1. **[0-cover-letter.md](0-cover-letter.md)** - Personal letter to advocate
2. **[1-executive-summary.md](1-executive-summary.md)** - Executive summary
3. **[2-chronology.md](2-chronology.md)** - Timeline of events
4. **[3-evidence-index.md](3-evidence-index.md)** - Evidence index

---

## Cross-Investigation References

{List related investigations if applicable}

---

## Key Points

1. {Key point 1}
2. {Key point 2}
3. {Key point 3}
```

### Cover Letter Template

```markdown
# Cover Letter

**To:** {Advocate Name}  
**From:** {Investigator}  
**Date:** {DD Month YYYY}  
**Re:** {Investigation Title}

---

Dear {Advocate},

{Opening paragraph - why this package exists}

## Key Findings

{2-3 paragraph summary of most important findings}

## Recommended Actions

1. {Action 1}
2. {Action 2}

## Questions Requiring Your Guidance

1. {Question 1}
2. {Question 2}

{Closing}

Regards,
{Investigator}
```

### Executive Summary Template

```markdown
# Executive Summary

**Investigation:** {NNN} - {Title}  
**Period:** {Start Date} to {End Date}  
**Prepared:** {DD Month YYYY}

---

## Overview

{1-2 paragraphs describing the investigation scope and purpose}

## Key Findings

### Finding 1: {Title}
{Description with exhibit references}

### Finding 2: {Title}
{Description with exhibit references}

## Evidence Summary

| Category          | Count | Key Items     |
| ----------------- | ----- | ------------- |
| Emails            | {N}   | {Description} |
| Documents         | {N}   | {Description} |
| Financial Records | {N}   | {Description} |

## Conclusion

{Summary of what the evidence shows}

## Recommended Next Steps

1. {Step 1}
2. {Step 2}
```

### Chronology Template

```markdown
# Chronology

**Investigation:** {NNN} - {Title}

---

## Timeline

| Date       | Event               | Exhibit | Significance     |
| ---------- | ------------------- | ------- | ---------------- |
| YYYY-MM-DD | {Event description} | E-001   | {Why it matters} |
| YYYY-MM-DD | {Event description} | E-002   | {Why it matters} |

---

## Key Periods

### Period 1: {Title} ({Date Range})
{Narrative description of this period}

### Period 2: {Title} ({Date Range})
{Narrative description of this period}
```

### Evidence Index Template

```markdown
# Evidence Index

**Investigation:** {NNN} - {Title}  
**Total Exhibits:** {N}

---

## Exhibit List

| ID    | Date       | Type     | Description   | Location                    |
| ----- | ---------- | -------- | ------------- | --------------------------- |
| E-001 | YYYY-MM-DD | Email    | {Description} | `evidence/emails/E-001_...` |
| E-002 | YYYY-MM-DD | Document | {Description} | `evidence/external/...`     |

---

## Evidence by Category

### Emails ({N} items)
- E-001: {Brief description}
- E-002: {Brief description}

### Documents ({N} items)
- E-010: {Brief description}

### Financial Records ({N} items)
- E-020: {Brief description}
```

---

## Key Principles

### Be Forthright
- Be honest about unfavorable findings
- Acknowledge when evidence contradicts original understanding
- If you were wrong, say so clearly

### Use Exhibit References
- Every factual claim should reference an exhibit
- Format: `(E-001)` or `[Exhibit E-001]`
- Include verbatim quotations where impactful

### Maintain Neutrality
- Present facts, not legal conclusions
- Let the advocate draw legal inferences
- Use neutral language throughout

### Cross-Reference Related Investigations
- Link to related investigations when relevant
- Note patterns across multiple investigations
- Maintain consistency in exhibit numbering

---

## Compilation

**Use the Legal Researcher orchestrator to compile:**

```javascript
const { compileAdvocatePackage } = require('./roles/legal-researcher/orchestrator');
const pdfPath = await compileAdvocatePackage('002');  // Returns path to generated PDF
```

**Or via CLI:**

```bash
node scripts/compile-advocate-package.js {NNN}
```

**Output:** `advocate-package-{NNN}-{slug}-{YYYY-MM-DD}.pdf`

The script:
1. Finds all markdown files in the `advocate-package/` folder
2. Converts each to PDF with legal document styling
3. Includes any PDFs from `evidence/external/` as appendices
4. Merges into a single PDF with page numbers
5. Cleans up intermediate files

---

## Quality Checklist

Before marking the package complete:

- [ ] All required files created
- [ ] README.md lists all contents
- [ ] Cover letter summarizes key findings
- [ ] Executive summary is self-contained
- [ ] Chronology has exhibit references
- [ ] Evidence index is complete
- [ ] All exhibit references are valid
- [ ] Cross-investigation links work
- [ ] Neutral language throughout
- [ ] Unfavorable findings acknowledged
