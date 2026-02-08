import { Router, Request, Response, NextFunction } from 'express';
import { customerJourneyService } from '../services/customerJourneyService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'CustomerJourneys'));

// Zod schemas for validation
const createJourneySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  trigger_segment: z.string().min(1, 'Trigger segment is required'),
  action_type: z.enum(['email', 'whatsapp_message', 'push_notification'], {
    errorMap: () => ({ message: 'Invalid action type' }),
  }),
  template_id: z.string().min(1, 'Template ID is required'),
  delay_days: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new AppError(
            'Validation failed',
            400,
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const journeys = await customerJourneyService.getAllJourneys();
    res.json(journeys);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validate(createJourneySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newJourney = await customerJourneyService.createJourney(req.body);
      res.status(201).json(newJourney);
    } catch (error) {
      next(error);
    }
  },
);

// No update/delete routes for now, focus on creation and automated processing

export default router;
