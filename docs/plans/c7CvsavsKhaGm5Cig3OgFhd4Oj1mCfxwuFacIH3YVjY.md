<!--
ATLAS-GATE_PLAN_HASH: 73b0afb1abec2a16869b90a28373a01617783a3d6609fc70b8569c207dd85636
ATLAS-GATE_PLAN_SIGNATURE: PENDING_SIGNATURE
COSIGN_SIGNATURE: MEYCIQD3G0qif+mxVf1aiVcy0Q3jqo6RIhI9XiB4fwUsotu11gIhAJwP+FCq5P21CDjs/fgVZ32G0eIOhb2x6+NnnfjfqwrV
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_7_V1
Phase ID: PHASE_7
Roadmap reference: docs/roadmap.md (PHASE 7 — Automated Scraping Worker)
Scope summary: Implementation of an automated pricing worker using Playwright to scrape NZ supermarket data, detect sales, and update the pricing engine.
Explicit dependencies on PHASE_0–PHASE_6:
- PLAN_PANTRYPILOT_PHASE_0_V1 (Infrastructure)
- PLAN_PANTRYPILOT_PHASE_1_V1 (Inventory Engine)
- PLAN_PANTRYPILOT_PHASE_2_V1 (Pricing Engine Models)
- PLAN_PANTRYPILOT_PHASE_3_V1 (Meal Layer)
- PLAN_PANTRYPILOT_PHASE_4_V1 (Lunch Engine)
- PLAN_PANTRYPILOT_PHASE_5_V1 (AI Interpretation)
- PLAN_PANTRYPILOT_PHASE_6_V1 (Mobile UI)

Preserved invariants:
- Currency MUST be stored as integers (cents) as defined in PHASE_2.
- Scaling and Unit conversion MUST be handled by the backend as defined in PHASE_1.
- AI MUST NOT update the database directly without deterministic validation as defined in PHASE_5.
- Inventory math MUST remain deterministic.

# Scope & Constraints

Files to CREATE:
- [NEW] workers/src/scrapers/base_scraper.js
- [NEW] workers/src/scrapers/woolworths.js
- [NEW] workers/src/scrapers/new_world.js
- [NEW] workers/src/scrapers/pak_n_save.js
- [NEW] workers/src/services/scraper_service.js
- [NEW] workers/src/utils/playwright_manager.js
- [NEW] workers/tests/scrapers.test.js

Files to MODIFY:
- [MODIFY] workers/package.json
- [MODIFY] workers/src/jobs/nightly_sync.js

Explicit DELETE policy:
- MUST NOT perform any DELETE operations on existing files in backend/, mobile/, infra/, or docs/.

Hard boundaries of this phase:
- PHASE_7 MUST be limited to the `workers/` directory and `docs/plans/`.
- No modification of `backend/src/models` is permitted; scrapers MUST use existing models.
- Site crawling MUST be throttled to avoid IP blocking.

What PHASE_7 explicitly does NOT include:
- Multi-household support (Phase 9).
- Offline synchronization (Phase 8).
- Implementation of a GUI for scraper status monitoring.

Non-goals:
- Bypassing advanced anti-bot (Akamai/Cloudflare) beyond standard Playwright techniques.
- Scraping non-grocery retailers.

# Phase Definitions

## Phase: PHASE_7

Phase ID: PHASE_7
Objective: Add live supermarket pricing via automated scraping.
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Scraper modules, scraper service, playwright manager, scraper tests.
Verification commands: npm --prefix workers run lint && npm --prefix workers test
Expected outcomes: Functional price scraping for Woolworths, New World, and PAK'nSAVE; integrated into nightly sync.
Failure stop conditions: Linting failure, test failure, path allowlist violation, anti-bot blocking detection.
Concrete deliverables: Base scraper class, store-specific scraper modules, pricing sync service, and playwright manager.
Behavioral guarantees:
- Scrapers MUST accurately extract product names, prices, and unit sizes from NZ supermarket sites.
- The playwright_manager MUST ensure browser instances are disposed of correctly.
- Scraper service MUST handle store-specific errors without halting the overall sync job.
- Price snapshots MUST capture sale status and timestamp.
Deterministic outcomes:
- Price snapshots MUST map correctly to existing SKUs and Stores.
- Scraped unit sizes MUST be normalized before storage.
Data ownership boundaries:
- Workers own the scraping lifecycle and browser state.
- Backend Pricing Engine owns the persistent snapshots and history.
Runtime invariants:
- Scrapers MUST use randomized user-agents.
- Scrapers MUST implement delays between requests.

# Path Allowlist

- workers/src/scrapers/base_scraper.js
- workers/src/scrapers/woolworths.js
- workers/src/scrapers/new_world.js
- workers/src/scrapers/pak_n_save.js
- workers/src/services/scraper_service.js
- workers/src/utils/playwright_manager.js
- workers/tests/scrapers.test.js
- workers/package.json
- workers/src/jobs/nightly_sync.js
- docs/plans/PLAN_PANTRYPILOT_PHASE_7_V1.md

# Verification Gates

Gate 1: Static Analysis
- Command: npm --prefix workers run lint
- Required: Exit 0.

Gate 2: Scraper Unit Tests
- Command: npm --prefix workers test tests/scrapers.test.js
- Required: All scraper unit tests MUST pass.

Gate 4: Playwright Environment
- Command: ls workers/node_modules/playwright
- Required: Playwright MUST be present.

Gate 5: Scope Integrity
- Command: git status --porcelain | grep -v "workers/" | grep -v "docs/plans/"
- Required: MUST be empty.

# Forbidden Actions

- MUST NOT write outside the path allowlist.
- MUST NOT modify backend models or schemas.
- MUST NOT introduce hardcoded credentials.
- MUST NOT disable verification gates.
- MUST NOT use wildcards in the allowlist.
- MUST NOT modify existing signed plan files.

# Rollback / Failure Policy

Exact file reversion strategy:
1. Revert modifications: git checkout HEAD -- workers/package.json workers/src/jobs/nightly_sync.js
2. Remove created files: rm -rf workers/src/scrapers/ workers/src/services/ workers/src/utils/ workers/tests/scrapers.test.js
3. Confirm clean state: git status workers/ MUST show no changes.

Mandatory halt on failure:
- Any non-zero exit code from a verification gate MUST result in immediate cessation and rollback.
- No continuation after rollback is permitted without plan revision.