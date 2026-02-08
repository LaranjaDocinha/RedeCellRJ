import request from 'supertest';
import { app } from '../../src/app.js';

/**
 * Logs in a user and returns the authentication token.
 */
export async function loginUser(email: string, password: string): Promise<string> {
  const response = await request(app).post('/api/auth/login').send({ email, password });

  if (response.status !== 200) {
    // Throw a detailed error to make debugging easier
    throw new Error(
      `Failed to login as ${email}. Status: ${response.status}, Body: ${JSON.stringify(response.body)}`,
    );
  }

  // The authController now returns { status: 'success', data: { user, accessToken } }
  console.log(`[AUTH TEST DEBUG] Token for ${email}:`, response.body.data.accessToken);
  return response.body.data.accessToken;
}

/**
 * A specific helper to get the token for the globally seeded admin user.
 */
export async function getAdminAuthToken(): Promise<string> {
  return loginUser('admin@pdv.com', 'admin123');
}
