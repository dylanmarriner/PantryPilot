#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Get the plans directory
 */
function getPlansDir() {
  return path.join(__dirname, '../docs/plans');
}

/**
 * Lint a plan file
 * DEPRECATED: Session locking removed from MCP. This tool no longer requires session management.
 * @param {Object} params
 * @param {string} params.filePath - Path to the plan file
 * @returns {Object} Result object with linting status
 */
function lintPlan(params) {
  const { filePath } = params;

  if (!filePath) {
    return {
      ok: false,
      error: 'filePath parameter is required',
      code: 'MISSING_FILEPATH'
    };
  }

  let planContent;
  let fullPath;

  try {
    // Load from file path - extract just filename if it contains full path
    let fileName = filePath;
    if (filePath.includes('/')) {
      // Extract just the filename from full path (FIX: prevent path duplication)
      fileName = filePath.split('/').pop();
    }
    fullPath = path.join(getPlansDir(), fileName);
    planContent = fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    return {
      ok: false,
      error: `Failed to read plan file: ${err.message}`,
      code: 'FILE_READ_ERROR',
      path: fullPath
    };
  }

  // Validate plan structure
  const validationErrors = [];

  // Check for required sections
  const requiredSections = ['## Plan', '## Justification', '## Expected Outcome'];
  for (const section of requiredSections) {
    if (!planContent.includes(section)) {
      validationErrors.push(`Missing required section: ${section}`);
    }
  }

  // Check for metadata header
  if (!planContent.startsWith('---')) {
    validationErrors.push('Plan must start with YAML frontmatter (---)');
  }

  if (validationErrors.length > 0) {
    return {
      ok: false,
      error: 'Plan validation failed',
      code: 'VALIDATION_FAILED',
      errors: validationErrors,
      path: fullPath
    };
  }

  return {
    ok: true,
    message: 'Plan linting passed successfully',
    path: fullPath,
    planHash: generateContentHash(planContent)
  };
}

/**
 * Generate a simple content hash
 */
function generateContentHash(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: lint_plan.js <filePath>');
    process.exit(1);
  }

  const result = lintPlan({ filePath: args[0] });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

module.exports = { lintPlan, getPlansDir };
