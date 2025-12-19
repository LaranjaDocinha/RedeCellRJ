import * as financialDashboardService from '../services/financialDashboardService.js';
export const getFinancialDashboardData = async (req, res) => {
    try {
        const dashboardData = await financialDashboardService.getFinancialDashboardData();
        res.status(200).json(dashboardData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
