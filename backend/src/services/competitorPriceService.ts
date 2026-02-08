export interface PriceSuggestion {
  variationId: number;
  productName: string;
  currentPrice: number;
  competitorAvgPrice: number;
  suggestion: 'raise' | 'lower' | 'maintain';
  diffPercent: number;
}

export const competitorPriceService = {
  async getMarketSuggestions(variationIds: number[]): Promise<PriceSuggestion[]> {
    // Simulação de consulta a Marketplace API (ex: Mercado Livre)
    return variationIds.map((id) => {
      const mockCompetitorPrice = 100 + Math.random() * 200;
      const currentPrice = mockCompetitorPrice * (0.8 + Math.random() * 0.4);
      const diff = ((mockCompetitorPrice - currentPrice) / currentPrice) * 100;

      return {
        variationId: id,
        productName: `Produto Mock #${id}`,
        currentPrice: Number(currentPrice.toFixed(2)),
        competitorAvgPrice: Number(mockCompetitorPrice.toFixed(2)),
        suggestion: diff > 5 ? 'raise' : diff < -5 ? 'lower' : 'maintain',
        diffPercent: Number(diff.toFixed(1)),
      };
    });
  },
};
