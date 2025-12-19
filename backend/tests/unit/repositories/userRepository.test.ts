import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRepository, User, Permission } from '../../../src/repositories/user.repository.js';
import { getPool } from '../../../src/db/index.js'; // Import getPool to mock it

// Mock the entire db module to control the pool
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('UserRepository', () => {
  let mockQuery: vi.Mock;
  let mockPool: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQuery = vi.fn();
    mockPool = {
      query: mockQuery,
    };
    (getPool as vi.Mock).mockReturnValue(mockPool); // Ensure getPool returns our mock pool
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const user = await userRepository.findById('1');
      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
    });

    it('should return null if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const user = await userRepository.findById('999');
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const user = await userRepository.findByEmail('test@example.com');
      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    });

    it('should return null if user not found by email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const user = await userRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        { id: '1', name: 'User 1', email: 'user1@example.com', created_at: new Date(), updated_at: new Date() },
        { id: '2', name: 'User 2', email: 'user2@example.com', created_at: new Date(), updated_at: new Date() },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockUsers });

      const users = await userRepository.findAll();
      expect(users).toEqual(mockUsers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should return empty array if no users found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const users = await userRepository.findAll();
      expect(users).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'New User', email: 'new@example.com', password_hash: 'hashed_password' };
      const createdUser = { id: '3', ...newUser, created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [createdUser] });

      const user = await userRepository.create(newUser);
      expect(user).toEqual(createdUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [newUser.name, newUser.email, newUser.password_hash]
      );
    });
  });

  describe('update', () => {
    it('should update user name', async () => {
      const updatedUser: User = {
        id: '1', name: 'Updated Name', email: 'test@example.com', created_at: new Date(), updated_at: new Date()
      };
      mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

      const user = await userRepository.update('1', { name: 'Updated Name' });
      expect(user).toEqual(updatedUser);
      expect(mockQuery).toHaveBeenCalledWith('UPDATE users SET name = $1 WHERE id = $2 RETURNING *', ['Updated Name', '1']);
    });

    it('should update user password_hash', async () => {
      const updatedUser: User = {
        id: '1', name: 'Test User', email: 'test@example.com', password_hash: 'new_hashed_password', created_at: new Date(), updated_at: new Date()
      };
      mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

      const user = await userRepository.update('1', { password_hash: 'new_hashed_password' });
      expect(user).toEqual(updatedUser);
      expect(mockQuery).toHaveBeenCalledWith('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *', ['new_hashed_password', '1']);
    });

    it('should update reset_password_token and reset_password_expires', async () => {
      const expires = new Date();
      const updatedUser: User = {
        id: '1', name: 'Test User', email: 'test@example.com', reset_password_token: 'new_token', reset_password_expires: expires, created_at: new Date(), updated_at: new Date()
      };
      mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

      const user = await userRepository.update('1', { reset_password_token: 'new_token', reset_password_expires: expires });
      expect(user).toEqual(updatedUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3 RETURNING *',
        ['new_token', expires, '1']
      );
    });

    it('should return existing user if no data to update', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };
      // Mock findById for when no update data is provided
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] }); 

      const user = await userRepository.update('1', {});
      expect(user).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await userRepository.delete('1');
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });

    it('should return false if user not found for deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await userRepository.delete('999');
      expect(result).toBe(false);
    });
  });

  describe('findUserValidForReset', () => {
    it('should return user if valid token exists', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        reset_password_token: 'hashed_token',
        reset_password_expires: new Date(Date.now() + 10000), // Future date
        created_at: new Date(), updated_at: new Date()
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const user = await userRepository.findUserValidForReset('hashed_token');
      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
        ['hashed_token', expect.any(Date)]
      );
    });

    it('should return null if token is invalid or expired', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const user = await userRepository.findUserValidForReset('invalid_token');
      expect(user).toBeNull();
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const mockPermissions: Permission[] = [{ id: 1, action: 'read', subject: 'all' }];
      mockQuery.mockResolvedValueOnce({ rows: mockPermissions });

      const permissions = await userRepository.getUserPermissions('1');
      expect(permissions).toEqual(mockPermissions);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT p.id, p.action, p.subject'),
        ['1']
      );
    });

    it('should return empty array if no permissions found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const permissions = await userRepository.getUserPermissions('1');
      expect(permissions).toEqual([]);
    });
  });

  describe('getUserRole', () => {
    it('should return user role name', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ name: 'admin' }] });

      const role = await userRepository.getUserRole('1');
      expect(role).toBe('admin');
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1',
        ['1']
      );
    });

    it('should return "user" if no role found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const role = await userRepository.getUserRole('1');
      expect(role).toBe('user');
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'role1' }] }); // Mock role lookup
      mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // Mock insert user_roles

      await userRepository.assignRole('1', 'admin');

      expect(mockQuery).toHaveBeenCalledWith('SELECT id FROM roles WHERE name = $1', ['admin']);
      expect(mockQuery).toHaveBeenCalledWith('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', ['1', 'role1']);
    });

    it('should throw error if role not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Mock role lookup returns no rows

      await expect(userRepository.assignRole('1', 'nonexistent_role'))
        .rejects.toThrow("Role 'nonexistent_role' not found");
    });
  });
});
