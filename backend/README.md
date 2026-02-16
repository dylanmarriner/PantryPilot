# ⚙️ PantryPilot Backend

The robust intelligence hub for the PantryPilot ecosystem. Engineered for deterministic accuracy, multi-tenant security, and high-availability deployment.

---

## 🏗️ Architecture & Component Map

The backend follows a **Control-Service-Model** pattern, enforcing strict separation between request orchestration and business logic.

```text
src/
├── controllers/    # Request orchestration & HTTP state
├── middleware/     # Security pipeline (JWT, Admin, Limits)
├── models/         # Sequelize ORM blueprints (SQLite)
├── routes/         # Express endpoint definitions
├── services/       # Core Business Logic (The "Brain")
└── utils/          # Specialized engines (NL Action Extraction)
```

---

## 🧠 Core Services (Deep Dive)

### `UnitConverter` (Integer Precision Logic)

Prevents floating-point errors in grocery math.

- **Normalizer**: Scales all inputs (kg, L, cups) to a base integer representation.
- **Context Awareness**: Distinguishes between mass (g) and volume (ml) for ambiguous units like "oz".

### `LunchEngine` (Heuristic Rotation)

Automates household meal planning using a weighted scoring model.

- **Fatigue Tracking**: Calculates a 7-day decay for recently consumed items.
- **Acceptance Logic**: Combines user preference, stock availability, and fatigue points to suggest optimal rotations.

### `AIService` & `ActionExtractor`

Heuristic engine for parsing conversational input.

- **Pattern Matching**: Multi-stage regex pipeline for extracting `consume`, `purchase`, and `meal` actions.
- **Confidence Scoring**: Dynamic scoring based on unit presence, quantity precision, and string length.

---

## 🛡️ Security & Middleware Pipeline

Every request passes through an enforced security stack:

1.  **Transport Security**: Managed TLS (Cloudflare/Render).
2.  **Auth Middleware**: JWT verification (`bearer` token) with `process.env.JWT_SECRET` validation.
3.  **Request Validation**: `express-validator` schemas sanitize and type-check all payloads before they hit the controller.
4.  **Admin Guard**: Granular permission checks for destructive operations and system analytics.

---

## 📊 Database Topology

Built on **SQLite3** for high-speed local persistence and low-overhead cloud scaling.

- **Multi-Tenancy**: Data is partitioned via `HouseholdID`.
- **Primary Relations**:
  - `User` ⟷ `Household` (Many-to-Many join table)
  - `Household` ⟷ `Items` / `StockEntries`
  - `Items` ⟷ `PriceSnapshots` / `FatigueScores`

---

## 🚀 DevOps & Deployment Specs

### Production (Render.com)

- **Deployment**: Docker-based web service.
- **Build Step**: `npm install && npm run build`.
- **Persistence**: Managed volume mount at `/data` for `database.sqlite`.

### Manual Failover (Ubuntu VPS)

- **Script**: `tools/deploy_vps.sh`.
- **Mechanics**: Atomic tarball deployment excluding `.sqlite` and `.env` to prevent state collision.
- **Proxy**: Nginx mapping internal port 3000 to public HTTPS ports.

---

_Built for accuracy. Deployed for reliability._
