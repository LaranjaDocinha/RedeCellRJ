import { authService } from '../../src/services/authService.js';
import { vi } from 'vitest';
import { AppError } from '../../src/utils/errors.js';
// Mock bcrypt
vi.mock('bcrypt', () => ({
    default: {
        // Provide a default export
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));
// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn(),
    },
    sign: vi.fn(),
    verify: vi.fn(),
}));
// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    const mockPool = {
        query: mockQuery,
    };
    return {
        __esModule: true,
        getPool: vi.fn(() => mockPool),
        default: mockPool, // Keep a default export if some parts of the code use it
    };
});
describe('authService', () => {
    let mockedDb;
    let mockedBcrypt;
    let mockedJwt;
    beforeAll(async () => {
        mockedDb = vi.mocked(await import('../../src/db/index.js'));
        mockedBcrypt = vi.mocked(await import('bcrypt'));
        mockedJwt = vi.mocked(await import('jsonwebtoken'));
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    beforeEach(() => {
        // Set default mock implementations
        mockedBcrypt.default.hash.mockImplementation(async (password) => `hashed_${password}`);
        mockedBcrypt.default.compare.mockImplementation(async (password, hash) => `hashed_${password}` === hash);
        mockedJwt.default.sign.mockImplementation((payload) => `mock_token_${JSON.stringify(payload)}`);
    });
    describe('register', () => {
        it('should successfully register a user and return user data and a token', async () => {
            const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', loyalty_points: 0 };
            const mockRole = { id: 1, name: 'user' };
            const mockPermissions = [{ id: 1, action: 'read', subject: 'all' }];
            // Mock the sequence of queries
            mockedDb
                .getPool()
                .query.mockResolvedValueOnce({ rows: [{ id: mockRole.id }] }) // 1. Find role ID
                .mockResolvedValueOnce({ rows: [mockUser] }) // 2. Insert user
                .mockResolvedValueOnce({ rows: [] }) // 3. Link user to role
                .mockResolvedValueOnce({ rows: mockPermissions }); // 4. Get permissions
            const { user, token } = await authService.register('Test User', 'test@example.com', 'password123');
            const expectedUser = { ...mockUser, permissions: mockPermissions };
            const expectedJwtPayload = {
                id: mockUser.id,
                email: mockUser.email,
                permissions: mockPermissions,
            };
            expect(user).toEqual(expectedUser);
            expect(token).toBe(`mock_token_${JSON.stringify(expectedJwtPayload)}`);
            expect(mockedBcrypt.default.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT id FROM roles WHERE name = $1', ['user']);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, loyalty_points', ['Test User', 'test@example.com', 'hashed_password123']);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [mockUser.id, mockRole.id]);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith(expect.any(String), [mockUser.id]); // For getUserPermissions
        });
        it('should register a user with a specified role', async () => {
            const mockUser = { id: 2, name: 'Admin User', email: 'admin@example.com', loyalty_points: 0 };
            const mockRole = { id: 99, name: 'admin' };
            const mockPermissions = [{ id: 1, action: 'manage', subject: 'all' }];
            // Mock the sequence of queries
            mockedDb
                .getPool()
                .query.mockResolvedValueOnce({ rows: [{ id: mockRole.id }] }) // 1. Find role ID
                .mockResolvedValueOnce({ rows: [mockUser] }) // 2. Insert user
                .mockResolvedValueOnce({ rows: [] }) // 3. Link user to role
                .mockResolvedValueOnce({ rows: mockPermissions }); // 4. Get permissions
            const { user, token } = await authService.register('Admin User', 'admin@example.com', 'adminpass', 'admin');
            const expectedUser = { ...mockUser, permissions: mockPermissions };
            const expectedJwtPayload = {
                id: mockUser.id,
                email: mockUser.email,
                permissions: mockPermissions,
            };
            expect(user).toEqual(expectedUser);
            expect(token).toBe(`mock_token_${JSON.stringify(expectedJwtPayload)}`);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT id FROM roles WHERE name = $1', ['admin']);
        });
    });
    describe('login', () => {
        const mockUserFromDb = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password_hash: 'hashed_password123',
        };
        const mockPermissions = [{ id: 1, action: 'read', subject: 'all' }];
        it('should successfully log in a user with valid credentials', async () => {
            mockedDb
                .getPool()
                .query.mockResolvedValueOnce({ rows: [mockUserFromDb] }) // 1. Find user by email with role
                .mockResolvedValueOnce({ rows: mockPermissions }); // 2. Get permissions
            const { user, token } = await authService.login('test@example.com', 'password123');
            const expectedUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                permissions: mockPermissions,
            };
            const expectedJwtPayload = { id: 1, email: 'test@example.com', permissions: mockPermissions };
            expect(user).toEqual(expectedUser);
            expect(token).toBe(`mock_token_${JSON.stringify(expectedJwtPayload)}`);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT u.id, u.name, u.email, u.password_hash FROM users u WHERE u.email = $1', ['test@example.com']);
            expect(mockedBcrypt.default.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
            expect(mockedJwt.default.sign).toHaveBeenCalledWith(expectedJwtPayload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });
        });
        it('should throw an error for invalid email', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: [] }); // No user found
            await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow(new AppError('Invalid credentials', 401));
            expect(mockedDb.getPool().query).toHaveBeenCalledTimes(1);
            expect(mockedJwt.sign).not.toHaveBeenCalled();
        });
        it('should throw an error for invalid password', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: [mockUserFromDb] });
            mockedBcrypt.default.compare.mockResolvedValueOnce(false); // Password mismatch
            await expect(authService.login('test@example.com', 'wrongpass')).rejects.toThrow(new AppError('Invalid credentials', 401));
            expect(mockedDb.getPool().query).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.default.compare).toHaveBeenCalledWith('wrongpass', 'hashed_password123');
            expect(mockedJwt.sign).not.toHaveBeenCalled();
        });
    });
});
