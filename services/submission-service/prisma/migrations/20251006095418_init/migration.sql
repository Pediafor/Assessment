-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADING', 'GRADED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GradingType" AS ENUM ('AUTO', 'MANUAL', 'HYBRID', 'PEER');

-- CreateEnum
CREATE TYPE "AttemptAction" AS ENUM ('CREATED', 'SAVED', 'UPDATED', 'SUBMITTED', 'FILE_ADDED', 'FILE_REMOVED', 'GRADED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_files" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "questionId" TEXT,
    "description" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "gradedBy" TEXT NOT NULL,
    "gradingType" "GradingType" NOT NULL DEFAULT 'MANUAL',
    "feedback" TEXT,
    "rubricData" JSONB,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_attempts" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "action" "AttemptAction" NOT NULL,
    "data" JSONB,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_assessmentId_idx" ON "submissions"("assessmentId");

-- CreateIndex
CREATE INDEX "submissions_userId_idx" ON "submissions"("userId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "submission_files_submissionId_idx" ON "submission_files"("submissionId");

-- CreateIndex
CREATE INDEX "submission_files_questionId_idx" ON "submission_files"("questionId");

-- CreateIndex
CREATE INDEX "grades_submissionId_idx" ON "grades"("submissionId");

-- CreateIndex
CREATE INDEX "grades_questionId_idx" ON "grades"("questionId");

-- CreateIndex
CREATE INDEX "grades_gradedBy_idx" ON "grades"("gradedBy");

-- CreateIndex
CREATE UNIQUE INDEX "grades_submissionId_questionId_key" ON "grades"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "submission_attempts_submissionId_idx" ON "submission_attempts"("submissionId");

-- CreateIndex
CREATE INDEX "submission_attempts_userId_idx" ON "submission_attempts"("userId");

-- CreateIndex
CREATE INDEX "submission_attempts_action_idx" ON "submission_attempts"("action");

-- CreateIndex
CREATE INDEX "submission_attempts_createdAt_idx" ON "submission_attempts"("createdAt");

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_attempts" ADD CONSTRAINT "submission_attempts_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
