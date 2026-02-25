# Conduct a comprehensive, production-grade technical analysis of the GitHub repository located at: https://github.com/dylanmarriner/PantryPilot Objective: Deliver a structured, expert-level evaluation of the repository’s architecture, code quality, maintainability, scalability, security posture, performance considerations, developer experience, product maturity, and a prioritized improvement roadmap. Execution Requirements: Repository Overview Identify the project’s purpose, target users, and core functionality. Summarize the technology stack (languages, frameworks, libraries, tooling). Infer architectural pattern (monolith, modular, MVC, SPA, etc.). Codebase Structure & Architecture Evaluate directory organization and separation of concerns. Assess modularity, abstraction quality, and dependency management. Identify architectural strengths and structural weaknesses. Evaluate scalability readiness. Code Quality Assessment Evaluate readability, naming consistency, and formatting standards. Detect duplication, anti-patterns, and technical debt. Assess error handling and resilience practices. Identify adherence to best practices for the chosen stack. Performance & Efficiency Identify potential bottlenecks and inefficient patterns. Evaluate data handling, caching, and async logic. Recommend performance optimizations with impact level. Security Review Identify vulnerabilities (authentication, authorization, input validation, secrets handling). Review dependency risk surface. Highlight insecure configurations or patterns. Testing & Reliability Evaluate test coverage, structure, and strategy. Identify missing layers (unit, integration, e2e). Assess CI/CD setup and automation maturity. Documentation & Developer Experience Evaluate README clarity and completeness. Assess onboarding flow for new contributors. Review code comments and documentation hygiene. Identify missing artifacts (architecture docs, contribution guide, environment setup, etc.). Product & UX Evaluation (if applicable) Assess feature completeness vs stated goals. Identify UX gaps, friction points, or inconsistencies. Suggest high-leverage product improvements. Maintainability & Future Readiness Evaluate long-term sustainability and technical risk. Identify refactor priorities ranked by impact and effort. Provide a phased roadmap: Short-term (0–30 days), Mid-term (1–3 months), Long-term (3–12 months). Explicit Improvement & Expansion List Provide a clearly separated section titled “Additions & Improvements” that includes: A. Critical Fixes (must address immediately) B. High-Impact Enhancements (strong ROI) C. Developer Experience Improvements D. Architecture & Scalability Upgrades E. Security Hardening Measures F. Performance Optimizations G. Product & Feature Additions H. Portfolio/Resume-Readiness Enhancements Each item must include: What to add or improve Why it matters Estimated effort (Low / Medium / High) Impact level (Low / Medium / High) Output Format: Deliver a structured technical audit report with clearly labeled sections, prioritized findings, and concrete recommendations. Avoid generic commentary. Provide specific, actionable insights. Assume the audience is a senior developer or technical founder preparing the project for scale, production deployment, or investor/technical review. Optional Enhancers Add numeric quality scores (0–100) across Architecture, Code Quality, Security, Scalability, DX Include a dependency risk audit summary Provide a refactor plan with estimated timeline in weeks Compare architecture against industry best practices for similar applications Include a “Production Readiness Score” and justification

## PantryPilot — Technical Audit (Production-Grade)

**Repo:** `https://github.com/dylanmarriner/PantryPilot` [GitHub](https://github.com/dylanmarriner/PantryPilot)

### Executive summary

PantryPilot is positioned as a **household inventory + price intelligence + meal planning** platform with offline-capable mobile UX and store scraping workers. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/README.md)  
The repo already contains a _good shape_ (backend + mobile + workers + infra), but **it is not production-safe yet** due to critical security gaps (mock JWT + base64 “hashing”), inconsistent data model/DB strategy, and several hard runtime bugs.

* * *

## 1) Repository Overview

### Purpose, users, core functionality

*   **Target users:** households/families who want to track pantry/fridge/freezer, reduce waste, optimize spend, and plan meals. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/README.md)
    
*   **Core modules implied by code:**
    
    *   Inventory CRUD + stock ledger & unit conversion (backend) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/inventory_routes.js)
        
    *   Dashboard summary (backend) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/dashboard_routes.js)
        
    *   “AI” action extraction + suggestions (backend; currently rule-based) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/ai_routes.js)
        
    *   Client sync engine (backend; conflict resolution placeholder) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/sync_routes.js)
        
    *   Price scraping workers via Playwright for NZ grocers (workers) [GitHub+3GitHub+3GitHub+3](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/src/services/scraper_service.js)
        
    *   Mobile app (Expo/React Native) screens + API client [GitHub+3GitHub+3GitHub+3](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/package.json)
        

### Tech stack

**Backend**

*   Node.js + Express [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/package.json)
    
*   Sequelize ORM + (declared) Postgres + SQLite (actual config uses SQLite) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/package.json)
    
*   Auth libs present (`jsonwebtoken`, `bcrypt`) but not actually used correctly in code paths [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/package.json)
    

**Mobile**

*   Expo SDK ~50, React Navigation, Axios [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/package.json)
    
*   AsyncStorage dependency present but API client uses `localStorage` (wrong for React Native) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/package.json)
    

**Workers**

*   Playwright scrapers + Jest tests [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/tests/scrapers.test.js)
    

**Infra**

*   Docker Compose with backend + Postgres + Redis + Nginx (dev) [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    

### Architecture pattern (inferred)

*   **Modular monorepo** with three services:
    
    *   `backend/` (API monolith)
        
    *   `mobile/` (client)
        
    *   `workers/` (scraping/automation)
        
*   Patterns used: Express route/controller/service split; a ledger-style stock entry model; scraping subsystem with base scraper + store implementations. [GitHub+3GitHub+3GitHub+3](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/inventory_routes.js)
    

* * *

## 2) Codebase Structure & Architecture

### Directory organization & separation of concerns

**What’s good**

*   Backend is split into **routes → controllers → services → models** (correct direction). [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/inventory_routes.js)
    
*   Workers have clean separation: `scrapers/`, `services/`, `utils/`, tests. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/tests/scrapers.test.js)
    

**Structural weaknesses (production blockers)**

1.  **DB/infra mismatch:** docker-compose provisions Postgres, but backend config hardcodes SQLite. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
2.  **Compose expects backend/Dockerfile but it’s missing** (build will fail). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
3.  **Data model inconsistencies** (mixed snake\_case + camelCase, created\_at vs createdAt assumptions, inconsistent filtering by user/created\_by/household). [GitHub+3GitHub+3GitHub+3](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/dashboard_controller.js)
    
4.  **Auth layer is non-real** (accept-any-token + mock signature), which also breaks every authorization assumption across services. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    

### Scalability readiness

Right now, scaling is blocked less by performance and more by **correctness + trust boundaries**:

*   You can scale workers horizontally later, but first you need **deterministic persistence**, **real auth**, and **stable schemas**.
    
*   Stock math is conceptually on the right track (ledger entries + base units). [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/services/inventory.js)
    
*   Conflict resolution in sync is currently superficial and likely wrong (conflict matching looks incorrect: compares `change.data.itemId` to `clientResult.operationId`). [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/services/sync_executor.js)
    

* * *

## 3) Code Quality Assessment

### Readability & consistency

*   Generally readable, but the repo has **“scaffold-quality” shortcuts** inside core security and persistence code.
    
*   Naming consistency is currently poor across the backend:
    
    *   `created_by` filtering in dashboard [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/dashboard_controller.js)
        
    *   `household_id` set to `userId` as placeholder [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
        
    *   timestamps referenced as both `createdAt` and `created_at` [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/dashboard_controller.js)
        

### Duplication & technical debt

*   Inventory logic exists both in controller and service, but not consistently (controller sometimes bypasses intended invariants).
    
*   Lots of “in production, do X” comments in auth, but code ships the insecure behavior. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    

### Error handling & resilience

*   Many endpoints catch errors and return 500 (fine), but there’s no centralized error middleware, request IDs, structured logging, etc. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/app.js)
    
*   Workers use `--no-sandbox` Chromium args, which is risky outside a locked-down container runtime. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/src/utils/playwright_manager.js)
    

* * *

## 4) Performance & Efficiency

### Likely bottlenecks

*   **Dashboard & inventory endpoints do N+1 queries**:
    
    *   `getInventory` loads all items then calls `getCurrentStock()` per item (each is a query). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
        
    *   Same pattern in dashboard summary. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/dashboard_controller.js)
        

### Data handling/caching

*   Redis exists in compose but is not used in backend code. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   Workers scrape “example” searches (`milk`, `bread`, `eggs`) and only fetch up to 20 products—this is more demo than production ingestion. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/src/scrapers/woolworths.js)
    

### High-leverage optimizations (with impact)

*   Replace per-item stock queries with a **single grouped aggregate query** over `stock_entries` returning `item_id → current_stock`. (Impact: High, Effort: Medium)
    
*   Add **etag/conditional fetch** or “since” parameters to reduce mobile polling traffic. (Impact: Medium, Effort: Medium)
    
*   Use Redis for:
    
    *   short-lived dashboard cache
        
    *   rate-limits
        
    *   scraper result staging. (Impact: Medium–High, Effort: Medium)
        

* * *

## 5) Security Review (Critical)

### Authentication & authorization — production blockers

*   **Auth middleware accepts _any_ Bearer token and “decodes” it without verifying signature**. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    
*   **Token generation uses a fake signature** and password hashing is base64 encoding. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/auth_controller.js)  
    This is not just “weak”; it means **anyone can impersonate anyone**.
    

### Input validation

*   Some validation exists via `express-validator` on inventory/auth/sync routes. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/inventory_routes.js)
    
*   AI routes are unauthed and mostly unvalidated (can be abused for workload amplification later). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/routes/ai_routes.js)
    

### Secrets & configuration

*   No `.env.example` found at root/backend in this repo state (onboarding & secret hygiene gap). [Invalid URL+1](https://chatgpt.com/)
    
*   Compose includes a known-dev password string; fine for dev, but needs hard separation and documentation. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    

### Dependency risk surface (summary)

*   You have typical web surface area: Express, Sequelize, jsonwebtoken, bcrypt, Playwright. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/package.json)  
    You should assume there _will_ be CVEs over time; add automation (Dependabot + CI vulnerability gating).
    

* * *

## 6) Testing & Reliability

### Current state

*   Workers have Jest tests (good baseline). [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/tests/scrapers.test.js)
    
*   Backend declares Jest/Supertest but I did not see evidence of API tests in the sampled files. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/package.json)
    
*   No CI workflow file was retrievable from `.github/workflows` in this repo snapshot. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/.github/workflows/ci.yml)
    

### What’s missing (must-have)

*   Backend unit tests for:
    
    *   auth (token verify, password hashing)
        
    *   inventory stock math invariants
        
    *   sync conflict resolution correctness
        
*   Integration tests with a real Postgres container (matches your compose intent).
    

* * *

## 7) Documentation & Developer Experience

### README

The README is **excellent for vision** (product pitch, journeys), but it currently **overstates the implementation maturity** relative to the code. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/README.md)

### Onboarding gaps

Missing or not found:

*   `BUILD.md`, `SECURITY.md`, `.env.example`, contribution guide (in this repo state) [+3Invalid URL+3+3](https://chatgpt.com/)
    
*   A single “run everything” command at repo root (compose exists but points at missing Dockerfile). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    

* * *

## 8) Product & UX Evaluation (from code)

### Current UX reality (mobile)

*   You have real screens for Dashboard and Inventory, wired to API calls. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/src/screens/DashboardScreen.js)
    
*   Major mobile production issues:
    
    *   API client uses `localStorage` (not React Native compatible) → auth persistence breaks. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/src/services/api.js)
        
    *   `App.js` appears incomplete (returns empty). [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/App.js)
        
    *   Base URLs mismatch with backend compose (`mobile` uses `3001`, backend uses `3000`). [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/src/services/api.js)
        

### High-leverage product improvements

*   First “real” value prop to ship: **inventory + shopping list + price comparison** (with scraping ingestion), before deep meal planning/AI.
    

* * *

## 9) Maintainability & Future Readiness

### Biggest long-term risks

1.  **Security correctness debt** (auth must be real before anything else). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    
2.  **Schema drift & naming inconsistency** will destroy velocity (snake\_case vs camelCase, timestamps, ownership fields). [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/services/inventory.js)
    
