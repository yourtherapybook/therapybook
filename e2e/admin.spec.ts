import { test, expect } from '@playwright/test';
import { testUsers, signIn } from './helpers';

test.describe('Admin flows', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, testUsers.admin.email, testUsers.admin.password);
  });

  test('admin dashboard loads with KPIs', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Operations Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=GMV')).toBeVisible();
    await expect(page.locator('text=Sessions')).toBeVisible();
  });

  test('admin dashboard shows action queues', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Operations Dashboard', { timeout: 10000 });
    await expect(page.locator('text=Application Queue')).toBeVisible();
    await expect(page.locator('text=Document Queue')).toBeVisible();
    await expect(page.locator('text=Audit Trail')).toBeVisible();
  });

  test('admin applications queue loads', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page.locator('text=Application Queue')).toBeVisible({ timeout: 10000 });
    // Filter buttons should exist
    await expect(page.locator('button:has-text("Submitted")')).toBeVisible();
  });

  test('admin application detail loads with checklist', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForSelector('text=Application Queue', { timeout: 10000 });
    // Click first Review button
    const reviewBtn = page.locator('text=Review').first();
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();
      await expect(page.locator('text=Back to Queue')).toBeVisible({ timeout: 10000 });
      // Checklist should be visible
      await expect(page.locator('text=Approval Checklist')).toBeVisible();
      // Agreements section
      await expect(page.locator('text=Agreements')).toBeVisible();
    }
  });

  test('admin application detail shows document actions', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForSelector('text=Application Queue', { timeout: 10000 });
    const reviewBtn = page.locator('text=Review').first();
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();
      await page.waitForSelector('text=Back to Queue', { timeout: 10000 });
      // Credential Documents section should exist
      await expect(page.locator('text=Credential Documents')).toBeVisible();
    }
  });

  test('admin users page loads', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('text=Users')).toBeVisible({ timeout: 10000 });
    // Table should have role selectors
    await expect(page.locator('text=Role')).toBeVisible();
  });

  test('admin sessions page loads with actions', async ({ page }) => {
    await page.goto('/admin/sessions');
    await expect(page.locator('text=Sessions')).toBeVisible({ timeout: 10000 });
    // Should show session table
    await expect(page.locator('text=Client')).toBeVisible();
    await expect(page.locator('text=Therapist')).toBeVisible();
  });

  test('admin payments page loads', async ({ page }) => {
    await page.goto('/admin/payments');
    await expect(page.locator('text=Payments')).toBeVisible({ timeout: 10000 });
    // Filter buttons
    await expect(page.locator('button:has-text("All")')).toBeVisible();
  });

  test('admin documents page loads with verification actions', async ({ page }) => {
    await page.goto('/admin/documents');
    await expect(page.locator('text=Documents')).toBeVisible({ timeout: 10000 });
    // Status filters
    await expect(page.locator('button:has-text("Pending")')).toBeVisible();
  });

  test('admin audit log loads', async ({ page }) => {
    await page.goto('/admin/audit');
    await expect(page.locator('text=Audit Log')).toBeVisible({ timeout: 10000 });
    // Action filters
    await expect(page.locator('button:has-text("All Actions")')).toBeVisible();
  });

  test('admin sidebar navigation works', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Operations Dashboard', { timeout: 10000 });
    // Navigate via sidebar
    await page.click('a:has-text("Applications")');
    await expect(page.locator('text=Application Queue')).toBeVisible({ timeout: 10000 });
    await page.click('a:has-text("Payments")');
    await expect(page.locator('text=Payments')).toBeVisible({ timeout: 10000 });
    await page.click('a:has-text("Audit Log")');
    await expect(page.locator('text=Audit Log')).toBeVisible({ timeout: 10000 });
  });
});
