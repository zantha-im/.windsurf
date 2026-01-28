/**
 * Git Tools Module
 * Utilities for git operations, particularly subtree management.
 * 
 * Usage:
 *   const git = require('.windsurf/tools/git');
 *   
 *   // List files in a remote branch
 *   const files = await git.listRemoteFiles('windsurf_subtree', 'main');
 *   
 *   // Compare remote to local and find missing files
 *   const missing = await git.findMissingFiles('windsurf_subtree', 'main', '.windsurf');
 *   
 *   // Sync missing files from remote
 *   const synced = await git.syncMissingFiles('windsurf_subtree', 'main', '.windsurf');
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute a git command and return the output as text
 * @param {string} command - Git command to execute
 * @param {string} cwd - Working directory
 * @returns {string} Command output
 */
function execGit(command, cwd = process.cwd()) {
  try {
    return execSync(`git ${command}`, { 
      cwd, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    throw new Error(`Git command failed: git ${command}\n${error.stderr || error.message}`);
  }
}

/**
 * Execute a git command and return the output as a Buffer (for binary data)
 * @param {string} command - Git command to execute
 * @param {string} cwd - Working directory
 * @returns {Buffer} Command output as Buffer
 */
function execGitBinary(command, cwd = process.cwd()) {
  try {
    return execSync(`git ${command}`, { 
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large files
    });
  } catch (error) {
    throw new Error(`Git command failed: git ${command}\n${error.stderr || error.message}`);
  }
}

/**
 * Check if a git remote exists
 * @param {string} remoteName - Name of the remote
 * @param {string} cwd - Working directory
 * @returns {boolean}
 */
function remoteExists(remoteName, cwd = process.cwd()) {
  try {
    execGit(`remote get-url ${remoteName}`, cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Add a git remote if it doesn't exist
 * @param {string} remoteName - Name of the remote
 * @param {string} url - Remote URL
 * @param {string} cwd - Working directory
 * @returns {{ added: boolean, url: string }}
 */
function ensureRemote(remoteName, url, cwd = process.cwd()) {
  if (remoteExists(remoteName, cwd)) {
    const existingUrl = execGit(`remote get-url ${remoteName}`, cwd);
    return { added: false, url: existingUrl };
  }
  execGit(`remote add ${remoteName} ${url}`, cwd);
  return { added: true, url };
}

/**
 * Fetch from a remote
 * @param {string} remoteName - Name of the remote
 * @param {string} cwd - Working directory
 */
function fetchRemote(remoteName, cwd = process.cwd()) {
  execGit(`fetch ${remoteName}`, cwd);
}

/**
 * List all files in a remote branch
 * @param {string} remoteName - Name of the remote (e.g., 'windsurf_subtree')
 * @param {string} branch - Branch name (e.g., 'main')
 * @param {string} cwd - Working directory
 * @returns {string[]} Array of file paths
 */
function listRemoteFiles(remoteName, branch, cwd = process.cwd()) {
  const output = execGit(`ls-tree -r --name-only ${remoteName}/${branch}`, cwd);
  return output ? output.split('\n').filter(Boolean) : [];
}

/**
 * Get the content of a file from a remote branch as text
 * @param {string} remoteName - Name of the remote
 * @param {string} branch - Branch name
 * @param {string} filePath - Path to the file in the remote
 * @param {string} cwd - Working directory
 * @returns {string} File content as text
 */
function getRemoteFileContent(remoteName, branch, filePath, cwd = process.cwd()) {
  return execGit(`show ${remoteName}/${branch}:${filePath}`, cwd);
}

/**
 * Get the content of a file from a remote branch as binary Buffer
 * @param {string} remoteName - Name of the remote
 * @param {string} branch - Branch name
 * @param {string} filePath - Path to the file in the remote
 * @param {string} cwd - Working directory
 * @returns {Buffer} File content as Buffer
 */
function getRemoteFileContentBinary(remoteName, branch, filePath, cwd = process.cwd()) {
  return execGitBinary(`show ${remoteName}/${branch}:${filePath}`, cwd);
}

/**
 * Find files that exist in remote but not locally
 * @param {string} remoteName - Name of the remote
 * @param {string} branch - Branch name
 * @param {string} localPrefix - Local directory prefix (e.g., '.windsurf')
 * @param {string} cwd - Working directory
 * @returns {{ missing: string[], existing: string[], total: number }}
 */
function findMissingFiles(remoteName, branch, localPrefix, cwd = process.cwd()) {
  const remoteFiles = listRemoteFiles(remoteName, branch, cwd);
  const missing = [];
  const existing = [];

  for (const file of remoteFiles) {
    const localPath = path.join(cwd, localPrefix, file);
    if (fs.existsSync(localPath)) {
      existing.push(file);
    } else {
      missing.push(file);
    }
  }

  return {
    missing,
    existing,
    total: remoteFiles.length
  };
}

/**
 * Sync missing files from remote to local
 * @param {string} remoteName - Name of the remote
 * @param {string} branch - Branch name
 * @param {string} localPrefix - Local directory prefix (e.g., '.windsurf')
 * @param {string} cwd - Working directory
 * @returns {{ synced: string[], skipped: string[], errors: Array<{file: string, error: string}> }}
 */
function syncMissingFiles(remoteName, branch, localPrefix, cwd = process.cwd()) {
  const { missing } = findMissingFiles(remoteName, branch, localPrefix, cwd);
  const synced = [];
  const skipped = [];
  const errors = [];

  for (const file of missing) {
    const localPath = path.join(cwd, localPrefix, file);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Get content from remote as binary Buffer and write locally
      // Using binary mode preserves all file types (text, images, fonts, etc.)
      const content = getRemoteFileContentBinary(remoteName, branch, file, cwd);
      fs.writeFileSync(localPath, content);
      synced.push(file);
    } catch (error) {
      errors.push({ file, error: error.message });
    }
  }

  return { synced, skipped, errors };
}

/**
 * Get comparison summary between remote and local
 * @param {string} remoteName - Name of the remote
 * @param {string} branch - Branch name
 * @param {string} localPrefix - Local directory prefix
 * @param {string} cwd - Working directory
 * @returns {{ summary: string, missing: string[], existing: string[], total: number }}
 */
function compareWithRemote(remoteName, branch, localPrefix, cwd = process.cwd()) {
  const result = findMissingFiles(remoteName, branch, localPrefix, cwd);
  
  const summary = result.missing.length === 0
    ? `All ${result.total} files present locally`
    : `${result.missing.length} of ${result.total} files missing locally`;

  return {
    ...result,
    summary
  };
}

/**
 * Full subtree sync operation
 * @param {Object} options
 * @param {string} options.remoteName - Remote name (default: 'windsurf_subtree')
 * @param {string} options.remoteUrl - Remote URL (default: 'https://github.com/zantha-im/.windsurf.git')
 * @param {string} options.branch - Branch name (default: 'main')
 * @param {string} options.localPrefix - Local prefix (default: '.windsurf')
 * @param {string} options.cwd - Working directory (default: process.cwd())
 * @returns {Object} Sync result with all details
 */
async function subtreeSync(options = {}) {
  const {
    remoteName = 'windsurf_subtree',
    remoteUrl = 'https://github.com/zantha-im/.windsurf.git',
    branch = 'main',
    localPrefix = '.windsurf',
    cwd = process.cwd()
  } = options;

  const result = {
    remote: null,
    fetch: null,
    comparison: null,
    sync: null
  };

  // Step 1: Ensure remote exists
  result.remote = ensureRemote(remoteName, remoteUrl, cwd);

  // Step 2: Fetch
  fetchRemote(remoteName, cwd);
  result.fetch = { success: true };

  // Step 3: Compare
  result.comparison = compareWithRemote(remoteName, branch, localPrefix, cwd);

  // Step 4: Sync missing files
  if (result.comparison.missing.length > 0) {
    result.sync = syncMissingFiles(remoteName, branch, localPrefix, cwd);
  } else {
    result.sync = { synced: [], skipped: [], errors: [] };
  }

  return result;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  const commands = {
    async 'list-remote'() {
      const remote = args[1] || 'windsurf_subtree';
      const branch = args[2] || 'main';
      const files = listRemoteFiles(remote, branch);
      console.log(`Files in ${remote}/${branch}:`);
      files.forEach(f => console.log(`  ${f}`));
      console.log(`\nTotal: ${files.length} files`);
    },

    async 'find-missing'() {
      const remote = args[1] || 'windsurf_subtree';
      const branch = args[2] || 'main';
      const prefix = args[3] || '.windsurf';
      const result = findMissingFiles(remote, branch, prefix);
      console.log(`Comparison: ${remote}/${branch} → ${prefix}/`);
      console.log(`\n${result.summary || `Missing: ${result.missing.length}, Existing: ${result.existing.length}`}`);
      if (result.missing.length > 0) {
        console.log('\nMissing files:');
        result.missing.forEach(f => console.log(`  ${f}`));
      }
    },

    async 'sync'() {
      const remote = args[1] || 'windsurf_subtree';
      const branch = args[2] || 'main';
      const prefix = args[3] || '.windsurf';
      const result = syncMissingFiles(remote, branch, prefix);
      console.log(`Sync from ${remote}/${branch} → ${prefix}/`);
      if (result.synced.length > 0) {
        console.log('\nSynced files:');
        result.synced.forEach(f => console.log(`  ✓ ${f}`));
      }
      if (result.errors.length > 0) {
        console.log('\nErrors:');
        result.errors.forEach(e => console.log(`  ✗ ${e.file}: ${e.error}`));
      }
      if (result.synced.length === 0 && result.errors.length === 0) {
        console.log('\nNo files needed syncing.');
      }
    },

    async 'full-sync'() {
      const result = await subtreeSync();
      console.log('Subtree Sync Results:');
      console.log(`  Remote: ${result.remote.added ? 'Added' : 'Exists'} (${result.remote.url})`);
      console.log(`  Fetch: ${result.fetch.success ? 'Success' : 'Failed'}`);
      console.log(`  Comparison: ${result.comparison.summary}`);
      if (result.sync.synced.length > 0) {
        console.log(`  Synced: ${result.sync.synced.length} files`);
        result.sync.synced.forEach(f => console.log(`    ✓ ${f}`));
      }
      if (result.sync.errors.length > 0) {
        console.log(`  Errors: ${result.sync.errors.length}`);
        result.sync.errors.forEach(e => console.log(`    ✗ ${e.file}: ${e.error}`));
      }
    }
  };

  if (!cmd || !commands[cmd]) {
    console.log(`
Git Tools - Subtree management utilities

Commands:
  list-remote [remote] [branch]           List files in remote branch
  find-missing [remote] [branch] [prefix] Find files missing locally
  sync [remote] [branch] [prefix]         Sync missing files from remote
  full-sync                               Full subtree sync operation

Defaults:
  remote: windsurf_subtree
  branch: main
  prefix: .windsurf

Examples:
  node index.js list-remote
  node index.js find-missing windsurf_subtree main .windsurf
  node index.js sync
  node index.js full-sync
`);
    process.exit(0);
  }

  commands[cmd]().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  execGit,
  execGitBinary,
  remoteExists,
  ensureRemote,
  fetchRemote,
  listRemoteFiles,
  getRemoteFileContent,
  getRemoteFileContentBinary,
  findMissingFiles,
  syncMissingFiles,
  compareWithRemote,
  subtreeSync
};
