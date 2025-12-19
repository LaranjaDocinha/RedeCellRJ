
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StructuredSetting } from '../components/settings/SettingControl';

// Re-defining interfaces here for store usage
interface SettingCategory {
  title: string;
  icon: string;
  settings: StructuredSetting[];
}

export interface AllSettingsStructured {
  [categoryKey: string]: SettingCategory;
}

interface SettingsState {
  settings: AllSettingsStructured | null;
  initialSettings: AllSettingsStructured | null;
  loading: boolean;
  saving: boolean;
  showSuccess: boolean;
  fetchSettings: (token: string) => Promise<void>;
  updateSettingValue: (key: string, value: string | boolean) => void;
  resetSetting: (key: string) => void;
  resetCategory: (categoryKey: string) => void;
  resetAll: () => void;
  saveSettings: (token: string) => Promise<boolean>; // Returns true on success
  getChangedSettings: () => { key: string; value: string }[];
}

export const useSettingsStore = create(immer<SettingsState>((set, get) => ({
  settings: null,
  initialSettings: null,
  loading: true,
  saving: false,
  showSuccess: false,

  fetchSettings: async (token) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data: AllSettingsStructured = await response.json();
      set({
        settings: data,
        initialSettings: JSON.parse(JSON.stringify(data)),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ loading: false });
    }
  },

  getChangedSettings: () => {
    const { settings, initialSettings } = get();
    if (!settings || !initialSettings) return [];
    const changes: { key: string; value: string }[] = [];
    for (const categoryKey in settings) {
      for (const setting of settings[categoryKey].settings) {
        const initialSetting = initialSettings[categoryKey]?.settings.find(s => s.key === setting.key);
        if (initialSetting && initialSetting.value !== setting.value) {
          changes.push({ key: setting.key, value: String(setting.value) });
        }
      }
    }
    return changes;
  },

  updateSettingValue: (key, value) => {
    set((state) => {
      if (!state.settings) return;
      const newValue = typeof value === 'boolean' ? String(value) : value;
      for (const categoryKey in state.settings) {
        const category = state.settings[categoryKey];
        const settingIndex = category.settings.findIndex((s) => s.key === key);
        if (settingIndex !== -1) {
          state.settings[categoryKey].settings[settingIndex].value = newValue;
          break;
        }
      }
    });
  },

  resetSetting: (key) => {
    set((state) => {
        if (!state.settings || !state.initialSettings) return;
        Object.keys(state.initialSettings).forEach(categoryKey => {
            const category = state.initialSettings[categoryKey];
            const settingIndex = category.settings.findIndex((s) => s.key === key);
            if (settingIndex !== -1) {
                state.settings[categoryKey].settings[settingIndex].value = category.settings[settingIndex].value;
            }
        });
    });
  },

  resetCategory: (categoryKey) => {
    set((state) => {
        if (!state.settings || !state.initialSettings) return;
        state.settings[categoryKey] = JSON.parse(JSON.stringify(state.initialSettings[categoryKey]));
    });
  },

  resetAll: () => {
    set((state) => {
      if (state.initialSettings) {
        state.settings = JSON.parse(JSON.stringify(state.initialSettings));
      }
    });
  },

  saveSettings: async (token) => {
    const changes = get().getChangedSettings();
    if (changes.length === 0) {
        return true; // No changes, technically a success
    }

    set({ saving: true, showSuccess: false });
    try {
      for (const change of changes) {
        if (change.key === 'change_password' && change.value === '') continue;
        const response = await fetch(`/api/settings/${change.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ value: change.value }),
        });
        if (!response.ok) throw new Error(`Failed to save ${change.key}`);
      }
      set({ showSuccess: true });
      await get().fetchSettings(token); // Re-fetch new initial state
      setTimeout(() => set({ showSuccess: false }), 2000);
      return true;
    } catch (error) {
        console.error("Error saving settings:", error);
        set({ saving: false });
        return false;
    } finally {
        set({ saving: false });
    }
  }
})));
