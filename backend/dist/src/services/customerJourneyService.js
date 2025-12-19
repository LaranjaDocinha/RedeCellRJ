import pool from '../db/index.js';
import { emailService } from './emailService.js'; // Assuming email service exists
import { pushNotificationService } from './pushNotificationService.js'; // Assuming push notification service exists
export const customerJourneyService = {
    async getAllJourneys() {
        const result = await pool.query('SELECT * FROM customer_journeys ORDER BY name ASC');
        return result.rows;
    },
    async createJourney(payload) {
        const { name, trigger_segment, action_type, template_id, delay_days, is_active } = payload;
        const result = await pool.query('INSERT INTO customer_journeys (name, trigger_segment, action_type, template_id, delay_days, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, trigger_segment, action_type, template_id, delay_days, is_active]);
        return result.rows[0];
    },
    async getActiveJourneys() {
        const result = await pool.query('SELECT * FROM customer_journeys WHERE is_active = TRUE');
        return result.rows;
    },
    async processCustomerJourneys() {
        const activeJourneys = await this.getActiveJourneys();
        if (activeJourneys.length === 0) {
            console.log('No active customer journeys to process.');
            return;
        }
        for (const journey of activeJourneys) {
            // Find customers in the trigger segment that haven't been processed for this journey yet
            const customersToProcess = await pool.query(`SELECT c.id, c.name, c.email, c.phone 
         FROM customers c
         LEFT JOIN customer_journey_actions cja ON c.id = cja.customer_id AND cja.journey_id = $1
         WHERE c.rfm_segment = $2 AND cja.id IS NULL`, // Only process if not already in this journey
            [journey.id, journey.trigger_segment]);
            for (const customer of customersToProcess.rows) {
                const scheduledAt = new Date();
                scheduledAt.setDate(scheduledAt.getDate() + journey.delay_days);
                await pool.query('INSERT INTO customer_journey_actions (customer_id, journey_id, action_type, template_id, status, scheduled_at) VALUES ($1, $2, $3, $4, $5, $6)', [customer.id, journey.id, journey.action_type, journey.template_id, 'pending', scheduledAt]);
                console.log(`Scheduled ${journey.action_type} for customer ${customer.id} for journey ${journey.id}`);
            }
        }
        // Now, execute pending actions
        const pendingActions = await pool.query(`SELECT cja.*, c.email, c.phone, c.id as customer_id 
       FROM customer_journey_actions cja
       JOIN customers c ON cja.customer_id = c.id
       WHERE cja.status = 'pending' AND cja.scheduled_at <= NOW()`);
        for (const action of pendingActions.rows) {
            try {
                if (action.action_type === 'email') {
                    // Assuming template_id maps to a simple subject/body for now
                    await emailService.sendEmail(action.email, `Jornada: ${action.template_id}`, `Olá ${action.name}, ${action.template_id}`);
                }
                else if (action.action_type === 'whatsapp_message') {
                    // Assuming template_id is the message content for now
                    // Need actual WhatsApp integration for this
                    console.log(`Sending WhatsApp to ${action.phone}: ${action.template_id}`);
                }
                else if (action.action_type === 'push_notification') {
                    await pushNotificationService.sendNotificationToUser(action.customer_id, `Jornada: ${action.template_id}`, `Olá ${action.name}, ${action.template_id}`);
                }
                await pool.query('UPDATE customer_journey_actions SET status = $1, sent_at = NOW() WHERE id = $2', ['sent', action.id]);
                console.log(`Executed journey action ${action.id} for customer ${action.customer_id}`);
            }
            catch (error) {
                console.error(`Error executing journey action ${action.id}:`, error);
                await pool.query('UPDATE customer_journey_actions SET status = $1 WHERE id = $2', ['failed', action.id]);
            }
        }
    }
};
