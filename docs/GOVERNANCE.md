# PantryPilot Governance Documentation

## Overview

PantryPilot uses the ATLAS-GATE v2 governance system to ensure plan validation, signature enforcement, and controlled execution of development phases.

## ATLAS-GATE v2 System

### Purpose

The ATLAS-GATE system provides:

- Signed, hash-addressed development plans
- Immutable path allowlists for operations
- Verification gates for quality assurance
- Rollback procedures for failure recovery

### Plan Structure

Every ATLAS-GATE plan must contain:

1. **Plan Metadata**

   - Plan ID and version
   - Author and status
   - Timestamp and governance version

2. **Scope & Constraints**

   - Clear objective definition
   - Affected files list
   - Out-of-scope items
   - Implementation constraints

3. **Phase Definitions**

   - Phase ID and objective
   - Allowed/forbidden operations
   - Required artifacts
   - Verification commands
   - Expected outcomes

4. **Path Allowlist**

   - Immutable list of allowed paths
   - All operations must stay within allowlist
   - Violations trigger immediate halt

5. **Verification Gates**

   - Syntax integrity checks
   - Structure validation
   - Governance alignment verification

6. **Forbidden Actions**

   - DELETE operations (unless explicitly allowed)
   - Modifications outside allowlist
   - Placeholder code or TODOs
   - Arbitrary command execution

7. **Rollback / Failure Policy**

   - Clear failure triggers
   - Step-by-step rollback procedure
   - Recovery guidelines

### Signature Verification

All plans must be cryptographically signed using Cosign:

- Plans contain a COSIGN_SIGNATURE in the header
- Signature verification is required before execution
- Unsigned plans are rejected automatically

### Execution Protocol

The WINDSURF executor follows a strict protocol:

1. **Session Initialization**

   - Validate workspace root
   - Confirm plan path
   - Verify Cosign public key

2. **Plan Loading**

   - Validate HTML header format
   - Check all required sections
   - Extract metadata and signatures

3. **Signature Verification**

   - Verify plan signature with public key
   - Halt on verification failure

4. **Path Allowlist Enforcement**

   - Create immutable allowlist
   - Validate all file operations
   - Immediate halt on violations

5. **File Operations**

   - Execute only CREATE/MODIFY operations
   - Reject any content with placeholders
   - Audit log after each write

6. **Verification Gates**

   - Run all defined verification commands
   - All must return exit code 0
   - Failure triggers rollback

7. **Final Integrity Check**

   - Confirm only allowlisted paths modified
   - Validate audit log entries
   - Ensure no unauthorized changes

## Phase 0 Foundation

The current phase establishes:

- Monorepo structure
- Docker configuration
- VPS provisioning scripts
- CI pipeline baseline
- Governance documentation

### Verification Commands

Phase 0 requires successful execution of:
```bash
docker-compose -f infra/docker-compose.yml config
bash -n infra/provision_vps.sh
ls -d backend mobile infra workers docs plans
```

## Security Considerations

1. **Path Isolation**: All operations are restricted to allowlisted paths

2. **Signature Enforcement**: No execution without valid signature

3. **Audit Trail**: All operations are logged to audit-log.jsonl

4. **Rollback Capability**: Immediate rollback on any failure

5. **No Placeholders**: Implementation must be complete, no TODOs

## Compliance

- All plans must follow grocery-first architecture principles

- Meal planning logic is explicitly forbidden in early phases

- Ubuntu 24.04 is the target deployment environment

- Verification commands must exist in the execution environment

## Audit Log

All operations are recorded in `audit-log.jsonl` with:

- Timestamp
- Operation type
- File path
- Plan authority
- Role
- Purpose
- Intent
- Failure modes

This ensures complete traceability of all changes made under ATLAS-GATE governance.
