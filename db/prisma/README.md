
# 📂 Prisma Setup for Pediafor

This document outlines the standard workflow and conventions for using Prisma as the ORM and migration tool for Pediafor’s backend services.

We follow a hybrid migration strategy:

- **Prisma Migrate** → generates & applies schemas from `schema.prisma`. Handles all core tables and fields.
- **Raw SQL migrations** → extend Postgres with features Prisma doesn’t fully support (e.g., pgvector, uuid-ossp, GIN/ivfflat indexes).

---

## 🚀 Workflow

### 1. Generate Prisma Client
Run this after every change to `schema.prisma`.
It generates the type-safe query builder you’ll use in the codebase.

```bash
npx prisma generate
```

### 2. Run Initial Migration
Create a migration and apply it to your database:

```bash
npx prisma migrate dev --name init
```

This will:

- Generate a migration under `prisma/migrations/`
- Apply it to your Postgres DB
- Keep track of applied migrations

For production, use:

```bash
npx prisma migrate deploy
```

### 3. Apply Custom Indexes
Prisma does not generate advanced indexes automatically.
After running migrations, apply the raw SQL indexes:

```bash
psql $DATABASE_URL -f prisma/migrations/20250918_indexes/migration.sql
```

These include:

- **GIN indexes** → JSONB, arrays, metadata fields
- **ivfflat indexes** → vector embeddings (requires pgvector)
- **Foreign key support indexes** → to speed up joins

### 4. Inspect Database
Prisma includes a built-in GUI for debugging:

```bash
npx prisma studio
```

This opens a browser-based data explorer for your models.

---

## 🛠 PostgreSQL Extensions

Some features require Postgres extensions. These are one-time setup:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

- `uuid-ossp` → UUID generation for primary keys
- `vector` → required for semantic search (AI features)

---

## 📈 Indexing Strategy

Custom indexes optimize performance and enable AI-driven features.

### JSONB & Array Fields

- **Users** → roles, profile
- **Assessments** → metadata
- **Questions** → tags, content
- **Submissions** → metadata
- **Grades** → metadata

These get GIN indexes for fast searching.

### Vector Fields

- `Questions.embedding` → ivfflat index with lists=100
	Enables similarity search for question retrieval & AI features.

### Foreign Keys & Joins

Standard B-Tree indexes for:

- `submissions.assessment_id`
- `submissions.user_id`
- `grades.assessment_id`
- `grades.user_id`
- `assessment_sections.assessment_id`

---

## 📄 Example: Custom Index Migration

**File:** `prisma/migrations/20250918_indexes/migration.sql`

```sql
-- USERS
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_profile ON users USING GIN (profile);

-- ASSESSMENTS
CREATE INDEX IF NOT EXISTS idx_assessments_metadata ON assessments USING GIN (metadata);

-- SECTIONS
CREATE INDEX IF NOT EXISTS idx_sections_assessment_id ON assessment_sections(assessment_id);

-- QUESTIONS
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_questions_content ON questions USING GIN (content);
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

---

## 🔑 Contributor Notes

- Always treat `schema.prisma` as the source of truth
- Run `prisma migrate dev` after modifying models
- Add custom SQL migrations only for:
	- Postgres extensions
	- JSONB indexes
	- Vector search indexes
- Commit both the `schema.prisma` changes and the corresponding migration folder

---

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Postgres JSONB Indexing](https://www.postgresql.org/docs/current/datatype-json.html)
- [pgvector](https://github.com/pgvector/pgvector)

🔥 With this hybrid approach, Prisma keeps things declarative & consistent, while manual migrations give us full power of Postgres.