/**
 * PDF Text Extraction Module
 * Extract text from PDF files using pdfjs-dist
 * 
 * Usage:
 *   const { extractTextFromFile, extractTextFromBuffer } = require('.windsurf/tools/pdf/extract');
 *   const text = await extractTextFromFile('./document.pdf');
 */

const fs = require('fs');

/**
 * Extract text from a PDF file
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromFile(pdfPath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
  }
  
  return fullText;
}

/**
 * Extract text from a PDF buffer
 * @param {Buffer} buffer - PDF content as buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromBuffer(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
  }
  
  return fullText;
}

module.exports = {
  extractTextFromFile,
  extractTextFromBuffer
};

// CLI usage
if (require.main === module) {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Usage: node extract.js <pdf-path>');
    process.exit(1);
  }
  
  extractTextFromFile(pdfPath)
    .then(text => console.log(text))
    .catch(err => console.error('Error:', err.message));
}
