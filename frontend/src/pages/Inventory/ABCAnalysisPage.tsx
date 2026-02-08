import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { PageContainer } from '../../styles/common.styles';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Tooltip
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import PieChart from '@mui/icons-material/PieChart';
import Inventory from '@mui/icons-material/Inventory';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

const ABCBadge = styled.span<{ classification: 'A' | 'B' | 'C' }>`
  background: ${props => 
    props.classification === 'A' ? 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)' : 
    props.classification === 'B' ? 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' : 
    'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'};
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

interface ABCItem {
  productId: number;
  productName: string;
  revenue: number;
  share: number;
  cumulativeShare: number;
  classification: 'A' | 'B' | 'C';
}

const ABCAnalysisPage: React.FC = () => {
  const [data, setData] = useState<ABCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchABC();
  }, []);

  const fetchABC = async () => {
    try {
      const response = await api.get('/api/v1/inventory/abc-analysis');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching ABC analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const totals = {
    A: data.filter(i => i.classification === 'A').length,
    B: data.filter(i => i.classification === 'B').length,
    C: data.filter(i => i.classification === 'C').length,
    revenue: data.reduce((acc, i) => acc + i.revenue, 0)
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: ['Classe A (80% Rec.)', 'Classe B (15%)', 'Classe C (5%)'],
    colors: ['#d4af37', '#2c3e50', '#e67e22'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Faturamento Total',
              formatter: () => `R$ ${totals.revenue.toLocaleString()}`
            }
          }
        }
      }
    }
  };

  const series = [
    data.filter(i => i.classification === 'A').reduce((acc, i) => acc + i.revenue, 0),
    data.filter(i => i.classification === 'B').reduce((acc, i) => acc + i.revenue, 0),
    data.filter(i => i.classification === 'C').reduce((acc, i) => acc + i.revenue, 0),
  ];

  return (
    <PageContainer>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 300 }}>Análise Curva ABC (90 dias)</Typography>
        <Typography variant="body1" color="text.secondary">Identificação estratégica de produtos por impacto financeiro.</Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Composição do Portfólio</Typography>
              <Box height={300} mt={2}>
                <ReactApexChart options={chartOptions} series={series} type="donut" height={280} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[
              { label: 'Itens Classe A', val: totals.A, color: '#d4af37', desc: 'Geram 80% do faturamento. PRIORIDADE MÁXIMA.' },
              { label: 'Itens Classe B', val: totals.B, color: '#2c3e50', desc: 'Geram 15% do faturamento. Atenção moderada.' },
              { label: 'Itens Classe C', val: totals.C, color: '#e67e22', desc: 'Geram 5% do faturamento. Evitar excesso de estoque.' }
            ].map(stat => (
              <Grid item xs={12} sm={4} key={stat.label}>
                <Card sx={{ borderRadius: '16px', borderLeft: `6px solid ${stat.color}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h4" sx={{ my: 1, fontWeight: 300 }}>{stat.val}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box mt={3} p={3} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '16px' }}>
             <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp />
                <Typography variant="h6">Insight Estratégico</Typography>
             </Box>
             <Typography variant="body2">
                Otimizando o estoque dos itens de <strong>Classe A</strong>, você garante {totals.revenue > 0 ? '80%' : 'a maior parte'} da sua liquidez com o menor esforço logístico possível.
             </Typography>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 400 }}>PRODUTO</TableCell>
              <TableCell sx={{ fontWeight: 400 }}>CLASSE</TableCell>
              <TableCell sx={{ fontWeight: 400 }}>FATURAMENTO</TableCell>
              <TableCell sx={{ fontWeight: 400 }}>PARTICIPAÇÃO (%)</TableCell>
              <TableCell sx={{ fontWeight: 400 }}>ACUMULADO (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.productId} hover>
                <TableCell>{item.productName}</TableCell>
                <TableCell>
                  <ABCBadge classification={item.classification}>{item.classification}</ABCBadge>
                </TableCell>
                <TableCell>R$ {item.revenue.toLocaleString()}</TableCell>
                <TableCell>{item.share.toFixed(2)}%</TableCell>
                <TableCell>
                   <Box display="flex" alignItems="center" gap={1}>
                      <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ width: `${item.cumulativeShare}%`, height: '100%', background: theme.palette.primary.main }} />
                      </div>
                      {item.cumulativeShare.toFixed(1)}%
                   </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageContainer>
  );
};

export default ABCAnalysisPage;
