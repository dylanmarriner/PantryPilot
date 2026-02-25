## RAW SYNC METADATA

Project: PantryPilot
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Create PantryPilot as a grocery-first meal planning system with pantry, fridge, and freezer stock tracking, price scraping from supermarket URLs, daily consumption logging, school lunch alternative suggestions, and VPS-hosted hybrid architecture suitable as both a family tool and future SaaS product.

---

## 2. DECISIONS MADE

PantryPilot name selected.
Architecture chosen as VPS-hosted hybrid system.
Grocery-first approach confirmed.
Phased development structure (PHASE_0 through PHASE_9) established.
ATLAS-GATE governance enforced for all planning and execution.
All plans must be cosign-signable.
All plans must use 7-section ATLAS-GATE structure.
All Windsurf executions must use atlas-gate.begin_session.
All Windsurf executions must use atlas-gate.write.
All Windsurf executions must validate audit log after each write.
No mock data allowed in execution.
No stub code allowed in execution.
No placeholder logic allowed in execution.
No TODO or FIXME allowed in execution.
Verification gates must exit non-zero on failure.
Fail-closed rollback policy required for every phase.
Phase_7 defined as scraper worker implementation.
Phase_8 defined as hybrid sync layer implementation.
Phase_9 defined as multi-household SaaS expansion.
Currency must be stored as integer cents.
Inventory math must remain deterministic.
AI results must not mutate database without deterministic validation.
Scrapers must use randomized user-agents and throttling.
Bi-directional sync must use deterministic conflict resolution.
Workers directory must not be modified outside defined scope in relevant phases.
Signed plan hash must be validated before execution.
Cosign signature must be validated before execution.

---

## 3. ARCHITECTURE CHOICES

Monorepo structure:

backend/
mobile/
workers/
infra/
docs/
plans/

Backend: Node.js application.
Mobile: React Native (Expo-based).
Workers: Playwright-based scrapers.
Hybrid sync layer between mobile and backend.
RBAC model introduced in Phase_9.
Multi-household schema introduced in Phase_9.
Feature flag system introduced in Phase_9.
Usage analytics service introduced in Phase_9.
Export service (CSV/PDF) introduced in Phase_9.
Deterministic inventory validation enforced at backend layer.
Mobile must not duplicate inventory math logic.
Mobile offline queue for sync introduced in Phase_8.
Backend authoritative state enforced in Phase_8.

---

## 4. FEATURE DEFINITIONS

Price scraping from Woolworths, New World, Pak'nSave.
Scraper service with throttling and randomized user-agents.
Nightly sync job for scraping.
Hybrid sync layer with offline queue support.
Mobile offline operation queuing.
Bi-directional sync with deterministic conflict resolution.
User model.
Role model.
UserHousehold junction model.
FeatureFlag model.
UsageAnalytics model.
Analytics service.
Export service.
HouseholdManagerScreen (mobile).
AnalyticsScreen (mobile).
RBAC enforcement for API access.
Multi-household association support.
Subscription-ready schema (no payment gateway integration).
Immutable analytics logging.
Cost savings dashboard (referenced in Phase_9).
Verification gates per phase.
Fail-closed rollback strategy per phase.

---

## 5. CONSTRAINTS IDENTIFIED

No mock logic permitted.
No stub logic permitted.
No placeholder text permitted.
All execution must use ATLAS-GATE tools.
No direct filesystem writes allowed in Windsurf.
Signed plan must be validated before execution.
Cosign signature required before execution.
Workers scope restricted to worker phase only.
Sync layer must not modify inventory math.
RBAC must not modify inventory math.
Currency stored as integer cents only.
No WebSocket real-time sync in Phase_8.
No external payment gateway integration in Phase_9.
No multi-domain hosting in Phase_9.
No modification of signed plan files.
Scope integrity must be validated using git status filters.
Delete operations forbidden unless explicitly allowed.
Mobile must not own authoritative inventory state.
Backend must revalidate sync operations.
Analytics logs must be immutable.

---

## 6. REJECTED IDEAS

Real-time WebSocket sync in Phase_8.
External payment gateway integration in Phase_9.
Multi-domain hosting support in Phase_9.
Native iOS-specific UI components in Phase_9.
Manual database edits outside application layer for conflict resolution.
DELETE operations during Phase_8 and Phase_9.
Modifying inventory math in later phases.
Modifying sync executor in Phase_9.

---

## 7. OPEN QUESTIONS

Whether further hardening is required for RBAC middleware enforcement scanning.
Whether subscription gate assertion tests should be added.
Whether analytics immutability validator should be enforced.
Whether additional anti-bot detection gates should be added to scraper worker.
Whether version vector enforcement is required in sync layer.
Whether replay-attack prevention validation is required in sync layer.

---

## 8. POTENTIAL CANON CANDIDATES

Inventory math MUST remain deterministic.
Currency MUST remain integer cents.
AI interpretation MUST NOT mutate database without deterministic validation.
Scrapers MUST use randomized user-agents and throttling.
Sync MUST use deterministic conflict resolution.
Backend MUST be authoritative state.
Mobile MUST queue offline operations.
RBAC MUST validate every API request against user-household membership.
Analytics logs MUST be immutable.
All plans MUST follow ATLAS-GATE 7-section structure.
All executions MUST validate plan hash before execution.
All executions MUST validate cosign signature before execution.
All writes MUST use atlas-gate.write.
Audit log MUST be validated after every write.
Fail-closed rollback mandatory for every phase.
No mock/stub/placeholder code in production paths.
Workers, sync, inventory, and pricing invariants must not be modified cross-phase.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – PantryPilot designated as grocery-first hybrid VPS system.
2026-02-25 – ATLAS-GATE governance mandated for all phases.
2026-02-25 – Phase_7 defined as scraper worker implementation.
2026-02-25 – Phase_8 defined as hybrid sync layer.
2026-02-25 – Phase_9 defined as SaaS expansion with RBAC and multi-household support.
2026-02-25 – Deterministic inventory math invariant locked.
2026-02-25 – Currency storage standardized to integer cents.
2026-02-25 – No mock/stub/placeholder rule enforced globally.
2026-02-25 – Cosign signature validation required prior to execution.
2026-02-25 – Fail-closed rollback mandated for all execution phases.

End of extraction.
