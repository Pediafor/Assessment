
# 🗄️ Database Setup for Pediafor

This guide explains how to set up and work with the PostgreSQL database in a containerized environment, using Prisma as the primary migration tool.
We also provide optional raw SQL steps for contributors who want to work directly with Postgres.

---

## 📦 1. Start Postgres with Docker

```bash
docker-compose up -d
```

This starts Postgres in a container with persistent storage mounted at `./db` on your host.
All database files are safely stored there, even if you remove the container.

---

## ⚡ 2. Environment Variables

Create a `.env` file inside the prisma folder:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=<schema>"
```

Ensure `schema.prisma` references it:

```prisma
datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
```

---

## ⚡ 3. Install Required PostgreSQL Extensions

Connect to the database via Docker:

```bash
docker exec -it <container> psql -U <user> -d <database>
```

Run the required extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- vector extension is optional and can be added later
```

Verify extensions:

```sql
\dx
```

---

## ⚡ 4. Schema Setup Options

We support two ways of creating the schema. Pick one depending on your workflow:

### ✅ Option A (Recommended) – Prisma Migrations

Generate the Prisma client:

```bash
npx prisma generate
```

Run the initial migration:

```bash
npx prisma migrate dev --name <migration-name> --schema <schema-path>
```

This creates all tables defined in `schema.prisma`.
Make sure uuid-ossp is installed to avoid uuid_generate_v4() errors.

---

### 🛠️ Option B (Optional) – Raw SQL Bootstrap

We also provide an `init.sql` bootstrap (`db/init.sql`) that can create the schema in one shot. Useful if:

- You want to set up the DB without Node/Prisma.
- You’re debugging or resetting the database directly in Postgres.

Run inside the container:

```bash
docker exec -i <container> psql -U <user> -d <database> -f /app/db/init.sql
```

⚠️ Note: Avoid running Prisma migrations on top of this method, as they may conflict.

---

## 📊 5. Applying Custom Indexes

Prisma does not support all PostgreSQL features (e.g., GIN indexes for arrays/JSONB).
We provide `_indexes.sql` for these optimizations:

Modified `_indexes.sql` (without vector indexes for now):

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
docker cp ./_indexes.sql <container>:/tmp/_indexes.sql
docker exec -it <container> psql -U <user> -d <database> -f /tmp/_indexes.sql
```

---

## 📤 6. Exporting Data from Persistent Storage

All database files are stored in the mounted `./db` folder.
You can back up or export data using:

```bash
docker exec -t <container> pg_dump -U <user> -d <database> > backup.sql
```

Restore with:

```bash
psql -U <user> -d <database> < backup.sql
```

---

## 🔍 Summary – Which Path Should I Use?

- Contributor writing code → Use Prisma migrations (Option A).
- Debugging Postgres directly / no Node → Use raw SQL bootstrap (Option B).

Prisma = schema changes, SQL = optional setup/debugging.
