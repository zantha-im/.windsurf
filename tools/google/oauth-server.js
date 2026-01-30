#!/usr/bin/env node
/**
 * Google OAuth Authorization Server
 * 
 * Configurable OAuth server for authorizing Google API scopes.
 * Credentials loaded from unified credentials module.
 * 
 * Usage:
 *   node .windsurf/tools/google/oauth-server.js [options]
 * 
 * Options:
 *   --scopes <scopes>     Comma-separated scopes (default: gmail.readonly,gmail.send,drive.file,drive.readonly)
 *   --token-path <path>   Path to save tokens (default: ./credentials/oauth-tokens/google-tokens.json)
 *   --user <username>     User key for multi-user token storage (default: jonny)
 *   --port <port>         Local server port (default: 4001)
 * 
 * Examples:
 *   node .windsurf/tools/google/oauth-server.js
 *   node .windsurf/tools/google/oauth-server.js --user kay
 *   node .windsurf/tools/google/oauth-server.js --scopes calendar,sheets --token-path ./tokens.json
 * 
 * The script will:
 * 1. Start a local server on the specified port
 * 2. Open your browser to the Google authorization page
 * 3. Capture the callback with the authorization code
 * 4. Exchange the code for tokens
 * 5. Save tokens to the specified path
 * 6. Shut down automatically
 * 
 * Note: You must add http://localhost:<port> as an authorized redirect URI
 * in your Google Cloud Console OAuth 2.0 Client configuration.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load unified credentials
let credentials;
try {
  credentials = require('../credentials');
} catch (e) {
  // Fallback for running from different locations
  credentials = require(path.join(__dirname, '../credentials'));
}

const googleCreds = credentials.get('google') || {};

// Scope shortcuts - map short names to full URLs
const SCOPE_MAP = {
  'gmail.readonly': 'https://www.googleapis.com/auth/gmail.readonly',
  'gmail.send': 'https://www.googleapis.com/auth/gmail.send',
  'gmail.modify': 'https://www.googleapis.com/auth/gmail.modify',
  'gmail.settings.basic': 'https://www.googleapis.com/auth/gmail.settings.basic',
  'gmail.settings.sharing': 'https://www.googleapis.com/auth/gmail.settings.sharing',
  'drive': 'https://www.googleapis.com/auth/drive',
  'drive.file': 'https://www.googleapis.com/auth/drive.file',
  'drive.readonly': 'https://www.googleapis.com/auth/drive.readonly',
  'docs': 'https://www.googleapis.com/auth/documents',
  'docs.readonly': 'https://www.googleapis.com/auth/documents.readonly',
  'sheets': 'https://www.googleapis.com/auth/spreadsheets',
  'sheets.readonly': 'https://www.googleapis.com/auth/spreadsheets.readonly',
  'calendar': 'https://www.googleapis.com/auth/calendar',
  'calendar.readonly': 'https://www.googleapis.com/auth/calendar.readonly',
  'admin.directory.user': 'https://www.googleapis.com/auth/admin.directory.user',
  'admin.directory.group': 'https://www.googleapis.com/auth/admin.directory.group',
  'admin.directory.group.member': 'https://www.googleapis.com/auth/admin.directory.group.member'
};

// Default scopes
const DEFAULT_SCOPES = ['gmail.readonly', 'gmail.send', 'drive.file', 'drive.readonly'];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    scopes: DEFAULT_SCOPES,
    tokenPath: path.join(process.cwd(), 'credentials/oauth-tokens/google-tokens.json'),
    user: 'jonny',
    port: 4001
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scopes':
        config.scopes = args[++i].split(',').map(s => s.trim());
        break;
      case '--token-path':
        config.tokenPath = path.resolve(args[++i]);
        break;
      case '--user':
        config.user = args[++i].toLowerCase();
        break;
      case '--port':
        config.port = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }
  
  return config;
}

function printHelp() {
  console.log(`
Google OAuth Authorization Server

Usage:
  node oauth-server.js [options]

Options:
  --scopes <scopes>     Comma-separated scopes (short names or full URLs)
  --token-path <path>   Path to save tokens (default: ./credentials/oauth-tokens/google-tokens.json)
  --user <username>     User key for multi-user token storage (default: jonny)
  --port <port>         Local server port (default: 4001)
  --help, -h            Show this help

Available scope shortcuts:
  ${Object.keys(SCOPE_MAP).join(', ')}

Examples:
  node oauth-server.js --user kay
  node oauth-server.js --scopes calendar,sheets
  node oauth-server.js --scopes gmail.readonly,drive.file --token-path ./my-tokens.json
`);
}

/**
 * Resolve scope shortcuts to full URLs
 */
function resolveScopes(scopes) {
  return scopes.map(scope => {
    // If it's already a full URL, use it
    if (scope.startsWith('https://')) {
      return scope;
    }
    // Otherwise, look up in map
    return SCOPE_MAP[scope] || `https://www.googleapis.com/auth/${scope}`;
  });
}

