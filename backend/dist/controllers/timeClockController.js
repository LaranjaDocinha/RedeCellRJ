import * as timeClockService from '../services/timeClockService.js';
export const clockIn = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { branchId } = req.body;
        if (!userId || !branchId) {
            return res.status(400).json({ message: 'User and branch ID are required.' });
        }
        const entry = await timeClockService.clockIn(String(userId), branchId);
        res.status(201).json(entry);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const clockOut = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const entry = await timeClockService.clockOut(String(userId));
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getUserEntries = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const entries = await timeClockService.getUserTimeClockEntries(req.params.userId, startDate, endDate);
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getMyEntries = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { startDate, endDate } = req.query;
        const entries = await timeClockService.getUserTimeClockEntries(String(userId), startDate, endDate);
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getBranchEntries = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const entries = await timeClockService.getBranchTimeClockEntries(parseInt(req.params.branchId, 10), startDate, endDate);
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getMyLatestEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const entry = await timeClockService.getLatestUserEntry(String(userId));
        if (!entry) {
            return res.status(204).send(); // No Content
        }
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
