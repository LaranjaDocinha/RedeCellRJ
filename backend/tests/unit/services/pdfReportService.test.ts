import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pdfReportService } from '../../../src/services/pdfReportService.js';
import { executiveDashboardService } from '../../../src/services/executiveDashboardService.js';

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFillColor: vi.fn().mockReturnThis(),
    rect: vi.fn().mockReturnThis(),
    setTextColor: vi.fn().mockReturnThis(),
    setFontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    setDrawColor: vi.fn().mockReturnThis(),
    setLineWidth: vi.fn().mockReturnThis(),
    roundedRect: vi.fn().mockReturnThis(),
    autoTable: vi.fn().mockReturnThis(),
    splitTextToSize: vi.fn().mockImplementation((t) => [t]),
    output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
    lastAutoTable: { cursor: { y: 100 } }
  })),
}));

vi.mock('../../../src/services/executiveDashboardService.js', () => ({
  executiveDashboardService: {
    getStats: vi.fn(),
  },
}));

describe('PdfReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateExecutiveInfographic', () => {
    it('should generate PDF arraybuffer from executive stats', async () => {
      const mockStats = {
        avgMargin: 20,
        serviceConversion: { completed: 8, total: 10 },
        salesByChannel: [{ channel: 'Store', count: 5, revenue: 1000 }],
        insights: ['Increase stock', 'Great performance']
      };
      vi.mocked(executiveDashboardService.getStats).mockResolvedValue(mockStats as any);

      const result = await pdfReportService.generateExecutiveInfographic();

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(executiveDashboardService.getStats).toHaveBeenCalled();
    });
  });
});
