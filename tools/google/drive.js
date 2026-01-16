/**
 * Google Drive Module
 * Configurable Drive API operations
 * 
 * Usage:
 *   const { createDriveClient } = require('.windsurf/tools/google/drive');
 *   const drive = await createDriveClient(authClient);
 *   const files = await drive.listFiles(folderId);
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

/**
 * Create Drive API client
 * @param {google.auth.OAuth2|google.auth.GoogleAuth} auth - Authenticated client
 * @returns {Object} Drive operations object
 */
function createDriveClient(auth) {
  const drive = google.drive({ version: 'v3', auth });
  
  return {
    /**
     * List files in a folder
     * @param {string} folderId - Folder ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Files
     */
    async listFiles(folderId, options = {}) {
      const query = options.query || `'${folderId}' in parents and trashed = false`;
      const fields = options.fields || 'files(id, name, mimeType, size, modifiedTime, webViewLink)';
      
      const response = await drive.files.list({
        q: query,
        fields,
        pageSize: options.pageSize || 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
      
      return response.data.files || [];
    },
    
    /**
     * List files in a Shared Drive folder
     * @param {string} driveId - Shared Drive ID
     * @param {string} folderId - Folder ID within the drive
     * @returns {Promise<Array>} Files
     */
    async listSharedDriveFiles(driveId, folderId) {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        driveId,
        corpora: 'drive',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)'
      });
      
      return response.data.files || [];
    },
    
    /**
     * Get file metadata
     * @param {string} fileId - File ID
     * @returns {Promise<Object>} File metadata
     */
    async getFileMetadata(fileId) {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink, parents',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Download file content
     * @param {string} fileId - File ID
     * @returns {Promise<Buffer>} File content
     */
    async downloadFile(fileId) {
      const response = await drive.files.get({
        fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'arraybuffer'
      });
      
      return Buffer.from(response.data);
    },
    
    /**
     * Export Google Doc/Sheet/Slide to a format
     * @param {string} fileId - File ID
     * @param {string} mimeType - Export MIME type
     * @returns {Promise<Buffer>} Exported content
     */
    async exportFile(fileId, mimeType) {
      const response = await drive.files.export({
        fileId,
        mimeType
      }, {
        responseType: 'arraybuffer'
      });
      
      return Buffer.from(response.data);
    },
    
    /**
     * Upload a file from local path
     * @param {string} localPath - Local file path
     * @param {string} folderId - Target folder ID
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Created file metadata
     */
    async uploadFile(localPath, folderId, options = {}) {
      const fileName = options.name || path.basename(localPath);
      const mimeType = options.mimeType || getMimeType(localPath);
      
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };
      
      if (options.description) {
        fileMetadata.description = options.description;
      }
      
      const media = {
        mimeType,
        body: fs.createReadStream(localPath)
      };
      
      const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, name, mimeType, size, webViewLink',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Upload content directly (not from file)
     * @param {string|Buffer} content - Content to upload
     * @param {string} fileName - File name
     * @param {string} folderId - Target folder ID
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Created file metadata
     */
    async uploadContent(content, fileName, folderId, options = {}) {
      const mimeType = options.mimeType || getMimeType(fileName);
      
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };
      
      if (options.description) {
        fileMetadata.description = options.description;
      }
      
      // Convert to Google Doc if requested
      if (options.convertToGoogleDoc) {
        fileMetadata.mimeType = 'application/vnd.google-apps.document';
      }
      
      const stream = Readable.from([content]);
      
      const media = {
        mimeType,
        body: stream
      };
      
      const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, name, mimeType, size, webViewLink',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Copy a file
     * @param {string} fileId - Source file ID
     * @param {string} name - New file name
     * @param {string} folderId - Target folder ID (optional)
     * @returns {Promise<Object>} Copied file metadata
     */
    async copyFile(fileId, name, folderId = null) {
      const fileMetadata = { name };
      if (folderId) {
        fileMetadata.parents = [folderId];
      }
      
      const response = await drive.files.copy({
        fileId,
        resource: fileMetadata,
        fields: 'id, name, mimeType, webViewLink, parents',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Move a file to a different folder
     * @param {string} fileId - File ID
     * @param {string} newFolderId - Target folder ID
     * @returns {Promise<Object>} Updated file metadata
     */
    async moveFile(fileId, newFolderId) {
      // Get current parents
      const file = await drive.files.get({
        fileId,
        fields: 'parents',
        supportsAllDrives: true
      });
      
      const previousParents = file.data.parents ? file.data.parents.join(',') : '';
      
      const response = await drive.files.update({
        fileId,
        addParents: newFolderId,
        removeParents: previousParents,
        fields: 'id, name, mimeType, webViewLink, parents',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Delete a file
     * @param {string} fileId - File ID
     */
    async deleteFile(fileId) {
      await drive.files.delete({
        fileId,
        supportsAllDrives: true
      });
    },
    
    /**
     * Create a folder
     * @param {string} name - Folder name
     * @param {string} parentId - Parent folder ID
     * @returns {Promise<Object>} Created folder metadata
     */
    async createFolder(name, parentId) {
      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };
      
      const response = await drive.files.create({
        resource: fileMetadata,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });
      
      return response.data;
    },
    
    /**
     * Find a folder by name within a parent
     * @param {string} name - Folder name
     * @param {string} parentId - Parent folder ID
     * @returns {Promise<Object|null>} Folder metadata or null
     */
    async findFolder(name, parentId) {
      const response = await drive.files.list({
        q: `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, webViewLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
      
      return response.data.files?.[0] || null;
    },
    
    // Expose raw client for advanced operations
    raw: drive
  };
}

/**
 * Get MIME type from file extension
 * @param {string} filename - File name or path
 * @returns {string} MIME type
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = {
  createDriveClient,
  getMimeType
};
