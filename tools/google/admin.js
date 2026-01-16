/**
 * Google Admin SDK Module
 * Configurable Admin API operations for Google Workspace
 * 
 * Usage:
 *   const { createAdminClient } = require('.windsurf/tools/google/admin');
 *   const admin = createAdminClient(authClient);
 *   const users = await admin.listUsers('zantha.im');
 */

const { google } = require('googleapis');

/**
 * Create Admin SDK client
 * @param {google.auth.OAuth2|google.auth.GoogleAuth} auth - Authenticated client
 * @returns {Object} Admin operations object
 */
function createAdminClient(auth) {
  const admin = google.admin({ version: 'directory_v1', auth });
  
  return {
    // ==================== USER MANAGEMENT ====================
    
    /**
     * List users in a domain
     * @param {string} domain - Domain name
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Users
     */
    async listUsers(domain, options = {}) {
      const response = await admin.users.list({
        domain,
        maxResults: options.maxResults || 100,
        orderBy: options.orderBy || 'email'
      });
      
      return response.data.users || [];
    },
    
    /**
     * Get a user by email
     * @param {string} userKey - User email or ID
     * @returns {Promise<Object>} User object
     */
    async getUser(userKey) {
      const response = await admin.users.get({ userKey });
      return response.data;
    },
    
    // ==================== GROUP MANAGEMENT ====================
    
    /**
     * List groups in a domain
     * @param {string} domain - Domain name
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Groups
     */
    async listGroups(domain, options = {}) {
      const response = await admin.groups.list({
        domain,
        maxResults: options.maxResults || 100
      });
      
      return response.data.groups || [];
    },
    
    /**
     * Get a group by email
     * @param {string} groupKey - Group email or ID
     * @returns {Promise<Object>} Group object
     */
    async getGroup(groupKey) {
      const response = await admin.groups.get({ groupKey });
      return response.data;
    },
    
    /**
     * Create a group
     * @param {string} email - Group email
     * @param {string} name - Group name
     * @param {string} description - Group description
     * @returns {Promise<Object>} Created group
     */
    async createGroup(email, name, description = '') {
      const response = await admin.groups.insert({
        requestBody: {
          email,
          name,
          description
        }
      });
      
      return response.data;
    },
    
    /**
     * Delete a group
     * @param {string} groupKey - Group email or ID
     */
    async deleteGroup(groupKey) {
      await admin.groups.delete({ groupKey });
    },
    
    /**
     * List members of a group
     * @param {string} groupKey - Group email or ID
     * @returns {Promise<Array>} Members
     */
    async listGroupMembers(groupKey) {
      const response = await admin.members.list({ groupKey });
      return response.data.members || [];
    },
    
    /**
     * Add a member to a group
     * @param {string} groupKey - Group email or ID
     * @param {string} email - Member email
     * @param {string} role - Role: OWNER, MANAGER, or MEMBER
     * @returns {Promise<Object>} Member object
     */
    async addGroupMember(groupKey, email, role = 'MEMBER') {
      const response = await admin.members.insert({
        groupKey,
        requestBody: {
          email,
          role
        }
      });
      
      return response.data;
    },
    
    /**
     * Remove a member from a group
     * @param {string} groupKey - Group email or ID
     * @param {string} memberKey - Member email or ID
     */
    async removeGroupMember(groupKey, memberKey) {
      await admin.members.delete({ groupKey, memberKey });
    },
    
    // Expose raw client for advanced operations
    raw: admin
  };
}

/**
 * Create Gmail Settings client (for send-as aliases, etc.)
 * @param {google.auth.OAuth2|google.auth.GoogleAuth} auth - Authenticated client
 * @returns {Object} Gmail settings operations
 */
function createGmailSettingsClient(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  return {
    /**
     * List send-as aliases for a user
     * @param {string} userId - User email (use 'me' for authenticated user)
     * @returns {Promise<Array>} Send-as aliases
     */
    async listSendAsAliases(userId = 'me') {
      const response = await gmail.users.settings.sendAs.list({ userId });
      return response.data.sendAs || [];
    },
    
    /**
     * Get a specific send-as alias
     * @param {string} userId - User email
     * @param {string} sendAsEmail - Alias email
     * @returns {Promise<Object>} Send-as alias
     */
    async getSendAsAlias(userId, sendAsEmail) {
      const response = await gmail.users.settings.sendAs.get({
        userId,
        sendAsEmail
      });
      
      return response.data;
    },
    
    /**
     * Add a send-as alias
     * @param {string} userId - User email
     * @param {string} sendAsEmail - Alias email
     * @param {string} displayName - Display name
     * @param {boolean} treatAsAlias - Treat as alias (auto-verify for same domain)
     * @returns {Promise<Object>} Created alias
     */
    async addSendAsAlias(userId, sendAsEmail, displayName, treatAsAlias = true) {
      const response = await gmail.users.settings.sendAs.create({
        userId,
        requestBody: {
          sendAsEmail,
          displayName,
          treatAsAlias
        }
      });
      
      return response.data;
    },
    
    /**
     * Update a send-as alias
     * @param {string} userId - User email
     * @param {string} sendAsEmail - Alias email
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated alias
     */
    async updateSendAsAlias(userId, sendAsEmail, updates) {
      const response = await gmail.users.settings.sendAs.update({
        userId,
        sendAsEmail,
        requestBody: updates
      });
      
      return response.data;
    },
    
    /**
     * Delete a send-as alias
     * @param {string} userId - User email
     * @param {string} sendAsEmail - Alias email
     */
    async deleteSendAsAlias(userId, sendAsEmail) {
      await gmail.users.settings.sendAs.delete({
        userId,
        sendAsEmail
      });
    },
    
    /**
     * Verify a send-as alias (sends verification email)
     * @param {string} userId - User email
     * @param {string} sendAsEmail - Alias email
     */
    async verifySendAsAlias(userId, sendAsEmail) {
      await gmail.users.settings.sendAs.verify({
        userId,
        sendAsEmail
      });
    }
  };
}

module.exports = {
  createAdminClient,
  createGmailSettingsClient
};
