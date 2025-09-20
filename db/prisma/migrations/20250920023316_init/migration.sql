-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profile" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(64),
    "data_region" VARCHAR(64),
    "gdpr_consent" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "assessment_id" UUID NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "visibility" VARCHAR(50) NOT NULL DEFAULT 'private',
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timing" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentSection" (
    "section_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) DEFAULT 'fixed_set',
    "ordering" INTEGER DEFAULT 0,
    "timing" JSONB NOT NULL DEFAULT '{}',
    "questions" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentSection_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "question_id" UUID NOT NULL,
    "schema_version" VARCHAR(32) DEFAULT 'v1',
    "version" INTEGER DEFAULT 1,
    "bank_id" UUID,
    "section_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "difficulty" VARCHAR(32),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB NOT NULL,
    "answer" JSONB NOT NULL DEFAULT '{}',
    "points" INTEGER DEFAULT 1,
    "grading" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "submission_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "attempt_number" INTEGER DEFAULT 1,
    "session_id" UUID,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answers" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(32) DEFAULT 'submitted',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "public"."Grade" (
    "grade_id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "grader_type" VARCHAR(32) DEFAULT 'ai',
    "rubric_version" VARCHAR(128),
    "final_score" DECIMAL(8,2) NOT NULL,
    "max_score" DECIMAL(8,2) NOT NULL,
    "graded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "results" JSONB NOT NULL,
    "grading_details" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
    "event_id" UUID NOT NULL,
    "tenant_id" UUID,
    "event_type" VARCHAR(128) NOT NULL,
    "user_id" UUID,
    "assessment_id" UUID,
    "submission_id" UUID,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."UserAnalytics" (
    "user_id" UUID NOT NULL,
    "registered_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "institution_id" UUID,
    "assessments_attempted" INTEGER DEFAULT 0,
    "assessments_passed" INTEGER DEFAULT 0,
    "avg_score" DECIMAL(6,2) DEFAULT 0,
    "avg_time_spent_seconds" INTEGER DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentAnalytics" (
    "assessment_id" UUID NOT NULL,
    "title" VARCHAR(512),
    "created_by" UUID,
    "scheduled_at" TIMESTAMPTZ,
    "total_submissions" INTEGER DEFAULT 0,
    "avg_score" DECIMAL(6,2) DEFAULT 0,
    "pass_rate_percent" DECIMAL(5,2) DEFAULT 0,
    "avg_completion_time_seconds" INTEGER DEFAULT 0,
    "difficulty_index" DECIMAL(5,4) DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAnalytics_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "public"."QuestionAnalytics" (
    "question_id" UUID NOT NULL,
    "assessment_id" UUID,
    "type" VARCHAR(50),
    "total_attempts" INTEGER DEFAULT 0,
    "correct_attempts" INTEGER DEFAULT 0,
    "avg_time_spent_seconds" DECIMAL(8,2) DEFAULT 0,
    "difficulty_index" DECIMAL(5,4) DEFAULT 0,
    "discrimination_index" DECIMAL(5,4) DEFAULT 0,
    "hint_usage_rate" DECIMAL(5,4) DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionAnalytics_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."SubmissionAnalytics" (
    "submission_id" UUID NOT NULL,
    "assessment_id" UUID,
    "user_id" UUID,
    "submitted_at" TIMESTAMPTZ,
    "score" DECIMAL(8,2),
    "max_score" DECIMAL(8,2),
    "completion_status" VARCHAR(32),
    "total_time_spent_seconds" INTEGER,
    "total_answered" INTEGER,
    "correct_count" INTEGER,
    "incorrect_count" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAnalytics_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "public"."GradeDistribution" (
    "id" BIGSERIAL NOT NULL,
    "assessment_id" UUID,
    "grade_bucket" TEXT,
    "student_count" INTEGER,
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_roles_idx" ON "public"."User" USING GIN ("roles");

-- CreateIndex
CREATE INDEX "User_profile_idx" ON "public"."User" USING GIN ("profile");

-- CreateIndex
CREATE INDEX "Assessment_metadata_idx" ON "public"."Assessment" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "AssessmentSection_assessment_id_idx" ON "public"."AssessmentSection"("assessment_id");

-- CreateIndex
CREATE INDEX "Question_tags_idx" ON "public"."Question" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "Question_content_idx" ON "public"."Question" USING GIN ("content");

-- CreateIndex
CREATE INDEX "Submission_assessment_id_idx" ON "public"."Submission"("assessment_id");

-- CreateIndex
CREATE INDEX "Submission_user_id_idx" ON "public"."Submission"("user_id");

-- CreateIndex
CREATE INDEX "Submission_metadata_idx" ON "public"."Submission" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "Grade_assessment_id_idx" ON "public"."Grade"("assessment_id");

-- CreateIndex
CREATE INDEX "Grade_user_id_idx" ON "public"."Grade"("user_id");

-- CreateIndex
CREATE INDEX "Grade_metadata_idx" ON "public"."Grade" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_event_type_idx" ON "public"."AnalyticsEvent"("event_type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_created_at_idx" ON "public"."AnalyticsEvent"("created_at");

-- AddForeignKey
ALTER TABLE "public"."AssessmentSection" ADD CONSTRAINT "AssessmentSection_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."AssessmentSection"("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."Submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("assessment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."Submission"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnalytics" ADD CONSTRAINT "UserAnalytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentAnalytics" ADD CONSTRAINT "AssessmentAnalytics_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("assessment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubmissionAnalytics" ADD CONSTRAINT "SubmissionAnalytics_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."Submission"("submission_id") ON DELETE RESTRICT ON UPDATE CASCADE;
