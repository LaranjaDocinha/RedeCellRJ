import appEvents from '../events/appEvents.js';
import { marketingAutomationService } from '../services/marketingAutomationService.js';

const marketingAutomationListener = () => {
  appEvents.on('sale.completed', async (payload) => {
    console.log('Caught sale.completed event', payload);
    try {
      await marketingAutomationService.handleEvent('sale.completed', payload);
    } catch (error) {
      console.error('Error handling sale.completed event for marketing automation:', error);
    }
  });

  // Add listeners for other events here, e.g.:
  // appEvents.on('customer.created', async (payload) => { ... });
};

export default marketingAutomationListener;
