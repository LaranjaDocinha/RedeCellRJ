import cron from 'node-cron';
import { loyaltyTierService } from '../services/loyaltyTierService.js';

// Schedule the job to run once a day at 3 AM
const loyaltyTierJob = cron.schedule('0 3 * * *', async () => {
  console.log('Running daily loyalty tier update job...');
  try {
    await loyaltyTierService.updateAllCustomerTiers();
    console.log('Loyalty tier update job completed successfully.');
  } catch (error) {
    console.error('Error during scheduled loyalty tier update job:', error);
  }
});

export default loyaltyTierJob;
