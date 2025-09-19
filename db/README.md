# 🗄️ Database Setup for Pediafor

This guide explains how to set up and work with the Postgres database in a containerized environment, using Prisma as the primary migration tool.
We also provide an optional raw SQL bootstrap for contributors who want to work directly with Postgres.

---

## 📦 1. Start Postgres with Docker
```bash
docker-compose up -d
```

This starts Postgres in a container with persistent storage mounted at `./db` (on your host).
All database files are safely stored there, even if you remove the container.

---

## ⚡ 2. Schema Setup Options

We support two ways of creating the schema.
Pick one depending on your workflow:

### ✅ Option A (Recommended) – Prisma Migrations

This is the source of truth for schema changes.

Generate the Prisma client:
```bash
npx prisma generate
```

Run the initial migration:
```bash
npx prisma migrate dev --name init
```

This creates all tables defined in `schema.prisma`.

---

### 🛠️ Option B (Optional) – Raw SQL Bootstrap

We also ship an `init.sql` bootstrap (`db/init.sql`) that can create the schema in one shot.
This is useful if:

- You want to set up the DB without installing Node/Prisma.
- You’re debugging or resetting the database directly in Postgres.

Run inside the container:
```bash
docker exec -i pediafor-db psql -U postgres -d pediafor < /app/db/init.sql
```
⚠️ Note: If you use this method, avoid running Prisma migrations on top.
They may conflict or drift from the SQL schema.

---

## 📊 3. Applying Custom Indexes

Prisma does not support all PostgreSQL features (e.g., pgvector, GIN/ivfflat indexes).
We provide a raw SQL migration for these optimizations:

```bash
docker exec -i pediafor-db psql -U postgres -d pediafor < /app/db/migrations/20250918_indexes/migration.sql
```

---

## 📤 4. Exporting Data from Persistent Storage

All database files are stored in the mounted `./db` folder.
You can back up or export data using:

```bash
docker exec -t pediafor-db pg_dump -U postgres -d pediafor > backup.sql
```

This creates a SQL dump that can be restored later with:

```bash
psql -U postgres -d pediafor < backup.sql
```

---

## 🔍 Summary – Which Path Should I Use?

- I’m a contributor writing code → Use Prisma migrations (Option A).
- I’m debugging Postgres directly / no Prisma → Use raw SQL bootstrap (Option B).

Prisma = schema changes, SQL = optional setup/debugging.
