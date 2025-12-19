import request from 'supertest';
import { app, httpServer } from '../../src/app';
import { getPool } from '../../src/db/index';
import { setupTestCleanup } from '../setupTestCleanup';
import { v4 as uuidv4 } from 'uuid';

describe('Diagnostic API', () => {
  let adminToken: string;
  let server: any;
  let rootNodeId: string;
  let childNodeId: string;
  let optionId: string;


  setupTestCleanup();

  beforeAll(async () => {
    server = httpServer.listen(4007); // Start the server for tests
    const pool = getPool();

    // Get an admin token
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pdv.com', password: 'admin123' });
    adminToken = authRes.body.token;

    // Seed diagnostic nodes
    const rootNodeRes = await pool.query(
      `INSERT INTO diagnostic_nodes (question_text, is_solution, solution_details, parent_node_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Is the device turning on?', false, null, null],
    );
    rootNodeId = rootNodeRes.rows[0].id;

    const childNodeRes = await pool.query(
      `INSERT INTO diagnostic_nodes (question_text, is_solution, solution_details, parent_node_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Does the screen light up?', false, null, rootNodeId],
    );
    childNodeId = childNodeRes.rows[0].id;

    const optionRes = await pool.query(
      `INSERT INTO diagnostic_node_options (node_id, option_text, next_node_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [rootNodeId, 'Yes', childNodeId],
    );
    optionId = optionRes.rows[0].id;
  });

  afterAll(async () => {
    const pool = getPool();
    // Clean up diagnostic data
    await pool.query('DELETE FROM diagnostic_feedback');
    await pool.query('DELETE FROM diagnostic_history');
    await pool.query('DELETE FROM diagnostic_node_options');
    await pool.query('DELETE FROM diagnostic_nodes');
    await server.close(); // Close the server after all tests
  });

  describe('GET /api/diagnostics/root', () => {
    it('should return root diagnostic nodes', async () => {
      const res = await request(app)
        .get('/api/diagnostics/root')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('question_text');
    });

    it('should return empty array if no root nodes', async () => {
      const pool = getPool();
      await pool.query('DELETE FROM diagnostic_nodes WHERE parent_node_id IS NULL'); // Temporarily remove root nodes

      const res = await request(app)
        .get('/api/diagnostics/root')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);

      // Re-seed root node for other tests
      await pool.query(
        `INSERT INTO diagnostic_nodes (question_text, is_solution, solution_details, parent_node_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Is the device turning on?', false, null, null],
      );
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/diagnostics/root');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/diagnostics/:nodeId/children', () => {
    it('should return child nodes for a valid node ID', async () => {
      const res = await request(app)
        .get(`/api/diagnostics/${rootNodeId}/children`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].parent_node_id).toEqual(rootNodeId);
    });

    it('should return empty array if no children for node ID', async () => {
      const res = await request(app)
        .get(`/api/diagnostics/${childNodeId}/children`) // Child node has no children
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it('should return 400 for invalid node ID format', async () => {
      const res = await request(app)
        .get('/api/diagnostics/invalid-uuid/children')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/diagnostics/${rootNodeId}/children`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/diagnostics/:nodeId/options', () => {
    it('should return options for a valid node ID', async () => {
      const res = await request(app)
        .get(`/api/diagnostics/${rootNodeId}/options`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].diagnostic_node_id).toEqual(parseInt(rootNodeId, 10));
    });

    it('should return empty array if no options for node ID', async () => {
      const pool = getPool();
      const tempNodeRes = await pool.query(
        `INSERT INTO diagnostic_nodes (question_text, is_solution, solution_details, parent_node_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Node with no options', false, null, null],
      );
      const tempNodeId = tempNodeRes.rows[0].id;

      const res = await request(app)
        .get(`/api/diagnostics/${tempNodeId}/options`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it('should return 400 for invalid node ID format', async () => {
      const res = await request(app)
        .get('/api/diagnostics/invalid-uuid/options')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/diagnostics/${rootNodeId}/options`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/diagnostics/feedback', () => {
    it('should submit feedback successfully with status 201', async () => {
      const res = await request(app)
        .post('/api/diagnostics/feedback')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nodeId: rootNodeId, isHelpful: true, comments: 'Very helpful!' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Feedback submitted successfully');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/diagnostics/feedback')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nodeId: 'invalid', isHelpful: 'not-boolean' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/diagnostics/feedback')
        .send({ nodeId: rootNodeId, isHelpful: true });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/diagnostics/history', () => {
    it('should record history successfully with status 201', async () => {
      const sessionId = uuidv4();
      const res = await request(app)
        .post('/api/diagnostics/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sessionId, nodeId: rootNodeId, selectedOptionId: optionId });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Diagnostic history recorded successfully');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/diagnostics/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sessionId: 'invalid', nodeId: rootNodeId });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      const sessionId = uuidv4();
      const res = await request(app)
        .post('/api/diagnostics/history')
        .send({ sessionId, nodeId: rootNodeId });

      expect(res.statusCode).toEqual(401);
    });
  });
});
