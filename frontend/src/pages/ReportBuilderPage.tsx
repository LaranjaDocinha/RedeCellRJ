import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress
} from '@mui/material';
import { FaChartBar, FaDownload } from 'react-icons/fa';
import PageHeader from '../components/Shared/PageHeader';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const ReportBuilderPage: React.FC = () => {
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  const [dimension, setDimension] = useState('product_name');
  const [measure, setMeasure] = useState('total_amount');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Assuming a generic report endpoint exists or repurposing dashboard endpoint
      // For this demo, let's assume /api/reports/dynamic which uses ReportRepository
      const response = await axios.get('/api/reports/dynamic', {
        params: { dimension, measure, startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
      addNotification('Relatório gerado com sucesso.', 'success');
    } catch (error) {
      addNotification('Erro ao gerar relatório.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData.length === 0) return;
    const csvContent = [
      ['Rótulo', 'Valor'],
      ...reportData.map(row => [row.label, row.value])
    ].map(e => e.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${dimension}_${startDate}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Construtor de Relatórios" 
        subtitle="Crie relatórios personalizados cruzando dados de vendas."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Relatórios' }]} 
      />

      <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Dimensão (Agrupar por)</InputLabel>
              <Select value={dimension} label="Dimensão (Agrupar por)" onChange={(e) => setDimension(e.target.value)}>
                <MenuItem value="product_name">Produto</MenuItem>
                <MenuItem value="category">Categoria</MenuItem>
                <MenuItem value="salesperson">Vendedor</MenuItem>
                <MenuItem value="sale_date">Data</MenuItem>
                <MenuItem value="branch_name">Filial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Métrica (Calcular)</InputLabel>
              <Select value={measure} label="Métrica (Calcular)" onChange={(e) => setMeasure(e.target.value)}>
                <MenuItem value="total_amount">Total Vendido (R$)</MenuItem>
                <MenuItem value="quantity">Quantidade Itens</MenuItem>
                <MenuItem value="profit">Lucro Estimado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField 
              label="De" 
              type="date" 
              fullWidth 
              size="small" 
              InputLabelProps={{ shrink: true }} 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField 
              label="Até" 
              type="date" 
              fullWidth 
              size="small" 
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<FaChartBar />} 
              onClick={handleGenerate}
              disabled={loading}
              sx={{ borderRadius: '10px' }}
            >
              Gerar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {reportData.length > 0 && (
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #eee' }}>
            <Button startIcon={<FaDownload />}>Exportar CSV</Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rótulo</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">
                    {measure === 'quantity' ? row.value : `R$ ${Number(row.value).toFixed(2)}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default ReportBuilderPage;
