import { Request, Response } from 'express';
import * as timeClockService from '../services/timeClockService.js';

export const clockIn = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.body;
    if (!userId || !branchId) {
      return res.status(400).json({ message: 'User and branch ID are required.' });
    }
    const entry = await timeClockService.clockIn(String(userId), branchId);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Clock-in controller error:', error);
    res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

export const clockOut = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    const entry = await timeClockService.clockOut(String(userId));
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserEntries = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await timeClockService.getUserTimeClockEntries(
      req.params.userId,
      startDate as string,
      endDate as string,
    );
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { startDate, endDate } = req.query;
    const entries = await timeClockService.getUserTimeClockEntries(
      String(userId),
      startDate as string,
      endDate as string,
    );
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchEntries = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await timeClockService.getBranchTimeClockEntries(
      parseInt(req.params.branchId, 10),
      startDate as string,
      endDate as string,
    );
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLatestEntry = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
