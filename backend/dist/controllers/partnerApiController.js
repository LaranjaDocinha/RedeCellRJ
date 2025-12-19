import * as partnerApiService from '../services/partnerApiService.js';
export const createApiKey = async (req, res) => {
    try {
        const { partner_name, permissions, expires_at } = req.body;
        const apiKey = await partnerApiService.createApiKey(partner_name, permissions, expires_at);
        res.status(201).json(apiKey);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const revokeApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        const revokedKey = await partnerApiService.revokeApiKey(parseInt(id, 10));
        if (revokedKey) {
            res.json({ message: 'API Key revoked successfully.' });
        }
        else {
            res.status(404).json({ message: 'API Key not found.' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getApiKeys = async (req, res) => {
    try {
        const apiKeys = await partnerApiService.getApiKeys();
        res.json(apiKeys);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const partnerAuthMiddleware = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API Key missing.' });
    }
    try {
        const partner = await partnerApiService.authenticateApiKey(apiKey);
        if (!partner) {
            return res.status(403).json({ message: 'Invalid or inactive API Key.' });
        }
        req.partner = partner; // Attach partner info to request
        next();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Dummy public endpoint for demonstration
export const getPublicData = (req, res) => {
    res.json({
        message: 'This is public data accessible via API Key.',
        partner: req.partner.partner_name,
    });
};
