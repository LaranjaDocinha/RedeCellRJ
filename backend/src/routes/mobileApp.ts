import { Router } from 'express';
import { getStatus } from '../controllers/mobileAppController.js';

const mobileAppRouter = Router();

mobileAppRouter.get('/status', getStatus);

export default mobileAppRouter;
