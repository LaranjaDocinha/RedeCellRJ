import * as wordpressService from '../services/wordpressService.js';
export const syncProducts = async (req, res) => {
    try {
        const { productsData } = req.body;
        const result = await wordpressService.syncProductsToWordPress(productsData);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const syncOrders = async (req, res) => {
    try {
        const result = await wordpressService.syncOrdersFromWordPress();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const status = await wordpressService.getWordPressStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
