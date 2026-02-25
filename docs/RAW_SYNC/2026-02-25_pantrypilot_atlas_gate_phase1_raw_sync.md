## RAW SYNC METADATA

Project: PantryPilot
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Build PantryPilot into a production-grade, governed meal and lunch planning system capable of fully managing pantry inventory, supporting children's lunch planning, generating alternatives and suggestions, and operating under strict Atlas-Gate MCP governance with deterministic execution plans.

---

## 2. DECISIONS MADE

- PantryPilot must operate under ATLAS-GATE governance.
- Planning and execution must use ANTIGRAVITY and WINDSURF MCP templates.
- High-level architectural plans are not executable by WINDSURF.
- Execution requires file-level implementation blocks.
- Plans must include full production-ready file content.
- Plans must include role metadata (EXECUTABLE, BOUNDARY, INFRASTRUCTURE, VERIFICATION).
- Plans must include intent metadata.
- Plans must include verification gates.
- Plans must include path allowlists.
- Plans must include rollback procedures.
- Plans must include SHA256 hash footer.
- PHASE_1 is limited strictly to Pantry inventory schema expansion.
- PHASE_1 must NOT include meal planning features.
- Inventory schema must support household tenancy.
- Inventory schema must support stock ledger semantics.
- Inventory schema must support storage locations.
- Inventory schema must support expiry tracking.
- Inventory schema must support minimum thresholds.
- Inventory schema must use deterministic integer quantities.
- Inventory schema must not use floating-point quantities.
- Base unit system must be deterministic.
- DB dialect must be aligned with actual repo configuration.
- Docker compose must align with chosen DB dialect if needed.
- Migrations must be reversible (up/down).
- Schema changes must include indexes to avoid N+1 risks.
- Tests must validate schema existence and indexes.
- Tests must validate migration up and down.
- Tests must use existing test framework.
- No stubs, TODOs, or placeholder logic allowed.
- Writes must occur only within defined allowlist.
- Plan must be saved to docs/plans/ with write_file.
- Plan must use canonical 9-section structure.
- Hash sealing required via lint_plan.
- Execution requires FULL mode with Plan Signature.
- RAW_SYNC does not elevate content to Canon.

---

## 3. ARCHITECTURE CHOICES

- Governance layer: ATLAS-GATE MCP.
- Planning agent: ANTIGRAVITY.
- Execution agent: WINDSURF.
- Plans stored under docs/plans/.
- Plans validated using SHA256 hash.
- Execution uses write_file MCP tool exclusively.
- Audit trail required for all writes.
- Inventory domain structured around:
  - household
  - inventory_item
  - storage_location
  - stock_lot (or equivalent)
  - stock_ledger_entry
  - inventory_threshold

- Ledger model must be append-only.
- Quantity representation must use integer base units.
- Unit system constrained (g, ml, each).
- Index strategy required on foreign keys and time fields.
- Tenant isolation required via household_id FKs.
- Path allowlist restricts writes to backend models, migrations, tests, limited config, infra/docker-compose.yml, docs/plans/.

---

## 4. FEATURE DEFINITIONS

- Multi-household tenancy support.
- Inventory item master data.
- Storage location tracking (pantry/fridge/freezer).
- Stock lot or equivalent batch-level tracking.
- Expiry date tracking.
- Cost tracking in integer cents.
- Append-only stock ledger entries.
- Threshold-based minimum quantity tracking.
- Deterministic base unit normalization.
- Reorder readiness support via threshold system.
- Migration reversibility.
- Schema validation tests.
- Index validation tests.
- Workspace integrity verification.

---

## 5. CONSTRAINTS IDENTIFIED

- MUST NOT implement meal planning in PHASE_1.
- MUST NOT modify auth architecture.
- MUST enforce tenant isolation.
- MUST NOT introduce floats for quantity.
- MUST select DB dialect after reading actual config.
- MUST align docker-compose with DB dialect if required.
- MUST use existing test framework.
- MUST NOT introduce new test framework.
- MUST NOT write outside defined allowlist.
- MUST NOT include stubs or placeholders.
- MUST include full file content blocks in plan.
- MUST include verification commands actually defined in repo.
- MUST use workspace-relative paths.
- MUST NOT guess file paths.
- MUST read actual repo files before generating plan.
- MUST not clean contradictions during RAW extraction.
- MUST not elevate RAW_SYNC into Canon.

---

## 6. REJECTED IDEAS

- Executing high-level architectural plan without file-level blocks.
- Generating master roadmap as executable mutation.
- Combining architecture design and mutation execution in same step.
- Using floating-point quantities for inventory.
- Adding new test frameworks arbitrarily.
- Writing outside allowlist.
- Skipping verification gates.

---

## 7. OPEN QUESTIONS

- What exact DB dialect is currently configured in the repository.
- Whether Sequelize, Prisma, or another ORM is in use.
- Whether household model already exists.
- Whether inventory-related models already exist.
- Whether storage location concept already exists.
- Whether migration framework is Sequelize CLI or custom.
- Whether lint command exists in backend/package.json.
- Whether docker-compose contradicts DB config.
- Whether lots should be separate table or embedded strategy.
- Whether SQLite fallback is required.
- Exact unit conversion enforcement location (schema vs service layer).

---

## 8. POTENTIAL CANON CANDIDATES

- Inventory quantities MUST use integer base units only.
- Ledger model MUST be append-only.
- All execution MUST pass through ATLAS-GATE governance.
- Plans MUST be hash-sealed before execution.
- WINDSURF cannot execute architectural documents.
- Path allowlist enforcement is mandatory.
- Tenant isolation via household_id is non-negotiable.
- All schema phases must include index strategy.
- Reversible migrations are mandatory.
- No floats for quantity anywhere in PantryPilot.
- REALITY LOCK applies to all implementation plans.
- Inventory schema is Phase 1 foundation for Meal OS.
- RAW_SYNC extraction is archaeology only and not Canon.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – PHASE_1 limited strictly to Pantry inventory schema expansion.
2026-02-25 – Inventory quantities must use deterministic integer base units.
2026-02-25 – Ledger model must be append-only.
2026-02-25 – Execution requires file-level implementation blocks only.
2026-02-25 – High-level plans are non-executable under WINDSURF.
2026-02-25 – Plans must follow canonical 9-section ATLAS-GATE structure.
2026-02-25 – All plans must include SHA256 hash footer.
2026-02-25 – All writes restricted by path allowlist.
2026-02-25 – Reversible migrations are mandatory.
2026-02-25 – Meal planning features explicitly excluded from PHASE_1.

End of extraction.
