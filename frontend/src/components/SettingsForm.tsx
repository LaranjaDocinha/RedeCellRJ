import React, { useState, useEffect } from 'react';

interface Setting {
  id?: number;
  key: string;
  value: string;
  description?: string;
}

interface SettingsFormProps {
  initialData: Setting[];
  onSubmit: (data: Setting[]) => void;
  onCancel: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [settings, setSettings] = useState<Setting[]>(initialData);

  useEffect(() => {
    setSettings(initialData);
  }, [initialData]);

  const handleChange = (id: number, field: keyof Setting, value: string) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      {settings.length === 0 ? (
        <p className="text-center text-gray-500">No settings to display.</p>
      ) : (
        settings.map((setting) => (
          <div key={setting.id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700">
              {setting.description || setting.key}
            </label>
            <input
              type="text"
              name={setting.key}
              id={setting.key}
              value={setting.value}
              onChange={(e) => handleChange(setting.id!, 'value', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        ))
      )}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};
