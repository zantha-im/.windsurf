---
description: Deploy a new app to Netlify with custom domain and SSL. Use when setting up a new Netlify site linked to GitHub.
---

# Deploy Netlify App Workflow

Automates the full deployment flow: create Netlify site → set env vars → create DNS record → add custom domain → provision SSL.

## Step 0: Verify git-crypt (Encrypted Credentials)

Run these checks in order:

```powershell
# 1. Check git-crypt installed
git-crypt --version

# 2. Check key file exists
Test-Path .windsurf/.git-crypt-key

# 3. Check repo unlocked
git-crypt status 2>&1 | Select-Object -First 1
```

**Decision tree:**
- git-crypt not installed → Invoke `@git-crypt-setup` skill (Installation section)
- Key file missing → Invoke `@git-crypt-setup` skill (Obtaining the Key section)
- Repo not unlocked → Run: `git-crypt unlock .windsurf/.git-crypt-key`
- All checks pass → Continue to Step 1

## Prerequisites

- git-crypt unlocked (Step 0 verifies this)
- Netlify and AWS credentials in `.windsurf/config/credentials.json` (see `tools/README.md` Getting Started)
- GitHub repo exists and is accessible to Netlify

## Step 1: Gather Deployment Details

Use `ask_user_question` to collect:

**Question 1:** "What is the GitHub repository?" (e.g., `zantha-im/zantha-products`)

**Question 2:** "What subdomain should this deploy to?" (e.g., `products` for `products.zantha.im`)

**Question 3:** "What branch should be deployed?" 
- Options: `main`, `dev`, `Other (specify)`

**Question 4:** "Does this app need environment variables?"
- Options: `Yes - I'll provide them`, `No - skip env vars`

If yes, ask for env vars in format: `KEY=value` (one per line)

## Idempotent Workflow (Resume Support)

**All steps are idempotent** - safe to re-run after partial failures. Each step returns a `skipped` or `existed` flag indicating whether work was done or skipped.

## Step 2: Create Netlify Site

```javascript
const { createNetlifyClient } = require('./.windsurf/tools/netlify');
const netlify = createNetlifyClient();

const site = await netlify.createSite({
  name: '[site-name]',           // e.g., 'zantha-products'
  repo: '[github-repo]',         // e.g., 'zantha-im/zantha-products'
  branch: '[branch]'             // e.g., 'main'
});

// site.existed = true if site already exists, false if newly created
```

Report to user:
- Site ID: `[site.id]`
- Status: `[site.existed ? 'Using existing site' : 'Created new site']`
- Default URL: `https://[site-name].netlify.app`

## Step 3: Set Environment Variables (if provided)

**SECURITY: Never expose secrets in terminal commands or chat.**

Use the file-based method to avoid secrets in terminal history:

```javascript
// 1. Write env vars to a temp file (use write_to_file tool)
const envVars = {
  DATABASE_URL: '...',
  API_KEY: '...'
};
// Save to: .env-deploy-temp.json

// 2. Set env vars from file (auto-deletes after reading)
const results = await netlify.setEnvVarsFromFile(site.id, '.env-deploy-temp.json');
// File is automatically deleted after reading
```

**Workflow for collecting env vars:**
1. Ask user to provide env vars (they can paste multi-line KEY=value format)
2. Parse the input into a JSON object
3. Write to `.env-deploy-temp.json` using `write_to_file` tool
4. Call `setEnvVarsFromFile()` which reads, sets, and deletes the file

Report: "Environment variables configured: [list keys only, not values]"

## Step 4: Create Route53 DNS Record

```javascript
const { createRoute53Client } = require('./.windsurf/tools/aws/route53');
const route53 = createRoute53Client();

await route53.createCnameRecord(
  'zantha.im',                    // Base domain
  '[subdomain]',                  // e.g., 'products'
  '[site-name].netlify.app'       // Target
);
// Uses UPSERT - creates or updates, always idempotent
```

Report: "DNS record configured: `[subdomain].zantha.im` → `[site-name].netlify.app`"

## Step 4b: Create TXT Record for Domain Verification

**Netlify requires TXT record verification for external DNS (non-Netlify DNS).**

```javascript
// Create TXT record for Netlify domain verification
const txtValue = `netlify-verify-${site.id}`;

await route53.createTxtRecord(
  'zantha.im',                           // Base domain
  `netlify-challenge.[subdomain]`,       // e.g., 'netlify-challenge.products'
  txtValue
);
```

