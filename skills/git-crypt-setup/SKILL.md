---
name: git-crypt-setup
description: Sets up git-crypt for encrypted credentials. Use when git-crypt is not installed or repo is not unlocked.
---

# Skill: git-crypt Setup

This skill guides installation and configuration of git-crypt for accessing encrypted credentials in the `.windsurf` subtree.

---

## Quick Check

Run this to verify git-crypt status:

```powershell
git-crypt status 2>&1 | Select-Object -First 1
```

**Expected output if working:** `not encrypted: .gitattributes` (or similar file list)
**If git-crypt not installed:** `git-crypt: The term 'git-crypt' is not recognized...`
**If repo not unlocked:** `Error: this repository has not been unlocked...`

---

## Installation

### Windows (via Scoop)

```powershell
# Step 1: Set execution policy (if not already set)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Step 2: Install Scoop (if not installed)
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Step 3: Install git-crypt
scoop install git-crypt

# Step 4: Restart terminal/IDE for PATH to update
```

### macOS

```bash
brew install git-crypt
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install git-crypt
```

---

## Unlocking the Repository

After git-crypt is installed, unlock the repo to decrypt credentials:

```bash
git-crypt unlock /path/to/windsurf-git-crypt.key
```

**Key file location:** `C:\Users\Jonny\windsurf-git-crypt.key` (or ask repo owner)

---

## Verification

After unlocking, verify credentials are accessible:

```powershell
# Check git-crypt status
git-crypt status | Select-String "encrypted"

# Verify credentials file is readable (not binary)
Get-Content .windsurf/config/credentials.json | Select-Object -First 3
```

**Expected:** JSON content visible, not binary gibberish.

---

## Troubleshooting

### "git-crypt not recognized"
- Restart terminal/IDE after installation
- Verify installation: `scoop list git-crypt` (Windows) or `which git-crypt` (macOS/Linux)

### "repository has not been unlocked"
- Run `git-crypt unlock /path/to/key`
- Ensure you have the correct key file

### Credentials file shows binary content
- Repo is locked - run `git-crypt unlock`

---

## For New Machines

1. Clone the repo (or pull subtree)
2. Install git-crypt (see Installation above)
3. Obtain the key file from repo owner
4. Run `git-crypt unlock /path/to/key`
5. Verify with `git-crypt status`

---

## Exporting Key (Admin Only)

To export the key for sharing with new machines:

```bash
git-crypt export-key /path/to/windsurf-git-crypt.key
```

**Store this key securely** - it decrypts all credentials in the repo.
