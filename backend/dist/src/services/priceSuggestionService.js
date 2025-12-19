import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import pool from '../db/index.js'; // Assuming direct DB access for product data
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let generativeAI;
let geminiModel;
if (GEMINI_API_KEY) {
    generativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = generativeAI.getGenerativeModel({ model: "gemini-pro" });
    logger.info("Gemini-Pro model initialized for price suggestion.");
}
else {
    logger.warn("GEMINI_API_KEY not set. Price suggestion will be mocked.");
}
export const priceSuggestionService = {
    async suggestProductPrice(productId, competitorPrice, marketData) {
        if (!geminiModel) {
            // Mocked response if API key is missing
            const productRes = await pool.query('SELECT p.name, pv.price, pv.cost_price FROM products p JOIN product_variations pv ON p.id = pv.product_id WHERE p.id = $1 LIMIT 1', [productId]);
            const product = productRes.rows[0];
            if (!product)
                throw new Error('Product not found for price suggestion mock.');
            const suggestedPrice = competitorPrice ? competitorPrice * 0.95 : product.price * 1.1; // Simple mock
            return { suggestedPrice: parseFloat(suggestedPrice.toFixed(2)), reasoning: "Mocked suggestion: 95% of competitor or 10% above current. (GEMINI_API_KEY not set)." };
        }
        try {
            // Fetch product details
            const productDetails = await pool.query(`SELECT
           p.name AS product_name,
           pv.price AS current_price,
           pv.cost_price,
           pv.storage_capacity,
           pv.color,
           (SELECT AVG(si.unit_price) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.product_id = p.id AND s.sale_date > NOW() - INTERVAL '90 days') AS avg_sales_price_90d,
           (SELECT COUNT(si.id) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.product_id = p.id AND s.sale_date > NOW() - INTERVAL '90 days') AS sales_count_90d
         FROM products p
         JOIN product_variations pv ON p.id = pv.product_id
         WHERE p.id = $1 LIMIT 1`, [productId]);
            const product = productDetails.rows[0];
            if (!product)
                throw new NotFoundError('Product not found for price suggestion.');
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
            if (typeof suggestion.suggestedPrice !== 'number' || typeof suggestion.reasoning !== 'string') {
                throw new Error('Invalid LLM response format for price suggestion.');
            }
            return suggestion;
        }
        catch (error) {
            logger.error('Error suggesting price with Gemini API:', error);
            // Fallback to basic rule-based suggestion if API fails
            const productRes = await pool.query('SELECT p.name, pv.price, pv.cost_price FROM products p JOIN product_variations pv ON p.id = pv.product_id WHERE p.id = $1 LIMIT 1', [productId]);
            const product = productRes.rows[0];
            if (!product)
                throw new Error('Product not found for price suggestion fallback.');
            const suggestedPrice = competitorPrice ? competitorPrice * 0.95 : product.price * 1.05; // Simple mock
            return { suggestedPrice: parseFloat(suggestedPrice.toFixed(2)), reasoning: `Fallback suggestion. Could not use LLM. (Current price: ${product.price}, Cost: ${product.cost_price}).` };
        }
    },
};
