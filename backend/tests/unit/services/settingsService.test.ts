import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../../../src/services/settingsService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSettings', () => {
    it('deve retornar configurações estruturadas mescladas com valores do DB', async () => {
      // Mock do retorno do banco
      (pool.query as vi.Mock).mockResolvedValueOnce({
        rows: [
          { key: 'inventory_valuation_method', value: 'fifo' },
          { key: 'some_other_key', value: 'some_value' } // Deve ser ignorado se não estiver na estrutura fixa
        ],
      });

      const settings = await settingsService.getAllSettings();

      expect(pool.query).toHaveBeenCalledWith('SELECT key, value FROM settings');
      
      // Verifica se a estrutura retornada contém o valor do banco
      expect(settings).toHaveProperty('inventory');
      const inventorySettings = settings.inventory.settings;
      const valuationSetting = inventorySettings.find(s => s.key === 'inventory_valuation_method');
      
      expect(valuationSetting).toBeDefined();
      expect(valuationSetting?.value).toBe('fifo');
    });

    it('deve usar valor padrão se chave não existir no DB', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });

      const settings = await settingsService.getAllSettings();

      const inventorySettings = settings.inventory.settings;
      const valuationSetting = inventorySettings.find(s => s.key === 'inventory_valuation_method');
      
      expect(valuationSetting?.value).toBe('average_cost'); // Valor padrão hardcoded no serviço
    });
  });

  describe('getSettingByKey', () => {
    it('deve retornar a configuração se encontrada', async () => {
      const mockSetting = { id: 1, key: 'test_key', value: 'test_value' };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [mockSetting] });

      const result = await settingsService.getSettingByKey('test_key');
      expect(result).toEqual(mockSetting);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM settings WHERE key = $1', ['test_key']);
    });

    it('deve retornar undefined se não encontrada', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await settingsService.getSettingByKey('non_existent');
      expect(result).toBeUndefined();
    });
  });

  describe('createSetting', () => {
    it('deve criar uma nova configuração', async () => {
      const payload = { key: 'new_key', value: 'new_value', description: 'desc' };
      const createdSetting = { id: 1, ...payload };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [createdSetting] });

      const result = await settingsService.createSetting(payload);
      expect(result).toEqual(createdSetting);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO settings (key, value, description) VALUES ($1, $2, $3) RETURNING *',
        ['new_key', 'new_value', 'desc']
      );
    });

    it('deve lançar erro se chave já existir (código 23505)', async () => {
      const error: any = new Error('Duplicate key');
      error.code = '23505';
      (pool.query as vi.Mock).mockRejectedValueOnce(error);

      await expect(settingsService.createSetting({ key: 'dup', value: 'val' }))
        .rejects.toThrow('Setting with this key already exists');
    });

    it('deve relançar outros erros', async () => {
      (pool.query as vi.Mock).mockRejectedValueOnce(new Error('DB Error'));

      await expect(settingsService.createSetting({ key: 'k', value: 'v' }))
        .rejects.toThrow('DB Error');
    });

    it('deve relançar AppError se ocorrer', async () => {
      const appError = new AppError('Custom Error', 400);
      (pool.query as vi.Mock).mockRejectedValueOnce(appError);

      await expect(settingsService.createSetting({ key: 'k', value: 'v' }))
        .rejects.toThrow('Custom Error');
    });
  });

  describe('updateSetting', () => {
    it('deve atualizar configuração existente', async () => {
      const updatedSetting = { id: 1, key: 'k', value: 'updated', description: 'updated desc' };
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [updatedSetting] });

      const result = await settingsService.updateSetting('k', { value: 'updated', description: 'updated desc' });
      
      expect(result).toEqual(updatedSetting);
      // Verifica se a query contém os campos corretos. A ordem pode variar se a implementação mudar, mas aqui testamos a lógica atual.
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE settings SET value = \$1, description = \$2, updated_at = current_timestamp WHERE key = \$3 RETURNING \*/),
        ['updated', 'updated desc', 'k']
      );
    });

    it('deve atualizar apenas um campo', async () => {
       const updatedSetting = { id: 1, key: 'k', value: 'updated' };
       (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [updatedSetting] });

       await settingsService.updateSetting('k', { value: 'updated' });

       expect(pool.query).toHaveBeenCalledWith(
         expect.stringMatching(/UPDATE settings SET value = \$1, updated_at = current_timestamp WHERE key = \$2 RETURNING \*/),
         ['updated', 'k']
       );
    });

    it('deve retornar configuração atual se nenhum campo for passado para atualização', async () => {
      const currentSetting = { id: 1, key: 'k', value: 'curr' };
      // O serviço chama getSettingByKey internamente
      (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [currentSetting] });

      const result = await settingsService.updateSetting('k', {});
      expect(result).toEqual(currentSetting);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM settings WHERE key = $1', ['k']);
    });
    
    it('deve retornar undefined se configuração não encontrada na atualização', async () => {
        (pool.query as vi.Mock).mockResolvedValueOnce({ rows: [] });
        
        const result = await settingsService.updateSetting('non_existent', { value: 'v' });
        expect(result).toBeUndefined();
    });
  });

  describe('deleteSetting', () => {
    it('deve deletar configuração existente', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await settingsService.deleteSetting('k');
      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM settings WHERE key = $1 RETURNING key', ['k']);
    });

    it('deve retornar false se configuração não encontrada para deletar', async () => {
      (pool.query as vi.Mock).mockResolvedValueOnce({ rowCount: 0 });

      const result = await settingsService.deleteSetting('k');
      expect(result).toBe(false);
    });
  });
});
