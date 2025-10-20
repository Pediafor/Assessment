// Dev seed script to create test users directly in the local Postgres DB
// Uses Prisma Client and loads env from services/user-service/.env
/* eslint-disable no-console */
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function upsertUser({ id, email, password, firstName, lastName, role }) {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const data = {
    id,
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    role,
    isActive: true,
    isEmailVerified: true,
  };

  const existing = await prisma.user.findUnique({ where: { email: data.email, isActive: true } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { ...data, updatedAt: new Date() } });
    console.log(`Updated user ${email}`);
  } else {
    await prisma.user.create({ data: { ...data, createdAt: new Date(), updatedAt: new Date() } });
    console.log(`Created user ${email}`);
  }
}

async function main() {
  console.log('Seeding dev users into DB:', process.env.DATABASE_URL);
  await upsertUser({ id: 'tch_01', email: 'teacher1@pediafor.com', password: 'password', firstName: 'Alice', lastName: 'Teacher', role: 'TEACHER' });
  await upsertUser({ id: 'std_01', email: 'student1@pediafor.com', password: 'password', firstName: 'Jane', lastName: 'Doe', role: 'STUDENT' });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().finally(() => process.exit(1)); });
