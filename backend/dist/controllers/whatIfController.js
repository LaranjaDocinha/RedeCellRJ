import * as whatIfService from '../services/whatIfService.js';
export const simulatePromotion = async (req, res) => {
    try {
        const simulationDetails = req.body;
        const result = await whatIfService.simulatePromotion(simulationDetails);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
