<!--
ATLAS-GATE_PLAN_HASH: 340bb13981c5d1adf59bc6103c9bf2bd8b20b6f7dc986740d17e73642b29eb10
COSIGN_SIGNATURE: MEUCIHTaAr8UPfIZVtZ0ve7INBkmGU7doL30yPhMlI01m6ygAiEA2KzICsAAaUTHuWJvd0r7fFwaJVhWFbJE5tJY/sf3dIk=
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_2_V1
Version: 1.0
Phase ID: PHASE_2
Derived from: docs/roadmap.md (PHASE 2 — Pricing Engine)
Scope summary: Implementation of the pricing engine including store and SKU management.
Dependencies: PLAN_PANTRYPILOT_PHASE_0_V1, PLAN_PANTRYPILOT_PHASE_1_V1

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/models/store.js
- [NEW] backend/src/models/sku.js
- [NEW] backend/src/models/price_snapshot.js
- [NEW] backend/src/services/pricing.js
- [NEW] backend/tests/pricing.test.js
- [NEW] workers/src/jobs/nightly_sync.js
- [NEW] workers/tests/nightly_sync.test.js

Files to MODIFY:
- [MODIFY] backend/package.json
- [MODIFY] workers/package.json

Hard scope boundaries:
- MUST NOT implement web scraping or any external API integrations.
- MUST NOT implement UI components or mobile screens.
- MUST NOT use floating point numbers for currency; MUST use integers.
- MUST NOT modify Phase 1 inventory logic beyond integration points.

# Phase Definitions

## Phase: PHASE_2

Phase ID: PHASE_2
Objective: Implement the Pricing Engine and basket simulation logic
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Pricing models, Pricing service, Nightly job framework
Verification commands: npm --prefix backend test && npm --prefix workers test
Expected outcomes: All models implemented, pricing math verified, nightly job skeleton ready
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation
Concrete deliverables: store.js, sku.js, price_snapshot.js, pricing.js, nightly_sync.js
Required production behaviors: Price-per-unit calculation, Cheapest basket simulation, Historical comparison
Explicit invariants: Stores MUST be unique by name/location, SKUs MUST link to existing Items
State transitions: Price records MUST be immutable snapshots; PriceHistory MUST be derived
Deterministic outcomes: Basket total calculation MUST be consistent across identical inputs

# Path Allowlist

- backend/src/models/store.js
- backend/src/models/sku.js
- backend/src/models/price_snapshot.js
- backend/src/services/pricing.js
- backend/tests/pricing.test.js
- backend/package.json
- workers/src/jobs/nightly_sync.js
- workers/tests/nightly_sync.test.js
- workers/package.json
- docs/plans/PLAN_PANTRYPILOT_PHASE_2_V1.md

# Verification Gates

Gate 1: Model Existence
Check: ls backend/src/models/store.js backend/src/models/sku.js backend/src/models/price_snapshot.js
Required: Files MUST exist
Failure: HALT

Gate 2: Service Logic
Check: npm --prefix backend test
Required: All pricing tests MUST pass
Failure: HALT

Gate 3: Worker Reliability
Check: npm --prefix workers test
Required: Nightly job framework tests MUST pass
Failure: HALT

Gate 4: Scope Integrity
Check: git status
Required: MUST NOT show modifications outside allowlist
Failure: HALT

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify existing plans in docs/plans/.
- MUST NOT introduce simulated or incomplete logic.
- MUST NOT include development markers or unfinished notes.
- MUST NOT skip any verification gates.
- MUST NOT disable validation logic.
- MUST NOT expand scope beyond Phase 2.

# Rollback / Failure Policy

## Automatic Rollback Triggers
1. Verification gate failure
2. Path allowlist violation
3. Hash mismatch in execution
4. Syntax errors in implemented files

## Rollback Procedure
1. Execute: git checkout backend/package.json workers/package.json
2. Delete: backend/src/models/store.js backend/src/models/sku.js backend/src/models/price_snapshot.js backend/src/services/pricing.js backend/tests/pricing.test.js workers/src/jobs/nightly_sync.js workers/tests/nightly_sync.test.js
3. Verify clean state via git status
4. Log failure in audit-log.jsonl