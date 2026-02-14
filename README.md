# PantryPilot

A smart inventory management system for household pantries.

## Project Structure

This is a monorepo organized as follows:

```
pantrypilot/
├── backend/          # Node.js Express API server
├── mobile/           # React Native mobile app (Expo)
├── infra/            # Infrastructure configuration
│   ├── docker-compose.yml
│   └── nginx.conf
├── workers/          # Background job processors
├── docs/             # Documentation
│   └── plans/        # ATLAS-GATE execution plans
└── .github/          # CI/CD workflows
    └── workflows/
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client (optional)

### Development Setup

1. Clone the repository
2. Start the development environment:
   ```bash
   docker-compose -f infra/docker-compose.yml up
   ```

3. Install dependencies for each service:
   ```bash
   npm --prefix backend install
   npm --prefix mobile install
   npm --prefix workers install
   ```

4. Run tests:
   ```bash
   npm --prefix backend test
   ```

## Services

- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Nginx Proxy**: http://localhost (routes to backend)

## Development

### Backend
```bash
cd backend
npm run dev  # Starts with nodemon
npm test     # Run Jest tests
npm run lint # ESLint
```

### Mobile
```bash
cd mobile
npm start    # Start Expo development server
```

### Workers
```bash
cd workers
npm run dev  # Start background workers
```

## Architecture

Phase-based development approach with strict governance via ATLAS-GATE.

- **Phase 0**: Project foundation and infrastructure
- **Phase 1**: Core data models and inventory engine
- **Phase 2**: Pricing and shopping lists
- **Phase 3**: Notifications and scheduled tasks
- **Phase 4**: Analytics and reporting
- **Phase 5**: AI interpretation layer
- **Phase 6**: Mobile application UI/UX

## License

MIT
