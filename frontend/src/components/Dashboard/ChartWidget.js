import React from 'react';

import WidgetContainer from './WidgetContainer';
import WidgetSkeleton from './WidgetSkeleton';
import WidgetEmptyState from './WidgetEmptyState';

const ChartWidget = ({ title, data, isLoading, error, children }) => {
  const renderContent = () => {
    if (error) {
      return <WidgetEmptyState message='Erro ao carregar dados.' />;
    }
    if (isLoading) {
      return <WidgetSkeleton height='100%' />;
    }
    if (!data || data.length === 0) {
      return <WidgetEmptyState />;
    }
    return children(data);
  };

  return (
    <WidgetContainer style={{ height: '100%' }} title={title}>
      {renderContent()}
    </WidgetContainer>
  );
};

export default ChartWidget;
