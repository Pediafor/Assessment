# Pediafor Assessment Platform - Frontend

[![React](https://img.shields.io/badge/React-18.3.0-61DAFB?logo=react)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.0-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-brightgreen)](../../LICENSE)

## 🚀 Overview

Modern, accessible, and performant React/Next.js frontend for the Pediafor Assessment Platform. Built with TypeScript, Tailwind CSS, and shadcn/ui components for a seamless educational assessment experience.

## ✨ Features

### 🎨 **Modern Design System**
- **Tailwind CSS** with custom design tokens
- **Dark/Light mode** with system preference detection
- **Responsive design** optimized for all devices
- **Accessibility-first** with WCAG 2.1 AA compliance

### 🔐 **Authentication & Security**
- **PASETO token** integration with backend services
- **Role-based access control** (Student, Teacher, Admin)
- **Session management** with automatic refresh
- **Secure route protection**

### ⚡ **Performance Optimized**
- **Next.js 14+** with App Router for optimal performance
- **Server-side rendering** and static generation
- **Code splitting** and lazy loading
- **Image optimization** with Next.js Image component

### 🧪 **Assessment Features**
- **Interactive question types** (Multiple choice, Essay, File upload, etc.)
- **Real-time autosave** during assessments
- **Time management** with countdown timers
- **Comprehensive analytics** and reporting

### 📊 **Dashboard & Analytics**
- **Role-specific dashboards** for different user types
- **Real-time data** with TanStack Query
- **Interactive charts** and visualizations
- **Export capabilities** for reports

## 🛠️ Tech Stack

### **Core Framework**
- **React 18.3+** - Modern React with concurrent features
- **Next.js 14.2+** - Full-stack React framework with App Router
- **TypeScript 5.4+** - Type-safe development

### **UI & Styling**
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful & consistent icons

### **State Management**
- **TanStack Query 5+** - Powerful data synchronization
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant forms with validation

### **Development Tools**
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates
- **TypeScript** - Static type checking

### **Testing**
- **Jest** - Unit testing framework
- **Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js 14+ App Router
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   └── layout.tsx      # Auth layout
│   │   ├── student/            # Student dashboard & flows
│   │   ├── teacher/            # Teacher dashboard & flows
│   │   ├── admin/              # Admin interface
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── forms/              # Form components
│   │   ├── assessment/         # Assessment-specific components
│   │   ├── analytics/          # Dashboard & analytics components
│   │   ├── layouts/            # Layout components
│   │   └── providers/          # Context providers
│   ├── lib/                    # Utilities and configurations
│   │   ├── api.ts              # API client configuration
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── utils.ts            # Helper functions
│   │   └── validations.ts      # Form validation schemas
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Theme and styling utilities
├── public/                     # Static assets
│   ├── logos/                  # Brand assets
│   └── icons/                  # App icons
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0+ and npm 9.0+
- **Backend services** running (see [main README](../../README.md))

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   NEXT_PUBLIC_APP_NAME=Pediafor Assessment
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3001
   ```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server on port 3001
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run end-to-end tests

# Code Quality
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

### Development Workflow

1. **Start backend services** (see [main README](../../README.md))
2. **Start frontend development server**
3. **Make changes** with hot reload
4. **Run tests** to ensure quality
5. **Lint and format** code before committing

### Adding New Components

1. **Create component file**
   ```bash
   # Example: Add a new assessment component
   touch src/components/assessment/question-editor.tsx
   ```

2. **Use TypeScript and proper props**
   ```tsx
   interface QuestionEditorProps {
     question: Question;
     onChange: (question: Question) => void;
     className?: string;
   }
   
   export function QuestionEditor({ question, onChange, className }: QuestionEditorProps) {
     // Component implementation
   }
   ```

3. **Add tests**
   ```bash
   touch src/components/assessment/__tests__/question-editor.test.tsx
   ```

## 🎨 Design System

### Color Palette

```css
/* Primary Brand Colors */
--primary: #ed5622         /* Orange - Main brand color */
--secondary: #4e4e4e       /* Gray - Supporting color */

/* Semantic Colors */
--success: #10b981         /* Green - Success states */
--warning: #f59e0b         /* Amber - Warning states */
--error: #ef4444           /* Red - Error states */
--info: #3b82f6            /* Blue - Info states */
```

### Typography

- **Font Family**: Inter (primary), system fonts (fallback)
- **Scale**: 12px to 72px modular scale
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Component Usage

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Usage with variants
<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="outline" size="sm">Secondary Action</Button>
```

## 🔌 API Integration

### API Client Configuration

```typescript
// lib/api.ts
const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Using TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query';

function AssessmentList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => api.get('/assessments'),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <AssessmentGrid assessments={data} />;
}
```

## 🧪 Testing

### Unit Testing

```bash
# Run all tests
npm run test

# Run tests for specific component
npm run test -- question-editor

# Run tests with coverage
npm run test:coverage
```

### End-to-End Testing

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests in headed mode
npx playwright test --headed
```

### Example Test

```tsx
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/forms/login-form';

test('renders login form', () => {
  render(<LoginForm />);
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Environment Variables

```env
# Required for production
NEXT_PUBLIC_API_URL=https://api.pediafor.com
NEXT_PUBLIC_WS_URL=wss://api.pediafor.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://assessment.pediafor.com
```

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT 3001

CMD ["node", "server.js"]
```

## 🤝 Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended from Next.js config
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** with tests
3. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
4. **Submit PR** with description
5. **Address review feedback**

### Commit Convention

```bash
feat: add assessment timer component
fix: resolve login form validation
docs: update API integration guide
style: format components with prettier
test: add unit tests for dashboard
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Backend Integration
- [API Documentation](../../docs/API.md)
- [Authentication Guide](../../docs/authentication.md)
- [Deployment Guide](../../docs/deployment.md)

## 📄 License

Licensed under [Apache License 2.0](../../LICENSE). See the license file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/pediafor/assessment/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pediafor/assessment/discussions)
- **Email**: [support@pediafor.com](mailto:support@pediafor.com)

---

**Made with ❤️ by the Pediafor Team**