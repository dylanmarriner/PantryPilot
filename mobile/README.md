# PantryPilot Mobile

The primary client interface for the PantryPilot ecosystem, built with React Native and Expo. The application is optimized for low-latency inventory logging in ambient environment settings.

---

## Design System and Visual Tokens

The user interface follows a high-contrast, OLED-efficient design system documented in `DesignSystem.js`.

### Color Palette

- **Primary Canvas**: `#050505` (True Black)
- **Glass Elements**: `rgba(24, 24, 27, 0.4)` (Zinc-900 at 40% opacity)
- **Action Accents**: `Cyan-500` (#22d3ee) and `Fuchsia-500` (#d946ef)

### Visual Token Specs

- **Background Effects**: 12px Gaussian blur on all navigation and interaction cards.
- **Geometry**: Consistent border radiuses (SM: 8px, MD: 12px, LG: 16px).
- **Typography**: Optimized for long-distance legibility and high-speed glanceability.

---

## State and Sync Architecture

PantryPilot Mobile implements a Local-First architecture to ensure availability in environments with intermittent network connectivity.

### SyncQueue Specification

- **Persistence**: Transactions are recorded in an `AsyncStorage`-backed log.
- **Idempotency**: All operations (inventory adjustments, creation, deletion) utilize a `clientId` to prevent duplicate processing server-side.
- **Fault Tolerance**: Automatic retry mechanism with exponential backoff for transactions marked as `FAILED`.

### Navigation Architecture

- **Authentication Flow**: Managed state for session recovery and household onboarding.
- **Core Interface**:
  - Dashboard: Real-time inventory KPI visualization.
  - Activity Logger: Primary interaction point for text and voice-to-text input.
  - Rotation Planner: Interface for the heuristic lunch engine.
  - System Configuration: Management of household and user metadata.

---

## Development and Build Workflow

### Local Development

1. **Initialize**: `npm install`.
2. **Boot**: `npx expo start`.
3. **Connect**: Utilize Expo Go for development cycle testing.

### Production Environment (EAS)

Builds are managed via Expo Application Services (EAS).

- **Profile**: Production (Targeting APK/AAB).
- **Prebuild**: Android/iOS native paths are managed via standard Expo prebuild handlers.
- **Context**: Bundles the production API entry point (`pantrypilot-api.onrender.com`).

---

## Core Service Modules

- **API Gateway**: Centralized Axios instance with interceptors for JWT injection and automated session management.
- **DesignSystem**: Immutable UI tokens ensuring consistency across the application.
- **SyncQueue**: The critical persistence manager for offline-ready grocery logging.

---

_Optimized for usability. Built for the home._
