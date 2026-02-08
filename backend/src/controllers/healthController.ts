import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService.js';
import { pixService } from '../services/pixService.js';
import pool from '../db/index.js';

export const healthController = {
  getServicesHealth: async (req: Request, res: Response) => {
    let dbStatus = 'healthy';
    try {
      await pool.query('SELECT 1');
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('Health check failed for DB:', error);
    }

    const services = [
      { name: 'whatsapp', ...whatsappService.getBreakerStatus() },
      { name: 'pix', ...pixService.getBreakerStatus() },
      { name: 'database', status: dbStatus },
    ];

    const isHealthy =
      dbStatus === 'healthy' &&
      services.every((s) => s.status === 'healthy' || (s as any).opened === false);

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    });
  },
};
