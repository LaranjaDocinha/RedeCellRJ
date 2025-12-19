import cron from 'node-cron';
import { marketingAutomationService } from '../services/marketingAutomationService.js';

// Schedule the job to run every minute
const marketingAutomationJob = cron.schedule('* * * * *', async () => {
  console.log('Running marketing automation job...');
  try {
    await marketingAutomationService.processPendingRuns();
    console.log('Marketing automation job completed successfully.');
  } catch (error) {
    console.error('Error during scheduled marketing automation job:', error);
  }
});

export default marketingAutomationJob;
