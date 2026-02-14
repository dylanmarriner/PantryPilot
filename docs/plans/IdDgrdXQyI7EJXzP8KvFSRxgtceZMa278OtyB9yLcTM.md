<!--
ATLAS-GATE_PLAN_HASH: 21d0e0add5d0c88ec4257ccff0abc5491c60b5c79931adbbf0eb7207dc8b7133
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEMCHxaEn286jycgGlJI5qFN0BZZzc8r0O/wmuSUFiMiaF8CIBmvrnu/I3K3bfT3A6rYDyV3Ndv9M0H7kM4+m3/x+g/z
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_4_V1
Phase ID: PHASE_4
Roadmap reference: docs/roadmap.md (PHASE 4 — Lunch Variation Engine)
Scope summary: Implementation of the Lunch Variation Engine including data models for slots, preferences, and fatigue logic.
Explicit dependencies on earlier phases: PLAN_PANTRYPILOT_PHASE_0_V1, PLAN_PANTRYPILOT_PHASE_1_V1, PLAN_PANTRYPILOT_PHASE_2_V1, PLAN_PANTRYPILOT_PHASE_3_V1
Preserved invariants: Deterministic inventory math, Integer-only currency storage, Fixed unit normalization, Unique store definitions, Immutable price snapshots.

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/models/lunch_slot.js
- [NEW] backend/src/models/item_preference.js
- [NEW] backend/src/models/fatigue_score.js
- [NEW] backend/src/models/acceptance_score.js
- [NEW] backend/src/services/lunch_engine.js
- [NEW] backend/tests/lunch_engine.test.js

Files to MODIFY:
- [MODIFY] backend/package.json

Explicit DELETE policy:
- MUST NOT perform any DELETE operations on existing source or documentation files.

Boundaries of this phase:
- MUST implement the behavioral logic for lunch rotation and fatigue management.
- MUST NOT implement UI or mobile screens.
- MUST NOT implement Phase 5 AI interpretation features.
- MUST NOT modify Phase 1-3 core logic beyond necessary integration points.

Cross-phase leakage:
- NO cross-phase leakage is permitted.

Feature creep:
- NO feature creep beyond the defined roadmap scope is permitted.

PHASE_4 does NOT include:
- Voice logging or natural language processing.
- Multi-household support.
- External API integrations for pricing.

# Phase Definitions

## Phase: PHASE_4

Phase ID: PHASE_4
Objective: Solve lunch boredom and rotation intelligently through data-driven scores.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Lunch models, Lunch engine service, Unit tests.
Verification commands: npm --prefix backend test backend/tests/lunch_engine.test.js
Expected outcomes: All models implemented, fatigue logic verified, stock-aware rotation functioning.
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation.
Concrete deliverables: lunch_slot.js, item_preference.js, fatigue_score.js, acceptance_score.js, lunch_engine.js.
Required production behaviors: Fatigue MUST increment upon selection; Fatigue MUST decrement via cooldown logic; Rotation MUST be stock-aware; Rotation MUST be price-aware.
Deterministic outcomes: Rotation suggestions MUST be reproducible given the same state and seed.
Data ownership boundaries: Lunch engine service owns slot and preference data.
Runtime behavior guarantees: Logic MUST NOT update inventory directly; it MUST only read state.

# Path Allowlist

- backend/src/models/lunch_slot.js
- backend/src/models/item_preference.js
- backend/src/models/fatigue_score.js
- backend/src/models/acceptance_score.js
- backend/src/services/lunch_engine.js
- backend/tests/lunch_engine.test.js
- backend/package.json
- docs/plans/PLAN_PANTRYPILOT_PHASE_4_V1.md

# Verification Gates

Gate 1: Schema Integrity
Check: ls backend/src/models/lunch_slot.js backend/src/models/item_preference.js backend/src/models/fatigue_score.js backend/src/models/acceptance_score.js
Required: Files MUST exist
Failure: HALT

Gate 2: Logic Validation
Check: npm --prefix backend test backend/tests/lunch_engine.test.js
Required: All lunch engine tests MUST pass
Failure: HALT

Gate 3: Scope Enforcement
Check: git status --porcelain | grep -v "docs/plans/" | grep -v "backend/"
Required: MUST NOT show modifications outside allowlist
Failure: HALT

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify plan files after initial approval.
- MUST NOT introduce simulated or incomplete implementation logic.
- MUST NOT perform partial implementations of the rotation engine.
- MUST NOT disable verification gates.
- MUST NOT break invariants established in PHASE_0 through PHASE_3.
- MUST NOT expand beyond the roadmap-defined PHASE_4 scope.

# Rollback / Failure Policy

Rollback Procedure:
1. Execute: git checkout backend/package.json
2. Execute: rm -f backend/src/models/lunch_slot.js backend/src/models/item_preference.js backend/src/models/fatigue_score.js backend/src/models/acceptance_score.js backend/src/services/lunch_engine.js backend/tests/lunch_engine.test.js

Verification of clean state:
- Command: git status

Failure Handling:
- Mandatory HALT on any failure.
- NO continuation after rollback without fresh approval.