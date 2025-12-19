import { Request, Response } from 'express';
import * as activityFeedService from '../services/activityFeedService.js';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { branchId, limit, offset } = req.query;
    const feed = await activityFeedService.getFeed(
      branchId ? parseInt(branchId as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
    );
    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity feed', error });
  }
};
