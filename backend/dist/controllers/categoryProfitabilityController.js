import * as categoryProfitabilityService from '../services/categoryProfitabilityService.js';
import moment from 'moment';
export const getCategoryProfitability = async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.query;
        const start = startDate
            ? moment(startDate).toISOString()
            : moment().startOf('month').toISOString();
        const end = endDate
            ? moment(endDate).toISOString()
            : moment().endOf('month').toISOString();
        const data = await categoryProfitabilityService.getCategoryProfitability(branchId ? parseInt(branchId, 10) : undefined, start, end);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
