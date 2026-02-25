# ROADMAP.md

Project: PantryPilot / Mealify  
Status: Phase-Structured Execution Plan

---

## PHASE 0 – FOUNDATION (Local Dev)

Objectives:

- Initialize Next.js 14 project.
- Configure PostgreSQL.
- Integrate Prisma ORM.
- Define core schema:
  - User
  - Household
  - ChildProfile
  - Meal
  - Ingredient
  - PantryLedger
  - Week
  - WeekMeals
  - GrocerySession
  - GroceryItems
- Seed 10 dinners and 10 lunches.
- Basic week planner page renders.

Exit Criteria:

- Draft week renders from database.
- Horizontal day swipe works.
- Basic swap interaction stub works.

---

## PHASE 1 – CORE PLANNER ENGINE

Objectives:

- Draft week generation logic.
- Adjustable dinner count.
- Swap bottom sheet.
- Explore Mode (session-level).
- Repetition soft control.
- Lock week flow.
- Missing-only grocery list calculation.
- Real-time grocery delta on swap.

Exit Criteria:

- User can generate, swap, and lock week.
- Grocery list updates instantly.
- No full-week reshuffle on single swap.

---

## PHASE 2 – PANTRY LEDGER

Objectives:

- Append-only PantryLedger implementation.
- Mark cooked/packed deduction logic.
- Soft reminder for unmarked meals.
- Low-stock detection.
- Threshold-based suggestion prompts.

Exit Criteria:

- Inventory reflects execution, not planning.
- Pantry stock derived solely from ledger.
- Ledger corrections function correctly.

---

## PHASE 3 – GROCERY LIFECYCLE

Objectives:

- Shopping session state machine.
- Start shopping mode.
- Mark shop complete.
- Archive shop history.
- Editable previous shop with correction entries.
- "Last updated by" indicator.

Exit Criteria:

- Shop history preserved.
- Corrections append ledger entries.
- New shortages create new grocery session.

---

## PHASE 4 – PRICE ENGINE (CORE PRODUCTS)

Objectives:

- CanonicalProduct model.
- StoreProductMapping model.
- PriceSnapshot table.
- Base-unit normalization logic.
- Playwright scraper for:
  - Woolworths NZ
  - New World
  - PAK'nSAVE
- Daily scheduled scraping.
- Basket comparison per store.

Scope Limit:
3–5 core canonical pantry products.

Exit Criteria:

- Weekly grocery basket shows per-store totals.
- Planner reads snapshot only.
- No live scraping in UI flow.

---

## PHASE 5 – LEARNING REFINEMENT

Objectives:

- Long-term weight decay.
- Explicit override persistence.
- Explore Mode weight expansion logic.
- Category-level learning.

Exit Criteria:

- Week 2 differs meaningfully from Week 1.
- Explore Mode influences future drafts.

---

## PHASE 6 – POLISH & STABILITY

Objectives:

- UI refinement.
- Performance optimization (<200ms swap response).
- Version checks for concurrent edits.
- Error handling.
- Snapshot freshness indicators.
- Minor accessibility improvements.

Exit Criteria:

- Stable weekly use for multiple cycles.
- No schema churn.
- No ledger inconsistencies.

---

## PHASE 7 – MOBILE EXPANSION

Prerequisite:
All prior phases stable.

Objectives:

- Extract stable API layer.
- Build React Native or PWA mobile client.
- Reuse backend.
- Preserve swipe + bottom sheet UX patterns.

Exit Criteria:

- Mobile parity with web.
- No architectural rewrites required.

---

ROADMAP STATUS: ACTIVE EXECUTION FRAME
