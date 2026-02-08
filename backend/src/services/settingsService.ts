import { AppError } from '../utils/errors.js';
import { settingsRepository, Setting } from '../repositories/settings.repository.js';

// Keep original interfaces for compatibility with update/create operations if needed
interface CreateSettingPayload {
  key: string;
  value: string;
  description?: string;
}

interface UpdateSettingPayload {
  value?: string;
  description?: string;
}

// New structured setting type for the frontend
interface SettingOption {
  value: string;
  label: string;
}

interface StructuredSetting {
  key: string;
  value: string;
  type: 'text' | 'select' | 'boolean' | 'color' | 'password' | 'avatar';
  label: string;
  description: string;
  options?: SettingOption[];
}

interface SettingCategory {
  title: string;
  icon: string; // Icon name (e.g., from a library like Lucide)
  settings: StructuredSetting[];
}

interface AllSettingsStructured {
  [categoryKey: string]: SettingCategory;
}

class SettingsService {
  /**
   * Returns a structured, categorized list of settings for the new frontend.
   */
  async getAllSettings(): Promise<AllSettingsStructured> {
    const dbSettingsList = await settingsRepository.findAll();
    const dbSettings: { [key: string]: string } = {};

    dbSettingsList.forEach((row) => {
      dbSettings[row.key] = row.value;
    });

    const settings: AllSettingsStructured = {
      // ... (profile, general, appearance, notifications categories)
      inventory: {
        title: 'Inventário',
        icon: 'Box', // You might need to add this icon to the frontend map
        settings: [
          {
            key: 'inventory_valuation_method',
            value: dbSettings['inventory_valuation_method'] || 'average_cost',
            type: 'select',
            label: 'Método de Valorização de Estoque',
            description: 'O método contábil usado para calcular o valor do seu estoque.',
            options: [
              { value: 'average_cost', label: 'Custo Médio Ponderado' },
              { value: 'fifo', label: 'PEPS (Primeiro a Entrar, Primeiro a Sair)' },
            ],
          },
        ],
      },
      security: {
        title: 'Segurança',
        icon: 'Lock',
        settings: [], // Adicione configurações de segurança aqui quando houver
      },
    };

    return Promise.resolve(settings);
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    return settingsRepository.findByKey(key);
  }

  async createSetting(payload: CreateSettingPayload): Promise<Setting> {
    const { key, value, description } = payload;
    try {
      return await settingsRepository.create({ key, value, description });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        throw new AppError('Setting with this key already exists', 409);
      }
      throw error;
    }
  }

  async updateSetting(key: string, payload: UpdateSettingPayload): Promise<Setting | undefined> {
    return settingsRepository.update(key, payload);
  }

  async deleteSetting(key: string): Promise<boolean> {
    return settingsRepository.delete(key);
  }
}

export const settingsService = new SettingsService();
