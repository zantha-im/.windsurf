/**
 * Excel Module
 * Read and parse Excel files (.xlsx, .xls)
 * 
 * Usage:
 *   const excel = require('.windsurf/tools/excel');
 *   const workbook = await excel.readWorkbook('./file.xlsx');
 *   const sheets = excel.getSheetNames(workbook);
 *   const data = excel.getSheetData(workbook, 'Sheet1');
 * 
 * Required dependency: npm install exceljs
 */

const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Read an Excel workbook from file (async)
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<object>} ExcelJS workbook object
 */
async function readWorkbook(filePath) {
  const absolutePath = path.resolve(filePath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(absolutePath);
  return workbook;
}

/**
 * Get list of sheet names in a workbook
 * @param {object} workbook - ExcelJS workbook object
 * @returns {string[]} Array of sheet names
 */
function getSheetNames(workbook) {
  return workbook.worksheets.map(ws => ws.name);
}

/**
 * Get sheet data as JSON array
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {object} options - Options for parsing
 * @param {boolean} options.header - Use first row as headers (default: true)
 * @returns {object[]} Array of row objects
 */
function getSheetData(workbook, sheetName, options = {}) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const { header = true } = options;
  const rows = [];
  let headers = [];
  
  sheet.eachRow((row, rowNumber) => {
    const values = row.values.slice(1); // ExcelJS row.values is 1-indexed, first element is undefined
    
    if (header && rowNumber === 1) {
      headers = values.map((v, i) => v != null ? String(v) : `__EMPTY${i > 0 ? '_' + i : ''}`);
      return;
    }
    
    if (header) {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] != null ? values[i] : null;
      });
      rows.push(obj);
    } else {
      rows.push(values);
    }
  });
  
  return rows;
}

/**
 * Get sheet data as 2D array (no headers)
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {any[][]} 2D array of cell values
 */
function getSheetAsArray(workbook, sheetName) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const rows = [];
  sheet.eachRow((row) => {
    const values = row.values.slice(1); // Remove undefined first element
    // Convert cell objects to raw values
    const rawValues = values.map(v => {
      if (v && typeof v === 'object' && 'result' in v) return v.result; // Formula result
      if (v && typeof v === 'object' && 'text' in v) return v.text; // Rich text
      return v != null ? v : null;
    });
    rows.push(rawValues);
  });
  
  return rows;
}

/**
 * Get a specific cell value
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {any} Cell value
 */
function getCell(workbook, sheetName, cellRef) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const cell = sheet.getCell(cellRef);
  return cell.value;
}

/**
 * Get cell with full metadata
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {object|null} Cell object with value, type, formula, etc.
 */
function getCellFull(workbook, sheetName, cellRef) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const cell = sheet.getCell(cellRef);
  if (!cell.value) return null;
  
  return {
    value: cell.value,
    formatted: cell.text,
    type: cell.type,
    formula: cell.formula || null,
  };
}

/**
 * Get the used range of a sheet
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {object} Range object with start/end row/col
 */
function getSheetRange(workbook, sheetName) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  return {
    startRow: 1,
    startCol: 1,
    endRow: sheet.rowCount,
    endCol: sheet.columnCount,
    ref: `A1:${String.fromCharCode(64 + sheet.columnCount)}${sheet.rowCount}`
  };
}

/**
 * Quick summary of a workbook
 * @param {object} workbook - ExcelJS workbook object
 * @returns {object} Summary with sheet names and row counts
 */
function getWorkbookSummary(workbook) {
  const sheets = workbook.worksheets.map(ws => ({
    name: ws.name,
    rows: ws.rowCount,
    cols: ws.columnCount
  }));
  
  return {
    sheetCount: sheets.length,
    sheets
  };
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
