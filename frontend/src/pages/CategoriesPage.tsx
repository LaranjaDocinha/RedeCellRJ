import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Paper, Chip, IconButton, Tooltip, CircularProgress, 
  Button, Grid, Avatar, TextField, InputAdornment, Stack, Divider, 
  useTheme, alpha, Drawer, Badge, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { 
  DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport, 
  GridToolbarColumnsButton, GridToolbarFilterButton
} from '@mui/x-data-grid';
import { 
  Search, Add, Inventory, Assessment, 
  Sync, Category as CategoryIcon, TrendingUp, SmartToy, 
  Close, Edit, Delete, Label, PieChart, AutoAwesome,
  PhoneIphone, TabletMac, LaptopMac, Watch, Headset, Dvr, Usb, 
  ElectricBolt, Memory, Construction, AccountTree
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { CategoryForm } from '../components/CategoryForm';

// --- Icon Mapping ---
const ICON_MAP: Record<string, React.ReactNode> = {
  PhoneIphone: <PhoneIphone />,
  TabletMac: <TabletMac />,
  LaptopMac: <LaptopMac />,
  Watch: <Watch />,
  Headset: <Headset />,
  Dvr: <Dvr />,
  Usb: <Usb />,
  ElectricBolt: <ElectricBolt />,
  Memory: <Memory />,
  Construction: <Construction />,
  CategoryIcon: <CategoryIcon />
};

// --- Styled Components High-End ---

const PageWrapper = styled(motion.div)`
  padding: 32px;
  background: ${({ theme }) => theme.palette.background.default};
  min-height: 100vh;
`;

const GlassCard = styled(Paper)`
  padding: 24px;
  border-radius: 28px;
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.8)};
  backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.1)};
  box-shadow: 0 10px 40px ${({ theme }) => alpha(theme.palette.common.black, 0.05)};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 45px ${({ theme }) => alpha(theme.palette.primary.main, 0.1)};
  }
`;

const CategoryAvatar = styled(Avatar)<{ $color?: string }>`
  background: ${({ $color, theme }) => $color ? alpha($color, 0.1) : alpha(theme.palette.primary.main, 0.1)};
  color: ${({ $color, theme }) => $color || theme.palette.primary.main};
  border: 1px solid ${({ $color, theme }) => $color ? alpha($color, 0.2) : alpha(theme.palette.divider, 0.1)};
  width: 42px;
  height: 42px;
`;

// --- Interfaces ---

interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  parent_name?: string;
  icon?: string;
  color?: string;
  slug?: string;
  product_count?: number;
  total_valuation?: number;
}

import { CategoryTreeView } from '../components/CategoryTreeView';
import { ViewList, ViewHeadline } from '@mui/icons-material';

