import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { seedBranch, seedProduct, seedStock, seedCustomer } from '../utils/seedTestData.js';
import { getPool } from '../../src/db/index.js';
import { getAdminAuthToken } from '../utils/auth.js';

describe('Enterprise Features - Integration', () => {
  let adminToken: string;
  let adminId: string;
  let testBranchId: number;
  let testProductId: number;
  let testVariantId: number;
  let testCustomerId: number;

  beforeAll(async () => {
    adminToken = await getAdminAuthToken();
    const pool = getPool();
    const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@pdv.com'");
    adminId = adminRes.rows[0].id;
  });

  beforeEach(async () => {
    const pool = getPool();
    testBranchId = await seedBranch(pool);
    const { productId, variationId } = await seedProduct(testBranchId, pool);
    testProductId = productId;
    testVariantId = variationId;
    await seedStock(pool, testVariantId.toString(), testBranchId.toString(), 10);
    testCustomerId = await seedCustomer(pool);
  });

  it('1.1. Cashback: should credit 1% cashback to customer wallet on sale', async () => {
    const pool = getPool();
    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 200,
      payment_type: 'cash',
      payments: [{ method: 'cash', amount: 200 }],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 200,
          total_price: 200,
        },
      ],
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    expect(res.statusCode).toEqual(201);

    // Verificar se a transação de cashback foi criada (1% de 200 = 2)
    const walletRes = await pool.query('SELECT store_credit_balance FROM customers WHERE id = $1', [
      testCustomerId,
    ]);
    expect(Number(walletRes.rows[0].store_credit_balance)).toBe(2);

    const txnRes = await pool.query(
      'SELECT * FROM store_credit_transactions WHERE customer_id = $1 AND type = $2',
      [testCustomerId, 'credit'],
    );
    expect(txnRes.rows.length).toBe(1);
    expect(Number(txnRes.rows[0].amount)).toBe(2);
  });

  it('1.2. Commissions: should record commission for the seller', async () => {
    const pool = getPool();

    // Criar regra de comissão: 10% para vendas
    await pool.query(
      'INSERT INTO commission_rules (user_id, percentage, type, fixed_value) VALUES ($1, $2, $3, $4)',
      [adminId, 10, 'sale', 0],
    );

    const saleData = {
      branchId: testBranchId,
      customerId: testCustomerId,
      total_amount: 100,
      payment_type: 'cash',
      payments: [{ method: 'cash', amount: 100 }],
      items: [
        {
          product_id: testProductId,
          variation_id: testVariantId,
          quantity: 1,
          unit_price: 100,
          total_price: 100,
        },
      ],
    };

    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(saleData);

    // Verificar se a comissão foi registrada (10% de 100 = 10)
    const commissionRes = await pool.query('SELECT * FROM commissions_earned WHERE user_id = $1', [
      adminId,
    ]);
    expect(commissionRes.rows.length).toBeGreaterThan(0);
    expect(Number(commissionRes.rows[0].commission_amount)).toBe(10);
  });

  it('3.1. Audit Trail: should log field changes when updating OS status', async () => {
    const pool = getPool();

    // 1. Criar uma OS
    const osRes = await pool.query(
      `INSERT INTO service_orders (customer_id, product_description, status, branch_id, user_id, brand, issue_description, services, estimated_cost) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        testCustomerId,
        'Audit Phone',
        'Aguardando Avaliação',
        testBranchId,
        adminId,
        'Apple',
        'Test',
        '[]',
        100,
      ],
    );
    const osId = osRes.rows[0].id;

    // 2. Mudar status via API (Usando newStatus como esperado pelo controller)
    await request(app)
      .patch(`/api/service-orders/${osId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStatus: 'Em Reparo' });

    // 3. Verificar logs de auditoria (Usando tabela audit_logs)
    const auditRes = await pool.query(
      "SELECT * FROM audit_logs WHERE entity_type = 'service_orders' AND entity_id = $1 AND action = 'UPDATE'",
      [String(osId)],
    );

    expect(auditRes.rows.length).toBeGreaterThan(0);
    const lastAudit = auditRes.rows[auditRes.rows.length - 1];
    expect(lastAudit.old_values.status).toBe('Aguardando Avaliação');
    expect(lastAudit.new_values.status).toBe('Em Reparo');
  });
});
