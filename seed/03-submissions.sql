-- Submission service seed (submissionservice_db)
-- Create submissions and some graded/attempted records

-- Submissions for students on asm_001 and asm_002
INSERT INTO submissions (id, assessmentid, userid, answers, status, score, maxscore, startedat, submittedat, createdat)
VALUES
  ('sub_001', 'asm_001', 'std_01', '{"q_001":"4","q_002":"3"}'::jsonb, 'SUBMITTED', 2, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('sub_002', 'asm_001', 'std_02', '{"q_001":"3","q_002":"3"}'::jsonb, 'GRADED', 1, 2, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days', NOW() - INTERVAL '2 days'),
  ('sub_003', 'asm_002', 'std_01', '{"q_004":"Newton"}'::jsonb, 'DRAFT', NULL, 1, NOW() - INTERVAL '1 hours', NULL, NOW() - INTERVAL '1 hours');

-- Attempt logs
INSERT INTO attempt_logs (id, submissionid, action, data, createdat)
VALUES
  ('al_001', 'sub_001', 'CREATED', NULL, NOW() - INTERVAL '3 days'),
  ('al_002', 'sub_001', 'SUBMITTED', NULL, NOW() - INTERVAL '2 days'),
  ('al_003', 'sub_002', 'CREATED', NULL, NOW() - INTERVAL '2 days'),
  ('al_004', 'sub_002', 'SUBMITTED', NULL, NOW() - INTERVAL '1 days');
