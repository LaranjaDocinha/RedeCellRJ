import * as googleShoppingService from '../services/googleShoppingService.js';
export const syncProducts = async (req, res) => {
    try {
        const { productsData } = req.body;
        const result = await googleShoppingService.syncProductFeed(productsData);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const status = await googleShoppingService.getGoogleShoppingStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
