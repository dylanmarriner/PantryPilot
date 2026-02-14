# Plan Linting and Signing Guide

This document explains the complete 7-stage linting and signing process for ATLAS-GATE plans.

---

## Overview

All plans go through `lint_plan()` which:
1. Validates plan structure (Stage 1-5)
2. Runs Spectral linting rules (Stage 6)
3. Creates cosign signature (Stage 7)

Plans MUST pass all stages before they can be executed by WINDSURF.

---

## Stage 1: Structure Validation

**What it checks**:
- All 7 required sections present
- Sections in correct order:
  1. Plan Metadata
  2. Scope & Constraints
  3. Phase Definitions
  4. Path Allowlist
  5. Verification Gates
  6. Forbidden Actions
  7. Rollback / Failure Policy

**Error code**: `PLAN_MISSING_SECTION`, `PLAN_INVALID_STRUCTURE`

**Example failure**:
```
✗ Required section missing: "Phase Definitions"
```

**Fix**: Add the missing section in the correct order.

---

## Stage 2: Phase Validation

**What it checks**:
- Phase Definitions section exists
- All phases have required fields:
  - Phase ID (UPPERCASE_WITH_UNDERSCORES format)
  - Objective
  - Allowed operations
  - Forbidden operations
  - Required intent artifacts
  - Verification commands
  - Expected outcomes
  - Failure stop conditions
- Phase IDs are unique
- Phase ID format is uppercase alphanumeric + underscore

**Error code**: `PLAN_MISSING_FIELD`, `PLAN_INVALID_PHASE_ID`

**Example failures**:
```
✗ Phase "SETUP" missing required field: "Allowed operations"
✗ Invalid Phase ID format: "Phase-1" (must be uppercase alphanumeric + underscore)
```

**Fix**:
- Add all required phase fields
- Use format: `PHASE_NAME` (all caps, underscores only)

---

## Stage 3: Path Validation

**What it checks**:
- Path Allowlist contains only workspace-relative paths
- No absolute paths (no leading `/`)
- No parent directory escapes (`..`)
- No unresolved variables (`${...}`)

**Error code**: `PLAN_PATH_ESCAPE`, `PLAN_INVALID_PATH`

**Example failures**:
```
✗ Absolute path not allowed: "/etc/passwd"
✗ Path escape detected: "../../../src/"
✗ Path escape detected: "${HOME}/src/"
```

**Fix**:
- Use workspace-relative paths: `src/`, `tests/`, `docs/`
- No leading `/`
- No `..` escapes
- No environment variables

---

## Stage 4: Enforceability Validation

**What it checks**:
- No stub/incomplete code markers:
  - TODO, FIXME, XXX, HACK
  - stub, mock, placeholder
  - temp.*implementation
  - "to be implemented", "to be determined"
  - tbd, wip
- No ambiguous language:
  - may, should, if possible
  - optional, try to, attempt to
- No human judgment clauses:
  - "use best judgment"
  - "exercise judgment"

**Error code**: `PLAN_NON_ENFORCEABLE`

**Example failures**:
```
✗ Stub/incomplete code detected (line ~42)
  Plans must contain complete, production-ready implementations.

✗ Non-enforceable language detected (line ~15)
  Plans must use binary language (MUST, MUST NOT, etc.)

✗ Plans cannot include human judgment clauses.
  All rules must be deterministic.
```

**Fix**:
- Remove all stub/incomplete markers
- Replace ambiguous language with binary: MUST, MUST NOT
- Replace judgment clauses with specific rules

---

## Stage 5: Auditability Validation

**What it checks**:
- Objectives are plain English (human-readable)
- No code symbols in objectives:
  - No `${...}` variables
  - No backticks
  - No function/const/let/var keywords
  - No `<tags>`

**Error code**: `PLAN_NON_AUDITABLE`

**Example failure**:
```
✗ Objective contains code symbols (must be plain English)
  Line: "Objective: Implement `validate()` function with JWT-RS256 signing"
```

**Fix**:
- Write objectives as plain English
- Example ✓: "Add JWT authentication to REST API with token validation"
- Example ✗: "Implement `verifyToken()` function"

---

## Stage 6: Spectral Linting

**What it checks**:
Custom OpenAPI/Spectral rules for plan format:
- `plan-required-sections`: All 7 sections present
- `plan-no-stubs`: No stub patterns detected
- `plan-phase-format`: Phase ID format correct (UPPERCASE_WITH_UNDERSCORES)

