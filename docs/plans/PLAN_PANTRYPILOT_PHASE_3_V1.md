<!--
ATLAS-GATE_PLAN_HASH: 6d4b99b34c3533ea862ce1ee54f1974579548e9482fef41181e675b61bdaf093
COSIGN_SIGNATURE: MEQCIGKx4PMkV4oF5E4cF2Ow2pzVFtmoWtZ98tQjfDFduwq9AiBhpQeS6cK4KWPtWks5WZnhvz5lLHno3eAgUlUcmljAeg==
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_3_V1
Version: 1.0
Phase ID: PHASE_3
Derived from: docs/roadmap.md (PHASE 3 — Meal Attachment Layer)
Scope summary: Implementation of the Meal Attachment Layer including meal templates, ingredient logs, and inventory deduction logic.
Dependencies: PLAN_PANTRYPILOT_PHASE_0_V1, PLAN_PANTRYPILOT_PHASE_1_V1, PLAN_PANTRYPILOT_PHASE_2_V1
Invariants: Deterministic inventory math, integer-only currency storage, fixed unit normalization.

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/models/meal_template.js
- [NEW] backend/src/models/meal_ingredient.js
- [NEW] backend/src/models/meal_log.js
- [NEW] backend/src/services/meal.js
- [NEW] backend/tests/meal.test.js

Files to MODIFY:
- [MODIFY] backend/package.json

Explicit statement regarding DELETE operations:
- MUST NOT perform any DELETE operations on existing source or documentation files.

Hard scope boundaries:
- MUST NOT implement UI or mobile screens.
- MUST NOT implement AI interpretation (Phase 5).
- MUST NOT implement lunch rotation logic (Phase 4).
- MUST NOT modify core inventory services beyond necessary integration for deduction.
- No cross-phase leakage.
- No feature creep.

# Phase Definitions

## Phase: PHASE_3

Phase ID: PHASE_3
Objective: Implement Meal Attachment Layer ensuring inventory consumption alignment
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Meal models, Meal service, Integration tests
Verification commands: npm --prefix backend test backend/tests/meal.test.js
Expected outcomes: All models implemented, meal cost and deduction verified
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation
Concrete deliverables: meal_template.js, meal_ingredient.js, meal_log.js, meal.js
Required production behaviors: Templates must support multiple ingredients; Logging must deduct from inventory; Costing must use cheapest SKU price; Availability must be validated; Substitutions must be suggested.
State transitions: MealTemplate to MealLog execution; Inventory StockEntry to Consumed status.
Deterministic invariants: Inventory deduction must equal sum of meal ingredients; Meal cost must be reproducible.
Data ownership boundaries: Meal service owns templates and logs; Inventory service owns StockEntry updates.
Runtime behavior guarantees: Meal logging fails atomically on insufficient stock; Inventory state remains consistent.

# Path Allowlist

- backend/src/models/meal_template.js
- backend/src/models/meal_ingredient.js
- backend/src/models/meal_log.js
- backend/src/services/meal.js
- backend/tests/meal.test.js
- backend/package.json
- docs/plans/PLAN_PANTRYPILOT_PHASE_3_V1.md

# Verification Gates

Gate 1: Schema Integrity
Check: ls backend/src/models/meal_template.js backend/src/models/meal_ingredient.js backend/src/models/meal_log.js
Required: Files MUST exist
Failure: HALT

Gate 2: Integration Logic
Check: npm --prefix backend test backend/tests/meal.test.js
Required: All meal tests MUST pass
Failure: HALT

Gate 3: Scope Compliance
Check: git status --porcelain | grep -v "docs/plans/" | grep -v "backend/"
Required: MUST NOT show modifications outside allowlist
Failure: HALT

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify plan files after authority approval.
- MUST NOT introduce simulated or incomplete implementation logic.
- MUST NOT perform partial implementations of inventory deduction.
- MUST NOT disable stock availability validation.
- MUST NOT skip any verification gates.
- MUST NOT expand scope beyond Phase 3.
- MUST NOT break invariants established in earlier phases.

# Rollback / Failure Policy

Rollback Procedure:
1. Execute: rm -f backend/src/models/meal_template.js backend/src/models/meal_ingredient.js backend/src/models/meal_log.js backend/src/services/meal.js backend/tests/meal.test.js
2. Execute: git checkout backend/package.json

Verification of clean state:
- Command: git status

Failure handling:
- Mandatory halt on any verification failure.
- No recovery continuation allowed.