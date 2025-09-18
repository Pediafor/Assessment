-- ============================================
-- Pediafor: Postgres initialization DDL (v1)
-- Includes: users, assessments, sections, questions,
-- submissions, grades, analytics and aggregated tables
-- ============================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector if available (install pgvector in your DB first)
-- If pgvector is not installed in your Postgres image, remove/skip the next line.
CREATE EXTENSION IF NOT EXISTS vector;

-- ==================================================
-- USERS
-- ==================================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,                        -- hashed password (nullable for SSO accounts)
  roles TEXT[] NOT NULL DEFAULT ARRAY['student']::text[],
  profile JSONB DEFAULT '{}'::jsonb,         -- first_name, last_name, avatar_url, bio, institution_id, etc.
  settings JSONB DEFAULT '{}'::jsonb,        -- theme, notifications_enabled, language, etc.
  mfa_enabled BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(64),
  data_region VARCHAR(64),                   -- tenant/data residency
  gdpr_consent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_profile ON users USING GIN (profile);

-- ==================================================
-- ASSESSMENTS (top-level)
-- ==================================================
CREATE TABLE IF NOT EXISTS assessments (
  assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(512) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',   -- draft | published | archived
  visibility VARCHAR(50) NOT NULL DEFAULT 'private', -- private | institution | public
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,             -- created_by, total_questions, total_points, pass_score, duration_minutes, scheduled_at, allow_retakes, max_attempts, grading_policy
  timing JSONB DEFAULT '{}'::jsonb,               -- optional master timing {duration_minutes, is_timed}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_metadata ON assessments USING GIN (metadata);

-- ==================================================
-- ASSESSMENT SECTIONS
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_sections (
  section_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'fixed_set',    -- fixed_set | adaptive | random_pool
  ordering INTEGER DEFAULT 0,
  timing JSONB DEFAULT '{}'::jsonb,        -- {duration_minutes, is_timed}
  questions JSONB DEFAULT '[]'::jsonb,     -- array of {question_id, points, order}
  metadata JSONB DEFAULT '{}'::jsonb,      -- question_count, max_points, randomize_questions, shuffle_options
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_assessment_id ON assessment_sections(assessment_id);

-- ==================================================
-- QUESTIONS (canonical question bank)
-- ==================================================
CREATE TABLE IF NOT EXISTS questions (
  question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schema_version VARCHAR(32) DEFAULT 'v1',
  version INTEGER DEFAULT 1,
  bank_id UUID,                             -- optional grouping across assessments
  section_id UUID REFERENCES assessment_sections(section_id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,                -- multiple_choice | essay | code | matching | hotspot
  difficulty VARCHAR(32),                   -- easy | medium | hard
  tags TEXT[] DEFAULT ARRAY[]::text[],
  content JSONB NOT NULL,                   -- {text, media[], hints[]}
  answer JSONB DEFAULT '{}'::jsonb,         -- {options:[], correct_option_id OR correct_option_ids, explanation, allow_multiple}
  points INTEGER DEFAULT 1,
  grading JSONB DEFAULT '{}'::jsonb,        -- {partial_credit, rubric_id}
  metadata JSONB DEFAULT '{}'::jsonb,      -- {author_id, reviewed, ai_assisted, source_model, timing:{duration_seconds,is_timed}, accessibility}
  embedding vector(1536),                   -- pgvector column (nullable) — adjust dim to your model
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast search/filtering
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_questions_content ON questions USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_questions_embedding ON questions USING ivfflat (embedding) WITH (lists = 100); 
-- Note: ivfflat index requires pgvector and appropriate configuration. If pgvector not present, skip the ivfflat index line.

-- ==================================================
-- SUBMISSIONS
-- ==================================================
CREATE TABLE IF NOT EXISTS submissions (
  submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  session_id UUID,                           -- optional: to correlate reconnections
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB NOT NULL,                    -- array of {question_id, type, submitted_answer, time_spent_seconds, attachments[]}
  metadata JSONB DEFAULT '{}'::jsonb,        -- {ip_address, user_agent, device_type, total_time_spent_seconds, completion_status, auto_saved_at[]}
  status VARCHAR(32) DEFAULT 'submitted',    -- submitted | in_progress | auto_submitted | abandoned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata ON submissions USING GIN (metadata);

-- Consider partitioning submissions by created_at for large scale (future optimization)

-- ==================================================
-- GRADES
-- ==================================================
CREATE TABLE IF NOT EXISTS grades (
  grade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  grader_type VARCHAR(32) DEFAULT 'ai',     -- ai | human | hybrid
  rubric_version VARCHAR(128),
  final_score NUMERIC(8,2) NOT NULL,
  max_score NUMERIC(8,2) NOT NULL,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  results JSONB NOT NULL,                    -- array [{question_id, score, max_score, feedback, analytics:{...}}]
  grading_details JSONB DEFAULT '{}'::jsonb, -- {pass_fail_status, relative_rank, grade_distribution_percentile, appeal_status}
  metadata JSONB DEFAULT '{}'::jsonb,        -- {grading_engine_version, total_grading_time_ms, grader_id}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_assessment ON grades(assessment_id);
CREATE INDEX IF NOT EXISTS idx_grades_user ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_metadata ON grades USING GIN (metadata);

-- ==================================================
-- ANALYTICS EVENT STORE (raw events)
-- ==================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,                           -- optional multi-tenant support
  event_type VARCHAR(128) NOT NULL,         -- e.g., user_registered, assessment_submitted, grade_updated, question_viewed
  user_id UUID REFERENCES users(user_id),
  assessment_id UUID REFERENCES assessments(assessment_id),
  submission_id UUID REFERENCES submissions(submission_id),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- ==================================================
-- ANALYTICS AGGREGATED TABLES (read-optimized)
-- ==================================================

-- USER ANALYTICS (denormalized per user)
CREATE TABLE IF NOT EXISTS user_analytics (
  user_id UUID PRIMARY KEY,
  registered_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  roles TEXT[] DEFAULT ARRAY[]::text[],
  institution_id UUID,
  assessments_attempted INTEGER DEFAULT 0,
  assessments_passed INTEGER DEFAULT 0,
  avg_score NUMERIC(6,2) DEFAULT 0,
  avg_time_spent_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSESSMENT ANALYTICS
CREATE TABLE IF NOT EXISTS assessment_analytics (
  assessment_id UUID PRIMARY KEY,
  title VARCHAR(512),
  created_by UUID,
  scheduled_at TIMESTAMPTZ,
  total_submissions INTEGER DEFAULT 0,
  avg_score NUMERIC(6,2) DEFAULT 0,
  pass_rate_percent NUMERIC(5,2) DEFAULT 0,
  avg_completion_time_seconds INTEGER DEFAULT 0,
  difficulty_index NUMERIC(5,4) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUESTION ANALYTICS (per question)
CREATE TABLE IF NOT EXISTS question_analytics (
  question_id UUID PRIMARY KEY,
  assessment_id UUID,
  type VARCHAR(50),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  avg_time_spent_seconds NUMERIC(8,2) DEFAULT 0,
  difficulty_index NUMERIC(5,4) DEFAULT 0,
  discrimination_index NUMERIC(5,4) DEFAULT 0,
  hint_usage_rate NUMERIC(5,4) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBMISSION ANALYTICS (denormalized row per submission for fast queries)
CREATE TABLE IF NOT EXISTS submission_analytics (
  submission_id UUID PRIMARY KEY,
  assessment_id UUID,
  user_id UUID,
  submitted_at TIMESTAMPTZ,
  score NUMERIC(8,2),
  max_score NUMERIC(8,2),
  completion_status VARCHAR(32),
  total_time_spent_seconds INTEGER,
  total_answered INTEGER,
  correct_count INTEGER,
  incorrect_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRADE DISTRIBUTION (pre-aggregated buckets)
CREATE TABLE IF NOT EXISTS grade_distribution (
  id BIGSERIAL PRIMARY KEY,
  assessment_id UUID,
  grade_bucket TEXT,                       -- e.g. "90-100", "80-89"
  student_count INTEGER,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- TRIGGERS / HELPERS (optional)
-- ==================================================
-- NOTE: It's a good practice to create triggers that maintain updated_at timestamps.
-- Example trigger functions can be added later (use migration scripts).

-- ==================================================
-- FINAL NOTES & SUGGESTIONS
-- ==================================================
-- 1) Use migrations (Flyway, Liquibase, Alembic, Prisma Migrate) to manage schema changes.
-- 2) Consider partitioning submissions and grades by time (e.g., created_at) before scale.
-- 3) If you plan to use embeddings heavily, consider using a dedicated vector DB (Milvus/Weaviate).
--    Pgvector is great for prototyping and small-to-medium scale workloads.
-- 4) Add FK constraints and cascade policies intentionally (we used ON DELETE CASCADE for assessments -> submissions).
-- 5) Create materialized views for heavy analytical queries (refresh periodically or via event-driven pipeline).

