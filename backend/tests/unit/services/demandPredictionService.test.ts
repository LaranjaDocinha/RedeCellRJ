import { describe, it, expect, vi, beforeEach } from 'vitest';
import { demandPredictionService } from '../../../src/services/demandPredictionService.js';
import { predictionRepository } from '../../../src/repositories/prediction.repository.js';

vi.mock('../../../src/repositories/prediction.repository.js', () => ({
  predictionRepository: {
    getMonthlySalesHistory: vi.fn(),
  },
}));

describe('DemandPredictionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should predict demand based on average sales', async () => {
    vi.mocked(predictionRepository.getMonthlySalesHistory).mockResolvedValue([
      { month: '2023-01', quantity: 10 },
      { month: '2023-02', quantity: 20 },
    ]);

    const res = await demandPredictionService.predictDemand(1, 2);
    // Weighted Average for 2 months: (10*1 + 20*2) / (1+2) = 50 / 3 = 16.66 -> Ceil = 17
    // If it was simple average: 15.
    // The service uses weighted average.
    expect(res).toBe(17);
  });
});
