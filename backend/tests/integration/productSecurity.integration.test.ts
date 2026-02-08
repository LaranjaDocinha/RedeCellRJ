// backend/tests/integration/productSecurity.integration.test.ts
import request from 'supertest';
import { httpServer } from '../../src/app.js';
import { getPool } from '../../src/db/index.js';
import {
  seedUser,
  cleanupUser,
  seedRole,
  cleanupRole,
  seedPermission,
  cleanupPermission,
  assignRoleToUser,
  assignPermissionToRole,
  seedBranch,
  cleanupBranch,
} from '../utils/seedTestData.js';
import { ProductCreateInput } from '../../src/services/productService.js'; // Importando a interface
import { v4 as uuidv4 } from 'uuid';

describe('Product API Security - Integration', () => {
  let adminToken: string;
  let userNoPermissionToken: string;
  let noPermissionUserId: string;
  let noPermissionRoleId: string;
  let createProductPermissionId: string;
  let manageProductPermissionId: string;
  let testBranchId: string; // Declarar no escopo do describe

  const usersToCleanup: string[] = [];
  const rolesToCleanup: string[] = [];
  const permissionsToCleanup: string[] = [];
  const productsToCleanup: string[] = [];

  beforeAll(async () => {
    const pool = getPool();

    // Seed Admin User
    const adminUserData = {
      name: `Admin User ${Date.now()}`, // Make unique
      email: `admin${Date.now()}@pdv.com`, // Make unique
      password: 'admin123',
    };
    const adminUserId = await seedUser(pool, adminUserData);
    usersToCleanup.push(adminUserId);

    // Seed Admin Role and Permissions
    const adminRoleId = await seedRole(pool, `admin_role_${Date.now()}`); // Make unique
    rolesToCleanup.push(adminRoleId);
    await assignRoleToUser(pool, adminUserId, adminRoleId);

    // Give admin user 'manage:Product' permission
    manageProductPermissionId = await seedPermission(pool, 'manage', 'Product');
    permissionsToCleanup.push(manageProductPermissionId);
    await assignPermissionToRole(pool, adminRoleId, manageProductPermissionId);

    // Obter token de admin
    const res = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: adminUserData.email, password: adminUserData.password }); // Usar dados do seed
    adminToken = res.body.data.accessToken;

    // Setup para usuário sem permissão
    noPermissionRoleId = await seedRole(pool, 'no_product_role');
    rolesToCleanup.push(noPermissionRoleId);

    const noPermissionUserData = {
      name: `User No Product ${Date.now()}`, // Make unique
      email: `noprod${Date.now()}@test.com`, // Make unique
      password: 'password123',
    };
    noPermissionUserId = await seedUser(pool, noPermissionUserData);
    usersToCleanup.push(noPermissionUserId);
    await assignRoleToUser(pool, noPermissionUserId, noPermissionRoleId);

    const noPermissionRes = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: noPermissionUserData.email, password: noPermissionUserData.password });
    userNoPermissionToken = noPermissionRes.body.data.accessToken;

    // Criar permissão 'create:Product-UUID' (não usada diretamente, mas criada)
    createProductPermissionId = await seedPermission(pool, 'create', `Product-${uuidv4()}`);
    permissionsToCleanup.push(createProductPermissionId);

    // Seed uma branch para os testes de produto
    testBranchId = await seedBranch(pool);
    // O afterAll principal cuida de tudo
  }, 60000); // Increased timeout for beforeAll

  afterAll(async () => {
    const pool = getPool();
    // Primeiro cleanup users, que tem user_roles
    for (const userId of usersToCleanup) {
      // Limpar user_roles primeiro
      await pool.query('DELETE FROM user_roles WHERE user_id = $1', [userId]).catch(console.error);
      await cleanupUser(pool, userId).catch(console.error);
    }
    // Depois cleanup roles, que tem role_permissions
    for (const roleId of rolesToCleanup) {
      await pool
        .query('DELETE FROM role_permissions WHERE role_id = $1', [roleId])
        .catch(console.error);
      await cleanupRole(pool, roleId).catch(console.error);
    }
    // Por ultimo cleanup permissions
    for (const permissionId of permissionsToCleanup) {
      await cleanupPermission(pool, permissionId).catch(console.error);
    }
    // Cleanup de produtos criados nos testes
    for (const productId of productsToCleanup) {
      // Delete dependencies first
      await pool
        .query(
          'DELETE FROM price_history WHERE variation_id IN (SELECT id FROM product_variations WHERE product_id = $1)',
          [productId],
        )
        .catch(console.error);
      await pool
        .query(
          'DELETE FROM branch_product_variations_stock WHERE product_variation_id IN (SELECT id FROM product_variations WHERE product_id = $1)',
          [productId],
        )
        .catch(console.error);
      await pool
        .query('DELETE FROM product_variations WHERE product_id = $1', [productId])
        .catch(console.error);
      await pool.query('DELETE FROM products WHERE id = $1', [productId]).catch(console.error);
    }
    // Cleanup de branches
    await cleanupBranch(testBranchId, pool).catch(console.error);

    await httpServer.close();
  });

  describe('POST /api/products - Authorization and Validation', () => {
    // Declara validProductData e invalidProductData aqui para usar testBranchId
    let validProductData: ProductCreateInput;
    let invalidProductData: Partial<ProductCreateInput>;

    beforeEach(() => {
      validProductData = {
        name: `Valid Test Product ${Date.now()}`,
        branch_id: testBranchId,
        sku: `VTP-${Date.now()}`,
        product_type: 'eletronic',
        variations: [{ color: 'Blue', price: 100, stock_quantity: 5, low_stock_threshold: 1 }],
      };

      invalidProductData = {
        name: '', // Nome vazio
        branch_id: testBranchId,
        sku: `INV-${Date.now()}`,
        product_type: 'eletronic',
        variations: [
          { color: 'Red', price: -10, stock_quantity: 5, low_stock_threshold: 1 }, // Preço negativo
        ],
      };
    });

    it('should return 401 if no authentication token is provided', async () => {
      const res = await request(httpServer).post('/api/products').send(validProductData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.data.message).toEqual('No token provided');
    });

    it('should return 403 if user does not have "manage:Product" permission', async () => {
      const res = await request(httpServer)
        .post('/api/products')
        .set('Authorization', `Bearer ${userNoPermissionToken}`)
        .send(validProductData);

      expect(res.statusCode).toEqual(403);
      expect(res.body.data.message).toMatch(/Acesso negado/);
    });

    it('should return 422 for invalid product data', async () => {
      const res = await request(httpServer)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`) // Admin tem permissão para testar validação
        .send(invalidProductData);

      expect(res.statusCode).toEqual(422); // Validation Error uses 422
      expect(res.body.data.message).toEqual('Validation failed');
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'name', message: 'Nome do produto é obrigatório' }),
          expect.objectContaining({
            path: 'variations.0.price',
            message: 'Preço deve ser positivo',
          }),
        ]),
      );
    });

    it('should create product successfully with admin token and valid data', async () => {
      const res = await request(httpServer)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toEqual(validProductData.name);
      productsToCleanup.push(res.body.data.id); // Adicionar para cleanup
    });
  });

  // Testes para UPDATE (PUT /api/products/:id)
  describe('PUT /api/products/:id - Authorization and Validation', () => {
    let testProductId: string;
    let updateProductData: Partial<ProductCreateInput>;
    let invalidUpdateData: Partial<ProductCreateInput>;

    beforeEach(async () => {
      // Criar um produto para ser atualizado
      const res = await request(httpServer)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Product to Update ${Date.now()}`,
          branch_id: testBranchId, // USAR O ID DO BRANCH SEMEADO
          sku: `PTU-${Date.now()}`,
          product_type: 'eletronic',
          variations: [{ color: 'Green', price: 50, stock_quantity: 10, low_stock_threshold: 1 }],
        });
      testProductId = res.body.data.id;
      productsToCleanup.push(testProductId); // Adicionar para cleanup

      updateProductData = {
        name: `Updated Product Name ${Date.now()}`,
        variations: [
          {
            id: res.body.data.variations[0].id,
            color: 'Blue',
            price: 120,
            stock_quantity: 8,
            low_stock_threshold: 1,
          },
        ],
      };

      invalidUpdateData = {
        name: '', // Nome vazio
        variations: [
          {
            id: res.body.data.variations[0].id,
            color: 'Orange',
            price: 0,
            stock_quantity: -5,
            low_stock_threshold: 1,
          }, // Preço inválido, estoque negativo
        ],
      };
    });

    it('should return 401 if no authentication token is provided', async () => {
      const res = await request(httpServer)
        .put(`/api/products/${testProductId}`)
        .send(updateProductData);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if user does not have "manage:Product" permission', async () => {
      const res = await request(httpServer)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${userNoPermissionToken}`)
        .send(updateProductData);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 422 for invalid update data', async () => {
      const res = await request(httpServer)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(422);
      expect(res.body.data.message).toEqual('Validation failed');
      expect(res.body.data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'name', message: 'Product name cannot be empty' }),
          expect.objectContaining({
            path: 'variations.0.price',
            message: 'Preço deve ser positivo',
          }),
          expect.objectContaining({
            path: 'variations.0.stock_quantity',
            message: 'Estoque não pode ser negativo',
          }),
        ]),
      );
    });

    it('should update product successfully with admin token and valid data', async () => {
      const res = await request(httpServer)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateProductData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toEqual(updateProductData.name);
    });
  });
});
