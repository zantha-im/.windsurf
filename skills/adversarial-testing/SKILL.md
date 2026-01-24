---
name: adversarial-testing
description: Guides adversarial security testing of AI agents, LLM endpoints, and agentic applications. Use when testing guardrails, probing for data leakage, attempting prompt injection, validating AI safety controls, or assessing agentic system risks. Triggers on: test agent, probe guardrails, red team, jailbreak test, data exfiltration test, security audit AI, validate guardrails, agentic security, OWASP LLM.
---

# Skill: Adversarial Testing

This skill provides methodology for security testing AI agents and agentic applications. It teaches *how* to test; the orchestrator provides *what* to test and *where*.

**Aligned with:**
- OWASP Top 10 for LLM Applications (2025)
- OWASP Top 10 for Agentic Applications (2026)
- DeepTeam/Promptfoo red teaming frameworks

---

## CRITICAL: Report Output Location

**Reports MUST be saved to the consuming project's role folder, NOT the `.windsurf/` subtree.**

```
[project-root]/
├── roles/
│   └── agent-tester/            # ← OUTPUT GOES HERE
│       ├── orchestrator.js
│       ├── reports/latest-report.json
│       └── logs/test-log.json
├── .windsurf/                   # DO NOT write here
```

**Single file approach:** Overwrite `latest-report.json` each run.

---

## Workflow

```
Adversarial Testing Progress:
- [ ] Step 1: Discover orchestrator and endpoint configuration
- [ ] Step 2: Classify target (chatbot, RAG, agentic, tool-using)
- [ ] Step 3: Verify test environment (staging preferred)
- [ ] Step 4: Select test categories based on architecture
- [ ] Step 5: Execute baseline probes (single-turn)
- [ ] Step 6: Escalate with advanced probes where baseline passes
- [ ] Step 7: Document all findings with evidence
- [ ] Step 8: Generate risk-rated report with OWASP mapping
- [ ] Step 9: Recommend remediation actions
- [ ] Step 10: Create regression test suite from findings
```

---

## Target Classification

| Type | Characteristics | Priority Categories |
|------|-----------------|---------------------|
| **Chatbot** | Single-turn Q&A, no tools | Prompt Injection, Data Exfil, Info Disclosure |
| **RAG System** | Retrieves external docs | Indirect Injection, Data Exfil, Cross-Customer |
| **Tool-Using Agent** | Can execute functions/APIs | Privilege Escalation, Excessive Agency, Tool Misuse |
| **Multi-Agent System** | Multiple agents collaborate | Identity Spoofing, Cascading Failures, Goal Hijacking |

---

## Vulnerability Framework

Organize testing around five risk categories (per DeepTeam):

| Category | Description |
|----------|-------------|
| **Responsible AI** | Biased or toxic outputs |
| **Illegal Activities** | Facilitating unlawful acts |
| **Brand Image** | Reputation damage |
| **Data Privacy** | Exposing confidential info |
| **Unauthorized Access** | System exploitation |

---

## Reference Documents

For detailed procedures, read these reference files:

| Topic | Reference File |
|-------|----------------|
| Test categories (1-10) | [references/test-categories.md](references/test-categories.md) |
| Attack enhancement techniques | [references/attack-techniques.md](references/attack-techniques.md) |
| Response validation patterns | [references/validation-patterns.md](references/validation-patterns.md) |
| Reporting templates | [references/reporting.md](references/reporting.md) |
| OWASP LLM Top 10 mapping | [references/owasp-llm-top10.md](references/owasp-llm-top10.md) |
| OWASP Agentic Top 10 | [references/owasp-agentic-top10.md](references/owasp-agentic-top10.md) |
| Attack pattern library | [references/attack-patterns.md](references/attack-patterns.md) |

---

## External References

### Primary Standards
- [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/)
- [OWASP Top 10 for Agentic Applications (2026)](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

### Tools & Frameworks
- [DeepTeam - LLM Red Teaming Framework](https://github.com/confident-ai/deepteam)
- [Promptfoo - LLM Testing](https://www.promptfoo.dev/docs/red-team/)
- [Garak - LLM Vulnerability Scanner](https://github.com/leondz/garak)
