"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPnlReport = void 0;
const pnlReportService_js_1 = __importDefault(require("../services/pnlReportService.js"));
const getPnlReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }
        const pnlData = await pnlReportService_js_1.default.generatePnlReport(startDate, endDate);
        res.status(200).json(pnlData);
    }
    catch (error) {
        next(error);
    }
};
exports.getPnlReport = getPnlReport;
