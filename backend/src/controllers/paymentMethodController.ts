import { Request, Response } from 'express';
import * as paymentMethodService from '../services/paymentMethodService.js';

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const paymentMethod = await paymentMethodService.createPaymentMethod(
      parseInt(customerId, 10),
      req.body,
    );
    res.status(201).json(paymentMethod);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentMethod = await paymentMethodService.updatePaymentMethod(
      parseInt(id, 10),
      req.body,
    );
    if (paymentMethod) {
      res.json(paymentMethod);
    } else {
      res.status(404).json({ message: 'Payment method not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentMethod = await paymentMethodService.deletePaymentMethod(parseInt(id, 10));
    if (paymentMethod) {
      res.json({ message: 'Payment method deleted successfully' });
    } else {
      res.status(404).json({ message: 'Payment method not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentMethodsByCustomerId = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const paymentMethods = await paymentMethodService.getPaymentMethodsByCustomerId(
      parseInt(customerId, 10),
    );
    res.json(paymentMethods);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
