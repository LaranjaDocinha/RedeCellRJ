import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import CustomerPortalLayout from '../components/CustomerPortalLayout';

export default {
  title: 'Customer Portal/CustomerPortalLayout',
  component: CustomerPortalLayout,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
  },
} as Meta;

const Template: StoryFn<typeof CustomerPortalLayout> = (args) => (
  <CustomerPortalLayout {...args}>
    <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc', margin: '20px' }}>
      {args.children || "Conteúdo do portal aqui"}
    </div>
  </CustomerPortalLayout>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Meu Pedido',
  children: 'Este é o conteúdo principal da página de rastreamento de pedidos.',
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'Status da Minha OS',
  children: 'Você pode personalizar o título do cabeçalho.',
};

export const WithComplexContent = Template.bind({});
WithComplexContent.args = {
  title: 'Detalhes da Ordem de Serviço #12345',
  children: (
    <>
      <h2>Bem-vindo, João!</h2>
      <p>Aqui você pode acompanhar o status da sua ordem de serviço e aprovar orçamentos.</p>
      <div style={{ border: '1px solid #eee', padding: '15px', marginTop: '20px' }}>
        <h3>Status Atual: Em Análise</h3>
        <p>Previsão: 2 dias úteis</p>
      </div>
    </>
  ),
};
