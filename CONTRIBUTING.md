
# 🤝 Contributing to Pediafor - The Assessment App

First of all, thank you for considering contributing to **Pediafor** 💙
This project is the first wedge in our mission to build open-source, AI-centric education infrastructure.
We welcome contributions from developers, educators, researchers, designers, and anyone who wants to reshape education.

---

## 🧭 How to Contribute

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/Pediafor/Assessment.git
   cd assessment
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Make your changes**
   - Write clean, tested, and documented code.
   - Keep database schema changes in sync with Prisma migrations.
5. **Commit using conventional commits**
   ```bash
   git commit -m "feat: add adaptive testing engine"
   ```
6. **Push to your fork**
   ```bash
   git push origin feat/your-feature-name
   ```
7. **Open a Pull Request (PR)**
   - Describe your changes clearly.
   - If you modified schemas, mention whether it affects `schema.prisma`, `/db/init.sql`, or both.

---

## 🔖 Commit and Branch Guidelines

**Branch Naming**
- `feat/xyz` → New features
- `fix/xyz` → Bug fixes
- `docs/xyz` → Documentation changes
- `chore/xyz` → Tooling or infrastructure updates
- `db/xyz` → Schema or migration changes

**Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 🧑‍💻 Code Standards

**Languages:**
- TypeScript (frontend + backend microservices)
- Python (AI services)
- SQL (Postgres, schema & migrations via Prisma)

**Linters & Formatters:**
- JavaScript & TypeScript → ESLint + Prettier
- Python → Black + Flake8
- SQL → pgFormatter (recommended for consistency)

**Run checks locally before pushing:**
```bash
npm run lint
npm run test
```

---

## ✅ Development Setup

### Frontend & Backend

**Install dependencies**
```bash
npm install
```

**Setup environment**
Copy `.env.example` → `.env` and configure your values.

**Run local dev server**
```bash
npm run dev
```

**Run backend (if separate service)**
```bash
npm run start:server
```

### Database Setup

The `/db` folder contains two paths for working with the database:

**Prisma ORM (Recommended)**
- Schema defined in `/db/prisma/schema.prisma`
- Run migrations:
  ```bash
  npx prisma migrate dev --name init
  ```
- Deploy to production:
  ```bash
  npx prisma migrate deploy
  ```

**Raw SQL Bootstrap**
- For debugging or manual setup:
  ```bash
  psql -U <user> -d <database> -f db/init.sql
  ```

> 📌 **Important:** Always treat `schema.prisma` as the source of truth. `init.sql` is a fallback/manual alternative.

---

## 📊 Analytics

We support multiple layers of analytics:

- **Foundational Reports** → Student performance, question effectiveness, grade distributions
- **Advanced Reports** → Risk profiles, curriculum bottlenecks, rubric effectiveness, hint/resource usage
- **Aggregated Tables** → `user_analytics`, `assessment_analytics`, `submission_analytics`, etc.

See `docs/analytics-report-guide.md` for full details.

---

## 🧪 Testing

- Write unit tests for new features (Jest for TypeScript, Pytest for Python).
- Test migrations locally before pushing:
  ```bash
  npx prisma migrate dev
  ```
- Add sample JSON (questions, users, submissions) when modifying schema-related code.

---

## 📝 Documentation

- Keep code self-documented with clear naming.
- Update schema docs when database models change:
  - `/docs/user_schema.md`
  - `/docs/question_schema.md`
  - `/docs/analytics-report-guide.md`
- Update `/db/README.md` if database workflows change.

---

## 🛡 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
This ensures freedom, transparency, and compatibility with both open-source and commercial ecosystems.

---

## 🌍 Community

- Website → [pediafor.com](https://pediafor.com)
- GitHub → [github.com/pediafor](https://github.com/pediafor)

<p align="center">✨ Together, we’re building the foundation of the future of education. ✨</p>
