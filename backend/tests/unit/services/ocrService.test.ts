import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ocrService } from '../../../src/services/ocrService.js';
import { createWorker } from 'tesseract.js';

// Mock do módulo 'tesseract.js'
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(),
}));

describe('ocrService', () => {
  let mockRecognize: ReturnType<typeof vi.fn>;
  let mockTerminate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecognize = vi.fn();
    mockTerminate = vi.fn(() => Promise.resolve());

    // @ts-ignore
    createWorker.mockImplementation(() => ({
      load: vi.fn(() => Promise.resolve()),
      loadLanguage: vi.fn(() => Promise.resolve()),
      initialize: vi.fn(() => Promise.resolve()),
      recognize: mockRecognize,
      terminate: mockTerminate,
    }));
  });

  describe('recognizeText', () => {
    it('should recognize text from an image successfully', async () => {
      const imagePath = 'path/to/image.png';
      const recognizedText = 'Extracted text from image.';

      mockRecognize.mockResolvedValueOnce({ data: { text: recognizedText } });

      const result = await ocrService.recognizeText(imagePath);

      expect(createWorker).toHaveBeenCalledWith('eng');
      expect(mockRecognize).toHaveBeenCalledWith(imagePath);
      expect(result).toBe(recognizedText);
      expect(mockTerminate).toHaveBeenCalled();
    });

    it('should throw an error if Tesseract.js fails to recognize text', async () => {
      const imagePath = 'path/to/error.png';
      const ocrError = new Error('OCR failed');

      mockRecognize.mockRejectedValueOnce(ocrError);

      await expect(ocrService.recognizeText(imagePath)).rejects.toThrow(ocrError);
      expect(createWorker).toHaveBeenCalledWith('eng');
      expect(mockRecognize).toHaveBeenCalledWith(imagePath);
      expect(mockTerminate).toHaveBeenCalled();
    });

    it('should terminate the worker even if recognition fails', async () => {
      const imagePath = 'path/to/image.png';
      const ocrError = new Error('OCR Error');

      mockRecognize.mockRejectedValueOnce(ocrError);

      await expect(ocrService.recognizeText(imagePath)).rejects.toThrow(ocrError);
      expect(mockTerminate).toHaveBeenCalled();
    });
  });

  describe('extractDocumentData', () => {
    it('should extract name and CPF from OCR text', async () => {
      const ocrText = `
        DOCUMENTO IDENTIDADE
        Nome: João da Silva
        CPF: 123.456.789-00
        Endereço: Rua Teste, 123
      `;
      const expectedData = {
        name: 'João da Silva',
        cpf: '123.456.789-00',
      };

      const result = await ocrService.extractDocumentData(ocrText);

      expect(result).toEqual(expectedData);
    });

    it('should return an empty object if no data can be extracted', async () => {
      const ocrText = 'This is some random text without any identifiable data.';
      const expectedData = {};

      const result = await ocrService.extractDocumentData(ocrText);

      expect(result).toEqual(expectedData);
    });

    it('should handle variations in CPF format', async () => {
      const ocrText1 = 'CPF: 11122233344';
      const ocrText2 = 'CPF: 111.222.333-44';
      const ocrText3 = 'CPF: 111.222.33344';

      expect(await ocrService.extractDocumentData(ocrText1)).toEqual({ cpf: '11122233344' });
      expect(await ocrService.extractDocumentData(ocrText2)).toEqual({ cpf: '111.222.333-44' });
      expect(await ocrService.extractDocumentData(ocrText3)).toEqual({ cpf: '111.222.33344' });
    });

    it('should handle variations in name capitalization', async () => {
      const ocrText1 = 'nome: maria souza';
      const ocrText2 = 'NOME: PEDRO ALVES';

      expect(await ocrService.extractDocumentData(ocrText1)).toEqual({ name: 'maria souza' });
      expect(await ocrService.extractDocumentData(ocrText2)).toEqual({ name: 'PEDRO ALVES' });
    });
  });
});