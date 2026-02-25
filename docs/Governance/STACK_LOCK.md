# STACK_LOCK.md

Project: PantryPilot / Mealify  
Status: Phase 1 Technical Stack Lock

---

## 1. FRONTEND

Framework:

- Next.js 14 (App Router)

Language:

- TypeScript

Styling:

- Tailwind CSS

UI Principles:

- Server components where appropriate.
- Client components only when required for interactivity.
- Bottom sheet pattern implemented via controlled client component.
- Horizontal swipe implemented with lightweight library or custom gesture handling.

No additional UI frameworks introduced in Phase 1.

---

## 2. BACKEND

API Layer:

- Next.js API routes (initial implementation)

Separation Strategy:

- Monorepo architecture for Phase 1.
- API extraction to dedicated service only if scaling demands it.

No microservice split in Phase 1.

---

## 3. DATABASE

Primary Database:

- PostgreSQL

ORM:

- Prisma

Schema Governance:

- Relational integrity required.
- Foreign key constraints enforced.
- All tables must include household_id where applicable.
- Append-only ledger pattern for pantry.

SQLite prohibited for multi-user production use.

---

## 4. BACKGROUND JOBS

Queue System:

- BullMQ

Broker:

- Redis

Usage:

- Scheduled daily scraping.
- Deferred heavy operations.
- Price snapshot refresh.

Background workers must not block planner flow.

---

## 5. SCRAPING ENGINE

Tool:

- Playwright

Architecture:

- Per-store scraper workers.
- No universal parser.
- Snapshot storage only.
- Scheduled execution (daily).

Planner must never invoke scraper directly.

---

## 6. AUTHENTICATION (PHASE 1)

Local-first development.

Authentication complexity minimized during early local phase.

Production authentication strategy defined later.

OAuth and complex third-party auth deferred.

---

## 7. PERFORMANCE TARGETS

Swap interaction:

- <200ms perceived latency.

Home screen:

- No blocking calls.
- Precomputed alternatives.
- Snapshot reads only.

Database:

- Indexed on:
  - household_id
  - ingredient_id
  - week_id
  - snapshot timestamp

---

## 8. DEPLOYMENT (PHASE 1)

Development:

- Local environment first.

Production:

- VPS deployment after stability.
- Docker optional but not required for Phase 1.

Mobile app development deferred until:

- API stability achieved.
- Schema stability achieved.
- Weekly planning stable over multiple cycles.

---

## 9. EXPANSION CONSTRAINTS

No additional frameworks introduced without architectural review.

No premature adoption of:

- Microservices
- Event buses
- Serverless complexity

Phase 1 stack remains intentionally boring.

---

STACK STATUS: LOCKED FOR PHASE 1 WEB BUILD
