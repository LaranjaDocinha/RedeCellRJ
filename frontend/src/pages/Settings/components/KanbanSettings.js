import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
} from 'reactstrap';
import toast from 'react-hot-toast';

import useApi from '../../../hooks/useApi';
import { get, post } from '../../../helpers/api_helper';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const KanbanSettings = () => {
  const [settings, setSettings] = useState([]);
  const [initialSettings, setInitialSettings] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingColumnName, setEditingColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSettings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Update column_order based on new position
        return newOrder.map((item, idx) => ({ ...item, column_order: idx }));
      });
    }
  };

  const arrayMove = (array, oldIndex, newIndex) => {
    const newArray = [...array];
    const [removed] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, removed);
    return newArray;
  };

  const SortableItem = ({ col, index, handleColorChange, editingColumnId, editingColumnName, handleEditColumnName, handleSaveColumnName, handleRemoveColumn }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: col.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <FormGroup ref={setNodeRef} style={style} {...attributes} className="mb-3 p-2 border rounded">
        <Row className='align-items-center'>
          <Col md={4}>
            {editingColumnId === col.id ? (
              <Input
                type="text"
                value={editingColumnName}
                onChange={(e) => setEditingColumnName(e.target.value)}
              />
            ) : (
              <Label className='fw-bold'>{col.column_name}</Label>
            )}
          </Col>
          <Col md={3}>
            <Input
              title='Cor de Fundo'
              type='color'
              value={col.background_color || '#ffffff'}
              onChange={(e) => handleColorChange(index, 'background_color', e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Input
              title='Cor do Texto'
              type='color'
              value={col.text_color || '#000000'}
              onChange={(e) => handleColorChange(index, 'text_color', e.target.value)}
            />
          </Col>
          <Col md={2} className="text-end">
            {editingColumnId === col.id ? (
              <Button color="success" size="sm" onClick={() => handleSaveColumnName(col.id)}>
                Salvar
              </Button>
            ) : (
              <Button color="info" size="sm" onClick={() => handleEditColumnName(col.id, col.column_name)} className="me-1">
                Editar
              </Button>
            )}
            <Button color="danger" size="sm" onClick={() => handleRemoveColumn(col.id)}>
              Remover
            </Button>
            <Button color="secondary" size="sm" className="ms-1" {...listeners}>
              <i className='bx bx-menu'></i>
            </Button>
          </Col>
        </Row>
      </FormGroup>
    );
  };

  const { loading, request: fetchSettings } = useApi(get);
  const { loading: saving, request: saveSettings } = useApi(post);

  const loadSettings = useCallback(() => {
    fetchSettings('/api/repairs/kanban/settings')
      .then((data) => {
        const sortedData = data.sort((a, b) => a.column_order - b.column_order);
        setSettings(sortedData);
        setInitialSettings(sortedData);
      })
      .catch((err) => toast.error(`Erro ao carregar configurações do Kanban: ${err.message}`));
  }, [fetchSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleColorChange = (index, field, value) => {
    const newSettings = [...settings];
    newSettings[index] = { ...newSettings[index], [field]: value }; // Cria uma nova cópia do objeto modificado
    setSettings(newSettings);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim() === '') {
      toast.error('O nome da nova coluna não pode ser vazio.');
      return;
    }
    const newColumn = {
      id: `temp-${Date.now()}`, // Temporary ID for new columns
      column_name: newColumnName.trim(),
      background_color: '#FFFFFF',
      text_color: '#000000',
      column_order: settings.length, // Add to the end
    };
    setSettings((prev) => [...prev, newColumn]);
    setNewColumnName('');
    toast.success('Coluna adicionada. Salve as alterações para aplicar.');
  };

  const handleEditColumnName = (id, currentName) => {
    setEditingColumnId(id);
    setEditingColumnName(currentName);
  };

  const handleSaveColumnName = (id) => {
    if (editingColumnName.trim() === '') {
      toast.error('O nome da coluna não pode ser vazio.');
      return;
    }
    setSettings((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, column_name: editingColumnName.trim() } : col
      )
    );
    setEditingColumnId(null);
    setEditingColumnName('');
    toast.success('Nome da coluna atualizado. Salve as alterações para aplicar.');
  };

  const handleRemoveColumn = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta coluna? Esta ação é irreversível após salvar.')) {
      setSettings((prev) => prev.filter((col) => col.id !== id));
      toast.success('Coluna removida. Salve as alterações para aplicar.');
    }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    try {
      await saveSettings('/api/repairs/kanban/settings', settings);
      setInitialSettings(settings); // Atualiza o estado inicial para refletir o salvamento
      toast.success('Configurações do Kanban salvas com sucesso!');
    } catch (err) {
      toast.error(`Erro ao salvar configurações: ${err.message}`);
    }
  };

  return (
    <Card>
      <CardBody>
        <CardTitle className='h4 mb-4'>Personalização do Kanban</CardTitle>
        {loading && <LoadingSpinner />}
        {!loading && (
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <Input
                    type="text"
                    placeholder="Nome da nova coluna"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Button color="success" onClick={handleAddColumn} className="w-100">
                    Adicionar Coluna
                  </Button>
                </Col>
              </Row>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={settings.map(col => col.id)} 
                strategy={verticalListSortingStrategy}
              >
                {settings.map((col, index) => (
                  <SortableItem 
                    key={col.id} 
                    col={col} 
                    index={index} 
                    handleColorChange={handleColorChange}
                    editingColumnId={editingColumnId}
                    editingColumnName={editingColumnName}
                    handleEditColumnName={handleEditColumnName}
                    handleSaveColumnName={handleSaveColumnName}
                    handleRemoveColumn={handleRemoveColumn}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <div className='d-flex justify-content-end mt-3'>
              <Button color='primary' disabled={saving || !isDirty} type='submit'>
                {saving ? <LoadingSpinner size='sm' /> : 'Salvar Configurações do Kanban'}
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default KanbanSettings;
