import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../src/services/authService.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { logActivityService } from '../../src/services/logActivityService.js';
import { emailService } from '../../src/services/emailService.js';
import { AppError } from '../../src/utils/errors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock dependencies
vi.mock('../../src/repositories/user.repository.js');
vi.mock('../../src/services/logActivityService.js');
vi.mock('../../src/services/emailService.js');
vi.mock('bcrypt');
vi.mock('crypto'); // Mock crypto globally
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
  // Também mockar as exportações nomeadas se houver (o código usa pkg.sign)
  sign: vi.fn(), 
  verify: vi.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    (bcrypt.hash as vi.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as vi.Mock).mockResolvedValue(true);
    (jwt.sign as vi.Mock).mockReturnValue('mock_token');
    
    // Mock crypto behavior
    const mockHash = {
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed_token'),
    };
    (crypto.createHash as vi.Mock).mockReturnValue(mockHash);
    (crypto.randomBytes as vi.Mock).mockReturnValue(Buffer.from('random_token_bytes'));
  });

  describe('register', () => {
    it('should successfully register a user and return user data and a token', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockPermissions = [{ id: 1, action: 'read', subject: 'all' }];

      (userRepository.findByEmail as vi.Mock).mockResolvedValue(null); // User does not exist
      (userRepository.create as vi.Mock).mockResolvedValue(mockUser);
      (userRepository.assignRole as vi.Mock).mockResolvedValue(undefined);
      (userRepository.getUserPermissions as vi.Mock).mockResolvedValue(mockPermissions);

      const result = await authService.register('Test User', 'test@example.com', 'password123');

      expect(result).toEqual({
        user: { ...mockUser, role: 'user', permissions: mockPermissions },
        token: 'mock_token',
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
      });
      expect(logActivityService.logActivity).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      (userRepository.findByEmail as vi.Mock).mockResolvedValue({ id: '1' });

      await expect(authService.register('Test User', 'test@example.com', 'password123'))
        .rejects.toThrow('User with this email already exists');
    });

    it('should throw error if role not found', async () => {
       (userRepository.findByEmail as vi.Mock).mockResolvedValue(null);
       (userRepository.create as vi.Mock).mockResolvedValue({ id: '1' });
       (userRepository.assignRole as vi.Mock).mockRejectedValue(new Error('Role not found'));

       await expect(authService.register('Test User', 'test@example.com', 'password123', 'invalidRole'))
         .rejects.toThrow("Role 'invalidRole' not found");
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', password_hash: 'hashed_password' };
      const mockPermissions = [{ id: 1, action: 'read', subject: 'all' }];

      (userRepository.findByEmail as vi.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as vi.Mock).mockResolvedValue(true);
      (userRepository.getUserPermissions as vi.Mock).mockResolvedValue(mockPermissions);
      (userRepository.getUserRole as vi.Mock).mockResolvedValue('user');

      const result = await authService.login('test@example.com', 'password123');

      expect(result.token).toBe('mock_token');
      expect(logActivityService.logActivity).toHaveBeenCalledWith(expect.objectContaining({
        action: 'User Logged In'
      }));
    });

    it('should throw error if user not found', async () => {
      (userRepository.findByEmail as vi.Mock).mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password invalid', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', password_hash: 'hashed_password' };
      (userRepository.findByEmail as vi.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as vi.Mock).mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpass'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send email with reset token if user exists', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      (userRepository.findByEmail as vi.Mock).mockResolvedValue(mockUser);
      (emailService.sendEmail as vi.Mock).mockResolvedValue(undefined);

      await authService.requestPasswordReset('test@example.com');

      expect(userRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        reset_password_token: 'hashed_token',
        reset_password_expires: expect.any(Date)
      }));
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringContaining('password reset'),
        expect.stringContaining('http://localhost:3000/reset-password/')
      );
    });

    it('should do nothing if user does not exist', async () => {
      (userRepository.findByEmail as vi.Mock).mockResolvedValue(null);

      await authService.requestPasswordReset('nonexistent@example.com');

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should rollback update if sending email fails', async () => {
       const mockUser = { id: '1', email: 'test@example.com' };
       (userRepository.findByEmail as vi.Mock).mockResolvedValue(mockUser);
       (emailService.sendEmail as vi.Mock).mockRejectedValue(new Error('Email failed'));

       await expect(authService.requestPasswordReset('test@example.com')).rejects.toThrow('There was an error sending the email');

       // Verify rollback
       expect(userRepository.update).toHaveBeenLastCalledWith('1', expect.objectContaining({
         reset_password_token: null,
         reset_password_expires: null
       }));
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
      const mockPermissions = [];

      (userRepository.findUserValidForReset as vi.Mock).mockResolvedValue(mockUser);
      (userRepository.getUserPermissions as vi.Mock).mockResolvedValue(mockPermissions);
      (userRepository.getUserRole as vi.Mock).mockResolvedValue('user');
      (bcrypt.hash as vi.Mock).mockResolvedValue('new_hashed_password');

      const result = await authService.resetPassword('valid_token', 'newPassword123');

      expect(userRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        password_hash: 'new_hashed_password',
        reset_password_token: null,
        reset_password_expires: null
      }));
      expect(result.token).toBe('mock_token');
    });

    it('should throw error if token is invalid or expired', async () => {
      (userRepository.findUserValidForReset as vi.Mock).mockResolvedValue(null);

      await expect(authService.resetPassword('invalid_token', 'newPassword123'))
        .rejects.toThrow('Token is invalid or has expired');
    });
  });

  describe('generateTokenFor2FA', () => {
    it('should generate token for valid user', async () => {
       const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
       const mockPermissions = [];

       (userRepository.findById as vi.Mock).mockResolvedValue(mockUser);
       (userRepository.getUserPermissions as vi.Mock).mockResolvedValue(mockPermissions);
       (userRepository.getUserRole as vi.Mock).mockResolvedValue('admin');

       const result = await authService.generateTokenFor2FA('1');

       expect(result.token).toBe('mock_token');
       expect(logActivityService.logActivity).toHaveBeenCalledWith(expect.objectContaining({
         action: 'User Logged In (2FA Verified)'
       }));
    });

    it('should throw error if user not found', async () => {
       (userRepository.findById as vi.Mock).mockResolvedValue(null);

       await expect(authService.generateTokenFor2FA('999'))
         .rejects.toThrow('User not found');
    });
  });
});
