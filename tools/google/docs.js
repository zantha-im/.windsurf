/**
 * Google Docs Module
 * Configurable Docs API operations
 * 
 * Usage:
 *   const { createDocsClient } = require('.windsurf/tools/google/docs');
 *   const docs = createDocsClient(authClient);
 *   const content = await docs.getDocumentText(docId);
 */

const { google } = require('googleapis');

/**
 * Create Docs API client
 * @param {google.auth.OAuth2|google.auth.GoogleAuth} auth - Authenticated client
 * @returns {Object} Docs operations object
 */
function createDocsClient(auth) {
  const docs = google.docs({ version: 'v1', auth });
  
  return {
    /**
     * Get document content
     * @param {string} documentId - Document ID
     * @returns {Promise<Object>} Document object
     */
    async getDocument(documentId) {
      const response = await docs.documents.get({ documentId });
      return response.data;
    },
    
    /**
     * Get document as plain text
     * @param {string} documentId - Document ID
     * @returns {Promise<string>} Plain text content
     */
    async getDocumentText(documentId) {
      const doc = await this.getDocument(documentId);
      return extractTextFromDocument(doc);
    },
    
    /**
     * Replace all occurrences of text in a document
     * @param {string} documentId - Document ID
     * @param {Object} replacements - Map of {searchText: replaceText}
     * @returns {Promise<Object>} Batch update response
     */
    async replaceAllText(documentId, replacements) {
      const requests = Object.entries(replacements).map(([searchText, replaceText]) => ({
        replaceAllText: {
          containsText: {
            text: searchText,
            matchCase: true
          },
          replaceText
        }
      }));
      
      const response = await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
      
      return response.data;
    },
    
    /**
     * Apply text styling to specific text
     * @param {string} documentId - Document ID
     * @param {string} text - Text to find and style
     * @param {Object} style - Style object (bold, italic, etc.)
     * @returns {Promise<Object>} Batch update response
     */
    async applyTextStyle(documentId, text, style) {
      // First get the document to find the text location
      const doc = await this.getDocument(documentId);
      const ranges = findTextRanges(doc, text);
      
      if (ranges.length === 0) {
        return { replies: [] };
      }
      
      const requests = ranges.map(range => ({
        updateTextStyle: {
          range: {
            startIndex: range.startIndex,
            endIndex: range.endIndex
          },
          textStyle: style,
          fields: Object.keys(style).join(',')
        }
      }));
      
      const response = await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
      
      return response.data;
    },
    
    /**
     * Insert text at a specific index
     * @param {string} documentId - Document ID
     * @param {number} index - Character index
     * @param {string} text - Text to insert
     * @returns {Promise<Object>} Batch update response
     */
    async insertText(documentId, index, text) {
      const response = await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [{
            insertText: {
              location: { index },
              text
            }
          }]
        }
      });
      
      return response.data;
    },
    
    /**
     * Delete text range
     * @param {string} documentId - Document ID
     * @param {number} startIndex - Start character index
     * @param {number} endIndex - End character index
     * @returns {Promise<Object>} Batch update response
     */
    async deleteText(documentId, startIndex, endIndex) {
      const response = await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [{
            deleteContentRange: {
              range: { startIndex, endIndex }
            }
          }]
        }
      });
      
      return response.data;
    },
    
    /**
     * Execute batch update with custom requests
     * @param {string} documentId - Document ID
     * @param {Array} requests - Array of request objects
     * @returns {Promise<Object>} Batch update response
     */
    async batchUpdate(documentId, requests) {
      const response = await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
      
      return response.data;
    },
    
    // Expose raw client for advanced operations
    raw: docs
  };
}

/**
 * Extract plain text from a Google Doc object
 * @param {Object} doc - Document object from API
 * @returns {string} Plain text content
 */
function extractTextFromDocument(doc) {
  if (!doc.body || !doc.body.content) {
    return '';
  }
  
  let text = '';
  
  for (const element of doc.body.content) {
    if (element.paragraph) {
      for (const elem of element.paragraph.elements || []) {
        if (elem.textRun && elem.textRun.content) {
          text += elem.textRun.content;
        }
      }
    } else if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          for (const cellContent of cell.content || []) {
            if (cellContent.paragraph) {
              for (const elem of cellContent.paragraph.elements || []) {
                if (elem.textRun && elem.textRun.content) {
                  text += elem.textRun.content;
                }
              }
            }
          }
          text += '\t';
        }
        text += '\n';
      }
    }
  }
  
  return text;
}

/**
 * Find all occurrences of text in a document and return their ranges
 * @param {Object} doc - Document object from API
 * @param {string} searchText - Text to find
 * @returns {Array<{startIndex: number, endIndex: number}>} Array of ranges
 */
function findTextRanges(doc, searchText) {
  const ranges = [];
  
  if (!doc.body || !doc.body.content) {
    return ranges;
  }
  
  for (const element of doc.body.content) {
    if (element.paragraph) {
      for (const elem of element.paragraph.elements || []) {
        if (elem.textRun && elem.textRun.content) {
          const content = elem.textRun.content;
          let searchIndex = 0;
          let foundIndex;
          
          while ((foundIndex = content.indexOf(searchText, searchIndex)) !== -1) {
            ranges.push({
              startIndex: elem.startIndex + foundIndex,
              endIndex: elem.startIndex + foundIndex + searchText.length
            });
            searchIndex = foundIndex + 1;
          }
        }
      }
    }
  }
  
  return ranges;
}

module.exports = {
  createDocsClient,
  extractTextFromDocument,
  findTextRanges
};
