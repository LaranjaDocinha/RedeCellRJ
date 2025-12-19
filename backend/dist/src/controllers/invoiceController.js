import * as invoiceService from '../services/invoiceService.js';
export const generatePdf = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const result = await invoiceService.generateInvoicePdf(parseInt(invoiceId, 10));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getDownloadLink = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const result = await invoiceService.getInvoiceDownloadLink(parseInt(invoiceId, 10));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
