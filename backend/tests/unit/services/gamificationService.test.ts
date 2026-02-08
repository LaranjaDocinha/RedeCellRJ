import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pool } from 'pg'; // Importação para o tipo Pool
import { AppError } from '../../../src/utils/errors.js';

// Mock do pool de conexão do PostgreSQL
const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

import { getPool } from '../../../src/db/index.js'; // Importação do db real para mockar DEPOIS do mock
import {
  getLeaderboard,
  awardBadge,
  getUserBadges,
  createChallenge,
  getMyChallenges,
  updateChallengeProgress,
} from '../../../src/services/gamificationService.js';

describe('GamificationService', () => {
  const mockPoolQuery = mockQuery; // Referenciar a instância global mockQuery

  beforeEach(() => {
    mockPoolQuery.mockReset(); // Limpar mocks antes de cada teste
  });

  describe('getLeaderboard', () => {
    it('should return sales volume leaderboard for monthly period', async () => {
      mockPoolQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'user1',
            name: 'User 1',
            email: 'user1@example.com',
            total: 1000,
            xp: 100,
            level: 3,
          },
          { id: 'user2', name: 'User 2', email: 'user2@example.com', total: 500, xp: 50, level: 2 },
        ],
      });

      const leaderboard = await getLeaderboard('sales_volume', 'monthly');
      expect(leaderboard).toEqual([
        { id: 'user1', name: 'User 1', email: 'user1@example.com', total: 1000, xp: 100, level: 3 },
        { id: 'user2', name: 'User 2', email: 'user2@example.com', total: 500, xp: 50, level: 2 },
      ]);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /FROM\s*sales\s*s\s*JOIN\s*users\s*u\s*ON\s*s\.user_id\s*=\s*u\.id\s*AND\s*s\.sale_date\s*>=\s*CURRENT_DATE\s*-\s*INTERVAL\s*'30 days'\s*GROUP BY u\.id,\s*u\.name,\s*u\.email\s*ORDER BY xp DESC\s*LIMIT 10;/s,
        ),
      );
    });

    it('should return repairs completed leaderboard for all_time period', async () => {
      mockPoolQuery.mockResolvedValueOnce({
        rows: [
          { id: 'user3', name: 'User 3', email: 'user3@example.com', total: 10, xp: 500, level: 6 },
          { id: 'user4', name: 'User 4', email: 'user4@example.com', total: 5, xp: 250, level: 4 },
        ],
      });

      const leaderboard = await getLeaderboard('repairs_completed', 'all_time');
      expect(leaderboard).toEqual([
        { id: 'user3', name: 'User 3', email: 'user3@example.com', total: 10, xp: 500, level: 6 },
        { id: 'user4', name: 'User 4', email: 'user4@example.com', total: 5, xp: 250, level: 4 },
      ]);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /FROM\s*service_orders\s*so\s*JOIN\s*users\s*u\s*ON\s*so\.technician_id\s*=\s*u\.id\s*WHERE\s*so\.status\s*=\s*'Entregue'\s*GROUP BY u\.id,\s*u\.name,\s*u\.email\s*ORDER BY xp DESC\s*LIMIT 10;/s,
        ),
      );
    });

    it('should return empty array if no data', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const leaderboard = await getLeaderboard('sales_volume', 'daily');
      expect(leaderboard).toEqual([]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Error', 500));

      await expect(getLeaderboard('sales_volume', 'weekly')).rejects.toThrow(AppError);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('awardBadge', () => {
    it('should successfully award a badge', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      await awardBadge('user123', 1);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT (user_id, badge_id) DO NOTHING',
        ['user123', 1],
      );
    });

    it('should not throw error if badge already awarded (ON CONFLICT DO NOTHING)', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 }); // Simula que a linha já existe

      await expect(awardBadge('user123', 1)).resolves.toBeUndefined();
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
    });

    it('should log error if database query fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
      mockPoolQuery.mockRejectedValueOnce(new Error('DB Error'));

      await awardBadge('user123', 1);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to award badge 1 to user user123'),
        expect.any(Error),
      );
      consoleSpy.mockRestore(); // Restaurar console.error
    });
  });

  describe('getUserBadges', () => {
    it('should return badges for a user', async () => {
      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'First Sale', icon_url: 'url1' }],
      });

      const badges = await getUserBadges('user123');
      expect(badges).toEqual([{ id: 1, name: 'First Sale', icon_url: 'url1' }]);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        'SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1',
        ['user123'],
      );
    });

    it('should return empty array if user has no badges', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const badges = await getUserBadges('user123');
      expect(badges).toEqual([]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Error', 500));

      await expect(getUserBadges('user123')).rejects.toThrow(AppError);
    });
  });

  describe('createChallenge', () => {
    it('should successfully create a challenge', async () => {
      const challengeData = {
        title: 'Sales Target',
        description: 'Reach 100 sales',
        metric: 'sales_volume',
        targetValue: 100,
        rewardXp: 50,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };
      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, ...challengeData }],
      });

      const newChallenge = await createChallenge(
        challengeData.title,
        challengeData.description,
        challengeData.metric,
        challengeData.targetValue,
        challengeData.rewardXp,
        challengeData.startDate,
        challengeData.endDate,
      );
      expect(newChallenge).toEqual({ id: 1, ...challengeData });
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        'INSERT INTO gamification_challenges (title, description, metric, target_value, reward_xp, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        Object.values(challengeData),
      );
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Error', 500));
      const challengeData = {
        title: 'Sales Target',
        description: 'Reach 100 sales',
        metric: 'sales_volume',
        targetValue: 100,
        rewardXp: 50,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };
      await expect(
        createChallenge(
          challengeData.title,
          challengeData.description,
          challengeData.metric,
          challengeData.targetValue,
          challengeData.rewardXp,
          challengeData.startDate,
          challengeData.endDate,
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe('getMyChallenges', () => {
    it('should return active challenges with user progress', async () => {
      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, title: 'C1', current_value: 50, completed: false }],
      });

      const challenges = await getMyChallenges('user123');
      expect(challenges).toEqual([{ id: 1, title: 'C1', current_value: 50, completed: false }]);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /FROM\s*gamification_challenges\s*c\s*LEFT\s*JOIN\s*user_challenge_progress\s*ucp\s*ON\s*c\.id\s*=\s*ucp\.challenge_id\s*AND\s*ucp\.user_id\s*=\s*\$1\s*WHERE\s*c\.end_date\s*>=\s*NOW\(\)\s*AND\s*c\.start_date\s*<=\s*NOW\(\)/s,
        ),
        ['user123'],
      );
    });

    it('should return empty array if no active challenges', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const challenges = await getMyChallenges('user123');
      expect(challenges).toEqual([]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Error', 500));

      await expect(getMyChallenges('user123')).rejects.toThrow(AppError);
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update progress for active challenges and mark as completed if target met', async () => {
      const userId = 'user123';
      const metric = 'sales_volume';
      const value = 60;
      const challengeId = 1;

      // Mock para encontrar desafios ativos
      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: challengeId, target_value: 100, reward_xp: 50 }],
      });
      // Mock para insert/update progress (primeiro query)
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });
      // Mock para verificar o progresso (segundo query)
      mockPoolQuery.mockResolvedValueOnce({ rows: [{ current_value: 100, completed: false }] });
      // Mock para marcar como completado (terceiro query)
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateChallengeProgress(userId, metric, value);

      expect(mockPoolQuery).toHaveBeenCalledTimes(4); // 1 para buscar desafios, 1 para upsert, 1 para verificar, 1 para completar
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /SELECT id, target_value, reward_xp FROM gamification_challenges\s+WHERE metric = \$1 AND start_date <= NOW\(\) AND end_date >= NOW\(\)/s,
        ),
        [metric],
      );
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /INSERT INTO user_challenge_progress \(user_id, challenge_id, current_value\)\s+VALUES \(\$1, \$2, \$3\)\s+ON CONFLICT \(user_id, challenge_id\)\s+DO UPDATE SET current_value = user_challenge_progress\.current_value \+ \$3/s,
        ),
        [userId, challengeId, value],
      );
      expect(mockPoolQuery).toHaveBeenCalledWith(
        'SELECT current_value, completed FROM user_challenge_progress WHERE user_id = $1 AND challenge_id = $2',
        [userId, challengeId],
      );
      expect(mockPoolQuery).toHaveBeenCalledWith(
        'UPDATE user_challenge_progress SET completed = TRUE, completed_at = NOW() WHERE user_id = $1 AND challenge_id = $2',
        [userId, challengeId],
      );
      expect(consoleSpy).toHaveBeenCalledWith(`User ${userId} completed challenge ${challengeId}!`);
      consoleSpy.mockRestore();
    });

    it('should update progress but not mark as completed if target not met', async () => {
      const userId = 'user123';
      const metric = 'sales_volume';
      const value = 30;
      const challengeId = 1;

      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: challengeId, target_value: 100, reward_xp: 50 }],
      });
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });
      mockPoolQuery.mockResolvedValueOnce({ rows: [{ current_value: 30, completed: false }] });

      await updateChallengeProgress(userId, metric, value);

      expect(mockPoolQuery).toHaveBeenCalledTimes(3); // Buscar, upsert, verificar
      expect(mockPoolQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_challenge_progress SET completed = TRUE'),
      );
    });

    it('should not update progress if no active challenges for the metric', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] }); // Nenhum desafio ativo

      await updateChallengeProgress('user123', 'sales_volume', 50);

      expect(mockPoolQuery).toHaveBeenCalledTimes(1); // Apenas a busca por desafios
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringMatching(
          /SELECT id, target_value, reward_xp FROM gamification_challenges\s+WHERE metric = \$1 AND start_date <= NOW\(\) AND end_date >= NOW\(\)/s,
        ),
        ['sales_volume'],
      );
    });

    it('should not update if challenge is already completed', async () => {
      const userId = 'user123';
      const metric = 'sales_volume';
      const value = 60;
      const challengeId = 1;

      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: challengeId, target_value: 100, reward_xp: 50 }],
      });
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // Upsert
      mockPoolQuery.mockResolvedValueOnce({ rows: [{ current_value: 120, completed: true }] }); // Já completado

      await updateChallengeProgress(userId, metric, value);

      expect(mockPoolQuery).toHaveBeenCalledTimes(3); // Buscar, upsert, verificar
      expect(mockPoolQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_challenge_progress SET completed = TRUE'),
      );
    });

    it('should throw AppError if database query fails during challenge search', async () => {
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Error', 500));

      await expect(updateChallengeProgress('user123', 'sales_volume', 50)).rejects.toThrow(
        AppError,
      );
    });

    it('should throw AppError if database query fails during progress upsert', async () => {
      const userId = 'user123';
      const metric = 'sales_volume';
      const value = 50;
      const challengeId = 1;

      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: challengeId, target_value: 100, reward_xp: 50 }],
      });
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Upsert Error', 500));

      await expect(updateChallengeProgress(userId, metric, value)).rejects.toThrow(AppError);
    });

    it('should throw AppError if database query fails during progress check', async () => {
      const userId = 'user123';
      const metric = 'sales_volume';
      const value = 50;
      const challengeId = 1;

      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: challengeId, target_value: 100, reward_xp: 50 }],
      });
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // Upsert
      mockPoolQuery.mockRejectedValueOnce(new AppError('DB Progress Check Error', 500));

      await expect(updateChallengeProgress(userId, metric, value)).rejects.toThrow(AppError);
    });
  });
});
