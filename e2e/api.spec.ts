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
    const res = await request.get('/api/admin/stats');
    expect(res.status()).toBe(403);
  });

  test('admin applications requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/applications');
    expect(res.status()).toBe(403);
  });

  test('admin payments requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/payments');
    expect(res.status()).toBe(403);
  });

  test('admin documents requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/documents');
    expect(res.status()).toBe(403);
  });

  test('admin audit requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/audit');
    expect(res.status()).toBe(403);
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
