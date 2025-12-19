import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import MarketplaceIntegrationCard from '../components/MarketplaceIntegrationCard';

export default {
  title: 'Marketplace/MarketplaceIntegrationCard',
  component: MarketplaceIntegrationCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    integration: { control: 'object' },
    onSyncNow: { action: 'syncNowClicked' },
    onConfigure: { action: 'configureClicked' },
  },
} as Meta;

const Template: StoryFn<typeof MarketplaceIntegrationCard> = (args) => (
  <MarketplaceIntegrationCard {...args} />
);

export const ActiveMercadoLivre = Template.bind({});
ActiveMercadoLivre.args = {
  integration: {
    id: 1,
    name: 'Mercado Livre',
    is_active: true,
    last_synced_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status_message: 'Todos os produtos sincronizados',
  },
};

export const InactiveShopee = Template.bind({});
InactiveShopee.args = {
  integration: {
    id: 2,
    name: 'Shopee',
    is_active: false,
    last_synced_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status_message: 'Integração desativada por erro de autenticação',
  },
};

export const ActiveWithSyncError = Template.bind({});
ActiveWithSyncError.args = {
  integration: {
    id: 3,
    name: 'Amazon',
    is_active: true,
    last_synced_at: new Date(Date.now() - 86400000 / 2).toISOString(), // 12 hours ago
    status_message: 'Erro na sincronização de estoque: Limite de requisições excedido',
  },
};

export const NeverSynced = Template.bind({});
NeverSynced.args = {
  integration: {
    id: 4,
    name: 'OLX',
    is_active: true,
    status_message: 'Aguardando primeira sincronização',
  },
};
