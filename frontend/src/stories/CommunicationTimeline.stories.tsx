import type { Meta, StoryObj } from '@storybook/react';
import CommunicationTimeline from '../components/CommunicationTimeline';

const mockCommunications = [
  {
    id: 1,
    channel: 'Telefone',
    direction: 'inbound' as const,
    summary: 'Cliente ligou para perguntar sobre o reparo.',
    communication_timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    channel: 'WhatsApp',
    direction: 'outbound' as const,
    summary: 'Enviada mensagem com orçamento.',
    communication_timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    channel: 'Email',
    direction: 'outbound' as const,
    summary: 'Nota fiscal enviada.',
    communication_timestamp: new Date(Date.now() - 86400000).toISOString(),
  }
];

const meta: Meta<typeof CommunicationTimeline> = {
  title: 'Components/Timeline/CommunicationTimeline',
  component: CommunicationTimeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommunicationTimeline>;

export const Default: Story = {
  args: {
    communications: mockCommunications,
  },
};

export const Empty: Story = {
  args: {
    communications: [],
  },
};
