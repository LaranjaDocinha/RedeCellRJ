import { getPool } from '../db/index.js';
import { surveyService } from './surveyService.js';
const pool = getPool();
class MarketingAutomationService {
    async createAutomation(name, trigger_type, trigger_config, steps) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const automationResult = await client.query('INSERT INTO automations (name, trigger_type, trigger_config) VALUES ($1, $2, $3) RETURNING *', [name, trigger_type, trigger_config]);
            const newAutomation = automationResult.rows[0];
            for (const step of steps) {
                await client.query('INSERT INTO automation_steps (automation_id, type, payload, order_index) VALUES ($1, $2, $3, $4)', [newAutomation.id, step.type, step.payload, step.order_index]);
            }
            await client.query('COMMIT');
            return newAutomation;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getAutomation(id) {
        const automationResult = await pool.query('SELECT * FROM automations WHERE id = $1', [id]);
        if (automationResult.rows.length === 0) {
            return null;
        }
        const automation = automationResult.rows[0];
        const stepsResult = await pool.query('SELECT * FROM automation_steps WHERE automation_id = $1 ORDER BY order_index ASC', [id]);
        automation.steps = stepsResult.rows;
        return automation;
    }
    async getAllAutomations() {
        const result = await pool.query('SELECT * FROM automations');
        return result.rows;
    }
    async updateAutomation(id, name, is_active, trigger_type, trigger_config, steps) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const automationResult = await client.query('UPDATE automations SET name = $1, is_active = $2, trigger_type = $3, trigger_config = $4, updated_at = current_timestamp WHERE id = $5 RETURNING *', [name, is_active, trigger_type, trigger_config, id]);
            const updatedAutomation = automationResult.rows[0];
            // Simple approach: delete all existing steps and recreate them
            await client.query('DELETE FROM automation_steps WHERE automation_id = $1', [id]);
            for (const step of steps) {
                await client.query('INSERT INTO automation_steps (automation_id, type, payload, order_index) VALUES ($1, $2, $3, $4)', [id, step.type, step.payload, step.order_index]);
            }
            await client.query('COMMIT');
            return updatedAutomation;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async processPendingRuns() {
        const runs = await pool.query("SELECT * FROM automation_runs WHERE status = 'active' AND next_step_due_at <= NOW()");
        for (const run of runs.rows) {
            const steps = await pool.query('SELECT * FROM automation_steps WHERE automation_id = $1 ORDER BY order_index ASC', [run.automation_id]);
            if (run.current_step >= steps.rows.length) {
                await pool.query("UPDATE automation_runs SET status = 'completed' WHERE id = $1", [run.id]);
                continue;
            }
            const currentStep = steps.rows[run.current_step];
            // Execute action
            switch (currentStep.type) {
                case 'wait':
                    break;
                case 'send_email':
                    // TODO: Implement email sending logic
                    console.log(`Sending email for automation run ${run.id}`);
                    break;
                case 'send_nps_survey':
                case 'send_csat_survey':
                    const surveyType = currentStep.type === 'send_nps_survey' ? 'NPS' : 'CSAT';
                    const saleId = run.trigger_payload?.sale_id;
                    if (saleId) {
                        await surveyService.sendSurveyRequest(run.customer_id, 'sale', saleId, surveyType);
                    }
                    break;
            }
            const nextStepIndex = run.current_step + 1;
            if (nextStepIndex >= steps.rows.length) {
                await pool.query("UPDATE automation_runs SET status = 'completed' WHERE id = $1", [run.id]);
            }
            else {
                await pool.query('UPDATE automation_runs SET current_step = $1 WHERE id = $2', [
                    nextStepIndex,
                    run.id,
                ]);
            }
        }
    }
    async handleEvent(eventName, eventPayload) {
        const automations = await pool.query('SELECT * FROM automations WHERE trigger_type = $1 AND is_active = true', [eventName]);
        for (const automation of automations.rows) {
            let shouldTrigger = true;
            if (automation.trigger_config?.product_ids) {
                const saleProductIds = new Set(eventPayload.items.map((item) => item.product_id));
                shouldTrigger = automation.trigger_config.product_ids.some((id) => saleProductIds.has(id));
            }
            if (shouldTrigger) {
                await pool.query('INSERT INTO automation_runs (automation_id, customer_id, status, current_step, trigger_payload) VALUES ($1, $2, $3, $4, $5)', [automation.id, eventPayload.sale.customerId, 'active', 0, eventPayload]);
            }
        }
    }
    async deleteAutomation(id) {
        const result = await pool.query('DELETE FROM automations WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
export const marketingAutomationService = new MarketingAutomationService();