**Error code**: `SPECTRAL_LINT_ERROR`

**Example output**:
```
✓ plan-required-sections: PASS
✓ plan-no-stubs: PASS
✓ plan-phase-format: PASS
```

**Fix**: 
- Ensure all previous stages pass
- Spectral validates same rules as Stages 1-5

---

## Stage 7: Cosign Signing

**What it does**:
1. Strips HTML comment header (lines 1-5)
2. Strips existing `[COSIGN_SIGNATURE: ...]` footer
3. Canonicalizes plan content:
   - Trims each line
   - Normalizes whitespace
4. Signs canonicalized content with cosign (ECDSA P-256)
5. Returns signature in base64 format
6. Inserts signature into plan header

**Output**: `COSIGN_SIGNATURE: [base64-encoded-signature]`

**Example**:
```
Before:
<!--
ATLAS-GATE_PLAN_HASH: abc123...
COSIGN_SIGNATURE: [generated-during-signing]
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

After linting:
<!--
ATLAS-GATE_PLAN_HASH: abc123...
COSIGN_SIGNATURE: MIGIAkIBz+Qn7vZ9KxJ...
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->
```

**Requirements**:
- Cosign private key must be available (environment variable or file)
- Signature is deterministic (same content → same signature)
- Signature is cryptographically secure (ECDSA P-256)

---

## Verification by WINDSURF

When WINDSURF executes a plan:

1. **Extract Signature**:
   ```
   Extract: COSIGN_SIGNATURE: [base64-string]
   ```

2. **Canonicalize**:
   - Strip HTML comment (lines 1-5)
   - Strip `[COSIGN_SIGNATURE: ...]` footer
   - Trim lines, normalize whitespace

3. **Verify Signature**:
   ```javascript
   verifyBlob({
     payload: Buffer.from(canonicalizedPlan),
     signature: Buffer.from(base64Signature, 'base64'),
     keyPath: publicKeyPath
   })
   ```

4. **Decision**:
   - ✓ Signature valid → Proceed with execution
   - ✗ Signature invalid → STOP, plan rejected

---

## Common Failures

### "Phase ID is not UPPERCASE_WITH_UNDERSCORES"
```
✗ Invalid Phase ID format: "PhaseImplementation"
```
**Fix**: Use `PHASE_IMPLEMENTATION` (all caps, underscores)

### "TODO/FIXME found in plan"
```
✗ Stub/incomplete code detected
  // TODO: implement validation
```
**Fix**: Remove TODO/FIXME, provide complete implementation

### "Ambiguous language"
```
✗ Non-enforceable language detected
  "should validate tokens"
```
**Fix**: Use binary language: "MUST validate tokens"

### "Objective has code symbols"
```
✗ Objective contains code symbols
  "Implement `authMiddleware()` function"
```
**Fix**: Use plain English: "Implement authentication middleware"

### "Signature verification fails"
```
✗ COSIGN_SIGNATURE verification failed
  Public key mismatch or plan was tampered
```
**Fix**: Verify public key matches private key used for signing. Ensure plan wasn't modified.

---

## Workflow Summary

1. **Write Plan**
   - Follow exact 7-section structure
   - Use binary language (MUST, MUST NOT)
   - Write plain English objectives
   - Use uppercase Phase IDs

2. **Run Linting**
   ```bash
   lint_plan({ path: "PLAN_AUTH_V1.md" })
   ```

3. **Fix Errors**
   - Stage 1: Add missing sections
   - Stage 2: Validate phase fields and IDs
   - Stage 3: Fix path allowlist
   - Stage 4: Remove stubs, fix language
   - Stage 5: Write plain English objectives
   - Stage 6: (Automatic if 1-5 pass)
   - Stage 7: (Automatic if 1-6 pass)

4. **Save Signed Plan**
   - Filename: `docs/plans/<PLAN_HASH>.md`
   - Includes `COSIGN_SIGNATURE` in header

5. **Deliver to WINDSURF**
   - Plan path: `docs/plans/<PLAN_HASH>.md`
   - Plan hash: `<PLAN_HASH>` (64 hex chars)
   - Public key: Path to cosign public key

6. **WINDSURF Executes**
   - Verifies cosign signature
   - Executes plan steps
   - Records audit trail

---

**Last Updated**: 2026-02-14
**Status**: Complete linting and signing guide
