import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { FaGripVertical } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy Widgets
const SalesWidget = () => (
  <Paper elevation={3} sx={{ p: 2, height: 200 }}>
    <Typography variant="h6">Vendas Diárias</Typography>
    <Typography variant="h4">R$ 1.250,00</Typography>
  </Paper>
);

const InventoryWidget = () => (
  <Paper elevation={3} sx={{ p: 2, height: 200 }}>
    <Typography variant="h6">Estoque Crítico</Typography>
    <Typography variant="h4">5 itens</Typography>
  </Paper>
);

const ServiceOrdersWidget = () => (
  <Paper elevation={3} sx={{ p: 2, height: 200 }}>
    <Typography variant="h6">OS em Andamento</Typography>
    <Typography variant="h4">12 OSs</Typography>
  </Paper>
);

const ChurnRiskWidget = () => (
  <Paper elevation={3} sx={{ p: 2, height: 200 }}>
    <Typography variant="h6">Clientes de Risco</Typography>
    <Typography variant="h4">3 Clientes</Typography>
  </Paper>
);

const DragHandle = ({ listeners }: { listeners?: any }) => (
  <Box sx={{ cursor: 'grab', p: 1, bgcolor: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'center' }} {...listeners}>
    <FaGripVertical />
  </Box>
);

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, { listeners })}
    </div>
  );
};

const widgetMap: { [key: string]: React.FC } = {
  sales: SalesWidget,
  inventory: InventoryWidget,
  serviceOrders: ServiceOrdersWidget,
  churnRisk: ChurnRiskWidget,
};

const CustomizableDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<string[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : ['sales', 'inventory', 'serviceOrders', 'churnRisk'];
  });

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Meu Dashboard Customizável</Typography>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets} strategy={rectSortingStrategy}>
          <Grid container spacing={2}>
            <AnimatePresence>
              {widgets.map((widgetId) => {
                const WidgetComponent = widgetMap[widgetId];
                if (!WidgetComponent) return null; // Fallback
                return (
                  <Grid item xs={12} sm={6} md={4} key={widgetId} component={motion.div} layout>
                    <SortableWidget id={widgetId}>
                      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                        <DragHandle />
                        <WidgetComponent />
                      </Paper>
                    </SortableWidget>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default CustomizableDashboard;
