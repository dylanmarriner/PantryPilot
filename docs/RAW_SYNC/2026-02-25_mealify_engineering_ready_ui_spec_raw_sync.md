## RAW SYNC METADATA

Project: MEALIFY
Thread Type: Historical Consolidation
Classification: RAW_SYNC
Date of Extraction: 2026-02-25

---

## 1. PROJECT INTENT

Build MEALIFY as a meal planning app with a context-aware, low cognitive load UI.
Create a fully custom, 100% unique interface that is jaw-dropping on first impression.
Produce engineering-ready specifications with no ambiguity.

---

## 2. DECISIONS MADE

Bottom navigation limited to 5 tabs.
Tabs are: Home, Week, Grocery, Pantry, Insights.
No hamburger menus.
Home tab answers "What matters right now?".
Home rendering logic depends on time of day.
Weekend overrides time logic to show Dinner first.
Primary and Secondary cards exist on Home.
Primary card includes Swap, Show Alternatives, Mark Packed / Mark Cooked.
Secondary card includes single View action.
Empty state shows "Nothing planned yet." with Plan Today and Go to Week.
Week tab is vertical scroll by default.
Week header includes "Week of {date range}" and Auto-Generate Week button.
7 Day Cards (Mon–Sun) displayed.
Day Cards show Lock indicator, Missing indicator, Low pantry indicator.
Day Detail is full screen modal.
Lunch includes components: Main, Snack, Fruit, Extra.
Lunch components are editable chips.
Lunch has Add Item, Show Smart Alternatives, Regenerate Lunch, Lock Lunch.
Dinner shows meal name, ingredient preview, prep time, estimated cost, pantry usage, repetition score.
Dinner has Show Alternatives, Regenerate, Edit Ingredients, Lock Dinner.
Alternatives panel is slide-up bottom sheet.
Alternatives show 3 ranked options.
Alternatives ranking modes: Cheapest, Uses most pantry, Balanced.
Tap on alternative replaces immediately.
Auto-Generate Week generates 5 dinners (Mon–Fri) and 5 school lunches.
Auto-Generate respects locked days.
Auto-Generate avoids last week repetition.
Auto-Generate uses pantry-first logic.
Auto-Generate respects budget.
Post-generate shows estimated weekly grocery cost and estimated savings vs last week.
Grocery tab groups items by category (Produce, Dairy, Meat, Pantry, Frozen).
Grocery shows quantity needed, in stock amount, estimated price, last paid price.
Receipt scan flow includes Camera → OCR → Parsing → Review screen.
Receipt confirmation updates pantry, price history, and spend tracking.
Pantry has search bar and filter toggles (Fridge / Freezer / Pantry).
Pantry items show expiry indicator and price trend arrow.
Insights tab is premium-gated.
Insights uses clean cards only.
No complex graphs in Insights.
Everything editable.
Nothing auto-locks.
Regenerate never overrides locked meals.
Always show cost impact when swapping.
No hidden settings screens.
Home screen loads in <500ms.
Alternatives render instantly (pre-fetched where possible).
Receipt processing is async with loading state.
Offline mode supports viewing plans, marking cooked/packed, and queueing receipt upload.
UI must be fully custom and 100% unique.
No generic SaaS patterns.
No stock gradients.
No predictable card stacks.
No generic iOS/Material templates.
Production feasible in React Native or SwiftUI.
Animations GPU-accelerated.
Avoid heavy 3D engines.

---

## 3. ARCHITECTURE CHOICES

Bottom navigation as primary navigation structure.
Full screen modal for Day Detail.
Slide-up bottom sheet for Alternatives.
Time-based rendering logic on Home.
Prefetch strategy for Alternatives.
Offline queue for receipt uploads.
Lock semantics per meal.
Week starts Monday.
Single household, multiple children possible.
School lunch associated with child profile.
Pantry usage derived from ingredient-to-pantry matching.
Repetition and rotation health computed from recent history window.

---

## 4. FEATURE DEFINITIONS

Context-aware Home screen (time-based meal prioritization).
Primary and Secondary meal cards.
Swap functionality.
Smart Alternatives generation.
Auto-Generate Week (free feature).
Budget-aware meal planning.
Pantry-first meal generation.
Repetition avoidance across weeks.
Grocery cost estimation and savings comparison.
Optimize Basket action.
Receipt scanning with OCR parsing.
Price history tracking.
Pantry inventory management.
Expiry tracking.
Price trend visualization.
Insights dashboard with Savings This Month, Grocery Spend Trend, Lunch Rotation Health, Waste Reduction.
Cost impact display on swap.
Lock per meal to prevent regeneration override.
Offline interaction support.
Premium gating for Insights tab.
Cinematic transitions between tabs (<300ms perceived).
Signature "wow moment" interaction on first launch.
Adaptive visual surfaces based on time or meal type.
Custom iconography and typography system.
Distinct shape language and depth model.
Haptic mapping for key actions.

---

## 5. CONSTRAINTS IDENTIFIED

Maximum 5 bottom tabs.
No hamburger menus.
No hidden settings screens.
Home initial load under 500ms.
Alternatives must render instantly.
Receipt parsing async.
Offline mode required.
Avoid heavy 3D engines.
Production feasible in React Native or SwiftUI.
GPU-accelerated animations only.
No generic templates.
No stock gradients.
No feature sprawl.
Low cognitive load principle.

---

## 6. REJECTED IDEAS

Hamburger menu navigation.
Generic SaaS patterns.
Stock gradients.
Predictable card stacks.
Generic iOS templates.
Generic Material templates.
Heavy 3D engine usage.
Complex graphs in Insights.

---

## 7. OPEN QUESTIONS

Should lunches be fully structured (Main/Snack/Fruit/Extra mandatory) or flexible list-based per child?

---

## 8. POTENTIAL CANON CANDIDATES

Core Principle: Context-aware, Blank but assisted, Fully editable, Auto-generate free, Low cognitive load.
Bottom navigation structure (5 tabs).
Time-based Home rendering logic.
Auto-Generate Week constraints.
Pantry-first generation logic.
Repetition avoidance across weeks.
Cost impact always visible on swap.
Everything editable; nothing auto-locks.
Premium gating for Insights.
Offline mode support scope.
Performance targets (Home <500ms, instant Alternatives).
No feature sprawl philosophy.
Design Philosophy Summary (Home = Today, Week = Control, Grocery = Money, Pantry = Data, Insights = Reinforcement).
Jaw-dropping, fully custom UI requirement.

---

## 9. POTENTIAL DECISION LOG ENTRIES

2026-02-25 – Bottom navigation limited to 5 tabs with no hamburger menu.
2026-02-25 – Home screen rendering is time-based with weekend override.
2026-02-25 – Alternatives presented as slide-up bottom sheet with 3 ranked options.
2026-02-25 – Auto-Generate Week respects locked days and avoids last week repetition.
2026-02-25 – Everything editable; regenerate never overrides locked meals.
2026-02-25 – Insights tab is premium-gated.
2026-02-25 – UI must be fully custom and non-template-based.
2026-02-25 – Production constrained to React Native or SwiftUI without heavy 3D engines.
