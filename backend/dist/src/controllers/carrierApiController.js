import * as carrierApiService from '../services/carrierApiService.js';
export const activateChip = async (req, res) => {
    try {
        const { customerData, planDetails, carrier } = req.body;
        const result = await carrierApiService.activateChip(customerData, planDetails, carrier);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const activatePlan = async (req, res) => {
    try {
        const { customerData, planDetails, carrier } = req.body;
        const result = await carrierApiService.activatePlan(customerData, planDetails, carrier);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const { carrier } = req.query;
        if (!carrier) {
            return res.status(400).json({ message: 'Carrier parameter is required.' });
        }
        const status = await carrierApiService.getCarrierStatus(carrier);
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
