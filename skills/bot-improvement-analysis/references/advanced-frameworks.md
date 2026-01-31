# Advanced Frameworks for Bot Improvement

Reference document for the Support Advisor role covering industry frameworks, evaluation patterns, and best practices for continuous bot improvement.

---

## 1. Compliance Frameworks

### NIST AI Risk Management Framework (AI RMF)

**Source:** [NIST AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1) (Released January 2023)

The NIST AI RMF is a voluntary framework for managing AI risks. Key components relevant to bot improvement:

#### Core Functions

| Function | Purpose | Application to Support Bot |
|----------|---------|---------------------------|
| **GOVERN** | Establish accountability structures | Define who approves prompt changes |
| **MAP** | Understand AI system context | Document bot capabilities and limitations |
| **MEASURE** | Assess and track risks | Track hallucination rates, user satisfaction |
| **MANAGE** | Prioritize and respond to risks | Implement guardrails, rollback procedures |

#### Continual Improvement Principles

1. **Iterative testing** - Test before and after changes
2. **Stakeholder feedback** - Incorporate user feedback loops
3. **Documentation** - Maintain change logs and rationale
4. **Monitoring** - Continuous performance tracking

#### Safety Guardrails for Autonomous Agents

- **Input validation** - Filter harmful or out-of-scope queries
- **Output constraints** - Limit response types and formats
- **Fallback mechanisms** - Graceful degradation when uncertain
- **Human escalation** - Clear paths to human support

---

### ISO/IEC 42001 (AI Management System)

