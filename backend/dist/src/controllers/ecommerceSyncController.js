import * as ecommerceSyncService from '../services/ecommerceSyncService.js';
export const syncProducts = async (req, res) => {
    try {
        const result = await ecommerceSyncService.syncProductsToEcommerce(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const syncOrders = async (req, res) => {
    try {
        const result = await ecommerceSyncService.syncOrdersFromEcommerce();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const status = await ecommerceSyncService.getEcommerceSyncStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
