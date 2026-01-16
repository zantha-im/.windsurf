/**
 * PDF Tools Index
 * Re-exports all PDF modules
 */

const { extractTextFromFile, extractTextFromBuffer } = require('./extract');
const { extractTextWithOcr, extractTextFromBufferWithOcr, needsOcr } = require('./ocr');

module.exports = {
  extractTextFromFile,
  extractTextFromBuffer,
  extractTextWithOcr,
  extractTextFromBufferWithOcr,
  needsOcr
};
