# 🎓 Pediafor: Open-Source Assessment Platform

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Architecture](https://img.shields.io/badge/Architecture-Event%20Driven%20Microservices-orange)
![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)
![Built with Node.js](https://img.shields.io/badge/Backend-Node.js%20%26%20TypeScript-339933?logo=nodedotjs)
![Built with React](https://img.shields.io/badge/Frontend-Next.js%2014%2B%20%26%20React-61DAFB?logo=react)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Events](https://img.shields.io/badge/Events-RabbitMQ%20Powered-FF6600)
![Docker](https://img.shields.io/badge/Container-Docker%20Ready-2496ED?logo=docker)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)](CONTRIBUTING.md)

> **🚀 Production-Ready Event-Driven Assessment Platform**  
---

## 🌟 Why Choose Pediafor?

### 💡 **Open Source & AI-First**
- **Zero Vendor Lock-in**: Complete source code with Apache 2.0 license
- **AI-Powered Grading**: Automated assessment with intelligent feedback
- **Cost-Effective**: Enterprise-grade features without enterprise costs
- **Community-Driven**: Built by educators, for educators

### 🏗️ **Production-Ready Architecture** 
- **Event-Driven Microservices**: 7 independent services with RabbitMQ messaging
- **High Test Coverage**: Comprehensive test suites for all services
- **Scalable by Design**: Handle thousands of concurrent users
- **Security-First**: PASETO V4 tokens, FERPA/GDPR compliant

### ⚡ **Modern Technology Stack**
- **Backend**: Node.js, TypeScript, Express.js with PostgreSQL
- **Frontend**: Next.js 14+ App Router, React 18, Tailwind CSS
- **Real-time**: **WebTransport + WebSocket** dual-protocol server for cutting-edge performance
- **Container-Ready**: Docker deployment with health monitoring

---

## 🎯 **What You Get Out of the Box**

### 👨‍🎓 **For Students**
- **Assessment Interface**: Clean, accessible exam-taking experience
- **Real-time Auto-save**: Never lose progress with automatic draft saving
- **Instant Feedback**: Immediate results for multiple-choice questions

### 👩‍🏫 **For Teachers**
- **Assessment Builder**: Rich assessment creation with media support
- **Automated + Manual Grading**: Hybrid grading with rubric UI, per-question scoring, teacher queue, and overview analytics
- **Student Management**: Searchable/paginated roster, student detail page with recent submissions
- **Real-time Analytics**: Backend analytics service operational

### 🏢 **For Administrators**
- **User Management**: Backend user service operational
- **System Analytics**: Backend analytics operational
- **Scalable Infrastructure**: Handle institutional-scale concurrent usage
- **Integration Ready**: API-first design for LMS and SIS integration

---

## 🚀 Quick Start

```bash
# Clone and start the production-ready backend
git clone https://github.com/pediafor/assessment.git
cd assessment
docker compose up --build

# 🎉 Backend Ready! Access services:
# API Gateway: http://localhost:3000
# RabbitMQ Management: http://localhost:15672
```

### 🔎 Quick Smoke Tests

Use these to sanity-check your environment (replace TOKEN with a real access token after login):

```bash
# Gateway health
curl -s http://localhost:3000/health

# Public register (example)
curl -s -X POST http://localhost:3000/users/register \
	-H "Content-Type: application/json" \
	-d '{"email":"demo+gw@local","password":"Passw0rd!","firstName":"Demo","lastName":"User"}'

# Protected example (requires TOKEN)
curl -s http://localhost:3000/users/me -H "Authorization: Bearer TOKEN"
```

For per-service smoke tests, see the individual service READMEs in `services/*/README.md`.

---

## 📖 Documentation

- [🏗️ Architecture Guide](docs/architecture.md)
- [⚡ Event-Driven Architecture](docs/event-driven-architecture.md)
- [🔧 Development Setup](docs/development.md)
- [🚀 Deployment Guide](docs/deployment.md)
- [📡 API Documentation](docs/api.md)
- [🔔 Notification Service](docs/notification-service.md)
- [🤝 Contributing Guide](CONTRIBUTING.md)
- [🧪 SQL Examples (dev-only)](docs/sql-examples/README.md)

---

## 🛠️ Technology Stack

### **Backend**
- **Node.js + TypeScript**: Type-safe, performant microservices
- **Express.js**: Lightweight, flexible API framework  
- **PostgreSQL + Prisma**: Robust data layer with type safety
- **RabbitMQ**: Enterprise-grade event messaging
- **PASETO V4**: Modern, secure token authentication

### **Frontend** 
- **Next.js 14+ App Router**: Modern React framework with SSR
- **Tailwind CSS**: Responsive, utility-first CSS

### **Infrastructure**
- **Docker**: Containerized deployment

---

## ✨ Feature Status

| Feature | Status | Notes |
| --- | --- | --- |
| **User Management** | ✅ Implemented | CRUD, roles, permissions |
| **Authentication** | ✅ Implemented | PASETO V4, login, logout, refresh |
| **Assessment Management** | ✅ Implemented | CRUD, media uploads |
| **Submission Management** | ✅ Implemented | CRUD, file uploads, autosave |
| **Automated Grading** | ✅ Implemented | MCQ, True/False |
| **Event-Driven Architecture** | ✅ Implemented | RabbitMQ, events for all services |
| **Email Notifications** | ✅ Implemented | Notification Service consumes grading.completed and emails students |
| **Real-time Notifications** | ✅ Implemented | Event-driven notifications with gateway and realtime fanout |
| **Frontend** | 🟡 In Development | Basic structure and some components are ready |

---

## 🗺️ Roadmap

### **Next Steps**
- **Advanced Grading**: Essay grading, AI-powered grading.
- **Advanced Analytics**: More detailed dashboards and reports.
- **Full Frontend Implementation**: Complete the frontend for all user roles.

### **Future**
- **LMS Integrations**: Canvas, Moodle, etc.
- **Mobile App**: Native mobile apps for iOS and Android.

---

## 📜 License

Licensed under the [Apache License 2.0](LICENSE).

---

*Last Updated: October 20, 2025*
