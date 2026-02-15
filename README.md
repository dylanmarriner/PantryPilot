# PantryPilot

🏠 **Smart Inventory Management for Modern Households**

A comprehensive pantry management system that helps households track inventory, monitor prices, create shopping lists, and reduce food waste through intelligent automation and mobile-first design.

## ✨ Features

- **📦 Inventory Management**: Real-time tracking of pantry items with quantities, expiry dates, and categories
- **💰 Price Tracking**: Historical price monitoring across multiple stores with trend analysis
- **🛒 Smart Shopping Lists**: Automated list generation based on inventory levels and consumption patterns
- **📱 Mobile-First**: React Native app for iOS and Android with offline support
- **🔔 Intelligent Notifications**: Expiry alerts, low stock warnings, and price drop notifications
- **📊 Analytics & Insights**: Consumption patterns, waste reduction metrics, and cost savings reports
- **🤖 AI-Powered**: Smart categorization and consumption prediction using machine learning
- **🔒 Secure**: JWT-based authentication with role-based access control

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Client    │    │   Admin Panel   │
│   (React Native)│    │   (React Web)   │    │   (Dashboard)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │      (Nginx Proxy)        │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Backend API          │
                    │    (Express.js + JWT)     │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│  PostgreSQL     │    │     Redis       │    │  Background     │
│   Database      │    │     Cache       │    │   Workers       │
│                 │    │                 │    │ (Price Scraping │
│                 │    │                 │    │  + Sync Jobs)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
pantrypilot/
├── backend/                 # Node.js Express API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Sequelize data models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── utils/          # Helper utilities
│   ├── tests/              # Jest test suites
│   └── package.json
├── mobile/                  # React Native mobile app (Expo)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API client and utilities
│   │   └── hooks/          # Custom React hooks
│   ├── assets/             # Images, fonts, icons
│   └── package.json
├── workers/                 # Background job processors
│   ├── src/
│   │   ├── jobs/           # Scheduled tasks
│   │   ├── scrapers/       # Price scraping modules
│   │   └── services/       # Worker-specific services
│   └── package.json
├── infra/                   # Infrastructure configuration
│   ├── docker-compose.yml  # Development environment
│   ├── nginx.conf          # Reverse proxy config
│   └── init-db.sql         # Database initialization
├── docs/                    # Documentation & governance
│   ├── plans/              # ATLAS-GATE execution plans
│   ├── GOVERNANCE.md       # Development guidelines
│   └── roadmap.md          # Project roadmap
├── tools/                   # Development and deployment tools
└── .github/                 # CI/CD workflows
    └── workflows/
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **Expo CLI** (for mobile development)
- **PostgreSQL client** (optional, for direct DB access)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dylanmarriner/pantrypilot.git
   cd pantrypilot
   ```

2. **Start the development environment**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```
   This starts:
   - Backend API on http://localhost:3000
   - PostgreSQL on localhost:5432
   - Redis on localhost:6379
   - Nginx proxy on http://localhost

3. **Install dependencies**
   ```bash
   # Backend dependencies
   npm --prefix backend install
   
   # Mobile app dependencies  
   npm --prefix mobile install
   
   # Background workers
   npm --prefix workers install
   ```

4. **Database setup**
   ```bash
   # Run database migrations (if using Sequelize migrations)
   npm --prefix backend run migrate
   
   # Seed initial data (optional)
   npm --prefix backend run seed
   ```

5. **Start development servers**
   ```bash
   # Backend API (with hot reload)
   npm --prefix backend run dev
   
   # Mobile app (in separate terminal)
   npm --prefix mobile start
   
   # Background workers (in separate terminal)
   npm --prefix workers run dev
   ```

6. **Run tests**
   ```bash
   # Backend tests
   npm --prefix backend test
   
   # Mobile app tests
   npm --prefix mobile test
   
   # Worker tests
   npm --prefix workers test
   ```

## 📱 Mobile Development

### Running the Mobile App

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Start the development server**
   ```bash
   cd mobile
   npm start
   ```

3. **Run on device/simulator**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

### Mobile App Features
- **🏠 Dashboard**: Overview of inventory status and alerts
- **📦 Inventory**: Add, edit, and organize pantry items
- **🛒 Shopping**: Create and manage shopping lists
- **📊 Analytics**: View consumption patterns and cost insights
- **⚙️ Settings**: User preferences and account management

## 🔧 Development

### Backend API
```bash
cd backend
npm run dev      # Start with nodemon (hot reload)
npm test         # Run Jest tests
npm run test:watch # Run tests in watch mode
npm run lint     # ESLint code quality check
npm run lint:fix # Auto-fix linting issues
```

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Households**: `/api/households/*`
- **Inventory**: `/api/inventory/*`
- **Items**: `/api/items/*`
- **Pricing**: `/api/pricing/*`
- **Shopping Lists**: `/api/lists/*`
- **Analytics**: `/api/analytics/*`

