import redisClient from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

export const featureFlagService = {
  /**
   * Verifica se uma feature está ativa.
   * Prioriza o cache do Redis (rápido), mas pode ter fallback para banco se necessário.
   */
  async isEnabled(flagName: string, defaultValue = false): Promise<boolean> {
    try {
      const key = `feature:${flagName}`;
      const cachedValue = await redisClient.get(key);

      if (cachedValue !== null) {
        return cachedValue === 'true';
      }

      // Se não estiver no cache, assume o valor padrão (ou buscaria do DB aqui)
      // E salva no cache para próximas chamadas
      await redisClient.set(key, String(defaultValue));
      return defaultValue;
    } catch (error) {
      logger.error(`[FeatureFlags] Error checking flag ${flagName}: ${error}`);
      return defaultValue; // Fail safe
    }
  },

  /**
   * Ativa ou desativa uma feature dinamicamente.
   */
  async setFlag(flagName: string, isEnabled: boolean) {
    const key = `feature:${flagName}`;
    await redisClient.set(key, String(isEnabled));
    logger.info(`[FeatureFlags] Flag ${flagName} set to ${isEnabled}`);
  }
};