-- Notifications - Depending on your notification storage, you may need to adjust.
-- If notifications are ephemeral via RabbitMQ only, this serves as an example for a relational store.

-- Assuming a table notifications(user_id, id, title, body, read, created_at)
INSERT INTO notifications (id, user_id, title, body, read, created_at)
VALUES
  ('ntf_001', 'std_01', 'Assessment Assigned', 'You have been assigned Algebra Basics.', false, NOW()),
  ('ntf_002', 'std_02', 'Grade Published', 'Your Algebra Basics grade is available.', true, NOW() - INTERVAL '1 days'),
  ('ntf_003', 'tch_01', 'Submission Received', 'A new submission needs grading.', false, NOW());
