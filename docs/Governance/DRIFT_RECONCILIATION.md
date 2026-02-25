# DRIFT_RECONCILIATION.md

Project: PantryPilot / Mealify  
Purpose: Guardrails Against Architectural and Behavioral Drift

---

## 1. INVENTORY DRIFT

### Risk:

Inventory becomes inaccurate due to silent mutation, missed deductions, or overwritten history.

### Controls:

- Pantry is append-only ledger.
- No direct stock mutation permitted.
- All shop edits generate correction entries.
- Week lock does not affect inventory.
- Inventory derived from SUM(ledger deltas).

### Drift Signal:

- Negative stock without correction.
- Pantry quantity mismatches between devices.
- Manual edits bypass ledger.

---

## 2. PRICE DRIFT

### Risk:

Planner begins using live scraping or price bias silently influences meal ranking.

### Controls:

- Planner reads only from price snapshot table.
- Scraping runs on scheduled background job.
- Price intelligence is passive.
- Meal ranking logic must not increase weight for "cheap" items beyond cost constraint.

### Drift Signal:

- Swap triggers scraping.
- Meal suggestions cluster unnaturally around discounted items.
- Snapshot timestamps older than acceptable window.

---

## 3. LEARNING DRIFT

### Risk:

Weights accumulate permanently and fossilize preferences.

### Controls:

- Learning weights decay over time.
- Explicit overrides override implicit learning.
- Explore Mode respects exclusions.
- Repetition penalties remain soft unless explicitly banned.

### Drift Signal:

- Meals never reappear after temporary rejection.
- Explore Mode becomes default behavior.
- Household dinner bias becomes overly narrow.

---

## 4. UI DRIFT

### Risk:

Home screen accumulates analytics, grocery clutter, and feature creep.

### Controls:

- Home shows only:
  - Primary meal (time-aware)
  - Secondary preview
- No grocery list on home.
- No analytics dashboard on home.
- Bottom sheet preserves context.

### Drift Signal:

- More than two primary visual blocks on home.
- Push notifications increase without purpose.
- Swap interaction navigates away from context.

---

## 5. SCOPE DRIFT

### Risk:

Expanding into full catalog ingestion before core engine stability.

### Controls:

- Hardcoded canonical products first.
- Catalog expansion phased.
- Web app fully stable before mobile build.
- Scraper layer isolated from planner.

### Drift Signal:

- Schema changes weekly.
- Engine refactors required before week planning feels stable.
- Mobile build begins before API stability.

---

## 6. SHARED HOUSEHOLD DRIFT

### Risk:

Adding complex permission hierarchies or approval flows.

### Controls:

- Adults have equal edit rights.
- Changes visible via "last updated by".
- Last write wins with version check.

### Drift Signal:

- Edit approval flows added.
- Role-based locking introduced prematurely.
- Conflict handling becomes multi-step process.

---

## 7. PERFORMANCE DRIFT

### Risk:

Planner becomes sluggish due to synchronous heavy operations.

### Controls:

- No live scraping in UI flow.
- Swaps must use precomputed alternatives.
- Heavy computation backgrounded.

### Drift Signal:

- Swap > 200ms perceived delay.
- Home screen waits on network-heavy calls.

---

STATUS: ACTIVE DRIFT CONTROL
