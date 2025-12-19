import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const GdprToolsPage: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  const handleExportData = async () => {
    if (!token || !customerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gdpr/export/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message || 'Erro ao exportar dados.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erro ao exportar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymizeData = async () => {
    if (!token || !customerId) return;
    if (!window.confirm('Tem certeza que deseja anonimizar os dados deste cliente? Esta ação é irreversível.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gdpr/anonymize/${customerId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message || 'Erro ao anonimizar dados.');
      }
    } catch (error) {
      console.error('Error anonymizing data:', error);
      alert('Erro ao anonimizar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!token || !customerId) return;
    if (!window.confirm('Tem certeza que deseja EXCLUIR todos os dados deste cliente? Esta ação é irreversível e não pode ser desfeita.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gdpr/delete/${customerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message || 'Erro ao excluir dados.');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Erro ao excluir dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Ferramentas de Conformidade LGPD/GDPR</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Gerenciar Dados do Cliente</Typography>
        <TextField
          fullWidth
          label="ID do Cliente ou Email"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleExportData} disabled={loading || !customerId}>Exportar Dados</Button>
          <Button variant="outlined" color="warning" onClick={handleAnonymizeData} disabled={loading || !customerId}>Anonimizar Dados</Button>
          <Button variant="outlined" color="error" onClick={handleDeleteData} disabled={loading || !customerId}>Excluir Dados</Button>
        </Box>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
      </Paper>
    </Box>
  );
};

export default GdprToolsPage;