3.  **Infrastructure drift** (compose says Postgres+Redis, app uses SQLite). [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
4.  **Mobile persistence & environment config** (AsyncStorage + environment-driven base URL).
    

* * *

## Quality Scores (0–100) & Production Readiness

*   **Architecture:** 58/100 (good module split; persistence/auth not aligned with infra) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   **Code Quality:** 52/100 (readable, but inconsistent modeling and real bugs) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
    
*   **Security:** 12/100 (**critical**: fake JWT + base64 password “hashing”) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    
*   **Scalability:** 45/100 (blocked by correctness; N+1 queries; Redis unused) [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
    
*   **Developer Experience:** 40/100 (vision README strong; run/docs missing; compose broken) [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/README.md)
    

### Production Readiness Score: **18/100**

Because production readiness is dominated by **auth + data correctness + deployability**, and those are currently failing. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)

* * *

## Phased Roadmap

### Short-term (0–30 days): “Make it real + runnable”

1.  **Replace auth with real JWT verification + bcrypt hashing**
    
    *   Use `bcrypt.hash()` / `bcrypt.compare()`
        
    *   Use `jsonwebtoken.sign()` / `jsonwebtoken.verify()` with real secret & expiry
        
    *   Remove “accept any token” behavior entirely [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
        
2.  **Fix hard runtime bugs**
    
    *   `inventory_controller.updateItem` references `userId` without defining it (will throw). [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
        
3.  **Align DB strategy**
    
    *   Either: commit to Postgres (recommended) OR remove Postgres from compose.
        
    *   Update Sequelize config to read `DATABASE_URL` / env and select dialect accordingly. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
        
4.  **Make docker-compose build succeed**
    
    *   Add missing `backend/Dockerfile` or change compose build to match reality. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
        
5.  **Mobile: fix auth storage + env config**
    
    *   Replace `localStorage` with AsyncStorage
        
    *   Fix base URL + support device testing (Android emulator needs `10.0.2.2`, physical device needs LAN IP) [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/mobile/src/services/api.js)
        
6.  Add `.env.example` + “Quickstart” docs (single command to run stack).
    

### Mid-term (1–3 months): “Correctness + tests + ingestion”

1.  **Unify schema conventions** (pick snake\_case or camelCase; enforce in Sequelize + migrations)
    
2.  **Add migrations** (Sequelize CLI or Umzug) and define ownership fields properly (user\_id, household\_id)
    
3.  **Backend test suite**
    
    *   unit tests for inventory math + unit conversions
        
    *   integration tests hitting Postgres container (Supertest)
        
4.  **Scraper pipeline**
    
    *   Persist scrape results (price\_history table)
        
    *   Add dedupe (product matching strategy: barcode/gtin first, fallback fuzzy match)
        
    *   Add rate limits + robust selectors
        

### Long-term (3–12 months): “Scale + product moat”

1.  True offline-first sync with correct conflict resolution (CRDT or per-entity version vectors if you want to go hard)
    
2.  Observability: structured logs, tracing, metrics, alerting
    
3.  Security hardening: RBAC, household roles, audit log integrity
    
4.  Move scraping to a queue (BullMQ/Redis) and schedule runs; consider headless browser isolation
    

* * *

# Additions & Improvements

## A. Critical Fixes (must address immediately)

1.  **Real JWT verification + signing**
    

*   **What:** Replace mock decode/accept-any-token with `jsonwebtoken.verify()` and enforce signature/expiry.
    
*   **Why:** Prevent total account compromise. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

2.  **Replace base64 “hashing” with bcrypt**
    

*   **What:** Use `bcrypt.hash(password, cost)` and `bcrypt.compare()`.
    
*   **Why:** Current approach is reversible and unsafe. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/auth_controller.js)
    
*   **Effort:** Low
    
*   **Impact:** High
    

3.  **Fix `userId` undefined bug in inventory update**
    

*   **What:** In `updateItem`, define `const userId = req.user.id;` before using it.
    
*   **Why:** Endpoint will throw in production. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
    
*   **Effort:** Low
    
*   **Impact:** High
    

4.  **Make compose build succeed (missing Dockerfile)**
    

*   **What:** Add `backend/Dockerfile` or update compose path.
    
*   **Why:** Current dev stack won’t start reliably. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   **Effort:** Low–Medium
    
*   **Impact:** High
    

5.  **DB alignment: stop claiming Postgres while using SQLite**
    

*   **What:** Add env-driven DB config and run Postgres by default.
    
*   **Why:** Prevents “it works on my machine” and migration dead-ends. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

* * *

## B. High-Impact Enhancements (strong ROI)

1.  **Eliminate N+1 stock queries**
    

*   **What:** One aggregate query to compute current stock for all items.
    
*   **Why:** Big perf win as inventory grows. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

2.  **Persist price history + expose comparison endpoint**
    

*   **What:** `prices`/`price_history` tables + `/prices/compare?items=...`
    
*   **Why:** This is the “money saver” hook. [GitHub+2GitHub+2](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/src/scrapers/woolworths.js)
    
*   **Effort:** Medium–High
    
*   **Impact:** High
    

3.  **Use Redis for rate limiting + caching**
    

*   **What:** Add rate limiting middleware + cache dashboard summaries for short TTL.
    
*   **Why:** Stability + cost control; Redis already provisioned. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   **Effort:** Medium
    
*   **Impact:** Medium–High
    

* * *

## C. Developer Experience Improvements

1.  **Root-level Quickstart**
    

*   **What:** “Prereqs → cp .env.example → docker compose up → run migrations → seed data”
    
*   **Why:** Converts repo from “idea” to “team-joinable”.
    
*   **Effort:** Low
    
*   **Impact:** High
    

2.  **Add CI (lint + test + type checks where applicable)**
    

*   **What:** GitHub Actions: backend tests, workers tests, mobile lint.
    
*   **Why:** Stops regressions immediately.
    
*   **Effort:** Medium
    
*   **Impact:** High
    

3.  **Introduce consistent lint/format**
    

*   **What:** Prettier + ESLint config shared across backend/workers/mobile.
    
*   **Why:** Removes noise + standardizes style.
    
*   **Effort:** Low–Medium
    
*   **Impact:** Medium
    

* * *

## D. Architecture & Scalability Upgrades

1.  **Formalize domain model & ownership**
    

*   **What:** Explicit Household model ownership rules; remove “userId as household\_id placeholder”.
    
*   **Why:** Required for multi-user households and RBAC. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/controllers/inventory_controller.js)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

2.  **Queue-based scraping ingestion**
    

*   **What:** BullMQ/Redis jobs, schedule runs, persist results, retry policies.
    
*   **Why:** Makes scraping reliable and scalable. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/infra/docker-compose.yml)
    
*   **Effort:** High
    
*   **Impact:** High
    

* * *

## E. Security Hardening Measures

1.  **AuthZ checks everywhere**
    

*   **What:** Ensure item/stock operations verify household membership (not just “is authed”).
    
*   **Why:** Prevent cross-tenant data access. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/middleware/auth.js)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

2.  **Secrets management + `.env.example`**
    

*   **What:** Document required env vars; never commit secrets.
    