### Background Workers
```bash
cd workers
npm run dev      # Start all background workers
npm test         # Run worker tests
npm run lint     # ESLint code quality check
```

#### Worker Types
- **Price Scraper**: Monitors prices across multiple stores
- **Sync Worker**: Handles data synchronization between services
- **Notification Worker**: Sends scheduled notifications
- **Analytics Worker**: Generates daily/weekly analytics reports

## 🗄️ Database Schema

### Core Models
- **Users**: User accounts and authentication
- **Households**: Household management and membership
- **Items**: Product catalog and item definitions
- **Inventory**: Real-time inventory levels and locations
- **PriceSnapshots**: Historical price tracking
- **Stores**: Store information and locations
- **ShoppingLists**: Dynamic shopping list generation
- **MealLogs**: Meal tracking and consumption patterns

### Database Configuration
- **Primary Database**: PostgreSQL 15
- **Caching Layer**: Redis 7
- **ORM**: Sequelize with migrations
- **Connection Pooling**: Configurable pool sizes

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # API endpoint tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and mocks
```

### Running Tests
```bash
# All tests
npm test

# Coverage report
npm run test:coverage

# Specific test file
npm test -- inventory.test.js

# Watch mode for development
npm run test:watch
```

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Different permissions for different user roles
- **Password Hashing**: bcrypt for secure password storage
- **API Rate Limiting**: Prevent abuse and DOS attacks
- **CORS Configuration**: Proper cross-origin resource sharing

### Security Best Practices
- Input validation and sanitization
- SQL injection prevention via ORM
- XSS protection with Helmet.js
- Secure environment variable handling
- Regular dependency updates and vulnerability scanning

## 📊 Monitoring & Analytics

### Application Metrics
- **Performance**: Response times and throughput
- **Error Rates**: Failed requests and exceptions
- **User Activity**: Active users and feature usage
- **Business Metrics**: Inventory turnover, waste reduction

### Logging
- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: Debug, Info, Warn, Error
- **Request Tracing**: Correlation IDs for request flow
- **Error Tracking**: Detailed error context and stack traces

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
- **On Push**: Run linting and tests
- **On PR**: Full test suite with coverage
- **On Merge**: Build and deploy to staging
- **On Release**: Deploy to production

### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime deployments
- **Health Checks**: Automated service health monitoring
- **Rollback Capability**: Quick rollback on deployment failures
- **Database Migrations**: Automated schema updates

## 🏛️ Governance Model

This project uses **ATLAS-GATE** for strict development governance:

### Phase-Based Development
- **Phase 0**: Project foundation and infrastructure ✅
- **Phase 1**: Core data models and inventory engine ✅
- **Phase 2**: Pricing and shopping lists ✅
- **Phase 3**: Notifications and scheduled tasks ✅
- **Phase 4**: Analytics and reporting ✅
- **Phase 5**: AI interpretation layer ✅
- **Phase 6**: Mobile application UI/UX 🔄
- **Phase 7**: Performance optimization and scaling 📋
- **Phase 8**: Advanced features and integrations 📋
- **Phase 9**: Production deployment and monitoring 📋

### Development Rules
- All changes require approved execution plans
- Cryptographic signing of all plans
- Immutable audit trail for all changes
- Automated verification gates
- Strict rollback procedures

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Sequelize
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Testing**: Jest + Supertest

### Mobile
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Charts**: react-native-chart-kit
- **Storage**: AsyncStorage
- **Testing**: Jest + Expo Testing

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier
- **Security**: Helmet.js + CORS

## 📈 Performance

### Optimization Strategies
- **Database Indexing**: Optimized queries for large datasets
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Lazy Loading**: Mobile app optimization
- **Image Optimization**: Compressed assets and CDN

### Benchmarks
- **API Response Time**: <200ms average
- **Mobile App Load Time**: <3 seconds
- **Database Query Time**: <50ms for indexed queries
- **Concurrent Users**: 1000+ supported

## 🤝 Contributing

### Development Guidelines
1. **Follow ATLAS-GATE governance** - All changes require approved plans
2. **Write tests** - Maintain >90% code coverage
3. **Use conventional commits** - Follow semantic versioning
4. **Code review** - All PRs require review
5. **Documentation** - Update docs for all changes

### Getting Started
1. Read the [Governance Guide](docs/GOVERNANCE.md)
2. Set up development environment (see Quick Start)
3. Create an execution plan for your feature
4. Submit plan for approval
5. Implement and test your changes
6. Submit pull request with plan reference

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **📧 Email**: support@pantrypilot.app
- **🐛 Issues**: [GitHub Issues](https://github.com/dylanmarriner/pantrypilot/issues)
- **📖 Documentation**: [Project Docs](docs/)
- **💬 Discussions**: [GitHub Discussions](https://github.com/dylanmarriner/pantrypilot/discussions)

---

**Built with ❤️ for modern households**
