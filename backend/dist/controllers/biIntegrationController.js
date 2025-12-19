import * as biIntegrationService from '../services/biIntegrationService.js';
export const generateCredentials = async (req, res) => {
    try {
        const { toolName } = req.body;
        const result = await biIntegrationService.generateSecureViewCredentials(toolName);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getReports = async (req, res) => {
    try {
        const result = await biIntegrationService.getAvailableReports();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStatus = async (req, res) => {
    try {
        const status = await biIntegrationService.getBiIntegrationStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
