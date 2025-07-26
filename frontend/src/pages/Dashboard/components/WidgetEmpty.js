import React from 'react';
import './WidgetStates.scss';

const WidgetEmpty = () => {
  return (
    <div className="widget-state-container">
      <i className="ri-inbox-2-line empty-icon"></i>
      <p>Não há dados para exibir.</p>
    </div>
  );
};

export default WidgetEmpty;
