import React from 'react';
import PerformanceSummaryCard from '@components/Reports/PerformanceSummaryCard';
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/PerformanceSummaryCard',
  component: PerformanceSummaryCard,
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    iconClass: { control: 'text' },
    animationDelay: { control: 'number' },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => <PerformanceSummaryCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Total de Reparos',
  value: '150',
  iconClass: 'bx-wrench',
  animationDelay: 0,
};

export const WithCurrencyValue = Template.bind({});
WithCurrencyValue.args = {
  title: 'Faturamento Total',
  value: 'R$ 25.000,00',
  iconClass: 'bx-dollar',
  animationDelay: 0.1,
};

export const WithTimeValue = Template.bind({});
WithTimeValue.args = {
  title: 'Tempo Médio de Reparo',
  value: '2h 30m',
  iconClass: 'bx-time',
  animationDelay: 0.2,
};

export const WithPercentageValue = Template.bind({});
WithPercentageValue.args = {
  title: 'Taxa de Conclusão',
  value: '95%',
  iconClass: 'bx-check-circle',
  animationDelay: 0.3,
};