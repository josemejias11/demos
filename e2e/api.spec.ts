import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.msd.com';

test.describe('msd.com API Tests', () => {
  test('GET / returns 200 with HTML content-type', async ({ request }) => {
    const response = await request.get(BASE_URL);
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('HEAD / returns 200 without body', async ({ request }) => {
    const response = await request.head(BASE_URL);
    expect(response.status()).toBe(200);
  });

  test('HTTP redirects to HTTPS', async ({ request }) => {
    const response = await request.get('http://www.msd.com', {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    const status = response.status();
    expect([301, 302, 307, 308]).toContain(status);
    const location = response.headers()['location'];
    expect(location).toMatch(/^https:\/\//);
  });

  test('Non-existent page returns 404', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/this-page-does-not-exist-12345`, {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(404);
  });

  test('Response includes security headers', async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // Check for at least some security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'content-security-policy',
    ];

    const presentHeaders = securityHeaders.filter(h => headers[h]);
    expect(
      presentHeaders.length,
      `Expected at least one security header. Found: ${presentHeaders.join(', ') || 'none'}`
    ).toBeGreaterThanOrEqual(1);
  });

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toMatch(/user-agent/i);
  });

  test('sitemap.xml is accessible and valid XML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`, {
      failOnStatusCode: false,
    });
    // Some sites serve sitemap at different paths or via robots.txt reference
    if (response.status() === 200) {
      const body = await response.text();
      expect(body).toContain('<?xml');
      expect(body).toMatch(/<urlset|<sitemapindex/);
    } else {
      // Check if robots.txt references a sitemap
      const robotsResponse = await request.get(`${BASE_URL}/robots.txt`);
      const robotsBody = await robotsResponse.text();
      expect(robotsBody.toLowerCase()).toContain('sitemap');
    }
  });

  test('Homepage responds within acceptable time', async ({ request }) => {
    const start = Date.now();
    await request.get(BASE_URL);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('Response includes cache-related headers', async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();
    const cacheHeaders = ['cache-control', 'etag', 'last-modified', 'age'];
    const present = cacheHeaders.filter(h => headers[h]);
    expect(
      present.length,
      `Expected at least one cache header. Found: ${present.join(', ') || 'none'}`
    ).toBeGreaterThanOrEqual(1);
  });
});
