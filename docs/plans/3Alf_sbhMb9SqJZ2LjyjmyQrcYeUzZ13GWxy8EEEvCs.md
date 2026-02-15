<!--
ATLAS-GATE_PLAN_HASH: dc095ffec6e131bf52a896762e3ca39b242b718794cd9d77196c72f04104bc2b
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEQCIGvIuf7BmyCJihh/o/yiRfO+5QpZxutd2mCoKRyjz8v9AiB5v0W77oKBnvL9byGTNZ1uOEL23tcqQDaZC91Wi2p75w==
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_8_V1
Phase ID: PHASE_8
Roadmap reference: docs/roadmap.md (PHASE 8 — Hybrid Sync Layer)
Scope summary: Implementation of a hybrid synchronization layer to enable offline logging and local node support through bi-directional sync and deterministic conflict resolution.
Explicit dependencies on PHASE_0–PHASE_7:
- PLAN_PANTRYPILOT_PHASE_0_V1 (Infrastructure)
- PLAN_PANTRYPILOT_PHASE_1_V1 (Inventory Engine)
- PLAN_PANTRYPILOT_PHASE_2_V1 (Pricing Engine)
- PLAN_PANTRYPILOT_PHASE_3_V1 (Meal Layer)
- PLAN_PANTRYPILOT_PHASE_4_V1 (Lunch Engine)
- PLAN_PANTRYPILOT_PHASE_5_V1 (AI Interpretation)
- PLAN_PANTRYPILOT_PHASE_6_V1 (Mobile UI)
- PLAN_PANTRYPILOT_PHASE_7_V1 (Scraper Worker)

Preserved invariants:
- Inventory math MUST remain deterministic as defined in PHASE_1.
- Currency MUST be stored as integers (cents) as defined in PHASE_2.
- AI interpretation results MUST NOT update the database without deterministic validation as defined in PHASE_5.
- Scrapers MUST use randomized user-agents and throttling as defined in PHASE_7.

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/controllers/sync_controller.js
- [NEW] backend/src/routes/sync_routes.js
- [NEW] backend/src/services/sync_executor.js
- [NEW] backend/src/models/sync_transaction.js
- [NEW] mobile/src/services/sync_service.js
- [NEW] mobile/src/utils/sync_queue.js
- [NEW] backend/tests/sync_executor.test.js
- [NEW] mobile/tests/sync_service.test.js

Files to MODIFY:
- [MODIFY] backend/src/app.js
- [MODIFY] mobile/src/services/api.js
- [MODIFY] mobile/package.json

Explicit DELETE policy:
- MUST NOT perform any DELETE operations on existing files in workers/, infra/, or docs/.

Hard boundaries of this phase:
- PHASE_8 MUST be limited to `backend/`, `mobile/`, and `docs/plans/`.
- MUST NOT modify existing AI interpretation logic.
- MUST NOT modify existing scraper workers.

What PHASE_8 explicitly does NOT include:
- Multi-household support (Phase 9).
- Role-based permissions (Phase 9).
- Usage analytics (Phase 9).

Non-goals:
- Implementation of a real-time WebSocket sync (long-polling or manual triggers only).
- Resolution of conflicts involving manual database edits outside the application layer.

# Phase Definitions

## Phase: PHASE_8

Phase ID: PHASE_8
Objective: Enable local node support and offline logging via Hybrid Sync Layer.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Sync controller, sync routes, sync executor, sync transaction model, mobile sync service, sync queue utility, and associated tests.
Verification commands: npm --prefix backend run lint && npm --prefix backend test tests/sync_executor.test.js && npm --prefix mobile run lint && npm --prefix mobile test tests/sync_service.test.js
Expected outcomes: Functional bi-directional sync between mobile and backend; offline operations queued and reconciled on reconnection.
Failure stop conditions: Linting failure, test failure, path allowlist violation, or violation of inventory invariants.
Concrete deliverables: Sync API endpoints, transaction tracking schema, mobile sync client, and local offline queue.
Behavioral guarantees:
- The Mobile App MUST queue operations locally when the backend is unreachable.
- Sync Service MUST retry pending operations upon network restoration.
- Sync Executor MUST apply deterministic conflict resolution (e.g., Last Write Wins or version-based).
- Outdated client state MUST NOT overwrite newer server state.
Deterministic outcomes:
- Sync Transactions MUST be logged with timestamps and version numbers.
- Reconciliation MUST result in a consistent state across both mobile and backend.
Data ownership boundaries:
- Mobile owns the local operation queue and client-side sync state.
- Backend owns the authoritative state and the sync transaction log.
Runtime invariants:
- Inventory math operations MUST be re-validated by the backend during sync execution.
- Sync payloads MUST be validated for schema compliance before processing.

# Path Allowlist

- backend/src/controllers/sync_controller.js
- backend/src/routes/sync_routes.js
- backend/src/services/sync_executor.js
- backend/src/models/sync_transaction.js
- backend/src/app.js
- mobile/src/services/sync_service.js
- mobile/src/utils/sync_queue.js
- mobile/src/services/api.js
- mobile/package.json
- backend/tests/sync_executor.test.js
- mobile/tests/sync_service.test.js
- docs/plans/PLAN_PANTRYPILOT_PHASE_8_V1.md

# Verification Gates

Gate 1: Backend Static Analysis
- Command: npm --prefix backend run lint
- Required: Exit 0.

Gate 2: Backend Sync Logic Tests
- Command: npm --prefix backend test tests/sync_executor.test.js
- Required: All sync executor tests MUST pass.

Gate 3: Mobile Static Analysis
- Command: npm --prefix mobile run lint
- Required: Exit 0.

Gate 4: Mobile Sync Logic Tests
- Command: npm --prefix mobile test tests/sync_service.test.js
- Required: All sync service tests MUST pass.

Gate 5: Scope Integrity
- Command: git status --porcelain | grep -v "backend/" | grep -v "mobile/" | grep -v "docs/plans/"
- Required: MUST be empty (ignoring untracked files in allowed directories).

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify existing inventory adjustment math in backend/src/services/inventory.js.
- MUST NOT introduce non-production logic into sync paths.
- MUST NOT disable verification gates.
- MUST NOT modify existing signed plan files.
- MUST NOT use wildcards in the path allowlist.

# Rollback / Failure Policy

Exact file reversion strategy:
1. Revert modifications: git checkout HEAD -- backend/src/app.js mobile/src/services/api.js mobile/package.json
2. Remove created files: rm backend/src/controllers/sync_controller.js backend/src/routes/sync_routes.js backend/src/services/sync_executor.js backend/src/models/sync_transaction.js
3. Remove Mobile files: rm mobile/src/services/sync_service.js mobile/src/utils/sync_queue.js
4. Remove test files: rm backend/tests/sync_executor.test.js mobile/tests/sync_service.test.js
5. Confirm clean state: git status backend/ mobile/ MUST show no changes.

Mandatory halt on failure:
- Any non-zero exit code from a verification gate MUST result in immediate cessation and rollback.
- No continuation after rollback is permitted without plan revision.