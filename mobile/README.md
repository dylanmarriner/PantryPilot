# 📱 PantryPilot Mobile

A premium, high-performance Android client built with **React Native** and **Expo**. Optimized for high-speed logging in ambient kitchen environments.

---

## 💎 Design System & UI Tokens

The UI implements a custom, high-contrast "Glassmorphism" system defined in `DesignSystem.js`.

### Color Palette

- **Canvas**: `#050505` (Deep OLED Black)
- **Glass**: `rgba(24, 24, 27, 0.4)` (Zinc-900 at 40% opacity)
- **Interface**: `Cyan-500` (#22d3ee) & `Fuchsia-500` (#d946ef)

### Tokens

- **Backdrop Blur**: 12px Gaussian blur on all cards.
- **Border Radius**: Geometric consistency (SM: 8, MD: 12, LG: 16).
- **Typography**: Optimized for arm-length readability (Large headers, high contrast secondary text).

---

## 🔄 State & Sync Architecture

PantryPilot Mobile uses a **Local-First, Cloud-Synced** architecture to ensure 100% availability in kitchens with poor Wi-Fi.

### `SyncQueue` Implementation

- **Queue Storage**: Persistent `AsyncStorage` transaction log.
- **Idempotency**: Every operation (Adjustment, Create, Delete) has a `clientId` to prevent duplicated updates on the server.
- **Failure Recovery**: Auto-retry logic with exponential backoff for `FAILED` status operations.

### Navigation Hierarchy

- **Auth Stack**: Dedicated flow for Login/Session recovery.
- **Main Tabs**:
  - **Dashboard**: High-level inventory KPI cards.
  - **Log Activity**: Core interaction point (Text/Voice/Mic).
  - **Lunch Planner**: The heuristic rotation interface.
  - **Settings**: Household and user configuration.

---

## 🛠️ Internal Workflow

### Development

1. **Dependencies**: `npm install`.
2. **Server**: `npx expo start`.
3. **Target**: Scan QR code via **Expo Go** (Android/iOS).

### Production Build (EAS)

Builds are orchestrated via **Expo Application Services (EAS)**.

- **Profile**: `production` (Configured in `eas.json`).
- **Artifact**: Standard APK (`build.gradles` managed by Expo Prebuild).
- **Environment**: Bundles the production API endpoint (`pantrypilot-api.onrender.com`).

---

## 📜 Key Service Modules

- **`api.js`**: Centralized Axios instance with interceptors for JWT injection and base-URL management.
- **`DesignSystem.js`**: Atomic design tokens for cross-component consistency.
- **`SyncQueue.js`**: The critical persistence layer for offline logging.

---

_Designed for the cook. Optimized for the home._
