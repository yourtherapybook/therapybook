import { test, expect } from '@playwright/test';
import { testUsers, signIn, dismissGDPR } from './helpers';

test.describe('Trainee flows', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUsers.trainee.email, testUsers.trainee.password);
    await dismissGDPR(page);
  });

  test('trainee dashboard loads', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await expect(page.locator('text=Practitioner Workspace')).toBeVisible({ timeout: 10000 });
  });

  test('trainee dashboard shows availability calendar', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await expect(page.locator('text=Weekly Availability')).toBeVisible({ timeout: 10000 });
  });

  test('trainee dashboard shows session sections', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await expect(page.locator('text=Upcoming Sessions').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Session History').first()).toBeVisible({ timeout: 5000 });
  });

  test('availability add form visible', async ({ page }) => {
    await page.goto('/trainee-dashboard');
    await page.waitForSelector('text=Weekly Availability', { timeout: 10000 });
    // The add form should be present
    await expect(page.locator('text=Add New Availability').first()).toBeVisible({ timeout: 5000 });
  });

  test('session index redirects trainee to dashboard', async ({ page }) => {
    await page.goto('/session');
    await page.waitForURL('**/trainee-dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('trainee-dashboard');
  });
});
