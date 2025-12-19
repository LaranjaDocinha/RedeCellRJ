import * as notificationService from '../services/notificationService.js';
export const sendNotification = async (req, res) => {
    try {
        const { userId, title, message, url } = req.body;
        if (!userId || !title || !message) {
            return res.status(400).json({ message: 'User ID, title, and message are required.' });
        }
        const result = await notificationService.sendPushNotification(parseInt(userId, 10), title, message, url);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const subscribe = async (req, res) => {
    try {
        const { userId, subscription } = req.body;
        if (!userId || !subscription) {
            return res.status(400).json({ message: 'User ID and subscription are required.' });
        }
        const result = await notificationService.subscribeToNotifications(parseInt(userId, 10), subscription);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
