/**
 * .windsurf Tools Index
 * Re-exports all tool modules
 * 
 * Usage:
 *   const tools = require('.windsurf/tools');
 *   
 *   // Google APIs
 *   const auth = await tools.google.createOAuth2Client({ tokenPath: './tokens.json' });
 *   const drive = tools.google.createDriveClient(auth);
 *   
 *   // PDF
 *   const text = await tools.pdf.extractTextFromFile('./doc.pdf');
 */

const google = require('./google');
const pdf = require('./pdf');

module.exports = {
  google,
  pdf
};
