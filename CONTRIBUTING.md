# 🤝 Contributing to Pediafor - The Assessment App

First of all, **thank you** for considering contributing to Pediafor! 💙 This project is the first wedge in our mission to build open-source, AI-centric education infrastructure. We welcome contributions from developers, educators, researchers, designers, and anyone who wants to reshape education.

---

## 🧭 How to Contribute

### 1. Fork the repository

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/assessment.git
cd assessment
```

### 3. Create a feature branch

```bash
git checkout -b feat/your-feature-name
```

### 4. Make your changes
Write clean, tested, and documented code.

### 5. Commit using conventional commits

```bash
git commit -m "feat: add submission tracking"
```

### 6. Push to your fork

```bash
git push origin feat/your-feature-name
```

### 7. Open a Pull Request (PR)
Describe your changes clearly.

---

## 🔖 Commit and Branch Guidelines

### Branch Naming

- `feat/xyz` → New features
- `fix/xyz` → Bug fixes  
- `docs/xyz` → Documentation changes
- `chore/xyz` → Tooling or infrastructure updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 🧑‍💻 Code Standards

### Languages

- **TypeScript** (all v1 services: user, assessment, submission, grading, gateway)

---

## ✅ Development Setup

### Setup environment
Copy `.env.example` → `.env` in each service and configure your values.

### Run local dev servers

**Start an individual service:**

```bash
cd services/user-service
npm install
npm run dev
```

**Or start everything with Docker Compose:**

```bash
docker-compose up
```

---

## 🧪 Testing

- Use **Jest** for unit and integration tests
- Write tests for new features
- Run tests locally for the service you are working on before opening a PR:

```bash
cd services/<service-name>
npm test
```

---

## 📝 Documentation

- Keep code self-documented with clear names and comments
- Update `docs/` or `README.md` when features change

---

## 🛡 License

By contributing, you agree that your contributions will be licensed under the **Apache License 2.0**.

---

*Last Updated: October 13, 2025*