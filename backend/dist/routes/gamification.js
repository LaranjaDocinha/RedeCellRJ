import { Router } from 'express';
import * as gamificationService from '../services/gamificationService.js';
import * as badgeService from '../services/badgeService.js';
const router = Router();
router.get('/leaderboard', async (req, res) => {
    try {
        const metric = req.query.metric || 'sales_volume';
        const data = await gamificationService.getLeaderboard(metric);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching leaderboard' });
    }
});
router.get('/badges', async (req, res) => {
    try {
        const badges = await badgeService.getAllBadges();
        res.json(badges);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching badges' });
    }
});
router.get('/users/:userId/badges', async (req, res) => {
    try {
        const userBadges = await gamificationService.getUserBadges(req.params.userId);
        res.json(userBadges);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching user badges' });
    }
});
export default router;
