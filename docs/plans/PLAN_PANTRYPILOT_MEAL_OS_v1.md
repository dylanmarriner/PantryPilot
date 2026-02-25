<!--
ATLAS-GATE_PLAN_HASH: e95e0ea990266cd6b356ae724ccc9432e3b3006e182be6975fe586c1d5621cec
COSIGN_SIGNATURE: MEUCIBU7MYiFdKsAy/JHN0PDySrCuoG91ztuB8dNQ+YkqC1cAiEA3ijiklyrF2mbubiZ681Fbf7XZmHZeU2LbNi/SAFwxFc=
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

---
status: APPROVED
plan_id: PLAN_PANTRYPILOT_MEAL_OS_v1
timestamp: 2026-02-22T00:00:00Z
governance: ATLAS-GATE-v1
scope:
  - backend/src/models/
  - backend/src/services/
  - backend/src/controllers/
  - backend/src/routes/
  - backend/src/migrations/
  - mobile/src/screens/
  - mobile/src/services/
  - mobile/src/state/
  - docs/plans/
---

# PLAN_PANTRYPILOT_MEAL_OS_v1

---

## Plan Metadata

* Plan ID: PLAN_PANTRYPILOT_MEAL_OS_v1
* Version: 1.0
* Author: ANTIGRAVITY
* Created: 2026-02-22T00:00:00Z
* Status: APPROVED
* Governance: ATLAS-GATE-v1

---

## Objective

PantryPilot MUST evolve into a deterministic, inventory-aware, budget-aware, kid-personalized Meal & Lunch Planning Operating System.

The system MUST:

* Generate weekly dinner plans
* Generate modular school lunch plans per kid
* Calculate grocery deltas automatically
* Optimize store basket cost
* Prevent repetition via rotation engine
* Enforce allergy and preference rules
* Support leftover chaining
* Maintain strict tenant isolation
* Remain fully deterministic

---

## Current State Analysis

Current repository state:

* Inventory tracking exists
* Basic price scraping exists
* JWT auth exists
* No structured Meal domain model
* No KidProfile model
* No modular Lunch system
* No rotation tracking
* No deterministic scoring engine
* No grocery delta computation
* No leftover chaining logic

Planning intelligence layer does not exist.

All enhancements defined in this plan MUST integrate into existing multi-tenant architecture without violating auth integrity.

## Justification

* This evolution is required to finalize the Meal OS architecture.
* All new logic is deterministic, maintaining existing invariant constraints.

## Expected Outcome

* A robust meal and lunch planning intelligence engine will exist safely inside the tenant-isolated system.

---

# 1. Scope & Constraints

## Affected Files

