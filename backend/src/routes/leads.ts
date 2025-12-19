import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as leadController from '../controllers/leadController.js';
import { createLeadSchema, updateLeadSchema, createLeadActivitySchema } from '../controllers/leadController.js'; // Reusing schemas from controller for routes

const leadsRouter = Router();

leadsRouter.use(authMiddleware.authenticate); // All lead routes require authentication

// CRUD for Leads
leadsRouter.post('/', authMiddleware.authorize('create', 'Lead'), validate(createLeadSchema), leadController.createLead);
leadsRouter.get('/', authMiddleware.authorize('read', 'Lead'), leadController.getAllLeads);
leadsRouter.get('/:id', authMiddleware.authorize('read', 'Lead'), leadController.getLeadById);
leadsRouter.put('/:id', authMiddleware.authorize('update', 'Lead'), validate(updateLeadSchema), leadController.updateLead);
leadsRouter.delete('/:id', authMiddleware.authorize('delete', 'Lead'), leadController.deleteLead);

// Lead Activities
leadsRouter.post('/:id/activities', authMiddleware.authorize('create', 'LeadActivity'), validate(createLeadActivitySchema), leadController.addLeadActivity);
leadsRouter.get('/:id/activities', authMiddleware.authorize('read', 'LeadActivity'), leadController.getLeadActivities);

export default leadsRouter;
