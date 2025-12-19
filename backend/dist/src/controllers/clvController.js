import * as clvService from '../services/clvService.js';
export const getClvReport = async (req, res) => {
    try {
        const { customerId } = req.params;
        const clvReport = await clvService.calculateClv(customerId);
        res.status(200).json(clvReport);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
