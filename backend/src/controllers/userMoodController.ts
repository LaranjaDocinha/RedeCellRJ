import { Request, Response } from 'express';
import redisClient from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

export const userMoodController = {
  /**
   * Recebe telemetria comportamental do frontend e ajusta a sessão do usuário.
   */
  reportMood: async (req: Request, res: Response) => {
    const { userId } = req.user as any;
    const { rageClicks, errorCount, rapidNavigation, timestamp } = req.body;

    // Lógica simples de "Estresse"
    let stressScore = 0;
    if (rageClicks > 3) stressScore += 50;
    if (errorCount > 2) stressScore += 30;
    if (rapidNavigation) stressScore += 20;

    const currentMood = stressScore > 50 ? 'frustrated' : 'calm';
    const key = `user_mood:${userId}`;

    logger.info(`[MoodAI] User ${userId} is currently: ${currentMood} (Score: ${stressScore})`);

    // Salva o humor no Redis por 5 minutos
    await redisClient.setEx(key, 300, currentMood);

    // Retorna ações recomendadas para o Frontend
    res.json({
      status: 'success',
      data: {
        detectedMood: currentMood,
        adaptations: currentMood === 'frustrated' ? {
          enableZenMode: true,
          reduceAnimations: true,
          showHelp: false // Não irritar quem já está bravo
        } : {
          enableZenMode: false,
          reduceAnimations: false,
          showHelp: true
        }
      }
    });
  }
};