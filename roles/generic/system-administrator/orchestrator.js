/**
 * System Administrator Orchestrator
 * Google Workspace administration for Zantha infrastructure
 * 
 * This orchestrator uses fixed configuration for Zantha's Google Workspace.
 * Service account and credentials are standardized across all projects.
 */

require('dotenv').config();
const path = require('path');

// Fixed infrastructure configuration
const CONFIG = {
  domain: 'zantha.im',
  serviceAccount: {
    email: 'ai-advisor-admin@ai-business-advisor-481316.iam.gserviceaccount.com',
    clientId: '114007721152012434403',
    projectId: 'ai-business-advisor-481316'
  },
  impersonateUser: 'jonny@zantha.im',
  aiAdvisorEmail: 'ai-advisor@zantha.im',
  scopes: {
    admin: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.directory.group',
      'https://www.googleapis.com/auth/admin.directory.group.member'
    ],
    gmail: [
      'https://www.googleapis.com/auth/gmail.send'
    ],
    gmailSettings: [
      'https://www.googleapis.com/auth/gmail.settings.basic',
      'https://www.googleapis.com/auth/gmail.settings.sharing'
    ]
  }
};

// Try to load shared tools, fall back to direct googleapis
let google;
try {
  google = require('../../../tools/google');
} catch (e) {
  // Fallback for when running outside subtree context
  google = null;
}

/**
 * Load shared credentials from config file
 */
function loadSharedCredentials() {
  const fs = require('fs');
  const configPaths = [
    path.join(process.cwd(), '.windsurf/config/credentials.json'),
    path.join(__dirname, '../../../config/credentials.json')
  ];
  
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        // Continue to next path
      }
    }
  }
  return null;
}

/**
 * Find the service account key file
 * Priority: shared config > project credentials folder
 */
