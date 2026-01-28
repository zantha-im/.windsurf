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
 * IMPORTANT: Formula Handling Limitation
 * ExcelJS does NOT calculate formulas - it only reads cached results stored in the file.
 * Files exported from Xero, Google Sheets, or saved without recalculation may have:
 * - Missing cached results (returns the formula object instead of a value)
 * - Stale cached results (old values that don't match current formula inputs)
 * - Zero values (common for running balance columns)
 * 
 * Use `getWorkbookSummary()` to check for formula warnings before processing.
 * If formulas are critical, ask the user to open in Excel and Save to refresh cached values.
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
 * Check if a cell value is a formula without a usable cached result
 * @param {any} cellValue - The cell.value from ExcelJS
 * @returns {boolean} True if formula with missing/suspect cached result
 */
function isUnresolvedFormula(cellValue) {
  if (!cellValue || typeof cellValue !== 'object') return false;
  if (!('formula' in cellValue)) return false;
  
  // Check if result is missing, null, undefined, or zero (common for uncalculated formulas)
  const result = cellValue.result;
  return result === undefined || result === null || result === 0;
}

/**
 * Get the effective value of a cell, with formula awareness
 * @param {object} cell - ExcelJS cell object
 * @returns {{ value: any, isFormula: boolean, hasResult: boolean, formula: string|null }}
 */
function getEffectiveValue(cell) {
  const value = cell.value;
  
  // Simple value
  if (!value || typeof value !== 'object') {
    return { value, isFormula: false, hasResult: true, formula: null };
  }
  
  // Rich text
  if ('richText' in value || 'text' in value) {
    return { value: cell.text, isFormula: false, hasResult: true, formula: null };
  }
  
  // Formula
  if ('formula' in value) {
    const result = value.result;
    const hasResult = result !== undefined && result !== null;
    return {
      value: hasResult ? result : null,
      isFormula: true,
      hasResult,
      formula: value.formula
    };
  }
  
  // Other object types
  return { value, isFormula: false, hasResult: true, formula: null };
}

/**
 * Scan a sheet for formula cells with missing or suspect cached results
 * @param {object} workbook - ExcelJS workbook object
 * @param {string} sheetName - Name of the sheet
 * @returns {{ hasIssues: boolean, totalFormulas: number, unresolvedFormulas: number, samples: Array<{cell: string, formula: string}> }}
 */
function getFormulaWarnings(workbook, sheetName) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    const available = getSheetNames(workbook);
    throw new Error(`Sheet "${sheetName}" not found. Available: ${available.join(', ')}`);
  }
  
  let totalFormulas = 0;
  let unresolvedFormulas = 0;
  const samples = [];
  
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const value = cell.value;
      if (value && typeof value === 'object' && 'formula' in value) {
        totalFormulas++;
        if (isUnresolvedFormula(value)) {
          unresolvedFormulas++;
          if (samples.length < 5) {
            const colLetter = String.fromCharCode(64 + colNumber);
            samples.push({
              cell: `${colLetter}${rowNumber}`,
              formula: value.formula
            });
          }
        }
      }
    });
  });
  
  return {
    hasIssues: unresolvedFormulas > 0,
    totalFormulas,
    unresolvedFormulas,
    samples
  };
}

/**
 * Quick summary of a workbook (includes formula warnings)
 * @param {object} workbook - ExcelJS workbook object
 * @returns {object} Summary with sheet names, row counts, and formula warnings
 */
function getWorkbookSummary(workbook) {
  const sheets = workbook.worksheets.map(ws => {
    const formulaCheck = getFormulaWarnings(workbook, ws.name);
    return {
      name: ws.name,
      rows: ws.rowCount,
      cols: ws.columnCount,
      formulas: formulaCheck.totalFormulas,
      unresolvedFormulas: formulaCheck.unresolvedFormulas
    };
  });
  
  const hasFormulaIssues = sheets.some(s => s.unresolvedFormulas > 0);
  
  const summary = {
    sheetCount: sheets.length,
    sheets
  };
  
  if (hasFormulaIssues) {
    summary.warning = 'FORMULA WARNING: Some cells contain formulas without cached results. ' +
      'Values may be missing or incorrect. Consider opening in Excel and saving to refresh cached values.';
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
  getEffectiveValue,
  getSheetRange,
  getWorkbookSummary,
  getFormulaWarnings,
  isUnresolvedFormula
};
