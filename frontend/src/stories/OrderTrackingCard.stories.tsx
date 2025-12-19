import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import OrderTrackingCard from '../components/OrderTrackingCard';

export default {
  title: 'Customer Portal/OrderTrackingCard',
  component: OrderTrackingCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    order: { control: 'object' },
  },
} as Meta;

const Template: StoryFn<typeof OrderTrackingCard> = (args) => <OrderTrackingCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  order: {
    id: 12345,
    device_name: 'iPhone 13 Pro Max',
    problem_description: 'Tela trincada e bateria descarregando rápido. Não liga.',
    status: 'analysis',
    estimated_cost: 850.00,
    entry_date: '2025-12-01T10:00:00Z',
    customer_name: 'João Silva',
    branch_name: 'Redecell Centro',
    items: [
      { description: 'Troca de Tela Frontal', unit_price: 600.00, quantity: 1 },
      { description: 'Substituição de Bateria', unit_price: 250.00, quantity: 1 },
    ],
    photos: [
      { url: 'https://via.placeholder.com/100?text=Foto1', type: 'entry' },
      { url: 'https://via.placeholder.com/100?text=Foto2', type: 'entry' },
    ],
  },
};

export const InProgress = Template.bind({});
InProgress.args = {
  order: {
    ...Default.args.order,
    id: 12346,
    status: 'in_progress',
    problem_description: 'Substituição de tela e bateria. Aguardando calibração.',
    estimated_cost: 750.00,
    final_cost: 750.00,
    delivery_date: '2025-12-10T15:00:00Z',
  },
};

export const ReadyForPickup = Template.bind({});
ReadyForPickup.args = {
  order: {
    ...Default.args.order,
    id: 12347,
    status: 'finished',
    problem_description: 'Limpeza interna e atualização de software.',
    estimated_cost: 150.00,
    final_cost: 150.00,
    delivery_date: '2025-12-05T14:30:00Z',
    notes: 'Dispositivo testado e funcionando perfeitamente. Cliente notificado via WhatsApp.',
    photos: [
      { url: 'https://via.placeholder.com/100?text=Foto1', type: 'entry' },
      { url: 'https://via.placeholder.com/100?text=Foto2', type: 'exit' },
    ],
  },
};

export const WithNoCostYet = Template.bind({});
WithNoCostYet.args = {
  order: {
    ...Default.args.order,
    id: 12348,
    status: 'waiting_approval',
    estimated_cost: undefined,
    final_cost: undefined,
    problem_description: 'Avaliação de diagnóstico inicial. Orçamento a ser gerado.',
    items: [],
  },
};

export const Cancelled = Template.bind({});
Cancelled.args = {
  order: {
    ...Default.args.order,
    id: 12349,
    status: 'cancelled',
    estimated_cost: 300.00,
    final_cost: 0.00,
    problem_description: 'Cliente optou por não prosseguir com o reparo após orçamento.',
    notes: '[Portal] Cliente rejected: Custo muito alto.',
  },
};