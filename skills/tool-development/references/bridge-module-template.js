/**
 * Bridge Module Template
 * 
 * This module configures shared .windsurf/tools with project-specific paths.
 * Copy this to your project's tools/ directory and customize the paths.
 * 
 * Usage:
 *   const { getDrive, getDocs, getGmail } = require('./tools/google-client');
 */

require('dotenv').config();
const path = require('path');
const google = require('.windsurf/tools/google');

// ============================================================
// PROJECT-SPECIFIC CONFIGURATION - CUSTOMIZE THESE
// ============================================================

const TOKEN_PATH = path.join(__dirname, '../credentials/oauth-tokens/google-tokens.json');
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, '../credentials/service-accounts/key.json');
const IMPERSONATE_USER = 'user@domain.com';

// ============================================================
// CLIENT FACTORY FUNCTIONS
// ============================================================

let _oauth2Client = null;

/**
 * Get OAuth2 client for user-context operations
 * Uses stored tokens from TOKEN_PATH
 */
async function getOAuth2Auth() {
  if (!_oauth2Client) {
    _oauth2Client = await google.createOAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      tokenPath: TOKEN_PATH
    });
  }
  return _oauth2Client;
}

/**
 * Get Service Account client for domain-wide delegation
 * @param {string[]} scopes - OAuth scopes to request
 * @param {string} impersonateUser - User to impersonate (defaults to IMPERSONATE_USER)
 */
async function getServiceAccountAuth(scopes, impersonateUser = IMPERSONATE_USER) {
  return google.createServiceAccountClient({
    keyFilePath: SERVICE_ACCOUNT_KEY_PATH,
    scopes,
    impersonateUser
  });
}

/**
 * Get Google Drive client
 */
async function getDrive() {
  const auth = await getOAuth2Auth();
  return google.createDriveClient(auth);
}

/**
 * Get Google Docs client
 */
async function getDocs() {
  const auth = await getOAuth2Auth();
  return google.createDocsClient(auth);
}

/**
 * Get Gmail client
 * @param {boolean} useServiceAccount - Use service account instead of OAuth
 */
async function getGmail(useServiceAccount = false) {
  if (useServiceAccount) {
    const auth = await getServiceAccountAuth(['https://www.googleapis.com/auth/gmail.send']);
    return google.createGmailClient(auth);
  }
  const auth = await getOAuth2Auth();
  return google.createGmailClient(auth);
}

module.exports = { 
  getOAuth2Auth, 
  getServiceAccountAuth, 
  getDrive, 
  getDocs, 
  getGmail 
};
