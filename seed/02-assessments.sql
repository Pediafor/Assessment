-- Assessment service seed (assessment_service_db)
-- Inserts assessments (some with sections), question sets, questions, and options.

INSERT INTO "assessments" (id, title, description, instructions, "createdBy", status, settings, "deadline", "createdAt")
VALUES
  ('asm_001', 'Algebra Basics', 'Intro algebra quiz', 'Answer all questions', 'tch_01', 'PUBLISHED', '{"duration":30}'::jsonb, NOW() + INTERVAL '7 days', NOW()),
  ('asm_002', 'Physics Fundamentals', 'Kinematics and forces', NULL, 'tch_01', 'PUBLISHED', '{"duration":45}'::jsonb, NOW() + INTERVAL '14 days', NOW()),
  ('asm_003', 'World History Essay', 'Write an essay', 'Pick one topic', 'tch_02', 'DRAFT', '{"duration":60}'::jsonb, NOW() + INTERVAL '21 days', NOW());

INSERT INTO "question_sets" (id, "assessmentId", "setNumber", name, description, "timeLimit", "displayOrder", "createdAt")
VALUES
  ('set_001', 'asm_001', 1, 'Multiple Choice', 'MCQ section', 20, 1, NOW()),
  ('set_002', 'asm_001', 2, 'True/False', 'T/F section', 10, 2, NOW()),
  ('set_003', 'asm_002', 1, 'Core Concepts', 'Physics MCQ', 30, 1, NOW());

INSERT INTO "questions" (id, "questionSetId", type, content, points, difficulty, tags, "displayOrder", "createdAt")
VALUES
  ('q_001', 'set_001', 'MULTIPLE_CHOICE', '2 + 2 = ?', 1.0, 'EASY', ARRAY['math','algebra'], 1, NOW()),
  ('q_002', 'set_001', 'MULTIPLE_CHOICE', 'Solve x in 3x = 9', 1.0, 'EASY', ARRAY['math','algebra'], 2, NOW());

INSERT INTO "question_options" (id, "questionId", "optionText", "isCorrect", "displayOrder", "createdAt")
VALUES
  ('opt_001', 'q_001', '3', false, 1, NOW()),
  ('opt_002', 'q_001', '4', true, 2, NOW()),
  ('opt_003', 'q_001', '5', false, 3, NOW()),
  ('opt_004', 'q_002', '1', false, 1, NOW()),
  ('opt_005', 'q_002', '2', false, 2, NOW()),
  ('opt_006', 'q_002', '3', true, 3, NOW());

INSERT INTO "questions" (id, "questionSetId", type, content, points, difficulty, tags, "displayOrder", "createdAt")
VALUES ('q_003', 'set_002', 'TRUE_FALSE', '0 is an even number.', 1.0, 'EASY', ARRAY['math'], 1, NOW());

INSERT INTO "questions" (id, "questionSetId", type, content, points, difficulty, tags, "displayOrder", "createdAt")
VALUES ('q_004', 'set_003', 'MULTIPLE_CHOICE', 'Unit of force is?', 1.0, 'EASY', ARRAY['physics'], 1, NOW());

INSERT INTO "question_options" (id, "questionId", "optionText", "isCorrect", "displayOrder", "createdAt")
VALUES
  ('opt_007', 'q_004', 'Newton', true, 1, NOW()),
  ('opt_008', 'q_004', 'Joule', false, 2, NOW()),
  ('opt_009', 'q_004', 'Pascal', false, 3, NOW());
