import * as performanceReviewService from '../services/performanceReviewService.js';
export const createPerformanceReview = async (req, res) => {
    try {
        const review = await performanceReviewService.createPerformanceReview(req.body);
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating performance review', error });
    }
};
export const getPerformanceReviews = async (req, res) => {
    try {
        const { userId, reviewerId } = req.query;
        const reviews = await performanceReviewService.getPerformanceReviews(userId, reviewerId);
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching performance reviews', error });
    }
};
export const getPerformanceReviewById = async (req, res) => {
    try {
        const review = await performanceReviewService.getPerformanceReviewById(parseInt(req.params.id, 10));
        if (review) {
            res.json(review);
        }
        else {
            res.status(404).json({ message: 'Performance review not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching performance review', error });
    }
};
export const updatePerformanceReview = async (req, res) => {
    try {
        const review = await performanceReviewService.updatePerformanceReview(parseInt(req.params.id, 10), req.body);
        if (review) {
            res.json(review);
        }
        else {
            res.status(404).json({ message: 'Performance review not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating performance review', error });
    }
};
export const deletePerformanceReview = async (req, res) => {
    try {
        await performanceReviewService.deletePerformanceReview(parseInt(req.params.id, 10));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting performance review', error });
    }
};
