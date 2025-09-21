# Pediafor Seed Data Setup

This README explains how to populate the Pediafor development database with dummy data using the provided seed script.

## Prerequisites

* Node.js v18+ installed
* PostgreSQL database set up
* Prisma installed (`npm install @prisma/client prisma`)
* Database URL configured in `.env` as `DATABASE_URL`

## Included Seed Data

* **20 Users**: 1 Admin, 19 Learners
* **3 Assessments**: Each with 2 sections
* **Sections**: 2 per assessment
* **Questions**: 3 per section, with content, options, answers, difficulty
* **Submissions & Grades**: 10 sample submissions with AI grading
* **Analytics**: UserAnalytics and AssessmentAnalytics records

## Steps to Run Seed Script

### Option 1: Using bcrypt (recommended, realistic passwords)

1. Install dependencies:

```bash
npm install
npm install bcrypt
npm install -D @types/bcrypt
```

2. Run migrations to ensure the schema is applied:

```bash
npx prisma migrate dev --name init
```

3. Run the seed script:

```bash
npx ts-node prisma/seed/seed.ts
```

### Option 2: Without bcrypt (dev-only, plain passwords)

* If you don't want to install bcrypt, you can comment out the hash line in `seed.ts` and assign plain passwords:

```ts
// password_hash: await hash("password123", 10),
password_hash: "password123",
```

* Then run the seed script directly:

```bash
npx ts-node prisma/seed/seed.ts
```

4. Verify in your database:

* Check `User`, `Assessment`, `AssessmentSection`, `Question`, `Submission`, `Grade`, `UserAnalytics`, `AssessmentAnalytics` tables.

## Notes

* Seed script is **idempotent**. Running multiple times will not create duplicates.
* Passwords can be hashed with bcrypt for realistic testing or plain for simplicity.
* JSON fields for profiles, questions, answers, and analytics are populated with sample data.
* Modify `assessmentsData`, `questionTypes`, or user count to expand test dataset.

## Development Use

This seed data allows developers to:

* Test API endpoints without manual data entry
* Experiment with assessment flows, grading, and analytics
* Verify UI with realistic dataset
* Prepare features for production deployment

---

For production, **disable or remove seed script** to avoid dummy data contamination.
