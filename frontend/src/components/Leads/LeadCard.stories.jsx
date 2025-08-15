import React from 'react';
import LeadCard from './LeadCard';

export default {
    title: 'Leads/LeadCard',
    component: LeadCard,
    argTypes: {
        onClick: { action: 'clicked' },
        lead: {
            control: { type: 'object' },
            description: 'Lead data object',
        },
    },
    parameters: {
        layout: 'centered',
    },
};

const Template = (args) => <LeadCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    lead: {
        id: 1,
        name: 'João Silva',
        email: 'joao.silva@example.com',
        phone: '(11) 98765-4321',
        source: 'Website',
        status: 'Novo',
        notes: 'Interessado em reparo de celular.',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
    },
};

export const QualifiedLead = Template.bind({});
QualifiedLead.args = {
    lead: {
        id: 2,
        name: 'Maria Oliveira',
        email: 'maria.o@example.com',
        phone: '(21) 91234-5678',
        source: 'Indicação',
        status: 'Qualificado',
        notes: 'Pronta para fechar negócio.',
        created_at: '2023-02-10T14:30:00Z',
        updated_at: '2023-02-15T11:00:00Z',
    },
};

export const ConvertedLead = Template.bind({});
ConvertedLead.args = {
    lead: {
        id: 3,
        name: 'Carlos Souza',
        email: 'carlos.s@example.com',
        phone: '(31) 99876-5432',
        source: 'Telefone',
        status: 'Convertido',
        notes: 'Convertido em venda #12345.',
        created_at: '2023-03-05T09:00:00Z',
        updated_at: '2023-03-08T16:00:00Z',
    },
};
