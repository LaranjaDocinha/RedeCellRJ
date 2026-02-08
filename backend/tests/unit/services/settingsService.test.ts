import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../../../src/services/settingsService.js';
import { AppError } from '../../../src/utils/errors.js';
import * as dbModule from '../../../src/db/index.js';

// Mock the whole module
vi.mock('../../../src/db/index.js', () => {
  const mockPool = {
    query: vi.fn(),
    connect: vi.fn(),
  };
  return {
    getPool: vi.fn(() => mockPool),
    query: mockPool.query,
    connect: mockPool.connect,
    default: mockPool,
  };
});

describe('SettingsService', () => {
  let mockPool: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPool = dbModule.getPool();
  });

  describe('getAllSettings', () => {
    it('deve retornar configurações estruturadas mescladas com valores do DB', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ key: 'inventory_valuation_method', value: 'fifo' }],
      });

      const settings = await settingsService.getAllSettings();

      expect(mockPool.query).toHaveBeenCalledWith('SELECT key, value, description FROM settings');
      expect(
        settings.inventory.settings.find((s: any) => s.key === 'inventory_valuation_method')?.value,
      ).toBe('fifo');
    });

    it('deve usar valor padrão se chave não existir no DB', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const settings = await settingsService.getAllSettings();
      expect(
        settings.inventory.settings.find((s: any) => s.key === 'inventory_valuation_method')?.value,
      ).toBe('average_cost');
    });
  });

  describe('getSettingByKey', () => {
    it('deve retornar a configuração se encontrada', async () => {
      const mockSetting = { key: 'test', value: 'val' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockSetting] });

      const result = await settingsService.getSettingByKey('test');
      expect(result).toEqual(mockSetting);
    });
  });

  describe('createSetting', () => {
    it('deve criar uma nova configuração', async () => {
      const mockSetting = { key: 'k', value: 'v' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockSetting] });

      const result = await settingsService.createSetting(mockSetting);
      expect(result).toEqual(mockSetting);
    });

    it('deve lançar erro se chave já existir (código 23505)', async () => {
      const error = new Error('Unique violation');
      (error as any).code = '23505';
      mockPool.query.mockRejectedValueOnce(error);

      await expect(settingsService.createSetting({ key: 'dup', value: 'val' })).rejects.toThrow(
        'Setting with this key already exists',
      );
    });
  });

  describe('updateSetting', () => {
    it('deve atualizar configuração existente', async () => {
      const mockSetting = { key: 'k', value: 'new' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockSetting] });

      const result = await settingsService.updateSetting('k', { value: 'new' });
      expect(result).toEqual(mockSetting);
    });
  });

  describe('deleteSetting', () => {
    it('deve deletar configuração existente', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });
      const result = await settingsService.deleteSetting('k');
      expect(result).toBe(true);
    });

    it('deve retornar false se configuração não encontrada para deletar', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 0 });
      const result = await settingsService.deleteSetting('k');
      expect(result).toBe(false);
    });
  });
});
