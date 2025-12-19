import cron from 'node-cron';
import { rfmService } from '../services/rfmService.js';
/**
 * Schedules the RFM score calculation to run daily.
 */
export const scheduleRfmCalculation = () => {
    // Schedule to run at 2:00 AM every day
    cron.schedule('0 2 * * *', async () => {
        console.log('Running daily RFM score calculation...');
        try {
            await rfmService.calculateRfmScores();
            console.log('RFM score calculation completed successfully.');
        }
        catch (error) {
            console.error('Failed to run RFM score calculation:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo',
    });
};
