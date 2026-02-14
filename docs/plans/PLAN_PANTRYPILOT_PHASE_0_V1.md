<!--
ATLAS-GATE_PLAN_HASH: 86ab8ca7e1ecbb165c212d1fb58b86f51e662ef56d716ee3cbb11ea0897d968d
COSIGN_SIGNATURE: MEUCIQCEWLxAi1ocoMMh2f6QYBQHZ4SnnNrgx3R1tdnla2WnZwIgFHFbRZJx4nn9r8/oFKHoUhLVmWeZSa6fCoBd0kWx5/8=
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_0_V1
Version: 1.0
Author: ANTIGRAVITY
Status: APPROVED
Timestamp: 2026-02-14T05:55:00Z
Governance: ATLAS-GATE-v2

# Scope & Constraints

Objective: Initialize the PantryPilot monorepo structure, infrastructure, and governance.

Affected Files:
- backend/: New service directory
- mobile/: New app directory
- infra/: Infrastructure scripts and config
- workers/: Background worker directory
- docs/: Documentation directory
- plans/: Implementation plans directory
- docker-compose.yml: Infrastructure orchestration
- Caddyfile: Reverse proxy configuration

Out of Scope:
- Implementation of inventory services (Phase 1)
- UI/UX implementation for mobile app (Phase 6)
- AI logic (Phase 5)

Constraints:
- MUST follow the monorepo structure defined in roadmap.md
- MUST use Docker Compose for service orchestration
- MUST target Ubuntu 24.04 for VPS provisioning
- MUST use Caddy as the reverse proxy

# Phase Definitions

## Phase: PHASE_0_FOUNDATION

Phase ID: PHASE_0_FOUNDATION
Objective: Create monorepo structure and infrastructure baselines
Allowed operations: CREATE
Forbidden operations: DELETE
Required intent artifacts: Directory structure, Docker Compose config, Provisioning scripts, Reverse proxy config
Verification commands: ls -d backend mobile infra workers docs plans && docker compose config && bash -n infra/provision.sh
Expected outcomes: All directories exist and infrastructure configurations are syntactically valid
Failure stop conditions: Verification failure, Hash mismatch, Path allowlist violation, Syntax error

# Path Allowlist

- backend/
- mobile/
- infra/
- workers/
- docs/
- plans/
- docker-compose.yml
- Caddyfile
- .atlas-gate/

# Verification Gates

## Gate 1: Structure and Syntax
Trigger: After file creation
Check: ls -d backend mobile infra workers docs plans && docker compose config && bash -n infra/provision.sh
Required: Success (exit code 0)
Failure: REJECT and ROLLBACK

## Gate 2: Integrity
Trigger: Before approval
Check: Verify only files in allowlist modified
Required: Zero violations
Failure: REJECT

# Forbidden Actions

- DELETE existing documentation or governance files
- MODIFY files outside the defined service directories
- IMPORT third-party dependencies not related to infrastructure

# Rollback / Failure Policy

## Triggers
1. Verification gate failure
2. File written outside Path Allowlist
3. Hash mismatch detected

## Procedure
1. Revert any changes to existing files using git checkout
2. Delete newly created directories: backend, mobile, infra, workers
3. Delete newly created files: docker-compose.yml, Caddyfile
4. Verify workspace state is clean

## Recovery
1. Review failure logs
2. Fix syntax errors or directory permission issues
3. Resubmit plan for linting