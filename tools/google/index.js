/**
 * Google Tools Index
 * Re-exports all Google API modules
 * 
 * Usage:
 *   const google = require('.windsurf/tools/google');
 *   
 *   // Create authenticated client
 *   const auth = await google.createOAuth2Client({ tokenPath: './tokens.json' });
 *   
 *   // Create API clients
 *   const drive = google.createDriveClient(auth);
 *   const docs = google.createDocsClient(auth);
 *   const gmail = google.createGmailClient(auth);
 */

const { 
  createOAuth2Client, 
  createServiceAccountClient, 
  generateAuthUrl, 
  exchangeCodeForTokens 
} = require('./auth');

const { createDriveClient, getMimeType } = require('./drive');
const { createDocsClient, extractTextFromDocument, findTextRanges } = require('./docs');
const { createGmailClient, createMimeMessage, extractMessageBody } = require('./gmail');
const { createAdminClient, createGmailSettingsClient } = require('./admin');

module.exports = {
  // Auth
  createOAuth2Client,
  createServiceAccountClient,
  generateAuthUrl,
  exchangeCodeForTokens,
  
  // Drive
  createDriveClient,
  getMimeType,
  
  // Docs
  createDocsClient,
  extractTextFromDocument,
  findTextRanges,
  
  // Gmail
  createGmailClient,
  createMimeMessage,
  extractMessageBody,
  
  // Admin
  createAdminClient,
  createGmailSettingsClient
};
