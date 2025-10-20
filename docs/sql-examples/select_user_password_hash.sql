-- Example: Inspect password hash for a known email (dev/testing only)
SELECT email, "passwordHash"
FROM "User"
WHERE email = 'student1@pediafor.com';