const CategoriesPage: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  
  // Missing states
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { token } = useAuth();
  const { addNotification } = useNotification();

  // --- Handlers ---

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const enriched = data.map((c: any) => ({
        ...c,
        parent_name: data.find((p: any) => p.id === c.parent_id)?.name || '---',
        product_count: Math.floor(Math.random() * 150), // Mocks
        total_valuation: Math.floor(Math.random() * 50000), // Mocks
        icon: c.icon || 'CategoryIcon',
        color: c.color || (c.name.includes('iPhone') ? '#007aff' : c.name.includes('Samsung') ? '#1428a0' : undefined)
      }));
      
      setCategories(enriched);
    } catch (error: any) {
      addNotification('Falha ao carregar a inteligência de categorias.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreateOrUpdate = async (data: Omit<Category, 'id'>) => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Erro na operação');
      
      addNotification(`Categoria ${editingCategory ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      setIsModalOpen(false);
      setEditingCategory(undefined);
      fetchCategories();
    } catch (error: any) {
      addNotification('Erro ao processar categoria.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir esta categoria e desvincular produtos?')) return;
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erro ao excluir');
      addNotification('Categoria removida do catálogo.', 'info');
      fetchCategories();
    } catch (error: any) {
      addNotification('Falha na exclusão.', 'error');
    }
  };

  // --- Memoized Stats ---
  const stats = useMemo(() => {
    const total = categories.length;
    const topCategory = [...categories].sort((a, b) => (b.product_count || 0) - (a.product_count || 0))[0];
    const totalValuation = categories.reduce((acc, curr) => acc + (curr.total_valuation || 0), 0);
    return { total, topCategory, totalValuation };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // --- DataGrid Columns ---
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'CATEGORIA', 
      width: 300,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} alignItems="center" height="100%">
          <CategoryAvatar $color={params.row.color}>
            {ICON_MAP[params.row.icon] || <CategoryIcon fontSize="small" />}
          </CategoryAvatar>
          <Box>
            <Typography variant="subtitle2">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
              /{params.row.slug || 'slug-pendente'}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      field: 'parent_name',
      headerName: 'CATEGORIA PAI',
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {params.value !== '---' && <AccountTree sx={{ fontSize: 14, opacity: 0.5 }} />}
          <Typography variant="body2" color={params.value === '---' ? 'text.disabled' : 'inherit'}>
            {params.value}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'product_count',
      headerName: 'PRODUTOS',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={`${params.value} un.`} 
          size="small" 
          variant="outlined" 
          sx={{ borderRadius: '8px' }} 
        />
      )
    },
    {
      field: 'total_valuation',
      headerName: 'VALUATION',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'success.main' }}>
          R$ {params.value.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'GESTÃO',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Análise Detalhada">
            <IconButton size="small" onClick={() => { setSelectedCategory(params.row); setIsDrawerOpen(true); }}>
              <Assessment fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" color="primary" onClick={() => { setEditingCategory(params.row); setIsModalOpen(true); }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      
      {/* Header Premium */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ letterSpacing: '-2px' }}>Arquitetura de Catálogo</Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome fontSize="small" color="secondary" /> Organização lógica e estratégica de produtos Redecell
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Box sx={{ display: 'flex', bgcolor: 'background.paper', p: 0.5, borderRadius: '16px', border: '1px solid ' + theme.palette.divider }}>
            <Tooltip title="Visualização em Grade"><IconButton size="small" color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')}><ViewList /></IconButton></Tooltip>
            <Tooltip title="Visualização em Árvore"><IconButton size="small" color={viewMode === 'tree' ? 'primary' : 'default'} onClick={() => setViewMode('tree')}><ViewHeadline /></IconButton></Tooltip>
          </Box>
          <Button variant="outlined" startIcon={<Sync />} onClick={fetchCategories} sx={{ borderRadius: '16px', height: 48 }}>Sincronizar</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingCategory(undefined); setIsModalOpen(true); }} sx={{ borderRadius: '16px', px: 4, height: 48, boxShadow: '0 10px 20px ' + alpha(theme.palette.primary.main, 0.2) }}>Nova Categoria</Button>
        </Stack>
      </Box>

      {/* Grid de Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'TOTAL DE CATEGORIAS', val: stats.total, color: theme.palette.primary.main, icon: <Label /> },
          { label: 'MAIOR PENETRAÇÃO', val: stats.topCategory?.name || '---', color: theme.palette.secondary.main, icon: <TrendingUp /> },
          { label: 'VALUATION TOTAL', val: `R$ ${stats.totalValuation.toLocaleString()}`, color: theme.palette.success.main, icon: <PieChart /> },
          { label: 'SUBCATEGORIAS ATIVAS', val: categories.filter(c => c.parent_id).length, color: theme.palette.info.main, icon: <AccountTree /> }
        ].map((s, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <GlassCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.5 }}>{s.label}</Typography>
                  <Typography variant="h5" sx={{ mt: 0.5 }}>{s.val}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: alpha(s.color, 0.1), color: s.color }}>{s.icon}</Box>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Busca e Filtros */}
      <GlassCard sx={{ p: 1.5, mb: 3, borderRadius: '20px' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField 
            placeholder="Pesquisar por nome, slug ou categoria pai..."
            fullWidth size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment>,
              sx: { borderRadius: '14px', bgcolor: 'transparent' }
            }}
          />
        </Stack>
      </GlassCard>

      {/* Conteúdo Dinâmico */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
            <Box key="grid" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: '32px', overflow: 'hidden', border: '1px solid ' + alpha(theme.palette.divider, 0.1), boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
                <DataGrid
                rows={filteredCategories}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeader': { bgcolor: alpha(theme.palette.primary.main, 0.02), py: 2 },
                    '& .MuiDataGrid-cell': { borderBottom: '1px solid ' + alpha(theme.palette.divider, 0.05) },
                    '& .MuiDataGrid-row:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                }}
                slots={{
                    toolbar: () => (
                    <GridToolbarContainer sx={{ p: 2, borderBottom: '1px solid ' + alpha(theme.palette.divider, 0.1) }}>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarExport />
                    </GridToolbarContainer>
                    )
                }}
                />
            </Box>
        ) : (
            <Box key="tree" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={{ maxWidth: '800px', mx: 'auto' }}>
                <CategoryTreeView 
                    categories={filteredCategories}
                    onReorder={(newList) => setCategories(newList)}
                    onEdit={(cat) => { setEditingCategory(cat as any); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                />
            </Box>
        )}
      </AnimatePresence>

      {/* Modal de Formulário (Edição/Criação) */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '28px', p: 2, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          <IconButton onClick={() => setIsModalOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <CategoryForm 
            initialData={editingCategory}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detalhes Inteligentes (Drawer) */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 4, borderRadius: '40px 0 0 40px' } }}>
        {selectedCategory && (
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <CategoryAvatar $color={selectedCategory.color} sx={{ width: 64, height: 64 }}>
                {ICON_MAP[selectedCategory.icon || 'CategoryIcon'] || <CategoryIcon sx={{ fontSize: 32 }} />}
              </CategoryAvatar>
              <Box>
                <Typography variant="h5">{selectedCategory.name}</Typography>
                <Typography variant="body2" color="text.secondary">/{selectedCategory.slug}</Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="overline" sx={{ color: 'primary.main' }}>Performance de Mercado</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '20px', textAlign: 'center' }}>
                  <Typography variant="caption" display="block">Giro Médio</Typography>
                  <Typography variant="h6">14 dias</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '20px', textAlign: 'center' }}>
                  <Typography variant="caption" display="block">Rentabilidade</Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>+38%</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ color: 'primary.main', mt: 4, display: 'block' }}>Tendência de Interesse</Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: '24px', border: '1px dashed ' + theme.palette.secondary.main }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                <SmartToy /> Recomendação AI
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.6 }}>
                Esta categoria apresenta um aumento de <b>12% na procura</b> nas últimas 48 horas. Considere destacar itens vinculados no Ponto de Venda.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ mt: 6 }}>
              <Button fullWidth variant="contained" size="large" sx={{ borderRadius: '16px', py: 1.5 }}>Ver Produtos Vinculados</Button>
              <Button fullWidth variant="outlined" size="large" sx={{ borderRadius: '16px', py: 1.5 }}>Relatório de Auditoria</Button>
            </Stack>
          </Box>
        )}
      </Drawer>

    </PageWrapper>
  );
};

export default CategoriesPage;