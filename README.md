[English](README.md) | [简体中文](README.zh-CN.md)

# Deskflow SaaS

Deskflow SaaS is a comprehensive customer service platform built with modern web technologies, designed to streamline customer support operations with real-time chat, agent management, and analytics capabilities.

## Features

- Real-time Chat: WebSocket-based communication for instant customer-agent interaction
- Agent Management: Complete agent lifecycle management with role-based access control
- Conversation History: Persistent storage of all customer interactions
- Knowledge Base: Centralized repository for customer support information
- Analytics Dashboard: Real-time statistics and reporting
- Multi-language Support: Built-in internationalization for global teams
- File Upload: Support for uploading and sharing files during conversations

## Tech Stack

### Backend (apps/api)
- Framework: NestJS
- Database: MySQL/MariaDB, MongoDB
- Cache: Redis
- Real-time: Socket.IO
- Authentication: JWT, Google OAuth
- File Storage: Local storage with MinIO support

### Frontend Dashboard (apps/dashboard)
- Framework: React 18
- UI Library: Ant Design
- State Management: Zustand
- Routing: React Router
- Internationalization: i18next
- Build Tool: Vite

### Frontend Widget (apps/widget)
- Framework: React/Preact
- Build Tool: Vite
- Lightweight: Optimized for quick loading

### Shared Packages
- Type Definitions: Shared TypeScript types
- UI Components: Reusable React components
- ESLint Config: Shared linting rules
- TypeScript Config: Shared TypeScript configuration

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- Docker and Docker Compose

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd deskflow-saas
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development environment

```bash
pnpm start
```

This command will:
- Start all required services using Docker Compose (MySQL, MongoDB, Redis, MinIO)
- Start the development servers for all apps

4. Access the applications
- Dashboard: http://localhost:5173
- API: http://localhost:3000
- Widget: http://localhost:5174

### Development Commands

| Command | Description |
|---------|-------------|
| pnpm dev | Start all apps in development mode |
| pnpm build | Build all apps and packages |
| pnpm lint | Run linting on all apps and packages |
| pnpm format | Format all files with Prettier |
| pnpm check-types | Run TypeScript type checking |

### Environment Variables

Refer to the .env.example files in each app directory for required environment variables.

## Project Structure

```
deskflow-saas/
├── apps/
│   ├── api/              # Backend API application
│   ├── dashboard/        # Frontend dashboard for agents
│   └── widget/           # Customer-facing chat widget
├── packages/
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── types/            # Shared TypeScript types
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/               # Shared UI components
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Root package configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json            # Turborepo configuration
```

## Deployment

### Development
Use pnpm start to run the application in development mode with all services.

### Production
Refer to docker-compose.prod.yml for production deployment configuration.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request

## License

MIT