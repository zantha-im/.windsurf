/**
 * Gmail Module
 * Configurable Gmail API operations
 * 
 * Usage:
 *   const { createGmailClient } = require('.windsurf/tools/google/gmail');
 *   const gmail = createGmailClient(authClient);
 *   await gmail.sendEmail({ to: 'user@example.com', subject: 'Hello', body: 'World' });
 */

const { google } = require('googleapis');

/**
 * Create Gmail API client
 * @param {google.auth.OAuth2|google.auth.GoogleAuth} auth - Authenticated client
 * @returns {Object} Gmail operations object
 */
function createGmailClient(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  return {
    /**
     * Send an email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.body - Email body
     * @param {boolean} options.html - Whether body is HTML (default: false)
     * @param {string} options.from - From address (optional, for send-as aliases)
     * @param {string} options.cc - CC recipients (optional)
     * @param {string} options.bcc - BCC recipients (optional)
     * @param {string} options.replyTo - Reply-To address (optional)
     * @returns {Promise<Object>} Send result
     */
    async sendEmail(options) {
      const { to, subject, body, html = false, from, cc, bcc, replyTo } = options;
      
      const raw = createMimeMessage({
        to,
        subject,
        body,
        html,
        from,
        cc,
        bcc,
        replyTo
      });
      
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      });
      
      return result.data;
    },
    
    /**
     * Search for emails
     * @param {string} query - Gmail search query
     * @param {Object} options - Search options
     * @param {number} options.maxResults - Max results (default: 100)
     * @returns {Promise<Array>} Array of message objects
     */
    async searchMessages(query, options = {}) {
      const maxResults = options.maxResults || 100;
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });
      
      return response.data.messages || [];
    },
    
    /**
     * Get a message by ID
     * @param {string} messageId - Message ID
     * @param {string} format - Format: 'full', 'metadata', 'minimal', 'raw' (default: 'full')
     * @returns {Promise<Object>} Message object
     */
    async getMessage(messageId, format = 'full') {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format
      });
      
      return response.data;
    },
    
    /**
     * Get message headers
     * @param {string} messageId - Message ID
     * @returns {Promise<Object>} Headers as key-value object
     */
    async getMessageHeaders(messageId) {
      const message = await this.getMessage(messageId, 'metadata');
      const headers = {};
      
      for (const header of message.payload?.headers || []) {
        headers[header.name.toLowerCase()] = header.value;
      }
      
      return headers;
    },
    
    /**
     * Get message body (decoded)
     * @param {string} messageId - Message ID
     * @returns {Promise<{text: string, html: string}>} Body content
     */
    async getMessageBody(messageId) {
      const message = await this.getMessage(messageId, 'full');
      return extractMessageBody(message);
    },
    
    /**
     * List labels
     * @returns {Promise<Array>} Array of label objects
     */
    async listLabels() {
      const response = await gmail.users.labels.list({
        userId: 'me'
      });
      
      return response.data.labels || [];
    },
    
    /**
     * Get user profile
     * @returns {Promise<Object>} Profile object
     */
    async getProfile() {
      const response = await gmail.users.getProfile({
        userId: 'me'
      });
      
      return response.data;
    },
    
    /**
     * Get message attachments metadata
     * @param {string} messageId - Message ID
     * @returns {Promise<Array>} Array of attachment info {id, filename, mimeType, size}
     */
    async getAttachments(messageId) {
      const message = await this.getMessage(messageId, 'full');
      const attachments = [];
      
      function findAttachments(part) {
        if (part.filename && part.body && part.body.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size
          });
        }
        if (part.parts) {
          for (const subPart of part.parts) {
            findAttachments(subPart);
          }
        }
      }
      
      if (message.payload) {
        findAttachments(message.payload);
      }
      
      return attachments;
    },
    
    /**
     * Download an attachment
     * @param {string} messageId - Message ID
     * @param {string} attachmentId - Attachment ID
     * @returns {Promise<Buffer>} Attachment data as Buffer
     */
    async downloadAttachment(messageId, attachmentId) {
      const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId
      });
      
      // Decode base64url to Buffer
      const data = response.data.data
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      return Buffer.from(data, 'base64');
    },
    
    // Expose raw client for advanced operations
    raw: gmail
  };
}

/**
 * Create MIME message for sending
 * @param {Object} options - Message options
 * @returns {string} Base64 URL-safe encoded MIME message
 */
function createMimeMessage(options) {
  const { to, subject, body, html = false, from, cc, bcc, replyTo } = options;
  
  const contentType = html ? 'text/html' : 'text/plain';
  
  const messageParts = [];
  
  if (from) {
    messageParts.push(`From: ${from}`);
  }
  messageParts.push(`To: ${to}`);
  if (cc) {
    messageParts.push(`Cc: ${cc}`);
  }
  if (bcc) {
    messageParts.push(`Bcc: ${bcc}`);
  }
  if (replyTo) {
    messageParts.push(`Reply-To: ${replyTo}`);
  }
  messageParts.push(`Subject: ${subject}`);
  messageParts.push('MIME-Version: 1.0');
  messageParts.push(`Content-Type: ${contentType}; charset=utf-8`);
  messageParts.push('');
  messageParts.push(body);
  
  const message = messageParts.join('\r\n');
  
  // Base64 URL-safe encoding
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Extract body content from a message
 * @param {Object} message - Gmail message object
 * @returns {{text: string, html: string}} Body content
 */
function extractMessageBody(message) {
  const result = { text: '', html: '' };
  
  if (!message.payload) {
    return result;
  }
  
  function extractFromPart(part) {
    if (part.body && part.body.data) {
      const content = Buffer.from(part.body.data, 'base64').toString('utf8');
      
      if (part.mimeType === 'text/plain') {
        result.text = content;
      } else if (part.mimeType === 'text/html') {
        result.html = content;
      }
    }
    
    if (part.parts) {
      for (const subPart of part.parts) {
        extractFromPart(subPart);
      }
    }
  }
  
  extractFromPart(message.payload);
  
  return result;
}

module.exports = {
  createGmailClient,
  createMimeMessage,
  extractMessageBody
};