// Parse arguments
const config = parseArgs();
const SCOPES = resolveScopes(config.scopes);
const PORT = config.port;
const REDIRECT_URI = `http://localhost:${PORT}`;
const TOKEN_PATH = config.tokenPath;
const USER = config.user;

// Validate credentials
if (!googleCreds.clientId || !googleCreds.clientSecret) {
  console.error('Error: Google OAuth credentials not found.');
  console.error('Check .windsurf/config/credentials.json for google.clientId and google.clientSecret');
  process.exit(1);
}

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  googleCreds.clientId,
  googleCreds.clientSecret,
  REDIRECT_URI
);

// Generate auth URL
const authUrlOptions = {
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
};

// Add login_hint if domain is configured
if (googleCreds.domain && USER) {
  authUrlOptions.login_hint = `${USER}@${googleCreds.domain}`;
}

const authUrl = oauth2Client.generateAuthUrl(authUrlOptions);

// Create server to handle callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  
  // Handle the OAuth callback
  if (parsedUrl.pathname === '/' && parsedUrl.searchParams.get('code')) {
    const code = parsedUrl.searchParams.get('code');
    
    console.log('\n✓ Received authorization code');
    
    try {
      // Exchange code for tokens
      console.log('  Exchanging code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      
      // Ensure directory exists
      const tokenDir = path.dirname(TOKEN_PATH);
      if (!fs.existsSync(tokenDir)) {
        fs.mkdirSync(tokenDir, { recursive: true });
      }
      
      // Save tokens to multi-user structure
      let allTokens = {};
      if (fs.existsSync(TOKEN_PATH)) {
        try {
          allTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        } catch (e) {
          allTokens = {};
        }
      }
      
      allTokens[USER] = tokens;
      
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(allTokens, null, 2));
      console.log(`✓ Tokens saved for user '${USER}' to:`, TOKEN_PATH);
      
      // Show token info
      console.log('\nToken details:');
      console.log('  Scopes:', tokens.scope);
      console.log('  Expires:', new Date(tokens.expiry_date).toISOString());
      console.log('  Has refresh token:', !!tokens.refresh_token);
      
      // Send success response
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: #22c55e; font-size: 24px; }
            .info { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1 class="success">✓ Authorization Successful</h1>
          <div class="info">
            <p><strong>User:</strong> ${USER}</p>
            <p><strong>Tokens saved to:</strong></p>
            <code>${TOKEN_PATH}</code>
            <p style="margin-top: 15px;"><strong>Scopes granted:</strong></p>
            <ul>
              ${SCOPES.map(s => `<li>${s.split('/').pop()}</li>`).join('')}
            </ul>
          </div>
          <p>You can close this window and return to your terminal.</p>
        </body>
        </html>
      `);
      
      // Shutdown server after response
      console.log('\n✓ Authorization complete. Server shutting down.');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
      
    } catch (err) {
      console.error('✗ Error exchanging code:', err.message);
      
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Authorization Failed</title></head>
        <body>
          <h1 style="color: red;">Authorization Failed</h1>
          <p>${err.message}</p>
          <p>Check the terminal for details.</p>
        </body>
        </html>
      `);
      
      setTimeout(() => {
        server.close();
        process.exit(1);
      }, 1000);
    }
    
  } else if (parsedUrl.pathname === '/' && parsedUrl.searchParams.get('error')) {
    // Handle OAuth error
    console.error('✗ Authorization denied:', parsedUrl.searchParams.get('error'));
    
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Authorization Denied</title></head>
      <body>
        <h1 style="color: red;">Authorization Denied</h1>
        <p>${parsedUrl.searchParams.get('error')}</p>
      </body>
      </html>
    `);
    
    setTimeout(() => {
      server.close();
      process.exit(1);
    }, 1000);
    
  } else {
    // Redirect any other request to the auth URL
    res.writeHead(302, { Location: authUrl });
    res.end();
  }
});

// Start server
server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Google OAuth Authorization Server                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  
  if (googleCreds.domain) {
    console.log(`Authorizing account: ${USER}@${googleCreds.domain}`);
  } else {
    console.log(`User: ${USER}`);
  }
  console.log(`Token path: ${TOKEN_PATH}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log();
  console.log('Scopes requested:');
  SCOPES.forEach(s => console.log(`  • ${s.split('/').pop()}`));
  console.log();
  console.log('Opening browser for authorization...');
  console.log();
  
  // Open browser
  if (process.platform === 'win32') {
    require('child_process').exec(`start "" "${authUrl}"`);
  } else {
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    require('child_process').exec(`${openCommand} "${authUrl}"`);
  }
  
  console.log('If browser does not open, visit:');
  console.log(authUrl);
  console.log();
  console.log('Waiting for authorization...');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ Port ${PORT} is already in use.`);
    console.error('  Stop any other application using this port or use --port <number>');
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
