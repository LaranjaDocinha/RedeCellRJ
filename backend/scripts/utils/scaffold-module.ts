import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Please provide a module name (e.g., Warranty)');
  process.exit(1);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const camelCase = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const Name = capitalize(moduleName);
const name = camelCase(moduleName);

const templates = {
  repository: `import { Pool, PoolClient } from 'pg';
import { getPool } from '../db';

export interface ${Name} {
  id: number;
  // TODO: Add properties
}

export class ${Name}Repository {
  private get db(): Pool {
    return getPool();
  }

  async findAll(): Promise<${Name}[]> {
    const result = await this.db.query('SELECT * FROM ${name}s');
    return result.rows;
  }

  async findById(id: number): Promise<${Name} | undefined> {
    const result = await this.db.query('SELECT * FROM ${name}s WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(data: Partial<${Name}>): Promise<${Name}> {
    // TODO: Implement insert
    return {} as ${Name};
  }
}

export const ${name}Repository = new ${Name}Repository();
`,
  service: `import { ${name}Repository } from '../repositories/${name}.repository.js';

export const ${name}Service = {
  async getAll() {
    return ${name}Repository.findAll();
  },

  async getById(id: number) {
    return ${name}Repository.findById(id);
  }
};
`,
  controller: `import { Request, Response, NextFunction } from 'express';
import { ${name}Service } from '../services/${name}.service.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await ${name}Service.getAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const item = await ${name}Service.getById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};
`,
  route: `import { Router } from 'express';
import * as controller from '../controllers/${name}.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/', authMiddleware.authorize('read', '${Name}'), controller.getAll);
router.get('/:id', authMiddleware.authorize('read', '${Name}'), controller.getById);

export default router;
`,
  test: `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ${name}Service } from '../../../src/services/${name}.service.js';
import { ${name}Repository } from '../../../src/repositories/${name}.repository.js';

vi.mock('../../../src/repositories/${name}.repository.js', () => ({
  ${name}Repository: {
    findAll: vi.fn(),
    findById: vi.fn(),
  }
}));

describe('${Name}Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all items', async () => {
      vi.mocked(${name}Repository.findAll).mockResolvedValue([]);
      const result = await ${name}Service.getAll();
      expect(result).toEqual([]);
    });
  });
})
`
};

const paths = {
  repository: path.join(__dirname, `../src/repositories/${name}.repository.ts`),
  service: path.join(__dirname, `../src/services/${name}.service.ts`),
  controller: path.join(__dirname, `../src/controllers/${name}.controller.ts`),
  route: path.join(__dirname, `../src/routes/${name}.ts`),
  test: path.join(__dirname, `../tests/unit/services/${name}.service.test.ts`)
};

Object.entries(paths).forEach(([key, filePath]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, templates[key as keyof typeof templates]);
    console.log(`Created ${key}: ${filePath}`);
  } else {
    console.log(`Skipped ${key}: ${filePath} (already exists)`);
  }
});

console.log('\nModule scaffolded successfully! Don\'t forget to register the route in src/routes/index.ts');
