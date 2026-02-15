<!--
ATLAS-GATE_PLAN_HASH: a7d4f6b08fbafe2d03d017492368938cde88dce839c61caa3a7f88b5222864d5
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEQCICOwONBXycYKi2xbLJubBf/8bJc0CFdHegWFbNZCkWatAiBTXTfADG5gBPLLeUvfTTT9n2KFd7ofWA/0nkSQsBFv+A==
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_6_V1
Phase ID: PHASE_6
Roadmap reference: docs/roadmap.md (PHASE 6 — Android App (React Native))
Scope summary: Implementation of the Android mobile application interface using React Native and Expo.
Explicit dependencies on PHASE_0–PHASE_5:
- PLAN_PANTRYPILOT_PHASE_0_V1 (Infrastructure)
- PLAN_PANTRYPILOT_PHASE_1_V1 (Inventory Engine)
- PLAN_PANTRYPILOT_PHASE_2_V1 (Pricing Engine)
- PLAN_PANTRYPILOT_PHASE_3_V1 (Meal Layer)
- PLAN_PANTRYPILOT_PHASE_4_V1 (Lunch Engine)
- PLAN_PANTRYPILOT_PHASE_5_V1 (AI Interpretation)

Preserved invariants:
- Inventory math MUST remain deterministic as defined in PHASE_1.
- Currency storage MUST be integer-only (cents/points) as defined in PHASE_2.
- Unit normalization MUST happen in the backend as defined in PHASE_1.
- AI-generated actions MUST be validated by the deterministic layer as defined in PHASE_5.
- Fatigue scores MUST follow the cooldown logic defined in PHASE_4.

# Scope & Constraints

Files to CREATE:
- [NEW] mobile/index.js
- [NEW] mobile/App.js
- [NEW] mobile/app.json
- [NEW] mobile/src/navigation/AppNavigator.js
- [NEW] mobile/src/screens/AuthScreen.js
- [NEW] mobile/src/screens/DashboardScreen.js
- [NEW] mobile/src/screens/InventoryScreen.js
- [NEW] mobile/src/screens/AddItemScreen.js
- [NEW] mobile/src/screens/LogTodayScreen.js
- [NEW] mobile/src/screens/LunchPlannerScreen.js
- [NEW] mobile/src/screens/GroceryListScreen.js
- [NEW] mobile/src/screens/BudgetOverviewScreen.js
- [NEW] mobile/src/services/api.js
- [NEW] mobile/src/services/auth.js
- [NEW] mobile/src/components/VoiceInput.js
- [NEW] mobile/src/hooks/useVoice.js

Files to MODIFY:
- [MODIFY] mobile/package.json

Explicit DELETE policy:
- MUST NOT perform any DELETE operations on existing backend, infra, or docs files.

Hard boundaries of this phase:
- PHASE_6 MUST be limited to the `mobile/` directory and `docs/plans/`.
- UI MUST be a thin client; business logic MUST NOT be implemented in React Native.
- All state modification MUST be performed via API calls to the backend.

PHASE_6 explicitly does NOT include:
- Offline synchronization (Phase 8).
- Multi-household support (Phase 9).
- Live supermarket scraping (Phase 7).
- Desktop/Web client implementation.

# Phase Definitions

## Phase: PHASE_6

Phase ID: PHASE_6
Objective: Create the Android User Interface.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Mobile screens, Navigation components, API services.
Verification commands: npm --prefix mobile run lint
Expected outcomes: Functional Android application connected to backend, supporting all 8 core screens and voice logging.
Failure stop conditions: Linting failure, dependency absence, build error.

Behavioral guarantees:
- Dashboard MUST show consolidated view of inventory and budget.
- Inventory screen MUST allow real-time quantity adjustments.
- Log Today screen MUST support natural language input via text and voice.
- Voice flow MUST implement OS speech-to-text integration.
- Grocery list MUST display reorder recommendations from backend.

Deterministic outcomes:
- Navigation state transitions MUST be predictable.
- API interactions MUST result in UI updates that reflect backend state exactly.

Data ownership boundaries:
- Mobile app owns the ephemeral UI state and user session (JWT).
- Backend retains ownership of all persistent domain data.

Runtime invariants:
- The app MUST NOT bypass authentication for protected routes.
- The app MUST NOT mutate inventory state without a successful API response.

# Path Allowlist

- mobile/index.js
- mobile/App.js
- mobile/app.json
- mobile/src/navigation/AppNavigator.js
- mobile/src/screens/AuthScreen.js
- mobile/src/screens/DashboardScreen.js
- mobile/src/screens/InventoryScreen.js
- mobile/src/screens/AddItemScreen.js
- mobile/src/screens/LogTodayScreen.js
- mobile/src/screens/LunchPlannerScreen.js
- mobile/src/screens/GroceryListScreen.js
- mobile/src/screens/BudgetOverviewScreen.js
- mobile/src/services/api.js
- mobile/src/services/auth.js
- mobile/src/components/VoiceInput.js
- mobile/src/hooks/useVoice.js
- mobile/package.json
- docs/plans/PLAN_PANTRYPILOT_PHASE_6_V1.md

# Verification Gates

Gate 1: Static Analysis
- Command: npm --prefix mobile run lint
- Required: Exit 0.

Gate 2: Dependency Validation
- Command: npm --prefix mobile list expo react-native react-navigation
- Required: All essential mobile dependencies MUST be present.

Gate 3: Build Integrity
- Command: ls mobile/App.js mobile/src/navigation/AppNavigator.js mobile/src/screens/DashboardScreen.js
- Required: Critical files MUST exist.

Gate 4: Scope Enforcement
- Command: git status --porcelain | grep -v "mobile/" | grep -v "docs/plans/"
- Required: MUST be empty.

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify backend code or schemas.
- MUST NOT introduce local SQLite or local storage logic for domain data.
- MUST NOT modify plan files after signing.
- MUST NOT implement simulated responses; MUST use real backend endpoints.
- MUST NOT skip linting or verification gates.
- MUST NOT break invariants from PHASE_0–PHASE_5.

# Rollback / Failure Policy

Rollback Procedure:
1. Revert modifications: git checkout HEAD -- mobile/package.json
2. Remove new files: rm -rf mobile/src/ mobile/App.js mobile/index.js mobile/app.json
3. Verify clean state: git clean -fd mobile/

Failure Handling:
- Mandatory HALT on any verification failure.
- Rollback MUST be performed before any retry.