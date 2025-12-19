import { Request, Response } from 'express';
import * as biIntegrationService from '../services/biIntegrationService.js';

export const generateCredentials = async (req: Request, res: Response) => {
  try {
    const { toolName } = req.body;
    const result = await biIntegrationService.generateSecureViewCredentials(toolName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const result = await biIntegrationService.getAvailableReports();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await biIntegrationService.getBiIntegrationStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
