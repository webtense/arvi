/**
 * ARVI API Tests
 * Run with: node tests/api.test.js
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

describe('Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(BASE_URL).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.version).toBeDefined();
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/login with invalid credentials should return 401', async () => {
    const response = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ username: 'invalid', password: 'invalid' });
    expect(response.status).toBe(401);
  });

  test('POST /api/auth/login without body should return 400', async () => {
    const response = await request(BASE_URL)
      .post('/api/auth/login')
      .send({});
    expect(response.status).toBe(400);
  });
});

console.log('✅ API Tests loaded. Add more tests as needed.');