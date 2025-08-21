import React from 'react';
import { Badge } from 'reactstrap';
import { motion } from 'framer-motion';
import './StatusBadge.scss'; // Assuming a SCSS file for styling

const StatusBadge = ({ status, animationDelay = 0 }) => {
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'secondary'; // Gray
      case 'Sent':
        return 'info'; // Blue
      case 'Approved':
        return 'success'; // Green
      case 'Rejected':
        return 'danger'; // Red
      case 'ConvertedToSale':
        return 'primary'; // Primary color
      default:
        return 'light';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Draft':
        return 'Rascunho';
      case 'Sent':
        return 'Enviado';
      case 'Approved':
        return 'Aprovado';
      case 'Rejected':
        return 'Rejeitado';
      case 'ConvertedToSale':
        return 'Convertido em Venda';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.3, type: 'spring', stiffness: 100, damping: 10 }}
      className="status-badge-wrapper"
    >
      <Badge color={getBadgeColor(status)} pill>
        {getStatusText(status)}
      </Badge>
    </motion.div>
  );
};

export default StatusBadge;