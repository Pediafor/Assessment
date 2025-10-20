Seed data for local development and E2E testing.

- Postgres instances are exposed on host ports:
  - user-db: localhost:5432 (db: userservice_db, user: userservice_user, pass: userservice_password)
  - assessment-db: localhost:5433 (db: assessmentservice_db, user: assessmentservice_user, pass: assessmentservice_password)
  - submission-db: localhost:5434 (db: submissionservice_db, user: submissionservice_user, pass: submissionservice_password)
  - grading-db: localhost:5435 (db: gradingservice_db, user: gradingservice_user, pass: gradingservice_password)

Apply these scripts after docker services are healthy. The data links users, teachers, assessments, submissions, notifications, and grades.

Order:
1. 01-users.sql
2. 02-assessments.sql
3. 03-submissions.sql
4. 04-grades.sql
5. 05-notifications.sql
