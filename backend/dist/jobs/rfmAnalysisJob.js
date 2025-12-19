import cron from 'node-cron';
import { rfmService } from '../services/rfmService.js';
// Schedule the RFM analysis to run once a day at midnight
const rfmAnalysisJob = cron.schedule('0 0 * * *', async () => {
    console.log('Running daily RFM analysis...');
    try {
        await rfmService.calculateRfmScores();
        console.log('RFM analysis completed successfully.');
    }
    catch (error) {
        console.error('Error during scheduled RFM analysis:', error);
    }
});
export default rfmAnalysisJob;
