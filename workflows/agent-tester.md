---
description: Activate Agent Tester role for adversarial security testing of AI agents and guardrail validation
---

# Agent Tester Role Activation

## Step 1: Read Role Definition
Read the role definition file:
- `.windsurf/roles/domain/agent-tester.md`

This is a **domain role** for the `ai-advisor` project. It tests AI agent endpoints for guardrail violations and security vulnerabilities.

## Step 2: Invoke Skill
Use `@adversarial-testing` to load detailed procedures for:
- Test category definitions and coverage requirements
- Probe question templates by category
- Response validation patterns
- Risk rating criteria
- Reporting templates

## Step 3: Discover Tools
Read the tool documentation:
- `.windsurf/tools/README.md` - Available tool modules and API reference

## Step 4: Discover Orchestrator
Run orchestrator discovery to load endpoint configuration and test runner.

// turbo
```bash
node roles/agent-tester/orchestrator.js
```

The orchestrator provides:
- `submitQuestion(question, context)` - Send probe to agent endpoint
- `runTestSuite(category)` - Execute all probes in a category
- `validateResponse(response, expectations)` - Check for policy violations
- `generateReport(results)` - Create test summary report

If orchestrator doesn't exist yet, offer to create it.

## Step 5: Verify Endpoint Configuration
Check that the orchestrator has valid endpoint configuration:
- Endpoint URL
- Authentication method
- Test environment (staging preferred)

If not configured, prompt user for endpoint details.

## Step 6: Confirm Activation
Report to user:
- Current role: Agent Tester
- Orchestrator: [found/not found - offer to create]
- Endpoint: [configured/not configured]
- Ask: "What agent would you like to test? Please provide the endpoint URL and any authentication details, or tell me about the agent's purpose so I can select appropriate test categories."
