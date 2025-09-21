
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import KanbanColumn from '../components/Kanban/KanbanColumn';

export default {
  title: 'Kanban/KanbanColumn',
  component: KanbanColumn,
} as ComponentMeta<typeof KanbanColumn>;

const Template: ComponentStory<typeof KanbanColumn> = (args) => <div style={{ width: '300px' }}><KanbanColumn {...args} /></div>;

export const Default = Template.bind({});
Default.args = {
  column: {
    id: 'col-1',
    title: 'A Fazer',
    cards: [
      { id: 'card-1', title: 'Configurar o ambiente de desenvolvimento' },
      { id: 'card-2', title: 'Criar os componentes da UI' },
    ],
  },
};

export const Empty = Template.bind({});
Empty.args = {
  column: {
    id: 'col-2',
    title: 'Vazio',
    cards: [],
  },
};
