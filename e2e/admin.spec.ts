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
  });

  test('admin dashboard shows action queues', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Operations Dashboard', { timeout: 10000 });
    await expect(page.locator('text=Application Queue')).toBeVisible();
    await expect(page.locator('text=Document Queue')).toBeVisible();
  });

  test('admin applications queue loads', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page.locator('h1:has-text("Application Queue")')).toBeVisible({ timeout: 10000 });
  });

  test('admin application detail loads', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForSelector('h1:has-text("Application Queue")', { timeout: 10000 });
    const reviewBtn = page.locator('a:has-text("Review")').first();
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();
      await expect(page.locator('text=Back to Queue')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Agreements')).toBeVisible();
    }
  });

  test('admin users page loads', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h1:has-text("Users")')).toBeVisible({ timeout: 10000 });
  });

  test('admin sessions page loads', async ({ page }) => {
    await page.goto('/admin/sessions');
    await expect(page.locator('h1:has-text("Sessions")')).toBeVisible({ timeout: 10000 });
  });

  test('admin payments page loads', async ({ page }) => {
    await page.goto('/admin/payments');
    await expect(page.locator('h1:has-text("Payments")')).toBeVisible({ timeout: 10000 });
  });

  test('admin documents page loads', async ({ page }) => {
    await page.goto('/admin/documents');
    await expect(page.locator('h1:has-text("Documents")')).toBeVisible({ timeout: 10000 });
  });

  test('admin audit log loads', async ({ page }) => {
    await page.goto('/admin/audit');
    await expect(page.locator('h1:has-text("Audit Log")')).toBeVisible({ timeout: 10000 });
  });

  test('admin sidebar navigation works', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForSelector('text=Operations Dashboard', { timeout: 10000 });
    await page.click('a:has-text("Applications")');
    await expect(page.locator('h1:has-text("Application Queue")')).toBeVisible({ timeout: 10000 });
    await page.click('a:has-text("Payments")');
    await expect(page.locator('h1:has-text("Payments")')).toBeVisible({ timeout: 10000 });
  });
});
