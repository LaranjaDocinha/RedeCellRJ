import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import { productRepository } from '../repositories/product.repository.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let generativeAI: GoogleGenerativeAI | undefined;
let geminiModel: any;

if (GEMINI_API_KEY) {
  generativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = generativeAI.getGenerativeModel({ model: 'gemini-pro' });
  logger.info('Gemini-Pro model initialized for price suggestion.');
} else {
  logger.warn('GEMINI_API_KEY not set. Price suggestion will use rule-based logic.');
}

export const priceSuggestionService = {
  async suggestProductPrice(
    productId: number,
    competitorPrice?: number,
    marketData?: any,
  ): Promise<{ suggestedPrice: number; reasoning: string }> {
    const product = await productRepository.getProductStats(productId);
    if (!product) throw new NotFoundError('Product not found for price suggestion.');

    if (!geminiModel) {
      // Smart Fallback Logic
      let suggestedPrice = parseFloat(product.current_price);
      let reasoning = 'Rule-based suggestion: ';

      if (competitorPrice) {
        suggestedPrice = competitorPrice * 0.98; // Undercut by 2%
        reasoning += `Undercutting competitor (R$ ${competitorPrice}) by 2%.`;
      } else {
        // Margin based on sales velocity
        const salesVelocity = parseInt(product.sales_count_90d || '0');
        const cost = parseFloat(product.cost_price);

        if (salesVelocity > 50) {
          // High demand
          suggestedPrice = cost * 1.4; // 40% margin
          reasoning += 'High demand detected (>50 sales/90d). Target 40% margin.';
        } else if (salesVelocity < 5) {
          // Low demand
          suggestedPrice = cost * 1.2; // 20% margin to clear stock
          reasoning += 'Low demand detected (<5 sales/90d). Target 20% margin to clear stock.';
        } else {
          suggestedPrice = cost * 1.3; // Standard 30% margin
          reasoning += 'Standard demand. Target 30% margin.';
        }
      }

      return { suggestedPrice: parseFloat(suggestedPrice.toFixed(2)), reasoning };
    }

    try {
      const prompt = `
        Analyze the following product data and suggest a competitive selling price.
        Consider:
        - Product Name: ${product.product_name}
        - Current Selling Price: R$ ${product.current_price}
        - Cost Price: R$ ${product.cost_price}
        - Variation: Color ${product.color}, Capacity ${product.storage_capacity || 'N/A'}
        - Average Sales Price (last 90 days): R$ ${product.avg_sales_price_90d || 'N/A'}
        - Sales Count (last 90 days): ${product.sales_count_90d || 0}
        ${competitorPrice ? `- Competitor Price: R$ ${competitorPrice}` : ''}
        ${marketData ? `- Additional Market Data: ${JSON.stringify(marketData)}` : ''}

        Provide a suggested selling price (numeric only) and a brief reasoning in a JSON object.
        Example: { "suggestedPrice": 1299.99, "reasoning": "Based on ..." }
      `;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json\n|\n```/g, '');
      const suggestion = JSON.parse(jsonText);

      if (
        typeof suggestion.suggestedPrice !== 'number' ||
        typeof suggestion.reasoning !== 'string'
      ) {
        throw new Error('Invalid LLM response format for price suggestion.');
      }

      return suggestion;
    } catch (error) {
      logger.error('Error suggesting price with Gemini API:', error);
      // Fallback to basic rule-based suggestion if API fails
      const cost = parseFloat(product.cost_price);
      const suggestedPrice = cost * 1.3;
      return {
        suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
        reasoning: `Fallback suggestion (Gemini Error). Applied standard 30% margin on cost.`,
      };
    }
  },

  // Method for used products (already existing but good to check)
  async getSuggestedUsedProductPrice(_productId: number): Promise<number | null> {
    // Mock logic for used products based on depreciation
    // Implementation can be added here
    return null;
  },
};
