const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Checklist Templates API', () => {
    beforeAll(async () => {
        // Clear the checklist_templates table before running tests
        await db.query('DELETE FROM checklist_templates');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM checklist_templates');
        await db.end();
    });

    it('should create a new checklist template', async () => {
        const newTemplate = {
            name: 'Pré-reparo de Celular',
            description: 'Checklist para inspeção inicial de celulares.',
            category: 'Celular'
        };

        const res = await request(app)
            .post('/api/checklist-templates')
            .send(newTemplate);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual(newTemplate.name);
        expect(res.body.category).toEqual(newTemplate.category);
    });

    it('should get all checklist templates', async () => {
        // Create a template first
        await request(app)
            .post('/api/checklist-templates')
            .send({ name: 'Pós-reparo de Notebook', description: 'Checklist final para notebooks.', category: 'Notebook' });

        const res = await request(app)
            .get('/api/checklist-templates');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body.some(t => t.name === 'Pós-reparo de Notebook')).toBe(true);
    });

    it('should get a checklist template by ID', async () => {
        const newTemplate = {
            name: 'Checklist de Entrega',
            description: 'Checklist para entrega de equipamento.',
            category: 'Geral'
        };
        const createRes = await request(app)
            .post('/api/checklist-templates')
            .send(newTemplate);
        const templateId = createRes.body.id;

        const getRes = await request(app)
            .get(`/api/checklist-templates/${templateId}`);

        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.id).toEqual(templateId);
        expect(getRes.body.name).toEqual(newTemplate.name);
    });

    it('should update a checklist template', async () => {
        const newTemplate = {
            name: 'Checklist de Teste',
            description: 'Descrição inicial.',
            category: 'Teste'
        };
        const createRes = await request(app)
            .post('/api/checklist-templates')
            .send(newTemplate);
        const templateId = createRes.body.id;

        const updatedData = {
            name: 'Checklist de Teste Atualizado',
            description: 'Descrição atualizada.',
            category: 'Atualizado'
        };

        const updateRes = await request(app)
            .put(`/api/checklist-templates/${templateId}`)
            .send(updatedData);

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.name).toEqual(updatedData.name);
        expect(updateRes.body.description).toEqual(updatedData.description);
    });

    it('should delete a checklist template', async () => {
        const newTemplate = {
            name: 'Checklist para Excluir',
            description: 'Este será excluído.',
            category: 'Exclusão'
        };
        const createRes = await request(app)
            .post('/api/checklist-templates')
            .send(newTemplate);
        const templateId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/api/checklist-templates/${templateId}`);

        expect(deleteRes.statusCode).toEqual(204); // No Content for successful deletion

        const getRes = await request(app)
            .get(`/api/checklist-templates/${templateId}`);
        expect(getRes.statusCode).toEqual(404); // Should not be found after deletion
    });
});
