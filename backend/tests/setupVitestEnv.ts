import { vi, beforeAll, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { setPool } from '../src/db/index.js';

// 1. Load Environment Variables IMMEDIATELY
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// --- INFRASTRUCTURE MOCKS ---
vi.mock('../src/lib/telemetry.js', () => ({
  default: {},
  sdk: { start: vi.fn(), shutdown: vi.fn() },
}));

vi.mock('whatsapp-web.js', () => ({
  default: {
    Client: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    })),
    LocalAuth: vi.fn(),
  },
}));

vi.mock('../src/jobs/queue.js', () => ({
  badgeQueue: { name: 'badgeQueue', add: vi.fn() },
  rfmQueue: { name: 'rfmQueue', add: vi.fn() },
  whatsappQueue: { name: 'whatsappQueue', add: vi.fn() },
  defaultQueue: { name: 'defaultQueue', add: vi.fn() },
  addJob: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@bull-board/api', () => ({
  createBullBoard: vi.fn(),
}));

vi.mock('@bull-board/api/bullMQAdapter', () => ({
  BullMQAdapter: vi.fn().mockImplementation(() => ({
    getName: () => 'mockQueue',
  })),
}));

vi.mock('@bull-board/express', async () => {
  const express = await import('express');
  const mockRouter = express.Router();
  return {
    ExpressAdapter: vi.fn().mockImplementation(() => ({
      setBasePath: vi.fn(),
      getRouter: () => mockRouter,
    })),
  };
});

const TEMP_CONFIG_PATH = path.join(process.cwd(), 'temp', 'vitest-global-config.json');
let workerPool: Pool;

// --- GLOBAL MOCKS ---
vi.mock('../src/services/marketplaceSyncService.js', () => ({
  marketplaceSyncService: { updateStockOnSale: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('../src/services/gamificationService.js', () => ({
  updateChallengeProgress: vi.fn().mockResolvedValue(undefined),
  getChallengeProgress: vi.fn().mockResolvedValue([]),
}));
vi.mock('../src/utils/redisClient.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setEx: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    isOpen: true,
  },
}));
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi
      .fn()
      .mockReturnValue({ sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }) }),
  },
}));

const shared = vi.hoisted(() => ({ adminToken: '' }));

// Robust mock for auth utilities
vi.mock('./utils/auth.js', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    getAdminAuthToken: vi.fn(() => shared.adminToken),
    loginUser: vi.fn(() => shared.adminToken),
  };
});

// --- HOOKS ---

beforeAll(async () => {
  try {
    const config = JSON.parse(fs.readFileSync(TEMP_CONFIG_PATH, 'utf-8'));
    workerPool = new Pool({
      connectionString: config.databaseUrl,
      max: 5,
      idleTimeoutMillis: 500,
    });
    setPool(workerPool);

    // 1. Seed stable admin role if it doesn't exist
    await workerPool.query(
      "INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING",
    );
    const adminRoleId = (await workerPool.query("SELECT id FROM roles WHERE name = 'admin'"))
      .rows[0].id;

    // 2. Grant 'manage:all' to the admin role
    await workerPool.query(
      "INSERT INTO permissions (action, subject) VALUES ('manage', 'all') ON CONFLICT DO NOTHING",
    );
    const manageAllPermId = (
      await workerPool.query(
        "SELECT id FROM permissions WHERE action = 'manage' AND subject = 'all'",
      )
    ).rows[0].id;
    await workerPool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminRoleId, manageAllPermId],
    );

    // 3. Ensure Admin User exists with REAL UUID and Role
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userRes = await workerPool.query(
      `
      INSERT INTO users (name, email, password_hash) 
      VALUES ('Admin User', 'admin@pdv.com', $1) 
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `,
      [adminPasswordHash],
    );
    const adminUserId = userRes.rows[0].id;
    await workerPool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminUserId, adminRoleId],
    );

    // 4. Generate a REAL token with 'manage:all'
    shared.adminToken = jwt.sign(
      {
        id: adminUserId,
        email: 'admin@pdv.com',
        role: 'admin',
        permissions: [{ action: 'manage', subject: 'all' }],
      },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1h' },
    );
  } catch (error) {
    console.error(`[setupVitestEnv] FATAL SETUP ERROR:`, error);
    process.exit(1);
  }
});

afterEach(async () => {
  if (!workerPool) return;
  try {
    // Truncate non-security tables RESTARTING identities
    await workerPool.query(`
      TRUNCATE quarantine_items, service_order_status_history, service_order_items, 
               service_order_attachments, service_order_comments, kanban_cards, 
               service_orders, sale_payments, sale_items, sales, 
               branch_product_variations_stock, product_variations, products, 
               expense_reimbursements, customers, branch_cash_register_transactions,
               branch_cash_registers, shift_reports RESTART IDENTITY CASCADE
    `);
    // Do NOT delete branches with ID 1 (default)
    await workerPool.query('DELETE FROM branches WHERE id > 1');
  } catch (_e) {
    // Silent
  }
});
