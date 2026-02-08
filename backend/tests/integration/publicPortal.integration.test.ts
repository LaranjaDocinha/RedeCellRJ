import request from 'supertest';
import { app } from '../../src/app.js'; // A app Express
import { getPool } from '../../src/db/index.js'; // Para interagir diretamente com o banco
import { v4 as uuidv4 } from 'uuid'; // Para gerar UUIDs para usuários

// Funções auxiliares para seed e cleanup
async function seedTestCustomerAndServiceOrder(
  pool: any,
  customerData: any,
  serviceOrderData: any,
) {
  // Criar Customer
  const customerRes = await pool.query(
    'INSERT INTO customers (name, email, phone, cpf) VALUES ($1, $2, $3, $4) RETURNING id',
    [customerData.name, customerData.email, customerData.phone, customerData.cpf],
  );
  const customerId = customerRes.rows[0].id;

  // Criar Branch
  const branchRes = await pool.query(
    'INSERT INTO branches (name, address) VALUES ($1, $2) RETURNING id',
    [`Test Branch ${uuidv4()}`, 'Test Address'],
  );
  const branchId = branchRes.rows[0].id;

  // Criar User (para associar à OS, se necessário)
  const userId = uuidv4();
  await pool.query(
    'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id',
    [userId, 'Test User', `testuser-${uuidv4()}@example.com`, 'hashedpassword'],
  );

  // Criar Service Order
  const serviceOrderRes = await pool.query(
    `INSERT INTO service_orders (
        customer_id, branch_id, user_id, product_description, issue_description, estimated_cost,
        public_token, customer_approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, public_token`,
    [
      customerId,
      branchId,
      userId,
      serviceOrderData.device_name,
      serviceOrderData.problem_description,
      serviceOrderData.estimated_cost,
      serviceOrderData.public_token,
      serviceOrderData.customer_approval_status,
    ],
  );
  const serviceOrderId = serviceOrderRes.rows[0].id;
  const publicToken = serviceOrderRes.rows[0].public_token;

  return { customerId, serviceOrderId, publicToken, userId, branchId };
}

async function cleanupTestCustomerAndServiceOrder(
  pool: any,
  customerId: number,
  serviceOrderId: number,
) {
  await pool.query('DELETE FROM service_orders WHERE id = $1', [serviceOrderId]);
  await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
  // Note: user and branch cleanup would depend on if they are shared or dedicated for tests
}

describe('Public Portal Integration Tests', () => {
  let pool: any;
  let customerId: number;
  let serviceOrderId: number;
  let publicToken: string;
  let testUserEmail: string;

  beforeAll(async () => {
    pool = getPool();
    // Certifique-se de que o usuário admin exista para o token (se testar rotas protegidas)
    // Para rotas publicas, não precisa de authToken
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    testUserEmail = `testuser-${uuidv4()}@example.com`; // Gerar um email único para cada teste

    const result = await seedTestCustomerAndServiceOrder(
      pool,
      {
        name: 'Test Customer',
        email: testUserEmail,
        phone: '5511987654321',
        cpf: '123.456.789-00',
      },
      {
        device_name: 'Test Device',
        problem_description: 'Test Problem',
        estimated_cost: 150.0,
        public_token: uuidv4(), // Gera um token único
        customer_approval_status: 'pending',
      },
    );
    customerId = result.customerId;
    serviceOrderId = result.serviceOrderId;
    publicToken = result.publicToken;
  });

  afterEach(async () => {
    await cleanupTestCustomerAndServiceOrder(pool, customerId, serviceOrderId);
  });

  it('should authenticate customer and return a token for valid OS ID and CPF', async () => {
    const res = await request(app)
      .post('/api/portal/auth')
      .send({ osId: serviceOrderId, identity: '12345678900' }) // CPF sem formatação
      .expect(200);

    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.token).toBe(publicToken); // Deve retornar o token já gerado
  });

  it('should authenticate customer and return a token for valid OS ID and Phone', async () => {
    const res = await request(app)
      .post('/api/portal/auth')
      .send({ osId: serviceOrderId, identity: '987654321' }) // Parte do telefone
      .expect(200);

    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.token).toBe(publicToken);
  });

  it('should return 401 for invalid OS ID or identity', async () => {
    await request(app)
      .post('/api/portal/auth')
      .send({ osId: 99999, identity: 'invalid' })
      .expect(401);
  });

  it('should get service order details by public token', async () => {
    const res = await request(app).get(`/api/portal/orders/${publicToken}`).expect(200);

    expect(res.body.data).toHaveProperty('id', serviceOrderId);
    expect(res.body.data).toHaveProperty('product_description', 'Test Device');
    expect(res.body.data).toHaveProperty('customer_approval_status', 'pending');
  });

  it('should return 404 for invalid public token', async () => {
    await request(app)
      .get(`/api/portal/orders/${uuidv4()}`) // Token inválido
      .expect(404);
  });

  it('should approve service order budget', async () => {
    const res = await request(app)
      .post(`/api/portal/orders/${publicToken}/approval`)
      .send({ status: 'approved', feedback: 'Cliente aprovou o orçamento.' })
      .expect(200);

    expect(res.body.data).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('newStatus', 'approved');

    // Verificar no banco
    const { rows } = await pool.query(
      'SELECT customer_approval_status, status FROM service_orders WHERE id = $1',
      [serviceOrderId],
    );
    expect(rows[0].customer_approval_status).toBe('approved');
    expect(rows[0].status).toBe('Aprovado'); // O serviço move para Aprovado
  });

  it('should reject service order budget', async () => {
    const res = await request(app)
      .post(`/api/portal/orders/${publicToken}/approval`)
      .send({ status: 'rejected', feedback: 'Custo muito alto.' })
      .expect(200);

    expect(res.body.data).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('newStatus', 'rejected');

    // Verificar no banco
    const { rows } = await pool.query(
      'SELECT customer_approval_status, status FROM service_orders WHERE id = $1',
      [serviceOrderId],
    );
    expect(rows[0].customer_approval_status).toBe('rejected');
    expect(rows[0].status).toBe('Não Aprovado'); // O serviço move para Não Aprovado
  });

  it('should return 400 if trying to approve/reject an already finalized order', async () => {
    // Atualizar status da OS para finalizado
    await pool.query("UPDATE service_orders SET status = 'Finalizado' WHERE id = $1", [
      serviceOrderId,
    ]);

    await request(app)
      .post(`/api/portal/orders/${publicToken}/approval`)
      .send({ status: 'approved' })
      .expect(400);
  });
});
