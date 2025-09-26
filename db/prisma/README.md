# Prisma Setup for Pediafor

This document outlines the standard workflow and conventions for using Prisma as the ORM and migration tool for Pediafor's backend services.

## Workflow

We use a **hybrid migration strategy** to leverage the best of both worlds:

1. **Prisma Migrate** generates and applies the table schemas from the `schema.prisma` file. This handles all basic table and column creation.
2. **Raw SQL migrations** add features Prisma does not fully support yet, such as PostgreSQL extensions (`pgvector`, `uuid-ossp`) and performance-critical indexes like GIN and ivfflat.

---

## Commands

### 1. Generate Prisma Client
This command reads your `schema.prisma` file and generates a type-safe query builder, which is the API you'll use in your code. You must run this command after every change to your schema.

```bash
npx prisma generate
```

### 2. Run Initial Migration
This command creates a new migration file and applies it to your database. It's the primary way we manage schema changes. The `--name` flag is used to give the migration a descriptive name.

```bash
npx prisma migrate dev --name init
```

### 3. Apply Custom Indexes
After the initial Prisma migration, you need to apply the raw SQL to add the specialized indexes. The SQL file is stored in a dedicated migration folder.

```bash
psql $DATABASE_URL -f prisma/migrations/20250918_indexes/migration.sql
```

### 4. Check Database
This command opens a graphical user interface in your browser, allowing you to visually inspect the data in your database.

```bash
npx prisma studio
```

---

## Notes

### PostgreSQL Extensions
Ensure your PostgreSQL database has the necessary extensions enabled. These are a one-time setup step.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

### Indexing
Custom indexes are required for our advanced features:

- **GIN indexes** for efficient searching within JSONB columns and array fields (`roles`, `tags`, `metadata`).
- **ivfflat indexes** are required for the `vector` column used in the `questions` table. This index enables fast and efficient similarity search, which is crucial for our AI-driven features.

---

## 📄 `prisma/migrations/20250918_indexes/migration.sql`

This migration adds everything Prisma cannot natively handle, ensuring our database is optimized for performance and AI features.

```sql
-- ==================================================
-- Custom Indexes for Pediafor (Prisma extension)
-- ==================================================

-- USERS
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_profile ON users USING GIN (profile);

-- ASSESSMENTS
CREATE INDEX IF NOT EXISTS idx_assessments_metadata ON assessments USING GIN (metadata);

-- ASSESSMENT SECTIONS
CREATE INDEX IF NOT EXISTS idx_sections_assessment_id ON assessment_sections(assessment_id);

-- QUESTIONS
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_questions_content ON questions USING GIN (content);

-- Requires pgvector installed
CREATE INDEX IF NOT EXISTS idx_questions_embedding ON questions USING ivfflat (embedding) WITH (lists = 100);

-- SUBMISSIONS
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata ON submissions USING GIN (metadata);

-- GRADES
CREATE INDEX IF NOT EXISTS idx_grades_assessment ON grades(assessment_id);
CREATE INDEX IF NOT EXISTS idx_grades_user ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_metadata ON grades USING GIN (metadata);

-- ANALYTICS EVENTS
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
```