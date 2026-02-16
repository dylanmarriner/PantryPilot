# PantryPilot Backend

Modern, grocery-first household intelligence platform backend. Built with Node.js, Express, and SQLite.

## Core Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (managed with Sequelize)
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

## Project Structure

```text
backend/
├── src/                # Source code
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Security and validation logic
│   ├── models/         # Sequelize database models
│   ├── routes/         # API endpoint definitions
│   └── services/       # Business logic layer
├── tests/              # Unit and integration tests
├── Dockerfile          # Container specification
└── database.sqlite     # Local development database
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file based on `.env.example`:

   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The backend exposes a RESTful API. Key endpoints include:

- `POST /api/auth/login`: Authenticate users
- `GET /api/inventory`: List pantry items
- `POST /api/inventory/add`: Add new item to stock
- `GET /api/meals/suggest`: Get AI-driven meal suggestions

## Deployment

The backend is configured for dual-deployment:

1. **VPS (Manual)**: Use the `./tools/deploy_vps.sh` script to push to a Linux server.
2. **Render.com (Automatic)**: Automatically deploys on push to the `main` branch via the Docker-based Web Service.

---

_Part of the PantryPilot Monorepo_
