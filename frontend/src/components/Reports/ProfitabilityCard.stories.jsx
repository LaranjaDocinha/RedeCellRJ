import React from 'react';
import ProfitabilityCard from '@components/Reports/ProfitabilityCard';
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/ProfitabilityCard',
  component: ProfitabilityCard,
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

const Template = (args) => <ProfitabilityCard {...args} />;

export const HighestProfitMargin = Template.bind({});
HighestProfitMargin.args = {
  title: 'Maior Margem de Lucro',
  value: 'Produto X (85%)',
  iconClass: 'bx-trending-up',
  animationDelay: 0,
};

export const LowestProfitMargin = Template.bind({});
LowestProfitMargin.args = {
  title: 'Menor Margem de Lucro',
  value: 'Produto Y (10%)',
  iconClass: 'bx-trending-down',
  animationDelay: 0.1,
};

export const TotalGrossProfit = Template.bind({});
TotalGrossProfit.args = {
  title: 'Lucro Bruto Total',
  value: 'R$ 150.000,00',
  iconClass: 'bx-dollar',
  animationDelay: 0.2,
};

export const TotalProductsSold = Template.bind({});
TotalProductsSold.args = {
  title: 'Total de Produtos Vendidos',
  value: '5.200',
  iconClass: 'bx-package',
  animationDelay: 0.3,
};