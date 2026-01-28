---
description: Pull the latest .windsurf subtree from the shared subtree repository
auto_execution_mode: 3
---

Prerequisites:
- Remote `windsurf_subtree` points to `https://github.com/zantha-im/.windsurf.git`.
- Start from a clean working tree. If there are uncommitted changes, stop and exit without proposing stash/commit workflows.

Execution rules:
- All steps marked `// turbo` must auto-run exactly as written. Do not insert additional checks (e.g., `git status`) or approval prompts.
- Non-interactive mode: do not narrate or justify steps; run commands and summarize results briefly at the end.
- Run steps exactly in the order listed; do not insert, remove, or reorder any steps.
- Do not propose alternatives like stash/commit/abort; either proceed (meets prerequisites) or stop (does not meet prerequisites).
- Do not run any pre-flight checks (including `git status`) beyond the commands specified.

Steps:

0) Detect target project
- Check the workspace for projects that have a `.windsurf/` subtree folder (not the `.windsurf` source repo itself).
- A project is a subtree consumer if it has `.windsurf/` as a subfolder AND is NOT the `.windsurf` source repository (i.e., the folder is not the git root).
- Exclude the `.windsurf` source repository from options (identified by being the git root of the `.windsurf` folder).
- If exactly ONE subtree consumer project exists: use it automatically, no prompt needed.
- If MULTIPLE subtree consumer projects exist: use `ask_user_question` tool to present options and let user select which project to update.
- If NO subtree consumer projects exist: stop and inform user that no projects with `.windsurf` subtree were found.
- Set the working directory (cwd) for all subsequent git commands to the selected project root.

1) Ensure the subtree remote exists (no-op if already present)
// turbo
cmd /c git remote get-url windsurf_subtree || git remote add windsurf_subtree https://github.com/zantha-im/.windsurf.git

2) Fetch the subtree remote
// turbo
cmd /c git fetch windsurf_subtree

3) Pull updates into `.windsurf/` using subtree with squash
// turbo
cmd /c git subtree pull --prefix=.windsurf windsurf_subtree main --squash -m "Update .windsurf subtree"

4) Sync missing files from remote
- Git subtree with --squash can miss files added after initial setup
- Use the git tool to compare and sync missing files
// turbo
node .windsurf/tools/git/index.js sync windsurf_subtree main .windsurf

5) Check for package.json changes and install dependencies
- Check if `.windsurf/package.json` exists
- If it exists, run `npm install` in the `.windsurf/` directory to ensure dependencies are available
// turbo
cmd /c if exist .windsurf\package.json (cd .windsurf && npm install)

Notes:
- `--squash` keeps the main repo history clean while updating only `.windsurf/` files.
- If merge conflicts occur, they will be confined to files under `.windsurf/`. Resolve and commit as usual. Do not attempt to stash around the pull.
- The subtree pull creates a merge commit; pushing is at the user's discretion and is outside this workflow.
- If you need to pull from a non-main branch, replace `main` with the desired branch.