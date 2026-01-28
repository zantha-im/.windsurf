/**
 * Excel Module
 * Read and parse Excel files (.xlsx, .xls) with formula calculation support.
 * 
 * Usage:
 *   const excel = require('.windsurf/tools/excel');
 *   const workbook = excel.readWorkbook('./file.xlsx');  // Sync, calculates formulas
 *   const sheets = excel.getSheetNames(workbook);
 *   const data = excel.getSheetData(workbook, 'Sheet1');
 * 
 * This module uses SheetJS (xlsx) + xlsx-calc to read Excel files and calculate
 * all formulas in-memory. This ensures you get actual computed values, not just
 * cached results that may be stale or missing (common with Xero exports).
 * 
 * Required dependencies: npm install xlsx xlsx-calc @formulajs/formulajs
 */

const XLSX = require('xlsx');
const XLSX_CALC = require('xlsx-calc');
const path = require('path');

// Import formulajs for advanced Excel functions (SUMIF, VLOOKUP, etc.)
try {
  const formulajs = require('@formulajs/formulajs');
  XLSX_CALC.import_functions(formulajs);
} catch (e) {
  // formulajs is optional - basic formulas will still work
}

/**
 * Read an Excel workbook from file and calculate all formulas
 * @param {string} filePath - Path to the Excel file
 * @param {object} options - Options
 * @param {boolean} options.calculateFormulas - Whether to calculate formulas (default: true)
 * @returns {object} SheetJS workbook object with calculated values
 */
function readWorkbook(filePath, options = {}) {
  const { calculateFormulas = true } = options;
  const absolutePath = path.resolve(filePath);
  const workbook = XLSX.readFile(absolutePath, { cellFormula: true, cellNF: true });
  
  if (calculateFormulas) {
    try {
      XLSX_CALC(workbook, { continue_after_error: true });
    } catch (e) {
      // Log but don't fail - some formulas may not be supported
      console.warn('Warning: Some formulas could not be calculated:', e.message);
    }
  }
  
  return workbook;
}

/**
 * Get list of sheet names in a workbook
 * @param {object} workbook - SheetJS workbook object
 * @returns {string[]} Array of sheet names
 */
function getSheetNames(workbook) {
  return workbook.SheetNames;
}

/**
 * Get sheet data as JSON array
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {object} options - Options for parsing
 * @param {boolean} options.header - Use first row as headers (default: true)
 * @param {number} options.headerRow - Row number to use as header (default: 1, 1-indexed)
 * @returns {object[]} Array of row objects
 */
function getSheetData(workbook, sheetName, options = {}) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const { header = true, headerRow = 1 } = options;
  
  if (header) {
    // Use first row as headers
    return XLSX.utils.sheet_to_json(sheet, { header: headerRow, defval: null });
  } else {
    // Return as array of arrays
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  }
}

/**
 * Get sheet data as 2D array (no headers)
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {any[][]} 2D array of cell values
 */
function getSheetAsArray(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
}

/**
 * Get a specific cell value
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {any} Cell value (calculated if formula)
 */
function getCell(workbook, sheetName, cellRef) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const cell = sheet[cellRef];
  if (!cell) return null;
  
  // Return the calculated value (.v) which xlsx-calc populates
  return cell.v;
}

/**
 * Get cell with full metadata
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {string} cellRef - Cell reference (e.g., 'A1', 'B2')
 * @returns {object|null} Cell object with value, type, formula, etc.
 */
function getCellFull(workbook, sheetName, cellRef) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const cell = sheet[cellRef];
  if (!cell) return null;
  
  return {
    value: cell.v,           // Calculated value
    formatted: cell.w || String(cell.v), // Formatted text
    type: cell.t,            // Type: n=number, s=string, b=boolean, d=date, e=error
    formula: cell.f || null, // Formula if present
    raw: cell                // Full cell object for debugging
  };
}

/**
 * Get the used range of a sheet
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {object} Range object with ref string and decoded bounds
 */
function getSheetRange(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const ref = sheet['!ref'] || 'A1';
  const range = XLSX.utils.decode_range(ref);
  
  return {
    startRow: range.s.r + 1,  // Convert to 1-indexed
    startCol: range.s.c + 1,
    endRow: range.e.r + 1,
    endCol: range.e.c + 1,
    ref: ref
  };
}

/**
 * Quick summary of a workbook
 * @param {object} workbook - SheetJS workbook object
 * @returns {object} Summary with sheet names and dimensions
 */
function getWorkbookSummary(workbook) {
  const sheets = workbook.SheetNames.map(name => {
    const sheet = workbook.Sheets[name];
    const range = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
    
    // Count formulas in sheet
    let formulaCount = 0;
    if (range) {
      for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          const cell = sheet[cellRef];
          if (cell && cell.f) formulaCount++;
        }
      }
    }
    
    return {
      name,
      rows: range ? range.e.r - range.s.r + 1 : 0,
      cols: range ? range.e.c - range.s.c + 1 : 0,
      formulas: formulaCount,
      ref: sheet['!ref'] || null
    };
  });
  
  return {
    sheetCount: sheets.length,
    sheets,
    note: 'Formulas have been calculated in-memory. All values are computed.'
  };
}

/**
 * Export a sheet to CSV string
 * @param {object} workbook - SheetJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {object} options - CSV options
 * @param {string} options.separator - Field separator (default: ',')
 * @returns {string} CSV string
 */
function sheetToCSV(workbook, sheetName, options = {}) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  const { separator = ',' } = options;
  return XLSX.utils.sheet_to_csv(sheet, { FS: separator });
}

/**
 * Export all sheets to CSV files
 * @param {object} workbook - SheetJS workbook object
 * @param {string} outputDir - Output directory
 * @param {object} options - CSV options
 * @returns {string[]} Array of created file paths
 */
function exportToCSV(workbook, outputDir, options = {}) {
  const fs = require('fs');
  const createdFiles = [];
  
  for (const sheetName of workbook.SheetNames) {
    const csv = sheetToCSV(workbook, sheetName, options);
    const safeName = sheetName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(outputDir, `${safeName}.csv`);
    fs.writeFileSync(filePath, csv, 'utf8');
    createdFiles.push(filePath);
  }
  
  return createdFiles;
}

module.exports = {
  readWorkbook,
  getSheetNames,
  getSheetData,
  getSheetAsArray,
  getCell,
  getCellFull,
  getSheetRange,
  getWorkbookSummary,
  sheetToCSV,
  exportToCSV
};
