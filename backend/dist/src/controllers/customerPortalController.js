import * as customerPortalService from '../services/customerPortalService.js';
export const getCustomerHistory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const history = await customerPortalService.getCustomerHistory(parseInt(customerId, 10));
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateCustomerData = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { data } = req.body;
        const result = await customerPortalService.updateCustomerData(parseInt(customerId, 10), data);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getCustomerInvoices = async (req, res) => {
    try {
        const { customerId } = req.params;
        const invoices = await customerPortalService.getCustomerInvoices(parseInt(customerId, 10));
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getCustomerWarranties = async (req, res) => {
    try {
        const { customerId } = req.params;
        const warranties = await customerPortalService.getCustomerWarranties(parseInt(customerId, 10));
        res.json(warranties);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
