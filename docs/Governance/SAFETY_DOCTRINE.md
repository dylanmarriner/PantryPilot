# SAFETY_DOCTRINE.md

Project: PantryPilot / Mealify  
Status: System Safety & Integrity Guardrails

---

## 1. DATA SAFETY

All data must be scoped by household_id.

Backend must enforce:

- User-household membership validation.
- No cross-household data exposure.
- No client-side trust assumptions.

Failure to enforce scope = critical breach.

---

## 2. INVENTORY INTEGRITY

Pantry is append-only ledger.

Prohibited:

- Direct stock mutation.
- Silent overwrites.
- Negative stock without correction record.

All inventory adjustments must create ledger entries.

Inventory must always be derivable from ledger history.

---

## 3. PRICE SAFETY

Planner must not:

- Trigger live scraping.
- Block UI on scraper jobs.
- Modify ranking aggressively based on price.

Scraper runs in scheduled background jobs only.

Price snapshots must be timestamped.

If snapshot is stale:
UI must indicate last updated time.

---

## 4. PERFORMANCE SAFETY

Swap interactions must feel instant.

Constraints:

- No synchronous heavy computations in UI thread.
- No network-bound recalculations during swap.
- Alternatives must be precomputed.

Perceived delay threshold target:
< 200ms for swap updates.

---

## 5. LEARNING SAFETY

Learning must not:

- Permanently eliminate meals without explicit exclusion.
- Create irreversible bias.
- Override explicit flags.

Learning weights must decay over time.

Explicit overrides always supersede implicit learning.

---

## 6. SHARED HOUSEHOLD SAFETY

Adults have equal edit rights.

To prevent confusion:

- "Last updated by" indicator required.
- Last write wins with version validation.
- No multi-step approval flows introduced in Phase 1.

---

## 7. UI SAFETY

Home screen must remain uncluttered.

Prohibited on home:

- Grocery list display.
- Analytics dashboards.
- Aggressive budget warnings.
- Ads or monetization banners.

Bottom sheet swap interaction must preserve context.

---

## 8. SCRAPING SAFETY

Scrapers must:

- Respect reasonable request limits.
- Avoid authenticated scraping.
- Avoid paywall bypass.
- Use conservative scheduling (daily).

Scraping must not degrade store infrastructure.

---

## 9. ERROR SAFETY

If:

- Price unavailable
- Ingredient price missing
- Snapshot stale

System must:

- Degrade gracefully.
- Continue planning.
- Mark price as "not tracked yet."

Planner must never block due to missing price data.

---

## 10. SCOPE SAFETY

Do not:

- Expand catalog before core products are stable.
- Begin mobile build before API stability.
- Add advanced analytics before planner stability.

Engine stability precedes expansion.

---

SAFETY STATUS: ACTIVE ENFORCEMENT
