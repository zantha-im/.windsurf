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

## Step 2: Create Netlify Site

```javascript
const { createNetlifyClient } = require('./.windsurf/tools/netlify');
const netlify = createNetlifyClient();

const site = await netlify.createSite({
  name: '[site-name]',           // e.g., 'zantha-products'
  repo: '[github-repo]',         // e.g., 'zantha-im/zantha-products'
  branch: '[branch]'             // e.g., 'main'
});

console.log('Site created:', site.defaultUrl);
```

Report to user:
- Site ID: `[site.id]`
- Default URL: `https://[site-name].netlify.app`
- Admin URL: `[site.adminUrl]`

## Step 3: Set Environment Variables (if provided)

```javascript
const envVars = {
  DATABASE_URL: '...',
  // ... other vars
};

await netlify.setEnvVars(site.id, envVars);
```

Report: "Environment variables configured: [list keys]"

## Step 4: Create Route53 DNS Record

```javascript
const { createRoute53Client } = require('./.windsurf/tools/aws/route53');
const route53 = createRoute53Client();

await route53.createCnameRecord(
  'zantha.im',                    // Base domain
  '[subdomain]',                  // e.g., 'products'
  '[site-name].netlify.app'       // Target
);
```

Report: "DNS record created: `[subdomain].zantha.im` → `[site-name].netlify.app`"

## Step 5: Add Custom Domain to Netlify

```javascript
await netlify.addCustomDomain(site.id, '[subdomain].zantha.im');
```

Report: "Custom domain configured on Netlify"

## Step 6: Wait for DNS Propagation

Wait 30-60 seconds for DNS to propagate. Netlify needs to verify the CNAME record.

```javascript
// Simple wait
await new Promise(resolve => setTimeout(resolve, 45000));
```

Or check DNS propagation manually:
```bash
nslookup [subdomain].zantha.im
```

## Step 7: Provision SSL Certificate

```javascript
const ssl = await netlify.provisionSSL(site.id);
console.log('SSL state:', ssl.state);
```

**Note:** If SSL provisioning fails, it usually means DNS hasn't propagated yet. Wait and retry.

## Step 8: Report Completion

Report to user:

```
✅ Deployment Complete!

Site: [site-name]
GitHub Repo: [github-repo]
Branch: [branch]

URLs:
- Netlify: https://[site-name].netlify.app
- Custom: https://[subdomain].zantha.im

Admin: [admin-url]

SSL: [provisioned/pending]
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
