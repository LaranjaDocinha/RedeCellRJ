import * as accountingIntegrationService from '../services/accountingIntegrationService.js';
export const syncSales = async (req, res) => {
    try {
        const result = await accountingIntegrationService.syncSales(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const syncExpenses = async (req, res) => {
    try {
        const result = await accountingIntegrationService.syncExpenses(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const status = await accountingIntegrationService.getIntegrationStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
