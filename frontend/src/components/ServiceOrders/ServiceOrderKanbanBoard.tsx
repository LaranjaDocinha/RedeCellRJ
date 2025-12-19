import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';
import useHapticFeedback from '../../hooks/useHapticFeedback';
import { useNotification } from '../../contexts/NotificationContext';
import { ServiceOrder } from '../../services/serviceOrderService';
import * as serviceOrderService from '../../services/serviceOrderService';
import KanbanColumn from '../Kanban/KanbanColumn'; // Reutilizar o componente de coluna existente
import ServiceOrderKanbanCard from './ServiceOrderKanbanCard'; // Componente de cartão específico para SO
import { StyledEmptyState } from '../../pages/DashboardPage'; // Reutilizar StyledEmptyState do DashboardPage
import { useAuth } from '../../contexts/AuthContext'; // Para o token de autenticação

// Possible service order statuses from the migration file
const SERVICE_ORDER_STATUSES = [
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

interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
}

interface KanbanCardData {
  id: string; // ID da ordem de serviço
  title: string;
  description: string;
  column_id: string; // Status atual
  position: number; // Posição dentro da coluna
  serviceOrder: ServiceOrder; // Objeto completo da ordem de serviço
}

interface ServiceOrderKanbanBoardProps {
  filterStatus?: string; // Para filtrar ordens ao carregar
  searchTerm?: string;   // Para buscar ordens ao carregar
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (orderId: number) => void;
  onNewOrder: () => void; // Para adicionar novas ordens diretamente do Kanban (opcional)
}

