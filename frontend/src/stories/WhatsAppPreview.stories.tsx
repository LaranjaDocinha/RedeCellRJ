import type { Meta, StoryObj } from '@storybook/react';
import { WhatsAppPreview } from '../components/WhatsAppPreview';

const meta: Meta<typeof WhatsAppPreview> = {
  title: 'Components/Messaging/WhatsAppPreview',
  component: WhatsAppPreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WhatsAppPreview>;

export const Default: Story = {
  args: {
    content: 'Olá {{ customer_name }}, seu pedido {{ order_number }} foi enviado!',
    variables: {
      customer_name: 'João',
      order_number: '#12345',
    },
  },
};

export const WithMissingVariables: Story = {
  args: {
    content: 'Olá {{ customer_name }}, seu orçamento está pronto.',
    variables: {},
  },
};
