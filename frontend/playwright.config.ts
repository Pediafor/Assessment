import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
