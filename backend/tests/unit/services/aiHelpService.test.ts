import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { aiHelpService } from '../../../src/services/aiHelpService.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock AI SDK
const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

describe('AiHelpService', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  describe('getChatResponse', () => {
    it('should return AI text response', async () => {
      const mockResult = {
        response: {
          text: () => 'Para abrir uma OS, vá em Reception.',
        },
      };
      mockGenerateContent.mockResolvedValueOnce(mockResult);

      const result = await aiHelpService.getChatResponse('Como abrir uma OS?');

      expect(result).toBe('Para abrir uma OS, vá em Reception.');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw AppError if API key missing', async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(aiHelpService.getChatResponse('hi')).rejects.toThrow('Gemini API Key not configured');
    });

    it('should handle AI failure', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Fail'));
      await expect(aiHelpService.getChatResponse('hi')).rejects.toThrow('Falha na Central de Ajuda');
    });
  });
});
