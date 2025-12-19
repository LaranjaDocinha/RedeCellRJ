import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import TechOrderCard from '../components/TechOrderCard';

export default {
  title: 'Tech App/TechOrderCard',
  component: TechOrderCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    order: { control: 'object' },
    onClick: { action: 'clicked' },
  },
} as Meta;

const Template: StoryFn<typeof TechOrderCard> = (args) => <TechOrderCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  order: {
    id: 12345,
    device_name: 'iPhone 13 Pro Max',
    problem_description: 'Tela trincada e bateria descarregando rápido. Não liga.',
    status: 'analysis',
    priority: 'normal',
    customer_name: 'João Silva',
    entry_date: '2025-12-01T10:00:00Z',
  },
};

export const Urgent = Template.bind({});
Urgent.args = {
  order: {
    ...Default.args.order,
    id: 12346,
    status: 'in_progress',
    priority: 'urgent',
    device_name: 'Samsung Galaxy S22',
  },
};

export const WaitingApproval = Template.bind({});
WaitingApproval.args = {
  order: {
    ...Default.args.order,
    id: 12347,
    status: 'waiting_approval',
    priority: 'high',
    device_name: 'Xiaomi Redmi Note 10',
  },
};

export const Finished = Template.bind({});
Finished.args = {
  order: {
    ...Default.args.order,
    id: 12348,
    status: 'finished',
    priority: 'normal',
    device_name: 'Motorola G Power',
  },
};