function findKeyFile() {
  const fs = require('fs');
  
  // First, check shared config for key file path
  const sharedCreds = loadSharedCredentials();
  if (sharedCreds?.google?.serviceAccountKeyFile) {
    const configPaths = [
      path.join(process.cwd(), '.windsurf/config', sharedCreds.google.serviceAccountKeyFile),
      path.join(__dirname, '../../../config', sharedCreds.google.serviceAccountKeyFile)
    ];
    for (const p of configPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }
  
  // Fall back to project-specific locations
  const possiblePaths = [
    path.join(process.cwd(), 'credentials/service-accounts/ai-advisor-admin-key.json'),
    path.join(process.cwd(), '../credentials/service-accounts/ai-advisor-admin-key.json'),
    path.join(__dirname, '../../../../credentials/service-accounts/ai-advisor-admin-key.json')
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

/**
 * Get authenticated Admin SDK client
 */
async function getAdminClient() {
  if (!google) {
    throw new Error('Shared tools not available. Run from a project with .windsurf subtree.');
  }
  
  const keyFile = findKeyFile();
  if (!keyFile) {
    throw new Error('Service account key not found. Expected at credentials/service-accounts/ai-advisor-admin-key.json');
  }
  
  const auth = await google.createServiceAccountClient({
    keyFilePath: keyFile,
    scopes: CONFIG.scopes.admin,
    impersonateUser: CONFIG.impersonateUser
  });
  
  return google.createAdminClient(auth);
}

/**
 * Get Gmail Settings client for managing send-as aliases
 */
async function getGmailSettingsClient(impersonateUser = CONFIG.impersonateUser) {
  if (!google) {
    throw new Error('Shared tools not available.');
  }
  
  const keyFile = findKeyFile();
  if (!keyFile) {
    throw new Error('Service account key not found.');
  }
  
  const auth = await google.createServiceAccountClient({
    keyFilePath: keyFile,
    scopes: CONFIG.scopes.gmailSettings,
    impersonateUser
  });
  
  return google.createGmailSettingsClient(auth);
}

// ==================== USER MANAGEMENT ====================

async function listUsers() {
  const admin = await getAdminClient();
  return admin.listUsers(CONFIG.domain);
}

async function getUser(email) {
  const admin = await getAdminClient();
  return admin.getUser(email);
}

// ==================== GROUP MANAGEMENT ====================

async function listGroups() {
  const admin = await getAdminClient();
  return admin.listGroups(CONFIG.domain);
}

async function getGroup(email) {
  const admin = await getAdminClient();
  return admin.getGroup(email);
}

async function listGroupMembers(groupEmail) {
  const admin = await getAdminClient();
  return admin.listGroupMembers(groupEmail);
}

async function addGroupMember(groupEmail, memberEmail, role = 'MEMBER') {
  const admin = await getAdminClient();
  return admin.addGroupMember(groupEmail, memberEmail, role);
}

async function removeGroupMember(groupEmail, memberEmail) {
  const admin = await getAdminClient();
  return admin.removeGroupMember(groupEmail, memberEmail);
}

// ==================== GMAIL SETTINGS ====================

async function listSendAsAliases(userEmail) {
  const settings = await getGmailSettingsClient(userEmail);
  return settings.listSendAsAliases(userEmail);
}

async function addSendAsAlias(userEmail, aliasEmail, displayName) {
  const settings = await getGmailSettingsClient(userEmail);
  return settings.addSendAsAlias(userEmail, aliasEmail, displayName, true);
}

// ==================== STATUS ====================

function showConfig() {
  const keyFile = findKeyFile();
  return {
    domain: CONFIG.domain,
    serviceAccount: CONFIG.serviceAccount.email,
    impersonateUser: CONFIG.impersonateUser,
    aiAdvisorEmail: CONFIG.aiAdvisorEmail,
    keyFileFound: !!keyFile,
    keyFilePath: keyFile,
    sharedToolsAvailable: !!google
  };
}

// CLI
if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  
  if (!cmd) {
    const config = showConfig();
    console.log(`
System Administrator Orchestrator

Domain: ${config.domain}
Service Account: ${config.serviceAccount}
Impersonate User: ${config.impersonateUser}
AI Advisor Email: ${config.aiAdvisorEmail}
Key File: ${config.keyFileFound ? config.keyFilePath : 'NOT FOUND'}
Shared Tools: ${config.sharedToolsAvailable ? 'available' : 'not available'}

Commands:
  status              Show configuration status
  
  Users:
    listUsers         List all users in domain
    getUser <email>   Get user details
  
  Groups:
    listGroups        List all groups in domain
    getGroup <email>  Get group details
    listMembers <group>  List group members
    addMember <group> <user> [role]  Add member to group
    removeMember <group> <user>      Remove member from group
  
  Gmail:
    listAliases <user>  List send-as aliases
    addAlias <user> <alias> <name>  Add send-as alias

Usage:
  node orchestrator.js <command> [args]
`);
    process.exit(0);
  }
  
  const commands = {
    status: () => console.log(JSON.stringify(showConfig(), null, 2)),
    listUsers: async () => console.log(JSON.stringify(await listUsers(), null, 2)),
    getUser: async () => console.log(JSON.stringify(await getUser(args[0]), null, 2)),
    listGroups: async () => console.log(JSON.stringify(await listGroups(), null, 2)),
    getGroup: async () => console.log(JSON.stringify(await getGroup(args[0]), null, 2)),
    listMembers: async () => console.log(JSON.stringify(await listGroupMembers(args[0]), null, 2)),
    addMember: async () => console.log(JSON.stringify(await addGroupMember(args[0], args[1], args[2]), null, 2)),
    removeMember: async () => console.log(JSON.stringify(await removeGroupMember(args[0], args[1]), null, 2)),
    listAliases: async () => console.log(JSON.stringify(await listSendAsAliases(args[0]), null, 2)),
    addAlias: async () => console.log(JSON.stringify(await addSendAsAlias(args[0], args[1], args[2]), null, 2))
  };
  
  if (commands[cmd]) {
    Promise.resolve(commands[cmd]())
      .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
      });
  } else {
    console.error('Unknown command:', cmd);
    process.exit(1);
  }
}

module.exports = {
  CONFIG,
  showConfig,
  getAdminClient,
  getGmailSettingsClient,
  listUsers,
  getUser,
  listGroups,
  getGroup,
  listGroupMembers,
  addGroupMember,
  removeGroupMember,
  listSendAsAliases,
  addSendAsAlias
};
