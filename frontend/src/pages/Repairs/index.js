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

const RepairPage = () => {
  document.title = 'Ordens de Serviço | RedeCellRJ PDV';

  const { user } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'technician'
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

  const updateKanbanData = (repairResponse, settings = {}) => {
    const tasks = {};
    const lanes = {};
    const columnOrder = Object.keys(KANBAN_COLUMNS);

    if (groupBy === 'none') {
      const repairsData = repairResponse.repairs || [];
      lanes['all'] = {
        id: 'all',
        title: 'Todos os Reparos',
        columns: JSON.parse(JSON.stringify(KANBAN_COLUMNS)),
        columnOrder,
      };

      Object.keys(lanes['all'].columns).forEach((colName) => {
        if (settings[colName]) {
          lanes['all'].columns[colName].wip_limit = settings[colName].wip_limit;
        }
      });

      repairsData.forEach((repair) => {
        tasks[repair.id.toString()] = { ...repair, id: repair.id.toString() };
        if (lanes['all'].columns[repair.status]) {
          lanes['all'].columns[repair.status].taskIds.push(repair.id.toString());
        }
      });
    } else {
      const groupedData = repairResponse.lanes || {};
      Object.keys(groupedData).forEach((laneId) => {
        const laneData = groupedData[laneId];
        lanes[laneId] = {
          id: laneId,
          title: laneData.title,
          columns: JSON.parse(JSON.stringify(KANBAN_COLUMNS)),
          columnOrder,
        };

        Object.keys(lanes[laneId].columns).forEach((colName) => {
          if (settings[colName]) {
            lanes[laneId].columns[colName].wip_limit = settings[colName].wip_limit;
          }
        });

        laneData.repairs.forEach((repair) => {
          tasks[repair.id.toString()] = { ...repair, id: repair.id.toString() };
          if (lanes[laneId].columns[repair.status]) {
            lanes[laneId].columns[repair.status].taskIds.push(repair.id.toString());
          }
        });
      });
    }

    setKanbanData({ lanes, tasks });
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

  const getStatusBadge = (status) => {
    const colorMap = {
      'Orçamento pendente': 'secondary',
      'Aguardando Aprovação': 'info',
      'Em Reparo': 'primary',
      'Pronto para Retirada': 'primary',
      Finalizado: 'success',
      Cancelado: 'danger',
    };
    const color = colorMap[status] || 'light';
    return <span className={`badge text-bg-${color}`}>{status}</span>;
  };

  const getDeadlineBadge = (status) => {
    let color = 'secondary';
    let icon = 'bx-time';
    switch (status) {
      case 'No Prazo':
        color = 'success';
        icon = 'bx-check-circle';
        break;
      case 'Próximo do Vencimento':
        color = 'warning';
        icon = 'bx-hourglass';
        break;
      case 'Atrasado':
        color = 'danger';
        icon = 'bx-error-circle';
        break;
      case 'Concluído no Prazo':
        color = 'primary';
        icon = 'bx-calendar-check';
        break;
      case 'Concluído com Atraso':
        color = 'danger';
        icon = 'bx-calendar-x';
        break;
      case 'Sem Prazo Definido':
        color = 'info';
        icon = 'bx-info-circle';
        break;
      case 'Cancelado':
        color = 'dark';
        icon = 'bx-block';
        break;
      default:
        break;
    }
    return (
      <Badge className='text-capitalize' color={color}>
        <i className={`bx ${icon} me-1`}></i>
        {status}
      </Badge>
    );
  };

  const renderListView = () => (
    <div className='table-responsive'>
      <table className='table table-hover align-middle'>
        <thead className='table-light'>
          <tr>
            <th>#O.S.</th>
            <th>Cliente</th>
            <th>Aparelho</th>
            <th>Técnico</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Custo Total</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTheme baseColor='#e0e0e0' highlightColor='#f5f5f5'>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td>
                    <Skeleton width={50} />
                  </td>
                  <td>
                    <Skeleton width={100} />
                  </td>
                  <td>
                    <Skeleton width={120} />
                  </td>
                  <td>
                    <Skeleton width={80} />
                  </td>
                  <td>
                    <Skeleton width={90} />
                  </td>
                  <td>
                    <Skeleton width={90} />
                  </td>
                  <td>
                    <Skeleton width={70} />
                  </td>
                  <td>
                    <Skeleton width={80} />
                  </td>
                  <td>
                    <Skeleton height={30} width={100} />
                  </td>
                </tr>
              ))}
            </SkeletonTheme>
          ) : (
            repairs.map((repair) => (
              <tr key={repair.id}>
                <td>
                  <strong>{repair.id}</strong>
                </td>
                <td>{repair.customer_name}</td>
                <td>{repair.device_type}</td>
                <td>{repair.technician_name || 'N/A'}</td>
                <td>{getStatusBadge(repair.status)}</td>
                <td>{getDeadlineBadge(repair.deadline_status)}</td>
                <td>R$ {parseFloat(repair.final_cost || 0).toFixed(2)}</td>
                <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                <td>
                  <Link className='btn btn-primary btn-sm' to={`/repairs/${repair.id}`}>
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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
          <Breadcrumbs breadcrumbItem='Ordens de Serviço' title='Gerenciamento' />
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
                      color={viewMode === 'list' ? 'primary' : 'secondary'}
                      onClick={() => setViewMode('list')}
                    >
                      <i className='bx bx-list-ul'></i>
                    </Button>
                    <Button
                      color={viewMode === 'kanban' ? 'primary' : 'secondary'}
                      onClick={() => setViewMode('kanban')}
                    >
                      <i className='bx bxs-grid'></i>
                    </Button>
                  </ButtonGroup>
                  {viewMode === 'kanban' && (
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
                  )}
                  {viewMode === 'kanban' && (
                    <Input
                      style={{ maxWidth: '150px' }}
                      type='select'
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                    >
                      <option value='none'>Agrupar por: Nenhum</option>
                      <option value='technician'>Agrupar por: Técnico</option>
                      <option value='priority'>Agrupar por: Prioridade</option>
                    </Input>
                  )}
                  <Button color='success' tag={Link} to='/repairs/new'>
                    <i className='bx bx-plus me-1'></i> Nova O.S.
                  </Button>
                  {viewMode === 'list' && (
                    <Input
                      style={{ maxWidth: '200px' }}
                      type='select'
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value=''>Todos os Status</option>
                      <option value='Orçamento pendente'>Orçamento pendente</option>
                      <option value='Aguardando Aprovação'>Aguardando Aprovação</option>
                      <option value='Em Reparo'>Em Reparo</option>
                      <option value='Pronto para Retirada'>Pronto para Retirada</option>
                      <option value='Finalizado'>Finalizado</option>
                      <option value='Cancelado'>Cancelado</option>
                    </Input>
                  )}
                </Col>
              </Row>
              {viewMode === 'list' ? renderListView() : renderKanbanView()}
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

export default RepairPage;
