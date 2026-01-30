/**
 * Unified Credentials Module
 * Single source of truth for loading credentials across all tools
 * 
 * Usage:
 *   const credentials = require('./.windsurf/tools/credentials');
 *   
 *   // Get credentials for a specific service
 *   const aws = credentials.get('aws');        // { region, accessKeyId, secretAccessKey }
 *   const netlify = credentials.get('netlify'); // { token, teamSlug }
 *   const google = credentials.get('google');   // { serviceAccountKeyPath, impersonateUser, domain }
 *   
 *   // Check if credentials are available
 *   if (credentials.has('aws')) { ... }
 *   
 *   // Get all available credentials
 *   const all = credentials.getAll();
 * 
 * Priority:
 *   1. Environment variables (project-specific override)
 *   2. Shared config file (.windsurf/config/credentials.json)
 *   3. Returns null if not found
 */

const path = require('path');
const fs = require('fs');

let _configCache = null;

/**
 * Load the shared credentials config file
 * Caches the result for performance
 */
function loadConfigFile() {
  if (_configCache !== null) {
    return _configCache;
  }
  
  const configPaths = [
    path.join(process.cwd(), '.windsurf/config/credentials.json'),
    path.join(__dirname, '../config/credentials.json')
  ];
  
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        _configCache = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return _configCache;
      } catch (e) {
        // Continue to next path
      }
    }
  }
  
  _configCache = {};
  return _configCache;
}

/**
 * Find the service account key file path
 * @param {string} relativePath - Relative path from config directory
 * @returns {string|null} Absolute path to key file, or null if not found
 */
function resolveKeyFilePath(relativePath) {
  if (!relativePath) return null;
  
  const configPaths = [
    path.join(process.cwd(), '.windsurf/config', relativePath),
    path.join(__dirname, '../config', relativePath)
  ];
  
  for (const p of configPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

/**
 * Environment variable mappings for each service
 */
const ENV_MAPPINGS = {
  netlify: {
    token: ['NETLIFY_TOKEN'],
    teamSlug: ['NETLIFY_TEAM_SLUG']
  },
  aws: {
    region: ['AWS_REGION'],
    accessKeyId: ['AWS_ACCESS_KEY_ID'],
    secretAccessKey: ['AWS_SECRET_ACCESS_KEY']
  },
  google: {
    clientId: ['GOOGLE_CLIENT_ID', 'GMAIL_CLIENT_ID'],
    clientSecret: ['GOOGLE_CLIENT_SECRET', 'GMAIL_CLIENT_SECRET']
  }
};

/**
 * Get a value from environment variables
 * @param {string[]} envVars - List of env var names to check (in order)
 * @returns {string|null} Value or null
 */
function getEnvValue(envVars) {
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      return process.env[envVar];
    }
  }
  return null;
}

/**
 * Get credentials for a specific service
 * @param {string} service - Service name: 'netlify', 'aws', 'google'
 * @returns {Object|null} Credentials object or null if not found
 */
function get(service) {
  const config = loadConfigFile();
  const envMapping = ENV_MAPPINGS[service] || {};
  
  switch (service) {
    case 'netlify': {
      const token = getEnvValue(envMapping.token || []) || config.netlify?.token;
      const teamSlug = getEnvValue(envMapping.teamSlug || []) || config.netlify?.teamSlug;
      
      if (!token) return null;
      return { token, teamSlug };
    }
    
    case 'aws': {
      const region = getEnvValue(envMapping.region || []) || config.aws?.region || 'us-east-1';
      const accessKeyId = getEnvValue(envMapping.accessKeyId || []) || config.aws?.accessKeyId;
      const secretAccessKey = getEnvValue(envMapping.secretAccessKey || []) || config.aws?.secretAccessKey;
      
      if (!accessKeyId || !secretAccessKey) return null;
      return { region, accessKeyId, secretAccessKey };
    }
    
    case 'google': {
      // For Google, we support both OAuth and Service Account
      // Priority: env vars > config file
      const clientId = getEnvValue(envMapping.clientId || []) || config.google?.clientId;
      const clientSecret = getEnvValue(envMapping.clientSecret || []) || config.google?.clientSecret;
      
      // Service account from config
      const serviceAccountKeyFile = config.google?.serviceAccountKeyFile;
      const serviceAccountKeyPath = resolveKeyFilePath(serviceAccountKeyFile);
      const impersonateUser = config.google?.impersonateUser;
      const domain = config.google?.domain;
      
      return {
        // OAuth credentials (env vars > config)
        clientId,
        clientSecret,
        // Service account credentials (from config)
        serviceAccountKeyPath,
        serviceAccountKeyFile,
        impersonateUser,
        domain,
        // Helper to check what's available
        hasOAuth: !!(clientId && clientSecret),
        hasServiceAccount: !!serviceAccountKeyPath
      };
    }
    
    default:
      // Return raw config for unknown services
      return config[service] || null;
  }
}

/**
 * Check if credentials are available for a service
 * @param {string} service - Service name
 * @returns {boolean}
 */
function has(service) {
  const creds = get(service);
  if (!creds) return false;
  
  switch (service) {
    case 'netlify':
      return !!creds.token;
    case 'aws':
      return !!(creds.accessKeyId && creds.secretAccessKey);
    case 'google':
      return creds.hasOAuth || creds.hasServiceAccount;
    default:
      return true;
  }
}

/**
 * Get all available credentials
 * @returns {Object} Object with all credential types
 */
function getAll() {
  return {
    netlify: get('netlify'),
    aws: get('aws'),
    google: get('google')
  };
}

/**
 * Clear the config cache (useful for testing)
 */
function clearCache() {
  _configCache = null;
}

/**
 * Get the path to the config file (for debugging)
 * @returns {string|null}
 */
function getConfigPath() {
  const configPaths = [
    path.join(process.cwd(), '.windsurf/config/credentials.json'),
    path.join(__dirname, '../config/credentials.json')
  ];
  
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  
  return null;
}

module.exports = {
  get,
  has,
  getAll,
  clearCache,
  getConfigPath,
  // Export for advanced use cases
  loadConfigFile,
  resolveKeyFilePath,
  getEnvValue
};
