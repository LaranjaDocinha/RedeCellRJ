import * as activityFeedService from '../services/activityFeedService.js';
export const getFeed = async (req, res) => {
    try {
        const { branchId, limit, offset } = req.query;
        const feed = await activityFeedService.getFeed(branchId ? parseInt(branchId) : undefined, limit ? parseInt(limit) : undefined, offset ? parseInt(offset) : undefined);
        res.json(feed);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activity feed', error });
    }
};
