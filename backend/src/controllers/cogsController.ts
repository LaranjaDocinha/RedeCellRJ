import { Request, Response } from 'express';
import * as cogsService from '../services/cogsService.js';

export const getCogsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await cogsService.generateCogsReport(startDate as string, endDate as string);
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating COGS report' });
  }
};
