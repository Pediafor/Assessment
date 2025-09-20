-- ==================================================
-- USERS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_users_roles ON "User" USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_profile ON "User" USING GIN (profile);

-- ==================================================
-- ASSESSMENTS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_assessments_metadata ON "Assessment" USING GIN (metadata);

-- ==================================================
-- SECTIONS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_sections_assessment_id ON "AssessmentSection"(assessment_id);

-- ==================================================
-- QUESTIONS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_questions_tags ON "Question" USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_questions_content ON "Question" USING GIN (content);
-- embedding index removed because vector extension is not installed

-- ==================================================
-- SUBMISSIONS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON "Submission"(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON "Submission"(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata ON "Submission" USING GIN (metadata);

-- ==================================================
-- GRADES
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_grades_assessment ON "Grade"(assessment_id);
CREATE INDEX IF NOT EXISTS idx_grades_user ON "Grade"(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_metadata ON "Grade" USING GIN (metadata);

-- ==================================================
-- ANALYTICS EVENTS
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON "AnalyticsEvent"(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON "AnalyticsEvent"(created_at);

-- ==================================================
-- MANUAL TYPE SETTINGS
-- ==================================================
-- Reserved for manual configurations that require specific data type settings.
-- Example:
-- ALTER TABLE example_table ALTER COLUMN example_column TYPE jsonb USING example_column::jsonb;
