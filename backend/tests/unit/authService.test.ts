import { authService } from '../../src/services/authService.js';
import { vi } from 'vitest';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: { // Provide a default export
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('jsonwebtoken');
  return {
    ...actual,
    sign: vi.fn(),
  };
});

// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
    begin: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
  };
  const mockPool = {
    query: mockQuery,
    connect: vi.fn(() => Promise.resolve(mockClient)),
  };

  return {
    __esModule: true,
    default: mockPool,
    query: mockQuery,
  };
});

import { UnauthorizedError } from '../../src/utils/errors.js';

describe('authService', () => {
  let mockedDb: any;
  let mockedBcrypt: any;
  let mockedJwt: any;

  beforeAll(async () => {
    // Dynamically import mocked modules
    mockedDb = vi.mocked(await import('../../src/db/index.js'));
    mockedBcrypt = vi.mocked(await import('bcrypt'));
    mockedJwt = vi.mocked(await import('jsonwebtoken'));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear specific mock implementations if needed for specific tests
    mockedDb.query.mockClear();
    mockedDb.default.query.mockClear(); // Clear mock for pool.query
    mockedDb.default.connect.mockClear(); // Clear mock for pool.connect

    // Set mock implementations for bcrypt and jsonwebtoken on their default exports
    mockedBcrypt.default.hash.mockImplementation((password) => Promise.resolve(`hashed_${password}`));
    mockedBcrypt.default.compare.mockImplementation((password, hashedPassword) => Promise.resolve(password === hashedPassword.replace('hashed_', '')));
    mockedJwt.sign.mockImplementation((payload, secret, options) => `mock_token_${payload.id}_${payload.email}`);
  });

  describe('register', () => {
    it('should successfully register a user and return user data and a token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'user' };
      mockedDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const { user, token } = await authService.register('Test User', 'test@example.com', 'password123');

      expect(user).toEqual(mockUser);
      expect(token).toBe(`mock_token_${mockUser.id}_${mockUser.email}`);
      expect(mockedBcrypt.default.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockedDb.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        ['Test User', 'test@example.com', 'hashed_password123', 'user']
      );
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test_secret',
        { expiresIn: '1h' }
      );
    });

    it('should register a user with a specified role', async () => {
      const mockUser = { id: 2, email: 'admin@example.com', role: 'admin' };
      mockedDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const { user, token } = await authService.register('Admin User', 'admin@example.com', 'adminpass', 'admin');

      expect(user).toEqual(mockUser);
      expect(token).toBe(`mock_token_${mockUser.id}_${mockUser.email}`);
      expect(mockedBcrypt.default.hash).toHaveBeenCalledWith('adminpass', 10);
      expect(mockedDb.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        ['Admin User', 'admin@example.com', 'hashed_adminpass', 'admin']
      );
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test_secret',
        { expiresIn: '1h' }
      );
    });
  });

  describe('login', () => {
    const mockUser = { id: 1, email: 'test@example.com', password_hash: 'hashed_password123', role: 'user' };

    it('should successfully log in a user with valid credentials', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockedBcrypt.default.compare.mockResolvedValueOnce(true);

      const { user, token } = await authService.login('test@example.com', 'password123');

      expect(user).toEqual({ id: mockUser.id, email: mockUser.email, role: mockUser.role });
      expect(token).toBe(`mock_token_${mockUser.id}_${mockUser.email}`);
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com']);
      expect(mockedBcrypt.default.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        'test_secret',
        { expiresIn: '1h' }
      );
    });

    it('should throw an error for invalid email', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [] }); // No user found

      await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow(UnauthorizedError);
      expect(mockedDb.query).toHaveBeenCalledTimes(1);
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid password', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockedBcrypt.default.compare.mockResolvedValueOnce(false); // Password mismatch

      await expect(authService.login('test@example.com', 'wrongpass')).rejects.toThrow(UnauthorizedError);
      expect(mockedDb.query).toHaveBeenCalledTimes(1);
      expect(mockedBcrypt.default.compare).toHaveBeenCalledWith('wrongpass', 'hashed_password123');
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });
  });


});