import { Request, Response } from 'express';
import { Customer360Service } from '../services/Customer360Service.js';

export class Customer360Controller {
  constructor(private customer360Service: Customer360Service) {}

  async getCustomer360View(req: Request, res: Response) {
    const { customerId } = req.params;

    try {
      const customer360View = await this.customer360Service.getCustomer360View(customerId);

      if (!customer360View) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.status(200).json(customer360View);
    } catch (error) {
      console.error('Error fetching customer 360 view:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
