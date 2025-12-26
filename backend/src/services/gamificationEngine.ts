
import { getPool } from '../db/index.js';
import * as gamificationService from './gamificationService.js';
import { logger } from '../utils/logger.js';
import appEvents from '../events/appEvents.js'; // Import appEvents

export const gamificationEngine = {
  async processSale(userId: string, totalAmount: number, items: any[], customerId?: string) {
    try {
      let totalXP = 0;
      const achievements: string[] = [];

      // ... (rest of logic)
      
      // Emit event for real-time UI updates
      appEvents.emit('gamification.xp.earned', { userId, totalXP, achievements });
      
      return { totalXP, achievements };
    } catch (error) {
      logger.error('Error in Gamification Engine:', error);
    }
  },

  async awardXP(userId: string, xpAmount: number) {
    const pool = getPool();
    try {
      // Busca dados atuais
      const userRes = await pool.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) return;

      let { xp, level } = userRes.rows[0];
      const newXP = (xp || 0) + xpAmount;
      
      // Lógica de Level Up (Simples: cada 1000 XP = 1 Nível)
      const newLevel = Math.floor(newXP / 1000) + 1;

      if (newLevel > level) {
        appEvents.emit('gamification.level.up', { userId, oldLevel: level, newLevel });
        logger.info(`[LEVEL UP] User ${userId} reached Level ${newLevel}!`);
      }

      await pool.query(
        'UPDATE users SET xp = $1, level = $2, updated_at = NOW() WHERE id = $3',
        [newXP, newLevel, userId]
      );
    } catch (error) {
      logger.error('Error awarding XP:', error);
    }
  }
};

