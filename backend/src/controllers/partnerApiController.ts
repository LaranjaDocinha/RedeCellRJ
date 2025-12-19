import { Request, Response, NextFunction } from 'express';
import * as partnerApiService from '../services/partnerApiService.js';

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { partner_name, permissions, expires_at } = req.body;
    const apiKey = await partnerApiService.createApiKey(partner_name, permissions, expires_at);
    res.status(201).json(apiKey);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const revokeApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const revokedKey = await partnerApiService.revokeApiKey(parseInt(id, 10));
    if (revokedKey) {
      res.json({ message: 'API Key revoked successfully.' });
    } else {
      res.status(404).json({ message: 'API Key not found.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const apiKeys = await partnerApiService.getApiKeys();
    res.json(apiKeys);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const partnerAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key missing.' });
  }

  try {
    const partner = await partnerApiService.authenticateApiKey(apiKey);
    if (!partner) {
      return res.status(403).json({ message: 'Invalid or inactive API Key.' });
    }
    (req as any).partner = partner; // Attach partner info to request
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Dummy public endpoint for demonstration
export const getPublicData = (req: Request, res: Response) => {
  res.json({
    message: 'This is public data accessible via API Key.',
    partner: (req as any).partner.partner_name,
  });
};
