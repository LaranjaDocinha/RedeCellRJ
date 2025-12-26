import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, Typography, Paper, Grid, Skeleton, Card, CardContent, Select, 
  MenuItem, FormControl, InputLabel, TextField, IconButton, Tooltip, 
  useTheme, Stack, alpha, Divider, Button, Drawer, Badge, List, 
  ListItem, ListItemText, Avatar, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress
} from '@mui/material';
import { 
  VisibilityOutlined as ViewIcon, 
  VisibilityOffOutlined as HideIcon,
  RefreshOutlined as RefreshIcon,
  FilterListOutlined as FilterIcon,
  SearchOutlined as SearchIcon,
  TrendingUpOutlined as TrendingUp,
  TrendingDownOutlined as TrendingDown,
  AccountBalanceWalletOutlined as WalletIcon,
  FileDownloadOutlined as ExportIcon,
  AddOutlined as AddIcon,
  RemoveOutlined as RemoveIcon,
  MoreVertOutlined as MoreIcon,
  ReceiptLongOutlined as ReceiptIcon,
  AssessmentOutlined as InsightIcon,
  ArrowForwardIos as ArrowIcon,
  CheckCircleOutline as ConciliatedIcon,
  PieChartOutlined as PieChartIcon,
  UpcomingOutlined as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { ExpenseForm } from '../components/ExpenseForm'; 

// --- Styled Components ---

import styled from 'styled-components';

const PremiumCard = motion.create(styled(Card)(({ theme }) => ({
  borderRadius: '28px',
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.6) 
    : theme.palette.background.paper,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 8px 32px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  position: 'relative'
})));

const TransactionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 18px;
  margin-bottom: 8px;
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.4)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.05)};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${({ theme }) => alpha(theme.palette.action.hover, 0.8)};
    transform: translateX(4px);
  }
