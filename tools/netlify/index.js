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
      
      // Check if site already exists
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
        // Site doesn't exist, continue to create
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
      if (teamSlug) {
        site = await api.createSiteInTeam({ account_slug: teamSlug, body });
      } else {
        site = await api.createSite({ body });
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
     * Add a custom domain to a site
     * @param {string} siteId - Site ID
     * @param {string} domain - Custom domain (e.g., 'app.zantha.im')
     * @returns {Promise<Object>} Updated site
     */
    async addCustomDomain(siteId, domain) {
      return this.updateSite(siteId, { 
        custom_domain: domain,
        force_ssl: true
      });
    },
    
    /**
     * Provision SSL certificate for a site
     * Requires custom domain to be configured and DNS pointing to Netlify
     * @param {string} siteId - Site ID
     * @returns {Promise<Object>} SSL provisioning result
     */
    async provisionSSL(siteId) {
      const result = await api.provisionSiteTLSCertificate({ site_id: siteId });
      return {
        state: result.state,
        domains: result.domains,
        expiresAt: result.expires_at
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
      
      // Build batch payload - Netlify API accepts array of env vars
      const envVarPayload = Object.entries(vars).map(([key, value]) => ({
        key,
        values: [{ value: String(value), context: 'all' }]
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
