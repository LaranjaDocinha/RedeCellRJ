import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { emailService } from './emailService.js'; // Assuming email service exists
import { addJob, defaultQueue } from '../jobs/queue.js'; // For scheduling survey emails
import { sentimentService } from './sentimentService.js'; // Added import
export const surveyService = {
    async createSurvey(payload) {
        const { sale_id, customer_id, sent_at = new Date() } = payload;
        try {
            const result = await pool.query('INSERT INTO satisfaction_surveys (sale_id, customer_id, sent_at) VALUES ($1, $2, $3) RETURNING *', [sale_id, customer_id, sent_at]);
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') { // Unique violation on sale_id
                throw new AppError('A survey for this sale already exists.', 409);
            }
            throw new AppError('Failed to create survey.', 500);
        }
    },
    async completeSurvey(surveyId, payload) {
        const { score, comments } = payload;
        let sentimentScore;
        let sentimentLabel;
        if (comments && comments.trim().length > 0) {
            const sentiment = await sentimentService.analyzeSentiment(comments);
            sentimentScore = sentiment.score;
            sentimentLabel = sentiment.label;
        }
        const result = await pool.query('UPDATE satisfaction_surveys SET score = $1, comments = $2, sentiment_score = $3, sentiment_label = $4, completed_at = NOW() WHERE id = $5 RETURNING *', [score, comments, sentimentScore, sentimentLabel, surveyId]);
        if (result.rows.length === 0) {
            throw new AppError('Survey not found.', 404);
        }
        return result.rows[0];
    },
    async getSurveyById(surveyId) {
        const result = await pool.query('SELECT * FROM satisfaction_surveys WHERE id = $1', [surveyId]);
        return result.rows[0];
    },
    async schedulePostSaleSurvey(saleId, customerId, customerEmail, delayDays = 3) {
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + delayDays);
        // Add job to BullMQ queue
        await addJob(defaultQueue, 'sendSurveyEmail', { saleId, customerId, customerEmail, delayDays }, { delay: delayDays * 24 * 60 * 60 * 1000 });
        console.log(`Scheduled survey for sale ${saleId} to be sent in ${delayDays} days.`);
    },
    async sendSurveyEmail(saleId, customerId, customerEmail) {
        try {
            // Create survey entry in DB first
            const survey = await this.createSurvey({ sale_id: saleId, customer_id: customerId });
            const surveyLink = `${process.env.FRONTEND_URL}/survey/${survey.id}`; // Assuming a frontend survey page
            const subject = 'Sua opinião é importante! Avalie sua compra na RedecellRJ';
            const body = `Olá!\n\nGostaríamos muito de saber sobre sua experiência de compra (Pedido #${saleId}) na RedecellRJ. Por favor, reserve um momento para avaliar-nos:\n\n${surveyLink}\n\nObrigado!`;
            await emailService.sendEmail(customerEmail, subject, body);
            console.log(`Survey email sent for sale ${saleId} to ${customerEmail}`);
        }
        catch (error) {
            console.error(`Error sending survey email for sale ${saleId}:`, error);
            throw error;
        }
    },
};
