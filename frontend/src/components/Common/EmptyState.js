import React from 'react';
import { Button } from 'reactstrap';
import { motion } from 'framer-motion';
import './EmptyState.scss';

const EmptyState = ({
  icon = 'bx bx-data',
  title = 'Nenhum dado encontrado',
  message = 'Parece que não há nada para mostrar aqui ainda.',
  actionText,
  onActionClick,
}) => {
  return (
    <motion.div
      className="empty-state-container text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="empty-state-icon">
        <i className={icon}></i>
      </div>
      <h4 className="mt-4">{title}</h4>
      <p className="text-muted">{message}</p>
      {actionText && onActionClick && (
        <Button color="primary" onClick={onActionClick}>
          <i className="bx bx-plus me-1"></i>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
