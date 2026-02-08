import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateClv } from '../../../src/services/clvService.js';
import { getPool } from '../../../src/db/index.js';

// Mock do pool do banco de dados
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('clvService', () => {
  let mockQuery: vi.Mock;
  let mockPgClient: any;
  let mockPool: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQuery = vi.fn();
    mockPgClient = {
      query: mockQuery,
      release: vi.fn(),
    };
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockPgClient),
    };
    (getPool as vi.Mock).mockReturnValue(mockPool);
  });

  it('deve calcular o CLV corretamente para um cliente com histórico de compras', async () => {
    const customerId = '123';
    // Simula dados de venda de um ano
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          total_revenue: '1000.00',
          num_purchases: '10',
          first_purchase_date: new Date('2024-01-01'),
          last_purchase_date: new Date('2024-12-31'),
        },
      ],
    });

    const result = await calculateClv(customerId);

    expect(mockPgClient.query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT\s+SUM\(total_amount\)\s+as\s+total_revenue/),
      [customerId],
    );
    expect(result.customer_id).toBe(123);
    expect(result.total_revenue).toBe(1000);
    expect(result.num_purchases).toBe(10);

    // Lifespan < 1 ano -> 3 anos
    expect(result.customer_lifespan_years).toBe(3);
    expect(result.apv).toBeCloseTo(100);
    expect(result.apf).toBeCloseTo(10 / 3);
    expect(result.clv).toBeCloseTo(1000);
    expect(mockPgClient.release).toHaveBeenCalled();
  });

  it('deve retornar CLV 0 para um cliente sem dados de compra', async () => {
    const customerId = '456';
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          total_revenue: null,
          num_purchases: '0',
          first_purchase_date: null,
          last_purchase_date: null,
        },
      ],
    });

    const result = await calculateClv(customerId);

    expect(mockPgClient.query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT\s+SUM\(total_amount\)\s+as\s+total_revenue/),
      [customerId],
    );
    expect(result.customer_id).toBe(456);
    expect(result.clv).toBe(0);
    expect(result.message).toBe('No purchase data for this customer.');
    expect(mockPgClient.release).toHaveBeenCalled();
  });

  it('deve usar o lifespan padrão de 3 anos se o histórico de compras for menor que um ano', async () => {
    const customerId = '789';
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          total_revenue: '300.00',
          num_purchases: '3',
          first_purchase_date: new Date('2024-01-01'),
          last_purchase_date: new Date('2024-03-01'), // Menos de um ano
        },
      ],
    });

    const result = await calculateClv(customerId);

    expect(result.customer_id).toBe(789);
    expect(result.customer_lifespan_years).toBe(3);
    expect(result.apv).toBeCloseTo(100);
    expect(result.apf).toBeCloseTo(1);
    expect(result.clv).toBeCloseTo(300);
    expect(mockPgClient.release).toHaveBeenCalled();
  });

  it('deve lançar erro se a consulta ao banco falhar', async () => {
    const customerId = '999';
    const dbError = new Error('Database connection error');
    mockPool.connect.mockRejectedValueOnce(dbError);

    await expect(calculateClv(customerId)).rejects.toThrow(dbError);
  });

  it('deve sempre liberar o cliente do pool, mesmo se ocorrer um erro após a consulta', async () => {
    const customerId = '111';
    mockQuery.mockImplementationOnce(() => {
      throw new Error('Erro na query SQL');
    });

    await expect(calculateClv(customerId)).rejects.toThrow('Erro na query SQL');
    expect(mockPgClient.release).toHaveBeenCalled(); // Deve chamar release
  });
});
