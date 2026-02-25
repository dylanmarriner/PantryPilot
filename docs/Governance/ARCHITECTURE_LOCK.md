# ARCHITECTURE_LOCK.md

Project: PantryPilot / Mealify
Status: LOCKED STRUCTURAL DOCTRINE (Phase 1 Web)

---

## 1. CORE MODEL

System is structured around three identity layers:

User
↳ Household
↳ ChildProfile

Dinner learning exists at Household level.
Lunch learning exists at ChildProfile level.
Users are isolated by default and only access data via household membership.

All queries must be scoped by household_id.

---

## 2. MEAL PLANNING ENGINE

Meals are atomic units.

Changing one meal:

- Does not regenerate entire week.
- Only recalculates grocery totals and cost.

Week lifecycle:
Draft → Tweaked → Locked

Inventory is NOT deducted at lock.

---

## 3. INVENTORY MODEL

Pantry is implemented as an append-only ledger.

No direct stock mutation allowed.

Inventory is derived as:
SUM(all ledger deltas per ingredient)

Inventory deduction occurs ONLY when:

- Meal marked cooked
- Lunch marked packed

Shop edits generate correction ledger entries.
Historical records are never silently overwritten.

---

## 4. GROCERY SYSTEM

Grocery list shows ONLY missing ingredients.

Missing quantity =
Required total - Pantry stock

Grocery lifecycle:
Planning → Shopping → Completed → Archived

Completed shops:

- Frozen into history
- Editable via correction entries
- Do not retroactively mutate planning state

New shortages after shop completion go to a new grocery session.

---

## 5. PRICE ENGINE

Planner reads ONLY from price snapshot table.
Planner NEVER triggers live scraping.

Price architecture:
CanonicalProduct
↳ StoreProductMapping
↳ PriceSnapshot (timestamped)

All price comparisons normalized to base units.

Displayed price:
Primary: Last paid price
Secondary: Average price per base unit

Price intelligence is passive.
It affects cost calculations but does not aggressively steer meal ranking.

---

## 6. LEARNING SYSTEM

Implicit learning via:

- Swap events
- Accepted meals
- Cooked/packed confirmation
- Repetition frequency

Explicit overrides:

- Family Favourite
- Never Again
- Over It For Now

Explore Mode:

- Triggered after 2 swaps in a session
- Visible in UI
- Expands candidate diversity
- Respects explicit exclusions

Learning weights decay over time.

---

## 7. UI PRINCIPLES

Home screen:

- Time-aware prioritization
- Horizontal swipe between days
- Bottom sheet for swaps
- Minimal clutter

No analytics or grocery clutter on home.

System tone:
Slightly opinionated, never authoritarian.

---

## 8. SCRAPING ARCHITECTURE

Per-store scraper workers.
No universal parser.

Daily scheduled scraping.
No live scraping in planner flow.

Initial rollout uses 3–5 canonical core products.
Catalog expansion is phased.

---

## 9. STACK (PHASE 1)

Frontend:
Next.js 14 (App Router)
Tailwind CSS
TypeScript

Backend:
Next.js API routes (initially)
PostgreSQL
Prisma ORM

Background jobs:
BullMQ + Redis

Scraping:
Playwright

Web app first.
Mobile app after engine stability.

---

ARCHITECTURE STATUS: LOCKED FOR PHASE 1
