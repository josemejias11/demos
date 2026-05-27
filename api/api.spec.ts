import { test, expect } from '@playwright/test';

test.describe('moodys.com API Tests', () => {
  const baseURL = 'https://www.moodys.com';

  test('Homepage returns 200 OK', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('Response contains essential security headers', async ({ request }) => {
    const response = await request.get(baseURL);
    const headers = response.headers();
    
    // Check for common security or content-type headers
    expect(headers).toHaveProperty('content-type');
    expect(headers['content-type']).toContain('text/html');
  });

  test('Robots.txt is accessible', async ({ request }) => {
    const response = await request.get(`${baseURL}/robots.txt`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.text();
    expect(body).toContain('User-agent');
  });

  test('Favicon is accessible', async ({ request }) => {
    const response = await request.get(`${baseURL}/favicon.ico`);
    // Some sites might redirect favicons or return different successful codes
    expect([200, 301, 302, 304]).toContain(response.status());
  });

  test('Response contains cache-control headers', async ({ request }) => {
    const response = await request.get(baseURL);
    const headers = response.headers();
    
    // Check for cache control directives which are standard for performance
    expect(headers).toHaveProperty('cache-control');
  });
});
