import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Alert,
  Badge,
  ButtonGroup,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

import useNotification from '../../hooks/useNotification';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import RepairDetailsView from '../../components/Kanban/RepairDetailsView';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import { get, put, post } from '../../helpers/api_helper';
import { useAuthStore } from '../../store/authStore';

import 'react-loading-skeleton/dist/skeleton.css';

const KANBAN_COLUMNS = {
  'Orçamento pendente': { id: 'Orçamento pendente', title: 'Orçamento pendente', taskIds: [] },
  'Aguardando Aprovação': {
    id: 'Aguardando Aprovação',
    title: 'Aguardando Aprovação',
    taskIds: [],
  },
  'Em Reparo': { id: 'Em Reparo', title: 'Em Reparo', taskIds: [] },
  'Pronto para Retirada': {
    id: 'Pronto para Retirada',
    title: 'Pronto para Retirada',
    taskIds: [],
  },
  Finalizado: { id: 'Finalizado', title: 'Finalizado', taskIds: [] },
  Cancelado: { id: 'Cancelado', title: 'Cancelado', taskIds: [] },
};

const TechnicianKanban = () => {
  document.title = 'Kanban do Técnico | RedeCellRJ PDV';

  const { user } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBy, setGroupBy] = useState('technician'); // Always group by technician
  const [kanbanData, setKanbanData] = useState({
    lanes: { all: { columns: KANBAN_COLUMNS, columnOrder: Object.keys(KANBAN_COLUMNS) } },
    tasks: {},
  });

  const [kanbanViewMode, setKanbanViewMode] = useState('detailed'); // 'compact' or 'detailed'
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { request: fetchRepairsApi, loading, error } = useApi(get);
  const { request: updateRepairStatusApi } = useApi(put);
  const { request: createRepairApi } = useApi(post);
  const { request: fetchKanbanSettingsApi } = useApi(get);
  const { request: assignRepairApi } = useApi(put);
  const { showSuccess, showError, showInfo } = useNotification();

  const fetchRepairsAndSettings = useCallback(async () => {
    try {
      const repairParams = {
        search: searchTerm,
        status: statusFilter,
        limit: 100,
        userId: user?.id,
        groupBy: groupBy,
      };

      const [repairResponse, settingsResponse] = await Promise.all([
        fetchRepairsApi('/api/repairs', { params: repairParams }),
        fetchKanbanSettingsApi('/api/repairs/kanban/settings'),
      ]);

      const fetchedRepairs = repairResponse.repairs || [];
      setRepairs(fetchedRepairs);

      const settingsMap = settingsResponse.reduce((acc, setting) => {
        acc[setting.column_name] = { wip_limit: setting.wip_limit };
        return acc;
      }, {});

      updateKanbanData(repairResponse, settingsMap);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar dados do quadro.');
    }
  }, [searchTerm, statusFilter, fetchRepairsApi, fetchKanbanSettingsApi, user?.id, groupBy]);

  useEffect(() => {
    fetchRepairsAndSettings();
  }, [fetchRepairsAndSettings]);

  const updateKanbanData = (kanbanDataFromBackend, settings = {}) => {
    const newLanes = {};
    const newTasks = kanbanDataFromBackend.tasks || {};

    Object.keys(kanbanDataFromBackend.lanes).forEach((laneId) => {
      const lane = kanbanDataFromBackend.lanes[laneId];
      newLanes[laneId] = {
        ...lane,
        columns: {},
      };

      Object.keys(lane.columns).forEach((colName) => {
        newLanes[laneId].columns[colName] = {
          ...lane.columns[colName],
          wip_limit: settings[colName]?.wip_limit || 0,
        };
      });
    });

    setKanbanData({ lanes: newLanes, tasks: newTasks });
  };

  const handleKanbanDrop = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceLaneId = source.droppableId.split('-')[0];
    const destLaneId = destination.droppableId.split('-')[0];
    const sourceColumnId = source.droppableId.split('-').slice(1).join('-');
    const destColumnId = destination.droppableId.split('-').slice(1).join('-');

    // Otimistic UI Update
    // ...

    try {
      // 1. Update status
      await updateRepairStatusApi(`/api/repairs/${draggableId}/status`, { status: destColumnId });
      showSuccess('Status atualizado!');

      // 2. Automation Rule
      if (destColumnId === 'Pronto para Retirada') {
        await assignRepairApi(`/api/repairs/${draggableId}/assign`, { technicianId: user.id });
        showSuccess(`Reparo #${draggableId} atribuído a você.`);
      }

      fetchRepairsAndSettings();
    } catch (err) {
      showError('Falha na automação ou atualização de status.');
      // Revert UI state on failure
    }
  };

  const handleTaskAdd = async (columnId, content) => {
    try {
      // Simple parsing, assumes "Customer Name - Problem"
      const [customer_name, problem_description] = content.split('-').map((s) => s.trim());

      if (!customer_name || !problem_description) {
        showError('Formato inválido. Use: Nome do Cliente - Defeito');
        return;
      }

      const newRepair = {
        customer_name,
        problem_description,
        status: columnId,
        // Add other default fields as necessary
        device_type: 'Não especificado',
        created_by: user.id,
      };

      const response = await createRepairApi('/api/repairs', newRepair);
      showSuccess('O.S. criada com sucesso!');
      fetchRepairsAndSettings(); // Refresh data
    } catch (err) {
      showError('Erro ao criar O.S.');
      console.error(err);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedRepair(task);
    setIsDrawerOpen(true);
  };

  const handleCardAction = async (action, taskId) => {
    if (action === 'viewDetails') {
      const task = kanbanData.tasks[taskId];
      if (task) {
        handleTaskClick(task);
      }
    } else if (action === 'assignToMe') {
      try {
        await assignRepairApi(`/api/repairs/${taskId}/assign`, { technicianId: user.id });
        showSuccess(`Reparo #${taskId} atribuído a você.`);
        fetchRepairsAndSettings();
      } catch (err) {
        showError('Erro ao atribuir reparo.');
        console.error(err);
      }
    } else if (action.startsWith('moveTo')) {
      // Handle "Move to..." actions
      let newStatus;
      switch (action) {
        case 'moveToTodo':
          newStatus = 'Orçamento pendente';
          break;
        case 'moveToInProgress':
          newStatus = 'Em Reparo';
          break;
        case 'moveToDone':
          newStatus = 'Pronto para Retirada';
          break;
        default:
          return; // Should not happen
      }
      try {
        await updateRepairStatusApi(`/api/repairs/${taskId}/status`, { status: newStatus });
        showSuccess(`Reparo #${taskId} movido para ${newStatus}.`);
        fetchRepairsAndSettings();
      } catch (err) {
        showError('Erro ao mover reparo.');
        console.error(err);
      }
    } else if (action === 'deleteCard') {
      // Implement delete logic here if needed, or show a confirmation modal
      showInfo("Funcionalidade 'Excluir Card' em desenvolvimento.");
    }
  };

  const renderKanbanView = () => {
    const currentLanes = kanbanData.lanes;
    const currentTasks = kanbanData.tasks;

    return (
      <DndProvider backend={HTML5Backend}>
        {Object.keys(currentLanes).map((laneId) => {
          const lane = currentLanes[laneId];
          return (
            <div key={laneId} className='kanban-swimlane mb-4'>
              {groupBy !== 'none' && <h5 className='swimlane-title'>{lane.title}</h5>}
              <KanbanBoard
                columnOrder={lane.columnOrder}
                columns={lane.columns}
                kanbanViewMode={kanbanViewMode}
                laneId={laneId} // Pass laneId to KanbanBoard
                tasks={currentTasks}
                onCardAction={handleCardAction}
                onTaskAdd={handleTaskAdd}
                onTaskClick={handleTaskClick}
                onTaskDrop={handleKanbanDrop}
              />
            </div>
          );
        })}
      </DndProvider>
    );
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Kanban do Técnico' title='Gerenciamento' />
          {error && <Alert color='danger'>{error}</Alert>}
          <Card>
            <CardBody>
              <Row className='mb-4'>
                <Col sm={4}>
                  <Input
                    placeholder='Buscar por cliente, aparelho ou IMEI...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col className='d-flex justify-content-end gap-2' sm={8}>
                  <ButtonGroup>
                    <Button
                      color={kanbanViewMode === 'detailed' ? 'primary' : 'secondary'}
                      onClick={() => setKanbanViewMode('detailed')}
                    >
                      Detalhado
                    </Button>
                    <Button
                      color={kanbanViewMode === 'compact' ? 'primary' : 'secondary'}
                      onClick={() => setKanbanViewMode('compact')}
                    >
                      Compacto
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
              {renderKanbanView()}
            </CardBody>
          </Card>
        </Container>
      </div>
      <AnimatePresence>
        {isDrawerOpen && selectedRepair && (
          <motion.div
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            initial={{ x: '100%' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '400px', // Adjust as needed
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
              zIndex: 1050, // Ensure it's above other content
              overflowY: 'auto',
              padding: '1rem',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <RepairDetailsView
              isOpen={isDrawerOpen}
              repair={selectedRepair}
              toggle={() => setIsDrawerOpen(false)}
              onUpdate={fetchRepairsAndSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export default TechnicianKanban;