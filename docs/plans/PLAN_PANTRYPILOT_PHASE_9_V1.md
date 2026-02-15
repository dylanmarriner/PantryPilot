<!--
ATLAS-GATE_PLAN_HASH: c6d5fd58cec3a5b58201d6ced2b241ec876810ebe6358777e6c377db0aee233f
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEUCICikzWRyc7p2tSTnSuC5QesXoat58wqGkyG7q9N0xsvfAiEAvv4+ygiFhPWSiDqefF+lgepzs1mGc1sd955MGTnmyhw=
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_9_V1
Phase ID: PHASE_9
Roadmap reference: docs/roadmap.md (PHASE 9 — Product-Ready Expansion)
Scope summary: Implementation of multi-household support, role-based permissions, subscription schemas, feature flags, usage analytics, cost savings dashboard, and export reports.
Explicit dependencies on PHASE_0–PHASE_8:
- PLAN_PANTRYPILOT_PHASE_0_V1 (Infrastructure)
- PLAN_PANTRYPILOT_PHASE_1_V1 (Inventory Engine)
- PLAN_PANTRYPILOT_PHASE_2_V1 (Pricing Engine)
- PLAN_PANTRYPILOT_PHASE_3_V1 (Meal Layer)
- PLAN_PANTRYPILOT_PHASE_4_V1 (Lunch Engine)
- PLAN_PANTRYPILOT_PHASE_5_V1 (AI Interpretation)
- PLAN_PANTRYPILOT_PHASE_6_V1 (Mobile UI)
- PLAN_PANTRYPILOT_PHASE_7_V1 (Scraper Worker)
- PLAN_PANTRYPILOT_PHASE_8_V1 (Hybrid Sync Layer)

Preserved invariants:
- Inventory math MUST remain deterministic as defined in PHASE_1.
- Currency MUST be stored as integers (cents) as defined in PHASE_2.
- AI interpretation results MUST NOT update the database without deterministic validation as defined in PHASE_5.
- Scrapers MUST use randomized user-agents and throttling as defined in PHASE_7.
- Bi-directional sync MUST use deterministic conflict resolution as defined in PHASE_8.

# Scope & Constraints

Files to CREATE:
- [NEW] backend/src/models/user.js
- [NEW] backend/src/models/role.js
- [NEW] backend/src/models/user_household.js
- [NEW] backend/src/models/feature_flag.js
- [NEW] backend/src/models/usage_analytics.js
- [NEW] backend/src/services/analytics_service.js
- [NEW] backend/src/services/export_service.js
- [NEW] mobile/src/screens/HouseholdManagerScreen.js
- [NEW] mobile/src/screens/AnalyticsScreen.js
- [NEW] backend/tests/auth.test.js
- [NEW] backend/tests/permissions.test.js
- [NEW] backend/tests/analytics.test.js

Files to MODIFY:
- [MODIFY] backend/src/models/household.js
- [MODIFY] backend/src/models/index.js
- [MODIFY] mobile/src/screens/AuthScreen.js
- [MODIFY] mobile/src/navigation/AppNavigator.js

Explicit DELETE policy:
- MUST NOT perform DELETE operations on existing legacy files in backend/, mobile/, or workers/.
- MUST NOT delete prior phase plan files.

Hard boundaries of this phase:
- PHASE_9 MUST be limited to `backend/`, `mobile/`, and `docs/plans/`.
- MUST NOT modify core inventory math in `backend/src/services/inventory.js`.
- MUST NOT modify bi-directional sync logic in `backend/src/services/sync_executor.js`.

What PHASE_9 explicitly does NOT include:
- Multi-domain hosting support.
- External payment gateway integration (schema only).
- Real-time collaboration via WebSockets.

Non-goals:
- Implementation of a custom reporting engine beyond CSV/PDF exports.
- Native iOS specific UI components.

# Phase Definitions

## Phase: PHASE_9

