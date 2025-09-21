
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import KanbanCard from '../components/Kanban/KanbanCard';

export default {
  title: 'Kanban/KanbanCard',
  component: KanbanCard,
} as ComponentMeta<typeof KanbanCard>;

const Template: ComponentStory<typeof KanbanCard> = (args) => <KanbanCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  card: { id: '1', title: 'Resolver bug na tela de login' },
};
