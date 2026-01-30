---
name: git-crypt-setup
description: Sets up git-crypt for encrypted credentials. Use when git-crypt is not installed or repo is not unlocked.
---

# Skill: git-crypt Setup

This skill guides installation and configuration of git-crypt for accessing encrypted credentials in the `.windsurf` subtree.

## Standard Key Location

```
.windsurf/.git-crypt-key
```

This file is gitignored and must be obtained from 1Password.

---

## Automated Check (For Workflows)

Run these checks in order:

```powershell
# 1. Check if git-crypt is installed
git-crypt --version

# 2. Check if key file exists at standard location
Test-Path .windsurf/.git-crypt-key

# 3. Check if repo is unlocked
git-crypt status 2>&1 | Select-Object -First 1
```

**Decision tree:**
- git-crypt not installed → Go to **Installation**
- Key file missing → Go to **Obtaining the Key**
- Repo not unlocked → Run `git-crypt unlock .windsurf/.git-crypt-key`
- All good → Credentials are accessible

---

## Obtaining the Key

The git-crypt key is stored in **1Password** (Zantha vault):

1. Open 1Password
2. Search for **"git-crypt key"**
3. Download the attached file `windsurf-git-crypt.key`
4. Save it to `.windsurf/.git-crypt-key`

```powershell
# After downloading, move to standard location
Move-Item ~/Downloads/windsurf-git-crypt.key .windsurf/.git-crypt-key
```

**Note:** This file is gitignored - it will not be committed to the repo.

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

After git-crypt is installed and key file is in place, unlock the repo:

```powershell
git-crypt unlock .windsurf/.git-crypt-key
```

This only needs to be done once per clone. The repo stays unlocked.

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

## For New Machines / New Users

1. Clone the repo (or pull subtree)
2. Install git-crypt (see **Installation** above)
3. Download key from 1Password (see **Obtaining the Key** above)
4. Save to `.windsurf/.git-crypt-key`
5. Run `git-crypt unlock .windsurf/.git-crypt-key`
6. Verify with `git-crypt status`

---

## Exporting Key (Admin Only)

To export the key for sharing with new machines:

```bash
git-crypt export-key /path/to/windsurf-git-crypt.key
```

**Store this key securely** - it decrypts all credentials in the repo.
