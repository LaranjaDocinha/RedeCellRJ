import { vi, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import * as dbIndex from '../src/db/index.js';
import * as authUtils from '../tests/utils/auth.js';
import * as seedTestData from '../tests/utils/seedTestData.js';
import { Pool } from 'pg';
import * as nodeFs from 'fs';
import path from 'path';
import * as authService from '../src/services/authService.js'; // Import the real authService

const TEMP_CONFIG_PATH = path.resolve(__dirname, '../temp/vitest-global-config.json');

console.log('--- setupVitestEnv.ts is running ---');

let adminToken: string;
let adminPermissions: any[];

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

// Use vi.hoisted para declarar mocks que podem ser acessados e configurados
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

// Mock db/index.js (or .ts) exports - retorna as referências aos mocks declarados acima
vi.mock('../src/db/index.js', () => dbMocks);

// Mock authUtils functions at module level
vi.mock('../tests/utils/auth.js');

// authService and seedTestData should NOT be mocked for integration tests
// to ensure we test the real logic and database interactions.

beforeAll(async () => {
  // Read config and initialize globalPool and adminUser here (local to beforeAll)
  let config: { adminUser: any; databaseUrl: string };
  let globalPool: Pool; // Declare locally
  let adminUser: any; // Declare locally

  try {
    const configContent = nodeFs.readFileSync(TEMP_CONFIG_PATH, 'utf-8');
    config = JSON.parse(configContent);
    console.log(`[setupVitestEnv.ts] Loaded database URL: ${config.databaseUrl}`);
    adminUser = config.adminUser;
    globalPool = new Pool({ connectionString: config.databaseUrl });
    console.log(`setupVitestEnv.ts [PID: ${process.pid}]: Config loaded and globalPool/adminUser initialized inside beforeAll.`);
  } catch (error) {
    console.error(`Failed to load global test configuration from ${TEMP_CONFIG_PATH} inside beforeAll: ${error}`);
    throw new Error(`Failed to initialize global test config: ${error}`);
  }

  // A partir daqui, globalPool e adminUser são as variáveis locais do beforeAll
  if (!globalPool || !adminUser) {
    throw new Error('Global test configuration (pool or admin user) not set up correctly inside beforeAll.');
  }

  const adminUserId = adminUser.id;
  const adminEmail = adminUser.email;
  adminPermissions = adminUser.permissions;

  adminToken = jwt.sign(
    { id: adminUserId, email: adminEmail, role: 'admin', permissions: adminPermissions },
    process.env.JWT_SECRET || 'supersecretjwtkey',
    { expiresIn: '1h' }
  );

  // Set mock implementations for dbIndex using the now initialized globalPool
  dbMocks.getPool.mockImplementation(() => globalPool);
  dbMocks.setPool.mockImplementation((newPool) => {
    // No need to set, globalPool is managed by globalSetup
  });
  dbMocks.query.mockImplementation((text, params) => globalPool.query(text, params));
  dbMocks.connect.mockImplementation(() => globalPool.connect());
  dbMocks.default.query.mockImplementation((text, params) => globalPool.query(text, params));
  dbMocks.default.connect.mockImplementation(() => globalPool.connect());

  vi.mocked(authUtils).getAdminAuthToken.mockImplementation(async () => adminToken);
});

afterAll(async () => {
  // Nada para fazer aqui, o teardown do pool é no globalSetup
});
