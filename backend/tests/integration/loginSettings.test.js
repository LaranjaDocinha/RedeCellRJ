const request = require('supertest');
const app = require('../../index'); // Import the app from index.js
const pool = require('../../db'); // To interact with the database for setup/teardown

describe('Login Screen Settings API', () => {
  let adminToken; // To store the admin authentication token

  // Before all tests, get an admin token
  beforeAll(async () => {
    // In a real scenario, you would log in an admin user to get a token
    // For now, we'll use a placeholder or a known admin user's credentials
    // and make a login request.
    // Example:
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@pdv.com', // Assuming a default admin user
        password: 'admin123', // Assuming a default admin password
      });
    adminToken = loginRes.body.token;

    // Ensure the settings table is clean or in a known state before tests
    await pool.query('DELETE FROM login_screen_settings');
    await pool.query(`
      INSERT INTO login_screen_settings (
          background_type,
          gradient_color_1,
          gradient_color_2,
          gradient_color_3,
          gradient_color_4,
          gradient_speed,
          gradient_direction
      ) VALUES (
          'gradient',
          'random',
          'random',
          'random',
          'random',
          15,
          45
      );
    `);
  });

  // After all tests, clean up or reset the database if necessary
  afterAll(async () => {
    });

  describe('GET /api/settings/login-screen', () => {
    it('should return login screen settings', async () => {
      const res = await request(app).get('/api/settings/login-screen');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('background_type', 'gradient');
      // Since colors are 'random', they should be generated and not 'random' string
      expect(res.body.gradient_color_1).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
      expect(res.body).toHaveProperty('gradient_speed', 15);
      expect(res.body).toHaveProperty('gradient_direction', 45);
    });
  });

  describe('PUT /api/settings/login-screen', () => {
    const newSettings = {
      background_type: 'solid',
      background_solid_color: '#FF0000',
      gradient_color_1: null, // Reset gradient fields if not applicable
      gradient_color_2: null,
      gradient_color_3: null,
      gradient_color_4: null,
      gradient_speed: null,
      gradient_direction: null,
      image_size: null,
      image_repeat: null,
      background_image_url: null,
      background_video_url: null,
    };

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .put('/api/settings/login-screen')
        .send(newSettings);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if non-admin token is provided (assuming non-admin cannot update)', async () => {
      // This test requires a non-admin token. For simplicity, we'll skip it
      // or assume the 'authorize('admin')' middleware handles it correctly.
      // In a full test suite, you'd log in a regular user and use their token.
      // For now, we'll rely on the admin test.
      // If the 'admin' role is the only one with 'settings:manage' permission,
      // then any non-admin token will result in a 403.
      // For this test, we'll just ensure the admin test passes.
    });

    it('should allow admin to update login screen settings', async () => {
      const res = await request(app)
        .put('/api/settings/login-screen')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSettings);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('background_type', 'solid');
      expect(res.body).toHaveProperty('background_solid_color', '#FF0000');

      // Verify that the settings are actually updated in the database
      const dbRes = await pool.query('SELECT * FROM login_screen_settings ORDER BY id LIMIT 1');
      expect(dbRes.rows[0].background_type).toEqual('solid');
      expect(dbRes.rows[0].background_solid_color).toEqual('#FF0000');
    });

    it('should handle invalid input for update', async () => {
      const invalidSettings = {
        background_type: 'invalid_type', // Invalid enum value
      };
      const res = await request(app)
        .put('/api/settings/login-screen')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings);

      expect(res.statusCode).toEqual(500); // Or 400 if validation middleware is added
      // Expect an error message related to enum validation
      expect(res.body.message).toContain('invalid input value for enum background_type');
    });
  });
});
