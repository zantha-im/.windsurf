/**
 * OCR Module for Scanned PDFs
 * Uses Tesseract.js for optical character recognition
 * 
 * Usage:
 *   const { extractTextWithOcr, needsOcr } = require('.windsurf/tools/pdf/ocr');
 *   
 *   if (await needsOcr('./scanned.pdf')) {
 *     const text = await extractTextWithOcr('./scanned.pdf');
 *   }
 */

const { pdfToPng } = require('pdf-to-png-converter');
const Tesseract = require('tesseract.js');

/**
 * Extract text from a scanned PDF using OCR
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextWithOcr(pdfPath) {
  // Convert PDF to PNG images
  const pngPages = await pdfToPng(pdfPath, {
    disableFontFace: true,
    useSystemFonts: true,
    viewportScale: 2.0 // Higher resolution for better OCR
  });
  
  if (pngPages.length === 0) {
    throw new Error('No pages extracted from PDF');
  }
  
  // OCR each page
  let fullText = '';
  for (let i = 0; i < pngPages.length; i++) {
    const { data: { text } } = await Tesseract.recognize(
      pngPages[i].content,
      'eng',
      { logger: () => {} } // Suppress progress logs
    );
    fullText += `\n--- Page ${i + 1} ---\n${text}\n`;
  }
  
  return fullText;
}

/**
 * Extract text from a PDF buffer using OCR
 * @param {Buffer} buffer - PDF content as buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromBufferWithOcr(buffer) {
  // Convert buffer to PNG images
  const pngPages = await pdfToPng(buffer, {
    disableFontFace: true,
    useSystemFonts: true,
    viewportScale: 2.0
  });
  
  if (pngPages.length === 0) {
    throw new Error('No pages extracted from PDF');
  }
  
  // OCR each page
  let fullText = '';
  for (let i = 0; i < pngPages.length; i++) {
    const { data: { text } } = await Tesseract.recognize(
      pngPages[i].content,
      'eng',
      { logger: () => {} }
    );
    fullText += `\n--- Page ${i + 1} ---\n${text}\n`;
  }
  
  return fullText;
}

/**
 * Check if a PDF needs OCR (has no extractable text)
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<boolean>} True if OCR is needed
 */
async function needsOcr(pdfPath) {
  const { extractTextFromFile } = require('./extract');
  const text = await extractTextFromFile(pdfPath);
  
  // If text extraction yields very little content, likely needs OCR
  const cleanText = text.replace(/--- Page \d+ ---/g, '').trim();
  return cleanText.length < 100;
}

module.exports = {
  extractTextWithOcr,
  extractTextFromBufferWithOcr,
  needsOcr
};

// CLI usage
if (require.main === module) {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Usage: node ocr.js <pdf-path>');
    process.exit(1);
  }
  
  extractTextWithOcr(pdfPath)
    .then(text => console.log(text))
    .catch(err => console.error('Error:', err.message));
}
