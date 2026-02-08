import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('SettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: null,
      initialSettings: null,
      loading: true,
      saving: false,
      showSuccess: false
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockSettings = {
    general: {
      title: 'Geral',
      icon: 'cog',
      settings: [
        { key: 'app_name', value: 'RedecellRJ', type: 'text', label: 'Nome' }
      ]
    }
  };

  it('should fetch and initialize settings', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings)
    });

    await useSettingsStore.getState().fetchSettings('token');

    expect(useSettingsStore.getState().settings).toEqual(mockSettings);
    expect(useSettingsStore.getState().initialSettings).toEqual(mockSettings);
    expect(useSettingsStore.getState().loading).toBe(false);
  });

  it('should track changes and reset correctly', async () => {
    // Inicializa
    useSettingsStore.setState({
      settings: JSON.parse(JSON.stringify(mockSettings)),
      initialSettings: JSON.parse(JSON.stringify(mockSettings))
    });

    // Altera
    useSettingsStore.getState().updateSettingValue('app_name', 'Novo Nome');
    expect(useSettingsStore.getState().getChangedSettings()).toHaveLength(1);

    // Reset
    useSettingsStore.getState().resetAll();
    expect(useSettingsStore.getState().settings?.general.settings[0].value).toBe('RedecellRJ');
    expect(useSettingsStore.getState().getChangedSettings()).toHaveLength(0);
  });
});
