# DECISIONS.md

Project: PantryPilot / Mealify  
Purpose: Structured Summary of Active Decisions (Non-chronological)

---

## 1. PLANNING MODEL

- Week is generated as a draft.
- User tweaks meals before locking.
- Week supports adjustable number of dinners.
- Meals are atomic; swapping one day does not regenerate entire week.
- Grocery list recalculates in real time when meals change.

---

## 2. INVENTORY MODEL

- Pantry is ledger-based (append-only).
- Inventory is derived from sum of ledger entries.
- Inventory deduction occurs only when:
  - Dinner marked cooked.
  - Lunch marked packed.
- Week lock does not deduct inventory.
- Shop edits create correction ledger entries.

---

## 3. GROCERY MODEL

- Grocery list displays missing ingredients only.
- Pantry items are not displayed in grocery list.
- Grocery lifecycle:
  - Planning
  - Shopping
  - Completed
  - Archived
- Completed shops move to history.
- New shortages after completion go to a new grocery session.
- Previous shop records remain editable.

---

## 4. LEARNING MODEL

- Learning is implicit by default.
- Explicit flags supported:
  - Family Favourite
  - Never Again
  - Over It For Now
- Dinner learning stored at household level.
- Lunch learning stored per child.
- Explore Mode triggers after repeated swaps.
- Explore Mode is visibly indicated.
- Learning weights decay over time.

---

## 5. PRICE MODEL

- Multi-store NZ scraping selected.
- Initial rollout limited to 3–5 canonical products.
- Canonical product → Store product mapping model.
- Prices normalized to base unit.
- Planner reads from daily snapshot only.
- Price intelligence remains passive.
- UI displays:
  - Last paid price (primary)
  - Average price per unit (secondary)

---

## 6. SHARED HOUSEHOLD MODEL

- Users are isolated by default.
- All data scoped by household_id.
- Adults have equal edit permissions.
- Shared edits display "last updated by".
- No approval gating for changes.

---

## 7. UI PRINCIPLES

- Home screen is time-aware.
- Horizontal swipe navigation across days.
- Bottom sheet for swap interactions.
- Minimal clutter on home screen.
- Slightly opinionated tone.

---

## 8. STACK

Frontend:

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript

Backend:

- Next.js API routes (initial)
- PostgreSQL
- Prisma ORM

Scraping:

- Playwright
- Per-store workers
- Scheduled daily jobs

Background Jobs:

- BullMQ + Redis

Web app first.
Mobile app after engine stability.

---

STATUS: ACTIVE
