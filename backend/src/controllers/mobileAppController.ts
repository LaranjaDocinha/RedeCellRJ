import { Request, Response } from 'express';

export const getStatus = (req: Request, res: Response) => {
  res.status(200).json({ status: 'Mobile App API is running', version: '1.0.0' });
};
