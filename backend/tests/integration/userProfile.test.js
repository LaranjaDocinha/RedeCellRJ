
const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db');
const bcrypt = require('bcryptjs');

let adminToken;
let userToken;
let adminUser;
let regularUser;

describe('User Profile API', () => {
  beforeAll(async () => {
    // Clean up and seed database for consistent testing
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM login_history');
    await db.query('DELETE FROM user_sessions');

    // Create an admin user
    const adminPassword = 'admin123';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      ['Admin User', 'admin@test.com', adminHashedPassword, 'admin', true]
    );
    adminUser = adminResult.rows[0];

    // Create a regular user
    const userPassword = 'user123';
    const userHashedPassword = await bcrypt.hash(userPassword, 10);
    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      ['Regular User', 'user@test.com', userHashedPassword, 'seller', true]
    );
    regularUser = userResult.rows[0];

    // Login admin to get token
    const adminLoginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: adminPassword });
    adminToken = adminLoginRes.body.token;

    // Login regular user to get token
    const userLoginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'user@test.com', password: userPassword });
    userToken = userLoginRes.body.token;
  });

  afterAll(async () => {
    // Clean up after tests
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM login_history');
    await db.query('DELETE FROM user_sessions');
    await db.end(); // Close the database connection
  });

  // Test for PUT /api/users/profile
  describe('PUT /api/users/profile', () => {
    it('should update the logged-in user's profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated User',
          phone_number: '11987654321',
          bio: 'A new bio for the user',
          job_title: 'Senior Seller',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated User');
      expect(res.body.phone_number).toEqual('11987654321');
      expect(res.body.bio).toEqual('A new bio for the user');
      expect(res.body.job_title).toEqual('Senior Seller');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          name: 'Unauthorized User',
        });
      expect(res.statusCode).toEqual(401);
    });
  });

  // Test for POST /api/users/change-password
  describe('POST /api/users/change-password', () => {
    it('should allow a user to change their password', async () => {
      const res = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: 'user123',
          newPassword: 'newSecurePassword123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Senha atualizada com sucesso.');

      // Try logging in with the new password
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'user@test.com', password: 'newSecurePassword123' });
      expect(loginRes.statusCode).toEqual(200);
    });

    it('should return 401 for incorrect old password', async () => {
      const res = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: 'wrongPassword',
          newPassword: 'anotherNewPassword',
        });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 for invalid new password', async () => {
      const res = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: 'newSecurePassword123',
          newPassword: 'short',
        });
      expect(res.statusCode).toEqual(400);
    });
  });

  // Test for GET /api/users/sessions
  describe('GET /api/users/sessions', () => {
    it('should return active sessions for the logged-in user', async () => {
      const res = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0); // Should have at least the current session
      expect(res.body[0]).toHaveProperty('ip_address');
      expect(res.body[0]).toHaveProperty('user_agent');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/users/sessions');
      expect(res.statusCode).toEqual(401);
    });
  });

  // Test for DELETE /api/users/sessions/:id
  describe('DELETE /api/users/sessions/:id', () => {
    let sessionIdToRevoke;

    beforeEach(async () => {
      // Create a new session to revoke
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'user@test.com', password: 'newSecurePassword123' }); // Use the updated password
      const sessionsRes = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${loginRes.body.token}`);
      sessionIdToRevoke = sessionsRes.body[0].id; // Get the ID of one of the sessions
    });

    it('should revoke a specific session for the logged-in user', async () => {
      const res = await request(app)
        .delete(`/api/users/sessions/${sessionIdToRevoke}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Sessão revogada com sucesso.');

      // Verify the session is no longer active
      const sessionsRes = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${userToken}`);
      const revokedSession = sessionsRes.body.find(s => s.id === sessionIdToRevoke);
      expect(revokedSession).toBeUndefined();
    });

    it('should return 404 if session not found or does not belong to user', async () => {
      const nonExistentId = 99999;
      const res = await request(app)
        .delete(`/api/users/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .delete(`/api/users/sessions/${sessionIdToRevoke}`);
      expect(res.statusCode).toEqual(401);
    });
  });
});
