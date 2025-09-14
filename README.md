# Pediafor: Assessment & Evaluation

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![Built with FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Built with React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Language-Python-3776AB?logo=python)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker)

-----

## 📖 Overview

The **Pediafor Assessment & Evaluation** application is the first product wedge in our mission to build open, AI-centric education infrastructure. It aims to solve one of the most critical gaps in education today: providing a robust, fair, and accessible assessment platform that isn't locked behind high costs or proprietary systems.

Our approach is built on a few core principles:

  * **AI-Driven**: We're designing a platform to integrate AI from the ground up for features like automated grading, intelligent feedback, and adaptive testing.
  * **Open Infrastructure**: The core framework is designed to be extensible and interoperable, allowing institutions to integrate with their existing tools.
  * **Equitable**: By building in the open, we aim to make powerful education technology accessible to schools and institutions of all sizes, regardless of their budget.

-----

## ✨ Features & Status

| Feature                          | Status       | Notes |
|----------------------------------|--------------|-------|
| Question Bank (MCQ, subjective)  | ✅ Available | Initial DB schema & CRUD APIs ready |
| AI-Generated Questions           | 🚧 In Progress | NLP-powered question generation |
| Adaptive Testing Engine          | 📝 Planned   | Dynamic difficulty adjustment |
| Automated Grading (MCQ)          | 🚧 In Progress | Accurate & scalable |
| Automated Grading (Essays)       | 🚧 In Progress | Leveraging LLM evaluation + rubrics |
| Peer Review System               | 📝 Planned   | Community-driven grading |
| Analytics Dashboard              | 🚧 In Progress | Institution + student performance |
| API for Integration              | 🚧 In Progress | For LMS & external apps |
| Multi-language Support           | 📝 Planned   | i18n support for inclusivity |
| Offline Mode                     | 📝 Planned   | Key for low-connectivity regions |

---

## Technology Stack

The application is built on a modern microservices architecture to ensure scalability and maintainability.

  * **Backend**: Python with FastAPI for building the core APIs.
  * **Frontend**: A single-page application built with React and TypeScript.
  * **Database**: PostgreSQL, leveraging the `pgvector` extension for future AI-related features.
  * **Message Broker**: RabbitMQ for handling asynchronous tasks like auto-grading submissions.
  * **Containerization**: Docker for consistent local development and deployment.

-----

## 💻 Getting Started (Contributors)

### **Clone the repo**

```
git clone https://github.com/pediafor/assessment-app.git
cd assessment-app
```

### **Install dependencies**

```
npm install
```

### **Setup environment**

Create a `.env` file and use `.env.example` as a template.

### **Run locally**

```
npm run dev
```

-----

## 🧑‍💻 Coding Standards

  * **Languages**: TypeScript (frontend), Python (AI services)
  * **Code Style**:
      * ESLint + Prettier for JS/TS
      * Black + Flake8 for Python
  * **Commits**: Follow Conventional Commits.
  * **Branches**:
      * `main` for stable releases
      * `dev` for active development
      * `feature/xyz` for new features

-----

## 📜 License

This project is licensed under the **Apache License 2.0**—a permissive license that ensures:

  * Freedom to use, modify, and distribute
  * Protection for contributors and users
  * Commercial and open-source compatibility

See the `LICENSE` file for full details.

-----

## 🌐 Links

  * **Website** → [pediafor.com](http://pediafor.com)
  * **GitHub Org** → [github.com/pediafor](https://www.google.com/search?q=https://github.com/pediafor)

-----

## Contribution

We welcome contributions of all kinds\! If you're looking for a good place to start, check our issue tracker for issues tagged with "**good first issue**."
