import { httpServer } from './app.js';
import { scheduleDynamicPricingJob } from './jobs/dynamicPricingJob.js';
import marketingAutomationJob from './jobs/marketingAutomationJob.js';
import { stockPredictionJob as scheduleStockPredictionJob } from './jobs/stockPredictionJob.js';
import { scheduleRfmCalculation } from './jobs/rfmJob.js';
import { scheduleCustomerBirthdayJob } from './jobs/customerBirthdayJob.js';
import { initTelemetry } from './utils/telemetry.js';

const PORT = process.env.PORT || 3000; // Padronizado para 3000

if (process.env.NODE_ENV !== 'test') {
  initTelemetry();
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📄 API documentation available at http://localhost:${PORT}/api-docs`);
    
    // Iniciar agendamentos de forma assíncrona para não travar o boot
    console.log('Initializing background jobs...');
    setTimeout(() => {
      try {
        scheduleDynamicPricingJob();
        marketingAutomationJob.start();
        scheduleStockPredictionJob();
        scheduleRfmCalculation();
        scheduleCustomerBirthdayJob();
        console.log('Background jobs scheduled.');
      } catch (err) {
        console.warn('Erro ao agendar jobs (Redis pode estar offline):', err.message);
      }
    }, 1000);
  });
}