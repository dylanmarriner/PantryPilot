## RAW SYNC METADATA

Project: PantryPilot
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Conduct a full technical and product analysis of the PantryPilot GitHub repository.

Define refined product positioning and differentiation for PantryPilot.

Design a complete, production-ready, fully custom UI system tailored specifically to PantryPilot.

Create a dual-mode (Light + Distinct Dark) theming system that is not simple inversion.

Produce a cohesive, distinctive, production-grade UI vision aligned with PantryPilot's architecture and brand direction.

---

## 2. DECISIONS MADE

PantryPilot is positioned as "Household Supply Intelligence," not a grocery list app.

Brand personality defined as competent, tactical, quietly premium.

Emotional goals defined for Light mode ("Kitchen Daylight Clarity").

Emotional goals defined for Dark mode ("Midnight Culinary Ops Lab").

Typography stack selected: Space Grotesk (or Sora) + Inter + IBM Plex Mono (limited).

Iconography direction set to Lucide with 1.75–2.0 stroke.

Spacing system base unit defined as 4.

Card radius defined as 16 primary, 24 hero, 12 chips.

Minimum hit target defined as 44×44.

Light theme token set defined.

Dark theme token set defined.

Token structure defined with namespaces: sys, accent, sem, elev, fx.

Semantic color mapping strategy defined (ttl._, stock._, budget.\*).

Dark mode elevation model defined as glow + translucency.

Light mode elevation model defined as shadow-based.

Bottom dock navigation defined (Core / Vault / Insights / Lab / System).

Pantry item card structure defined.

Alert card structure defined.

Add/Edit item flow defined as NL input → parse preview → confirm.

Inventory health ring visualization defined.

Expiration timeline visualization defined.

Budget meter visualization defined.

Dashboard layout structure defined.

Vault (inventory) layout structure defined.

Shopping list layout structure defined.

Settings layout structure defined.

Three to five high-impact differentiators defined (T.O.M., TTL radar, aurora state system, etc.).

Premium / Pro visual differentiation strategy defined.

Recommended mobile stack: Expo + React Native + NativeWind + React Navigation + Reanimated + Gesture Handler + Zustand.

Phased rollout plan defined (tokens → layout → vault → assistant → charts → polish).

CSS variable implementation structure defined.

Tailwind-style variable mapping approach defined.

---

## 3. ARCHITECTURE CHOICES

Monorepo structure: backend / mobile / infra / workers / tools / docs.

Backend: Node.js + Express.

ORM: Sequelize with SQLite.

Authentication: JWT.

Mobile: React Native (Expo).

Offline persistence: AsyncStorage.

Sync pattern: SyncQueue.

Workers for price scraping and scheduled jobs.

Token-based theming system.

CSS variables for theme switching.

Utility-class-driven styling (Tailwind-like approach).

NativeWind suggested for React Native implementation.

React Navigation for tab/stack routing.

Reanimated + Gesture Handler for motion.

Zustand for UI state.

Bottom dock navigation architecture.

Floating T.O.M. assistant modal architecture.

---

## 4. FEATURE DEFINITIONS

Deterministic inventory tracking.

Consumption and expiry prioritization.

Heuristic meal rotation engine.

Natural language parsing of intake logs.

Price snapshot integration.

Offline-first logging with queued sync.

Operations Hub dashboard with stat tiles.

Vault inventory view grouped by expiry urgency.

Swipe-based item logging (Use / Add / Move).

Expiration alert management with snooze.

Shopping list with store comparison.

Budget tracking with threshold states.

Inventory health visualization.

Expiration timeline visualization.

Natural language Add/Edit item flow with parse preview.

Assistant interface (T.O.M. Link) with modal and voice entry.

Daily streak and waste-saved metrics.

Aurora-based ambient status feedback system.

Premium tier visual differentiation.

---

## 5. CONSTRAINTS IDENTIFIED

SQLite as primary database.

React Native mobile-first implementation.

Offline-first architecture with sync queue.

Token-based theming required for seamless switching.

WCAG AA accessibility requirement.

Minimum touch target size of 44×44.

No grayscale inversion for dark mode.

Dark mode must use rebalanced palette and glow-based elevation.

Semantic color usage required (no hard-coded colors).

UI must align with deterministic engine architecture.

---

## 6. REJECTED IDEAS

Dark mode implemented as simple grayscale inversion.

Generic utility-style food app aesthetic.

Chat-bubble style assistant UI.

Color-only status indicators without labels.

Hard-coded color bindings instead of semantic tokens.

---

## 7. OPEN QUESTIONS

Whether mobile implementation currently uses NativeWind.

Whether UI mock is conceptual or implemented.

Exact mobile navigation setup details.

Final state management choice beyond recommendation.

Degree of web UI support.

---

## 8. POTENTIAL CANON CANDIDATES

PantryPilot positioned as "Household Supply Intelligence."

Dual emotional mode system: Kitchen Daylight / Midnight Culinary Ops Lab.

Token namespace structure (sys / accent / sem / elev / fx).

Semantic mapping strategy for ttl._, stock._, budget.\*.

Glow-based dark mode elevation model.

Bottom dock navigation architecture (Core / Vault / Insights / Lab / System).

T.O.M. assistant as signature differentiator.

Swipe-based deterministic logging.

Inventory health + expiration timeline visualizations.

Aurora ambient state system.

WCAG AA compliance requirement.

Minimum 44×44 hit targets.

Phased rollout sequence for UI implementation.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – PantryPilot positioned as Household Supply Intelligence rather than grocery list app.
2026-02-25 – Dual-mode theme identities defined: Kitchen Daylight and Midnight Culinary Ops Lab.
2026-02-25 – Token-based theming system established with semantic namespaces.
2026-02-25 – Dark mode elevation defined as glow-based rather than shadow-based.
2026-02-25 – Bottom dock navigation architecture adopted.
2026-02-25 – T.O.M. assistant defined as primary differentiator.
2026-02-25 – Swipe-based inventory logging interaction committed.
2026-02-25 – Inventory health and expiration timeline visualizations defined.
2026-02-25 – Premium tier visual differentiation strategy established.

---

End of extraction.
