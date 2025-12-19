import request from 'supertest';
import { app } from '../../src/app.js';
import { getPool } from '../../src/db';
import { seedCustomer, cleanupCustomer } from '../utils/seedTestData';

describe('Store Credit Controller', () => {
  let authToken: string;
  let customerId: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' })
      .expect(200);
    authToken = loginRes.body.token;
  });

  beforeEach(async () => {
    customerId = await seedCustomer();
  });

  afterEach(async () => {
    await cleanupCustomer(customerId);
  });

  it('should add store credit to a customer', async () => {
    const amount = 100.0;
    const reason = 'Bonus credit';

    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/add`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount, reason })
      .expect(201);

    expect(res.body.transaction).toBeDefined();
    expect(parseFloat(res.body.transaction.amount)).toBe(amount);
    const { rows } = await getPool().query(
      'SELECT store_credit_balance FROM customers WHERE id = $1',
      [customerId],
    );
    expect(parseFloat(rows[0].store_credit_balance)).toBe(amount);
  });

  it('should debit store credit from a customer', async () => {
    const initialAmount = 100.0;
    const debitAmount = 50.0;
    const reason = 'Purchase';

    await getPool().query('UPDATE customers SET store_credit_balance = $1 WHERE id = $2', [
      initialAmount,
      customerId,
    ]);

    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/debit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: debitAmount, reason })
      .expect(201);

    expect(res.body.transaction).toBeDefined();
    expect(parseFloat(res.body.transaction.amount)).toBe(debitAmount);
    expect(parseFloat(res.body.customer.store_credit_balance)).toBe(initialAmount - debitAmount);

    const { rows } = await getPool().query(
      'SELECT store_credit_balance FROM customers WHERE id = $1',
      [customerId],
    );
    expect(parseFloat(rows[0].store_credit_balance)).toBe(initialAmount - debitAmount);
  });

  it('should not debit store credit if insufficient balance', async () => {
    const initialAmount = 20.0;
    const debitAmount = 50.0;
    const reason = 'Attempted purchase';

    await getPool().query('UPDATE customers SET store_credit_balance = $1 WHERE id = $2', [
      initialAmount,
      customerId,
    ]);

    const res = await request(app)
      .post(`/api/customers/${customerId}/credit/debit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: debitAmount, reason })
      .expect(400);

    expect(res.body.message).toBe('Insufficient store credit balance.');

    const { rows } = await getPool().query(
      'SELECT store_credit_balance FROM customers WHERE id = $1',
      [customerId],
    );
    expect(parseFloat(rows[0].store_credit_balance)).toBe(initialAmount);
  });

  it('should get store credit history for a customer', async () => {
    const addAmount = 75.0;
    const debitAmount = 25.0;

    await getPool().query('DELETE FROM store_credit_transactions WHERE customer_id = $1', [
      customerId,
    ]);
    await getPool().query('UPDATE customers SET store_credit_balance = $1 WHERE id = $2', [
      0,
      customerId,
    ]);

    // Add some transactions
    await request(app)
      .post(`/api/customers/${customerId}/credit/add`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: addAmount, reason: 'Test add' });

    await request(app)
      .post(`/api/customers/${customerId}/credit/debit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: debitAmount, reason: 'Test debit' });

    const res = await request(app)
      .get(`/api/customers/${customerId}/credit/history`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(parseFloat(res.body.balance)).toBe(addAmount - debitAmount);
    expect(res.body.history).toBeInstanceOf(Array);
    expect(res.body.history.length).toBe(2);
    expect(res.body.history[0].type).toBe('debit'); // Most recent first
    expect(res.body.history[1].type).toBe('credit');
  });
});
