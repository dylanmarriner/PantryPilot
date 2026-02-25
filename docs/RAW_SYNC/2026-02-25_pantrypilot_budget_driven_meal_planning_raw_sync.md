## RAW SYNC METADATA

Project: PantryPilot
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Build a grocery-first family meal planning system that:

- Generates meal suggestions from a weekly budget input.
- Rotates kids' lunches intelligently to prevent repetition and boredom.
- Tracks pantry inventory and deducts stock automatically from logged meals.
- Produces grocery lists from generated plans.
- Reduces cognitive load for families managing food and budgeting.
- Potentially operates as a paid NZ-focused SaaS product.

---

## 2. DECISIONS MADE

- PantryPilot will be budget-driven, not recipe-first.
- The system must support kids lunch rotation logic.
- Inventory must support unit conversion and stock deduction.
- Lunch rotation should consider frequency and repetition.
- Budget must influence meal selection.
- Inventory suggestions include low stock and expiry detection.
- Planner requires structured output (dinners, lunches, grocery list, cost summary).
- Rotation logic must be stateful to be meaningful.
- System should support grocery list generation from plan.
- Product positioning is "pantry autopilot" rather than generic meal planner.
- Budget enforcement must be constraint-based, not advisory-only.
- Planner should be deterministic rather than pure heuristic.
- Lunch rotation requires cooldown rules and frequency tracking.
- Plan generation must integrate budget + inventory + preferences.
- System must reduce weekly mental load meaningfully to be sellable.
- Plan generator API endpoint should exist (e.g., `/api/ai/generate-plan`).
- Budget solver should potentially use knapsack/constraint logic.
- Persistent rotation history storage is required for real rotation.
- Inventory deduction must occur from logged meals.
- Grocery list must derive from missing ingredients in plan.
- Product viability tied to NZ household use case.
- Initial commercial target: $8–12/month subscription.
- MVP must allow full loop: set budget → generate plan → see grocery list → log meals → update inventory.

---

## 3. ARCHITECTURE CHOICES

- Backend: Express.js.
- ORM: Sequelize.
- Service-based structure (e.g., `InventoryService`, `AIService`).
- Route-based API structure (`/api/ai`, `/api/inventory`, etc.).
- Mobile frontend: React Native (Expo).
- Plan logic encapsulated in backend services.
- Scoring model for meals:
  - InventoryMatch (35%)
  - ExpiryUsage (20%)
  - Cost (20%)
  - Variety (15%)
  - TimeFit (10%)

- Lunch generator categorizes items by slot (Main, Fruit, Snack, Treat, Drink).
- Inventory engine supports base-unit conversions.
- Suggestion logic based on low stock and expiry detection.
- Potential knapsack-style solver for budget enforcement.
- Planner architecture envisioned as:
  - Pantry State Engine
  - Price Intelligence Engine
  - Meal Engine
  - Substitution Engine
  - Budget Guardrail Engine

---

## 4. FEATURE DEFINITIONS

- Weekly budget input.
- Household size input.
- Kid profiles with preferences and boredom flags.
- Lunch rotation system.
- Meal scoring algorithm.
- Expiry detection.
- Low stock detection.
- Suggest purchase suggestions.
- Structured weekly plan output:
  - Dinners
  - Lunches per kid
  - Grocery list
  - Projected cost
  - Budget remaining

- Inventory deduction from logged meals.
- Grocery list generation from missing ingredients.
- Persistent rotation log per child.
- Cost consideration in meal scoring.
- Plan generation endpoint.
- State-aware lunch rotation.
- Inventory impact preview from plan.
- Weekly meal schedule matrix.
- Budget guardrail logic.
- Constraint-driven meal selection.
- NZ-focused grocery context.

---

## 5. CONSTRAINTS IDENTIFIED

- NZ grocery market size (~1.8M households).
- Scraping supermarket pricing may be technically or legally complex.
- Budget enforcement must be solver-based to be meaningful.
- Mobile and backend API must align contractually.
- Rotation requires persistent state storage.
- Inventory must support conversion logic.
- Commercial viability requires meaningful mental load reduction.
- Budget logic must operate on total cost, not post-hoc warning.
- System must remain usable by non-technical families.
- Category competition (meal planners, shopping list apps).
- Planner must integrate inventory and cost coherently.
- Must avoid becoming "just CRUD".
- No plan endpoint originally visible.
- Statefulness required for meaningful rotation.
- Cost data source not yet defined.

---

## 6. REJECTED IDEAS

- Budget as advisory-only warning.
- Pure heuristic meal suggestion without constraint enforcement.
- Stateless random lunch selection.
- Treating product as generic "meal planner".
- Overbuilding scraping before core pantry engine works.
- Selling current CRUD-level implementation.
- Ignoring budget constraint solving.
- Rotation without memory.

---

## 7. OPEN QUESTIONS

- Does updated repo contain a true constraint-solving planner?
- Is budget enforcement strict or advisory?
- Does plan generation endpoint exist in updated repo?
- Is rotation history persisted in database?
- Does logging trigger automatic inventory deduction?
- Is grocery list generation implemented?
- Is mobile ↔ backend contract aligned?
- Is cost data sourced or mocked?
- Does plan generation return structured weekly schedule?
- Is knapsack or other solver implemented?
- Does planner integrate lunches + dinners into unified cost model?

---

## 8. POTENTIAL CANON CANDIDATES

- PantryPilot is budget-first, not recipe-first.
- Planner must be constraint-driven.
- Lunch rotation must be stateful.
- Inventory deduction must be automatic from logs.
- Product positioning: "pantry autopilot".
- Weekly plan = dinners + lunches + grocery list + cost summary.
- Budget enforcement must be solver-based.
- Full-loop MVP required for viability.
- Inventory unit conversion engine required.
- Rotation requires cooldown + frequency tracking.
- Mental load reduction is primary product metric.
- NZ household market focus.
- System architecture framed as modular engines.
- Plan generator as core transformation engine.
- Grocery list derived from plan gaps.
- Avoid becoming CRUD application.
- Constraint solving central to differentiation.
- Rotation memory per child mandatory for authenticity.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – PantryPilot defined as budget-driven planner, not recipe-first app.
2026-02-25 – Lunch rotation must be stateful and persistent.
2026-02-25 – Budget enforcement must be constraint-based, not advisory.
2026-02-25 – Planner must output structured weekly plan including grocery list and cost summary.
2026-02-25 – Inventory must deduct automatically from logged meals.
2026-02-25 – Product positioning shifted to "pantry autopilot."
2026-02-25 – Knapsack-style solver proposed for meal budget optimization.
2026-02-25 – MVP must support full loop: budget → plan → grocery list → log → inventory update.

---

End of extraction.
