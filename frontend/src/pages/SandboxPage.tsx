import React, { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SandboxPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState('');

  const { token } = useAuth();

  const handleCreateSandbox = async () => {
    if (!token) return;
    setLoading(true);
    setSandboxStatus('Criando ambiente sandbox...');
    try {
      const res = await fetch('/api/sandbox/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSandboxStatus(data.message);
      } else {
        setSandboxStatus(data.message || 'Erro ao criar ambiente sandbox.');
      }
    } catch (error) {
      console.error('Error creating sandbox:', error);
      setSandboxStatus('Erro ao criar ambiente sandbox.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Ambiente Sandbox para Testes</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Criar Sandbox</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Crie uma cópia isolada do ambiente de produção para testar novas configurações e funcionalidades sem afetar os dados reais.
        </Typography>
        <Button variant="contained" onClick={handleCreateSandbox} disabled={loading}>Criar Ambiente Sandbox</Button>
        {loading && <CircularProgress sx={{ ml: 2 }} size={24} />}
        {sandboxStatus && (
          <Typography variant="body2" sx={{ mt: 2, color: sandboxStatus.includes('Erro') ? 'error.main' : 'success.main' }}>
            {sandboxStatus}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default SandboxPage;
