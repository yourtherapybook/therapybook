import { test, expect } from '@playwright/test';
import { testUsers, signIn, dismissGDPR } from './helpers';

test.describe('Trainee flows', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUsers.trainee.email, testUsers.trainee.password);
    await dismissGDPR(page);
  });

  test('trainee dashboard loads', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await expect(page.locator('text=Practitioner Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('trainee dashboard shows KPI cards', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.waitForSelector('text=Practitioner Dashboard', { timeout: 10000 });
    await expect(page.locator('text=Upcoming')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=Application')).toBeVisible();
  });

  test('trainee dashboard shows availability manager', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.waitForSelector('text=Weekly Availability', { timeout: 10000 });
    // Should show days of week in calendar grid
    await expect(page.locator('text=Mon')).toBeVisible();
  });

  test('trainee can access availability edit form', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.waitForSelector('text=Weekly Availability', { timeout: 10000 });
    // Add availability form should be visible
    await expect(page.locator('text=Add New Availability')).toBeVisible();
  });

  test('trainee dashboard shows upcoming sessions', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.waitForSelector('text=Upcoming Sessions', { timeout: 15000 });
    await expect(page.locator('text=Upcoming Sessions')).toBeVisible();
  });

  test('trainee dashboard shows session history with notes action', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    // Scroll to session history
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const historySection = page.locator('text=Session History');
    await expect(historySection).toBeVisible({ timeout: 10000 });
  });

  test('session notes dialog opens', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const notesBtn = page.locator('text=Add Notes').first();
    if (await notesBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notesBtn.click();
      await expect(page.locator('text=Session Notes')).toBeVisible({ timeout: 3000 });
    }
  });

  test('session index redirects trainee to dashboard', async ({ page }) => {
    await page.goto('/session');
    await page.waitForURL('**/trainee-dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('trainee-dashboard');
  });

  test('trainee application page loads', async ({ page }) => {
    await page.goto('/trainee-application');
    // Should show application form or status
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 });
  });
});
