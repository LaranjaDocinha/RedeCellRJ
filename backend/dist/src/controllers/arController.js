import * as arService from '../services/arService.js';
export const getCompatibleProducts = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const products = await arService.getCompatibleProducts(parseInt(deviceId, 10));
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const logARInteraction = async (req, res) => {
    try {
        const { customerId, productId } = req.body;
        const result = await arService.logARInteraction(parseInt(customerId, 10), parseInt(productId, 10));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
