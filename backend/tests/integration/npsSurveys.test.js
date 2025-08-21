const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('NPS Surveys API', () => {
    let customerId;

    beforeAll(async () => {
        // Create a dummy customer for testing
        const customerRes = await db.query('INSERT INTO customers (name, email, branch_id) VALUES ($1, $2, $3) RETURNING id', ['NPS Customer', 'nps@example.com', 1]);
        customerId = customerRes.rows[0].id;

        // Clear the nps_surveys table before running tests
        await db.query('DELETE FROM nps_surveys');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM nps_surveys');
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
    });

    it('should create a new NPS survey response', async () => {
        const newSurvey = {
            customer_id: customerId,
            score: 9,
            feedback_text: 'Ótimo serviço!',
            source: 'Email'
        };

        const res = await request(app)
            .post('/api/nps-surveys')
            .send(newSurvey);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.customer_id).toEqual(newSurvey.customer_id);
        expect(res.body.score).toEqual(newSurvey.score);
    });

    it('should get all NPS survey responses', async () => {
        // Create a survey first
        await request(app)
            .post('/api/nps-surveys')
            .send({ customer_id: customerId, score: 7, feedback_text: 'Poderia ser melhor.', source: 'SMS' });

        const res = await request(app)
            .get('/api/nps-surveys');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body.some(s => s.score === 7)).toBe(true);
    });

    it('should get a NPS survey response by ID', async () => {
        const newSurvey = {
            customer_id: customerId,
            score: 10,
            feedback_text: 'Excelente!',
            source: 'Web'
        };
        const createRes = await request(app)
            .post('/api/nps-surveys')
            .send(newSurvey);
        const surveyId = createRes.body.id;

        const getRes = await request(app)
            .get(`/api/nps-surveys/${surveyId}`);

        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.id).toEqual(surveyId);
        expect(getRes.body.score).toEqual(newSurvey.score);
    });

    it('should update a NPS survey response', async () => {
        const newSurvey = {
            customer_id: customerId,
            score: 5,
            feedback_text: 'Regular.',
            source: 'In-store'
        };
        const createRes = await request(app)
            .post('/api/nps-surveys')
            .send(newSurvey);
        const surveyId = createRes.body.id;

        const updatedData = {
            score: 6,
            feedback_text: 'Melhorou um pouco.'
        };

        const updateRes = await request(app)
            .put(`/api/nps-surveys/${surveyId}`)
            .send(updatedData);

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.score).toEqual(updatedData.score);
        expect(updateRes.body.feedback_text).toEqual(updatedData.feedback_text);
    });

    it('should delete a NPS survey response', async () => {
        const newSurvey = {
            customer_id: customerId,
            score: 0,
            feedback_text: 'Péssimo.',
            source: 'Email'
        };
        const createRes = await request(app)
            .post('/api/nps-surveys')
            .send(newSurvey);
        const surveyId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/api/nps-surveys/${surveyId}`);

        expect(deleteRes.statusCode).toEqual(204); // No Content for successful deletion

        const getRes = await request(app)
            .get(`/api/nps-surveys/${surveyId}`);
        expect(getRes.statusCode).toEqual(404); // Should not be found after deletion
    });

    it('should calculate NPS score', async () => {
        // Clear existing surveys and add specific scores for NPS calculation
        await db.query('DELETE FROM nps_surveys');
        await request(app).post('/api/nps-surveys').send({ customer_id: customerId, score: 9, source: 'Test' }); // Promoter
        await request(app).post('/api/nps-surveys').send({ customer_id: customerId, score: 10, source: 'Test' }); // Promoter
        await request(app).post('/api/nps-surveys').send({ customer_id: customerId, score: 7, source: 'Test' }); // Passive
        await request(app).post('/api/nps-surveys').send({ customer_id: customerId, score: 6, source: 'Test' }); // Passive
        await request(app).post('/api/nps-surveys').send({ customer_id: customerId, score: 2, source: 'Test' }); // Detractor

        const res = await request(app)
            .get('/api/nps-surveys/calculate-nps'); // Assuming this route will be implemented

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('npsScore');
        expect(res.body.npsScore).toEqual(40); // (2 Promoters - 1 Detractor) / 5 Total * 100 = 40
    });
});
