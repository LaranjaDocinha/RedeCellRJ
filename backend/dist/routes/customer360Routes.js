import { Router } from 'express';
import { Customer360Controller } from '../controllers/Customer360Controller.js';
import { Customer360Service } from '../services/Customer360Service.js';
const router = Router();
const customer360Service = new Customer360Service();
const customer360Controller = new Customer360Controller(customer360Service);
router.get('/customers/:customerId/360-view', (req, res) => customer360Controller.getCustomer360View(req, res));
export default router;
