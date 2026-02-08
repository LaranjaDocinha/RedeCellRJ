import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadProcessingService } from '../../../src/services/uploadProcessingService.js';
import sharp from 'sharp';
import path from 'path';

vi.mock('sharp');

describe('UploadProcessingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processImage', () => {
    it('should process image using sharp', async () => {
      const mockToFile = vi.fn().mockResolvedValue({});
      const mockToFormat = vi.fn().mockReturnValue({ toFile: mockToFile });
      const mockResize = vi.fn().mockReturnValue({ toFormat: mockToFormat });

      // Correctly mocking sharp as a default export function
      (sharp as unknown as any).mockReturnValue({ resize: mockResize });

      const result = await uploadProcessingService.processImage('input.jpg', 'out', 'file.jpg');

      expect(sharp).toHaveBeenCalledWith('input.jpg');
      expect(mockResize).toHaveBeenCalledWith(800);
      expect(mockToFormat).toHaveBeenCalledWith('webp', { quality: 80 });
      expect(mockToFile).toHaveBeenCalledWith(expect.stringContaining('file-800w.webp'));
      expect(result).toBe('file-800w.webp');
    });

    it('should accept custom options', async () => {
      const mockToFile = vi.fn().mockResolvedValue({});
      const mockToFormat = vi.fn().mockReturnValue({ toFile: mockToFile });
      const mockResize = vi.fn().mockReturnValue({ toFormat: mockToFormat });
      (sharp as unknown as any).mockReturnValue({ resize: mockResize });

      await uploadProcessingService.processImage('input.jpg', 'out', 'file.jpg', {
        width: 100,
        quality: 50,
        format: 'jpeg',
      });

      expect(mockResize).toHaveBeenCalledWith(100);
      expect(mockToFormat).toHaveBeenCalledWith('jpeg', { quality: 50 });
    });

    it('should throw AppError on failure', async () => {
      (sharp as unknown as any).mockImplementation(() => {
        throw new Error('Sharp failed');
      });

      await expect(uploadProcessingService.processImage('in', 'out', 'f.jpg')).rejects.toThrow(
        'Failed to process image for optimization',
      );
    });
  });

  describe('processDocumentOcr', () => {
    it('should return placeholder data', async () => {
      const result = await uploadProcessingService.processDocumentOcr('path');
      expect(result).toEqual({ ocrText: 'OCR Placeholder', extractedData: {} });
    });
  });
});
