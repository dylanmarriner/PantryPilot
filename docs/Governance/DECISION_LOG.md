# DECISION_LOG.md

Project: PantryPilot / Mealify  
Format: Chronological Record of Locked Decisions

---

2026-02-25 – Dinners use soft repetition control rather than hard exclusion.

2026-02-25 – Lunch repetition penalties are stronger than dinner penalties.

2026-02-25 – System presents a draft week that users tweak before locking.

2026-02-25 – Grocery list is generated only after meals are locked.

2026-02-25 – Grocery list shows missing ingredients only.

2026-02-25 – Grocery list auto-updates in real time when meals are changed.

2026-02-25 – Inventory is deducted only when meals are marked cooked or packed.

2026-02-25 – Soft reminder is used if dinner is not marked cooked.

2026-02-25 – Explore Mode triggers after two swaps in a session.

2026-02-25 – Explore Mode is visibly indicated in the UI.

2026-02-25 – Explore Mode influences long-term learning weights.

2026-02-25 – Dinner learning is stored per household.

2026-02-25 – Lunch learning is stored per child profile.

2026-02-25 – Adults within a household have equal edit permissions.

2026-02-25 – "Last updated by" indicator is displayed for shared edits.

2026-02-25 – Completed grocery sessions are archived as shop history.

2026-02-25 – Shop history remains editable but edits create correction ledger entries.

2026-02-25 – Pantry inventory is implemented as an append-only ledger.

2026-02-25 – Planner reads from daily price snapshot table, not live scraping.

2026-02-25 – Price display shows last paid price prominently with average per unit secondary.

2026-02-25 – Price intelligence remains passive and does not aggressively steer meal ranking.

2026-02-25 – Multi-store NZ price scraping selected as architecture path.

2026-02-25 – Initial price engine rollout uses 3–5 core canonical products.

2026-02-25 – Web application is built first; mobile application follows engine stability.

2026-02-25 – Stack locked: Next.js 14, Tailwind, TypeScript, PostgreSQL, Prisma.

2026-02-25 – Scraping engine to use Playwright with per-store workers.

2026-02-25 – Planner must never trigger live scraping in swap or home flows.

---

STATUS: ACTIVE DECISION RECORD
