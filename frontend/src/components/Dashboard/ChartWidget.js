import React from 'react';
import { ResponsiveContainer } from 'recharts';
import WidgetContainer from './WidgetContainer';
import WidgetSkeleton from './WidgetSkeleton';
import WidgetEmptyState from './WidgetEmptyState';

const ChartWidget = ({ title, data, isLoading, error, children }) => {
  const renderContent = () => {
    if (error) {
      return <WidgetEmptyState message="Erro ao carregar dados." />;
    }
    if (isLoading) {
      return <WidgetSkeleton height="100%" />;
    }
    if (!data || data.length === 0) {
      return <WidgetEmptyState />;
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        {children(data)}
      </ResponsiveContainer>
    );
  };

  return (
    <WidgetContainer title={title} style={{ height: '100%' }}>
      {renderContent()}
    </WidgetContainer>
  );
};

export default ChartWidget;
