import { AppError } from '../utils/errors.js';
import * as expenseReimbursementService from '../services/expenseReimbursementService.js';
export const createRequest = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }
        const request = await expenseReimbursementService.createRequest({
            ...req.body,
            user_id: userId,
        });
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating reimbursement request', error });
    }
};
export const getRequests = async (req, res) => {
    try {
        const { status, branchId } = req.query;
        const requests = await expenseReimbursementService.getRequests(status, branchId ? parseInt(branchId) : undefined);
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reimbursement requests', error });
    }
};
export const getUserRequests = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }
        const requests = await expenseReimbursementService.getUserRequests(String(userId));
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user reimbursement requests', error });
    }
};
export const approveRequest = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        if (!reviewerId) {
            throw new AppError('User not authenticated', 401);
        }
        const request = await expenseReimbursementService.approveRequest(parseInt(req.params.id, 10), String(reviewerId));
        if (request) {
            res.json(request);
        }
        else {
            res.status(404).json({ message: 'Request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error approving request', error });
    }
};
export const rejectRequest = async (req, res) => {
    try {
        const reviewerId = req.user?.id;
        if (!reviewerId) {
            throw new AppError('User not authenticated', 401);
        }
        const request = await expenseReimbursementService.rejectRequest(parseInt(req.params.id, 10), String(reviewerId));
        if (request) {
            res.json(request);
        }
        else {
            res.status(404).json({ message: 'Request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error rejecting request', error });
    }
};
