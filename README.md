# Pediafor: Assessment & Evaluation Platform

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![Built with Node.js](https://img.shields.io/badge/Backend-Node.js%20%26%20TypeScript-339933?logo=nodedotjs)
![Built with React](https://img.shields.io/badge/Frontend-React%20%26%20Next.js-61DAFB?logo=react)
![Python](https://img.shields.io/badge/AI%20Services-Python%20%2F%20FastAPI-3776AB?logo=python)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)
[![Tests](https://img.shields.io/badge/Tests-295%2F310%20Passing-success)]()

-----

## 📖 Overview

**Pediafor Assessment & Evaluation Platform** is an open-source, AI-powered assessment system designed to make robust educational testing accessible to institutions of all sizes. Built as a modern microservices platform, it provides automated grading, intelligent feedback, and scalable infrastructure for educational technology.

### Core Principles

* **AI-First**: Designed from the ground up to integrate artificial intelligence for automated grading, intelligent feedback, and adaptive testing
* **Open & Accessible**: Open-source infrastructure ensuring powerful education technology is available regardless of budget
* **Secure & Scalable**: Built with modern security practices (PASETO tokens), microservices architecture, and efficient async workflows
* **Institution-Ready**: Designed for integration with existing educational tools and systems

---

## ✨ Platform Status

| Service | Status | Tests | Description |
|---------|--------|-------|-------------|
| **🔐 User Service** | ✅ **Production Ready** | 77/77 | PASETO authentication, role-based access control |
| **🚪 Gateway Service** | ✅ **Production Ready** | 7/7 | API gateway with authentication middleware, service routing |
| **📝 Assessment Service** | ✅ **Production Ready** | 106/106 | Complete CRUD operations, media support, event-driven analytics |
| **📋 Submission Service** | ✅ **Production Ready** | 94/109 | File uploads, submission workflow, autosave, event publishing |
| **🎯 Grading Service** | ✅ **Production Ready** | 23/23 | Automated MCQ grading, event-driven processing, analytics |
| **🌐 Frontend Application** | ✅ **Production Ready** | - | React/Next.js web interface with role-based dashboards |
| **🤖 AI Question Generation** | 📝 **Planned** | - | NLP-powered question generation |
| **📈 Analytics Dashboard** | 📝 **Planned** | - | Performance insights and reporting |

### Current Platform Status
- **Core Services**: ✅ All 5 core services operational and production-ready
- **Event-Driven Architecture**: ✅ Complete RabbitMQ-powered event system with assessment service integration
- **Test Coverage**: ✅ 307/322 tests passing (95% success rate) 
- **Docker Infrastructure**: ✅ Full containerization with health monitoring
- **Complete Workflow**: ✅ Full assessment lifecycle from creation to automated grading and analytics
- **Production Ready**: ✅ Ready for deployment with comprehensive documentation and testing

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend Services** | Node.js, TypeScript, Express | Core microservices (Auth, Assessment, Submission) |
| **Event Architecture** | RabbitMQ, AMQP | Event-driven communication and automatic workflows |
| **Frontend Application** | React 18, Next.js 15, TypeScript | Modern web interface with SSR and role-based dashboards |
| **UI Framework** | Tailwind CSS, shadcn/ui, Radix UI | Responsive design system with accessible components |
| **API Integration** | TanStack Query, Zustand, Zod | Type-safe API calls, state management, and validation |
| **AI Services** | Python, FastAPI | Machine learning and NLP processing |
| **Database** | PostgreSQL with Prisma ORM | Robust data persistence and relationships |
| **Authentication** | PASETO V4 Tokens | Secure, stateless authentication |
| **Containerization** | Docker | Consistent development and deployment |

## 💻 Getting Started

### Quick Start
```bash
# Clone the repository
git clone https://github.com/pediafor/assessment.git
cd assessment

# Start all services with Docker (includes frontend + backend)
docker-compose up --build

# Access the application
# Frontend: http://localhost:3001
# API Gateway: http://localhost:3000
```

### Platform Management & Testing

For comprehensive platform management and testing, use our cross-platform scripts:

**Windows (PowerShell)**:
```powershell
# Start entire platform
.\scripts\windows\platform-manager.ps1 start

# Run complete test suite
.\scripts\windows\platform-manager.ps1 test

# Monitor system health
.\scripts\windows\system-health.ps1 --continuous
```

**Linux/macOS (Bash)**:
```bash
# Make scripts executable (first time only)
chmod +x scripts/linux-mac/*.sh

# Start entire platform
./scripts/linux-mac/platform-manager.sh start

# Run complete test suite
./scripts/linux-mac/platform-manager.sh test

# Monitor system health
./scripts/linux-mac/system-health.sh --continuous
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3001
```

### Service Development
Each service can be run independently for development:

```bash
# Navigate to any service
cd services/[service-name]

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Service Endpoints
- **Frontend Application**: http://localhost:3001 (Main web interface)
- **Gateway**: http://localhost:3000 (API Gateway)
- **User Service**: http://localhost:4000
- **Assessment Service**: http://localhost:4001
- **Submission Service**: http://localhost:4002
- **Grading Service**: http://localhost:4003

### Docker Integration Testing ✅
The complete event-driven architecture has been **successfully validated** using Docker containers with real RabbitMQ infrastructure:

- **✅ RabbitMQ**: Running healthy with management UI at http://localhost:15672
- **✅ Event Flow**: Complete assessment lifecycle events (submission → grading → analytics → completion)
- **✅ Assessment Service Events**: Full integration with submission, grading, and user registration events
- **✅ Microservices**: All services connected via pediafor-network with complete event mesh
- **✅ Monitoring**: Complete observability through RabbitMQ management interface
- **✅ Analytics**: Real-time assessment statistics and completion tracking


## 🎨 Frontend Architecture

### Design Philosophy
The frontend follows a **single-application architecture** that provides a unified user experience across all platform features. Built with modern React patterns and TypeScript, it communicates exclusively with the Gateway Service, which handles all backend service routing.

### Key Features
- **🎯 Role-Based Dashboards**: Tailored interfaces for Students, Teachers, and Administrators
- **🔐 Seamless Authentication**: PASETO token integration with automatic refresh
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **♿ Accessibility First**: WCAG compliant components with Radix UI
- **⚡ Performance Optimized**: Next.js SSR, code splitting, and image optimization
- **🧪 Type-Safe API**: End-to-end TypeScript with Zod validation

### Architecture Overview
```
┌─────────────────────────────────────┐
│      Frontend Application          │ ← Single React/Next.js app
│         (Port 3001)                │   with role-based views
└─────────────────┬───────────────────┘
                  │ API calls (/api/*)
                  ▼
┌─────────────────────────────────────┐
│      Gateway Service               │ ← Routes to appropriate
│         (Port 3000)                │   backend services  
└─────────────────┬───────────────────┘
                  │ Internal routing
                  ▼
┌─────────────────────────────────────┐
│     Backend Microservices          │ ← Existing services
│   User | Assessment | Submission   │   (no changes needed)
│   Grading | Future Services        │
└─────────────────────────────────────┘
```

### User Experience Flow
1. **Students**: Assessment taking, progress tracking, results viewing
2. **Teachers**: Assessment creation, class management, grading oversight  
3. **Administrators**: User management, system analytics, platform configuration

## 🤝 Contributing

We welcome contributions! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up your development environment
- Backend service development (Node.js/TypeScript)
- Frontend development (React/Next.js/TypeScript)
- Coding standards and best practices
- Submitting pull requests

### Development Areas
- **🔧 Backend Services**: Microservices architecture with Node.js and TypeScript
- **🎨 Frontend Interface**: React/Next.js application with modern UI components
- **🧪 Testing**: Jest/Vitest testing for both backend and frontend
- **📝 Documentation**: Technical docs, API documentation, and user guides
- **🐳 DevOps**: Docker, CI/CD, and deployment automation

**New contributors**: Check our [issue tracker](https://github.com/pediafor/assessment/issues) for [`good first issue`](https://github.com/pediafor/assessment/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) tags.

## 📜 License

Licensed under [Apache License 2.0](LICENSE) - a permissive license ensuring freedom to use, modify, and distribute.

## 🌐 Links

- **Website**: [pediafor.com](https://pediafor.com)
- **GitHub**: [github.com/pediafor](https://github.com/pediafor)