`;

// --- Mock Data ---
const MOCK_TRANSACTIONS = [
  { id: 1, type: 'inflow', category: 'Venda de Produto', description: 'Venda iPhone 15 Pro #1024', amount: 7500.00, date: new Date(), conciliated: true },
  { id: 2, type: 'outflow', category: 'Aluguel', description: 'Pagamento Aluguel Dezembro', amount: 3500.00, date: moment().subtract(1, 'day'), conciliated: true },
  { id: 3, type: 'inflow', category: 'Serviço', description: 'Reparo Placa Mãe - OS #502', amount: 450.00, date: moment().subtract(2, 'days'), conciliated: false },
  { id: 4, type: 'outflow', category: 'Fornecedor', description: 'Compra de Telas OLED', amount: 1200.00, date: moment().subtract(3, 'days'), conciliated: true },
  { id: 5, type: 'inflow', category: 'Venda de Produto', description: 'Venda Capa MagSafe', amount: 149.90, date: moment().subtract(4, 'days'), conciliated: true },
];

const UPCOMING_BILLS = [
  { id: 1, title: 'Internet Fibra', due: moment().add(2, 'days'), amount: 199.90 },
  { id: 2, title: 'Simples Nacional', due: moment().add(5, 'days'), amount: 2450.00 },
];

const CashFlowPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  // States
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day');
  
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all'); 
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [cashFlowData, setCashFlowData] = useState<any>(null);

  // Shortcuts
  useHotkeys('f', () => setFilterDrawerOpen(true));
  useHotkeys('p', () => setIsPrivate(prev => !prev));
  useHotkeys('r', () => fetchCashFlowData());

  const fetchBranches = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const fetchCashFlowData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const branchParam = selectedBranch === 'all' ? '' : `branchId=${selectedBranch}&`;
      const res = await fetch(`/api/cash-flow?${branchParam}startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCashFlowData(data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, [token]);
  useEffect(() => { fetchCashFlowData(); }, [token, selectedBranch, startDate, endDate]);

  const handleExport = () => {
    setIsExporting(true);
    addNotification('Compilando lançamentos e gerando relatório...', 'info');
    setTimeout(() => {
      try {
        const headers = ['ID', 'Tipo', 'Categoria', 'Descricao', 'Valor (R$)', 'Data'];
        const rows = MOCK_TRANSACTIONS.map(t => [t.id, t.type, t.category, t.description, t.amount.toFixed(2), moment(t.date).format('DD/MM/YYYY')]);
        const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Financeiro_Redecell_${moment().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification('Relatório baixado com sucesso!', 'success');
      } finally { setIsExporting(false); }
    }, 1200);
  };

  const handleConciliation = () => {
    addNotification('Iniciando conciliação bancária...', 'info');
    setTimeout(() => addNotification('Transações conciliadas.', 'success'), 1500);
  };

  // --- Gráficos e Lógica de Inteligência ---

  const trendChartOptions: any = useMemo(() => ({
    chart: { type: 'area', height: 350, toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit', background: 'transparent' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: [3, 3, 2], dashArray: [0, 0, 5] },
    xaxis: {
      categories: (cashFlowData?.cashFlowTrend || []).map((item: any) => moment(item.date).format('DD/MM')),
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.primary.main],
    legend: { show: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    tooltip: { theme: theme.palette.mode }
  }), [cashFlowData, theme]);

  const chartSeries = useMemo(() => [
    { name: 'Receitas', data: (cashFlowData?.cashFlowTrend || []).map((item: any) => item.inflow) },
    { name: 'Despesas', data: (cashFlowData?.cashFlowTrend || []).map((item: any) => item.outflow) },
    { name: 'Projeção IA', data: (cashFlowData?.cashFlowTrend || []).map((item: any, idx: number) => idx > 15 ? item.inflow * 1.1 : null) }
  ], [cashFlowData]);

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categoryChartOptions: any = useMemo(() => ({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['Produtos', 'Serviços', 'Acessórios', 'Manutenção'],
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.info.main, theme.palette.warning.main],
    stroke: { show: false },
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { show: true }, value: { show: true, formatter: (v: any) => `R$ ${v}` } } } } },
    dataLabels: { enabled: false }
  }), [theme]);

  return (
    <Box sx={{ position: 'relative' }}>
      {isExporting && <LinearProgress sx={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 2000, height: 3 }} color="primary" />}

      <Box p={4} sx={{ maxWidth: 1600, margin: '0 auto' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Box sx={{ p: 0.8, bgcolor: 'primary.main', borderRadius: '8px', color: 'white', display: 'flex' }}><WalletIcon fontSize="small" /></Box>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: 'primary.main' }}>FINANCIAL INTELLIGENCE</Typography>
            </Stack>
            <Typography variant="h3" sx={{ letterSpacing: '-1.5px' }}>Fluxo de Caixa</Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: '12px' }}>
              <Button size="small" onClick={() => setViewType('day')} variant={viewType === 'day' ? 'contained' : 'text'} sx={{ borderRadius: '8px', textTransform: 'none' }}>Dia</Button>
              <Button size="small" onClick={() => setViewType('week')} variant={viewType === 'week' ? 'contained' : 'text'} sx={{ borderRadius: '8px', textTransform: 'none' }}>Semana</Button>
            </Box>
            <Tooltip title="Filtros (F)"><IconButton onClick={() => setFilterDrawerOpen(true)} sx={{ border: '1px solid', borderColor: 'divider' }}><FilterIcon fontSize="small" /></IconButton></Tooltip>
            <IconButton onClick={() => setIsPrivate(!isPrivate)} sx={{ border: '1px solid', borderColor: 'divider' }}>{isPrivate ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}</IconButton>
            <Button variant="contained" startIcon={<ExportIcon />} onClick={handleExport} sx={{ borderRadius: '12px', textTransform: 'none', boxShadow: 'none' }}>Exportar</Button>
          </Stack>
        </Box>

        {/* TOP CARDS */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <PremiumCard whileHover={{ y: -5 }}><CardContent sx={{ p: 4 }}><Stack direction="row" justifyContent="space-between" mb={2}><Typography variant="overline" color="text.secondary">RECEITAS</Typography><TrendingUp color="success" /></Stack><Typography variant="h4" sx={{ filter: isPrivate ? 'blur(10px)' : 'none' }}><AnimatedCounter value={cashFlowData?.totalInflow || 0} /></Typography><Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>+12% <Typography variant="caption" color="text.secondary" component="span">vs mês ant.</Typography></Typography></CardContent></PremiumCard>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <PremiumCard whileHover={{ y: -5 }}><CardContent sx={{ p: 4 }}><Stack direction="row" justifyContent="space-between" mb={2}><Typography variant="overline" color="text.secondary">DESPESAS</Typography><TrendingDown color="error" /></Stack><Typography variant="h4" sx={{ filter: isPrivate ? 'blur(10px)' : 'none' }}><AnimatedCounter value={cashFlowData?.totalOutflow || 0} /></Typography><Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>-4% <Typography variant="caption" color="text.secondary" component="span">Burn: R$ 450/dia</Typography></Typography></CardContent></PremiumCard>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <PremiumCard whileHover={{ y: -5 }} sx={{ border: `1px solid ${theme.palette.success.main}` }}><CardContent sx={{ p: 4 }}><Stack direction="row" justifyContent="space-between" mb={2}><Typography variant="overline" color="text.secondary">LUCRO ESTIMADO</Typography><InsightIcon color="success" /></Stack><Typography variant="h4" color="success.main" sx={{ filter: isPrivate ? 'blur(10px)' : 'none' }}><AnimatedCounter value={(cashFlowData?.totalInflow || 0) - (cashFlowData?.totalOutflow || 0)} /></Typography><Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Margem líquida: 32%</Typography></CardContent></PremiumCard>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <PremiumCard whileHover={{ y: -5 }} sx={{ bgcolor: 'primary.main', color: 'white' }}><CardContent sx={{ p: 4 }}><Typography variant="overline" sx={{ opacity: 0.8 }}>SALDO DISPONÍVEL</Typography><Typography variant="h4" sx={{ mt: 2, filter: isPrivate ? 'blur(10px)' : 'none' }}><AnimatedCounter value={cashFlowData?.netCashFlow || 0} /></Typography><Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, transform: 'rotate(-15deg)' }}><WalletIcon sx={{ fontSize: 120 }} /></Box></CardContent></PremiumCard>
          </Grid>
        </Grid>

        {/* MIDDLE SECTION */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <PremiumCard sx={{ p: 4, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box><Typography variant="h6">Tendência de Fluxo</Typography><Typography variant="caption" color="text.secondary">Projeção Baseada em IA (Próximos 7 dias)</Typography></Box>
                <Stack direction="row" spacing={3}>
                   <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} /><Typography variant="caption">Receitas</Typography></Box>
                   <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} /><Typography variant="caption">Despesas</Typography></Box>
                   <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '1px dashed ' + theme.palette.primary.main }} /><Typography variant="caption">Projeção</Typography></Box>
                </Stack>
              </Box>
              <ReactApexChart options={trendChartOptions} series={chartSeries} type="area" height={350} />
            </PremiumCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <PremiumCard sx={{ p: 4, height: '100%', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}><PieChartIcon color="primary" /> Centro de Custo</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={4}>Distribuição de gastos por categoria</Typography>
              <Box sx={{ mt: 2 }}><ReactApexChart options={categoryChartOptions} series={[4500, 1200, 800, 600]} type="donut" height={300} /></Box>
            </PremiumCard>
          </Grid>
        </Grid>

        {/* BOTTOM SECTION */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <PremiumCard sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box p={3} borderBottom={`1px solid ${alpha(theme.palette.divider, 0.1)}`} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Lançamentos Recentes</Typography>
                <TextField size="small" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />, sx: { borderRadius: '12px', bgcolor: 'action.hover', width: 250 } }} />
              </Box>
              <Box sx={{ p: 2 }}>
                {filteredTransactions.map((t) => (
                  <TransactionItem key={t.id} onClick={() => { setSelectedTransaction(t); setDetailDrawerOpen(true); }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Avatar sx={{ bgcolor: t.type === 'inflow' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1), color: t.type === 'inflow' ? 'success.main' : 'error.main', mr: 2, width: 40, height: 40 }}>{t.type === 'inflow' ? <AddIcon /> : <RemoveIcon />}</Avatar>
                    <Box sx={{ flexGrow: 1 }}><Typography variant="body2" sx={{ filter: isPrivate ? 'blur(5px)' : 'none' }}>{t.description}</Typography><Typography variant="caption" color="text.secondary">{t.category}</Typography></Box>
                    <Box sx={{ textAlign: 'right' }}><Typography variant="body2" color={t.type === 'inflow' ? 'success.main' : 'error.main'} sx={{ filter: isPrivate ? 'blur(5px)' : 'none' }}>{t.type === 'inflow' ? '+' : '-'} R$ {t.amount.toLocaleString()}</Typography>{t.conciliated && <ConciliatedIcon sx={{ fontSize: 12, color: 'success.main' }} />}</Box>
                  </TransactionItem>
                ))}
              </Box>
            </PremiumCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <PremiumCard sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" mb={3} display="flex" alignItems="center" gap={1}><PendingIcon color="warning" /> Próximos Vencimentos</Typography>
              <Stack spacing={2}>
                {UPCOMING_BILLS.map(bill => (
                  <Paper key={bill.id} variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{bill.title}</Typography>
                      <Typography variant="body2" color="error.main">R$ {bill.amount.toLocaleString()}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Vence {bill.due.fromNow()}</Typography>
                  </Paper>
                ))}
                <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: '12px', textTransform: 'none' }}>Ver Calendário Financeiro</Button>
              </Stack>
            </PremiumCard>
          </Grid>
        </Grid>

        {/* DRAWER FILTROS */}
        <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: { width: 350, p: 4, borderRadius: '32px 0 0 32px' } }}>
          <Typography variant="h5" mb={4}>Filtros Avançados</Typography>
          <Stack spacing={4}>
            <FormControl fullWidth><InputLabel>Filial</InputLabel><Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value as string)} label="Filial"><MenuItem value="all">Todas as Unidades</MenuItem>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</Select></FormControl>
            <TextField label="De" type="date" fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Até" type="date" fullWidth value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Divider /><Typography variant="caption" color="text.secondary">CATEGORIAS</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>{['Vendas', 'Serviços', 'Aluguel', 'Fornecedores'].map(c => <Chip key={c} label={c} onClick={() => {}} variant="outlined" sx={{ borderRadius: '8px' }} />)}</Box>
            <Button variant="contained" fullWidth size="large" onClick={() => setFilterDrawerOpen(false)} sx={{ borderRadius: '14px', mt: 'auto' }}>Aplicar Filtros</Button>
          </Stack>
        </Drawer>

        {/* DRAWER DETALHES */}
        <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 4, borderRadius: '32px 0 0 32px' } }}>
          {selectedTransaction && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}><Typography variant="h5">Detalhes do Lançamento</Typography><IconButton onClick={() => setDetailDrawerOpen(false)}><ArrowIcon sx={{ transform: 'rotate(180deg)' }} /></IconButton></Stack>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '20px', mb: 4, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">VALOR</Typography><Typography variant="h3" color={selectedTransaction.type === 'inflow' ? 'success.main' : 'error.main'}>R$ {selectedTransaction.amount.toLocaleString()}</Typography></Paper>
              <List sx={{ '& .MuiListItem-root': { px: 0, py: 2 } }}><ListItem><ListItemText primary="Descrição" secondary={selectedTransaction.description} /></ListItem><ListItem><ListItemText primary="Categoria" secondary={selectedTransaction.category} /></ListItem><ListItem><ListItemText primary="Data" secondary={moment(selectedTransaction.date).format('LLLL')} /></ListItem><ListItem><ListItemText primary="Status" secondary={selectedTransaction.conciliated ? 'Conciliado' : 'Pendente'} /></ListItem></List>
              <Divider sx={{ my: 3 }} /><Typography variant="caption" color="text.secondary" display="block" mb={2}>COMPROVANTE</Typography><Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', borderStyle: 'dashed', textAlign: 'center' }}><ReceiptIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} /><Typography variant="caption" display="block">Nenhum anexo disponível</Typography></Paper>
            </Box>
          )}
        </Drawer>

        <SpeedDial ariaLabel="Ações Rápidas" sx={{ position: 'fixed', bottom: 32, right: 32 }} icon={<SpeedDialIcon />}>
          <SpeedDialAction icon={<AddIcon color="success" />} tooltipTitle="Entrada Rápida" onClick={() => setQuickEntryOpen(true)} />
          <SpeedDialAction icon={<RemoveIcon color="error" />} tooltipTitle="Saída Rápida (Sangria)" onClick={() => setQuickEntryOpen(true)} />
          <SpeedDialAction icon={<ConciliatedIcon />} tooltipTitle="Conciliação Bancária" onClick={handleConciliation} />
        </SpeedDial>

        <Dialog open={quickEntryOpen} onClose={() => setQuickEntryOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}><DialogTitle>Novo Lançamento de Caixa</DialogTitle><DialogContent><Box mt={1}><ExpenseForm onSubmit={(d) => { addNotification('Lançamento registrado.', 'success'); setQuickEntryOpen(false); fetchCashFlowData(); }} onCancel={() => setQuickEntryOpen(false)} /></Box></DialogContent></Dialog>

      </Box>
    </Box>
  );
};

export default CashFlowPage;
