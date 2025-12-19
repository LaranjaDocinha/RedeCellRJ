import axios from 'axios';
const REPORTS_MICROSERVICE_URL = process.env.REPORTS_MICROSERVICE_URL || 'http://localhost:5001';
export const getPnlReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }
        // Forward the request to the reports microservice
        const response = await axios.get(`${REPORTS_MICROSERVICE_URL}/api/pnl-report`, {
            params: { startDate, endDate },
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        // If the error is from axios, forward the microservice's response
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        // Otherwise, pass to the next error handler
        next(error);
    }
};
