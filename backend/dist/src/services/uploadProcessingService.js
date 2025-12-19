import sharp from 'sharp';
import path from 'path';
import { AppError } from '../utils/errors.js';
export const uploadProcessingService = {
    async processImage(filePath, outputDirectory, originalFileName, options = {}) {
        const { width = 800, quality = 80, format = 'webp' } = options; // Padrão WebP e 800px de largura
        const fileNameWithoutExt = path.parse(originalFileName).name;
        const optimizedFileName = `${fileNameWithoutExt}-${width}w.${format}`;
        const outputPath = path.join(outputDirectory, optimizedFileName);
        try {
            await sharp(filePath)
                .resize(width)
                .toFormat(format, { quality })
                .toFile(outputPath);
            return optimizedFileName; // Retorna apenas o nome do arquivo otimizado
        }
        catch (error) {
            console.error('Error processing image with Sharp:', error);
            throw new AppError('Failed to process image for optimization', 500);
        }
    },
    // Método placeholder para processamento de documentos com OCR, se necessário no futuro
    async processDocumentOcr(filePath) {
        // Esta função existia no handler, aqui seria um placeholder para o serviço OCR
        // ocrService.recognizeText(filePath) e ocrService.extractDocumentData(ocrText)
        // Para manter a demonstração, apenas um placeholder.
        return { ocrText: 'OCR Placeholder', extractedData: {} };
    },
};
