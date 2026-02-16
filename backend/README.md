# PantryPilot Backend

The primary intelligence and persistence hub for the PantryPilot ecosystem. This service is engineered for deterministic inventory accuracy, high-concurrency security, and multi-tenant household management.

---

## Architecture and Component Map

The backend implements a Control-Service-Model pattern, ensuring a decoupling of request orchestration from the core business logic.

```text
src/
├── controllers/    # Request orchestration and HTTP state management.
├── middleware/     # Security pipeline including JWT verification and validation.
├── models/         # Sequelize ORM definitions for SQLite persistence.
├── routes/         # Express.js endpoint routing.
├── services/       # Core business logic and intelligence engines.
└── utils/          # Auxiliary utilities including NLP action extraction.
```

---

## Core Intelligence Services

### UnitConverter (Precision Engine)

Mitigates floating-point inaccuracies through an integer-based scaling strategy.

- **Normalization**: Scales all incoming measurements (mass, volume, count) to a base integer representation.
- **Context Resolution**: Employs heuristic metadata analysis to distinguish between mass (grams) and volume (milliliters) for ambiguous units.

### LunchEngine (Heuristic Rotation)

Automates multi-user meal planning through a weighted scoring model.

- **Fatigue Tracking**: Implements a 7-day decay coefficient for recently consumed items.
- **Optimization**: Balances user preference, inventory stock levels, and historical fatigue to generate daily recommendations.

### AIService & ActionExtractor

The heuristic interpretation layer for conversational input.

- **Pattern Matching**: A multi-stage regular expression pipeline for structured transaction extraction.
- **Confidence Layer**: Dynamic scoring based on unit precision, quantity presence, and semantic density.

---

## Security and Middleware Pipeline

All incoming requests are processed through a strictly ordered middleware stack:

1. **Transport Security**: Managed TLS provided by the reverse proxy layer.
2. **Auth Integration**: Mandatory JWT verification (`bearer` token) against `process.env.JWT_SECRET`.
3. **Payload Validation**: Schema enforcement via `express-validator` prior to controller entry.
4. **Access Control**: Granular `adminOnly` guards for system-level analytics and infrastructure management.

---

## Database Topology

Persistence is managed via SQLite3, optimized for high-speed local processing and minimal infrastructure overhead.

- **Isolation**: Multi-tenancy is enforced at the database level via `HouseholdID` partitioning.
- **Entity Relations**:
  - User/Household: Many-to-Many association.
  - Household/Stock: Primary inventory relation.
  - Items/Prices: Historical pricing and forecasting snapshots.

---

## DevOps and Deployment

### Cloud Native (Render.com)

- **Engine**: Docker (Multi-stage build).
- **Storage**: Persistent volume mounted at `/data` for `database.sqlite` integrity.

### Infrastructure-as-Code (VPS)

- **Provisioning**: Managed via `infra/provision_vps.sh` (Ubuntu 24.04).
- **Sync**: Atomic code swaps via `tools/deploy_vps.sh`, excluding stateful artifacts (`.sqlite`, `.env`).

---

_Developed for precision. Scaled for reliability._
