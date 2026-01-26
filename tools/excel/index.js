/**
 * Excel Module
 * Read and parse Excel files (.xlsx, .xls)
 * 
 * Usage:
 *   const excel = require('.windsurf/tools/excel');
 *   const workbook = excel.readWorkbook('./file.xlsx');
 *   const sheets = excel.getSheetNames(workbook);
 *   const data = excel.getSheetData(workbook, 'Sheet1');
 * 
 * Required dependency: npm install xlsx
 */

const XLSX = require('xlsx');
const path = require('path');

/**
 * Read an Excel workbook from file
 * @param {string} filePath - Path to the Excel file
 * @returns {object} XLSX workbook object
 */
function readWorkbook(filePath) {
  const absolutePath = path.resolve(filePath);
  return XLSX.readFile(absolutePath);
}

/**
 * Get list of sheet names in a workbook
 * @param {object} workbook - XLSX workbook object
 * @returns {string[]} Array of sheet names
 */
function getSheetNames(workbook) {
  return workbook.SheetNames;
}

/**
 * Get sheet data as JSON array
 * @param {object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {object} options - Options for parsing
 * @param {boolean} options.header - Use first row as headers (default: true)
 * @param {boolean} options.raw - Return raw values without formatting (default: false)
 * @returns {object[]} Array of row objects
 */
function getSheetData(workbook, sheetName, options = {}) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`);
  }
  
  const { header = true, raw = false } = options;
  
  return XLSX.utils.sheet_to_json(sheet, {
    header: header ? undefined : 1, // undefined = use first row as headers, 1 = array of arrays
    raw,
    defval: null // Default value for empty cells
  });
}

/**
 * Get sheet data as 2D array (no headers)
 * @param {object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {any[][]} 2D array of cell values
 */
function getSheetAsArray(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`);
  }
  
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
}

/**
 * Get a specific cell value
 * @param {object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {any} Cell value
 */
function getCell(workbook, sheetName, cellRef) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`);
  }
  
  const cell = sheet[cellRef];
  return cell ? cell.v : null; // .v is the raw value
}

/**
 * Get cell with full metadata
 * @param {object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {object|null} Cell object with value, type, formula, etc.
 */
function getCellFull(workbook, sheetName, cellRef) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`);
  }
  
  const cell = sheet[cellRef];
  if (!cell) return null;
  
  return {
    value: cell.v,        // Raw value
    formatted: cell.w,    // Formatted text
    type: cell.t,         // Type: s=string, n=number, b=boolean, d=date
    formula: cell.f,      // Formula (if any)
  };
}

/**
 * Get the used range of a sheet
 * @param {object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {object} Range object with start/end row/col
 */
function getSheetRange(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`);
  }
  
  const range = sheet['!ref'];
  if (!range) return null;
  
  const decoded = XLSX.utils.decode_range(range);
  return {
    startRow: decoded.s.r + 1, // 1-indexed
    startCol: decoded.s.c + 1,
    endRow: decoded.e.r + 1,
    endCol: decoded.e.c + 1,
    ref: range
  };
}

/**
 * Quick summary of a workbook
 * @param {object} workbook - XLSX workbook object
 * @returns {object} Summary with sheet names and row counts
 */
function getWorkbookSummary(workbook) {
  const summary = {
    sheetCount: workbook.SheetNames.length,
    sheets: []
  };
  
  for (const name of workbook.SheetNames) {
    const range = getSheetRange(workbook, name);
    summary.sheets.push({
      name,
      rows: range ? range.endRow : 0,
      cols: range ? range.endCol : 0
    });
  }
  
  return summary;
}

module.exports = {
  readWorkbook,
  getSheetNames,
  getSheetData,
  getSheetAsArray,
  getCell,
  getCellFull,
  getSheetRange,
  getWorkbookSummary
};
