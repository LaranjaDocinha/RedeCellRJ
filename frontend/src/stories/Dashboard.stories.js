import React from 'react';

import WidgetContainer from '@components/Dashboard/WidgetContainer';
import WidgetSkeleton from '@components/Dashboard/WidgetSkeleton';
import WidgetEmptyState from '@components/Dashboard/WidgetEmptyState';

export default {
  title: 'Dashboard/Base Components',
};

export const Container = () => (
  <div style={{ width: '350px', height: '200px' }}>
    <WidgetContainer title='Widget de Exemplo'>
      <p>Conteúdo do widget.</p>
    </WidgetContainer>
  </div>
);

export const Skeleton = () => (
  <div style={{ width: '350px', height: '200px' }}>
    <WidgetContainer title='Carregando...'>
      <WidgetSkeleton height={30} style={{ marginBottom: '1rem' }} />
      <WidgetSkeleton count={3} />
    </WidgetContainer>
  </div>
);

export const EmptyState = () => (
  <div style={{ width: '350px', height: '200px' }}>
    <WidgetContainer title='Vendas Recentes'>
      <WidgetEmptyState message='Nenhuma venda registrada hoje.' />
    </WidgetContainer>
  </div>
);
