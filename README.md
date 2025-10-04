# Pediafor: Assessment & Evaluation

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![Built with Node.js](https://img.shields.io/badge/Backend-Node.js%20%26%20TypeScript-339933?logo=nodedotjs)
![Built with React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Python](https://img.shields.io/badge/AI%20Services-Python%20%2F%20FastAPI-3776AB?logo=python)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)

-----

## 📖 Overview & Philosophy 🧠

The **Pediafor Assessment & Evaluation** application is the first product wedge in our mission to build **open, AI-centric education infrastructure**. It aims to solve one of the most critical gaps in education today: providing a robust, fair, and accessible assessment platform that isn't locked behind high costs or proprietary systems.

Our approach and **core principles** define the project's direction:

* **AI-Driven**: We are designing a platform to integrate Artificial Intelligence from the ground up for features like automated grading, intelligent feedback, and adaptive testing.
* **Open Infrastructure**: The core framework is designed to be extensible and interoperable, allowing institutions to integrate with their existing tools (LMS, SIS). By being open-source, we ensure the platform can evolve with community needs.
* **Equitable**: By building in the open and focusing on efficiency, we aim to make powerful education technology accessible to schools and institutions of all sizes, regardless of their budget.
* **Fast & Secure**: Designed with low-latency microservices, token-based security (**Paseto**), and efficient, asynchronous workflows.

---

## ✨ Features & Status 🚀

The application is structured as a set of interoperable services built for scalability and maintainability.

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **User Management & Auth** (Paseto) | ✅ Available | Secure authentication with gateway validation. |
| **Question Bank** (MCQ, Subjective) | ✅ Available | Initial database schema & CRUD APIs ready. |
| **Assessment Service** | ✅ **Production Ready** | **Complete CRUD operations, comprehensive media support, role-based access control, and 94/94 passing tests.** |
| Submission Service | 🚧 In Progress | Records answers, manages submission flow. |
| **Automated Grading (MCQ)** | 🚧 In Progress | Accurate & scalable evaluation of multiple-choice responses. |
| **AI-Generated Questions** | 🚧 In Progress | NLP-powered question generation from source material. |
| **Automated Grading (Essays)** | 🚧 In Progress | Leveraging LLM evaluation + rubrics for subjective grading. |
| Analytics Dashboard | 🚧 In Progress | Institution-level and student performance reports and live statistics. |
| API for Integration | 🚧 In Progress | For seamless connection with external apps (LMS). |
| Adaptive Testing Engine | 📝 Planned | Intelligent difficulty adjustment based on student performance. |
| Peer Review System | 📝 Planned | Community-driven grading and feedback mechanisms. |
| Offline Mode | 📝 Planned | Key for low-connectivity regions. |

---

## � Recent Updates & Enhancements

### **Assessment Service - Production Ready (October 2025)**

The Assessment Service has achieved **production readiness** with complete implementation of core functionality, comprehensive testing infrastructure, and production-grade security:

#### **🎯 Complete Implementation**
- **✅ Full CRUD Operations**: Complete assessment lifecycle management with create, read, update, delete, publish, and duplicate functionality
- **✅ Media Management**: Advanced file upload system supporting images, audio, video, and documents with automatic thumbnail generation
- **✅ Comprehensive Testing**: **94/94 automated tests passing** covering unit tests, integration tests, and API endpoint validation
- **✅ Production Architecture**: Streamlined authentication via gateway headers with role-based access control

#### **🔒 Security & Access Control**
- **Gateway-First Authentication**: Trusted microservices architecture with header-based user context (`x-user-id`, `x-user-role`, `x-user-email`)
- **Role-Based Permissions**: Complete RBAC implementation with STUDENT, TEACHER, and ADMIN role distinctions
- **File Security**: Comprehensive upload validation, MIME type checking, and secure file serving with access controls
- **Input Validation**: Robust request validation with UUID parameter checking and comprehensive error handling

#### **🏗️ Technical Excellence**
- **Database Design**: Optimized Prisma schema with proper relationships, indexes, and transaction management
- **Performance Optimized**: Streamlined service implementation with simplified database queries and efficient file processing
- **Container Ready**: Multi-stage Docker builds with Alpine Linux for production deployment
- **Developer Experience**: Hot reload development, comprehensive documentation, and standardized testing patterns

#### **📊 Testing Infrastructure**
- **Unit Tests**: 33/33 passing tests covering service layer business logic, middleware functionality, and error scenarios
- **Integration Tests**: 61/61 passing tests covering all API endpoints, authentication flows, and file upload scenarios
- **Mock Infrastructure**: Comprehensive Prisma mocking system enabling fast, reliable test execution without database dependencies
- **CI/CD Ready**: Automated testing pipeline with proper isolation and cleanup procedures

#### **� Architecture Improvements**
- **Simplified Authentication**: Removed complex signature verification in favor of trusted gateway-based user context
- **Optimized Database Queries**: Streamlined Prisma operations with proper relationship loading and filtering
- **Enhanced Error Handling**: Comprehensive error responses with proper HTTP status codes and debugging information
- **Clean Codebase**: Removed legacy code, implemented proper TypeScript patterns, and standardized file organization

---

## �🛠 Technology Stack ⚙️

The application leverages a modern, polyglot **microservices architecture** built for performance, security, and maintainability. We prioritize **TypeScript/Node.js** for application logic and **Python** for specialized AI tasks.

| Component | Technology | Notes |
| :--- | :--- | :--- |
| **Backend (Core Services)** | **Node.js, TypeScript, Express/NestJS** | Used for most microservices (Auth, Assessment, Submission, Notifications). |
| **Backend (AI Services)** | **Python (FastAPI)** | Reserved for AI/ML, NLP, and heavy data processing (e.g., Grading, Question Gen). |
| **Frontend** | **React, TypeScript, Tailwind CSS, shadcn/ui** | Modern, responsive single-page application. |
| **Database** | **PostgreSQL** (Prisma ORM) | Robust and scalable, with `pgvector` for future AI features. |
| **Message Broker** | **RabbitMQ** | For event-driven communication and asynchronous tasks. |
| **Security** | **Paseto Tokens** | Secure, stateless, tamper-proof authentication. |
| **Containerization** | **Docker** | For consistent local development. |
| **CI/CD & Infra** | GitHub Actions (CI/CD), Kubernetes (future), ArgoCD (future) | For automated testing, deployment, and scalability. |

-----

## 💻 Getting Started (Contributors) 🧑‍💻

### **1. Clone the repo**

```bash
git clone https://github.com/pediafor/assessment-app.git
cd assessment-app
```

### **2. Setup Environment**

The project uses Docker for consistency. Ensure Docker and Docker Compose are installed.

- **Setup Environment Files**: Create `.env` files for each service (frontend, backend, database), using the respective `.env.example` as a template.
- **Install Dependencies**: Follow the instructions in the service-specific directories (e.g., `/services/user-service`, `/services/assessment-service`) to install any necessary package dependencies (e.g., `npm install`).

### **3. Run Locally**

Start the entire application stack using the main Docker Compose file:

```bash
docker-compose up --build
```

#### **Assessment Service Development**

For focused development on the Assessment Service:

```bash
# Navigate to assessment service
cd services/assessment-service

# Install dependencies
npm install

# Start PostgreSQL database
docker-compose up assessment-db -d

# Run database migrations
npx prisma migrate dev

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

**Assessment Service Endpoints:**
- **Health Check**: `GET http://localhost:4001/health`
- **Service Info**: `GET http://localhost:4001/`
- **Assessments API**: `http://localhost:4001/assessments`
- **Media Upload**: `http://localhost:4001/media`

**Testing with Authentication Headers:**
```bash
# Teacher/Admin actions require headers:
curl -H "x-user-id: teacher-123" \
     -H "x-user-role: TEACHER" \
     -H "x-user-email: teacher@example.com" \
     http://localhost:4001/assessments
```

---

## 📜 License

This project is licensed under the **Apache License 2.0**, a permissive license that ensures:

- Freedom to use, modify, and distribute.
- Protection for contributors and users.
- Commercial and open-source compatibility.

See the [LICENSE](LICENSE) file for full details.

---

## 🌐 Links

- **Website** → [pediafor.com](https://pediafor.com)
- **GitHub Organization** → [github.com/pediafor](https://github.com/pediafor)

---

## 🤝 Contributing

We welcome contributions of all kinds! Please check the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines on:

- Setting up your development environment
- Making changes to specific microservices
- Coding standards and best practices
- Submitting pull requests

**Looking for a good place to start?** Check our [issue tracker](https://github.com/pediafor/assessment/issues) for issues tagged with [`good first issue`](https://github.com/pediafor/assessment/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).