* backend/src/models/* — Domain expansion
* backend/src/services/* — Intelligence engines
* backend/src/controllers/* — Plan endpoints
* backend/src/routes/* — Route exposure
* backend/src/migrations/* — Schema migration files
* mobile/src/screens/* — Weekly plan UI
* mobile/src/services/* — Plan API client
* mobile/src/state/* — Plan state management

## Out of Scope

* Auth redesign
* Scraper architecture rewrite
* Non-food subsystems
* Payment systems
* External AI providers

## Hard Constraints

* All new planning entities MUST include household_id foreign key
* All queries MUST filter by household_id
* All scoring MUST be deterministic
* All migrations MUST be reversible
* All randomness MUST be seedable
* No N+1 queries SHALL exist in scoring logic
* JWT verification MUST remain enforced
* No placeholder or mock logic SHALL exist
* All costs MUST use fixed decimal precision
* No global mutable state SHALL exist

---

# 2. Implementation Specification

---

## Phase: PHASE_SCHEMA_EXPANSION

Phase ID: PHASE_SCHEMA_EXPANSION
Objective: Introduce planning domain models
Allowed operations: Create models, Create migrations
Forbidden operations: Delete existing tables
Required artifacts: Migration files
Expected outcome: Schema aligned with plan
Failure stop: Migration failure or FK violation

Entities MUST include:

* meal
* meal_ingredient
* lunch_component
* kid_profile
* rotation_log
* weekly_plan
* weekly_plan_item
* price_history
* grocery_basket

Naming convention MUST be snake_case.

Indexes MUST be defined for all FK fields.

---

## Phase: PHASE_MEAL_SCORING_ENGINE

Objective: Deterministic meal scoring

Scoring formula MUST be:

MealScore =
(InventoryMatch × W1) +
(ExpiryBoost × W2) +
(VarietyPenalty × W3) +
(PrepTimeFit × W4) +
(BudgetWeight × W5)

Weights MUST be configurable.

InventoryMatch MUST use batch aggregate queries.

No floating arithmetic drift SHALL occur.

Failure stop: Non-deterministic output detected.

---

## Phase: PHASE_LUNCH_MODULAR_SYSTEM

Lunch MUST consist of 6 slots:

* main
* fruit
* snack
* crunch
* treat
* drink

System MUST:

* Track rotation per slot
* Enforce boredom_threshold
* Enforce allergy filtering
* Enforce inventory availability
* Support seed-based deterministic generation

Failure stop: Any allergy violation or undefined slot.

---

## Phase: PHASE_GROCERY_DELTA_ENGINE

System MUST:

* Compute required ingredient delta
* Enforce minimum stock thresholds
* Aggregate basket totals per store
* Support store comparison

Rounding MUST be consistent and deterministic.

Failure stop: Basket total inconsistency.

---

## Phase: PHASE_LEFTOVER_CHAINING

Meals with leftover_yield > 0 MUST:

* Register derivative eligibility
* Prevent circular chaining
* Respect expiry window

Failure stop: Circular dependency detected.

---

## Phase: PHASE_ROTATION_ENGINE

Rotation rules MUST:

* Penalize items served ≥ boredom_threshold in 14 days
* Boost items not served in 30 days
* Log every served instance

No silent overwrite SHALL occur.

---

## Phase: PHASE_API_FORMALIZATION

Routes MUST include:

* POST /plans/generate
* GET /plans/:week
* GET /plans/suggestions
* POST /plans/commit
* GET /grocery/compare

All routes MUST require JWT.

All routes MUST validate household membership.

Rate limiting MUST be applied.

---

# 3. Path Allowlist

Writes MAY occur only within:

* backend/
* mobile/
* docs/plans/

Any write outside this list MUST be rejected.

---

# 4. Verification Gates

## Gate 1: Migration Integrity

* Up migration succeeds
* Down migration succeeds
* No data loss

## Gate 2: Determinism

* Identical input yields identical output
* No non-seeded randomness

## Gate 3: Security

* All endpoints require JWT
* No cross-tenant access

## Gate 4: Performance

* Weekly plan generation < 500ms baseline dataset

## Gate 5: Integrity

* verify_workspace_integrity returns zero violations

Failure at any gate SHALL halt execution.

---

# 5. Forbidden Actions

* MUST NOT introduce stub code
* MUST NOT use TODO markers
* MUST NOT modify auth layer
* MUST NOT bypass household filtering
* MUST NOT modify files outside allowlist
* MUST NOT skip verification gates

---

# 6. Rollback Procedure

Automatic rollback SHALL occur if:

* Migration fails
* Verification gate fails
* Determinism breaks
* Tenant isolation violated

Rollback steps:

1. Revert modified files via git checkout
2. Revert migrations
3. Re-run tests
4. Log rollback event
5. Halt execution

---

# 7. Success Criteria

PantryPilot SHALL:

* Generate weekly dinner plans
* Generate weekly lunch plans per kid
* Optimize grocery basket cost
* Prevent repetitive lunches
* Enforce allergies
* Respect budget constraints
* Remain fully deterministic
* Maintain tenant isolation
* Pass all verification gates

---
