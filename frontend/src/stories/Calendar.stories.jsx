
import React from 'react';
import CalendarView from '../components/Calendar/CalendarView';

// Mock data for demonstration purposes in Storybook
const mockEvents = [
  {
    id: 'sale-1',
    title: 'Venda #1 - Cliente Exemplo A',
    start: new Date().toISOString().substr(0, 10), // Today
    allDay: true,
    color: '#28a745',
    extendedProps: {
      type: 'Venda',
      amount: 150.75,
      customer: 'Cliente Exemplo A'
    }
  },
  {
    id: 'repair-1',
    title: 'Reparo #1 - iPhone 12',
    start: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().substr(0, 10), // 2 days ago
    allDay: true,
    color: '#007bff',
    extendedProps: {
      type: 'Reparo',
      status: 'Em andamento',
      customer: 'Cliente Exemplo B'
    }
  },
    {
    id: 'repair-2',
    title: 'Reparo #2 - Samsung S21',
    start: new Date().toISOString().substr(0, 10), // Today
    allDay: true,
    color: '#007bff',
    extendedProps: {
      type: 'Reparo',
      status: 'Orçamento pendente',
      customer: 'Cliente Exemplo C'
    }
  }
];

export default {
  title: 'Components/CalendarView',
  component: CalendarView,
  argTypes: {
    events: {
      control: 'object',
      description: 'Array of event objects to display on the calendar.',
    },
  },
};

const Template = (args) => <CalendarView {...args} />;

export const Default = Template.bind({});
Default.args = {
  events: mockEvents,
};

export const Empty = Template.bind({});
Empty.args = {
  events: [],
};
