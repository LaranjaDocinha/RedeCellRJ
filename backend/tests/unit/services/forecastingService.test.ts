import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePurchaseSuggestions } from '../../../src/services/forecastingService.js';
import { query } from '../../../src/db/index.js';

// Mock do módulo db/index.js para controlar a função `query`
vi.mock('../../../src/db/index.js', () => ({
  query: vi.fn(),
}));

const EXPECTED_SALES_HISTORY_QUERY = `
    SELECT 
      p.id, 
      p.name, 
      p.stock_quantity, 
      p.min_stock_level,
      SUM(si.quantity) as total_sold_90d
    FROM products p
    LEFT JOIN product_variations pv ON p.id = pv.product_id
    LEFT JOIN sale_items si ON pv.id = si.variation_id
    LEFT JOIN sales s ON si.sale_id = s.id
    WHERE s.sale_date >= NOW() - INTERVAL '90 days'
    GROUP BY p.id
  `;

// Helper function to normalize SQL queries for comparison
function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('forecastingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve gerar sugestões de compra para produtos com demanda e estoque insuficiente', async () => {
    (query as vi.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'prod1',
          name: 'Produto A',
          stock_quantity: '5',
          min_stock_level: '10',
          total_sold_90d: '900', // 10 vendas/dia
        },
        {
          id: 'prod2',
          name: 'Produto B',
          stock_quantity: '20',
          min_stock_level: '5',
          total_sold_90d: '0', // Nenhuma venda
        },
      ],
    });

    const suggestions = await generatePurchaseSuggestions();

    expect(query).toHaveBeenCalledTimes(1);
    // Verificar se a query chamada corresponde à esperada (normalizada)
    const calledQuery = (query as vi.Mock).mock.calls[0][0];
    expect(normalizeSql(calledQuery)).toBe(normalizeSql(EXPECTED_SALES_HISTORY_QUERY));

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toEqual(
      expect.objectContaining({
        productId: 'prod1',
        productName: 'Produto A',
        currentStock: 5,
        avgDailySales: '10.00', // 900 / 90
        idealStock: Math.ceil(10 * 30 * 1.2), // 360
        suggestion: 355, // 360 - 5
        status: 'low', // 5 < 10
      })
    );
  });

  it('deve identificar produtos com estoque crítico e sugerir compra', async () => {
    (query as vi.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'prod3',
          name: 'Produto C',
          stock_quantity: '0',
          min_stock_level: '5',
          total_sold_90d: '180', // 2 vendas/dia
        },
      ],
    });

    const suggestions = await generatePurchaseSuggestions();

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toEqual(
      expect.objectContaining({
        productId: 'prod3',
        productName: 'Produto C',
        currentStock: 0,
        avgDailySales: '2.00',
        idealStock: Math.ceil(2 * 30 * 1.2), // 72
        suggestion: 72, // 72 - 0
        status: 'critical',
      })
    );
  });

  it('não deve sugerir compra para produtos com estoque saudável', async () => {
    (query as vi.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'prod4',
          name: 'Produto D',
          stock_quantity: '500',
          min_stock_level: '10',
          total_sold_90d: '900', // 10 vendas/dia
        },
      ],
    });

    const suggestions = await generatePurchaseSuggestions();
    expect(suggestions).toHaveLength(0); // Estoque saudável não deve gerar sugestão
  });

  it('não deve sugerir compra para produtos com estoque superestocado', async () => {
    (query as vi.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'prod5',
          name: 'Produto E',
          stock_quantity: '1000',
          min_stock_level: '10',
          total_sold_90d: '90', // 1 venda/dia
        },
      ],
    });

    const suggestions = await generatePurchaseSuggestions();
    expect(suggestions).toHaveLength(0); // Superestocado não deve gerar sugestão
  });

  it('deve retornar um array vazio se não houver histórico de vendas', async () => {
    (query as vi.Mock).mockResolvedValueOnce({ rows: [] });

    const suggestions = await generatePurchaseSuggestions();
    expect(suggestions).toHaveLength(0);
  });

  it('deve lançar erro se a consulta ao banco falhar', async () => {
    const dbError = new Error('Database error during sales history fetch');
    (query as vi.Mock).mockRejectedValueOnce(dbError);

    await expect(generatePurchaseSuggestions()).rejects.toThrow(dbError);
  });
});