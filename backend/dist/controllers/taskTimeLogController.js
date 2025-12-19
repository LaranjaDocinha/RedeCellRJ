import { AppError } from '../utils/errors.js';
import * as taskTimeLogService from '../services/taskTimeLogService.js';
export const startTimer = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }
        const { serviceOrderId } = req.params;
        const log = await taskTimeLogService.startTimer(String(userId), parseInt(serviceOrderId, 10));
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const stopTimer = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }
        const { serviceOrderId } = req.params;
        const { notes } = req.body;
        const log = await taskTimeLogService.stopTimer(String(userId), parseInt(serviceOrderId, 10), notes);
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getLogs = async (req, res) => {
    try {
        const { serviceOrderId } = req.params;
        const logs = await taskTimeLogService.getLogsForServiceOrder(parseInt(serviceOrderId, 10));
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getActiveTimer = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }
        const { serviceOrderId } = req.params;
        const timer = await taskTimeLogService.getActiveTimerForUser(String(userId), parseInt(serviceOrderId, 10));
        res.json(timer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
