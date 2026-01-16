/**
 * Google Auth Module
 * Configurable authentication for Google APIs (OAuth2 and Service Account)
 * 
 * Usage:
 *   const { createOAuth2Client, createServiceAccountClient } = require('.windsurf/tools/google/auth');
 *   
 *   // OAuth2 (user tokens)
 *   const auth = await createOAuth2Client({
 *     clientId: process.env.GMAIL_CLIENT_ID,
 *     clientSecret: process.env.GMAIL_CLIENT_SECRET,
 *     tokenPath: './credentials/oauth-tokens/google-tokens.json'
 *   });
 *   
 *   // Service Account (domain-wide delegation)
 *   const auth = await createServiceAccountClient({
 *     keyFilePath: './credentials/service-accounts/my-key.json',
 *     scopes: ['https://www.googleapis.com/auth/gmail.send'],
 *     impersonateUser: 'user@domain.com'
 *   });
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Create OAuth2 client with configurable token path
 * @param {Object} config
 * @param {string} config.clientId - OAuth2 client ID (or use GOOGLE_CLIENT_ID env var)
 * @param {string} config.clientSecret - OAuth2 client secret (or use GOOGLE_CLIENT_SECRET env var)
 * @param {string} config.tokenPath - Path to token JSON file
 * @param {string} config.redirectUri - OAuth redirect URI (default: http://localhost:3000)
 * @param {string[]} config.scopes - OAuth scopes (optional, for generating auth URL)
 * @returns {Promise<google.auth.OAuth2>}
 */
async function createOAuth2Client(config = {}) {
  const clientId = config.clientId || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = config.redirectUri || 'http://localhost:3000';
  const tokenPath = config.tokenPath;
  
  if (!clientId || !clientSecret) {
    throw new Error('OAuth2 requires clientId and clientSecret (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars)');
  }
  
  if (!tokenPath) {
    throw new Error('OAuth2 requires tokenPath to load/save tokens');
  }
  
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  
  // Load existing tokens
  const absoluteTokenPath = path.isAbsolute(tokenPath) ? tokenPath : path.resolve(process.cwd(), tokenPath);
  
  if (fs.existsSync(absoluteTokenPath)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(absoluteTokenPath, 'utf8'));
      oauth2Client.setCredentials(tokens);
      
      // Refresh if expired
      if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
        console.log('Google token expired, refreshing...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        fs.writeFileSync(absoluteTokenPath, JSON.stringify(credentials, null, 2));
        oauth2Client.setCredentials(credentials);
      }
    } catch (err) {
      throw new Error(`Failed to load tokens from ${absoluteTokenPath}: ${err.message}`);
    }
  } else {
    throw new Error(`No tokens found at ${absoluteTokenPath}. Run OAuth flow first.`);
  }
  
  return oauth2Client;
}

/**
 * Create Service Account client with domain-wide delegation
 * @param {Object} config
 * @param {string} config.keyFilePath - Path to service account JSON key file
 * @param {string[]} config.scopes - OAuth scopes to request
 * @param {string} config.impersonateUser - User email to impersonate (for domain-wide delegation)
 * @returns {Promise<google.auth.GoogleAuth>}
 */
async function createServiceAccountClient(config = {}) {
  const { keyFilePath, scopes, impersonateUser } = config;
  
  if (!keyFilePath) {
    throw new Error('Service account requires keyFilePath');
  }
  
  if (!scopes || scopes.length === 0) {
    throw new Error('Service account requires at least one scope');
  }
  
  const absoluteKeyPath = path.isAbsolute(keyFilePath) ? keyFilePath : path.resolve(process.cwd(), keyFilePath);
  
  if (!fs.existsSync(absoluteKeyPath)) {
    throw new Error(`Service account key not found at ${absoluteKeyPath}`);
  }
  
  const authConfig = {
    keyFile: absoluteKeyPath,
    scopes
  };
  
  if (impersonateUser) {
    authConfig.clientOptions = {
      subject: impersonateUser
    };
  }
  
  return new google.auth.GoogleAuth(authConfig);
}

/**
 * Generate OAuth2 authorization URL
 * @param {Object} config
 * @param {string} config.clientId
 * @param {string} config.clientSecret
 * @param {string} config.redirectUri
 * @param {string[]} config.scopes
 * @returns {string} Authorization URL
 */
function generateAuthUrl(config = {}) {
  const clientId = config.clientId || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = config.redirectUri || 'http://localhost:3000';
  const scopes = config.scopes || [];
  
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * Exchange authorization code for tokens
 * @param {Object} config
 * @param {string} config.clientId
 * @param {string} config.clientSecret
 * @param {string} config.redirectUri
 * @param {string} config.code - Authorization code from OAuth callback
 * @param {string} config.tokenPath - Path to save tokens
 * @returns {Promise<Object>} Tokens
 */
async function exchangeCodeForTokens(config = {}) {
  const clientId = config.clientId || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
  const clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = config.redirectUri || 'http://localhost:3000';
  const { code, tokenPath } = config;
  
  if (!code) {
    throw new Error('Authorization code required');
  }
  
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  
  if (tokenPath) {
    const absoluteTokenPath = path.isAbsolute(tokenPath) ? tokenPath : path.resolve(process.cwd(), tokenPath);
    fs.mkdirSync(path.dirname(absoluteTokenPath), { recursive: true });
    fs.writeFileSync(absoluteTokenPath, JSON.stringify(tokens, null, 2));
    console.log('Tokens saved to', absoluteTokenPath);
  }
  
  return tokens;
}

module.exports = {
  createOAuth2Client,
  createServiceAccountClient,
  generateAuthUrl,
  exchangeCodeForTokens
};
