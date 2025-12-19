import pool from '../db/index.js';
import jwt from 'jsonwebtoken';
import { emailService } from './emailService.js';
import { AppError } from '../utils/errors.js';
const SURVEY_JWT_SECRET = process.env.SURVEY_JWT_SECRET || 'a-very-secret-key-for-surveys';
class SurveyService {
    /**
     * Generates a survey link and sends it to the customer.
     */
    async sendSurveyRequest(customerId, sourceType, sourceId, surveyType) {
        const customerRes = await pool.query('SELECT email, name FROM customers WHERE id = $1', [
            customerId,
        ]);
        if (customerRes.rows.length === 0) {
            throw new AppError('Customer not found to send survey', 404);
        }
        const customer = customerRes.rows[0];
        const payload = { customerId, sourceType, sourceId, surveyType };
        const token = jwt.sign(payload, SURVEY_JWT_SECRET, { expiresIn: '30d' });
        // In a real app, this URL would point to the frontend survey page
        const surveyUrl = `http://localhost:3001/survey?token=${token}`;
        const subject = `How did we do with your recent ${sourceType.replace('_', ' ')}?`;
        const body = `
      <p>Hi ${customer.name},</p>
      <p>We'd love to get your feedback on your recent experience.</p>
      <p><a href="${surveyUrl}">Click here to start the survey</a></p>
      <p>Thanks,<br/>The Team</p>
    `;
        await emailService.sendEmail(customer.email, subject, body);
        console.log(`Survey request sent to customer ${customerId} for ${sourceType} ${sourceId}`);
    }
    /**
     * Validates a token and records a survey response.
     */
    async recordSurveyResponse(token, score, comment) {
        let payload;
        try {
            payload = jwt.verify(token, SURVEY_JWT_SECRET);
        }
        catch (error) {
            throw new AppError('Invalid or expired survey token', 400);
        }
        const { customerId, sourceType, sourceId, surveyType } = payload;
        // Check if a survey for this source has already been submitted
        const existingResponse = await pool.query('SELECT id FROM survey_responses WHERE source_type = $1 AND source_id = $2', [sourceType, sourceId]);
        if (existingResponse.rows.length > 0) {
            throw new AppError('Survey already submitted for this event', 409);
        }
        const result = await pool.query('INSERT INTO survey_responses (customer_id, source_type, source_id, survey_type, score, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [customerId, sourceType, sourceId, surveyType, score, comment]);
        return result.rows[0];
    }
    /**
     * Calculates NPS and CSAT scores.
     */
    async getSatisfactionScores() {
        const npsResult = await pool.query(`
      SELECT
        CAST(SUM(CASE WHEN score >= 9 THEN 1 ELSE 0 END) AS FLOAT) AS promoters,
        CAST(SUM(CASE WHEN score <= 6 THEN 1 ELSE 0 END) AS FLOAT) AS detractors,
        CAST(COUNT(id) AS FLOAT) AS total_responses
      FROM survey_responses
      WHERE survey_type = 'NPS'
    `);
        const csatResult = await pool.query(`
      SELECT
        CAST(SUM(CASE WHEN score >= 4 THEN 1 ELSE 0 END) AS FLOAT) AS satisfied,
        CAST(COUNT(id) AS FLOAT) AS total_responses
      FROM survey_responses
      WHERE survey_type = 'CSAT'
    `);
        const npsScores = npsResult.rows[0];
        const nps = npsScores.total_responses > 0
            ? ((npsScores.promoters - npsScores.detractors) / npsScores.total_responses) * 100
            : 0;
        const csatScores = csatResult.rows[0];
        const csat = csatScores.total_responses > 0
            ? (csatScores.satisfied / csatScores.total_responses) * 100
            : 0;
        return {
            nps: {
                score: nps.toFixed(1),
                total_responses: npsScores.total_responses || 0,
            },
            csat: {
                score: csat.toFixed(1),
                total_responses: csatScores.total_responses || 0,
            },
        };
    }
}
export const surveyService = new SurveyService();
