import { vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

vi.stubEnv('JWT_SECRET', 'test_secret');
vi.stubEnv('JWT_EXPIRES_IN', '1h');