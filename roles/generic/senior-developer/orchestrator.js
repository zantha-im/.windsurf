/**
 * Senior Developer Orchestrator
 * Generic tooling for code quality and development workflows
 * Works in any Node.js project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Excel tool (lazy loaded)
let excel = null;
function getExcel() {
  if (!excel) {
    try {
      // Path relative to this file: roles/generic/senior-developer/ -> tools/excel
      excel = require('../../../tools/excel');
    } catch (err) {
      console.error('Excel tool not available. Install xlsx: npm install xlsx');
      console.error('Error:', err.message);
      return null;
    }
  }
  return excel;
}

/**
 * Detect project type and available tools
 */
function detectProject() {
  const cwd = process.cwd();
  const result = {
    type: 'unknown',
    packageManager: null,
    hasTypeScript: false,
    hasLint: false,
    hasTest: false,
    hasPrettier: false,
    framework: null
  };
  
  // Check for package.json
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    result.type = 'node';
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Detect package manager
    if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
      result.packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
      result.packageManager = 'yarn';
    } else if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
      result.packageManager = 'npm';
    }
    
    // Detect tools from scripts
    const scripts = pkg.scripts || {};
    result.hasLint = 'lint' in scripts;
    result.hasTest = 'test' in scripts;
    result.hasPrettier = 'format' in scripts || 'prettier' in scripts;
    
    // Detect TypeScript
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    result.hasTypeScript = 'typescript' in deps || fs.existsSync(path.join(cwd, 'tsconfig.json'));
    
    // Detect framework
    if ('next' in deps) result.framework = 'next';
    else if ('react' in deps) result.framework = 'react';
    else if ('vue' in deps) result.framework = 'vue';
    else if ('express' in deps) result.framework = 'express';
  }
  
  return result;
}

/**
 * Run a command and return output
 */
function run(cmd, options = {}) {
  try {
    const output = execSync(cmd, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output };
  } catch (err) {
    return { success: false, error: err.message, output: err.stdout };
  }
}

/**
 * Run linting
 */
function lint(fix = false) {
  const project = detectProject();
  if (!project.hasLint) {
    console.log('No lint script found in package.json');
    return { success: false, error: 'No lint script' };
  }
  
  const pm = project.packageManager || 'npm';
  const cmd = fix ? `${pm} run lint -- --fix` : `${pm} run lint`;
  console.log(`Running: ${cmd}`);
  return run(cmd);
}

/**
 * Run type checking
 */
function typeCheck() {
  const project = detectProject();
  if (!project.hasTypeScript) {
    console.log('TypeScript not detected');
    return { success: false, error: 'No TypeScript' };
  }
  
  console.log('Running: npx tsc --noEmit');
  return run('npx tsc --noEmit');
}

/**
 * Run tests
 */
function test(watch = false) {
  const project = detectProject();
  if (!project.hasTest) {
    console.log('No test script found in package.json');
    return { success: false, error: 'No test script' };
  }
  
  const pm = project.packageManager || 'npm';
  const cmd = watch ? `${pm} run test -- --watch` : `${pm} run test`;
  console.log(`Running: ${cmd}`);
  return run(cmd);
}

/**
 * Run all quality checks
 */
function check() {
  console.log('=== Running all quality checks ===\n');
  
  const results = {};
  
  console.log('--- Lint ---');
  results.lint = lint();
  
  console.log('\n--- Type Check ---');
  results.typeCheck = typeCheck();
  
  console.log('\n--- Tests ---');
  results.test = test();
  
  console.log('\n=== Summary ===');
  console.log(`Lint: ${results.lint.success ? '✓' : '✗'}`);
  console.log(`TypeScript: ${results.typeCheck.success ? '✓' : '✗'}`);
  console.log(`Tests: ${results.test.success ? '✓' : '✗'}`);
  
  return results;
}

/**
 * Show git status
 */
function gitStatus() {
  console.log('=== Git Status ===\n');
  run('git status');
  console.log('\n=== Recent Commits ===\n');
  run('git log -n 5 --oneline');
}

/**
 * Read and summarize an Excel file
 */
function readExcel(filePath, sheetName) {
  const excelTool = getExcel();
  if (!excelTool) return { success: false, error: 'Excel tool not available' };
  
  try {
    const workbook = excelTool.readWorkbook(filePath);
    const summary = excelTool.getWorkbookSummary(workbook);
    
    console.log('=== Workbook Summary ===');
    console.log(`File: ${filePath}`);
    console.log(`Sheets: ${summary.sheetCount}`);
    summary.sheets.forEach(s => {
      console.log(`  - ${s.name}: ${s.rows} rows x ${s.cols} cols`);
    });
    
    if (sheetName) {
      console.log(`\n=== Sheet: ${sheetName} ===`);
      const data = excelTool.getSheetData(workbook, sheetName);
      console.log(`Rows: ${data.length}`);
      if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
        console.log('\nFirst 5 rows:');
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
      }
      return { success: true, summary, data };
    }
    
    return { success: true, summary };
  } catch (err) {
    console.error('Error reading Excel:', err.message);
    return { success: false, error: err.message };
  }
}

// CLI
if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  
  if (!cmd) {
    const project = detectProject();
    console.log(`
Senior Developer Orchestrator

Project: ${project.type}
Package Manager: ${project.packageManager || 'not detected'}
Framework: ${project.framework || 'none'}
TypeScript: ${project.hasTypeScript ? 'yes' : 'no'}
Lint: ${project.hasLint ? 'yes' : 'no'}
Tests: ${project.hasTest ? 'yes' : 'no'}

Commands:
  detect      Show project detection results
  lint        Run linting
  lint --fix  Run linting with auto-fix
  typecheck   Run TypeScript type checking
  test        Run tests
  test --watch Run tests in watch mode
  check       Run all quality checks (lint + typecheck + test)
  git         Show git status and recent commits
  excel <file> [sheet]  Read Excel file (summary or specific sheet)

Usage:
  node orchestrator.js <command>
`);
    process.exit(0);
  }
  
  const commands = {
    detect: () => console.log(JSON.stringify(detectProject(), null, 2)),
    lint: () => lint(args.includes('--fix')),
    typecheck: () => typeCheck(),
    test: () => test(args.includes('--watch')),
    check: () => check(),
    git: () => gitStatus(),
    excel: () => readExcel(args[0], args[1])
  };
  
  if (commands[cmd]) {
    commands[cmd]();
  } else {
    console.error('Unknown command:', cmd);
    process.exit(1);
  }
}

module.exports = {
  detectProject,
  lint,
  typeCheck,
  test,
  check,
  gitStatus,
  readExcel,
  run
};