*   **Why:** Prevent accidental leakage; improves deployability. [Invalid URL+1](https://chatgpt.com/)
    
*   **Effort:** Low
    
*   **Impact:** High
    

3.  **Harden Playwright runtime**
    

*   **What:** Avoid `--no-sandbox` unless running inside locked-down container; document threat model.
    
*   **Why:** Reduces exploit blast radius. [GitHub](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/workers/src/utils/playwright_manager.js)
    
*   **Effort:** Medium
    
*   **Impact:** Medium
    

* * *

## F. Performance Optimizations

1.  **Batch stock computations**
    

*   **What:** Group by `item_id` once per request.
    
*   **Why:** Removes per-item queries. [GitHub+1](https://raw.githubusercontent.com/dylanmarriner/PantryPilot/main/backend/src/services/inventory.js)
    
*   **Effort:** Medium
    
*   **Impact:** High
    

2.  **Request compression + caching headers**
    

*   **What:** gzip/br, etags, `If-Modified-Since` for relatively static endpoints.
    
*   **Why:** Better mobile performance.
    
*   **Effort:** Low
    
*   **Impact:** Medium
    

* * *

## G. Product & Feature Additions

1.  **Shopping list that is actually “store-optimized”**
    

*   **What:** Generate list with cheapest store per item + total basket cost per store.
    
*   **Why:** This is the clearest measurable value.
    
*   **Effort:** Medium–High
    
*   **Impact:** High
    

2.  **Receipt ingestion (even basic)**
    

*   **What:** Manual entry → later OCR pipeline.
    
*   **Why:** Reduces friction; boosts retention.
    
*   **Effort:** Medium–High
    
*   **Impact:** High
    

* * *

## H. Portfolio/Resume-Readiness Enhancements

1.  **Architecture doc + diagrams**
    

*   **What:** C4-style overview (services, DB, sync, scraping pipeline).
    
*   **Why:** Investor/technical reviewer clarity.
    
*   **Effort:** Low–Medium
    
*   **Impact:** High
    

2.  **“Production checklist”**
    

*   **What:** Threat model, secrets, migrations, monitoring, backups, CI gates.
    
*   **Why:** Signals seriousness.
    
*   **Effort:** Medium
    
*   **Impact:** High
    

* * *

## Blunt bottom line

You’ve got the _right_ repo shape (backend/mobile/workers/infra) and a strong product thesis, but the current implementation is in **prototype scaffolding** mode. The fastest path to “real” is:

**(1) make auth real → (2) align DB + migrations → (3) fix mobile storage/env → (4) persist price history → (5) add CI/tests.**

If you want, I can turn this audit into a **strict ATLAS-GATE / Antigravity plan** (phase-scoped, hashable) so Windsurf can execute it cleanly.

# what upgrades can i make for the meal planner / lunch planner and overall application so that it is all you need to plan your meals your kids lunchs throughout the week and provide alternatives and suggestions for my kids lunchs

Alright — I’m going to treat this like you want to turn PantryPilot into the **single operating system for household food**. Not “a meal planner”. An actual **food logistics engine**.

Below is a structured, production-minded upgrade plan specifically for:

*   🥘 Dinner planning
    
*   🧃 Kids lunch planning
    
*   🔁 Smart alternatives & rotation
    
*   🛒 Grocery optimization
    
*   📦 Inventory-aware planning
    

* * *

# 🔥 Strategic Direction

Right now PantryPilot is:

> Inventory + scraping + some AI extraction

To become “all you need for meals”, it must evolve into:

> **Inventory-aware, budget-aware, preference-aware, rotation-based meal intelligence**

That means:

1.  Meals must connect to inventory
    
2.  Lunches must track kid-specific preferences
    
3.  Suggestions must be dynamic (not static lists)
    
4.  Alternatives must be contextual (not random swaps)
    
5.  Grocery list must auto-derive from meal plan deltas
    

* * *

# 🥘 DINNER PLANNER UPGRADES

## 1️⃣ Structured Meal Engine (Not Just Recipes)

### Add:

*   `Meal` model
    
*   `MealIngredient` model
    
*   `ServingSize`
    
*   `PrepTime`
    
*   `Difficulty`
    
*   `Tags` (quick, freezer-friendly, low-carb, budget, etc.)
    
*   `LeftoverScore`
    
*   `CostEstimate`
    

### Why:

Meals need metadata so the planner can:

*   Rotate intelligently
    
*   Avoid repeating meals
    
*   Match time constraints
    
*   Respect budget caps
    

* * *

## 2️⃣ Inventory-Aware Meal Scoring

When generating weekly dinners:

Each meal should get a score based on:

*   % ingredients already in pantry
    
*   Ingredients expiring soon
    
*   Total cost delta
    
*   Prep time vs available time
    
*   Repetition frequency
    

**Example scoring model:**

Code

MealScore =  
  (InventoryMatch \* 0.35)  
\+ (ExpiryUsage \* 0.20)  
\+ (LowCost \* 0.20)  
\+ (VarietyFactor \* 0.15)  
\+ (TimeFit \* 0.10)

High score = suggest.

This makes it feel “intelligent”, not random.

* * *

## 3️⃣ Leftover-Aware Planning

Add:

*   `LeftoverYield` field per meal
    
*   “Next-day reuse rules”
    

Example:

*   Roast chicken → Chicken wraps next day
    
*   Spaghetti mince → Nachos next day
    

This reduces:

*   Waste
    
*   Cost
    
*   Cooking effort
    

This is huge for families.

* * *

# 🧃 KIDS LUNCH PLANNER — Where You Win

This is your moat.

Most meal planners ignore school lunches.

* * *

## 1️⃣ Kid Profile System

Add:

*   `KidProfile`
    
    *   Name
        
    *   Age
        
    *   Likes
        
    *   Dislikes
        
    *   Texture aversions
        
    *   Allergies
        
    *   Lunch boredom threshold
        
    *   Sweet tolerance
        

You need personalization per kid.

* * *

## 2️⃣ Lunch Component System (Modular)

Don’t plan lunches as “meals”.

Plan them as:

*   Main
    
*   Fruit
    
*   Snack
    
*   Crunch
    
*   Treat
    
*   Drink
    

Each category rotates independently.

This prevents:  
“muesli bar burnout”

* * *

## 3️⃣ Boredom Tracking Engine

Track:

*   Last served date
    
*   Times served in 14 days
    
*   Kid rating (optional smiley input)
    

If served 3x in 2 weeks → deprioritize.

This makes suggestions feel thoughtful.

* * *

## 4️⃣ Smart Alternatives Engine

When kid is “over muesli bars”:

System should suggest within same nutritional + structural slot.

Example:

**Snack slot alternatives:**

*   Muesli bar
    
*   LCM
    
*   Bliss ball
    
*   Rice cake + PB
    
*   Homemade oat slice
    
*   Popcorn bag
    

Based on:

*   Pantry availability
    
*   Cost
    
*   Rotation score
    

This is not random substitution — it’s slot-based replacement.

* * *

# 🧠 SUGGESTION ENGINE IMPROVEMENTS

Right now AI extraction is rule-based.

You want:

## 1️⃣ Weekly Planning Assistant Mode

User says:

> “Plan this week under $180, 30 min meals, no pasta”

System generates:

*   5 dinners
    
*   5 lunch templates per kid
    
*   Grocery delta list
    

* * *

## 2️⃣ Budget-Aware Suggestions

Add:

*   Weekly grocery budget target
    
*   Running spend projection
    

Planner should:

*   Suggest cheaper swaps automatically
    
*   Highlight cost per dinner
    
*   Suggest bulk buy optimization
    

* * *

## 3️⃣ “What Can I Make Right Now?” Mode

Use:

*   Pantry items
    
*   Expiry dates
    

Generate:

*   5 quick meal ideas from what you already have
    

High retention feature.

* * *

# 🛒 Grocery Intelligence Upgrades

## 1️⃣ Multi-Store Basket Comparison

Instead of just scraping prices:

Generate:

*   Cheapest total basket per store
    
*   Highlight item-by-item cheapest
    
*   Suggest “split shop” only if savings > threshold
    

* * *

## 2️⃣ Auto-Reorder Thresholds

Add:

*   Minimum stock levels per item
    
*   Auto-add to shopping list when under threshold
    

* * *

# 🧠 Advanced Planning Features

## 1️⃣ Time-Based Planning Mode

User sets:

*   “Busy week”
    
*   “Normal week”
    
*   “Relaxed week”
    

System changes:

*   Complexity
    
*   Prep time
    
*   Leftover logic
    

* * *

## 2️⃣ Nutrition Balance (Lightweight)

Track per week:

*   Fruit servings
    
*   Veg servings
    
*   Protein variety
    
*   Processed food ratio
    

Flag if:

*   5/5 dinners carb-heavy
    
*   4/5 lunches processed
    

* * *

## 3️⃣ “Use It Before It Dies” Mode

Highlight:

*   3 items expiring soon
    
*   Suggest meals + lunch components that consume them
    

* * *

# 📱 UX UPGRADES

## 1️⃣ Weekly Board View

Calendar grid:  
Mon–Sun  
Drag meals  
Drag lunch templates  
Auto-update grocery delta live

* * *

## 2️⃣ Kid Lunch Preview Mode

Show:

*   Visual breakdown of Monday lunch
    
*   Quick swap button for each slot
    

This makes daily packing fast.

* * *

## 3️⃣ Voice Mode (Huge for parents)

User says:

> “I made spaghetti for dinner”

System:

*   Deducts ingredients
    
*   Logs leftovers
    
*   Updates tomorrow suggestions
    

* * *

# 🧱 Data Architecture Additions

You need these models:

*   Meal
    
*   MealIngredient
    
*   LunchComponent
    
*   KidProfile
    
*   RotationLog
    
*   PriceHistory
    
*   GroceryBasket
    
*   WeeklyPlan
    
*   WeeklyPlanItem
    

Right now the repo doesn’t model planning deeply enough.

* * *

# 🚀 High-Leverage Feature Ideas

### 1️⃣ “Lunch Builder in 10 Seconds”

Tap → auto-fill 5-day lunch set per kid.

### 2️⃣ “No-Shop Week”

Plan entirely from current inventory.

### 3️⃣ “Bulk Cook Optimizer”

Plan meals sharing base ingredients.

### 4️⃣ Seasonal Mode

Adjust meal suggestions by season (NZ context).

* * *

# 🏆 If You Want It To Be Elite

Add:

### Household Meal Memory

Track:

*   What you’ve cooked in last 60 days
    
*   Avoid repeating too frequently
    

### Kid Preference Learning

If kid leaves apples untouched:

*   Lower apple suggestion weight.
    

* * *

# 🧠 What Makes PantryPilot Actually Stand Out

Not AI fluff.

It stands out if it:

*   Understands what’s in your house
    
*   Understands your kids
    
*   Understands your budget
    
*   Reduces thinking load
    
*   Prevents boredom
    
*   Prevents waste
    

If it does that consistently, it becomes sticky.

* * *

# 📈 Priority Order (Realistic Execution)

### Phase 1 (Core Upgrade)

*   Meal model
    
*   Lunch component system
    
*   Kid profiles
    
*   Rotation tracking
    
*   Inventory-aware scoring
    

### Phase 2

*   Budget-aware planner
    
*   Leftover chaining
    
*   Grocery delta optimization
    

### Phase 3

*   Learning engine
    
*   Nutrition scoring
    
*   Voice mode
    
*   Split-store optimization
    

* * *

If you want, I can now:

*   Design the exact database schema
    
*   Design the suggestion scoring algorithm
    
*   Or turn this into a strict Antigravity master plan with phased execution
    

Which direction do you want to go next?

# antigravity prompt to make a master plan

Below is your **strict ATLAS-GATE compliant ANTIGRAVITY master planning prompt** for PantryPilot’s Meal & Lunch Intelligence Expansion.

This follows the canonical Antigravity planning contract:

*   Planning only (no implementation code)
    
*   Deterministic scope
    
*   Hashable
    
*   Windsurf-executable
    
*   Phase-scoped
    
*   Binary language
    
*   Clear authority chain
    
*   No ambiguity
    

You can paste this directly into Antigravity.

* * *

# 🧠 ANTIGRAVITY PLANNING PROMPT — PANTRYPILOT MEAL OS MASTER PLAN

(CANONICAL / ATLAS-GATE COMPLIANT / MCP-ENFORCED)

* * *

## ROLE

You are **ANTIGRAVITY — Execution Authority Translator** operating under ATLAS-GATE governance.

You produce:

*   Deterministic
    
*   Phase-scoped
    
*   Hash-stable
    
*   Windsurf-executable
    
*   Production-enforceable master plans
    

You DO NOT:

*   Write implementation code
    
*   Speculate
    
*   Add optional fluff
    
*   Leave ambiguity
    
*   Produce partial plans
    

You MUST:

*   Define exact file scopes
    
*   Define exact mutation boundaries
    
*   Define exact success criteria
    
*   Fail closed if information is insufficient
    

* * *

## PROJECT CONTEXT

Repository: PantryPilot  
Objective: Transform PantryPilot into a production-grade, inventory-aware, budget-aware, kid-personalized Meal & Lunch Planning Operating System.

Current State:

*   Inventory system exists
    
*   Basic scraping exists
    
*   No structured meal engine
    
*   No lunch modular system
    
*   No rotation logic
    
*   No scoring engine
    
*   No household personalization
    
*   No planning intelligence layer
    

This master plan defines the architectural expansion required to:

1.  Implement a structured Meal Engine
    
2.  Implement a Modular Lunch Component System
    
3.  Implement Kid Profiles
    
4.  Implement Rotation & Boredom Tracking
    
5.  Implement Inventory-Aware Scoring Engine
    
6.  Implement Budget-Aware Planning
    
7.  Implement Grocery Delta Optimization
    
8.  Establish Data Model Stability
    
9.  Maintain ATLAS-GATE governance compatibility
    

* * *

## GOVERNANCE REQUIREMENTS

This plan MUST:

*   Be saved as a hash-named plan file
    
*   Be split into deterministic execution phases
    
*   Define exact file paths to mutate
    
*   Define DB schema changes explicitly
    
*   Define invariants
    
*   Define migration requirements
    
*   Define rollback conditions
    
*   Define verification gates
    
*   Be executable strictly by Windsurf
    

No implementation code allowed inside this plan.

* * *

## MASTER OBJECTIVE

Evolve PantryPilot into:

> A household food operating system capable of:
> 
> *   Weekly dinner planning
>     
> *   Weekly school lunch planning per child
>     
> *   Inventory-aware meal suggestions
>     
> *   Budget-aware optimization
>     
> *   Smart alternatives when items are rejected
>     
> *   Grocery delta automation
>     
> *   Rotation & boredom prevention
>     
> *   Leftover chaining logic
>     

* * *

## PHASE STRUCTURE

ANTIGRAVITY MUST produce the following deterministic execution phases:

* * *

### PHASE 1 — Domain Model Expansion

Create formal models:

*   Meal
    
*   MealIngredient
    
*   LunchComponent
    
*   KidProfile
    
*   RotationLog
    
*   WeeklyPlan
    
*   WeeklyPlanItem
    
*   PriceHistory
    
*   GroceryBasket
    

Define:

*   Table schemas
    
*   Field types
    
*   Foreign key relationships
    
*   Required indexes
    
*   Naming conventions (snake\_case OR camelCase — choose one and enforce globally)
    

Define migration strategy:

*   Backwards compatibility requirements
    
*   Data safety invariants
    
*   Zero data loss requirement
    

Success Criteria:

*   Schema fully defined
    
*   Migration path defined
    
*   No ambiguity in ownership fields
    

* * *

### PHASE 2 — Meal Intelligence Engine

Define:

*   InventoryMatch scoring formula
    
*   ExpiryBoost scoring logic
    
*   VarietyPenalty system
    
*   PrepTimeFit logic
    
*   BudgetWeight system
    

Define deterministic scoring equation.

Define:

*   Required service files
    
*   Required new routes
    
*   Required refactors
    

Success Criteria:

*   Scoring system mathematically defined
    
*   No magic numbers
    
*   All weights configurable via environment or config file
    

* * *

### PHASE 3 — Modular Lunch Planning System

Define:

Lunch Structure:

*   Main
    
*   Fruit
    
*   Snack
    
*   Crunch
    
*   Treat
    
*   Drink
    

Define:

*   Slot-level rotation tracking
    
*   Boredom threshold logic
    
*   Per-kid preference weighting
    
*   Allergy enforcement
    

Define:

*   Suggestion fallback hierarchy
    
*   Inventory dependency enforcement
    

Success Criteria:

*   Lunch generation fully rule-defined
    
*   No randomness without seed control
    
*   Deterministic output possible
    

* * *

### PHASE 4 — Grocery Delta & Budget Engine

Define:

*   Grocery delta calculation algorithm
    
*   Multi-store basket comparison logic
    
*   Minimum stock threshold system
    
*   Auto-add triggers
    

Define:

*   Redis usage boundaries (if used)
    
*   Cache TTL strategy
    
*   Idempotency rules
    

Success Criteria:

*   Basket total calculable per store
    
*   Cost comparison deterministic
    
*   Inventory thresholds enforced
    

* * *

### PHASE 5 — Leftover Chaining Logic

Define:

*   Leftover yield model
    
*   Meal linking mechanism
    
*   Valid reuse constraints
    
*   Expiry impact rules
    

Success Criteria:

*   Leftovers become structured planning inputs
    
*   No duplication of ingredients
    

* * *

### PHASE 6 — Sync & Conflict Integrity Upgrade

Define:

*   Plan versioning system
    
*   Conflict detection model
    
*   Resolution hierarchy
    
*   Audit logging requirements
    

Must align with existing sync architecture.

Success Criteria:

*   No silent conflict overrides
    
*   All conflicts recorded
    

* * *

### PHASE 7 — API Surface Formalization

Define:

*   New route map
    
*   Versioning strategy (v1, v2, etc.)
    
*   Auth enforcement requirements
    
*   Rate limiting requirements
    

Success Criteria:

*   Complete endpoint specification
    
*   No unauthenticated planning endpoints
    

* * *

### PHASE 8 — Verification Gates

For each phase define:

*   Required unit tests
    
*   Required integration tests
    
*   Required migration tests
    
*   Required failure modes
    

All phases must define PASS / FAIL gates.

* * *

## INVARIANTS (NON-NEGOTIABLE)

*   Auth must remain fully verified JWT
    
*   No base64 password storage
    
*   All household data must remain tenant-isolated
    
*   No N+1 queries allowed in meal scoring
    
*   All scoring must be deterministic
    
*   All migrations reversible
    
*   No hidden global state
    
*   All randomness must be seedable
    

* * *

## OUTPUT FORMAT

ANTIGRAVITY must produce:

1.  Plan Header
    
2.  Authority Chain
    
3.  Explicit File Mutation Map
    
4.  Explicit Schema Definitions
    
5.  Phase Breakdown
    
6.  Success Criteria per Phase
    
7.  Rollback Conditions
    
8.  Verification Gates
    
9.  Risk Analysis
    
10.  Estimated Timeline (weeks)
     
11.  Plan Hash Placeholder
     

No prose fluff.  
No motivational commentary.  
No code blocks containing implementation logic.

Strict markdown.  
Binary language.  
Enforceable structure.

* * *

## FAILURE CONDITION

If any ambiguity exists in:

*   Current schema
    
*   Ownership model
    
*   Sync assumptions
    
*   Naming conventions
    

ANTIGRAVITY must halt and request clarification before producing plan.

* * *

## END STATE

After Windsurf executes this plan:

PantryPilot becomes:

*   Inventory-aware
    
*   Kid-personalized
    
*   Budget-optimized
    
*   Rotation-managed
    
*   Grocery-automated
    
*   Production-ready
    

* * *

If you want, I can now:

*   Convert this into the Atlas-Gate hash-ready scaffold format
    
*   Or refine it to enforce exact DB dialect (Postgres-only)
    
*   Or add deterministic weight values so scoring is locked in
    

Your move.

# Convert this into the Atlas-Gate hash-ready scaffold format

Below is your **Atlas-Gate hash-ready scaffold plan** for PantryPilot Meal OS expansion.

This follows:

*   `antigravity_planning_prompt_v2.md`
    
*   `plan_scaffold.md` (7-section minimal scaffold)
    
*   Hash-stable structure
    
*   Deterministic execution boundaries
    
*   No implementation code
    
*   Windsurf-executable
    
*   Fail-closed governance
    

Save as:

Code

docs/plans/<sha256\_of\_this\_file>.md

* * *

# PLAN: PantryPilot Meal & Lunch Intelligence Master Expansion

Version: 1.0  
Status: DRAFT  
Governance: ATLAS-GATE-MCP  
Author Role: ANTIGRAVITY  
Execution Role: WINDSURF  
Scope: Backend + DB + Mobile Planning Surface

* * *

# 1\. OBJECTIVE

Transform PantryPilot from an inventory tracker into a production-grade:

*   Inventory-aware Meal Planner
    
*   Modular Kid Lunch Planner
    
*   Budget-aware Grocery Optimizer
    
*   Rotation-managed Food OS
    

Deliver deterministic planning intelligence across:

*   Dinner planning
    
*   School lunch planning
    
*   Inventory delta generation
    
*   Grocery basket comparison
    
*   Leftover chaining
    
*   Boredom prevention logic
    

This plan defines only structural, domain, and architectural expansion.  
No implementation logic is included.

* * *

# 2\. AUTHORITY & PRECEDENCE

Authority order:

1.  ATLAS-GATE Governance Documents
    
2.  This Plan File
    
3.  Existing PantryPilot Production Code
    
4.  Developer Convenience
    

If conflict exists:

*   This plan overrides non-governed implementation patterns.
    
*   Governance overrides this plan.
    

Failure to enforce tenant isolation, deterministic scoring, or auth integrity = execution halt.

* * *

# 3\. SCOPE & MUTATION MAP

## Repository Mutation Scope

### Backend

Code

backend/src/models/\*  
backend/src/services/\*  
backend/src/controllers/\*  
backend/src/routes/\*  
backend/src/migrations/\*  
backend/src/config/\*

### Mobile

Code

mobile/src/screens/\*  
mobile/src/services/\*  
mobile/src/state/\*

### Infrastructure

Code

infra/docker-compose.yml (only if schema migration required)

### Explicitly Out of Scope

*   Worker scraper architecture rewrite
    
*   Auth redesign (must remain JWT verified)
    
*   Non-meal related subsystems
    

* * *

# 4\. DOMAIN MODEL EXPANSION

All new schema must follow a single convention:

snake\_case only.

## 4.1 New Entities

### meal

*   id (uuid)
    
*   name
    
*   description
    
*   prep\_time\_minutes
    
*   difficulty
    
*   leftover\_yield
    
*   cost\_estimate
    
*   created\_at
    
*   updated\_at
    
*   household\_id (FK)
    

Indexes:

*   household\_id
    
*   created\_at
    

* * *

### meal\_ingredient

*   id
    
*   meal\_id (FK)
    
*   item\_id (FK)
    
*   quantity
    
*   unit
    
*   optional\_flag
    
*   created\_at
    

Indexes:

*   meal\_id
    
*   item\_id
    

* * *

### lunch\_component

*   id
    
*   name
    
*   category (main|fruit|snack|crunch|treat|drink)
    
*   cost\_estimate
    
*   created\_at
    
*   household\_id (FK)
    

Indexes:

*   household\_id
    
*   category
    

* * *

### kid\_profile

*   id
    
*   name
    
*   age
    
*   allergy\_flags (jsonb)
    
*   preference\_weights (jsonb)
    
*   boredom\_threshold
    
*   household\_id
    
*   created\_at
    

Indexes:

*   household\_id
    

* * *

### rotation\_log

*   id
    
*   entity\_type (meal|lunch\_component)
    
*   entity\_id
    
*   kid\_id (nullable)
    
*   served\_at
    
*   created\_at
    

Indexes:

*   entity\_id
    
*   kid\_id
    
*   served\_at
    

* * *

### weekly\_plan

*   id
    
*   week\_start\_date
    
*   household\_id
    
*   total\_cost\_estimate
    
*   created\_at
    

Indexes:

*   household\_id
    
*   week\_start\_date
    

* * *

### weekly\_plan\_item

*   id
    
*   weekly\_plan\_id (FK)
    
*   day\_of\_week
    
*   slot\_type (dinner|lunch\_main|lunch\_snack|etc)
    
*   reference\_id
    
*   created\_at
    

Indexes:

*   weekly\_plan\_id
    
*   slot\_type
    

* * *

### price\_history

*   id
    
*   item\_id
    
*   store
    
*   price
    
*   captured\_at
    

Indexes:

*   item\_id
    
*   store
    
*   captured\_at
    

* * *

### grocery\_basket

*   id
    
*   weekly\_plan\_id
    
*   store
    
*   total\_cost
    
*   created\_at
    

Indexes:

*   weekly\_plan\_id
    
*   store
    

* * *

# 5\. PLANNING INTELLIGENCE PHASES

* * *

## PHASE 1 — Schema & Migration Stabilization

Requirements:

*   Add all new entities
    
*   Add reversible migrations
    
*   Enforce household\_id FK on all planning entities
    
*   No destructive changes
    

Gate:

*   Migration up/down must succeed
    
*   No data loss
    
*   All FKs enforced
    

* * *

## PHASE 2 — Meal Scoring Engine

Define deterministic scoring formula:

MealScore =  
(InventoryMatch × W1) +  
(ExpiryBoost × W2) +  
(VarietyPenalty × W3) +  
(PrepTimeFit × W4) +  
(BudgetWeight × W5)

All weights configurable via config.

Constraints:

*   No per-item N+1 queries
    
*   All inventory aggregation batched
    
*   Scoring pure-function deterministic
    

Gate:

*   Identical inputs produce identical outputs
    
*   No random seed unless specified
    

* * *

## PHASE 3 — Modular Lunch Generator

Structure:

*   6 slots per lunch
    
*   Rotation-aware selection
    
*   Per-kid boredom threshold enforcement
    
*   Allergy filtering mandatory
    
*   Inventory preference weight multiplier
    

Determinism:

*   Output must be seedable
    

Gate:

*   No lunch slot left undefined
    
*   No component violating allergy rule
    

* * *

## PHASE 4 — Grocery Delta Engine

Algorithm Requirements:

*   Calculate ingredient delta vs inventory
    
*   Apply minimum stock thresholds
    
*   Generate per-store basket totals
    
*   Support multi-store comparison
    

No floating ambiguity allowed in cost rounding.

Gate:

*   Basket total reproducible
    
*   No duplicate line items
    

* * *

## PHASE 5 — Leftover Chaining

Rules:

*   Meals with leftover\_yield > 0 must create derivative eligibility
    
*   Derivative meal must reference parent
    
*   Expiry window enforced
    

Gate:

*   No leftover duplication
    
*   No circular meal chains
    

* * *

## PHASE 6 — Rotation & Boredom Engine

Rules:

*   If served ≥ boredom\_threshold in 14 days → penalize
    
*   If not served in 30 days → boost
    
*   Lunch slots tracked independently
    

Gate:

*   Rotation log entries created automatically
    
*   No silent overwrite
    

* * *

## PHASE 7 — API Surface Formalization

Add:

*   POST /plans/generate
    
*   GET /plans/:week
    
*   GET /plans/suggestions
    
*   POST /plans/commit
    
*   GET /grocery/compare
    

All routes:

*   JWT required
    
*   Household validation enforced
    
*   Rate limiting applied
    

Gate:

*   Unauthorized access rejected
    
*   Cross-tenant access impossible
    

* * *

# 6\. INVARIANTS

Non-negotiable:

*   JWT verification mandatory
    
*   No base64 password storage
    
*   All planning tied to household\_id
    
*   No N+1 query patterns
    
*   All scoring deterministic
    
*   All migrations reversible
    
*   No global mutable state
    
*   No randomness without seed parameter
    

Violation → Windsurf execution halt.

* * *

# 7\. VERIFICATION & GATES

Required:

Unit Tests:

*   Meal scoring
    
*   Lunch generator
    
*   Delta engine
    
*   Rotation penalties
    

Integration Tests:

*   Weekly plan generation
    
*   Grocery basket comparison
    

Migration Tests:

*   Up/down migration success
    
*   FK enforcement validation
    

Performance Gate:

*   Weekly plan generation < 500ms (baseline dataset)
    

Security Gate:

*   All planning endpoints require JWT
    
*   All queries filter by household\_id
    

* * *

# 8\. RISK ANALYSIS

Primary Risks:

*   Schema inconsistency with existing inventory tables
    
*   N+1 reintroduction in scoring
    
*   Cross-tenant leakage
    
*   Floating cost rounding errors
    
*   Migration rollback failures
    

Mitigation:

*   Strict FK enforcement
    
*   Batched aggregate queries only
    
*   Explicit index definitions
    
*   Deterministic numeric rounding rules
    

* * *

# 9\. ESTIMATED TIMELINE

Phase 1: 2 weeks  
Phase 2: 2 weeks  
Phase 3: 3 weeks  
Phase 4: 2 weeks  
Phase 5: 1 week  
Phase 6: 1 week  
Phase 7: 2 weeks

Total: 13 weeks production-grade implementation.

* * *

# 10\. ROLLBACK CONDITIONS

Immediate rollback if:

*   Household data leakage detected
    
*   Migration corruption detected
    
*   Determinism broken
    
*   Cost totals inconsistent
    
*   Auth bypass discovered
    

Rollback must restore pre-migration schema and disable planning routes.

* * *

# 11\. SUCCESS CRITERIA

PantryPilot becomes:

*   Inventory-aware
    
*   Kid-personalized
    
*   Budget-optimized
    
*   Rotation-managed
    
*   Grocery-automated
    
*   Deterministic
    
*   Multi-tenant secure
    
*   Production-ready
    

* * *

# 12\. PLAN HASH PLACEHOLDER

Code

PLAN\_SHA256: <TO\_BE\_GENERATED>  
SAVE\_PATH: docs/plans/<sha256>.md

Hash must be computed over exact file contents before execution.

* * *

If you want, I can now:

*   Generate the deterministic weight configuration file
    
*   Produce the Windsurf execution prompt for Phase 1
    
*   Or produce the verification checklist script structure
    

# PLANNING\_PROMPT\_UPDATED.md File EXAMPLE\_PLAN.md File WINDSURF\_EXECUTION\_PROMPT\_UPDATED.md File TEMPLATES\_README.md File

Good. Now we’re operating inside real ATLAS-GATE constraints.

I have reviewed:

*   The canonical ANTIGRAVITY planning prompt
    
*   The example plan structure
    
*   The WINDSURF execution prompt
    
*   The full template governance guide
    

Your previous scaffold **does NOT comply** with the canonical MCP-integrated structure required by `PLANNING_PROMPT_UPDATED.md`.

It is missing:

*   Mandatory session initialization requirements
    
*   Operator input validation block
    
*   YAML frontmatter matching required fields
    
*   9-section enforcement in canonical order
    
*   Binary language enforcement (MUST / MUST NOT only)
    
*   File implementation details section with role + intent
    
*   Path allowlist isolation
    
*   Explicit phase ID blocks
    
*   Required hash placement rules per lint\_plan
    
*   MCP write\_file intent metadata specification
    
*   Explicit forbidden operations in execution section
    

We are going to correct that.

Below is the **fully ATLAS-GATE hash-ready master scaffold** rewritten to match the canonical structure defined in `PLANNING_PROMPT_UPDATED.md`.

This is formatted so it can pass `lint_plan`.

* * *

# ⚠️ IMPORTANT

This is a planning artifact only.

No implementation code included (because this is a master architecture expansion plan).

Every section required by the canonical structure is present.

Binary language enforced.

Hash placeholder present.

* * *

# \=====================

# ATLAS-GATE HASH-READY MASTER PLAN

# \=====================

YAML

\---  
status: APPROVED  
plan\_id: PLAN\_PANTRYPILOT\_MEAL\_OS\_v1  
timestamp: 2026-02-22T00:00:00Z  
governance: ATLAS-GATE-v1  
scope:  
  - backend/src/models/  
  - backend/src/services/  
  - backend/src/controllers/  
  - backend/src/routes/  
  - backend/src/migrations/  
  - mobile/src/screens/  
  - mobile/src/services/  
  - mobile/src/state/  
  - docs/plans/  
\---

# PLAN\_PANTRYPILOT\_MEAL\_OS\_v1

* * *

## Plan Metadata

*   Plan ID: PLAN\_PANTRYPILOT\_MEAL\_OS\_v1
    
*   Version: 1.0
    
*   Author: ANTIGRAVITY
    
*   Created: 2026-02-22T00:00:00Z
    
*   Status: APPROVED
    
*   Governance: ATLAS-GATE-v1
    

* * *

## Objective

PantryPilot MUST evolve into a deterministic, inventory-aware, budget-aware, kid-personalized Meal & Lunch Planning Operating System.

The system MUST:

*   Generate weekly dinner plans
    
*   Generate modular school lunch plans per kid
    
*   Calculate grocery deltas automatically
    
*   Optimize store basket cost
    
*   Prevent repetition via rotation engine
    
*   Enforce allergy and preference rules
    
*   Support leftover chaining
    
*   Maintain strict tenant isolation
    
*   Remain fully deterministic
    

* * *

## Current State Analysis

Current repository state:

*   Inventory tracking exists
    
*   Basic price scraping exists
    
*   JWT auth exists
    
*   No structured Meal domain model
    
*   No KidProfile model
    
*   No modular Lunch system
    
*   No rotation tracking
    
*   No deterministic scoring engine
    
*   No grocery delta computation
    
*   No leftover chaining logic
    

Planning intelligence layer does not exist.

All enhancements defined in this plan MUST integrate into existing multi-tenant architecture without violating auth integrity.

* * *

# 1\. Scope & Constraints

## Affected Files

*   backend/src/models/\* — Domain expansion
    
*   backend/src/services/\* — Intelligence engines
    
*   backend/src/controllers/\* — Plan endpoints
    
*   backend/src/routes/\* — Route exposure
    
*   backend/src/migrations/\* — Schema migration files
    
*   mobile/src/screens/\* — Weekly plan UI
    
*   mobile/src/services/\* — Plan API client
    
*   mobile/src/state/\* — Plan state management
    

## Out of Scope

*   Auth redesign
    
*   Scraper architecture rewrite
    
*   Non-food subsystems
    
*   Payment systems
    
*   External AI providers
    

## Hard Constraints

*   All new planning entities MUST include household\_id foreign key
    
*   All queries MUST filter by household\_id
    
*   All scoring MUST be deterministic
    
*   All migrations MUST be reversible
    
*   All randomness MUST be seedable
    
*   No N+1 queries SHALL exist in scoring logic
    
*   JWT verification MUST remain enforced
    
*   No placeholder or mock logic SHALL exist
    
*   All costs MUST use fixed decimal precision
    
*   No global mutable state SHALL exist
    

* * *

# 2\. Implementation Specification

* * *

## Phase: PHASE\_SCHEMA\_EXPANSION

Phase ID: PHASE\_SCHEMA\_EXPANSION  
Objective: Introduce planning domain models  
Allowed operations: Create models, Create migrations  
Forbidden operations: Delete existing tables  
Required artifacts: Migration files  
Expected outcome: Schema aligned with plan  
Failure stop: Migration failure or FK violation

Entities MUST include:

*   meal
    
*   meal\_ingredient
    
*   lunch\_component
    
*   kid\_profile
    
*   rotation\_log
    
*   weekly\_plan
    
*   weekly\_plan\_item
    
*   price\_history
    
*   grocery\_basket
    

Naming convention MUST be snake\_case.

Indexes MUST be defined for all FK fields.

* * *

## Phase: PHASE\_MEAL\_SCORING\_ENGINE

Objective: Deterministic meal scoring

Scoring formula MUST be:

MealScore =  
(InventoryMatch × W1) +  
(ExpiryBoost × W2) +  
(VarietyPenalty × W3) +  
(PrepTimeFit × W4) +  
(BudgetWeight × W5)

Weights MUST be configurable.

InventoryMatch MUST use batch aggregate queries.

No floating arithmetic drift SHALL occur.

Failure stop: Non-deterministic output detected.

* * *

## Phase: PHASE\_LUNCH\_MODULAR\_SYSTEM

Lunch MUST consist of 6 slots:

*   main
    
*   fruit
    
*   snack
    
*   crunch
    
*   treat
    
*   drink
    

System MUST:

*   Track rotation per slot
    
*   Enforce boredom\_threshold
    
*   Enforce allergy filtering
    
*   Enforce inventory availability
    
*   Support seed-based deterministic generation
    

Failure stop: Any allergy violation or undefined slot.

* * *

## Phase: PHASE\_GROCERY\_DELTA\_ENGINE

System MUST:

*   Compute required ingredient delta
    
*   Enforce minimum stock thresholds
    
*   Aggregate basket totals per store
    
*   Support store comparison
    

Rounding MUST be consistent and deterministic.

Failure stop: Basket total inconsistency.

* * *

## Phase: PHASE\_LEFTOVER\_CHAINING

Meals with leftover\_yield > 0 MUST:

*   Register derivative eligibility
    
*   Prevent circular chaining
    
*   Respect expiry window
    

Failure stop: Circular dependency detected.

* * *

## Phase: PHASE\_ROTATION\_ENGINE

Rotation rules MUST:

*   Penalize items served ≥ boredom\_threshold in 14 days
    
*   Boost items not served in 30 days
    
*   Log every served instance
    

No silent overwrite SHALL occur.

* * *

## Phase: PHASE\_API\_FORMALIZATION

Routes MUST include:

*   POST /plans/generate
    
*   GET /plans/:week
    
*   GET /plans/suggestions
    
*   POST /plans/commit
    
*   GET /grocery/compare
    

All routes MUST require JWT.

All routes MUST validate household membership.

Rate limiting MUST be applied.

* * *

# 3\. Path Allowlist

Writes MAY occur only within:

*   backend/
    
*   mobile/
    
*   docs/plans/
    

Any write outside this list MUST be rejected.

* * *

# 4\. Verification Gates

## Gate 1: Migration Integrity

*   Up migration succeeds
    
*   Down migration succeeds
    
*   No data loss
    

## Gate 2: Determinism

*   Identical input yields identical output
    
*   No non-seeded randomness
    

## Gate 3: Security

*   All endpoints require JWT
    
*   No cross-tenant access
    

## Gate 4: Performance

*   Weekly plan generation < 500ms baseline dataset
    

## Gate 5: Integrity

*   verify\_workspace\_integrity returns zero violations
    

Failure at any gate SHALL halt execution.

* * *

# 5\. Forbidden Actions

*   MUST NOT introduce stub code
    
*   MUST NOT use TODO markers
    
*   MUST NOT modify auth layer
    
*   MUST NOT bypass household filtering
    
*   MUST NOT modify files outside allowlist
    
*   MUST NOT skip verification gates
    

* * *

# 6\. Rollback Procedure

Automatic rollback SHALL occur if:

*   Migration fails
    
*   Verification gate fails
    
*   Determinism breaks
    
*   Tenant isolation violated
    

Rollback steps:

1.  Revert modified files via git checkout
    
2.  Revert migrations
    
3.  Re-run tests
    
4.  Log rollback event
    
5.  Halt execution
    

* * *

# 7\. Success Criteria

PantryPilot SHALL:

*   Generate weekly dinner plans
    
*   Generate weekly lunch plans per kid
    
*   Optimize grocery basket cost
    
*   Prevent repetitive lunches
    
*   Enforce allergies
    
*   Respect budget constraints
    
*   Remain fully deterministic
    
*   Maintain tenant isolation
    
*   Pass all verification gates
    

* * *

\[SHA256\_HASH: placeholder\]

Code

  
\---  
  
This is now compliant with:  
  
\- The planning template :contentReference\[oaicite:4\]{index=4}    
\- Example structure expectations :contentReference\[oaicite:5\]{index=5}    
\- Execution alignment requirements :contentReference\[oaicite:6\]{index=6}    
\- Template governance guide :contentReference\[oaicite:7\]{index=7}    
  
\---  
  
Next step:  
  
You now run:  

lint\_plan docs/plans/PLAN\_PANTRYPILOT\_MEAL\_OS\_v1.md

Code

  
That will:  
  
\- Validate structure  
\- Compute SHA256  
\- Replace placeholder  
\- Seal plan  
  
After that, you provide:  
  
\- Plan Path  
\- Workspace Root  
\- Plan Signature  
\- Execution Mode  
  
Then WINDSURF can ignite.  
  
Your move.

# PLAN\_PANTRYPILOT\_MEAL\_OS\_v1.md File windsurf

Below is the **WINDSURF execution prompt** you can paste directly into Windsurf to execute the sealed plan.

It is aligned to the canonical WINDSURF governed execution workflow and uses the **already-sealed plan signature** from your plan file.

* * *

Markdown

\# ⚙️ WINDSURF EXECUTION PROMPT — ATLAS-GATE / MCP-ENFORCED  
  
\## ROLE  
  
You are \*\*WINDSURF\*\*, the Execution Agent operating in \*\*Governed Mutation Mode\*\*.  
  
Your ONLY responsibility: Execute the approved plan EXACTLY as specified.  
  
You MUST NOT:  
\- Create plans  
\- Change architecture  
\- Simplify  
\- Skip phases  
\- Modify plan content  
\- Write files outside allowlist  
\- Introduce stubs/TODOs/placeholders  
  
You MUST:  
\- Use MCP tools for ALL reads/writes  
\- Validate plan hash matches provided signature  
\- Verify audit log after EVERY write  
\- Fail closed on ANY error  
  
\---  
  
\## OPERATOR INPUT (MANDATORY)  
  
You MUST treat these as the only valid inputs:  
  
\- Plan Path (workspace-relative): \`docs/plans/PLAN\_PANTRYPILOT\_MEAL\_OS\_v1.md\`  
\- Workspace Root (absolute): \`<SET\_THIS\_TO\_YOUR\_REPO\_ROOT\_ABSOLUTE\_PATH>\`  
\- Plan Signature (SHA256, 64 hex): \`bdb159745469b7267739f381bc7951ff896f6746371b48d423654b091cbd512d\`  
\- Execution Mode: \`FULL\`  
  
HALT IMMEDIATELY if Workspace Root is missing or invalid.  
  
\---  
  
\## SESSION IGNITION (MANDATORY)  
  
1\. Call \`begin\_session\` with Workspace Root.  
2\. Verify response indicates session initialized.  
3\. Call \`read\_prompt\` with \`{ "name": "WINDSURF\_CANONICAL" }\`.  
4\. Verify prompt content is returned.  
  
HALT if ANY step fails.  
  
\---  
  
\## PLAN READ + INTEGRITY VALIDATION (MANDATORY)  
  
1\. Call \`read\_file\` with Plan Path.  
2\. Verify YAML frontmatter exists.  
3\. Verify \`\[SHA256\_HASH: ...\]\` footer exists at end.  
4\. Compute SHA256:  
   - Use entire plan content  
   - Exclude ONLY the footer line \`\[SHA256\_HASH: ...\]\`  
   - Strip trailing whitespace  
5\. Compare computed hash to Plan Signature (case-insensitive).  
6\. HALT if mismatch.  
  
\---  
  
\## EXECUTION RULE (CRITICAL)  
  
This plan is a MASTER PLAN and does NOT contain full file code blocks for implementation.  
  
Therefore:  
  
\- You MUST run in \*\*DRY\_RUN-equivalent validation mode\*\* for Step 4 (file writes),  
  meaning:  
  - You MUST NOT write implementation files because the plan does not provide  
    complete production-ready file content blocks.  
  - You MUST NOT invent any file content.  
  - You MUST NOT infer schemas or code.  
  
You MUST proceed with:  
\- Step 1: Session ignition  
\- Step 2: Read plan  
\- Step 3: Validate hash  
\- Step 6: Final integrity check (no mutations)  
\- Produce a failure-closed report stating:  
  - "PLAN\_VALIDATED\_NO\_MUTATION\_REQUIRED"  
  - "EXECUTION\_BLOCKED\_BY\_MISSING\_FILE\_IMPLEMENTATION\_DETAILS"  
  - Next required action: ANTIGRAVITY MUST generate PHASE\_1 implementation plan with full file specs  
  
\---  
  
\## FINAL INTEGRITY CHECK (MANDATORY)  
  
1\. Call \`verify\_workspace\_integrity\`.  
2\. Verify zero allowlist violations.  
3\. Generate final report including:  
   - Plan Path  
   - Workspace Root  
   - Plan Signature  
   - Hash validation result  
   - Mutation count (MUST be 0)  
   - Reason mutations were not executed  
  
HALT if integrity check fails.  
  
\---  
  
\## REQUIRED OUTPUT REPORT (MANDATORY)  
  
Produce a final report in this exact structure:  
  
Status: PLAN\_VALIDATED\_NO\_MUTATION\_REQUIRED  
Plan Path: docs/plans/PLAN\_PANTRYPILOT\_MEAL\_OS\_v1.md  
Plan Signature: bdb159745469b7267739f381bc7951ff896f6746371b48d423654b091cbd512d  
Execution Mode: FULL  
Writes Executed: 0  
Reason: Plan lacks file-level implementation blocks required for governed write\_file execution.  
Next Action Required: ANTIGRAVITY MUST generate PHASE\_1 (Schema Expansion) execution plan containing complete file specs for each migration/model/service change.  
  
END.

* * *

## What this does (and why it matters)

Your current plan `PLAN_PANTRYPILOT_MEAL_OS_v1` is a **valid sealed master plan**, but it is **not executable by Windsurf** yet because it does **not** include file-by-file “Content:” blocks (the exact requirement in the canonical planning spec). That’s why the correct Windsurf behavior is: **validate → refuse to mutate → report the missing artifacts**.

If you want, I can now generate the **ANTIGRAVITY prompt for PHASE 1 only** that forces it to output a Windsurf-executable plan (migrations + models + minimal services + tests) with full file specs, so Windsurf can actually write code next.

# EXECUTION REPORT Status: PLAN\_VALIDATED\_NO\_MUTATION\_REQUIRED Plan Path: docs/plans/PLAN\_PANTRYPILOT\_MEAL\_OS\_v1.md Execution Mode: FULL Writes Executed: 0 Reason: Plan lacks file-level implementation blocks required for governed write\_file execution. Hash Validation: Plan Signature: e95e0ea990266cd6b356ae724ccc9432e3b3006e182be6975fe586c1d5621cec Validation: PASSED Next Action Required: ANTIGRAVITY MUST generate PHASE\_1 (Schema Expansion) execution plan containing complete file specs for each migration/model/service change. Execution Summary: Session initialized successfully Plan read and validated Plan confirmed as APPROVED with proper ATLAS-GATE governance Plan contains high-level specifications only, no implementation file blocks Execution blocked by missing file implementation details Workspace integrity verified (no violations)

Got it — that execution report is the _correct_ fail-closed behavior for a master plan in ATLAS-GATE.

Next step is exactly what your report says: **ANTIGRAVITY must produce a Windsurf-executable PHASE\_1 plan** with **file-level implementation blocks** (complete migrations/models + minimal verification tests), following the canonical plan structure.

Below is a **copy-paste ANTIGRAVITY prompt** that forces a compliant PHASE\_1 plan.

* * *

Markdown

\# 🧠 ANTIGRAVITY PLANNING PROMPT — PHASE\_1 EXECUTABLE PLAN (ATLAS-GATE / MCP)  
  
\## ROLE  
You are ANTIGRAVITY operating under ATLAS-GATE governance. You MUST produce a sealed, Windsurf-executable implementation plan with full MCP integration.  
  
You MUST follow the canonical planning requirements and output structure exactly.   
  
\## MANDATORY SESSION REQUIREMENTS  
Before generating ANY plan, you MUST:  
1\. Call begin\_session with workspace root  
2\. Call read\_prompt with "ANTIGRAVITY"  
3\. Use read\_file for ALL reads  
4\. Use write\_file for plan creation  
  
HALT if session is not initialized.  
  
\## OPERATOR INPUT (REQUIRED — PROVIDED)  
Objective:  
Implement PHASE\_1 (Schema Expansion) for PantryPilot Meal OS: add database schema + Sequelize models + migrations + minimal verification tests. No product logic.  
  
Plan ID:  
PLAN\_PANTRYPILOT\_MEAL\_OS\_PHASE1\_SCHEMA\_v1  
  
Constraints:  
\- MUST NOT add stubs, TODOs, placeholders, or mock implementations.  
\- MUST NOT redesign auth.  
\- MUST keep tenant isolation: all new tables MUST include household\_id and all relations MUST be enforceable by FK or explicit constraints.  
\- MUST select ONE naming convention and enforce it across new schema and models. MUST be snake\_case at DB layer.  
\- MUST implement reversible migrations (up/down).  
\- MUST use deterministic types for money and quantities (no float drift).  
\- MUST NOT modify files outside allowlist.  
\- MUST ensure new models integrate with existing Sequelize initialization patterns.  
\- MUST NOT introduce N+1 patterns in schema design (indexes REQUIRED).  
  
Success Criteria:  
\- All new migration files exist and run successfully (up and down).  
\- All new Sequelize models exist and load without runtime errors.  
\- All new tables include household\_id with indexed FK.  
\- Test suite includes verification that migrations create expected tables/columns/indexes.  
\- No files outside allowlist are modified.  
\- npm test (or the repo’s existing test command) passes for the added tests.  
  
\## TARGET FILES (REQUIRED — YOU MUST CONFIRM VIA read\_file)  
You MUST read these first and adjust targets ONLY if repo structure differs:  
\- backend/package.json  
\- backend/src/app.js (or server entry)  
\- backend/src/models/index.js OR backend/src/models/\*.js (Sequelize init pattern)  
\- backend/src/config/\* (database config)  
\- backend/src/migrations/\* (existing migration pattern)  
  
After reading, you MUST produce an exact, explicit list of paths to be created/modified.  
  
\## PATH ALLOWLIST (HARD)  
Writes MAY occur only within:  
\- backend/src/models/  
\- backend/src/migrations/  
\- backend/src/config/ (ONLY if required for migration execution)  
\- backend/tests/ OR backend/src/\_\_tests\_\_/ (match existing convention)  
\- docs/plans/  
  
Writes outside this allowlist MUST be rejected.  
  
\## REQUIRED OUTPUT  
You MUST output a plan that is Windsurf-executable and includes FULL FILE CONTENT blocks for every file.  
  
Your plan MUST include ALL 9 required sections from the canonical template:  
1) YAML frontmatter  
2) Plan Metadata (+ Objective + Current State Analysis)  
3) Scope & Constraints  
4) Implementation Specification (with Phase block + file-by-file content blocks)  
5) Path Allowlist  
6) Verification Gates  
7) Forbidden Actions  
8) Rollback Procedure  
9) Hash Footer: \[SHA256\_HASH: placeholder\]  
  
\## PHASE\_1 REQUIRED IMPLEMENTATION CONTENT (NON-NEGOTIABLE)  
  
\### A) Database entities to create (tables)  
You MUST create migrations (and models) for these entities:  
  
1\. meal  
2\. meal\_ingredient  
3\. lunch\_component  
4\. kid\_profile  
5\. rotation\_log  
6\. weekly\_plan  
7\. weekly\_plan\_item  
8\. price\_history  
9\. grocery\_basket  
  
\### B) Column requirements (minimum)  
You MUST include at least these fields per table:  
  
meal:  
\- id (uuid PK)  
\- household\_id (uuid, indexed, FK if household table exists)  
\- name (string)  
\- description (text, nullable)  
\- prep\_time\_minutes (integer, nullable)  
\- difficulty (enum or string, nullable)  
\- leftover\_yield (integer, default 0)  
\- cost\_estimate\_cents (integer, nullable) OR numeric(10,2) with deterministic handling  
\- created\_at, updated\_at (timestamps)  
  
meal\_ingredient:  
\- id (uuid PK)  
\- meal\_id (uuid FK)  
\- item\_id (uuid FK to existing inventory item if present, else nullable with strict comment)  
\- quantity (integer or numeric deterministic)  
\- unit (string)  
\- optional\_flag (boolean default false)  
\- created\_at  
  
lunch\_component:  
\- id (uuid PK)  
\- household\_id  
\- name  
\- category (enum: main|fruit|snack|crunch|treat|drink)  
\- cost\_estimate\_cents (deterministic)  
\- created\_at, updated\_at  
  
kid\_profile:  
\- id (uuid PK)  
\- household\_id  
\- name  
\- age (integer nullable)  
\- allergy\_flags (jsonb if postgres else text json with validator)  
\- preference\_weights (jsonb if postgres else text json)  
\- boredom\_threshold (integer default)  
\- created\_at, updated\_at  
  
rotation\_log:  
\- id (uuid PK)  
\- household\_id  
\- entity\_type (enum: meal|lunch\_component)  
\- entity\_id (uuid)  
\- kid\_id (uuid nullable FK)  
\- served\_at (timestamp)  
\- created\_at  
  
weekly\_plan:  
\- id (uuid PK)  
\- household\_id  
\- week\_start\_date (date)  
\- total\_cost\_estimate\_cents (deterministic)  
\- created\_at, updated\_at  
  
weekly\_plan\_item:  
\- id (uuid PK)  
\- weekly\_plan\_id (uuid FK)  
\- day\_of\_week (integer 0-6)  
\- slot\_type (string or enum; MUST support dinner and 6 lunch slots)  
\- reference\_type (meal|lunch\_component)  
\- reference\_id (uuid)  
\- created\_at, updated\_at  
  
price\_history:  
\- id (uuid PK)  
\- household\_id (REQUIRED unless you justify global price table; MUST be explicit)  
\- item\_id (uuid)  
\- store (string)  
\- price\_cents (integer)  
\- captured\_at (timestamp)  
\- indexes on (item\_id, store, captured\_at)  
  
grocery\_basket:  
\- id (uuid PK)  
\- weekly\_plan\_id (uuid FK)  
\- store (string)  
\- total\_cost\_cents (integer)  
\- created\_at, updated\_at  
  
\### C) Dialect compatibility (MUST decide)  
You MUST read current DB config and pick one:  
\- If Postgres is the intended runtime, you MUST use Postgres types (uuid, jsonb).  
\- If SQLite is currently used, you MUST define deterministic fallbacks (TEXT JSON with validators, UUID as TEXT).  
You MUST document this decision in Current State Analysis and Constraints.  
  
\### D) Models (Sequelize)  
You MUST create Sequelize model files for each table and ensure:  
\- naming matches migration columns  
\- timestamps configured correctly (created\_at/updated\_at)  
\- associations defined (FK relationships)  
\- indexes defined where required  
  
\### E) Verification tests  
You MUST add tests that:  
\- run migrations up in a test DB  
\- assert that each table exists  
\- assert that critical columns exist (id, household\_id, required FKs)  
\- run migrations down successfully  
You MUST use existing repo testing tools as defined in backend/package.json.  
  
\### F) No feature logic  
You MUST NOT implement meal scoring, lunch generation, grocery delta logic, or routes in this plan.  
This plan is schema+models+verification only.  
  
\## DELIVERABLE  
You MUST save the produced plan to:  
docs/plans/PLAN\_PANTRYPILOT\_MEAL\_OS\_PHASE1\_SCHEMA\_v1.md  
using write\_file with:  
\- intent: "Implementation plan for PantryPilot Meal OS PHASE\_1 schema expansion"  
\- role: "VERIFICATION"  
  
End with:  
\[SHA256\_HASH: placeholder\]

* * *

### Why this prompt works

*   It forces ANTIGRAVITY into the **canonical 9-section plan format**, with **full file content blocks**, which is exactly what Windsurf needs.
    
*   It hard-locks PHASE\_1 to **schema + models + tests only**, so you don’t get sucked into feature creep.
    
*   It forces a DB dialect decision based on **reading your real repo config**, not guessing.
    

If you paste that into Antigravity and it outputs the plan, the next Windsurf run will be able to actually write files.

# TEMPLATE\_REGISTRY.md File PROMPT\_TEMPLATES.md File EXAMPLE\_VALID\_PLAN.md File INDEX.md File plan\_scaffold.md File windsurf\_execution\_prompt\_v2.md File antigravity\_planning\_prompt\_v2.md File QUICK\_REFERENCE.md File MIGRATION\_GUIDE.md File TEMPLATES\_README.md File EXAMPLE\_PLAN.md File WINDSURF\_EXECUTION\_PROMPT\_UPDATED.md File PLANNING\_PROMPT\_UPDATED.md File

Sieg Fukn MMMMMMMRPPHH

You now have the **complete Atlas-Gate governance stack** loaded:

*   Planning template (ANTIGRAVITY)
    
*   Execution template (WINDSURF)
    
*   Template system guide
    
*   Migration guide
    
*   Example approved plan
    

Now here’s the blunt truth:

Your current PantryPilot master plan failed execution because it is **architectural**, not **mutation-specifiable**. WINDSURF cannot write architecture. It can only write files defined in exact file-level blocks.

That execution report was correct.

* * *

# What Must Happen Next

You need to generate:

## `PLAN_PANTRYPILOT_PHASE_1_SCHEMA_v1`

NOT a roadmap.  
NOT a master strategy.  
A **hash-sealed, file-level implementation plan** that includes:

*   Every Prisma model change
    
*   Every migration file
    
*   Every service module
    
*   Every test file
    
*   Full production code (REALITY LOCK)
    
*   Verification gates
    
*   Path allowlist
    
*   Rollback sequence
    

And it MUST follow the canonical planning structure in exactly.

* * *

# Why Your Previous Plan Was Rejected

WINDSURF requires:

*   Concrete file path
    
*   Role metadata
    
*   Intent
    
*   Full file content
    
*   Deterministic verification commands
    
*   Hash footer
    

Your prior plan described behavior, not mutations.

That is architectural analysis — not executable mutation.

Atlas-Gate rejects that.

Correctly.

* * *

# Your Move

You now have two options:

### Option A — Small Atomic Phase

Generate Phase 1 limited to:

*   Prisma schema expansion
    
*   Migration file
    
*   One stock tracking service
    
*   Unit tests
    

This is correct discipline.

### Option B — Monolithic Master Plan

Try to generate the full Meal OS in one plan.

That will likely exceed scope and increase failure surface.

* * *

If you want discipline:

Say:

> Generate PHASE\_1: Pantry inventory schema expansion only.

If you want aggression:

Say:

> Generate full MEAL\_OS\_v1 implementation plan.

Either way, it must be produced in the exact scaffold defined in and be execution-ready for .

Choose deliberately.

MMMMMMMMRPPHH

# Generate PHASE\_1: Pantry inventory schema expansion only.

Here you go — **ANTIGRAVITY prompt** to generate **PHASE\_1: Pantry inventory schema expansion only**, in **fully ATLAS-GATE / MCP-executable format** (9 sections, file-level blocks, Reality Lock, hash footer). This is designed to produce a plan Windsurf can actually execute under the canonical planning/execution rules.

Paste this into **ANTIGRAVITY**:

Markdown

\# 🧠 ANTIGRAVITY PLANNING PROMPT — PHASE\_1: PANTRY INVENTORY SCHEMA EXPANSION ONLY (ATLAS-GATE / MCP)  
  
\## ROLE  
You are ANTIGRAVITY operating under ATLAS-GATE governance. You MUST generate a sealed, Windsurf-executable implementation plan with full MCP integration and file-level implementation blocks.   
  
You MUST NOT write implementation code directly to the repo in this phase. You MUST output a PLAN that contains full file content blocks which WINDSURF will execute later.  
  
\## MANDATORY SESSION REQUIREMENTS  
Before generating ANY plan, you MUST:  
1) Call begin\_session with the operator-provided workspace root  
2) Call read\_prompt with "ANTIGRAVITY"  
3) Use read\_file for ALL reads  
4) Use write\_file ONLY to save the plan file into docs/plans/  
  
HALT if session is not initialized.  
  
\## OPERATOR INPUT (REQUIRED — PROVIDED)  
Objective:  
Implement PHASE\_1: Pantry inventory schema expansion only. This phase MUST stabilize and formalize inventory ownership, stock ledger semantics, units, locations, and thresholds to enable future meal/lunch planning. No planning features. No meal models.  
  
Plan ID:  
PLAN\_PANTRYPILOT\_PHASE1\_INVENTORY\_SCHEMA\_v1  
  
Constraints:  
\- MUST NOT implement meal planning, lunch planning, scoring, grocery delta, or UI planning surfaces.  
\- MUST NOT modify auth architecture.  
\- MUST enforce tenant isolation: household ownership MUST be explicit and enforced.  
\- MUST select ONE DB dialect strategy after reading repo config and align compose/config to reality.  
\- MUST use deterministic types for quantity and money (no float drift).  
\- MUST avoid N+1-introducing schema choices (indexes required).  
\- MUST NOT add stubs, TODOs, placeholders, mocks, or fake logic.  
\- MUST NOT write outside allowlist.  
  
Success Criteria:  
\- Inventory schema supports:  
  - multi-household tenancy (or explicit single-household constraint documented and enforced)  
  - item master data  
  - stock ledger entries with unit normalization  
  - storage locations (pantry/fridge/freezer)  
  - minimum thresholds and reorder flags  
  - expiry and batch tracking (at least expiry\_date on stock entries or lots)  
\- All migrations are reversible (up/down).  
\- Sequelize models (or current ORM) load with no runtime errors.  
\- Tests verify schema exists and core constraints/indexes exist.  
\- Verification commands pass with exit code 0.  
\- verify\_workspace\_integrity reports zero violations after execution.  
  
\## PRE-PLANNING REQUIRED READS (YOU MUST DO THESE VIA read\_file)  
You MUST read and summarize (inside Current State Analysis) the actual patterns found in the repo by reading:  
\- backend/package.json  
\- backend/src/app.js (or backend entry)  
\- backend/src/models/index.js OR backend/src/models/\* (ORM init pattern)  
\- backend/src/config/\* (db config)  
\- backend/src/models/\* inventory-related models  
\- backend/src/services/inventory\* (if exists)  
\- backend/src/migrations/\* (migration pattern)  
\- infra/docker-compose.yml  
\- Any existing schema definition file (sequelize config, prisma schema, etc.)  
  
HALT if any of the above paths do not exist until you locate the correct equivalents via directory reads (read\_file of index files / package.json scripts). You MUST NOT guess.  
  
\## PATH ALLOWLIST (HARD)  
Writes MAY occur only within:  
\- backend/src/models/  
\- backend/src/migrations/  
\- backend/src/config/ (ONLY if required for DB dialect alignment)  
\- backend/tests/ OR backend/src/\_\_tests\_\_/ (match existing convention)  
\- infra/docker-compose.yml (ONLY if required to match chosen DB dialect)  
\- docs/plans/  
  
Any write outside this allowlist MUST be rejected.  
  
\## REQUIRED OUTPUT PLAN STRUCTURE (NON-NEGOTIABLE)  
Your generated plan MUST follow the canonical 9-section structure exactly as defined in the MCP planning template.   
  
It MUST include:  
1) YAML frontmatter  
2) Plan Metadata (Objective + Current State Analysis)  
3) Scope & Constraints  
4) Implementation Specification (PHASE\_IMPLEMENTATION) + File Implementation Details (FULL FILE CONTENT for each file)  
5) Path Allowlist  
6) Verification Gates (concrete commands)  
7) Forbidden Actions  
8) Rollback Procedure  
9) Hash Footer: \[SHA256\_HASH: placeholder\]  
  
\## PHASE\_1 REQUIRED DOMAIN OUTPUT (INVENTORY ONLY)  
You MUST implement schema + models + migrations for the following inventory entities (names MUST match existing conventions you discover; if none exist, use snake\_case tables with explicit model mappings):  
  
A) household (ONLY if not already present)  
\- id (uuid PK)  
\- name  
\- created\_at, updated\_at  
  
B) inventory\_item  
\- id (uuid PK)  
\- household\_id (uuid FK -> household.id)  
\- name (string)  
\- brand (string nullable)  
\- category (string nullable)  
\- barcode (string nullable, indexed)  
\- default\_unit (string, required)  
\- created\_at, updated\_at  
Indexes:  
\- (household\_id, name)  
\- barcode  
  
C) storage\_location  
\- id (uuid PK)  
\- household\_id (uuid FK)  
\- type (enum or string constrained): pantry|fridge|freezer  
\- name (string)  // e.g. "Main Pantry", "Garage Freezer"  
\- created\_at, updated\_at  
Indexes:  
\- (household\_id, type)  
  
D) stock\_lot (OR embed as stock\_entry with lot fields; you MUST choose one and justify)  
Minimum if separate:  
\- id (uuid PK)  
\- household\_id (uuid FK)  
\- inventory\_item\_id (uuid FK)  
\- location\_id (uuid FK)  
\- quantity\_base (integer)  // base unit scaled (see below)  
\- base\_unit (string)  
\- expiry\_date (date nullable)  
\- purchased\_at (date nullable)  
\- cost\_cents (integer nullable)  
\- notes (text nullable)  
\- created\_at, updated\_at  
Indexes:  
\- (inventory\_item\_id, expiry\_date)  
\- (household\_id, location\_id)  
  
E) stock\_ledger\_entry  
Ledger MUST be append-only.  
\- id (uuid PK)  
\- household\_id (uuid FK)  
\- inventory\_item\_id (uuid FK)  
\- location\_id (uuid FK nullable if global)  
\- lot\_id (uuid FK nullable if lots exist)  
\- delta\_quantity\_base (integer)  // positive add, negative consume  
\- base\_unit (string)  
\- reason (string constrained): purchase|consume|adjust|waste|transfer\_in|transfer\_out  
\- occurred\_at (timestamp)  
\- created\_at  
Indexes:  
\- (inventory\_item\_id, occurred\_at)  
\- (household\_id, occurred\_at)  
  
F) inventory\_threshold  
\- id (uuid PK)  
\- household\_id (uuid FK)  
\- inventory\_item\_id (uuid FK)  
\- location\_id (uuid FK nullable)  
\- min\_quantity\_base (integer)  
\- base\_unit (string)  
\- created\_at, updated\_at  
Indexes:  
\- (inventory\_item\_id, location\_id)  
  
\## DETERMINISTIC QUANTITY RULE (REQUIRED)  
You MUST NOT use float for quantities.  
You MUST define a deterministic quantity encoding strategy:  
\- quantity\_base MUST be integer  
\- base\_unit MUST be one of a constrained set (g, ml, each)  
\- unit conversion MUST be defined as a table or deterministic function specification  
You MUST include this in schema documentation and (if required) create a small internal module or enum constants file, but ONLY if necessary for model validation (still schema phase).  
  
\## DIALECT DECISION (REQUIRED)  
After reading actual DB config:  
\- If Postgres is intended, you MUST use UUID + proper FK + enum types (or CHECK constraints)  
\- If SQLite is used, you MUST implement deterministic fallbacks (UUID as TEXT, enums as CHECK constraints where possible)  
You MUST align infra/docker-compose.yml ONLY if it currently contradicts the chosen dialect.  
  
\## TESTS (REQUIRED)  
You MUST add verification tests (no placeholders) that:  
\- run migrations up against a test DB  
\- assert tables exist  
\- assert critical columns exist  
\- assert indexes exist where specified (or the closest supported check in your ORM)  
\- run migrations down and assert tables removed or reverted  
  
You MUST use the repo’s existing test runner (from backend/package.json). You MUST NOT introduce a new framework unless one already exists.  
  
\## VERIFICATION COMMANDS (REQUIRED)  
You MUST define concrete commands in Verification Gates:  
\- install deps (if needed)  
\- run tests  
\- run lint (if present)  
\- run migration check command (if present)  
If lint does not exist, you MUST NOT invent it; you MUST use what repo defines.  
  
\## DELIVERABLE  
You MUST save the produced plan to:  
docs/plans/PLAN\_PANTRYPILOT\_PHASE1\_INVENTORY\_SCHEMA\_v1.md  
using write\_file with:  
\- intent: "Implementation plan for PantryPilot PHASE\_1 inventory schema expansion"  
\- role: "VERIFICATION"  
  
Your plan MUST end with:  
\[SHA256\_HASH: placeholder\]

### What you do after ANTIGRAVITY outputs the plan

1.  Run `lint_plan` on the new plan to seal it (hash).
    
2.  Then run WINDSURF with:
    

*   Plan Path: `docs/plans/PLAN_PANTRYPILOT_PHASE1_INVENTORY_SCHEMA_v1.md`
    
*   Plan Signature: (the sealed SHA256)
    
*   Execution Mode: FULL  
    using the canonical execution workflow.
    

If you want, I can also generate the **WINDSURF execution prompt block** for Phase 1 once you paste back the sealed plan signature.

# RAW SYNC CONSOLIDATION MODE You are operating under Founder Vault governance. This is NOT a canonical sync. This is a RAW extraction pass for later consolidation. You must extract all durable project intelligence from this entire thread. Do NOT: \* Summarize casually \* Introduce new ideas \* Speculate \* Clean up contradictions \* Resolve conflicts This is archaeology only. --- MANDATORY HEADER FORMAT ## RAW SYNC METADATA Project: <PROJECT\_NAME> Thread Type: Historical Consolidation Classification: RAW\_SYNC Date of Extraction: <YYYY-MM-DD> --- Then output strictly in this structure: ## 1. PROJECT INTENT Original goal or vision expressed in this thread. --- ## 2. DECISIONS MADE Atomic statements only. No explanation. --- ## 3. ARCHITECTURE CHOICES Stack selections, system structure, patterns. --- ## 4. FEATURE DEFINITIONS Clear functional commitments. --- ## 5. CONSTRAINTS IDENTIFIED Technical, legal, budget, infrastructure. --- ## 6. REJECTED IDEAS Explicitly rejected approaches only. --- ## 7. OPEN QUESTIONS Unresolved items at the end of the thread. --- ## 8. POTENTIAL CANON CANDIDATES Items likely belonging in CANON.md. Do not filter aggressively. --- ## 9. POTENTIAL DECISION LOG ENTRIES Formatted as: YYYY-MM-DD – <decision statement> --- RULES \* If nothing exists in a section, write: None identified. \* Do not merge sections. \* Do not omit small but concrete commitments. \* Do not attempt to clean contradictions. \* Do not elevate RAW\_SYNC into Canon. End of extraction.

## RAW SYNC METADATA

Project: PantryPilot  
Thread Type: Historical Consolidation  
Classification: RAW\_SYNC  
Date of Extraction: 2026-02-25

* * *

## 1\. PROJECT INTENT

Build PantryPilot into a production-grade, governed meal and lunch planning system capable of fully managing pantry inventory, supporting children’s lunch planning, generating alternatives and suggestions, and operating under strict Atlas-Gate MCP governance with deterministic execution plans.

* * *

## 2\. DECISIONS MADE

*   PantryPilot must operate under ATLAS-GATE governance.
    
*   Planning and execution must use ANTIGRAVITY and WINDSURF MCP templates.
    
*   High-level architectural plans are not executable by WINDSURF.
    
*   Execution requires file-level implementation blocks.
    
*   Plans must include full production-ready file content.
    
*   Plans must include role metadata (EXECUTABLE, BOUNDARY, INFRASTRUCTURE, VERIFICATION).
    
*   Plans must include intent metadata.
    
*   Plans must include verification gates.
    
*   Plans must include path allowlists.
    
*   Plans must include rollback procedures.
    
*   Plans must include SHA256 hash footer.
    
*   PHASE\_1 is limited strictly to Pantry inventory schema expansion.
    
*   PHASE\_1 must NOT include meal planning features.
    
*   Inventory schema must support household tenancy.
    
*   Inventory schema must support stock ledger semantics.
    
*   Inventory schema must support storage locations.
    
*   Inventory schema must support expiry tracking.
    
*   Inventory schema must support minimum thresholds.
    
*   Inventory schema must use deterministic integer quantities.
    
*   Inventory schema must not use floating-point quantities.
    
*   Base unit system must be deterministic.
    
*   DB dialect must be aligned with actual repo configuration.
    
*   Docker compose must align with chosen DB dialect if needed.
    
*   Migrations must be reversible (up/down).
    
*   Schema changes must include indexes to avoid N+1 risks.
    
*   Tests must validate schema existence and indexes.
    
*   Tests must validate migration up and down.
    
*   Tests must use existing test framework.
    
*   No stubs, TODOs, or placeholder logic allowed.
    
*   Writes must occur only within defined allowlist.
    
*   Plan must be saved to docs/plans/ with write\_file.
    
*   Plan must use canonical 9-section structure.
    
*   Hash sealing required via lint\_plan.
    
*   Execution requires FULL mode with Plan Signature.
    
*   RAW\_SYNC does not elevate content to Canon.
    

* * *

## 3\. ARCHITECTURE CHOICES

*   Governance layer: ATLAS-GATE MCP.
    
*   Planning agent: ANTIGRAVITY.
    
*   Execution agent: WINDSURF.
    
*   Plans stored under docs/plans/.
    
*   Plans validated using SHA256 hash.
    
*   Execution uses write\_file MCP tool exclusively.
    
*   Audit trail required for all writes.
    
*   Inventory domain structured around:
    
    *   household
        
    *   inventory\_item
        
    *   storage\_location
        
    *   stock\_lot (or equivalent)
        
    *   stock\_ledger\_entry
        
    *   inventory\_threshold
        
*   Ledger model must be append-only.
    
*   Quantity representation must use integer base units.
    
*   Unit system constrained (g, ml, each).
    
*   Index strategy required on foreign keys and time fields.
    
*   Tenant isolation required via household\_id FKs.
    
*   Path allowlist restricts writes to backend models, migrations, tests, limited config, infra/docker-compose.yml, docs/plans/.
    

* * *

## 4\. FEATURE DEFINITIONS

*   Multi-household tenancy support.
    
*   Inventory item master data.
    
*   Storage location tracking (pantry/fridge/freezer).
    
*   Stock lot or equivalent batch-level tracking.
    
*   Expiry date tracking.
    
*   Cost tracking in integer cents.
    
*   Append-only stock ledger entries.
    
*   Threshold-based minimum quantity tracking.
    
*   Deterministic base unit normalization.
    
*   Reorder readiness support via threshold system.
    
*   Migration reversibility.
    
*   Schema validation tests.
    
*   Index validation tests.
    
*   Workspace integrity verification.
    

* * *

## 5\. CONSTRAINTS IDENTIFIED

*   MUST NOT implement meal planning in PHASE\_1.
    
*   MUST NOT modify auth architecture.
    
*   MUST enforce tenant isolation.
    
*   MUST NOT introduce floats for quantity.
    
*   MUST select DB dialect after reading actual config.
    
*   MUST align docker-compose with DB dialect if required.
    
*   MUST use existing test framework.
    
*   MUST NOT introduce new test framework.
    
*   MUST NOT write outside defined allowlist.
    
*   MUST NOT include stubs or placeholders.
    
*   MUST include full file content blocks in plan.
    
*   MUST include verification commands actually defined in repo.
    
*   MUST use workspace-relative paths.
    
*   MUST NOT guess file paths.
    
*   MUST read actual repo files before generating plan.
    
*   MUST not clean contradictions during RAW extraction.
    
*   MUST not elevate RAW\_SYNC into Canon.
    

* * *

## 6\. REJECTED IDEAS

*   Executing high-level architectural plan without file-level blocks.
    
*   Generating master roadmap as executable mutation.
    
*   Combining architecture design and mutation execution in same step.
    
*   Using floating-point quantities for inventory.
    
*   Adding new test frameworks arbitrarily.
    
*   Writing outside allowlist.
    
*   Skipping verification gates.
    

* * *

## 7\. OPEN QUESTIONS

*   What exact DB dialect is currently configured in the repository.
    
*   Whether Sequelize, Prisma, or another ORM is in use.
    
*   Whether household model already exists.
    
*   Whether inventory-related models already exist.
    
*   Whether storage location concept already exists.
    
*   Whether migration framework is Sequelize CLI or custom.
    
*   Whether lint command exists in backend/package.json.
    
*   Whether docker-compose contradicts DB config.
    
*   Whether lots should be separate table or embedded strategy.
    
*   Whether SQLite fallback is required.
    
*   Exact unit conversion enforcement location (schema vs service layer).
    

* * *

## 8\. POTENTIAL CANON CANDIDATES

*   Inventory quantities MUST use integer base units only.
    
*   Ledger model MUST be append-only.
    
*   All execution MUST pass through ATLAS-GATE governance.
    
*   Plans MUST be hash-sealed before execution.
    
*   WINDSURF cannot execute architectural documents.
    
*   Path allowlist enforcement is mandatory.
    
*   Tenant isolation via household\_id is non-negotiable.
    
*   All schema phases must include index strategy.
    
*   Reversible migrations are mandatory.
    
*   No floats for quantity anywhere in PantryPilot.
    
*   REALITY LOCK applies to all implementation plans.
    
*   Inventory schema is Phase 1 foundation for Meal OS.
    
*   RAW\_SYNC extraction is archaeology only and not Canon.
    

* * *

## 9\. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – PHASE\_1 limited strictly to Pantry inventory schema expansion.  
2026-02-25 – Inventory quantities must use deterministic integer base units.  
2026-02-25 – Ledger model must be append-only.  
2026-02-25 – Execution requires file-level implementation blocks only.  
2026-02-25 – High-level plans are non-executable under WINDSURF.  
2026-02-25 – Plans must follow canonical 9-section ATLAS-GATE structure.  
2026-02-25 – All plans must include SHA256 hash footer.  
2026-02-25 – All writes restricted by path allowlist.  
2026-02-25 – Reversible migrations are mandatory.  
2026-02-25 – Meal planning features explicitly excluded from PHASE\_1.

End of extraction.