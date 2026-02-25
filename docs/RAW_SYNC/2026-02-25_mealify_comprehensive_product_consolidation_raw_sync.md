## RAW SYNC METADATA

Project: PantryPilot / Mealify
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Build a slightly opinionated, pantry-aware weekly meal planning system that reduces family food planning stress by generating draft weeks (lunches and dinners), learning from behavior, tracking pantry inventory, generating missing-only grocery lists, and supporting multi-store NZ price comparison, first as a web app and later as a mobile app, starting as a personal family tool and evolving into NZ SaaS.

---

## 2. DECISIONS MADE

Dinners use soft repetition control, not hard exclusion.

Lunch repetition penalties are stronger than dinner repetition penalties.

System presents a draft week that the user tweaks.

System learns implicitly from behavior.

Explicit meal flags supported: "Family Favourite", "Never Again", "Over It For Now".

Pantry and fridge inventory are tracked.

Low-stock items trigger suggestion to add to shopping list.

Grocery list is generated only after meals are locked.

Grocery list auto-updates in real time when meals are changed.

Week supports adjustable number of dinners (e.g., 6 dinners).

Meals are atomic; changing one day does not regenerate entire week.

Grocery list shows only missing ingredients.

Inventory is deducted only when meals are marked cooked/packed.

Soft reminder is shown if dinner is not marked cooked.

Home screen prioritizes lunch or dinner based on time of day.

Home screen supports horizontal swipe between days.

Swap alternatives appear in a bottom sheet.

Explore Mode activates after multiple swaps in a session.

Explore Mode is visibly indicated in UI.

Explore Mode influences long-term learning.

Learning is per child for lunches and per household for dinners.

Users are separated by account.

Household members share dinner weights and week planning.

Either adult in a household can edit week or days.

Changes show "last updated by" indicator.

Grocery session becomes immutable record when marked complete.

Completed shops move to shop history.

New grocery items after completion go to a fresh grocery list.

Previous shops are editable.

Editing previous shop creates ledger correction entries.

Price display shows last paid price prominently.

Average price per unit is displayed in smaller text.

Price intelligence remains passive and only affects cost calculations.

System tone is slightly opinionated.

Full multi-store NZ price scraping is selected.

Initial price engine hardcodes 3–5 core pantry products.

Web app is built first, mobile app later.

Stack selected: Next.js 14, Tailwind, TypeScript, PostgreSQL, Prisma.

Scraping planned via Playwright.

Background jobs planned via BullMQ + Redis.

Local development prioritized before VPS.

---

## 3. ARCHITECTURE CHOICES

Three-layer identity model: User → Household → ChildProfile.

Dinner learning stored at household level.

Lunch learning stored per child profile.

Pantry implemented as append-only ledger model.

Inventory derived from sum of ledger entries.

Week model with lock state.

Grocery sessions with status lifecycle (planning / shopping / completed).

Shop history records include items, quantities, prices, store, timestamp.

Shop edits generate correction ledger entries.

Canonical product model with store-specific mappings.

Price snapshot table with timestamped records.

Unit normalization to base units (e.g., price per litre, per kg).

Planner reads from daily price snapshot, not live scraper.

Scrapers implemented per store, not universal parser.

Explore Mode triggered by swap_count threshold.

Learning weights updated via accepted vs rejected counts.

Learning weights decay over time.

Home screen time-aware rendering logic.

Horizontal day navigation via snap swipe.

Bottom sheet pattern for meal swaps.

Stack: Next.js App Router, Tailwind CSS, TypeScript, Node, PostgreSQL, Prisma.

Background job queue for scheduled scraping.

Monorepo approach initially.

---

## 4. FEATURE DEFINITIONS

Generate draft week with configurable number of dinners and fixed 5 lunches.

Swap meals per day without reshuffling entire week.

Real-time grocery delta on meal swap.

Missing-only grocery list generation.

Multi-store grocery basket total comparison.

Pantry quantity tracking with thresholds.

Low-stock detection and suggestion prompt.

Mark meal as cooked/packed to deduct inventory.

Soft reminder if meal not marked cooked.

Per-child lunch rotation tracking.

Explore Mode with visible indicator.

Slightly opinionated nudges (repetition, budget, expiry).

Price display: last paid + average per unit.

Shop lifecycle: planning → shopping → completed → archived.

Editable shop history with correction tracking.

Household shared editing with "last updated by" indicator.

Horizontal swipe navigation across days.

Time-aware primary meal display.

Hardcoded initial canonical products for price engine.

Scheduled daily price scraping.

Unit-normalized price comparison.

---

## 5. CONSTRAINTS IDENTIFIED

Planner must not trigger live scraping.

Grocery list must not include pantry items already in stock.

Inventory must not be deducted on week lock.

Shop history must preserve ledger integrity.

Price normalization must use base units.

Scraping must handle anti-bot protections.

Performance requirement: swaps must feel instant.

UI must remain uncluttered.

Explore Mode must respect explicit exclusions.

System must separate household data by household_id.

Backend must enforce membership checks.

Stack must support later mobile app integration.

---

## 6. REJECTED IDEAS

Hard banning meals used last week.

Regenerating entire week on single meal change.

Displaying full ingredient list including pantry items in grocery list.

Deducting pantry inventory when week is locked.

Invisible Explore Mode behavior.

Restricting week edits behind multi-user approval.

Mutating shop history without ledger correction.

Active price steering that biases meal ranking aggressively.

Full catalog ingestion before validating core products.

Mobile-first build.

Live scraping on meal swap.

OAuth/auth complexity in initial phase.

---

## 7. OPEN QUESTIONS

Final decision on handling negative inventory states when deduction exceeds stock.

Final confirmation of local-first vs VPS-first environment for build (prompted but not answered in thread).

Exact scope boundary for polished UI in MVP.

Receipt scanning implementation timeline.

Conflict handling if two users edit simultaneously beyond last-write-wins.

---

## 8. POTENTIAL CANON CANDIDATES

Pantry ledger must be append-only and inventory derived from ledger.

Inventory deducted only when meal marked cooked/packed.

Grocery list shows missing ingredients only.

Planner reads from price snapshot table, never live scraping.

Dinner learning per household; lunch learning per child.

Explore Mode triggers after multiple swaps and is visibly indicated.

Price intelligence remains passive and only affects cost calculation.

Shop lifecycle separation: planning vs completed immutable history.

Multi-store scraping architecture with canonical product mapping and unit normalization.

Time-aware home screen prioritization.

Atomic meal model with localized recalculation.

Household-level shared editing without approval gating.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – Dinners use soft repetition control rather than hard exclusion.
2026-02-25 – Grocery list generated only after week lock and shows missing items only.
2026-02-25 – Inventory deducted only when meals are marked cooked/packed.
2026-02-25 – Explore Mode activates after multiple swaps and is visibly indicated.
2026-02-25 – Dinner learning stored per household; lunch learning stored per child.
2026-02-25 – Grocery sessions become immutable upon completion but remain editable via correction entries.
2026-02-25 – Price display prioritizes last paid price with smaller average per unit.
2026-02-25 – Price intelligence remains passive and does not aggressively steer meal selection.
2026-02-25 – Full multi-store NZ scraping selected with initial hardcoded core products.
2026-02-25 – Web app built first using Next.js, Tailwind, PostgreSQL, Prisma.
2026-02-25 – Planner must never trigger live scraping; use daily snapshot model.

---

End of extraction.
