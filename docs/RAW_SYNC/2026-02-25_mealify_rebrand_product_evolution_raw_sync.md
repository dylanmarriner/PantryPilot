## RAW SYNC METADATA

Project: Mealify (formerly PantryPilot)
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Build a scalable, subscription-based SaaS platform evolving from PantryPilot into a consumer-facing family food operating system.

Primary focus:

- School lunch planning.
- Weekly dinner planning.
- Grocery cost savings.
- Mental load reduction for families.

Position as:
"Mealify — Your week, handled."

Core value pillars:

- Cost savings.
- Mental load reduction.
- Automated planning with full user control.

---

## 2. DECISIONS MADE

- Project rebranded from PantryPilot to Mealify.
- Tagline selected: "Your week, handled."
- Primary positioning: School Lunch & Weekly Dinner OS for Families.
- Core pillars: Cost savings and mental load reduction.
- Auto-generate week feature will be free.
- Week tab will default to blank state.
- Week tab will include Auto-Generate button.
- All lunches and dinners are always editable.
- Locking mechanism prevents auto-overwrite.
- Lunch model will use flexible list architecture.
- Lunch will not use rigid Main/Snack/Fruit structure.
- Home tab will be time-aware.
- Before 10AM: Lunch primary, Dinner secondary.
- After 10AM: Dinner primary, Lunch secondary.
- Weekend overrides lunch-first logic.
- Receipt scanning will update inventory and price history.
- Grocery tab derives from Week planning.
- Alternatives displayed contextually within lunch/dinner view.
- Auto-generate respects locked meals.
- Rotation health indicator will be simple (not complex scoring UI).
- No dashboard-first home screen.
- No separate suggestions tab.
- Insights tab gated as Premium feature.
- Five-tab bottom navigation limit.
- Everything editable; no forced auto-locking.
- No mascots or playful visual tone.
- Clean, calm, non-gimmicky UI direction.
- Flexible multi-child support required.
- Lunch items must be reorderable.
- Swipe to delete supported.
- Long press to edit quantity.
- Receipt scanning flow includes OCR → parse → review → confirm.
- Savings analytics tied to receipt scanning.
- Auto-generate week produces 5 dinners + 5 school lunches.
- Weekend dinner optional in generation logic.
- Regenerate respects cost band and pantry-first logic.
- Rotation detection based on frequency windows (7-day, 14-day).
- Home screen must load in under 500ms.
- Alternatives pre-fetched for instant rendering.
- Offline mode supports marking cooked/packed.

---

## 3. ARCHITECTURE CHOICES

- Bottom navigation with 5 persistent tabs.
- Time-based UI rendering logic for Home tab.
- Flexible Lunch data model with ordered item list.
- LunchItem includes optional pantry link.
- Internal tagging system for rotation intelligence.
- Locking system at per-meal level.
- Auto-generate algorithm respects constraints.
- Grocery list auto-derived from Week plan.
- Pantry-first optimization logic.
- Receipt scanning pipeline:
  Image → OCR → AI parse → Structured JSON → Review → Inventory update.
- Alternative suggestions via slide-up bottom sheet.
- Regeneration logic maintains similar cost band.
- Repetition score and frequency tracking stored per item.
- ChildProfile model includes dislikes and preferences.
- Drag-to-reorder lunch items.
- Slide-up modals for day detail editing.
- Pre-fetching alternatives for performance.
- Async receipt processing.
- Offline queue for receipt uploads.

---

## 4. FEATURE DEFINITIONS

- Time-aware Home screen prioritization.
- Flexible lunch list per child per day.
- Smart lunch rotation engine.
- Dinner suggestion engine.
- Auto-generate week (free).
- Lock meals to prevent overwrite.
- Contextual alternatives (cheapest / pantry-first / balanced).
- Estimated cost per meal.
- Weekly estimated grocery spend.
- Savings vs previous week calculation.
- Grocery list grouped by category.
- Optimize Basket feature.
- Receipt scanning with editable review screen.
- Pantry inventory with expiry indicator.
- Price history per pantry item.
- Trend arrow indicator for price changes.
- Insights dashboard (Premium).
- Savings this month metric.
- Grocery spend trend metric.
- Lunch rotation health metric.
- Waste reduction metric.
- Multi-child lunch support.
- Drag reorder lunch items.
- Mark Packed / Mark Cooked tracking.
- Budget comparison (estimated vs actual).
- Frequency detection windows (7-day, 14-day).
- Repetition scoring per meal.

---

## 5. CONSTRAINTS IDENTIFIED

- Auto-generate must remain free.
- UI must reduce mental load.
- Must prioritize retention via habit loops.
- Avoid dashboard clutter.
- Avoid rigid lunch structure.
- Limit navigation to 5 tabs.
- No overcomplicated analytics UI.
- Clean, calm visual identity.
- Lean startup team assumption.
- High performance requirement (<500ms home load).
- Must support offline functionality.
- Must avoid decision fatigue reintroduction.
- No feature sprawl.
- Everything editable by user.
- Receipt scanning accuracy dependent on OCR reliability.

---

## 6. REJECTED IDEAS

- PantryPilot as final brand name.
- Foodio as product name.
- Lunchio as product name.
- Rigid lunch structure (Main/Snack/Fruit).
- Dashboard-first home screen.
- Separate suggestions tab.
- Forcing auto-generate as default mandatory plan.
- Overly complex analytics dashboard.
- Cute or mascot-driven brand tone.
- Structured lunch component model.
- Auto-locking meals without user control.

---

## 7. OPEN QUESTIONS

- Should dinner support split meals (adult + child variation)?
- Premium gating details for advanced features beyond Insights.
- Final cost savings calculation model specification.
- Final repetition scoring algorithm.
- Multi-store grocery price comparison implementation.
- B2B or enterprise expansion roadmap.
- Final UI animation system and design tokens.
- Budget ceiling enforcement logic.
- Handling multiple dietary profiles at dinner level.

---

## 8. POTENTIAL CANON CANDIDATES

- Mealify brand name.
- Tagline: "Your week, handled."
- Time-aware Home tab logic.
- Blank Week tab with Auto-Generate.
- Flexible lunch list architecture.
- Locking mechanism per meal.
- Auto-generate is free.
- Contextual alternatives panel.
- Five-tab navigation limit.
- Lunch rotation intelligence.
- Pantry-first optimization principle.
- Receipt scan → inventory + price history loop.
- Cost savings + mental load as core pillars.
- No dashboard-first UI.
- Everything editable.
- Pre-fetch alternatives for instant UX.
- Performance requirement (<500ms home load).
- Calm, non-gimmicky brand direction.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – Rebranded PantryPilot to Mealify.
2026-02-25 – Selected tagline "Your week, handled."
2026-02-25 – Committed to School Lunch & Weekly Dinner OS positioning.
2026-02-25 – Core value pillars locked: Cost savings + Mental load reduction.
2026-02-25 – Auto-generate week feature designated free.
2026-02-25 – Week tab defaults to blank state.
2026-02-25 – Lunch model defined as flexible ordered list.
2026-02-25 – Home tab time-aware logic defined (before/after 10AM).
2026-02-25 – Alternatives must be contextual within meal view.
2026-02-25 – Five-tab navigation cap established.
2026-02-25 – Everything editable; no forced locking.
2026-02-25 – Receipt scanning flow defined with review step.
2026-02-25 – Locking prevents auto-generate overwrite.
2026-02-25 – No structured lunch template enforced.
2026-02-25 – Insights tab designated Premium feature.

---

End of extraction.
