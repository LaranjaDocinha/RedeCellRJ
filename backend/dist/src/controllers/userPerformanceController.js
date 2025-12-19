import * as userPerformanceService from '../services/userPerformanceService.js';
import moment from 'moment';
export const getMyPerformance = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { startDate, endDate } = req.query;
        // Default to the current month if no date range is provided
        const start = startDate
            ? moment(startDate).toISOString()
            : moment().startOf('month').toISOString();
        const end = endDate
            ? moment(endDate).toISOString()
            : moment().endOf('month').toISOString();
        const performanceData = await userPerformanceService.getPerformanceData(String(userId), start, end);
        res.json(performanceData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
