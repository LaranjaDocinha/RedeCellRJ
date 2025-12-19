import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import * as customerPortalService from '../services/customerPortalService.js';

export const getCustomerHistory = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const history = await customerPortalService.getCustomerHistory(parseInt(customerId, 10));
  res.json(history);
});

export const updateCustomerData = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { data } = req.body;
  const result = await customerPortalService.updateCustomerData(parseInt(customerId, 10), data);
  res.json(result);
});

export const getCustomerInvoices = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const invoices = await customerPortalService.getCustomerInvoices(parseInt(customerId, 10));
  res.json(invoices);
});

export const getCustomerWarranties = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const warranties = await customerPortalService.getCustomerWarranties(parseInt(customerId, 10));
  res.json(warranties);
});
