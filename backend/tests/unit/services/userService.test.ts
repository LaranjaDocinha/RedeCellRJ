import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../../../src/services/userService.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import { passwordUtils } from '../../../src/utils/passwordUtils.js';
import { AppError } from '../../../src/utils/errors.js';

// Mocks
vi.mock('../../../src/repositories/user.repository.js', () => ({
  userRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    assignRole: vi.fn(),
  },
}));

vi.mock('../../../src/utils/passwordUtils.js', () => ({
  passwordUtils: {
    hash: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
        { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' },
      ];

      (userRepository.findAll as vi.Mock).mockResolvedValueOnce(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(userRepository.findAll).toHaveBeenCalled();
    });

    it('should throw an error if repository fails', async () => {
      const error = new Error('DB Error');
      (userRepository.findAll as vi.Mock).mockRejectedValueOnce(error);

      await expect(userService.getAllUsers()).rejects.toThrow('DB Error');
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', name: 'Alice' };
      (userRepository.findById as vi.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw AppError if user not found', async () => {
      (userRepository.findById as vi.Mock).mockResolvedValueOnce(null);

      await expect(userService.getUserById('999')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'manager',
      };

      const expectedUser = { id: '1', name: 'New User', email: 'new@example.com' };
      (userRepository.findByEmail as vi.Mock).mockResolvedValueOnce(null);
      (passwordUtils.hash as vi.Mock).mockResolvedValueOnce('hashed_password');
      (userRepository.create as vi.Mock).mockResolvedValueOnce(expectedUser);

      const result = await userService.createUser(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(passwordUtils.hash).toHaveBeenCalledWith(userData.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password_hash: 'hashed_password',
      });
      expect(userRepository.assignRole).toHaveBeenCalledWith('1', 'manager');
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = { email: 'existing@example.com', name: 'Test', password: '123' };
      (userRepository.findByEmail as vi.Mock).mockResolvedValueOnce({ id: '1' });

      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('updateUser', () => {
    it('should update basic fields', async () => {
      const updateData = { name: 'Updated Name' };
      const userId = '1';
      const mockUpdatedUser = { id: userId, name: 'Updated Name' };

      (userRepository.update as vi.Mock).mockResolvedValueOnce(mockUpdatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(userRepository.update).toHaveBeenCalledWith(userId, { name: 'Updated Name' });
    });

    it('should hash password and update role if provided', async () => {
      const updateData = { password: 'newpassword', role: 'admin' };
      const userId = '1';

      (passwordUtils.hash as vi.Mock).mockResolvedValueOnce('hashed_newpassword');
      (userRepository.update as vi.Mock).mockResolvedValueOnce({ id: userId });

      await userService.updateUser(userId, updateData);

      expect(passwordUtils.hash).toHaveBeenCalledWith('newpassword');
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        password_hash: 'hashed_newpassword',
      });
      expect(userRepository.assignRole).toHaveBeenCalledWith(userId, 'admin');
    });
  });

  describe('deleteUser', () => {
    it('should call repository delete', async () => {
      (userRepository.delete as vi.Mock).mockResolvedValueOnce(true);

      const result = await userService.deleteUser('1');

      expect(result).toBe(true);
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
