import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from '../../../src/services/userService.js';
import * as db from '../../../src/db/index.js';
import { authService } from '../../../src/services/authService.js';
import * as bcrypt from 'bcrypt';

// Mocks
vi.mock('../../../src/db/index.js', () => ({
  query: vi.fn(),
}));

vi.mock('../../../src/services/authService.js', () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users with their roles', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
      ];
      
      vi.mocked(db.query).mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 } as any);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM users u'));
    });

    it('should throw an error if db query fails', async () => {
      const error = new Error('DB Error');
      vi.mocked(db.query).mockRejectedValueOnce(error);

      // Spy on console.error to suppress output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(userService.getAllUsers()).rejects.toThrow('DB Error');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in userService.getAllUsers:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', name: 'Alice' };
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
    });

    it('should return undefined if user not found', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const result = await userService.getUserById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should call authService.register to create a user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'manager',
      };
      
      const expectedUser = { id: 1, ...userData };
      vi.mocked(authService.register).mockResolvedValueOnce({ user: expectedUser } as any);

      const result = await userService.createUser(userData);

      expect(authService.register).toHaveBeenCalledWith(
        userData.name,
        userData.email,
        userData.password,
        userData.role
      );
      expect(result).toEqual(expectedUser);
    });

    it('should default role to "user" if not provided', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      
      const expectedUser = { id: 1, ...userData, role: 'user' };
      vi.mocked(authService.register).mockResolvedValueOnce({ user: expectedUser } as any);

      await userService.createUser(userData);

      expect(authService.register).toHaveBeenCalledWith(
        userData.name,
        userData.email,
        userData.password,
        'user'
      );
    });

    it('should throw error if password is missing', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
      } as any;

      await expect(userService.createUser(userData)).rejects.toThrow('Password is required for user creation.');
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update basic fields (name, email, role)', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const userId = '1';
      const mockUpdatedUser = { id: userId, ...updateData, role: 'user' };

      vi.mocked(db.query).mockResolvedValueOnce({ rows: [mockUpdatedUser], rowCount: 1 } as any);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      // Check if query was constructed correctly
      // name=$1, email=$2 ... WHERE id=$3
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE users SET name = \$1, email = \$2, updated_at = NOW\(\) WHERE id = \$3/),
        ['Updated Name', 'updated@example.com', '1']
      );
    });

    it('should hash password if provided', async () => {
      const updateData = { password: 'newpassword' };
      const userId = '1';
      const hashedPassword = 'hashed_newpassword';
      
      vi.mocked(bcrypt.hash).mockResolvedValueOnce(hashedPassword as never);
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: userId }], rowCount: 1 } as any);

      await userService.updateUser(userId, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE users SET password_hash = \$1, updated_at = NOW\(\) WHERE id = \$2/),
        [hashedPassword, userId]
      );
    });

    it('should call getUserById if no fields to update', async () => {
      const userId = '1';
      const mockUser = { id: userId, name: 'Original' };
      
      // Spy on getUserById since it's an internal call (might need spyOn(userService) or just mock db output for getUserById)
      // Since userService functions are properties of the object, we can spy on them if we import the object itself
      // But inside the module `this.getUserById` is called.
      const getUserSpy = vi.spyOn(userService, 'getUserById').mockResolvedValueOnce(mockUser as any);

      const result = await userService.updateUser(userId, {});

      expect(result).toEqual(mockUser);
      expect(getUserSpy).toHaveBeenCalledWith(userId);
      expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'));
      
      getUserSpy.mockRestore();
    });
  });

  describe('deleteUser', () => {
    it('should return true if user deleted', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({ rowCount: 1, rows: [] } as any);

      const result = await userService.deleteUser('1');

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1;', ['1']);
    });

    it('should return false if no user deleted', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({ rowCount: 0, rows: [] } as any);

      const result = await userService.deleteUser('999');

      expect(result).toBe(false);
    });
  });
});
