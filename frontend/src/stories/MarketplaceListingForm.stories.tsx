import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import MarketplaceListingForm from '../components/MarketplaceListingForm';

export default {
  title: 'Marketplace/MarketplaceListingForm',
  component: MarketplaceListingForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    marketplaceIntegrations: { control: 'object' },
    productVariations: { control: 'object' },
    onSubmit: { action: 'submitted' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
    isSubmitted: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<typeof MarketplaceListingForm> = (args) => (
  <MarketplaceListingForm {...args} />
);

export const Default = Template.bind({});
Default.args = {
  marketplaceIntegrations: [
    { id: 1, name: 'Mercado Livre' },
    { id: 2, name: 'Shopee' },
    { id: 3, name: 'Amazon' },
  ],
  productVariations: [
    { id: 101, sku: 'IP15-PROM-BL', name: 'iPhone 15 Pro Max Azul' },
    { id: 102, sku: 'GLXS24-ULT-PRT', name: 'Galaxy S24 Ultra Preto' },
    { id: 103, sku: 'ACC-CAPA-IP15', name: 'Capa iPhone 15 Silicone' },
  ],
  onSubmit: (data) => console.log('Form submitted:', data),
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isLoading: true,
};

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  error: 'Erro ao salvar o mapeamento. Verifique os dados e tente novamente.',
};

export const SubmittedSuccess = Template.bind({});
SubmittedSuccess.args = {
  ...Default.args,
  isSubmitted: true,
};
