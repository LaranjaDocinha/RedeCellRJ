import React from 'react';
import TechnicianPerformanceChart from '@components/Reports/TechnicianPerformanceChart';
import { ThemeProvider } from '@context/ThemeContext'; // Assuming you have a ThemeProvider
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/TechnicianPerformanceChart',
  component: TechnicianPerformanceChart,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    series: { control: 'object' },
    categories: { control: 'object' },
    title: { control: 'text' },
    type: { control: 'select', options: ['bar', 'line', 'area'] },
    animationDelay: { control: 'number' },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => <TechnicianPerformanceChart {...args} />;

export const DefaultBarChart = Template.bind({});
DefaultBarChart.args = {
  title: 'Reparos Concluídos por Técnico',
  series: [{
    name: 'Reparos',
    data: [44, 55, 41, 67, 22, 43]
  }],
  categories: ['Técnico A', 'Técnico B', 'Técnico C', 'Técnico D', 'Técnico E', 'Técnico F'],
  type: 'bar',
  animationDelay: 0,
};

export const RevenueLineChart = Template.bind({});
RevenueLineChart.args = {
  title: 'Faturamento por Técnico',
  series: [{
    name: 'Faturamento (R$)',
    data: [12000, 15000, 10000, 18000, 8000, 13000]
  }],
  categories: ['Técnico A', 'Técnico B', 'Técnico C', 'Técnico D', 'Técnico E', 'Técnico F'],
  type: 'line',
  animationDelay: 0.1,
};

export const AverageTimeAreaChart = Template.bind({});
AverageTimeAreaChart.args = {
  title: 'Tempo Médio de Reparo (min)',
  series: [{
    name: 'Tempo Médio (min)',
    data: [90, 75, 110, 60, 100, 85]
  }],
  categories: ['Técnico A', 'Técnico B', 'Técnico C', 'Técnico D', 'Técnico E', 'Técnico F'],
  type: 'area',
  animationDelay: 0.2,
};