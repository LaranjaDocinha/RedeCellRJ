import { vi, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import * as nodeFs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as authUtils from '../tests/utils/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_CONFIG_PATH = path.resolve(__dirname, '../temp/vitest-global-config.json');

let adminToken: string;

// Mock redisClient
const redisMock = vi.hoisted(() => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setEx: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    isOpen: true,
  },
}));

vi.mock('../src/utils/redisClient.js', () => redisMock);
vi.mock('../src/utils/redisClient', () => redisMock);

// DB Mocks
const dbMocks = vi.hoisted(() => ({
  getPool: vi.fn(),
  setPool: vi.fn(),
  query: vi.fn(),
  connect: vi.fn(),
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

vi.mock('../src/db/index.js', () => dbMocks);
vi.mock('../tests/utils/auth.js');

beforeAll(async () => {
  try {
    const configContent = nodeFs.readFileSync(TEMP_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configContent);
    const globalPool = new Pool({ connectionString: config.databaseUrl });
    const adminUser = config.adminUser;

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin', permissions: adminUser.permissions },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' }
    );

    dbMocks.getPool.mockImplementation(() => globalPool);
    dbMocks.query.mockImplementation((text, params) => globalPool.query(text, params));
    dbMocks.connect.mockImplementation(() => globalPool.connect());
    dbMocks.default.query.mockImplementation((text, params) => globalPool.query(text, params));
    dbMocks.default.connect.mockImplementation(() => globalPool.connect());

    vi.mocked(authUtils).getAdminAuthToken.mockImplementation(async () => adminToken);
  } catch (error) {
    console.error(`[setupVitestEnv] Setup failed: ${error}`);
    throw error;
  }
});

afterAll(async () => {
  // Teardown handled by globalSetup mostly, but we could close the local pool if we wanted
});