/**
 * Netlify API Module
 * Wrapper for Netlify site management, custom domains, and SSL provisioning
 * 
 * Usage:
 *   const { createNetlifyClient } = require('./.windsurf/tools/netlify');
 *   
 *   const netlify = createNetlifyClient();
 *   // or with explicit token:
 *   const netlify = createNetlifyClient({ token: 'nfp_xxx' });
 *   
 *   // Create a site linked to GitHub
 *   const site = await netlify.createSite({
 *     name: 'my-app',
 *     repo: 'zantha-im/my-app',
 *     branch: 'main'
 *   });
 *   
 *   // Add custom domain and provision SSL
 *   await netlify.addCustomDomain(site.id, 'app.zantha.im');
 *   await netlify.provisionSSL(site.id);
 */

const credentials = require('../credentials');

/**
 * Create Netlify API client
 * @param {Object} config
 * @param {string} config.token - Netlify personal access token (or use NETLIFY_TOKEN env var)
 * @param {string} config.teamSlug - Netlify team slug (or use NETLIFY_TEAM_SLUG env var)
 * @returns {Object} Netlify client wrapper
 */
function createNetlifyClient(config = {}) {
  const creds = credentials.get('netlify') || {};
  const token = config.token || creds.token;
  const teamSlug = config.teamSlug || creds.teamSlug;
  
  if (!token) {
    throw new Error(
      'Netlify token required. Set NETLIFY_TOKEN env var, pass token in config, ' +
      'or add to .windsurf/config/credentials.json'
    );
  }
  
  const { NetlifyAPI } = require('netlify');
  const api = new NetlifyAPI(token);
  
  return {
    /**
     * Get the team slug
     */
    getTeamSlug() {
      return teamSlug;
    },
    
    /**
     * List all sites
     * @returns {Promise<Array>} List of sites
     */
    async listSites() {
      const sites = await api.listSites();
      return sites.map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        sslUrl: site.ssl_url,
        customDomain: site.custom_domain,
        adminUrl: site.admin_url,
        createdAt: site.created_at,
        updatedAt: site.updated_at
      }));
    },
    
    /**
     * Get a site by ID or name
     * @param {string} siteId - Site ID or name (e.g., 'my-site' or 'my-site.netlify.app')
     * @returns {Promise<Object>} Site details
     */
    async getSite(siteId) {
      const site = await api.getSite({ site_id: siteId });
      return {
        id: site.id,
        name: site.name,
        url: site.url,
        sslUrl: site.ssl_url,
        customDomain: site.custom_domain,
        domainAliases: site.domain_aliases,
        adminUrl: site.admin_url,
        repoUrl: site.build_settings?.repo_url,
        branch: site.build_settings?.branch,
        buildCommand: site.build_settings?.cmd,
        publishDir: site.build_settings?.dir,
        ssl: site.ssl,
        forceSsl: site.force_ssl,
        createdAt: site.created_at,
        updatedAt: site.updated_at
      };
    },
    
    /**
     * Create a new site linked to a GitHub repository (idempotent)
     * If a site with the same name already exists, returns the existing site.
     * @param {Object} options
     * @param {string} options.name - Site name (becomes name.netlify.app)
     * @param {string} options.repo - GitHub repo (e.g., 'zantha-im/my-app')
     * @param {string} options.branch - Branch to deploy (default: 'main')
     * @param {string} options.buildCommand - Build command (optional)
     * @param {string} options.publishDir - Publish directory (optional)
     * @returns {Promise<Object>} Created or existing site (includes `existed` flag)
     */
    async createSite(options) {
      const { name, repo, branch = 'main', buildCommand, publishDir } = options;
      
      // Check if site already exists by name
      try {
        const existing = await api.getSite({ site_id: name });
        if (existing) {
          return {
            id: existing.id,
            name: existing.name,
            url: existing.url,
            sslUrl: existing.ssl_url,
            adminUrl: existing.admin_url,
            defaultUrl: `${existing.name}.netlify.app`,
            existed: true
          };
        }
      } catch (e) {
        // Site doesn't exist by that name, continue to create
      }
      
      const body = {
        name,
        repo: {
          provider: 'github',
          repo,
          private: true,
          branch,
          cmd: buildCommand,
          dir: publishDir
        }
      };
      
      let site;
      try {
        if (teamSlug) {
          site = await api.createSiteInTeam({ account_slug: teamSlug, body });
        } else {
          site = await api.createSite({ body });
        }
      } catch (createError) {
        // Handle 422 Unprocessable Entity - site name may already exist
        if (createError.status === 422 || createError.message?.includes('422')) {
          // Try to find existing site by listing all sites
          const sites = await api.listSites();
          const existing = sites.find(s => s.name === name);
          if (existing) {
            // Ensure repo settings are configured on existing site
            // (createSite may have partially failed, leaving repo unlinked)
            try {
              await api.updateSite({
                site_id: existing.id,
                body: {
                  repo: {
                    provider: 'github',
                    repo,
                    branch,
                    cmd: buildCommand,
                    dir: publishDir
                  }
                }
              });
            } catch (updateError) {
              // Ignore update errors - site exists, repo may already be configured
            }
            
            return {
              id: existing.id,
              name: existing.name,
              url: existing.url,
              sslUrl: existing.ssl_url,
              adminUrl: existing.admin_url,
              defaultUrl: `${existing.name}.netlify.app`,
              existed: true
            };
          }
        }
        // Re-throw if we couldn't recover
        throw createError;
      }
      
      return {
        id: site.id,
        name: site.name,
        url: site.url,
        sslUrl: site.ssl_url,
        adminUrl: site.admin_url,
        defaultUrl: `${site.name}.netlify.app`,
        existed: false
      };
    },
    
    /**
     * Update site settings
     * @param {string} siteId - Site ID
     * @param {Object} settings - Settings to update
     * @returns {Promise<Object>} Updated site
     */
    async updateSite(siteId, settings) {
      const site = await api.updateSite({ site_id: siteId, body: settings });
      return {
        id: site.id,
        name: site.name,
        customDomain: site.custom_domain,
        forceSsl: site.force_ssl
      };
    },
    
    /**
     * Add a custom domain to a site (idempotent)
     * 
     * For external DNS (non-Netlify DNS), Netlify requires TXT record verification:
     * 1. Add TXT record: host=netlify-challenge.subdomain, value=<any unique value>
     * 2. Pass the same value as txtRecordValue parameter
     * 
     * @param {string} siteId - Site ID
     * @param {string} domain - Custom domain (e.g., 'products.zantha.im')
     * @param {Object} options - Optional settings
     * @param {string} options.txtRecordValue - TXT record value for domain verification (required for external DNS)
     * @returns {Promise<Object>} Updated site with `skipped` flag if already configured
     */
    async addCustomDomain(siteId, domain, options = {}) {
      const { txtRecordValue } = options;
      
      // Check if domain is already configured
      const site = await api.getSite({ site_id: siteId });
      if (site.custom_domain === domain) {
        return {
          id: site.id,
          name: site.name,
          customDomain: site.custom_domain,
          forceSsl: site.force_ssl,
          skipped: true,
          reason: 'Domain already configured'
        };
      }
      
      // Also check domain_aliases
      if (site.domain_aliases && site.domain_aliases.includes(domain)) {
        return {
          id: site.id,
          name: site.name,
          customDomain: site.custom_domain,
          domainAliases: site.domain_aliases,
          forceSsl: site.force_ssl,
          skipped: true,
          reason: 'Domain already in aliases'
        };
      }
      
      // Build update payload
      // NOTE: Do NOT include force_ssl when using txt_record_value - causes 422 error
      const updatePayload = { 
        custom_domain: domain
      };
      
      // Add TXT record value for verification if provided
      if (txtRecordValue) {
        updatePayload.txt_record_value = txtRecordValue;
      } else {
        // Only set force_ssl when not doing TXT verification
        updatePayload.force_ssl = true;
      }
      
      try {
        const result = await this.updateSite(siteId, updatePayload);
        return { ...result, skipped: false };
      } catch (error) {
        // Handle 422 Unprocessable Entity
        const is422 = error.status === 422 || error.message?.includes('422') || error.message?.includes('Unprocessable');
        
        if (is422 && !txtRecordValue) {
          // 422 without TXT verification - provide helpful error
          const subdomain = domain.split('.')[0];
          const baseDomain = domain.split('.').slice(1).join('.');
          throw new Error(
            `Failed to add domain ${domain}: Netlify requires TXT record verification for external DNS.\n\n` +
            `To fix this:\n` +
            `1. Add a TXT record to your DNS:\n` +
            `   Host: netlify-challenge.${subdomain}\n` +
            `   Value: netlify-verify-${siteId}\n` +
            `2. Wait for DNS propagation (check with: nslookup -type=TXT netlify-challenge.${domain})\n` +
            `3. Call addCustomDomain again with txtRecordValue option:\n` +
            `   netlify.addCustomDomain('${siteId}', '${domain}', { txtRecordValue: 'netlify-verify-${siteId}' })\n\n` +
            `Or add the domain manually in Netlify UI: https://app.netlify.com/projects/${site.name}/domain-management`
          );
        }
        
        if (is422) {
          // Try adding as domain alias instead
          try {
            const currentAliases = site.domain_aliases || [];
            if (!currentAliases.includes(domain)) {
              // NOTE: Do NOT include force_ssl when using txt_record_value - causes 422 error
              const aliasPayload = {
                domain_aliases: [...currentAliases, domain]
              };
              if (txtRecordValue) {
                aliasPayload.txt_record_value = txtRecordValue;
              } else {
                aliasPayload.force_ssl = true;
              }
              const result = await this.updateSite(siteId, aliasPayload);
              return { 
                ...result, 
                skipped: false,
                method: 'domain_alias',
                note: 'Added as domain alias (custom_domain failed with 422)'
              };
            }
          } catch (aliasError) {
            // Both methods failed
            throw new Error(
              `Failed to add domain ${domain}: ${error.message}. ` +
              `Also tried domain_aliases: ${aliasError.message}. ` +
              `You may need to add the domain manually in Netlify UI.`
            );
          }
        }
        throw error;
      }
    },
    
    /**
     * Provision SSL certificate for a site (idempotent)
     * If SSL is already provisioned, returns current state without changes.
     * Requires custom domain to be configured and DNS pointing to Netlify.
     * @param {string} siteId - Site ID
     * @returns {Promise<Object>} SSL provisioning result with `skipped` flag if already valid
     */
    async provisionSSL(siteId) {
      // Check current SSL state first
      try {
        const site = await api.getSite({ site_id: siteId });
        if (site.ssl && site.ssl.state === 'provisioned') {
          return {
            state: 'provisioned',
            domains: site.ssl.domains || [site.custom_domain],
            expiresAt: site.ssl.expires_at,
            skipped: true,
            reason: 'SSL already provisioned'
          };
        }
      } catch (e) {
        // Continue to provision
      }
      
      const result = await api.provisionSiteTLSCertificate({ site_id: siteId });
      
      // Handle null/undefined result
      if (!result) {
        // SSL provisioning initiated but no immediate result - check site status
        const site = await api.getSite({ site_id: siteId });
        return {
          state: site.ssl?.state || 'pending',
          domains: site.ssl?.domains || [site.custom_domain],
          expiresAt: site.ssl?.expires_at,
          skipped: false,
          note: 'SSL provisioning initiated'
        };
      }
      
      return {
        state: result.state || 'pending',
        domains: result.domains || [],
        expiresAt: result.expires_at,
        skipped: false
      };
    },
    
    /**
     * Get environment variables for a site
     * @param {string} siteId - Site ID
     * @returns {Promise<Array>} Environment variables
     */
    async getEnvVars(siteId) {
      // Get account ID first
      const site = await api.getSite({ site_id: siteId });
      const accountId = site.account_id;
      
      const envVars = await api.getEnvVars({ account_id: accountId, site_id: siteId });
      return envVars.map(env => ({
        key: env.key,
        values: env.values
      }));
    },
    
    /**
     * Set environment variables for a site
     * @param {string} siteId - Site ID
     * @param {Object} vars - Key-value pairs of environment variables
     * @returns {Promise<Array>} Created/updated environment variables
     */
    async setEnvVars(siteId, vars) {
      // Get account ID first
      const site = await api.getSite({ site_id: siteId });
      const accountId = site.account_id;
      
      // Build batch payload with proper scopes and contexts
      // Based on Netlify API: https://answers.netlify.com/t/how-am-i-supposed-to-set-up-env-variables-over-api/88043
      const envVarPayload = Object.entries(vars).map(([key, value]) => ({
        key,
        scopes: ['builds', 'functions', 'runtime', 'post_processing'],
        values: [
          { context: 'production', value: String(value) },
          { context: 'deploy-preview', value: String(value) },
          { context: 'branch-deploy', value: String(value) },
          { context: 'dev', value: String(value) }
        ]
      }));
      
      // First, delete existing vars to avoid conflicts (Netlify doesn't upsert well)
      const existingVars = await api.getEnvVars({ account_id: accountId, site_id: siteId });
      const keysToSet = new Set(Object.keys(vars));
      
      for (const existing of existingVars) {
        if (keysToSet.has(existing.key)) {
          try {
            await api.deleteEnvVar({ account_id: accountId, site_id: siteId, key: existing.key });
          } catch (e) {
            // Ignore delete errors
          }
        }
      }
      
      // Create all env vars in one batch call
      try {
        await api.createEnvVars({
          account_id: accountId,
          site_id: siteId,
          body: envVarPayload
        });
        return Object.keys(vars).map(key => ({ key, status: 'created' }));
      } catch (e) {
        // If batch fails, fall back to individual creates
        const results = [];
        for (const envVar of envVarPayload) {
          try {
            await api.createEnvVars({
              account_id: accountId,
              site_id: siteId,
              body: [envVar]
            });
            results.push({ key: envVar.key, status: 'created' });
          } catch (e2) {
            results.push({ key: envVar.key, status: 'error', error: e2.message });
          }
        }
        return results;
      }
    },
    
    /**
     * Set environment variables from a JSON file (secure - no secrets in terminal)
     * @param {string} siteId - Site ID
     * @param {string} filePath - Path to JSON file with key-value pairs
     * @param {boolean} deleteFile - Delete the file after reading (default: true)
     * @returns {Promise<Array>} Created/updated environment variables
     */
    async setEnvVarsFromFile(siteId, filePath, deleteFile = true) {
      const fs = require('fs');
      const path = require('path');
      
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Env vars file not found: ${resolvedPath}`);
      }
      
      const vars = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      const result = await this.setEnvVars(siteId, vars);
      
      if (deleteFile) {
        fs.unlinkSync(resolvedPath);
      }
      
      return result;
    },
    
    /**
     * Delete a site
     * @param {string} siteId - Site ID
     * @returns {Promise<void>}
     */
    async deleteSite(siteId) {
      await api.deleteSite({ site_id: siteId });
    },
    
    /**
     * Get the underlying Netlify API client for advanced operations
     */
    getClient() {
      return api;
    }
  };
}

module.exports = {
  createNetlifyClient
};
