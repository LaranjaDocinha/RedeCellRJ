import cron from 'node-cron';
import { badgeQueue, rfmQueue, defaultQueue, addJob } from './queue.js'; // Import BullMQ queues and addJob helper
// Run every day at 00:00 - Add job to queue
cron.schedule('0 0 * * *', async () => {
    console.log('Scheduling daily badge check job...');
    await addJob(badgeQueue, 'awardBadges', {});
});
// Run RFM Analysis every day at 01:00 - Add job to queue
cron.schedule('0 1 * * *', async () => {
    console.log('Scheduling daily RFM analysis job...');
    await addJob(rfmQueue, 'calculateRfm', {});
});
// Run Customer Journeys processing every day at 02:00 - Add job to queue
cron.schedule('0 2 * * *', async () => {
    console.log('Scheduling daily customer journeys processing job...');
    await addJob(defaultQueue, 'processCustomerJourneys', {});
});
// Run Loyalty Tiers update every day at 03:00 - Add job to queue
cron.schedule('0 3 * * *', async () => {
    console.log('Scheduling daily loyalty tier update job...');
    await addJob(defaultQueue, 'updateCustomerTiers', {});
});
// Run Marketplace Orders Sync every 15 minutes - Add job to queue
cron.schedule('*/15 * * * *', async () => {
    console.log('Scheduling marketplace orders sync job...');
    // Find all active marketplace integrations and schedule a job for each
    const integrationsRes = await getPool().query('SELECT id FROM marketplace_integrations WHERE is_active = TRUE');
    for (const integration of integrationsRes.rows) {
        await addJob(defaultQueue, 'syncMarketplaceOrders', { integrationId: integration.id });
    }
});
// Run ERP Data Export every day at 04:00 - Add job to queue
cron.schedule('0 4 * * *', async () => {
    console.log('Scheduling ERP data export job...');
    await addJob(defaultQueue, 'exportErpData', { startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10) });
});
export const initCronJobs = () => {
    console.log('Cron jobs initialized and scheduling jobs via BullMQ.');
};
