import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const aiHelpService = {
  async getChatResponse(question: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError('Gemini API Key not configured', 500);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
        Você é o Assistente Virtual da Redecell RJ, um sistema de gestão de assistência técnica e xerox.
        Sua função é ajudar os FUNCIONÁRIOS a operarem o sistema.
        
        Principais processos:
        - PDV: Para vender, clique em Vendas no menu ou use Ctrl+K e digite "Venda".
        - OS: Para abrir ordem de serviço, use o botão Novo no menu Reception.
        - Impressão: O custo é calculado por página no PDV. Use o botão "Calc. Impressão".
        - Clientes: Cadastro exige Nome, Telefone e CEP para preenchimento automático.
        
        Responda de forma curta, profissional e direta. Se não souber algo sobre um processo interno específico da loja física, peça para consultar o gerente.
      `;

      const result = await model.generateContent([systemPrompt, question]);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      logger.error('AI Help Failed:', error);
      throw new AppError('Falha na Central de Ajuda: ' + error.message, 500);
    }
  },
};
