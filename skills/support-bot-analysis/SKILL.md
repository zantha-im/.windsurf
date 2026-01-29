---
name: support-bot-analysis
description: Analyzes Discord feedback for support bot improvement. Use when analyzing sentiment, mapping features, tracking bot performance, or generating improvement recommendations.
---

# Skill: Support Bot Analysis

Detailed procedures for the Support Advisor role. Domain: Discord customer support bot, sentiment analysis, performance optimization.

---

## CRITICAL: Output Location

**All analysis files MUST be saved to the consuming project's role folder, NOT the `.windsurf/` subtree.**

```
[project-root]/
├── roles/
│   └── support-advisor/        # ← OUTPUT GOES HERE
│       ├── analysis/           # Sentiment & friction reports
│       ├── recommendations/    # Feature proposals, prompt changes
│       └── benchmarks/         # Performance tracking data
├── .windsurf/                  # Subtree - DO NOT write here
```

**Before writing any file:** Verify the `roles/support-advisor/` directory exists. If not, create it.

---

## Workflow 1: Sentiment & Friction Analysis

Copy this checklist and track your progress:

```
Sentiment Analysis Progress:
- [ ] Step 1: Export Discord feedback (messages, reactions, threads)
- [ ] Step 2: Query database for structured feedback trends
- [ ] Step 3: Categorize feedback (pain points, hallucinations, tone issues)
- [ ] Step 4: Identify recurring patterns (frequency, severity)
- [ ] Step 5: Anonymize all PII before documenting
- [ ] Step 6: Generate friction report with confidence levels
```

### Data Sources (Priority Order)

1. **Neon MCP** - Structured feedback database (thumbs up/down, ratings)
2. **Discord API** - Raw message history from feedback channels
3. **Bot logs** - Response latency, error rates, fallback triggers

### Categorization Framework

| Category | Indicators | Priority |
|----------|------------|----------|
| **Hallucination** | Factually incorrect responses, made-up information | HIGH |
| **Tone mismatch** | Too formal/informal, inappropriate for context | MEDIUM |
| **Missing capability** | "Bot couldn't help with X" | MEDIUM |
| **Slow response** | User complaints about latency | LOW |
| **Positive feedback** | Praise, successful resolutions | TRACKING |

---

## Workflow 2: Strategic Feature Mapping

Copy this checklist and track your progress:

```
Feature Mapping Progress:
- [ ] Step 1: Aggregate categorized feedback from Workflow 1
- [ ] Step 2: Group into potential feature improvements
- [ ] Step 3: Assess impact vs effort for each feature
- [ ] Step 4: Research industry benchmarks (web search)
- [ ] Step 5: Generate technical strategy document
- [ ] Step 6: Present as proposal (requires human approval)
```

### Impact Assessment Matrix

| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| HIGH | LOW | P0 | Immediate sprint |
| HIGH | HIGH | P1 | Plan for next cycle |
| LOW | LOW | P2 | Quick wins backlog |
| LOW | HIGH | P3 | Defer or reject |

### Output Template

```markdown
# Feature Proposal: [Title]

## Data Source
- Feedback count: [N] mentions
- Time period: [date range]
- Confidence: HIGH/MEDIUM/LOW

## Problem Statement
[Anonymized user feedback summary]

## Proposed Solution
[Technical approach]

## Expected Impact
[Metrics to improve]

## Risks
[Potential issues]

## Status: PROPOSAL - Requires human approval
```

---

## Workflow 3: Continuous Evolution Tracking

Copy this checklist and track your progress:

```
Benchmark Tracking Progress:
- [ ] Step 1: Define baseline metrics (satisfaction, latency, accuracy)
- [ ] Step 2: Query current performance data
- [ ] Step 3: Compare against previous period
- [ ] Step 4: Identify trends (improving/degrading/stable)
- [ ] Step 5: Generate iterative recommendations
- [ ] Step 6: Update benchmark file
```

### Key Metrics

| Metric | Source | Target |
|--------|--------|--------|
| User satisfaction | Thumbs up/down ratio | >80% positive |
| Response accuracy | Hallucination reports | <5% error rate |
| Resolution rate | "Resolved" tags | >70% first-contact |
| Response latency | Bot logs | <2s average |

### Benchmark File Format

Save to `roles/support-advisor/benchmarks/[YYYY-MM].json`:

```json
{
  "period": "2026-01",
  "metrics": {
    "satisfaction_rate": 0.82,
    "hallucination_rate": 0.03,
    "resolution_rate": 0.71,
    "avg_latency_ms": 1450
  },
  "trends": {
    "satisfaction": "improving",
    "accuracy": "stable"
  },
  "recommendations": []
}
```

---

## Prompt/Brain Modification Protocol

**CRITICAL: Changes must pass agent-tester suite.**

```
Prompt Change Progress:
- [ ] Step 1: Document current prompt behavior
- [ ] Step 2: Identify specific issue to address
- [ ] Step 3: Draft prompt modification
- [ ] Step 4: Run agent-tester suite (baseline)
- [ ] Step 5: Apply change
- [ ] Step 6: Run agent-tester suite (validation)
- [ ] Step 7: Compare results - MUST NOT degrade
- [ ] Step 8: If degraded, revert immediately
- [ ] Step 9: Document change and results
```

---

## Privacy & Anonymization Rules

**MANDATORY for all outputs:**

- Replace Discord usernames with `User_001`, `User_002`, etc.
- Remove user IDs, avatars, and any identifying information
- Aggregate feedback counts rather than individual messages where possible
- Never include message timestamps that could identify users
- Strip any PII mentioned in message content (emails, phone numbers, etc.)

---

## Quick Reference

| Topic | Reference File |
|-------|----------------|
| Advanced frameworks (NIST, ISO, LLM-as-Judge, RAGAS) | [references/advanced-frameworks.md](references/advanced-frameworks.md) |
| Prompt versioning & self-refinement patterns | [references/advanced-frameworks.md](references/advanced-frameworks.md) |

---

## Output Checklist

Before finalizing any analysis or recommendation:

- [ ] All data sources cited with dates
- [ ] Confidence level stated (HIGH/MEDIUM/LOW)
- [ ] PII fully anonymized
- [ ] Linked to specific data trends or feedback
- [ ] Marked as PROPOSAL if requires approval
- [ ] Agent-tester validation (for prompt changes)