**Source:** [ISO/IEC 42001:2023](https://www.iso.org/standard/81230.html)

The world's first AI management system standard. Key requirements:

#### AIMS Requirements

| Requirement | Description | Bot Application |
|-------------|-------------|-----------------|
| **Leadership** | Top management commitment | Approval workflows for changes |
| **Planning** | Risk/opportunity assessment | Identify improvement areas |
| **Support** | Resources, training, communication | Document procedures |
| **Operation** | Development, deployment, maintenance | Prompt versioning, testing |
| **Performance Evaluation** | Monitor, measure, analyze | Metrics tracking |
| **Continual Improvement** | Ongoing AIMS refinement | Iterative optimization |

#### Organizational Roles

- **AI Provider** - Provides AI products/services
- **AI Producer** - Designs, develops, tests, deploys AI
- **AI User** - Uses AI products/services

#### Annex Structure

- **Annex A** - Management guide, list of controls
- **Annex B** - Implementation guidance, data management
- **Annex C** - Organizational objectives and risk sources
- **Annex D** - Domain/sector-specific standards

---

## 2. Evaluation Metrics

### LLM-as-a-Judge Pattern

**Source:** [Zheng et al., 2023 - "Judging LLM-as-a-Judge"](https://arxiv.org/abs/2306.05685)

Use an LLM to evaluate bot responses, similar to human evaluation.

#### Evaluation Types

| Type | Method | Use Case |
|------|--------|----------|
| **Pairwise Comparison** | Compare two responses, pick better | A/B testing prompts |
| **Direct Scoring** | Score single response on criteria | Production monitoring |
| **Reference-Based** | Compare against source/ground truth | Factual accuracy |

#### Evaluation Criteria for Support Bots

- **Politeness** - Is the response respectful?
- **Helpfulness** - Does it address the user's need?
- **Accuracy** - Is the information correct?
- **Tone** - Is it appropriate for the context?
- **Hallucination** - Does it stick to known facts?
- **Resolution** - Does it solve the problem?

#### Implementation Pattern

```python
# Example LLM-as-a-Judge prompt structure
JUDGE_PROMPT = """
You are evaluating a customer support bot response.

User Query: {user_query}
Bot Response: {bot_response}

Rate the response on the following criteria (1-5):
1. Helpfulness: Does it address the user's need?
2. Accuracy: Is the information factually correct?
3. Tone: Is it appropriate and professional?

Provide scores and brief justification for each.
"""
```

#### Best Practices

1. **Define clear criteria** - Specific, measurable dimensions
2. **Use consistent prompts** - Standardize evaluation format
3. **Calibrate with humans** - Validate LLM judgments against human labels
4. **Track over time** - Monitor trends, not just point-in-time scores

---

### RAGAS (RAG Assessment)

**Source:** [RAGAS Documentation](https://docs.ragas.io/)

If the bot uses RAG (Retrieval-Augmented Generation), use RAGAS metrics:

#### Core RAG Metrics

| Metric | What It Measures | Target |
|--------|------------------|--------|
| **Faithfulness** | Response grounded in retrieved context | >0.9 |
| **Context Precision** | Retrieved chunks are relevant | >0.8 |
| **Context Recall** | All needed info was retrieved | >0.8 |
| **Response Relevancy** | Answer addresses the question | >0.85 |
| **Noise Sensitivity** | Robustness to irrelevant context | Low |

#### Agent/Tool Metrics

| Metric | What It Measures |
|--------|------------------|
| **Topic Adherence** | Stays on topic |
| **Tool Call Accuracy** | Correct tool selection |
| **Agent Goal Accuracy** | Achieves intended outcome |

---

## 3. Prompt Versioning

### Semantic Versioning for Prompts

**Source:** [Semantic Versioning 2.0.0](https://semver.org/)

Apply software versioning principles to system prompts:

#### Version Format: `MAJOR.MINOR.PATCH`

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| **Breaking change** | MAJOR | Personality shift, new constraints |
| **New capability** | MINOR | Added topic handling |
| **Bug fix/tweak** | PATCH | Typo fix, minor wording |

#### Git Tagging Pattern

```bash
# Tag a prompt version
git tag -a v1.2.0 -m "Add product return handling"

# List prompt versions
git tag -l "v*"

# View specific version
git show v1.2.0
```

#### Prompt File Structure

```
prompts/
├── system-prompt.md          # Current version
├── CHANGELOG.md              # Version history
└── versions/
    ├── v1.0.0.md
    ├── v1.1.0.md
    └── v1.2.0.md
```

#### CHANGELOG Format

```markdown
# Prompt Changelog

## [1.2.0] - 2026-01-29
### Added
- Product return handling instructions
- Escalation triggers for refund requests

### Changed
- Softened tone for complaint responses

## [1.1.0] - 2026-01-15
### Added
- FAQ knowledge base integration
```

#### Rollback Procedure

1. Identify regression via metrics
2. Locate last known good version tag
3. Revert to previous prompt version
4. Run agent-tester suite to confirm
5. Document rollback reason

---

## 4. Self-Refinement Patterns

### Self-Refine Prompting

**Source:** [Madaan et al., 2023 - "Self-Refine"](https://arxiv.org/abs/2303.17651)

Enable the bot to iteratively improve its own responses.

#### Three-Step Process

1. **Initial Output** - Generate first response
2. **Feedback** - Ask LLM to critique its own response
3. **Refinement** - Improve based on feedback

#### Implementation Pattern

```python
# Step 1: Initial response
initial_response = llm.generate(user_query)

# Step 2: Self-critique
feedback_prompt = f"""
Review this customer support response:
{initial_response}

Identify any issues with:
- Accuracy
- Helpfulness
- Tone
- Completeness

If no improvements needed, say "APPROVED".
"""
feedback = llm.generate(feedback_prompt)

# Step 3: Refine if needed
if "APPROVED" not in feedback:
    refined_prompt = f"""
    Original response: {initial_response}
    Feedback: {feedback}
    
    Provide an improved response addressing the feedback.
    """
    final_response = llm.generate(refined_prompt)
```

#### Results from Research

- **+8.7 units** improvement in code optimization
- **+13.9 units** improvement in code readability
- **+21.6 units** improvement in sentiment tasks

#### Limitations

- Requires instruction-following capability
- Can be exploited by bad actors
- Adds latency (multiple LLM calls)

---

### CRITIC Pattern

**Source:** [Gou et al., 2023 - "CRITIC"](https://arxiv.org/abs/2305.11738)

Structured self-correction with external verification.

#### Process

1. **Generate** - Produce initial response
2. **Critique** - Identify potential errors
3. **Verify** - Check against external sources (if available)
4. **Correct** - Fix identified issues

#### Application to Support Bot

```
User: "What's your return policy?"

Bot (Draft): "You can return items within 30 days."

Critique: "Did I cite the correct policy? Let me verify..."

Verification: [Query knowledge base for return policy]

Bot (Final): "You can return items within 30 days of purchase 
for a full refund. Items must be unused and in original packaging."
```

---

## 5. Integration with Support Advisor Workflow

### Recommended Implementation Order

1. **Phase 1: Metrics Foundation**
   - Implement LLM-as-a-Judge for key criteria
   - Establish baseline scores
   - Set up continuous monitoring

2. **Phase 2: Version Control**
   - Implement prompt versioning with Git tags
   - Create CHANGELOG discipline
   - Document rollback procedures

3. **Phase 3: Self-Improvement**
   - Add self-critique for complex queries
   - Implement verification against knowledge base
   - Monitor latency impact

4. **Phase 4: Compliance Alignment**
   - Map practices to NIST AI RMF functions
   - Document for ISO 42001 alignment
   - Establish governance workflows

### Checklist for Prompt Changes

```
Prompt Change Checklist:
- [ ] Version number assigned (MAJOR.MINOR.PATCH)
- [ ] CHANGELOG updated
- [ ] Baseline metrics captured (before)
- [ ] Agent-tester suite passed
- [ ] Post-change metrics captured (after)
- [ ] No regression detected
- [ ] Git tag created
- [ ] Human approval obtained (if MAJOR change)
```

---

## References

- [NIST AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1)
- [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook)
- [ISO/IEC 42001:2023](https://www.iso.org/standard/81230.html)
- [LLM-as-a-Judge Guide (Evidently AI)](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [RAGAS Documentation](https://docs.ragas.io/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Self-Refine Paper](https://arxiv.org/abs/2303.17651)
- [CRITIC Paper](https://arxiv.org/abs/2305.11738)
