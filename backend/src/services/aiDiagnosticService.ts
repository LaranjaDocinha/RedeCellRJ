import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString('base64'),
      mimeType,
    },
  };
}

export const aiDiagnosticService = {
  async analyzeImage(filePath: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError('Gemini API Key not configured', 500);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Analise esta imagem de um dispositivo eletrônico (celular, tablet, notebook).
        Identifique danos físicos visíveis.
        Retorne APENAS um JSON válido (sem markdown) no seguinte formato:
        {
          "device_type": "string (ex: Smartphone, Laptop)",
          "damages": ["lista", "de", "danos", "em", "português"],
          "condition_grade": "A/B/C/D (A=Novo, D=Sucata)",
          "confidence": number (0-100)
        }
      `;

      const imagePart = fileToGenerativePart(filePath, 'image/jpeg'); // Assuming JPEG for simplicity, logic should handle others

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Limpeza básica para extrair JSON caso venha com markdown
      const jsonStr = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(jsonStr);
    } catch (error: any) {
      logger.error('AI Analysis Failed:', error);
      throw new AppError('Falha na análise de IA: ' + error.message, 500);
    }
  },
};
