# PantryPilot Roadmap

> [!NOTE]
> This roadmap defines the build contract for the PantryPilot platform.

Below is the **detailed PantryPilot roadmap**, structured so Antigravity can convert each phase into executable plans and Windsurf can implement them cleanly.

This is grocery-first, VPS-hosted, hybrid-capable, Android client.

No fluff. Just build order.

---

## 🧭 PantryPilot — Master Roadmap

**Model:** Grocery-First Household Intelligence Platform
**Deployment:** VPS Core + Optional Local Node
**Client:** Android (React Native Expo)
**Governance:** Antigravity → Windsurf

---

## 🧱 PHASE 0 — Foundation & Governance

## Objective

Create deterministic, production-ready scaffold.

## Phase 0 Deliverables

```text
/backend
/mobile
/infra
/workers
/docs
/plans
```

- Docker Compose baseline
- VPS provisioning script (Ubuntu 24.04)
- Reverse proxy (Caddy or Nginx)
- CI pipeline (lint + tests)
- Plan validation system (for Antigravity governance)

### Success Criteria

- Containers boot cleanly
- Health endpoint returns OK
- DB connection verified
- CI passing

---

## 🧂 PHASE 1 — Core Data & Inventory Engine

## Phase 1 Objective

Build the inventory brain. No AI yet.

## Phase 1 Data Models

- Household
- User
- Item
- Category
- Location (pantry/fridge/freezer)
- StockEntry
- Unit
- UnitConversion
- ReorderThreshold
- Expiry

## Phase 1 Features

- Add item
- Adjust quantity
- Deduct quantity
- Unit normalization layer
- Alias mapping (mince = beef mince)
- Reorder trigger logic

## Phase 1 Hard Problems Solved

- Partial usage
- g ↔ kg
- ml ↔ L
- “1 jar” normalization
- Floating quantity safety

### Success Criteria

- Stock math 100% deterministic
- Test coverage for unit conversion
- Edge cases handled

This phase is the backbone of everything.

---

## 🛒 PHASE 2 — Pricing Engine

## Phase 2 Objective

Store and optimize grocery prices.

## Phase 2 Data Models

- Store
- SKU
- PriceSnapshot
- PriceHistory
- SaleFlag

### Features

- Manual price entry
- Price-per-unit calculation
- Cheapest item resolver
- Cheapest basket simulation
- Historical price comparison

## Phase 2 Worker

- Scheduled nightly job framework (no scraping yet)

## Phase 2 Success Criteria

- Can simulate a basket and calculate total cost
- Price per unit consistent

---

## 🍽 PHASE 3 — Meal Attachment Layer

## Phase 3 Objective

Meals consume inventory, not control it.

## Phase 3 Data Models

- MealTemplate
- MealIngredient
- MealLog

## Phase 3 Features

- Create meal template
- Deduct ingredients on log
- Auto-cost meal based on prices
- Suggest cheaper ingredient alternatives
- Validate stock availability

## Phase 3 Success Criteria

- Logging meal deducts inventory correctly
- Cost displayed accurately
- Suggest substitution when price difference exceeds threshold

---

## 🎒 PHASE 4 — Lunch Variation Engine

### Objective

Solve boredom and rotation intelligently.

## Phase 4 Data Models

- LunchSlot
- ItemPreference
- FatigueScore
- AcceptanceScore

### Features

- Slot-based lunch structure
- Fatigue increment logic
- Cooldown reset logic
- Stock-aware rotation
- Price-aware rotation

### Success Criteria

- No item repeated beyond rule
- Fatigue reduces probability
- Stock depletion updates future suggestions

This is what makes PantryPilot unique.

---

## 🧠 PHASE 5 — AI Interpretation Layer

### Objective

Enable natural language + voice logging.

### Components

- Text parser endpoint
- Structured action extractor
- Meal detection logic
- Ingredient inference
- Substitution suggestion engine

## Phase 5 Features

- Parse:

  > “We had tacos and yoghurt and I packed LCM.”

- Convert to structured logs
- Suggest lunch alternatives
- Weekly grocery suggestion

## Phase 5 Guardrails

- AI never updates DB directly
- All actions validated by deterministic layer

## Phase 5 Success Criteria

- > 90% correct structured interpretation
- No silent DB corruption

---

## 📱 PHASE 6 — Android App (React Native) ✅

### Objective

Create user interface and mobile experience.

## Phase 6 Screens

- Auth
- Dashboard
- Inventory
- Add Item
- Log Today (chat + mic)
- Lunch Planner
- Grocery List
- Budget Overview

## Phase 6 Voice Flow

- Mic capture
- OS speech-to-text
- Send to backend
- Structured response returned

### Success Criteria

- Full logging via phone
- Stock updates reflected immediately
- Clean UX, no logic in app

---

## 🛒 PHASE 7 — Automated Scraping Worker

### Objective

Add live supermarket pricing.

### Components

- Playwright worker
- Scraper abstraction per store
- Retry logic
- Price validation

## Phase 7 Features

- NZ supermarkets integration
- Snapshot storage
- Sale detection
- Change alerts

## Phase 7 Risk

- Anti-bot mitigation
- IP blocking

## Phase 7 Mitigation

- Local node scraping fallback
- Rotating user agents
- Throttled crawling

---

## 🌍 PHASE 8 — Hybrid Sync Layer

### Objective

Enable local node support.

### Components

- Sync client
- Conflict resolution rules
- Offline logging queue
- Bi-directional sync

## Phase 8 Success Criteria

- Offline logging possible
- Sync reconciles without duplication
- Deterministic conflict rules

---

## 💰 PHASE 9 — Product-Ready Expansion ✅

### Features

- [x] Multi-household support
- [x] Role-based permissions
- [x] Feature flags
- [x] Production deployment (VPS & Render.com)
- [x] Mobile UI Readability Overhaul
- [ ] Subscription-ready schema
- [ ] Usage analytics
- [ ] Cost savings dashboard
- [ ] Export reports

Now it’s SaaS-capable.

---

## 🧠 Strategic Execution Order

We do NOT jump to AI or Android early.

We execute in this order:

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 6 (basic UI early for motivation)
6. Phase 4
7. Phase 5
8. Phase 7
9. Phase 8
10. Phase 9

UI comes earlier than normal to keep momentum.

---

## 🏁 Final Vision of PantryPilot

When complete, PantryPilot will:

- Track every grocery item
- Predict reorder needs
- Suggest cheapest substitutions
- Rotate school lunches intelligently
- Optimize weekly basket cost
- Handle voice logging
- Support multi-device
- Scale to SaaS

All grocery-first.

---

If you’re ready, next step is:

I convert this roadmap into a **strict Antigravity Master Planning Prompt**
so it becomes executable phase plans under governance.

Do you want it in:

- Atlas-Gate style
- Marr’Kena style
- Or neutral standalone governance mode?
