import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion'; // Import motion
import { Paper, Typography, Box } from '@mui/material'; // Import Paper, Typography, Box from MUI

/**
 * @interface DashboardWidgetProps
 * @description Propriedades para o componente DashboardWidget.
 * @property {string} id - Identificador único do widget.
 * @property {string} title - O título do widget.
 * @property {React.ReactNode} children - O conteúdo do widget.
 * @property {boolean} [isSortable=false] - Indica se o widget pode ser arrastado e solto.
 */
interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isSortable?: boolean;
}

/**
 * @constant itemVariants
 * @description Variantes de animação para o Framer Motion.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * @function DashboardWidget
 * @description Componente de contêiner para os widgets do dashboard, com suporte a drag-and-drop e animações.
 * @param {DashboardWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente DashboardWidget.
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  isSortable = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1, // Slightly more opaque when dragging
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0px 8px 16px rgba(0,0,0,0.2)' : 'none', // Enhanced shadow when dragging
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout={true} // For smooth reordering animations
      style={{ height: '100%' }} // Ensure motion.div takes full height
    >
      <Paper
        ref={setNodeRef}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: (theme) => theme.borderRadius.medium, // Use theme's border-radius
          boxShadow: (theme) => theme.shadows.elevation2, // Use theme's shadows
          padding: (theme) => theme.spacing(2), // Equivalent to theme.spacing.md
          display: 'flex',
          flexDirection: 'column',
          gap: (theme) => theme.spacing(1), // Equivalent to theme.spacing.sm
          height: '100%', // Ensure Paper takes full height
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: (theme) => theme.shadows.elevation1, // Subtle elevation increase on hover
          },
          ...style, // Apply dnd-kit styles
        }}
        {...(isSortable ? attributes : {})}
        {...(isSortable ? listeners : {})}
        className={`widget-${id}`}
      >
        <Typography variant="h5" component="h2" sx={{
          marginTop: 0,
          color: 'text.primary',
          fontSize: (theme) => theme.typography.h5.fontSize,
          lineHeight: (theme) => theme.typography.h5.lineHeight,
          fontWeight: (theme) => theme.typography.h5.fontWeight,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // Use theme divider
          paddingBottom: (theme) => theme.spacing(1), // Equivalent to theme.spacing.sm
          marginBottom: (theme) => theme.spacing(1), // Equivalent to theme.spacing.sm
        }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }}> {/* Ensure content takes remaining space */}
          {children}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default DashboardWidget;
