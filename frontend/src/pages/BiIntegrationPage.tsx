import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const BiIntegrationPage: React.FC = () => {
  const [biStatus, setBiStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [biLogs, setBiLogs] = useState<string[]>([]);
  const [selectedBiTool, setSelectedBiTool] = useState('');
  const [availableReports, setAvailableReports] = useState<string[]>([]);
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);

  const { token } = useAuth();

  const availableBiTools = ['Power BI', 'Metabase', 'Tableau'];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const statusRes = await fetch('/api/bi-integration/status', { headers: { Authorization: `Bearer ${token}` } });
        const statusData = await statusRes.json();
        setBiStatus(statusData);

        const reportsRes = await fetch('/api/bi-integration/reports', { headers: { Authorization: `Bearer ${token}` } });
        const reportsData = await reportsRes.json();
        setAvailableReports(reportsData.reports);

      } catch (error) {
        console.error('Error fetching BI integration data:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchData();
  }, [token]);

  const handleGenerateCredentials = async () => {
    if (!token || !selectedBiTool) return;
    setBiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Gerando credenciais para ${selectedBiTool}...`]);
    try {
      const res = await fetch('/api/bi-integration/generate-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toolName: selectedBiTool }),
      });
      const data = await res.json();
      setGeneratedCredentials(data.credentials);
      setBiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Credenciais geradas para ${selectedBiTool}: ${JSON.stringify(data.credentials)}`]);
    } catch (error) {
      console.error('Error generating credentials:', error);
      setBiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro ao gerar credenciais para ${selectedBiTool}.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Integração com Ferramentas de BI Externas</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Status da Integração BI</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : biStatus ? (
              <Box>
                <Typography><b>Status:</b> {biStatus.status}</Typography>
                <Typography><b>Última Atividade:</b> {moment(biStatus.lastActivity).format('DD/MM/YYYY HH:mm:ss')}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma integração BI configurada.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Relatórios/Fontes de Dados Disponíveis</Typography>
            <List>
              {availableReports.length > 0 ? (
                availableReports.map((report, index) => (
                  <ListItem key={index}><ListItemText primary={report} /></ListItem>
                ))
              ) : (
                <ListItem><ListItemText primary="Nenhum relatório disponível." /></ListItem>
              )}
            </List>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Gerar Credenciais para Ferramenta BI</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Ferramenta BI</InputLabel>
              <Select value={selectedBiTool} label="Ferramenta BI" onChange={(e) => setSelectedBiTool(e.target.value as string)}>
                {availableBiTools.map(tool => <MenuItem key={tool} value={tool}>{tool}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleGenerateCredentials} disabled={!selectedBiTool}>Gerar Credenciais</Button>

            {generatedCredentials && (
              <Box mt={2}>
                <Typography variant="subtitle1">Credenciais Geradas:</Typography>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={generatedCredentials.username}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Senha"
                  value={generatedCredentials.password}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Host"
                  value={generatedCredentials.host}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Porta"
                  value={generatedCredentials.port}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Banco de Dados"
                  value={generatedCredentials.database}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">Guarde estas credenciais em segurança. Elas não serão exibidas novamente.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Log de Atividades de Integração BI</Typography>
            <List sx={{ mt: 2, maxHeight: 600, overflow: 'auto' }}>
                {biLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BiIntegrationPage;
