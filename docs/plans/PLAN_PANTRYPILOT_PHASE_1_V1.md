<!--
ATLAS-GATE_PLAN_HASH: 7b60c50cbd4bbadb95bb4a194732b00f63f9c028e5241aaf687e7867cc2f79df
COSIGN_SIGNATURE: MEUCICLmTMilTtHFyQVjr6J6U55HFt+b/oxS9Uk4XAHXd2HRAiEAjITB5MSCDmMEsel3VkdHc4p3HW4YQSqymamXN/2w6CY=
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_1_V1
Version: 1.0
Author: ANTIGRAVITY
Status: APPROVED
Timestamp: 2026-02-14T05:55:00Z
Governance: ATLAS-GATE-v2

# Scope & Constraints
- Objectives: Implementation of the Core Data and Inventory Engine as defined in Phase 1 of docs/roadmap.md.
- MUST implement models for Household, User, Item, Category, Location, StockEntry, Unit, UnitConversion, ReorderThreshold, and Expiry.
- MUST implement inventory logic: Add item, Adjust quantity, Deduct quantity, Unit normalization, Alias mapping, and Reorder triggers.
- MUST NOT include AI logic.
- MUST NOT include mobile frontend code.
- MUST NOT include pricing engine logic (Phase 2).
- MUST ensure 100% deterministic stock math.

# Phase Definitions

## Phase: PHASE_1_INVENTORY_CORE

Phase ID: PHASE_1_INVENTORY_CORE
Objective: Implement the core inventory models and unit conversion logic
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Backend models, services, and unit tests
Verification commands: npm --prefix backend run lint && npm --prefix backend test
Expected outcomes: Backend models and services for inventory management are fully implemented and verified via automated tests
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation, Syntax error

# Path Allowlist
- backend/src/models/*
- backend/src/services/*
- backend/src/types/*
- backend/tests/*
- docs/plans/*

# Verification Gates
- [ ] G1: Structural validation of backend models.
- [ ] G2: Verification of unit conversion math (g <-> kg, ml <-> L, count).
- [ ] G3: Inventory deduction and reorder trigger unit tests.
- [ ] G4: Spectral linting of the plan itself.

# Forbidden Actions
- DELETE existing directories or core configuration files.
- IMPORT of AI-related libraries or external APIs not specified.
- MODIFY files outside the backend directory or docs/plans.

# Rollback / Failure Policy
- On failure of any verification gate, all changes in PHASE_1 MUST be reverted locally.
- The system MUST HALT until the plan or implementation is corrected.
- No partial commits are permitted for a failed Phase.