/**
 * Orchestrator Template
 * 
 * Orchestrators combine shared tools with project-specific business logic.
 * Copy this to your role's directory and customize.
 * 
 * Usage:
 *   node orchestrator.js              # Show available commands
 *   node orchestrator.js listDocuments
 *   node orchestrator.js createDocument "My Document"
 */

const { getDrive, getDocs } = require('../../tools/google-client');

// ============================================================
// PROJECT-SPECIFIC CONFIGURATION
// ============================================================

const CONFIG = {
  folders: {
    documents: '1abc123...',  // Replace with actual folder ID
    templates: '1def456...'   // Replace with actual folder ID
  },
  templateId: '1xyz789...'    // Replace with actual template ID
};

// ============================================================
// BUSINESS LOGIC FUNCTIONS
// ============================================================

/**
 * List all documents in the project folder
 */
async function listDocuments() {
  const drive = await getDrive();
  return drive.listFiles(CONFIG.folders.documents);
}

/**
 * Create a new document from template
 * @param {string} name - Document name
 * @param {object} data - Data to replace in template
 */
async function createDocument(name, data) {
  const drive = await getDrive();
  const docs = await getDocs();
  
  // Copy template to documents folder
  const copy = await drive.copyFile(CONFIG.templateId, name, CONFIG.folders.documents);
  
  // Replace placeholders with data
  await docs.replaceAllText(copy.id, data);
  
  return copy;
}

/**
 * Get document by name
 * @param {string} name - Document name to search for
 */
async function getDocument(name) {
  const drive = await getDrive();
  const files = await drive.listFiles(CONFIG.folders.documents, {
    q: `name = '${name}'`
  });
  return files[0] || null;
}

// ============================================================
// CLI DISCOVERY - REQUIRED FOR ROLE ACTIVATION
// ============================================================

if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  
  // Show help if no command provided
  if (!cmd) {
    console.log(`
My Role Orchestrator

Commands:
  listDocuments              List all documents in project folder
  createDocument <name>      Create a new document from template
  getDocument <name>         Get document by name

Usage:
  node orchestrator.js listDocuments
  node orchestrator.js createDocument "My Document"
  node orchestrator.js getDocument "My Document"

Configuration:
  Documents folder: ${CONFIG.folders.documents}
  Templates folder: ${CONFIG.folders.templates}
  Template ID: ${CONFIG.templateId}
`);
    process.exit(0);
  }
  
  // Command dispatch
  const commands = { 
    listDocuments, 
    createDocument, 
    getDocument 
  };
  
  if (commands[cmd]) {
    commands[cmd](...args)
      .then(result => console.log(JSON.stringify(result, null, 2)))
      .catch(err => { 
        console.error('Error:', err.message); 
        process.exit(1); 
      });
  } else {
    console.error('Unknown command:', cmd);
    console.error('Run without arguments to see available commands.');
    process.exit(1);
  }
}

// ============================================================
// EXPORTS FOR PROGRAMMATIC USE
// ============================================================

module.exports = { 
  listDocuments, 
  createDocument, 
  getDocument,
  CONFIG 
};
