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
   cd assessment-app
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

4. **Make your changes**
   Write clean, tested, and documented code.

5. **Commit using conventional commits**

   ```bash
   git commit -m "feat: add adaptive testing engine"
   ```

6. **Push to your fork**

   ```bash
   git push origin feat/your-feature-name
   ```

7. **Open a Pull Request (PR)**
   Describe your changes clearly.

---

## 🔖 Commit and Branch Guidelines

### Branch Naming

* `feat/xyz` → New features
* `fix/xyz` → Bug fixes
* `docs/xyz` → Documentation changes
* `chore/xyz` → Tooling or infrastructure updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 🧑‍💻 Code Standards

**Languages**

* TypeScript (frontend)
* Python (AI services)

**Linters & Formatters**

* JavaScript & TypeScript → ESLint + Prettier
* Python → Black + Flake8

**Run checks locally before pushing**

```bash
npm run lint
npm run test
```

---

## ✅ Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment**
   Copy `.env.example` → `.env` and configure your values.

3. **Run local dev server**

   ```bash
   npm run dev
   ```

4. **Run backend (if separate service)**

   ```bash
   npm run start:server
   ```

---

## 📊 Feature Status

Check the [README.md](./README.md) for the feature roadmap and development status.
👉 If you want to work on something, please open an **Issue** first to avoid overlap.

---

## 🧪 Testing

* Write unit tests for new features (Jest, Pytest).
* Run tests locally before opening a PR.

---

## 📝 Documentation

* Keep code **self-documented** with clear naming.
* Update documentation files when features change.

---

## 🛡 License

By contributing, you agree that your contributions will be licensed under the **Apache License 2.0**.
This ensures freedom, transparency, and compatibility with both open-source and commercial ecosystems.

---

## 🌍 Community

* Website → [pediafor.com](https://pediafor.com)
* GitHub → [github.com/pediafor](https://github.com/pediafor)

---

<p align="center">✨ Together, we’re building the foundation of the future of education. ✨</p>
