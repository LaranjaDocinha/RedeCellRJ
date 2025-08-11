import React from 'react';
import { Container } from 'reactstrap';

import AdvancedTable from './AdvancedTable';

export default {
  title: 'Common/AdvancedTable',
  component: AdvancedTable,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    // Adicione controles para as props da tabela aqui, se necessário
    // Ex: onRowClick: { action: 'row clicked' },
  },
};

const Template = (args) => (
  <Container fluid className='py-4'>
    <AdvancedTable {...args} />
  </Container>
);

// Exemplo básico de uso
export const Default = Template.bind({});
Default.args = {
  data: [
    { id: 1, name: 'Item A', value: 100 },
    { id: 2, name: 'Item B', value: 200 },
    { id: 3, name: 'Item C', value: 150 },
  ],
  columns: [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Valor', accessorKey: 'value' },
  ],
  loading: false,
  emptyStateTitle: 'Nenhum dado encontrado',
  emptyStateMessage: 'Adicione alguns itens para começar.',
};

// Exemplo com dados vazios
export const EmptyState = Template.bind({});
EmptyState.args = {
  data: [],
  columns: [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Valor', accessorKey: 'value' },
  ],
  loading: false,
  emptyStateTitle: 'Nenhum dado encontrado',
  emptyStateMessage: 'Adicione alguns itens para começar.',
  emptyStateActionText: 'Adicionar Novo Item',
  onEmptyStateActionClick: () => alert('Adicionar novo item!'),
};

// Exemplo com estado de carregamento
export const LoadingState = Template.bind({});
LoadingState.args = {
  data: [],
  columns: [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nome', accessorKey: 'name' },
    { header: 'Valor', accessorKey: 'value' },
  ],
  loading: true,
  emptyStateTitle: 'Nenhum dado encontrado',
  emptyStateMessage: 'Adicione alguns itens para começar.',
};
