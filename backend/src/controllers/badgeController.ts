import { Request, Response } from 'express';
import * as badgeService from '../services/badgeService.js';

export const createBadge = async (req: Request, res: Response) => {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: 'Error creating badge', error });
  }
};

export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badges', error });
  }
};

export const getBadgeById = async (req: Request, res: Response) => {
  try {
    const badge = await badgeService.getBadgeById(parseInt(req.params.id, 10));
    if (badge) {
      res.json(badge);
    } else {
      res.status(404).json({ message: 'Badge not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badge', error });
  }
};

export const updateBadge = async (req: Request, res: Response) => {
  try {
    const badge = await badgeService.updateBadge(parseInt(req.params.id, 10), req.body);
    if (badge) {
      res.json(badge);
    } else {
      res.status(404).json({ message: 'Badge not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating badge', error });
  }
};

export const deleteBadge = async (req: Request, res: Response) => {
  try {
    await badgeService.deleteBadge(parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting badge', error });
  }
};
