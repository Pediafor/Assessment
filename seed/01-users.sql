-- Users (teachers and students)
-- Target DB: userservice_db
-- Table and columns align with Prisma schema: "User" with quoted camelCase columns

-- Note: passwordHash here is a bcrypt hash for the string "password"
-- $2b$10$7sBZbJH3i6vX6a5mW1w8wOCmXh8zQXrY3oUQh1XkF3W5m3X1b8J5K is a placeholder, replace if needed

-- Teachers
INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES
  ('tch_01', 'teacher1@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Alice', 'Teacher', 'TEACHER', NOW(), NOW()),
  ('tch_02', 'teacher2@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Bob', 'Tutor', 'TEACHER', NOW(), NOW());

-- Students
INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES
  ('std_01', 'student1@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Jane', 'Doe', 'STUDENT', NOW(), NOW()),
  ('std_02', 'student2@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'John', 'Smith', 'STUDENT', NOW(), NOW()),
  ('std_03', 'student3@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Alex', 'Lee', 'STUDENT', NOW(), NOW()),
  ('std_04', 'student4@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Priya', 'Kumar', 'STUDENT', NOW(), NOW()),
  ('std_05', 'student5@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Luis', 'Martinez', 'STUDENT', NOW(), NOW()),
  ('std_06', 'student6@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Chen', 'Wei', 'STUDENT', NOW(), NOW()),
  ('std_07', 'student7@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Fatima', 'Zahra', 'STUDENT', NOW(), NOW()),
  ('std_08', 'student8@pediafor.com', '$2b$10$A73w/KGTfs7eLzIRKJF15eYIkE8BUMyccgi45awRw3x3B6aJMkGy2', 'Yuki', 'Tanaka', 'STUDENT', NOW(), NOW());
