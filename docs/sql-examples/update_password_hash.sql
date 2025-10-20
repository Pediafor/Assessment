-- Example: Replace a password hash with a new value (dev/testing only)
-- Be extremely careful; this is irreversible without a backup.

UPDATE "User"
SET "passwordHash" = '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2'
WHERE "passwordHash" = '$2b$10$7sBZbJH3i6vX6a5mW1w8wOCmXh8zQXrY3oUQh1XkF3W5m3X1b8J5K';
