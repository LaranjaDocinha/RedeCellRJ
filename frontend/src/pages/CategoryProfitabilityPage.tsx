import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  useTheme,
  Divider,
  IconButton
} from '@mui/material';
import { 
  PieChart as ChartIcon, 
  TrendingUp, 
  AttachMoney, 
  Category as CategoryIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  InfoOutlined as InfoIcon,
  Stars as BestIcon,
  ErrorOutline as LowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import { motion } from 'framer-motion';

const CategoryProfitabilityPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [profitabilityData, setProfitabilityData] = useState<any[]>([]);

  useEffect(() => {
    // Simulated data fetch
    setTimeout(() => {
      setProfitabilityData([
        { id: 1, name: 'Smartphones', revenue: 85000, profit: 22000, margin: 25.8, items: 124 },
        { id: 2, name: 'Acessórios', revenue: 15000, profit: 9500, margin: 63.3, items: 450 },
        { id: 3, name: 'Serviços', revenue: 12000, profit: 8000, margin: 66.6, items: 85 },
        { id: 4, name: 'Tablets', revenue: 13000, profit: 2500, margin: 19.2, items: 15 },
      ]);
      setLoading(false);
    }, 800);
  }, [selectedBranch]);

  const treeMapOptions: ApexCharts.ApexOptions = {
    legend: { show: false },
    chart: { height: 350, type: 'treemap', toolbar: { show: false } },
    title: { text: 'Lucro Distribuído por Categoria', style: { fontWeight: 400 } },
    colors: [theme.palette.primary.main, theme.palette.secondary.main, '#4caf50', '#ff9800'],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    },
    tooltip: { y: { formatter: (val) => `R$ ${val.toLocaleString()}` } }
  };

  const treeMapSeries = [{
    data: profitabilityData.map(item => ({
      x: item.name,
      y: item.profit
    }))
  }];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'secondary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <CategoryIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'secondary.main', letterSpacing: 2 }}>
              ANÁLISE DE RENTABILIDADE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Radar de Categorias
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Identifique quais categorias geram mais lucro real e otimize seu mix de produtos.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ExportIcon />} sx={{ borderRadius: '12px', fontWeight: 400 }}>Exportar</Button>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Filial</InputLabel>
            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value)} sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}>
              <MenuItem value="1">Filial Matriz</MenuItem>
              <MenuItem value="2">Filial Barra</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Gráfico TreeMap */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <ReactApexChart options={treeMapOptions} series={treeMapSeries} type="treemap" height={450} />
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} height="100%">
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" fontWeight={400} color="text.secondary">Maior Margem Líquida</Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Avatar sx={{ bgcolor: 'success.light', borderRadius: '12px' }}><BestIcon /></Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={400}>Serviços</Typography>
                    <Typography variant="caption" color="success.main" fontWeight={400}>66.6% de Rentabilidade</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" fontWeight={400} color="text.secondary">Maior Volume de Lucro</Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Avatar sx={{ bgcolor: 'primary.light', borderRadius: '12px' }}><TrendingUp /></Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={400}>Smartphones</Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={400}>R$ 22.000,00 Gerados</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={400} mb={2}>Alerta de Performance</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2}>
                  <LowIcon color="warning" />
                  <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
                    A categoria <strong>Tablets</strong> está operando com margem abaixo do esperado (19.2%). Considere revisar preços ou fornecedores.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Tabela Detalhada */}
        <Grid item xs={12}>
          <Paper sx={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box p={3} borderBottom="1px solid" borderColor="divider">
              <Typography variant="h6" fontWeight={400}>Detalhamento por Categoria</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 400 }}>CATEGORIA</TableCell>
                    <TableCell sx={{ fontWeight: 400 }}>RECEITA TOTAL</TableCell>
                    <TableCell sx={{ fontWeight: 400 }}>LUCRO LÍQUIDO</TableCell>
                    <TableCell sx={{ fontWeight: 400 }} width="300">MARGEM (%)</TableCell>
                    <TableCell sx={{ fontWeight: 400 }} align="right">VENDAS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profitabilityData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 400 }}>{row.name}</TableCell>
                      <TableCell>R$ {row.revenue.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 400 }}>R$ {row.profit.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={row.margin} 
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: 'divider' }}
                            color={row.margin > 40 ? 'success' : row.margin > 20 ? 'primary' : 'warning'}
                          />
                          <Typography variant="caption" fontWeight={400}>{row.margin}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.items}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryProfitabilityPage;