const ServiceOrderKanbanBoard: React.FC<ServiceOrderKanbanBoardProps> = ({
  filterStatus,
  searchTerm,
  onEditOrder,
  onDeleteOrder,
  onNewOrder,
}) => {
  const [board, setBoard] = useState<KanbanColumnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const triggerHapticFeedback = useHapticFeedback();
  const { addToast } = useNotification();
  const { token } = useAuth(); // Obter o token de autenticação

  const fetchServiceOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        status: filterStatus === 'All' || !filterStatus ? undefined : filterStatus,
        searchTerm: searchTerm || undefined, // Passa o termo de busca para a API
      };
      const fetchedOrders = await serviceOrderService.fetchAllServiceOrders(token!, filters);

      // Mapear as ordens de serviço para a estrutura do Kanban
      const initialBoard: KanbanColumnData[] = SERVICE_ORDER_STATUSES.map(status => ({
        id: status,
        title: status,
        cards: [],
      }));

      fetchedOrders.forEach(order => {
        const columnIndex = initialBoard.findIndex(col => col.id === order.status);
        if (columnIndex !== -1) {
          initialBoard[columnIndex].cards.push({
            id: String(order.id),
            title: `OS #${order.id} - ${order.customer_id}`, // Exemplo de título
            description: order.product_description,
            column_id: order.status,
            position: 0, // A posição será gerenciada pelo dnd-kit internamente
            serviceOrder: order,
          });
        }
      });

      // Ordenar cartões dentro das colunas se necessário (ex: por data de criação)
      initialBoard.forEach(col => {
        col.cards.sort((a, b) => (new Date(a.serviceOrder.created_at || '')).getTime() - (new Date(b.serviceOrder.created_at || '')).getTime());
      });

      setBoard(initialBoard);
    } catch (err: any) {
      setError('Falha ao carregar as Ordens de Serviço do Kanban.');
      addToast('Could not load service orders for Kanban. Please try refreshing.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, token, addToast]);

  useEffect(() => {
    if (token) {
      fetchServiceOrders();
    }
  }, [fetchServiceOrders, token]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(async (event: any) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    // Se a coluna foi reordenada (não aplicável para este Kanban de status fixos, mas a lógica existe no KanbanBoard genérico)
    if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
        // Ignorar movimentação de coluna, pois os status são fixos
        return;
    }

    // Lógica para movimentação de cartão (ServiceOrder)
    const activeCardId = String(active.id);
    const newColumnId = String(over.id); // O ID da coluna destino é o novo status

    let originalBoard = board; // Capturar o estado antes da atualização otimista

    setBoard((prevBoard) => {
      const oldColumn = prevBoard.find((col) => col.cards.some((card) => card.id === activeCardId));
      const newColumn = prevBoard.find((col) => col.id === newColumnId);

      if (!oldColumn || !newColumn) return prevBoard;

      const activeCard = oldColumn.cards.find((card) => card.id === activeCardId);
      if (!activeCard) return prevBoard;

      // Se a ordem foi movida para uma nova coluna (status)
      if (oldColumn.id !== newColumn.id) {
        // Remover da coluna antiga
        const updatedOldColumnCards = oldColumn.cards.filter((card) => card.id !== activeCardId);
        // Adicionar à nova coluna
        const updatedNewColumnCards = [...newColumn.cards, { ...activeCard, column_id: newColumnId }];

        return prevBoard.map((col) => {
          if (col.id === oldColumn.id) return { ...col, cards: updatedOldColumnCards };
          if (col.id === newColumn.id) return { ...col, cards: updatedNewColumnCards };
          return col;
        });
      } else {
        // Se a ordem foi reordenada dentro da mesma coluna (mantém a lógica original do dnd-kit)
        const oldIndex = oldColumn.cards.findIndex((card) => card.id === activeCardId);
        let newIndex = newColumn.cards.findIndex((card) => card.id === over.id);
        if (newIndex === -1) newIndex = newColumn.cards.length - 1; // Se arrastou para o final

        const updatedCards = arrayMove(oldColumn.cards, oldIndex, newIndex);
        return prevBoard.map((col) =>
          col.id === oldColumn.id ? { ...col, cards: updatedCards } : col
        );
      }
    });

    // Chamar a API para persistir a mudança de status
    try {
      await serviceOrderService.changeServiceOrderStatus(token!, Number(activeCardId), newColumnId);
      triggerHapticFeedback();
      addToast(`Ordem de Serviço #${activeCardId} movida para ${newColumnId}!`, 'success');
      // Não precisamos refetch aqui se o update otimista foi bom, mas se houver reordenamento, um refetch pode ser útil
      // Ou otimizar a atualização do estado para refletir a nova posição se a API retornar a ordem atualizada
    } catch (err) {
      console.error('Falha ao mover Ordem de Serviço:', err);
      addToast('Falha ao mover Ordem de Serviço. Revertendo alterações.', 'error');
      setBoard(originalBoard); // Reverter estado em caso de falha
    }
  }, [board, token, onStatusChange, addToast, triggerHapticFeedback]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaExclamationTriangle />
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </StyledEmptyState>
    );
  }

  if (board.every(column => column.cards.length === 0)) {
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaClipboardList />
        <Typography variant="h5" gutterBottom>
          Nenhuma Ordem de Serviço Encontrada!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 400 }}>
          Comece a registrar novas ordens para vê-las no seu Kanban.
        </Typography>
        {onNewOrder && (
          <Button variant="contained" color="primary" size="large" onClick={onNewOrder}>
            Criar Nova Ordem de Serviço
          </Button>
        )}
      </StyledEmptyState>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, gap: 2, bgcolor: (theme) => theme.palette.grey[100], borderRadius: 2 }}>
        {board.map((column) => (
          <SortableContext key={column.id} items={column.cards.map(card => card.id)}>
            <KanbanColumn
              id={column.id}
              title={column.title}
              // Passar um render prop para o conteúdo do cartão
              // Isso permite que KanbanColumn seja genérico e o ServiceOrderKanbanCard seja específico
            >
              {column.cards.map((card) => (
                <ServiceOrderKanbanCard
                  key={card.id}
                  id={card.id}
                  serviceOrder={card.serviceOrder}
                  onEdit={onEditOrder}
                  onDelete={onDeleteOrder}
                />
              ))}
            </KanbanColumn>
          </SortableContext>
        ))}
      </Box>
    </DndContext>
  );
};

export default ServiceOrderKanbanBoard;
