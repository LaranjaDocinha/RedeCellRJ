import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let generativeAI: GoogleGenerativeAI | undefined;
let geminiModel: any;

if (GEMINI_API_KEY) {
  generativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = generativeAI.getGenerativeModel({ model: "gemini-pro" });
  logger.info("Gemini-Pro model initialized for sentiment analysis.");
} else {
  logger.warn("GEMINI_API_KEY not set. Sentiment analysis will be mocked.");
}

export const sentimentService = {
  async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    if (!text || text.trim() === '') {
      return { score: 0, label: 'Neutral' };
    }

    if (!geminiModel) {
      // Mocked response if API key is missing
      logger.warn("Mocking sentiment analysis due to missing GEMINI_API_KEY.");
      const lowerText = text.toLowerCase();
      if (lowerText.includes('ótimo') || lowerText.includes('excelente') || lowerText.includes('bom')) {
        return { score: 0.9, label: 'Positive' };
      }
      if (lowerText.includes('ruim') || lowerText.includes('péssimo') || lowerText.includes('decepcionado')) {
        return { score: 0.1, label: 'Negative' };
      }
      return { score: 0.5, label: 'Neutral' };
    }

    try {
      const prompt = `Analyze the sentiment of the following customer feedback text. Respond with only a single JSON object containing 'score' (a float between -1.0 for negative, 0.0 for neutral, and 1.0 for positive) and 'label' (either 'Positive', 'Negative', or 'Neutral').
      
      Example positive: { "score": 0.8, "label": "Positive" }
      Example negative: { "score": -0.6, "label": "Negative" }
      Example neutral: { "score": 0.1, "label": "Neutral" }

      Text: "${text}"`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json\n|\n```/g, ''); // Clean markdown formatting
      const sentiment = JSON.parse(jsonText);

      // Basic validation
      if (typeof sentiment.score !== 'number' || !['Positive', 'Negative', 'Neutral'].includes(sentiment.label)) {
        throw new Error('Invalid LLM response format.');
      }

      return sentiment;

    } catch (error) {
      logger.error('Error analyzing sentiment with Gemini API:', error);
      // Fallback to a basic rule-based analysis or neutral if API fails
      const lowerText = text.toLowerCase();
      if (lowerText.includes('ótimo') || lowerText.includes('excelente') || lowerText.includes('bom')) {
        return { score: 0.9, label: 'Positive' };
      }
      if (lowerText.includes('ruim') || lowerText.includes('péssimo') || lowerText.includes('decepcionado')) {
        return { score: 0.1, label: 'Negative' };
      }
      return { score: 0.5, label: 'Neutral' };
    }
  },
};
