import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Spinner, Alert } from 'reactstrap';
import { DragDropContext } from '@hello-pangea/dnd';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import axios from 'axios';
import config from '../../config';
import KanbanColumn from './components/KanbanColumn';
import RepairsStats from './components/RepairsStats';
import RepairsToolbar from './components/RepairsToolbar'; // Importando a toolbar
import KanbanSkeleton from './components/KanbanSkeleton';

const RepairsKanban = () => {
  document.title = "Quadro de Reparos | Skote PDV";

  const [columns, setColumns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '' });


  // Ordem definida para as colunas
  const columnOrder = [
    'Orçamento pendente', 
    'Aguardando Aprovação', 
    'Em Reparo', 
    'Aguardando Peças', 
    'Pronto para Retirada', 
    'Finalizado', 
    'Cancelado'
  ];

  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.api.API_URL}/api/repairs?limit=1000`);
      const repairs = response.data.repairs;
      
      const initialColumns = columnOrder.reduce((acc, status) => {
        acc[status] = { name: status, items: [] };
        return acc;
      }, {});

      repairs.forEach(repair => {
        if (initialColumns[repair.status]) {
          initialColumns[repair.status].items.push(repair);
        }
      });

      setColumns(initialColumns);
    } catch (err) {
      setError("Falha ao carregar os reparos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const onDragEnd = async (result, cols, setCols) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = cols[source.droppableId];
      const destColumn = cols[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setCols({
        ...cols,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      try {
        await axios.patch(`${config.api.API_URL}/api/repairs/${draggableId}/status`, {
          status: destination.droppableId,
          notes: `Status alterado via quadro Kanban.`
        });
      } catch (err) {
        alert('Falha ao atualizar o status. A mudança será revertida.');
        setCols(cols); 
      }
    } else {
      const column = cols[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setCols({
        ...cols,
        [source.droppableId]: { ...column, items: copiedItems },
      });
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  if (error) return <div className="page-content"><Container fluid><Alert color="danger">{error}</Alert></Container></div>;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Reparos" breadcrumbItem="Quadro Kanban" />
          <RepairsStats />
          <RepairsToolbar onSearch={handleSearch} onFilter={() => alert('Filtros avançados em breve!')} />
          <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
            {loading ? (
              <KanbanSkeleton />
            ) : (
              <DragDropContext onDragEnd={result => onDragEnd(result, columns, setColumns)}>
                <Row style={{width: '100%', overflowX: 'auto', flexWrap: 'nowrap'}}>
                  {columnOrder.map((columnId) => {
                    const column = columns[columnId];
                    if (!column) return null;
                    return <KanbanColumn key={columnId} column={column} />;
                  })}
                </Row>
              </DragDropContext>
            )}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default RepairsKanban;