Report: "TXT verification record created: `netlify-challenge.[subdomain].zantha.im`"

## Step 5: Add Custom Domain to Netlify

```javascript
const txtValue = `netlify-verify-${site.id}`;
const result = await netlify.addCustomDomain(site.id, '[subdomain].zantha.im', {
  txtRecordValue: txtValue
});
// result.skipped = true if domain already configured
```

**If 422 error occurs without TXT verification:**
The error message will provide instructions for adding the TXT record manually.

Report: `[result.skipped ? 'Domain already configured' : 'Custom domain added']`

## Step 5b: Clean Up TXT Verification Record

After domain is successfully added, delete the TXT record to keep the hosted zone clean.
The TXT record is only needed for initial verification.

```javascript
// Only delete if we just added the domain (not skipped)
if (!result.skipped) {
  try {
    await route53.deleteRecord('zantha.im', `netlify-challenge.[subdomain]`, 'TXT');
    console.log('TXT verification record deleted');
  } catch (e) {
    // Non-fatal - record may not exist or already deleted
    console.log('TXT record cleanup skipped:', e.message);
  }
}
```

Report: "TXT verification record cleaned up"

## Step 6: Wait for DNS Propagation

Wait 30-60 seconds for DNS to propagate. Netlify needs to verify the CNAME and TXT records.

```javascript
// Simple wait
await new Promise(resolve => setTimeout(resolve, 45000));
```

Or check DNS propagation manually:
```bash
nslookup [subdomain].zantha.im
nslookup -type=TXT netlify-challenge.[subdomain].zantha.im
```

## Step 7: Provision SSL Certificate

```javascript
const ssl = await netlify.provisionSSL(site.id);
// ssl.skipped = true if SSL already provisioned
console.log('SSL state:', ssl.state);
```

Report: `[ssl.skipped ? 'SSL already provisioned' : 'SSL provisioning initiated']`

**Note:** If SSL provisioning fails, it usually means DNS hasn't propagated yet. Wait and retry.

## Step 8: Verify Build Started Successfully

**IMPORTANT:** Check that Netlify can access the repo and build is underway.

```javascript
// Wait up to 30 seconds for build to start/complete
const status = await netlify.checkDeployStatus(site.id, { waitSeconds: 30 });

if (status.isFailed) {
  throw new Error(`Build failed: ${status.errorMessage}`);
}

if (status.state === 'no_deploys') {
  // Trigger initial deploy
  await netlify.triggerDeploy(site.id);
  // Check again
  const retryStatus = await netlify.checkDeployStatus(site.id, { waitSeconds: 10 });
  if (retryStatus.isFailed) {
    throw new Error(`Build failed after trigger: ${retryStatus.errorMessage}`);
  }
}
```

**If build fails with "Unable to access repository":**
- The `installation_id` may not have been set correctly
- Check: `client.getSite({ site_id }).then(r => console.log(r.build_settings?.installation_id))`
- Fix: Re-run createSite after pulling latest subtree, or manually re-link repo in Netlify UI

Report: `Build status: ${status.state} ${status.isBuilding ? '(in progress)' : ''}`

## Step 9: Report Completion

Report to user with resume status:

```
✅ Deployment Complete!

Site: [site-name]
GitHub Repo: [github-repo]
Branch: [branch]

URLs:
- Netlify: https://[site-name].netlify.app
- Custom: https://[subdomain].zantha.im

Admin: [admin-url]

SSL: [ssl.state]
Build: [status.state]

Steps Summary:
- Site: [site.existed ? '⏭️ Existing' : '✅ Created']
- Env Vars: ✅ Configured
- DNS: ✅ Configured (UPSERT)
- Custom Domain: [domain.skipped ? '⏭️ Already set' : '✅ Added']
- SSL: [ssl.skipped ? '⏭️ Already provisioned' : '✅ Provisioned']
- Build: [status.isBuilding ? '🔄 In Progress' : status.isReady ? '✅ Ready' : '❌ Failed']
```

## Troubleshooting

### SSL Provisioning Fails
- DNS may not have propagated yet
- Wait 2-5 minutes and retry: `await netlify.provisionSSL(site.id)`
- Check DNS: `nslookup [subdomain].zantha.im` should return Netlify's servers

### Site Creation Fails
- Check GitHub repo exists and Netlify has access
- Verify Netlify token has correct permissions
- Check team slug is correct in credentials.json

### DNS Record Fails
- Verify AWS credentials are configured
- Check hosted zone exists for `zantha.im`
