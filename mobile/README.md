# PantryPilot Mobile

The mobile client for PantryPilot, built with React Native and Expo. Designed for high readability and fast logging in a kitchen environment.

## Features

- **Inventory Dashboard**: Real-time view of pantry and fridge stock.
- **AI-Powered Logging**: Natural language and voice input for tracking groceries.
- **Lunch Planner**: Intelligent rotation system to avoid school lunch boredom.
- **Offline Support**: Sync queue for logging even when the connection is unstable.
- **Premium UI**: Modern, high-contrast design system optimized for readability.

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State Management**: React Hooks & Context API
- **Icons**: Lucide React Native
- **Styling**: Custom Design System (DesignSystem.js)

## Project Structure

```text
mobile/
├── src/
│   ├── components/    # Reusable UI elements
│   ├── navigation/    # App flow and routing
│   ├── screens/       # Full-page views
│   ├── services/      # API communication (api.js)
│   ├── styles/        # Design System and global styles
│   └── utils/         # Sync queue and helpers
└── assets/            # App icons, splash screens, and fonts
```

## Development

### Prerequisites

- Node.js (v18+)
- Expo Go app on your physical device or an emulator.

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npx expo start
   ```

3. Scan the QR code with Expo Go to run on your device.

## Production Build

The mobile app is built using EAS (Expo Application Services).

- **Android**: Generated as a standalone APK.
- **Configuration**: Managed via `app.json` and `eas.json`.

---

_Part of the PantryPilot Monorepo_
