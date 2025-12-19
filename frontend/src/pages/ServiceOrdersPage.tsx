import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import * as serviceOrderService from '../services/serviceOrderService';
import type { ServiceOrder } from '../services/serviceOrderService';
import ServiceOrderKanbanBoard from '../components/ServiceOrders/ServiceOrderKanbanBoard'; // Importar o novo Kanban Board
import { useNotification } from '../contexts/NotificationContext'; // Para toasts
import { useAuth } from '../contexts/AuthContext'; // Para autenticação
import { useQueryClient } from '@tanstack/react-query'; // Para invalidar cache após mutação


// Possible service order statuses from the migration file
export const SERVICE_ORDER_STATUSES = [ // Exportar para uso no ServiceOrderKanbanBoard
  'Aguardando Avaliação',
  'Aguardando Aprovação',
  'Aprovado',
  'Em Reparo',
  'Aguardando Peça',
  'Aguardando QA',
  'Finalizado',
  'Não Aprovado',
  'Entregue',
];

const ServiceOrdersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(''); // Filtro ainda pode ser usado pelo KanbanBoard
  const [searchTerm, setSearchTerm] = useState<string>(''); // Termo de busca ainda pode ser usado pelo KanbanBoard

  // Form states for create/edit
  const [customerId, setCustomerId] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [imei, setImei] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [entryChecklist, setEntryChecklist] = useState<string>('{}'); // JSON string

  const { addToast } = useNotification();
  const { token } = useAuth();
  const queryClient = useQueryClient(); // Hook para invalidar o cache

  const handleOpenCreateModal = useCallback(() => {
    setSelectedServiceOrder(null);
    setCustomerId('');
    setProductDescription('');
    setImei('');
    setIssueDescription('');
    setEntryChecklist('{}');
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((order: ServiceOrder) => {
    setSelectedServiceOrder(order);
    setCustomerId(order.customer_id);
    setProductDescription(order.product_description);
    setImei(order.imei || '');
    setIssueDescription(order.issue_description);
    setEntryChecklist(JSON.stringify(order.entry_checklist, null, 2));
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedServiceOrder(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const parsedEntryChecklist = JSON.parse(entryChecklist);
      const serviceOrderData = {
        customer_id: customerId,
        product_description: productDescription,
        imei: imei || undefined,
        entry_checklist: parsedEntryChecklist,
        issue_description: issueDescription,
      };

      if (!token) {
        addToast('Erro de autenticação. Por favor, faça login novamente.', 'error');
        return;
      }

      if (selectedServiceOrder) {
        await serviceOrderService.updateServiceOrder(token, selectedServiceOrder.id, serviceOrderData);
        addToast('Ordem de serviço atualizada com sucesso!', 'success');
      } else {
        await serviceOrderService.createServiceOrder(token, serviceOrderData);
        addToast('Ordem de serviço criada com sucesso!', 'success');
      }
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida o cache para re-fetch
    } catch (err: any) {
      console.error('Falha ao salvar ordem de serviço:', err);
      addToast(err.message || 'Falha ao salvar ordem de serviço.', 'error');
    }
  }, [selectedServiceOrder, customerId, productDescription, imei, issueDescription, entryChecklist, token, addToast, handleCloseModal, queryClient]);

  const handleDeleteServiceOrder = useCallback(async (id: number) => {
    if (!token) {
      addToast('Erro de autenticação. Por favor, faça login novamente.', 'error');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await serviceOrderService.deleteServiceOrder(token, id);
        addToast('Ordem de serviço excluída com sucesso!', 'success');
        queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }); // Invalida o cache para re-fetch
      } catch (err: any) {
        console.error('Falha ao excluir ordem de serviço:', err);
        addToast(err.message || 'Falha ao excluir ordem de serviço.', 'error');
      }
    }
  }, [token, addToast, queryClient]);

  // A função handleStatusChange não é mais necessária aqui, pois será manipulada dentro do ServiceOrderKanbanBoard.
  // Entretanto, o ServiceOrderKanbanBoard vai chamar um onStatusChange que precisará invalidar o cache.
  const handleKanbanStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    if (!token) {
      addToast('Erro de autenticação. Por favor, faça login novamente.', 'error');
      return;
    }
    try {
      await serviceOrderService.changeServiceOrderStatus(token, orderId, newStatus);
      // addToast(`Status da OS #${orderId} alterado para ${newStatus}`, 'success'); // Toast já tratado no KanbanBoard
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    } catch (err: any) {
      console.error('Falha ao alterar status da ordem de serviço:', err);
      addToast(err.message || 'Falha ao alterar status da ordem de serviço.', 'error');
      throw err; // Rejeita para que o KanbanBoard possa reverter o estado otimista
    }
  }, [token, addToast, queryClient]);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Ordens de Serviço (Kanban)
      </Typography>

      {/* A área de erro aqui agora é para o modal de criação/edição */}
      {/* <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> */}

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar Ordem"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filtrar por Status"
                onChange={(e: SelectChangeEvent<string>) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {SERVICE_ORDER_STATUSES.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateModal}
            >
              Nova Ordem de Serviço
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Renderizar o Kanban Board */}
      <ServiceOrderKanbanBoard
        filterStatus={filterStatus}
        searchTerm={searchTerm}
        onEditOrder={handleOpenEditModal}
        onDeleteOrder={handleDeleteServiceOrder}
        onStatusChange={handleKanbanStatusChange}
        onNewOrder={handleOpenCreateModal} // Passar a função de criar nova ordem
      />

      {/* Create/Edit Service Order Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{selectedServiceOrder ? 'Editar Ordem de Serviço' : 'Criar Nova Ordem de Serviço'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                label="ID do Cliente (UUID)"
                type="text"
                fullWidth
                variant="outlined"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Descrição do Produto"
                type="text"
                fullWidth
                variant="outlined"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="IMEI (Opcional)"
                type="text"
                fullWidth
                variant="outlined"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Descrição do Problema"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Checklist de Entrada (JSON)"
                type="text"
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                value={entryChecklist}
                onChange={(e) => setEntryChecklist(e.target.value)}
                sx={{ mb: 2 }}
                error={(() => { try { JSON.parse(entryChecklist); return false; } catch { return true; } })()}
                helperText={(() => { try { JSON.parse(entryChecklist); return 'JSON Inválido'; } catch { return 'JSON Inválido'; } })()}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedServiceOrder ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceOrdersPage;