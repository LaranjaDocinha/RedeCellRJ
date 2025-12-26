import { Router, Request, Response, NextFunction } from 'express';
import * as gamificationService from '../services/gamificationService.js';
import * as badgeService from '../services/badgeService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Added
import { z } from 'zod'; // Importar Zod
import { ValidationError } from '../utils/errors.js'; // Importar ValidationError

const router = Router();

// Middleware de validação genérico
const validate =
  (schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Valida o body para POST/PUT
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

// Zod Schema para criar desafio
const createChallengeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  metric: z.enum(['sales_volume', 'repairs_completed', 'customer_satisfaction', 'new_customers', 'revenue']).default('sales_volume'), // Expandir métricas
  targetValue: z.number().positive('Valor alvo deve ser positivo'),
  rewardXp: z.number().int().positive('XP de recompensa deve ser um inteiro positivo'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final deve estar no formato YYYY-MM-DD'),
});


router.use(authMiddleware.authenticate); // Require auth for all gamification routes

router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await gamificationService.getUserStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching stats' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const metric = (req.query.metric as 'sales_volume' | 'repairs_completed') || 'sales_volume';
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly' | 'all_time') || 'monthly';
    const data = await gamificationService.getLeaderboard(metric, period); // Passar period
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching leaderboard' });
  }
});

router.get('/badges', async (req, res) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching badges' });
  }
});

router.get('/users/:userId/badges', async (req, res) => {
  try {
    const userBadges = await gamificationService.getUserBadges(req.params.userId);
    res.json(userBadges);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user badges' });
  }
});

// Challenges Routes
router.post('/challenges', authMiddleware.authorize('manage', 'Gamification'), validate(createChallengeSchema), async (req, res) => {
  try {
    const { title, description, metric, targetValue, rewardXp, startDate, endDate } = req.body;
    const challenge = await gamificationService.createChallenge(title, description, metric, targetValue, rewardXp, startDate, endDate);
    res.status(201).json(challenge);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-challenges', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const challenges = await gamificationService.getMyChallenges(userId);
    res.json(challenges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
