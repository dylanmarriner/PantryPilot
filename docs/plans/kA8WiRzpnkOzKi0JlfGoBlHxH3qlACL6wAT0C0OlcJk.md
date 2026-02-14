<!--
ATLAS-GATE_PLAN_HASH: 900f16891ce99e43b32a2d0995f1a80651f11f7aa50022fac004f40b43a57099
COSIGN_SIGNATURE: MEYCIQCf8WhOXFt7+p8xDIITx/Y4Z+fCypGQUOfg8rdeLDABsQIhAL3fmfd6fRKt7Jh4O53cS0iYLISrB3Qd62qZJL3+yma8
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_1_V2
Version: 2.0
Author: ANTIGRAVITY
Status: APPROVED
Timestamp: 2026-02-14T15:10:00Z
Governance: ATLAS-GATE-v2

---

# Scope & Constraints

Objective: Implement the Core Data and Inventory Engine for PantryPilot as defined in Phase 1 of the roadmap. This includes establishing the deterministic stock logic, unit normalization layer, and all core grocery-first data models.

Affected Files:
- backend/src/models/household.js: Define Household data model
- backend/src/models/user.js: Define User data model
- backend/src/models/item.js: Define Item, Category, and Location models
- backend/src/models/stock.js: Define StockEntry, Unit, and Expiry models
- backend/src/services/unit_converter.js: Implement g/kg and ml/L normalization logic
- backend/src/services/inventory_service.js: Implement add, adjust, and deduct operations
- backend/tests/unit_converter.test.js: Unit tests for deterministic math
- backend/tests/inventory.test.js: Functional tests for inventory operations
- backend/package.json: Update dependencies for database and math handling

Out of Scope:
- AI interpretation layer
- Pricing engine features
- Mobile UI implementation
- Meal planning logic

Constraints:
- MUST build on PHASE_0 foundational outputs
- MUST ensure all inventory math is 100% deterministic (no floating point for quantities)
- MUST implement alias mapping for items (e.g., "mince" to "beef mince")
- MUST handle partial usage and reorder thresholds
- MUST NOT include meal planning logic or AI components
- MUST define verification commands that execute existing backend tests
- MUST NOT include implementation code in the Phase fields

---

# Phase Definitions

## Phase: PHASE_1_CORE_ENGINE

Phase ID: PHASE_1_CORE_ENGINE
Objective: Build the deterministic inventory brain and core data schemas
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Backend models, Service logic, Comprehensive unit tests
Verification commands: npm --prefix backend install && npm --prefix backend test
Expected outcomes: All models implemented and 100% test pass rate for inventory logic
Failure stop conditions: Test failure, Syntax errors, Path allowlist violation

---

# Path Allowlist

- backend/
- docs/plans/
- package.json

---

# Verification Gates

## Gate 1: Model Integrity
Trigger: After data models are defined
Check: node --check backend/src/models/*.js
Required: Valid JavaScript syntax for all model files
Failure: REJECT and ROLLBACK

## Gate 2: Logic Determinism
Trigger: After service implementation
Check: npm --prefix backend test backend/tests/unit_converter.test.js
Required: 100% pass rate for unit conversion and normalization
Failure: REJECT and ROLLBACK

## Gate 3: Integrity Check
Trigger: Before approval
Check: Verify only files in backend/ and docs/plans/ were modified
Required: Zero violations
Failure: REJECT

---

# Forbidden Actions

- DELETE any foundation files created in Phase 0
- MODIFY files outside the backend directory or plans directory
- Use floating point math for currency or critical stock amounts
- Include AI-related libraries or logic
- Write incomplete service implementations
- Skip verification commands or gates

---

# Rollback / Failure Policy

## Triggers
1. Verification gate failure
2. Modification of files outside the Path Allowlist
3. Detection of ambiguous terms in Plan
4. Test failure in critical inventory logic

## Procedure
1. git checkout backend/ package.json
2. Delete any newly created files in backend/docs/ and backend/src/
3. Verify directory state matches pre-execution baseline
4. Log failure in audit-log.jsonl

## Recovery
1. Review test output and audit logs
2. Fix logic errors or model definitions
3. Resubmit the plan for linting and approval