<!--
ATLAS-GATE_PLAN_HASH: 9f7b6cb9ebc3dd14410b843f503139bcc4651295ceb3ec5c2bc9cfb7f96612d9
COSIGN_SIGNATURE: MEYCIQDhzNDDB0qnRHXLmxebP7d9rtdRt6nHGMRxO46D0fPNHAIhANiAu9uog6al0UGrZfWgwmRoON+yYdb01407qMk2Gl9A
ROLE: ANTIGRAVITY
STATUS: APPROVED
-->

# Plan Metadata

Plan ID: PLAN_PANTRYPILOT_PHASE_0_V2
Version: 2.0
Author: ANTIGRAVITY
Status: APPROVED
Timestamp: 2026-02-14T14:55:00Z
Governance: ATLAS-GATE-v2

---

# Scope & Constraints

Objective: Implement the foundation for PantryPilot according to the Phase 0 roadmap deliverables including monorepo structure, Docker configuration, VPS provisioning, and CI pipeline.

Affected Files:
- infra/provision_vps.sh: Create VPS setup script for Ubuntu 24.04
- infra/nginx.conf: Create reverse proxy configuration
- infra/docker-compose.yml: Verify and refine Docker baseline
- .github/workflows/ci.yml: Verify and refine CI pipeline
- docs/GOVERNANCE.md: Document the plan validation system

Out of Scope:
- Core inventory logic or data models
- Meal planning features
- AI interpretation components
- Mobile application screens

Constraints:
- MUST follow grocery-first architecture principles
- MUST NOT include meal planning logic
- MUST use Ubuntu 24.04 target for provisioning scripts
- MUST define verification commands that exist in the environment
- MUST restrict Path Allowlist to required directories only
- MUST NOT include implementation code within the plan itself

---

# Phase Definitions

## Phase: PHASE_0_FOUNDATION

Phase ID: PHASE_0_FOUNDATION
Objective: Establish the production-ready monolith scaffold and governance baseline
Allowed operations: CREATE, MODIFY
Forbidden operations: DELETE
Required intent artifacts: Infrastructure scripts, Configuration files, Governance documentation
Verification commands: docker-compose -f infra/docker-compose.yml config && bash -n infra/provision_vps.sh
Expected outcomes: Valid Docker config, syntax-correct provisioning script, and documented governance
Failure stop conditions: Syntax errors, Verification command failure, Path allowlist violation

---

# Path Allowlist

- infra/
- .github/
- docs/
- backend/
- mobile/
- workers/
- README.md

---

# Verification Gates

## Gate 1: Syntax Integrity
Trigger: After writing configuration and scripts
Check: docker-compose -f infra/docker-compose.yml config && bash -n infra/provision_vps.sh
Required: Exit code 0
Failure: REJECT and ROLLBACK

## Gate 2: Workspace Structure
Trigger: After file creation
Check: ls -d backend mobile infra workers docs plans
Required: All core directories must be present
Failure: REJECT and ROLLBACK

## Gate 3: Governance Alignment
Trigger: Before final approval
Check: Verify no files modified outside of the Path Allowlist
Required: Zero violations detected
Failure: REJECT

---

# Forbidden Actions

- DELETE existing documentation in docs/
- MODIFY files outside the defined Path Allowlist
- Include prohibited markers
- Execute arbitrary shell commands unrelated to verification
- Skip defined verification gates
- Include meal planning logic or AI-related components

---

# Rollback / Failure Policy

## Triggers
1. Verification gate failure
2. Modification of files outside the Path Allowlist
3. Detection of ambiguous terms in Plan
4. Linting failure during validation

## Procedure
1. git checkout infra/ .github/ docs/ README.md
2. Delete any newly created files in infra/ and docs/
3. Verify workspace matches the pre-execution state
4. Log failure details to audit-log.jsonl

## Recovery
1. Analyze failure logs to identify the root cause
2. Rectify the implementation plan or environment issue
3. Resubmit the plan for linting and approval