Phase ID: PHASE_9
Objective: Scale PantryPilot to a SaaS-capable multi-household platform with structured governance.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: User, Role, and UserHousehold models; Analytics and Export services; Household management and Analytics mobile screens.
Verification commands: npm --prefix backend run lint && npm --prefix backend test tests/auth.test.js && npm --prefix backend test tests/permissions.test.js && npm --prefix backend test tests/analytics.test.js
Expected outcomes: Functional RBAC, multi-household associations, SaaS-ready schema, usage analytics, and reporting.
Failure stop conditions: Linting failure, test failure, path allowlist violation, or violation of inventory invariants.
Concrete deliverables: Multi-household junction schema, role-based access control (RBAC), subscription-ready metadata, feature flags, usage tracking, cost analytics dashboard, and export utilities.
Behavioral guarantees:
- Users MUST be able to belong to multiple households.
- Access to household data MUST be restricted by Role assignments.
- Feature availability MUST be governed by Household-level feature flags.
- Export reports MUST reflect deterministic stock and pricing state.
Deterministic outcomes:
- Role checks MUST exit non-zero for unauthorized operations.
- Analytics logs MUST be immutable once written.
State transitions introduced:
- Transition from single-household ownership to multi-household association.
- Transition from anonymous/implicit authentication to explicit RBAC.
Data ownership boundaries:
- Household owns its inventory and pricing data.
- User owns their personal profile and household membership credentials.
Runtime invariants:
- Every API request MUST validate user-household membership.
- Subscription status MUST be checked before accessing flagged features.

# Path Allowlist

- backend/src/models/user.js
- backend/src/models/role.js
- backend/src/models/user_household.js
- backend/src/models/feature_flag.js
- backend/src/models/usage_analytics.js
- backend/src/services/analytics_service.js
- backend/src/services/export_service.js
- backend/src/models/household.js
- backend/src/models/index.js
- mobile/src/screens/HouseholdManagerScreen.js
- mobile/src/screens/AnalyticsScreen.js
- mobile/src/screens/AuthScreen.js
- mobile/src/navigation/AppNavigator.js
- backend/tests/auth.test.js
- backend/tests/permissions.test.js
- backend/tests/analytics.test.js
- docs/plans/PLAN_PANTRYPILOT_PHASE_9_V1.md

# Verification Gates

Gate 1: Schema Integrity
- Command: npm --prefix backend run lint
- Required: Exit 0.

Gate 2: Authentication & Multi-Household Tests
- Command: npm --prefix backend test tests/auth.test.js
- Required: All authentication and multi-household association tests MUST pass.

Gate 3: RBAC Enforcement
- Command: npm --prefix backend test tests/permissions.test.js
- Required: All Role-Based Access Control tests MUST pass.

Gate 4: Analytics Logic
- Command: npm --prefix backend test tests/analytics.test.js
- Required: Usage tracking and aggregator tests MUST pass.

Gate 5: Scope Validation
- Command: git status --porcelain | grep -v "backend/" | grep -v "mobile/" | grep -v "docs/plans/"
- Required: MUST be empty.

# Forbidden Actions

- Writing outside the explicit path allowlist.
- Modifying signed plan files (PHASE_0-PHASE_8).
- Introducing non-production logic for authentication or authorization.
- Disabling deterministic inventory validation in ANY service.
- Modifying existing sync logic from PHASE_8.
- Introducing production secrets into the codebase.

# Rollback / Failure Policy

Exact file reversion strategy:
1. Revert modifications: git checkout HEAD -- backend/src/models/household.js backend/src/models/index.js mobile/src/screens/AuthScreen.js mobile/src/navigation/AppNavigator.js
2. Remove created files: rm backend/src/models/user.js backend/src/models/role.js backend/src/models/user_household.js backend/src/models/feature_flag.js backend/src/models/usage_analytics.js backend/src/services/analytics_service.js backend/src/services/export_service.js mobile/src/screens/HouseholdManagerScreen.js mobile/src/screens/AnalyticsScreen.js backend/tests/auth.test.js backend/tests/permissions.test.js backend/tests/analytics.test.js
3. Confirm clean state: git status backend/ mobile/ MUST show no changes.

Mandatory halt on failure:
- Any non-zero exit code from a verification gate MUST result in immediate cessation and rollback.
- No continuation after rollback is permitted without plan revision.