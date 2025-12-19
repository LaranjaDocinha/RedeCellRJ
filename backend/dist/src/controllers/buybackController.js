import * as buybackService from '../services/buybackService.js';
export const calculateBuybackValue = async (req, res) => {
    try {
        const { deviceId, purchaseDate } = req.query;
        if (!deviceId || !purchaseDate) {
            return res.status(400).json({ message: 'Device ID and purchase date are required.' });
        }
        const result = await buybackService.getBuybackValue(parseInt(deviceId, 10), new Date(purchaseDate));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const initiateBuyback = async (req, res) => {
    try {
        const { customerId, deviceId, buybackValue } = req.body;
        const result = await buybackService.initiateBuyback(parseInt(customerId, 10), parseInt(deviceId, 10), parseFloat(buybackValue));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
