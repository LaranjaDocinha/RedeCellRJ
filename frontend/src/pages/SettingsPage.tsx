import React, { useState, useEffect } from 'react';
import { SettingsForm } from '../components/SettingsForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      addNotification(`Failed to fetch settings: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (updatedSettings: Setting[]) => {
    try {
      // For simplicity, we'll send each setting update individually.
      // In a real app, you might want a bulk update endpoint.
      for (const setting of updatedSettings) {
        const response = await fetch(`/settings/${setting.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ value: setting.value, description: setting.description }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      }
      addNotification('Settings saved successfully!', 'success');
      fetchSettings(); // Re-fetch to ensure consistency
    } catch (error: any) {
      console.error("Error saving settings:", error);
      addNotification(`Failed to save settings: ${error.message}`, 'error');
    }
  };

  const handleCancel = () => {
    fetchSettings(); // Revert changes by re-fetching original settings
    addNotification('Changes cancelled.', 'info');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Global Settings</h1>
      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <SettingsForm
          initialData={settings}
          onSubmit={handleSaveSettings}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SettingsPage;
