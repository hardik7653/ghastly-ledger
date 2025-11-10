/**
 * Basic unit tests for Cases API
 * Example test suite using Jest and Supertest
 */

const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_to_a_secure_random_string';

describe('Cases API', () => {
  let authToken;

  beforeAll(() => {
    // Generate test JWT token
    authToken = jwt.sign(
      { authenticated: true, test: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/cases', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cases')
        .send({
          title: 'Test Case',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '' // Empty title
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('Validation');
    });

    it('should create case with valid data', async () => {
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Case')
        .field('description', 'This is a test case description')
        .field('mistakes', 'Test mistakes');

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Case');
    });
  });

  describe('GET /api/cases', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/cases');

      expect(response.status).toBe(401);
    });

    it('should return cases list when authenticated', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
