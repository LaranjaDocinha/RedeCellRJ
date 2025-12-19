import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';

interface User2FA {
  id: string;
  email: string;
  two_factor_secret: string;
  two_factor_enabled: boolean;
}

export const twoFactorAuthService = {
  async generateSecret(userId: string, email: string): Promise<{ secret: string; otpauthUrl: string; qrCodeDataURL: string }> {
    const secret = speakeasy.generateSecret({
      name: `RedecellRJ (${email})`,
    });

    await pool.query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret.base32, userId]);

    const otpauthUrl = speakeasy.otpauthURL({ secret: secret.base32, label: `RedecellRJ (${email})` });
    const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);

    return { secret: secret.base32, otpauthUrl, qrCodeDataURL };
  },

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const userResult = await pool.query('SELECT two_factor_secret FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user || !user.two_factor_secret) {
      throw new AppError('2FA not configured for this user.', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 token before or after current time
    });

    return verified;
  },

  async enable2FA(userId: string): Promise<void> {
    const userResult = await pool.query('SELECT two_factor_secret FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user || !user.two_factor_secret) {
      throw new AppError('2FA secret not generated for this user.', 400);
    }

    await pool.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = $1', [userId]);
  },

  async disable2FA(userId: string): Promise<void> {
    await pool.query('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1', [userId]);
  },

  async is2FAEnabled(userId: string): Promise<boolean> {
    const userResult = await pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    return user ? user.two_factor_enabled : false;
  }
};
