import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const InventoryValuationReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{ total_inventory_value: number } | null>(null);
  const { token } = useAuth();
  const { addToast } = useNotification();

  const handleCalculate = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const response = await fetch('/api/reports/inventory-valuation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch inventory valuation report');
      }
      const data = await response.json();
      setReportData(data);
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Relatório de Valorização de Estoque</Typography>
      <Card>
        <CardHeader title="Calcular Valor Total do Estoque" />
        <CardContent>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Clique no botão abaixo para calcular o valor total do seu estoque com base no método de valorização configurado atualmente.
          </Typography>
          <Button variant="contained" onClick={handleCalculate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Calcular Agora'}
          </Button>

          {reportData && (
            <Box mt={4}>
              <Typography variant="h6">Resultado:</Typography>
              <Card elevation={0} sx={{ backgroundColor: 'action.hover', mt: 1, p: 2 }}>
                <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reportData.total_inventory_value)}
                </Typography>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryValuationReport;
