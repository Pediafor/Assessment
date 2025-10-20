import { test, expect } from '@playwright/test';

// These tests assume the app runs in mock auth mode by default.
// We log in as student via the login page using a student@ email.

test.describe('Student Profile', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Seed mock auth
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'dummy-token');
      localStorage.setItem('auth_role', 'student');
    });
    // Stub profile update and change password endpoints to succeed
    await page.route('**/api/users/profile', async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      }
      return route.continue();
    });
    await page.route('**/api/users/password', async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      }
      return route.continue();
    });
    await page.goto(baseURL! + '/student');
  });

  test('can view and update profile basics', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/student/profile');

    // Name and Email inputs should be visible
    const name = page.getByPlaceholder('Your name');
    const email = page.getByPlaceholder('you@example.com');
    await expect(name).toBeVisible();
    await expect(email).toBeVisible();

    // Update values
    await name.fill('Student One');
    await email.fill('student@example.com');

    await page.getByRole('button', { name: /save changes/i }).click();

    // Expect a success status banner
    await expect(page.getByRole('status')).toContainText(/profile updated/i);
  });

  test('change password validation and success banner', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/student/profile');

    // Mismatch error
  await page.getByPlaceholder('New password', { exact: true }).fill('newpass');
    await page.getByPlaceholder('Confirm new password').fill('other');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByRole('status')).toContainText(/passwords do not match/i);

    // Successful change
    await page.getByPlaceholder('Current password').fill('current');
  await page.getByPlaceholder('New password', { exact: true }).fill('newpass');
    await page.getByPlaceholder('Confirm new password').fill('newpass');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByRole('status')).toContainText(/password updated/i);
  });
});
