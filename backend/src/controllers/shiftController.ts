import { Request, Response } from 'express';
import * as shiftService from '../services/shiftService.js';

export const createShift = async (req: Request, res: Response) => {
  try {
    const shift = await shiftService.createShift(req.body);
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Error creating shift', error });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { start, end, branchId } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end query parameters are required.' });
    }
    const shifts = await shiftService.getShifts(
      start as string,
      end as string,
      branchId ? parseInt(branchId as string) : undefined,
    );
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shifts', error });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const shift = await shiftService.updateShift(parseInt(req.params.id, 10), req.body);
    if (shift) {
      res.json(shift);
    } else {
      res.status(404).json({ message: 'Shift not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating shift', error });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    await shiftService.deleteShift(parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shift', error });
  }
};
