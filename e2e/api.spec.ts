import { test, expect } from '@playwright/test';

test.describe('API health checks', () => {
  test('providers API returns data', async ({ request }) => {
    const res = await request.get('/api/providers');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.providers).toBeDefined();
    expect(Array.isArray(body.providers)).toBe(true);
  });

  test('health endpoint responds', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('admin stats requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/stats', { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test('admin applications requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/applications', { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test('admin payments requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/payments', { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test('admin documents requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/documents', { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test('admin audit requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/audit', { maxRedirects: 0 });
    expect(res.status()).not.toBe(200);
  });

  test('consent API accepts POST', async ({ request }) => {
    const res = await request.post('/api/consent', {
      data: { essential: true, analytics: false, marketing: false },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('intake API accepts POST', async ({ request }) => {
    const res = await request.post('/api/intake', {
      data: {
        responses: { concerns: ['anxiety'], style: ['cbt'] },
        matches: [],
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('sessions API requires auth', async ({ request }) => {
    const res = await request.get('/api/sessions');
    expect(res.status()).toBe(401);
  });

  test('profile API requires auth', async ({ request }) => {
    const res = await request.get('/api/users/profile');
    expect(res.status()).toBe(401);
  });
});
