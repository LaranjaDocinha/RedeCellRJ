import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/services/authService.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { refreshTokenRepository } from '../../src/repositories/refreshToken.repository.js';
import { passwordUtils } from '../../src/utils/passwordUtils.js';
import { emailService } from '../../src/services/emailService.js';

vi.mock('../../src/repositories/user.repository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findWithPasswordByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getUserPermissions: vi.fn(),
    getUserRole: vi.fn(),
    assignRole: vi.fn(),
    findUserValidForReset: vi.fn(),
  },
}));

vi.mock('../../src/repositories/refreshToken.repository.js', () => ({
  refreshTokenRepository: {
    create: vi.fn(),
    findByToken: vi.fn(),
    deleteByToken: vi.fn(),
  },
}));

vi.mock('../../src/utils/passwordUtils.js', () => ({
  passwordUtils: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    verify: vi.fn(),
    needsRehash: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('../../src/services/logActivityService.js', () => ({
  logActivityService: { logActivity: vi.fn() },
}));

vi.mock('../../src/services/emailService.js', () => ({
  emailService: { sendEmail: vi.fn().mockResolvedValue(undefined) },
}));

describe('AuthService', () => {
  const mockUser = {
    id: 'uuid-123',
    name: 'Test',
    email: 'test@test.com',
    password_hash: 'hash',
    failed_login_attempts: 0,
    last_login: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerCenter', () => {
    it('should successfully register a user', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser as any);
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);

      const result = await authService.register('Test', 'test@test.com', 'password123');

      expect(result.user.id).toBe(mockUser.id);
      expect(userRepository.create).toHaveBeenCalled();
      expect(refreshTokenRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: '1' } as any);
      await expect(authService.register('T', 'test@test.com', 'p')).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should throw error if role not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser as any);
      vi.mocked(userRepository.assignRole).mockRejectedValue(new Error('Role not found'));

      await expect(authService.register('T', 'test@test.com', 'p', 'invalid')).rejects.toThrow(
        /Role 'invalid' not found/,
      );
    });

    it('should throw non-AppError if unexpected error occurs', async () => {
      vi.mocked(userRepository.findByEmail).mockRejectedValue(new Error('Unexpected DB error'));

      await expect(authService.register('T', 'test@test.com', 'p')).rejects.toThrow(
        'Unexpected DB error',
      );
    });
  });

  describe('login', () => {
    it('should successfully log in', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.verify).mockResolvedValue(true);
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('admin');

      const result = await authService.login('test@test.com', 'password123');

      expect(result.user.id).toBe(mockUser.id);
      expect(passwordUtils.verify).toHaveBeenCalledWith('password123', mockUser.password_hash);
    });

    it('should throw error if user not found', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(null);
      await expect(authService.login('ghost@test.com', 'p')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user has no password hash', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue({
        id: '1',
        email: 'a@a.com',
      } as any);
      await expect(authService.login('a@a.com', 'p')).rejects.toThrow('Invalid credentials');
    });

    it('should lock account if failed attempts > 5', async () => {
      const lockedUser = { ...mockUser, failed_login_attempts: 6, last_login: new Date() };
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(lockedUser as any);

      await expect(authService.login('test@test.com', 'p')).rejects.toThrow(
        /Account temporarily locked/,
      );
    });

    it('should increment failed attempts on wrong password', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.verify).mockResolvedValue(false);

      await expect(authService.login('test@test.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          failed_login_attempts: 1,
        }),
      );
    });

    it('should rehash password if needed on successful login', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.verify).mockResolvedValue(true);
      vi.mocked(passwordUtils.needsRehash).mockReturnValue(true);
      vi.mocked(passwordUtils.hash).mockResolvedValue('new_hash');
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('user');

      const result = await authService.login('test@test.com', 'password123');

      expect(result.user.id).toBe(mockUser.id);
      expect(passwordUtils.hash).toHaveBeenCalledWith('password123');
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password_hash: 'new_hash',
        }),
      );
    });

    it('should not rehash password if not needed', async () => {
      vi.mocked(userRepository.findWithPasswordByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.verify).mockResolvedValue(true);
      vi.mocked(passwordUtils.needsRehash).mockReturnValue(false);
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('user');

      const result = await authService.login('test@test.com', 'password123');

      expect(result.user.id).toBe(mockUser.id);
      expect(passwordUtils.hash).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);

      vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
        user_id: 'uuid-123',
        expires_at: expiry,
      } as any);
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any);
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('user');

      const result = await authService.refreshAccessToken(refreshToken);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw if refresh token expired', async () => {
      const refreshToken = 'expired-token';
      const expiry = new Date();
      expiry.setDate(expiry.getDate() - 1);

      vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
        user_id: '1',
        expires_at: expiry,
      } as any);

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Refresh token expired or invalid',
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      await authService.logout('some-token');
      expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('some-token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate token and send email if user exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as any);

      await authService.requestPasswordReset('test@test.com');

      expect(userRepository.update).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should do nothing if user not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      await authService.requestPasswordReset('ghost@test.com');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should clear reset token if email fails', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(emailService.sendEmail).mockRejectedValue(new Error('Email failed'));

      await expect(authService.requestPasswordReset('test@test.com')).rejects.toThrow(
        'There was an error sending the email',
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          reset_password_token: null,
          reset_password_expires: null,
        }),
      );
    });
  });

  describe('generateTokenFor2FA', () => {
    it('should generate token for valid user', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as any);
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('user');

      const result = await authService.generateTokenFor2FA(mockUser.id);
      expect(result.token).toBeDefined();
    });

    it('should throw error if user not found in 2FA', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(authService.generateTokenFor2FA('invalid-id')).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password and auto-login user', async () => {
      const resetToken = 'reset-token-123';
      const newPassword = 'newpassword123';
      vi.mocked(userRepository.findUserValidForReset).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.hash).mockResolvedValue('hashed_new_password');
      vi.mocked(userRepository.getUserPermissions).mockResolvedValue([]);
      vi.mocked(userRepository.getUserRole).mockResolvedValue('user');

      const result = await authService.resetPassword(resetToken, newPassword);

      expect(result.token).toBeDefined();
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password_hash: 'hashed_new_password',
          reset_password_token: null,
          reset_password_expires: null,
        }),
      );
    });

    it('should throw error if reset token is invalid', async () => {
      vi.mocked(userRepository.findUserValidForReset).mockResolvedValue(null);

      await expect(authService.resetPassword('invalid-token', 'newpassword')).rejects.toThrow(
        'Token is invalid or has expired',
      );
    });
  });
});
