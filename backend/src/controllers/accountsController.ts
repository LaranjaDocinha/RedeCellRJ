import { Request, Response } from 'express';
import * as accountsService from '../services/accountsService.js';

export const createPayable = async (req: Request, res: Response) => {
  try {
    const payable = await accountsService.createPayable(req.body);
    res.status(201).json(payable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayables = async (req: Request, res: Response) => {
  try {
    const { branchId, status, startDate, endDate } = req.query;
    const payables = await accountsService.getPayables(
      branchId ? parseInt(branchId as string, 10) : undefined,
      status as string,
      startDate as string,
      endDate as string,
    );
    res.json(payables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayableStatus = async (req: Request, res: Response) => {
  try {
    const { status, paidDate } = req.body;
    const payable = await accountsService.updatePayableStatus(
      parseInt(req.params.id, 10),
      status,
      paidDate,
    );
    if (payable) {
      res.json(payable);
    } else {
      res.status(404).json({ message: 'Payable not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReceivable = async (req: Request, res: Response) => {
  try {
    const receivable = await accountsService.createReceivable(req.body);
    res.status(201).json(receivable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReceivables = async (req: Request, res: Response) => {
  try {
    const { branchId, status, startDate, endDate } = req.query;
    const receivables = await accountsService.getReceivables(
      branchId ? parseInt(branchId as string, 10) : undefined,
      status as string,
      startDate as string,
      endDate as string,
    );
    res.json(receivables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReceivableStatus = async (req: Request, res: Response) => {
  try {
    const { status, receivedDate } = req.body;
    const receivable = await accountsService.updateReceivableStatus(
      parseInt(req.params.id, 10),
      status,
      receivedDate,
    );
    if (receivable) {
      res.json(receivable);
    } else {
      res.status(404).json({ message: 'Receivable not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
