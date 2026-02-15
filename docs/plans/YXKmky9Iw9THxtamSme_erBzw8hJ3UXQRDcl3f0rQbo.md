<!--
ATLAS-GATE_PLAN_HASH: 6172a6932f48c3d4c7c6d6a64a67bf7ab073c3c849dd45d0443725ddfd2b41ba
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEQCIH/ZQJGVhYbxbU3Z2dC6zrw20uhh+XftI1AstRTbWY/MAiA6bzWJ/wObRSzrxxslyMsyp6yrVdZMVfTWYIZRi7hrjA==
ROLE: WINDSURF
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_5_V1
Phase ID: PHASE_5
Roadmap reference: docs/roadmap.md (PHASE 5 — AI Interpretation Layer)
Scope: .
Scope summary: Implementation of the AI interpretation layer for natural language and voice logging. This includes text parsing, structured action extraction, meal detection, and suggestion engines.
Explicit dependencies on PHASE_0–PHASE_4: PLAN_PANTRYPILOT_PHASE_0_V1, PLAN_PANTRYPILOT_PHASE_1_V1, PLAN_PANTRYPILOT_PHASE_2_V1, PLAN_PANTRYPILOT_PHASE_3_V1, PLAN_PANTRYPILOT_PHASE_4_V1.
Preserved invariants: Deterministic inventory math, Integer-only currency storage, Fixed unit normalization, Unique store definitions, Immutable price snapshots, Fatigue logic consistency.

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/index.js
- [NEW] backend/src/app.js
- [NEW] backend/src/controllers/ai_controller.js
- [NEW] backend/src/services/ai_service.js
- [NEW] backend/src/routes/ai_routes.js
- [NEW] backend/src/utils/action_extractor.js
- [NEW] backend/tests/ai_service.test.js

Files to MODIFY:
- [MODIFY] backend/package.json

Explicit DELETE policy:
- MUST NOT perform any DELETE operations on existing source or documentation files.

Hard boundaries of this phase:
- MUST implement the behavioral logic for parsing natural language into structured actions.
- MUST NOT allow AI to update the database directly.
- MUST validate all AI-extracted actions via the deterministic logic layer (Phase 1-4).
- MUST NOT implement client-side Speech-to-Text (handled by mobile app in Phase 6).
- No cross-phase leakage.

PHASE_5 explicitly does NOT include:
- Multi-household support (Phase 9).
- Live supermarket scraping (Phase 7).
- Persistent AI conversation history storage (beyond stateless logging).

# Phase Definitions

## Phase: PHASE_5

Phase ID: PHASE_5
Objective: Enable natural language and voice logging via structured action extraction.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: AI service, AI controller, AI routes, Action extractor, Unit tests.
Verification commands: npm --prefix backend test backend/tests/ai_service.test.js
Expected outcomes: AI interpretation layer functional, extraction logic verified, suggestion engine working.
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation.
Concrete deliverables: index.js, app.js, ai_controller.js, ai_service.js, ai_routes.js, action_extractor.js.
Behavioral guarantees:
- AI service MUST process raw text and return JSON-structured actions.
- Extraction MUST identify meals, ingredients, and quantities.
- Substitution engine MUST leverage Phase 2 pricing data.
Deterministic outcomes:
- Action extraction MUST be deterministic for identical input when using fixed-seed or non-probabilistic matching.
State transitions introduced:
- AI-proposed actions converted to deterministic state changes.
Data ownership boundaries:
- AI service owns the parsing logic and suggestion engine.
- Deterministic layer (Phase 1-4) retains ownership of DB state.
Runtime invariants:
- AI MUST NOT bypass the Service layer for DB writes.

# Path Allowlist

- backend/src/index.js
- backend/src/app.js
- backend/src/controllers/ai_controller.js
- backend/src/services/ai_service.js
- backend/src/routes/ai_routes.js
- backend/src/utils/action_extractor.js
- backend/tests/ai_service.test.js
- backend/package.json
- docs/plans/PLAN_PANTRYPILOT_PHASE_5_V1.md

# Verification Gates

Gate 1: Schema Integrity
Check: ls backend/src/index.js backend/src/app.js backend/src/controllers/ai_controller.js backend/src/services/ai_service.js backend/src/routes/ai_routes.js backend/src/utils/action_extractor.js backend/tests/ai_service.test.js
Required: Files MUST exist.
Failure: HALT.

Gate 2: Logic Validation
Check: npm --prefix backend test backend/tests/ai_service.test.js
Required: All extraction and suggestion tests MUST pass.
Failure: HALT.

Gate 3: Scope Enforcement
Check: git status --porcelain | grep -v "docs/plans/" | grep -v "backend/src/" | grep -v "backend/package.json" | grep -v "backend/tests/"
Required: MUST NOT show modifications outside allowlist.
Failure: HALT.

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify plan files after initial approval.
- MUST NOT introduce simulated or incomplete implementation logic.
- MUST NOT perform partial implementations of the extraction engine.
- MUST NOT disable verification gates.
- MUST NOT break invariants established in PHASE_0 through PHASE_4.
- MUST NOT expand beyond the roadmap-defined PHASE_5 scope.

# Rollback / Failure Policy

Rollback Procedure:
1. Execute: rm -f backend/src/index.js backend/src/app.js backend/src/controllers/ai_controller.js backend/src/services/ai_service.js backend/src/routes/ai_routes.js backend/src/utils/action_extractor.js backend/tests/ai_service.test.js
2. Execute: git checkout backend/package.json

Verification of clean state:
- Command: git status

Failure Handling:
- Mandatory HALT on any failure.
- NO continuation after rollback without fresh approval.