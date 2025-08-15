const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Appointments API', () => {
    let customerId;
    let technicianId;

    beforeAll(async () => {
        // Create a dummy customer and technician for testing
        const customerRes = await db.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', ['Appointment Customer', 'appointment@example.com']);
        customerId = customerRes.rows[0].id;

        const technicianRes = await db.query('INSERT INTO technicians (name, phone) VALUES ($1, $2) RETURNING id', ['Test Technician', '11987654321']);
        technicianId = technicianRes.rows[0].id;

        // Clear the appointments table before running tests
        await db.query('DELETE FROM appointments');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM appointments');
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        await db.query('DELETE FROM technicians WHERE id = $1', [technicianId]);
        await db.end();
    });

    it('should create a new appointment', async () => {
        const newAppointment = {
            customer_id: customerId,
            service_type: 'Diagnostic',
            appointment_date_time: '2024-09-10T10:00:00Z',
            notes: 'Initial diagnostic for device.',
            status: 'Pending',
            technician_id: technicianId
        };

        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.customer_id).toEqual(newAppointment.customer_id);
        expect(res.body.service_type).toEqual(newAppointment.service_type);
    });

    it('should get all appointments', async () => {
        // Create an appointment first
        await request(app)
            .post('/api/appointments')
            .send({ customer_id: customerId, service_type: 'Repair', appointment_date_time: '2024-09-11T11:00:00Z', notes: 'Screen repair.', status: 'Confirmed', technician_id: technicianId });

        const res = await request(app)
            .get('/api/appointments');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body.some(a => a.service_type === 'Repair')).toBe(true);
    });

    it('should get an appointment by ID', async () => {
        const newAppointment = {
            customer_id: customerId,
            service_type: 'Consultation',
            appointment_date_time: '2024-09-12T12:00:00Z',
            notes: 'Consultation for new laptop.',
            status: 'Pending',
            technician_id: technicianId
        };
        const createRes = await request(app)
            .post('/api/appointments')
            .send(newAppointment);
        const appointmentId = createRes.body.id;

        const getRes = await request(app)
            .get(`/api/appointments/${appointmentId}`);

        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.id).toEqual(appointmentId);
        expect(getRes.body.service_type).toEqual(newAppointment.service_type);
    });

    it('should update an appointment', async () => {
        const newAppointment = {
            customer_id: customerId,
            service_type: 'Update Test',
            appointment_date_time: '2024-09-13T13:00:00Z',
            notes: 'Initial notes.',
            status: 'Pending',
            technician_id: technicianId
        };
        const createRes = await request(app)
            .post('/api/appointments')
            .send(newAppointment);
        const appointmentId = createRes.body.id;

        const updatedData = {
            service_type: 'Updated Service',
            status: 'Confirmed'
        };

        const updateRes = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .send(updatedData);

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.service_type).toEqual(updatedData.service_type);
        expect(updateRes.body.status).toEqual(updatedData.status);
    });

    it('should delete an appointment', async () => {
        const newAppointment = {
            customer_id: customerId,
            service_type: 'Delete Test',
            appointment_date_time: '2024-09-14T14:00:00Z',
            notes: 'To be deleted.',
            status: 'Pending',
            technician_id: technicianId
        };
        const createRes = await request(app)
            .post('/api/appointments')
            .send(newAppointment);
        const appointmentId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/api/appointments/${appointmentId}`);

        expect(deleteRes.statusCode).toEqual(204); // No Content for successful deletion

        const getRes = await request(app)
            .get(`/api/appointments/${appointmentId}`);
        expect(getRes.statusCode).toEqual(404); // Should not be found after deletion
    });

    it('should check technician availability', async () => {
        // Create an overlapping appointment
        await request(app)
            .post('/api/appointments')
            .send({ customer_id: customerId, service_type: 'Busy', appointment_date_time: '2024-09-15T09:00:00Z', notes: 'Busy slot', status: 'Confirmed', technician_id: technicianId });

        const res = await request(app)
            .get(`/api/appointments/check-availability`)
            .query({ technician_id: technicianId, start_time: '2024-09-15T08:00:00Z', end_time: '2024-09-15T10:00:00Z' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('isAvailable');
        expect(res.body.isAvailable).toBe(false); // Should be false due to overlap
    });
});
