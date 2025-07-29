import React from 'react';

import Timeline from './Timeline';

export default {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {
    items: {
      control: 'object',
      description: 'Array de objetos que representam os eventos na timeline.',
    },
  },
};

const Template = (args) => <Timeline {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      title: 'Pedido Recebido',
      description: 'Seu pedido #12345 foi recebido e está aguardando processamento.',
      timestamp: '25 de Julho, 2025 - 10:30 AM',
      icon: 'bx-package',
    },
    {
      title: 'Pagamento Aprovado',
      description: 'O pagamento foi aprovado com sucesso.',
      timestamp: '25 de Julho, 2025 - 10:35 AM',
      icon: 'bx-credit-card',
    },
    {
      title: 'Em Separação',
      description: 'Os itens do seu pedido estão sendo separados em nosso estoque.',
      timestamp: '25 de Julho, 2025 - 11:15 AM',
      icon: 'bx-archive-in',
    },
    {
      title: 'Enviado para a Transportadora',
      description: 'Seu pedido foi coletado pela transportadora e está a caminho.',
      timestamp: '26 de Julho, 2025 - 09:00 AM',
      icon: 'bxs-truck',
    },
    {
      title: 'Entregue',
      description: 'Seu pedido foi entregue com sucesso!',
      timestamp: '27 de Julho, 2025 - 02:45 PM',
      icon: 'bx-check-shield',
    },
  ],
};

export const Minimal = Template.bind({});
Minimal.args = {
  items: [
    {
      title: 'Reparo Agendado',
      icon: 'bx-calendar-plus',
    },
    {
      title: 'Diagnóstico Iniciado',
      icon: 'bx-search-alt',
    },
    {
      title: 'Aguardando Peças',
      icon: 'bx-time-five',
    },
    {
      title: 'Reparo Concluído',
      icon: 'bx-check-circle',
    },
  ],
};
