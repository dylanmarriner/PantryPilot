#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Extract role metadata from content header
 * @param {string} content - File content
 * @returns {Object} Metadata extracted from header
 */
function extractRoleHeader(content) {
  const lines = content.split('\n');
  const metadata = {};

  for (const line of lines) {
    if (line.startsWith('// ') || line.startsWith('# ')) {
      if (line.includes('EXECUTED VIA:')) {
        metadata.EXECUTED_VIA = line.split('EXECUTED VIA:')[1]?.trim();
      }
      if (line.includes('CONNECTED VIA:')) {
        metadata.CONNECTED_VIA = line.split('CONNECTED VIA:')[1]?.trim();
      }
    }
  }

  return metadata;
}

/**
 * Parse role metadata from content
 * @param {Object} header - Extracted header metadata
 * @returns {Object} Parsed metadata
 */
function parseRoleMetadata(header) {
  return {
    EXECUTED_VIA: header.EXECUTED_VIA || null,
    CONNECTED_VIA: header.CONNECTED_VIA || null,
    ROLE: header.ROLE || null
  };
}

/**
 * Validate role metadata
 * @param {Object} metadata - Metadata to validate
 * @throws {Error} If validation fails
 */
function validateRoleMetadata(metadata) {
  if (!metadata.EXECUTED_VIA) {
    throw new Error('Missing required metadata: EXECUTED VIA');
  }
  if (!metadata.CONNECTED_VIA) {
    throw new Error('Missing required metadata: CONNECTED VIA');
  }
}

/**
 * Validate role mismatch
 * @param {string} declaredRole - Role in metadata
 * @param {string} content - File content
 * @throws {Error} If role mismatch detected
 */
function validateRoleMismatch(declaredRole, content) {
  // Placeholder validation - can be expanded
  if (declaredRole && content.length === 0) {
    throw new Error('Cannot write empty content with role declaration');
  }
}

/**
 * Write a file with validation
 * DEPRECATED: Session locking removed from MCP. This tool no longer requires session management.
 * @param {Object} params
 * @param {string} params.path - File path to write to
 * @param {string} params.content - Content to write
 * @param {string} params.role - Optional role for metadata validation
 * @param {boolean} params.overwrite - Whether to overwrite existing file
 * @returns {Object} Result object
 */
function writeFile(params) {
  const { path: filePath, content: contentToWrite, role, overwrite = false } = params;

  if (!filePath) {
    return {
      ok: false,
      error: 'path parameter is required',
      code: 'MISSING_PATH'
    };
  }

  if (contentToWrite === undefined || contentToWrite === null) {
    return {
      ok: false,
      error: 'content parameter is required',
      code: 'MISSING_CONTENT'
    };
  }

  // Check if file exists
  if (fs.existsSync(filePath) && !overwrite) {
    return {
      ok: false,
      error: 'File already exists and overwrite is false',
      code: 'FILE_EXISTS',
      path: filePath
    };
  }

  try {
    // GATE 3: ROLE VALIDATION
    // Only validate role metadata if role was explicitly provided
    // FIX: This prevents ROLE_CONTRACT_VIOLATION errors when role is not set
    if (role) {
      const header = extractRoleHeader(contentToWrite);
      const metadata = parseRoleMetadata(header);
      validateRoleMetadata(metadata);
      validateRoleMismatch(metadata.ROLE, contentToWrite);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, contentToWrite, 'utf8');

    return {
      ok: true,
      message: 'File written successfully',
      path: filePath,
      bytes: contentToWrite.length,
      hash: generateContentHash(contentToWrite)
    };
  } catch (err) {
    return {
      ok: false,
      error: `Failed to write file: ${err.message}`,
      code: 'WRITE_FAILED',
      path: filePath
    };
  }
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
  if (args.length < 2) {
    console.error('Usage: write_file.js <path> <content> [role]');
    process.exit(1);
  }

  const result = writeFile({
    path: args[0],
    content: args[1],
    role: args[2] || null,
    overwrite: true
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

module.exports = {
  writeFile,
  extractRoleHeader,
  parseRoleMetadata,
  validateRoleMetadata,
  validateRoleMismatch
};
