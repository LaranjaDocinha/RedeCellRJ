import React from 'react';
import './WidgetStates.scss';

const WidgetLoading = () => {
  return (
    <div className="widget-state-container">
      <div className="spinner"></div>
      <p>Carregando...</p>
    </div>
  );
};

export default WidgetLoading;
