import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { twoFactorAuthService } from '../../../src/services/twoFactorAuthService.js';
import pool from '../../../src/db/index.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Mock DB
vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

// Mock libraries
vi.mock('speakeasy');
vi.mock('qrcode');

describe('TwoFactorAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate a secret and update user', async () => {
      const mockSecret = { base32: 'SECRET32' };
      (speakeasy.generateSecret as any).mockReturnValue(mockSecret);
      (speakeasy.otpauthURL as any).mockReturnValue('otpauth://url');
      (qrcode.toDataURL as any).mockResolvedValue('data:image/png;base64,data');
      (pool.query as any).mockResolvedValue({});

      const result = await twoFactorAuthService.generateSecret('1', 'test@example.com');

      expect(result).toEqual({
        secret: 'SECRET32',
        otpauthUrl: 'otpauth://url',
        qrCodeDataURL: 'data:image/png;base64,data',
      });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
        ['SECRET32', '1']
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      (pool.query as any).mockResolvedValue({
        rows: [{ two_factor_secret: 'SECRET' }],
      });
      (speakeasy.totp.verify as any).mockReturnValue(true);

      const result = await twoFactorAuthService.verifyToken('1', '123456');

      expect(result).toBe(true);
      expect(speakeasy.totp.verify).toHaveBeenCalledWith(expect.objectContaining({
        secret: 'SECRET',
        token: '123456',
      }));
    });

    it('should throw if 2FA is not configured', async () => {
      (pool.query as any).mockResolvedValue({
        rows: [{}], // No secret
      });

      await expect(twoFactorAuthService.verifyToken('1', '123456'))
        .rejects.toThrow('2FA not configured for this user.');
    });
    
    it('should throw if user not found', async () => {
        (pool.query as any).mockResolvedValue({
          rows: [],
        });
  
        await expect(twoFactorAuthService.verifyToken('1', '123456'))
          .rejects.toThrow('2FA not configured for this user.');
      });
  });

  describe('enable2FA', () => {
    it('should enable 2FA if secret exists', async () => {
      (pool.query as any).mockResolvedValueOnce({
        rows: [{ two_factor_secret: 'SECRET' }],
      }).mockResolvedValueOnce({});

      await twoFactorAuthService.enable2FA('1');

      expect(pool.query).toHaveBeenNthCalledWith(2, 
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
        ['1']
      );
    });

    it('should throw if secret is missing', async () => {
      (pool.query as any).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(twoFactorAuthService.enable2FA('1'))
        .rejects.toThrow('2FA secret not generated for this user.');
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA', async () => {
      (pool.query as any).mockResolvedValue({});
      await twoFactorAuthService.disable2FA('1');
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1',
        ['1']
      );
    });
  });

  describe('is2FAEnabled', () => {
    it('should return true if enabled', async () => {
        (pool.query as any).mockResolvedValue({
            rows: [{ two_factor_enabled: true }],
        });
        const result = await twoFactorAuthService.is2FAEnabled('1');
        expect(result).toBe(true);
    });

    it('should return false if disabled or user not found', async () => {
        (pool.query as any).mockResolvedValue({
            rows: [],
        });
        const result = await twoFactorAuthService.is2FAEnabled('1');
        expect(result).toBe(false);
    });
  });
});
