import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // -------------------------------
  // 1. Users
  // -------------------------------
  const usersData = [];
  for (let i = 1; i <= 20; i++) {
    usersData.push({
      username: i === 1 ? 'admin' : `learner${i-1}`,
      email: i === 1 ? 'admin@pediafor.org' : `learner${i-1}@pediafor.org`,
      password_hash: await hash(i === 1 ? 'admin123' : `password${i-1}`, 10),
      roles: i === 1 ? ['ADMIN'] : ['LEARNER'],
      timezone: 'Asia/Kolkata',
      gdpr_consent: true,
      profile: { fullName: i === 1 ? 'Super Admin' : `Learner ${i-1}`, bio: `Bio of ${i === 1 ? 'Admin' : 'Learner ' + (i-1)}` },
      settings: { theme: i % 2 === 0 ? 'light' : 'dark', notifications: i % 3 === 0 },
      data_region: 'IN',
    });
  }

  const users = [];
  for (const u of usersData) {
    users.push(await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u }));
  }
  console.log(`Created ${users.length} users.`);

  // -------------------------------
  // 2. Assessments
  // -------------------------------
  const assessmentsData = [
    { title: 'Algebra Basics', description: 'Test basic algebra concepts', status: 'published', visibility: 'public', version: 1, metadata: { category: 'Math', difficulty: 'easy' }, timing: { duration_minutes: 30 } },
    { title: 'Introduction to Physics', description: 'Assess physics fundamentals', status: 'published', visibility: 'public', version: 1, metadata: { category: 'Science', difficulty: 'medium' }, timing: { duration_minutes: 45 } },
    { title: 'Basic Programming', description: 'Introductory programming test', status: 'draft', visibility: 'private', version: 1, metadata: { category: 'Computer Science', difficulty: 'medium' }, timing: { duration_minutes: 60 } },
  ];

  const assessments = [];
  for (const a of assessmentsData) {
    assessments.push(await prisma.assessment.create({ data: a }));
  }
  console.log(`Created ${assessments.length} assessments.`);

  // -------------------------------
  // 3. Sections & Questions
  // -------------------------------
  const questionTypes = ["MCQ", "SHORT_ANSWER", "CODING"];
  const difficulties = ["easy", "medium", "hard"];

  for (const assessment of assessments) {
    for (let s = 1; s <= 2; s++) {
      const section = await prisma.assessmentSection.create({
        data: { assessment_id: assessment.assessment_id, title: `Section ${s} of ${assessment.title}`, ordering: s },
      });
      for (let q = 1; q <= 3; q++) {
        await prisma.question.create({
          data: {
            section_id: section.section_id,
            type: questionTypes[q % questionTypes.length],
            difficulty: difficulties[q % difficulties.length],
            content: { text: `Question ${q} in section ${section.title}`, options: ["Option A", "Option B", "Option C", "Option D"] },
            answer: { correct: "Option B" },
            points: q,
            grading: { strategy: "auto" },
            metadata: { tags: ["sample", section.title.toLowerCase()] },
          },
        });
      }
    }
  }
  console.log("Created sections & questions.");

  // -------------------------------
  // 4. Submissions & Grades
  // -------------------------------
  for (let i = 0; i < 10; i++) {
    const user = users[i];
    const assessment = assessments[i % assessments.length];
    const submission = await prisma.submission.create({
      data: { assessment_id: assessment.assessment_id, user_id: user.user_id, attempt_number: 1, answers: [ { question: "Q1", answer: "Option B", time_spent_seconds: 30 }, { question: "Q2", answer: "Option C", time_spent_seconds: 45 }, { question: "Q3", answer: "Option B", time_spent_seconds: 60 } ], status: "submitted", metadata: { device: "web" } },
    });

    await prisma.grade.create({
      data: { submission_id: submission.submission_id, assessment_id: assessment.assessment_id, user_id: user.user_id, grader_type: "ai", rubric_version: "v1", final_score: Math.floor(Math.random() * 100), max_score: 100, results: { Q1: 1, Q2: 0, Q3: 1 } },
    });
  }
  console.log("Created submissions & grades.");

  // -------------------------------
  // 5. Analytics
  // -------------------------------
  for (const user of users.slice(0, 5)) {
    await prisma.userAnalytics.upsert({
      where: { user_id: user.user_id },
      update: {},
      create: { user_id: user.user_id, registered_at: new Date(), last_login_at: new Date(), roles: user.roles, assessments_attempted: 2, assessments_passed: 1, avg_score: 75, avg_time_spent_seconds: 600 },
    });
  }

  for (const assessment of assessments) {
    await prisma.assessmentAnalytics.upsert({
      where: { assessment_id: assessment.assessment_id },
      update: {},
      create: { assessment_id: assessment.assessment_id, title: assessment.title, total_submissions: 5, avg_score: 70, pass_rate_percent: 80, avg_completion_time_seconds: 1200, difficulty_index: Math.random() },
    });
  }

  console.log("Created analytics data.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });