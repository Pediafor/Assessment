const bcrypt = require('bcryptjs');

async function test() {
  const result = await bcrypt.compare('password', '$2b$10$7sBZbJH3i6vX6a5mW1w8wOCmXh8zQXrY3oUQh1XkF3W5m3X1b8J5K');
  console.log('Password match:', result);
}

test();