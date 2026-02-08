import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiDiagnosticService } from '../../../src/services/aiDiagnosticService.js';
import { AppError } from '../../../src/utils/errors.js';
import fs from 'fs';

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

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn().mockReturnValue(Buffer.from('test-image')),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { error: vi.fn() },
}));

describe('AiDiagnosticService', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  describe('analyzeImage', () => {
    it('should analyze image and return parsed JSON', async () => {
      const mockResult = {
        response: {
          text: () => '{"device_type": "Phone", "damages": ["screen crack"], "condition_grade": "C", "confidence": 90}',
        },
      };
      mockGenerateContent.mockResolvedValueOnce(mockResult);

      const result = await aiDiagnosticService.analyzeImage('test.jpg');

      expect(result.device_type).toBe('Phone');
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('test.jpg');
    });

    it('should throw AppError if API key missing', async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(aiDiagnosticService.analyzeImage('test.jpg')).rejects.toThrow('Gemini API Key not configured');
    });

    it('should handle AI analysis failure', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('AI Error'));
      await expect(aiDiagnosticService.analyzeImage('test.jpg')).rejects.toThrow('Falha na análise de IA');
    });

    it('should clean markdown from AI response', async () => {
      const mockResult = {
        response: {
          text: () => `\`\`\`json
{"device_type": "Tablet"}
\`\`\``,
        },
      };
      mockGenerateContent.mockResolvedValueOnce(mockResult);

      const result = await aiDiagnosticService.analyzeImage('test.jpg');
      expect(result.device_type).toBe('Tablet');
    });
  });
});
