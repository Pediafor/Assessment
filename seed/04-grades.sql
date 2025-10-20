-- Grading data generally lives in grading-service or submission-service depending on model.
-- Here we add a grade linked to submission sub_002 (already GRADED)

INSERT INTO grades (id, submissionid, questionid, score, maxscore, feedback, gradedby, gradingtype, createdat)
VALUES
  ('gr_001', 'sub_002', NULL, 1, 2, 'Review algebra basics', 'tch_01', 'AUTO', NOW());
