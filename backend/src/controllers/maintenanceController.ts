import { Request, Response, NextFunction } from 'express';
import pool from '../db/index.js';

export const getMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT value FROM settings WHERE key = 'maintenance_mode_enabled'",
    );
    const isEnabled = result.rows[0]?.value === 'true';
    res.status(200).json({ enabled: isEnabled });
  } catch (error) {
    next(error);
  }
};

export const setMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for enabled. Must be a boolean.' });
    }

    await pool.query("UPDATE settings SET value = $1 WHERE key = 'maintenance_mode_enabled'", [
      enabled.toString(),
    ]);
    res.status(200).json({ enabled });
  } catch (error) {
    next(error);
  }
};
