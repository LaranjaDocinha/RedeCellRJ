import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Stack, 
  alpha, 
  useTheme,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  FaHandshake, 
  FaPlus, 
  FaSearch, 
  FaWhatsapp, 
  FaDollarSign, 
  FaHistory,
  FaEllipsisV,
  FaChartPie,
  FaTrophy,
  FaTimesCircle,
  FaCheckCircle,
  FaRegClock,
  FaExclamationCircle,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';

const DealsPage: React.FC = () => {
  const theme = useTheme();

  const columns = [
    { id: 'lead', title: 'Oportunidade', color: theme.palette.info.main },
    { id: 'proposal', title: 'Proposta Enviada', color: theme.palette.warning.main },
    { id: 'negotiation', title: 'Em Negociação', color: theme.palette.secondary.main },
    { id: 'won', title: 'Fechado', color: theme.palette.success.main },
  ];

  const [deals, setDeals] = useState([
    { id: 1, customer: 'Roberto J.', product: 'iPhone 15 Pro Max', value: 7500, status: 'negotiation', source: 'Instagram', isStale: true },
    { id: 2, customer: 'Clínica Sorrir', product: 'Lote iPad 9th Gen (x5)', value: 12000, status: 'proposal', source: 'Indicação', isStale: false },
    { id: 3, customer: 'Mariana L.', product: 'MacBook Air M2', value: 8900, status: 'lead', source: 'Site', isStale: false },
  ]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const dealId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    
    if (newStatus === 'won') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
  };

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* 4.30 Dashboard de Ganhos no Topo */}
      <Stack direction="row" spacing={3} mb={4}>
          <Paper sx={{ p: 2, borderRadius: '16px', flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${theme.palette.divider}` }}>
              <FaChartPie color={theme.palette.primary.main} />
              <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={400}>VGV ESTIMADO (FECHAMENTO 70%)</Typography>
                  <Typography variant="h6" fontWeight={400}>R$ 45.800,00</Typography>
              </Box>
          </Paper>
          <Button variant="outlined" startIcon={<FaHistory />} sx={{ borderRadius: '12px' }}>Histórico</Button>
          <Button variant="contained" startIcon={<FaPlus />} sx={{ borderRadius: '12px', px: 3 }}>Novo Negócio</Button>
      </Stack>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 4, minHeight: 'calc(100vh - 250px)' }}>
            {columns.map((col) => (
                <Droppable key={col.id} droppableId={col.id}>
                    {(provided) => (
                        <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ minWidth: 320, maxWidth: 320, flexShrink: 0 }}>
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 2, 
                                    borderRadius: '20px', 
                                    bgcolor: alpha(col.color, 0.05),
                                    border: `1px solid ${alpha(col.color, 0.1)}`,
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={400} sx={{ color: col.color, textTransform: 'uppercase' }}>
                                    {col.title}
                                </Typography>
                                <Chip label={deals.filter(d => d.status === col.id).length} size="small" sx={{ bgcolor: col.color, color: 'white', fontWeight: 400 }} />
                            </Paper>

                            <Stack spacing={2}>
                                {deals.filter(d => d.status === col.id).map((deal, index) => (
                                    <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <Paper sx={{ p: 2.5, borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', '&:hover': { borderColor: col.color, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="caption" fontWeight={400} color="text.secondary">{deal.source.toUpperCase()}</Typography>
                                                            {/* 4.23 Alerta de Inatividade */}
                                                            {deal.isStale && <Tooltip title="Sem atividade há 48h"><FaExclamationCircle size={12} color={theme.palette.error.main} /></Tooltip>}
                                                        </Stack>
                                                        <IconButton size="small"><FaEllipsisV size={12} /></IconButton>
                                                    </Box>
                                                    
                                                    <Typography variant="subtitle1" fontWeight={400} gutterBottom>{deal.customer}</Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={2}>{deal.product}</Typography>
                                                    
                                                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="h6" fontWeight={400} color="primary.main">
                                                            R$ {deal.value.toLocaleString()}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1}>
                                                            <IconButton size="small" sx={{ color: '#25D366', bgcolor: alpha('#25D366', 0.1) }}><FaWhatsapp size={14} /></IconButton>
                                                            {col.id === 'proposal' && <IconButton size="small" color="primary"><FaFileInvoiceDollar size={14} /></IconButton>}
                                                            {col.id !== 'won' && <IconButton size="small" color="success"><FaCheckCircle size={14} /></IconButton>}
                                                        </Stack>
                                                    </Box>
                                                </Paper>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Droppable>
            ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};

export default DealsPage;
