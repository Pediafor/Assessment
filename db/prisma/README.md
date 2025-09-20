# 📂 Prisma Setup for Pediafor

This document outlines the workflow for using Prisma as the ORM and migration tool for Pediafor’s backend, including Docker-based PostgreSQL setup.

We follow a hybrid migration strategy:

- Prisma Migrate → generates & applies schemas from schema.prisma.
- Raw SQL migrations → apply Postgres features Prisma doesn’t support (e.g., GIN indexes, UUID extension).

---

## 🚀 Workflow

### 1. Setup PostgreSQL with Docker

Create a docker-compose.yml for Postgres:

```yaml
services:
	postgres:
		image: postgres:15
		container_name: pediafor-db
		restart: unless-stopped
		environment:
			POSTGRES_USER: pediafor
			POSTGRES_PASSWORD: pediafor
			POSTGRES_DB: pediafor
		ports:
			- "5432:5432"
		volumes:
			- pediafor_db_data:/var/lib/postgresql/data
			- ./db:/app/db
		healthcheck:
			test: ["CMD-SHELL", "pg_isready -U pediafor -d pediafor"]
			interval: 10s
			timeout: 5s
			retries: 5

volumes:
	pediafor_db_data:
```

Start the database:

```bash
docker-compose up -d
```

---

### 2. Configure .env

Create .env inside the prisma folder:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=<schema>"
```

Ensure schema.prisma points to it:

```prisma
datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
```

---

### 3. Install Required PostgreSQL Extensions

Connect to Postgres via Docker:

```bash
docker exec -it <container> psql -U <user> -d <database>
```

Run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- vector extension is optional and can be added later if needed
```

Verify:

```sql
\dx
```

---

### 4. Generate Prisma Client

After every schema change:

```bash
npx prisma generate
```

---

### 5. Run Initial Migration

```bash
npx prisma migrate dev --name <migration-name> --schema <schema-path>
```

If errors occur due to uuid_generate_v4(), ensure uuid-ossp extension is installed.

---

### 6. Apply Custom Indexes

Since Prisma cannot generate all indexes, apply indexes.sql manually:

```sql
-- USERS
CREATE INDEX IF NOT EXISTS idx_users_roles ON "User" USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_profile ON "User" USING GIN (profile);

-- ASSESSMENTS
CREATE INDEX IF NOT EXISTS idx_assessments_metadata ON "Assessment" USING GIN (metadata);

-- SECTIONS
CREATE INDEX IF NOT EXISTS idx_sections_assessment_id ON "AssessmentSection"(assessment_id);

-- QUESTIONS
CREATE INDEX IF NOT EXISTS idx_questions_tags ON "Question" USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_questions_content ON "Question" USING GIN (content);

-- SUBMISSIONS
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON "Submission"(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON "Submission"(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata ON "Submission" USING GIN (metadata);

-- GRADES
CREATE INDEX IF NOT EXISTS idx_grades_assessment ON "Grade"(assessment_id);
CREATE INDEX IF NOT EXISTS idx_grades_user ON "Grade"(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_metadata ON "Grade" USING GIN (metadata);

-- ANALYTICS EVENTS
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON "AnalyticsEvent"(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON "AnalyticsEvent"(created_at);
```

Apply the indexes:

```bash
docker cp <local-indexes-file> <container>:/tmp/<indexes-file>
docker exec -it <container> psql -U <user> -d <database> -f /tmp/<indexes-file>
```

---

### 7. Inspect Database

Open Prisma Studio:

```bash
npx prisma studio
```

---

## 📝 Notes

- Always treat schema.prisma as the source of truth.
- Custom SQL is only for:
	- Postgres extensions
	- JSONB / array indexes
	- Vector search indexes (later)
- Commit both schema.prisma and indexes.sql changes.

---

## 📚 References

* [Prisma Docs](https://www.prisma.io/docs/)
* [Postgres JSONB Indexing](https://www.postgresql.org/docs/current/datatype-json.html#JSONB-INDEXING)
* [pgvector](https://github.com/pgvector/pgvector)