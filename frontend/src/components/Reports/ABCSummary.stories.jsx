import React from 'react';
import ABCSummary from '@components/Reports/ABCSummary';
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/ABCSummary',
  component: ABCSummary,
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

const Template = (args) => <ABCSummary {...args} />;

export const ClassAProducts = Template.bind({});
ClassAProducts.args = {
  title: 'Produtos Classe A',
  value: '15',
  iconClass: 'bx-star',
  animationDelay: 0,
};

export const ClassBProducts = Template.bind({});
ClassBProducts.args = {
  title: 'Produtos Classe B',
  value: '30',
  iconClass: 'bx-award',
  animationDelay: 0.1,
};

export const ClassCProducts = Template.bind({});
ClassCProducts.args = {
  title: 'Produtos Classe C',
  value: '55',
  iconClass: 'bx-leaf',
  animationDelay: 0.2,
};

export const TotalProductsAnalyzed = Template.bind({});
TotalProductsAnalyzed.args = {
  title: 'Total de Produtos Analisados',
  value: '100',
  iconClass: 'bx-package',
  animationDelay: 0.3,
};