---
description: Discover available tools in role orchestrators. Use when needing to find available functions or commands.
---

# Tool Discovery Workflow

Discovers available tools from role orchestrator files using their `--help` flags.

## Prerequisites
- Working directory contains a `roles/` folder with orchestrator files

## Steps

1) Identify available orchestrators
// turbo
Get-ChildItem -Path "roles" -Filter "orchestrator.js" -Recurse | Select-Object -ExpandProperty DirectoryName | Split-Path -Leaf

2) Ask user which role to discover tools for (if multiple)
- If only one orchestrator exists, use it automatically
- If multiple exist, use `ask_user_question` to let user select

3) Run help command for selected orchestrator
// turbo
node roles/{selected-role}/orchestrator.js --help

4) Present the available tools to the user in a formatted table

## Notes
- Always use `--help` flag, never grep or read files to discover tools
- If `--help` is not implemented, note this as a gap and suggest adding it
- The help output should be grouped by category for readability

## Related Skills
- **tool-development** - Use this skill when you need to create a new tool or convert a one-off script into a reusable orchestrator function
