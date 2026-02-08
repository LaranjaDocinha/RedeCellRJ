import sharp from 'sharp';
import path from 'path';
import { AppError } from '../utils/errors.js';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number; // Para WebP, entre 0 e 100
  format?: 'webp' | 'jpeg' | 'png';
}

export const uploadProcessingService = {
  async processImage(
    filePath: string,
    outputDirectory: string,
    originalFileName: string,
    options: ImageProcessingOptions = {},
  ): Promise<string> {
    const { width = 800, quality = 80, format = 'webp' } = options; // Padrão WebP e 800px de largura

    const fileNameWithoutExt = path.parse(originalFileName).name;
    const optimizedFileName = `${fileNameWithoutExt}-${width}w.${format}`;
    const outputPath = path.join(outputDirectory, optimizedFileName);

    try {
      await sharp(filePath).resize(width).toFormat(format, { quality }).toFile(outputPath);

      return optimizedFileName; // Retorna apenas o nome do arquivo otimizado
    } catch (error) {
      console.error('Error processing image with Sharp:', error);
      throw new AppError('Failed to process image for optimization', 500);
    }
  },

  // Método placeholder para processamento de documentos com OCR, se necessário no futuro
  async processDocumentOcr(_filePath: string) {
    // Esta função existia no handler, aqui seria um placeholder para o serviço OCR
    // ocrService.recognizeText(filePath) e ocrService.extractDocumentData(ocrText)
    // Para manter a demonstração, apenas um placeholder.
    return { ocrText: 'OCR Placeholder', extractedData: {} };
  },
};
