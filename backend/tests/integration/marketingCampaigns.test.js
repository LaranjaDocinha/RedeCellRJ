const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Marketing Campaigns API', () => {
    let userId;

    beforeAll(async () => {
        // Create a dummy user for testing
        const userRes = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id', ['Campaign User', 'campaign@example.com', 'hashed_password', 'admin']);
        userId = userRes.rows[0].id;

        // Clear the marketing_campaigns table before running tests
        await db.query('DELETE FROM marketing_campaigns');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM marketing_campaigns');
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await db.end();
    });

    it('should create a new marketing campaign', async () => {
        const newCampaign = {
            name: 'Campanha de Boas-Vindas',
            type: 'Email',
            message_template: 'Bem-vindo ao nosso serviço!',
            created_by_user_id: userId,
            status: 'Draft'
        };

        const res = await request(app)
            .post('/api/marketing-campaigns')
            .send(newCampaign);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual(newCampaign.name);
        expect(res.body.type).toEqual(newCampaign.type);
    });

    it('should get all marketing campaigns', async () => {
        // Create a campaign first
        await request(app)
            .post('/api/marketing-campaigns')
            .send({ name: 'Campanha de Natal', type: 'SMS', message_template: 'Feliz Natal!', created_by_user_id: userId, status: 'Draft' });

        const res = await request(app)
            .get('/api/marketing-campaigns');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body.some(c => c.name === 'Campanha de Natal')).toBe(true);
    });

    it('should get a marketing campaign by ID', async () => {
        const newCampaign = {
            name: 'Campanha de Verão',
            type: 'Email',
            message_template: 'Aproveite o verão!',
            created_by_user_id: userId,
            status: 'Draft'
        };
        const createRes = await request(app)
            .post('/api/marketing-campaigns')
            .send(newCampaign);
        const campaignId = createRes.body.id;

        const getRes = await request(app)
            .get(`/api/marketing-campaigns/${campaignId}`);

        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.id).toEqual(campaignId);
        expect(getRes.body.name).toEqual(newCampaign.name);
    });

    it('should update a marketing campaign', async () => {
        const newCampaign = {
            name: 'Campanha para Atualizar',
            type: 'Email',
            message_template: 'Mensagem antiga.',
            created_by_user_id: userId,
            status: 'Draft'
        };
        const createRes = await request(app)
            .post('/api/marketing-campaigns')
            .send(newCampaign);
        const campaignId = createRes.body.id;

        const updatedData = {
            name: 'Campanha Atualizada',
            message_template: 'Mensagem nova.',
            status: 'Scheduled'
        };

        const updateRes = await request(app)
            .put(`/api/marketing-campaigns/${campaignId}`)
            .send(updatedData);

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.name).toEqual(updatedData.name);
        expect(updateRes.body.message_template).toEqual(updatedData.message_template);
        expect(updateRes.body.status).toEqual(updatedData.status);
    });

    it('should delete a marketing campaign', async () => {
        const newCampaign = {
            name: 'Campanha para Excluir',
            type: 'SMS',
            message_template: 'Esta será excluída.',
            created_by_user_id: userId,
            status: 'Draft'
        };
        const createRes = await request(app)
            .post('/api/marketing-campaigns')
            .send(newCampaign);
        const campaignId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/api/marketing-campaigns/${campaignId}`);

        expect(deleteRes.statusCode).toEqual(204); // No Content for successful deletion

        const getRes = await request(app)
            .get(`/api/marketing-campaigns/${campaignId}`);
        expect(getRes.statusCode).toEqual(404); // Should not be found after deletion
    });
});
