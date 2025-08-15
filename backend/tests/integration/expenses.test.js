const request = require('supertest');
const app = require('../../index'); // Ajuste o caminho para o seu arquivo principal do Express
const pool = require('../../db');
const jwt = require('jsonwebtoken');

let adminToken;
let testUser;
let testExpense;

describe('Expenses API', () => {

  beforeAll(async () => {
    // 1. Limpar dados de teste anteriores
    await pool.query("DELETE FROM expenses WHERE description LIKE 'Teste%';");
    await pool.query("DELETE FROM users WHERE email = 'admin-expenses@test.com';");

    // 2. Criar um usuário admin para os testes
    const hashedPassword = await require('bcryptjs').hash('password123', 10);
    const adminRoleResult = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
    if (adminRoleResult.rows.length === 0) {
      throw new Error('O papel de admin não foi encontrado. Execute as migrações e seeds.');
    }
    const adminRoleId = adminRoleResult.rows[0].id;

    const userResult = await pool.query(
      'INSERT INTO users (name, email, password, role_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['Admin Expenses Test', 'admin-expenses@test.com', hashedPassword, adminRoleId, true]
    );
    testUser = userResult.rows[0];

    // 3. Gerar um token JWT para o usuário admin
    adminToken = jwt.sign({ user: { id: testUser.id, role: 'admin' } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  // Teste de criação de despesa
  describe('POST /api/expenses', () => {
    it('should create a new expense and return 201', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Teste de Despesa - Compra de Material',
          amount: 150.75,
          expense_date: '2025-08-11',
          category: 'Material de Escritório',
          user_id: testUser.id
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Despesa criada com sucesso!');
      expect(res.body).toHaveProperty('expense');
      expect(res.body.expense).toHaveProperty('id');
      testExpense = res.body.expense; // Salva para usar em outros testes
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Despesa incompleta' });
      expect(res.statusCode).toEqual(400);
    });
  });

  // Teste de listagem de despesas
  describe('GET /api/expenses', () => {
    it('should return a list of expenses', async () => {
      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('expenses');
      expect(Array.isArray(res.body.expenses)).toBe(true);
      expect(res.body.expenses.length).toBeGreaterThan(0);
    });
  });

  // Teste de busca de despesa por ID
  describe('GET /api/expenses/:id', () => {
    it('should return a single expense by its ID', async () => {
      const res = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', testExpense.id);
      expect(res.body).toHaveProperty('description', 'Teste de Despesa - Compra de Material');
    });

    it('should return 404 for a non-existent expense ID', async () => {
      const res = await request(app)
        .get('/api/expenses/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // Teste de atualização de despesa
  describe('PUT /api/expenses/:id', () => {
    it('should update an existing expense and return 200', async () => {
      const res = await request(app)
        .put(`/api/expenses/${testExpense.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Teste de Despesa - Atualizada',
          amount: 200.00,
          category: 'Material de Limpeza'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Despesa atualizada com sucesso!');
      expect(res.body.expense).toHaveProperty('description', 'Teste de Despesa - Atualizada');
      expect(res.body.expense.amount).toBe('200.00');
    });
  });

  // Teste de exclusão de despesa
  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense and return 204', async () => {
      const res = await request(app)
        .delete(`/api/expenses/${testExpense.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(204);
    });

    it('should return 404 when trying to get the deleted expense', async () => {
      const res = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  afterAll(async () => {
    // Limpar dados criados
    await pool.query("DELETE FROM expenses WHERE description LIKE 'Teste%';");
    await pool.query("DELETE FROM users WHERE email = 'admin-expenses@test.com';");
    pool.end();
  });
});
