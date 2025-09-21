import React from 'react';
import { WidgetContainer } from './DashboardWidget.styled';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion'; // Import motion

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isSortable?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ id, title, children, isSortable = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout // For smooth reordering animations
    >
      <WidgetContainer ref={setNodeRef} style={isSortable ? style : undefined} {...(isSortable ? attributes : {})} {...(isSortable ? listeners : {})}>
        <h2>{title}</h2>
        {children}
      </WidgetContainer>
    </motion.div>
  );
};


export default DashboardWidget;