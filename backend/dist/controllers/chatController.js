import * as chatService from '../services/chatService.js';
export const startSession = async (req, res) => {
    try {
        const { customerId } = req.body;
        const result = await chatService.startChatSession(customerId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const sendMessage = async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const result = await chatService.sendMessage(sessionId, message);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getHistory = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required.' });
        }
        const history = await chatService.getChatHistory(sessionId);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
