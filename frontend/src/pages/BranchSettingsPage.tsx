import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Branch {
  id: number;
  name: string;
}

interface BranchSettings {
  opening_hours: string;
  local_taxes: number;
  address: string;
}

const BranchSettingsPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [settings, setSettings] = useState<BranchSettings>({ opening_hours: '', local_taxes: 0, address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId !== '') {
      fetchBranchSettings(selectedBranchId as number);
    }
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches);
        if (data.branches.length > 0) {
          setSelectedBranchId(data.branches[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchSettings = async (branchId: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/branch/${branchId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        // If no settings found, initialize with defaults or empty values
        setSettings({ opening_hours: '', local_taxes: 0, address: '' });
      }
    } catch (error) {
      console.error('Error fetching branch settings:', error);
      setSettings({ opening_hours: '', local_taxes: 0, address: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!token || selectedBranchId === '') return;
    setSaving(true);
    try {
      const res = await fetch(`/api/settings/branch/${selectedBranchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert('Configurações da filial salvas com sucesso!');
      } else {
        alert(data.message || 'Erro ao salvar configurações da filial.');
      }
    } catch (error) {
      console.error('Error saving branch settings:', error);
      alert('Erro ao salvar configurações da filial.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Configurações de Múltiplas Filiais</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="branch-select-label">Selecionar Filial</InputLabel>
          <Select
            labelId="branch-select-label"
            value={selectedBranchId}
            label="Selecionar Filial"
            onChange={(e) => setSelectedBranchId(e.target.value as number)}
          >
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedBranchId !== '' && (
          <Box>
            <Typography variant="h6" gutterBottom>Configurações da Filial {branches.find(b => b.id === selectedBranchId)?.name}</Typography>
            <TextField
              fullWidth
              label="Horário de Funcionamento"
              value={settings.opening_hours}
              onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
              sx={{ mb: 2 }}
              disabled={saving}
            />
            <TextField
              fullWidth
              label="Impostos Locais (%)"
              type="number"
              value={settings.local_taxes}
              onChange={(e) => setSettings({ ...settings, local_taxes: parseFloat(e.target.value) })}
              sx={{ mb: 2 }}
              disabled={saving}
            />
            <TextField
              fullWidth
label="Endereço"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              sx={{ mb: 2 }}
              disabled={saving}
            />
            <Button variant="contained" onClick={handleSaveSettings} disabled={saving}>Salvar Configurações</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BranchSettingsPage;
