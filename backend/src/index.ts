import { httpServer } from './app.js';
import { scheduleDynamicPricingJob } from './jobs/dynamicPricingJob.js';
import marketingAutomationJob from './jobs/marketingAutomationJob.js';
import { stockPredictionJob as scheduleStockPredictionJob } from './jobs/stockPredictionJob.js';
import { scheduleRfmCalculation } from './jobs/rfmJob.js';
import { scheduleCustomerBirthdayJob } from './jobs/customerBirthdayJob.js';
import { initTelemetry } from './utils/telemetry.js'; // Importar initTelemetry

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  initTelemetry(); // Chamar antes de iniciar o servidor
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📄 API documentation available at http://localhost:${PORT}/api-docs`);
  });

  // Schedule jobs
  scheduleDynamicPricingJob();
  marketingAutomationJob.start();
  scheduleStockPredictionJob();
  scheduleRfmCalculation();

  scheduleCustomerBirthdayJob();
}
