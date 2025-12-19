import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import ChecklistFormComponent from '../components/ChecklistFormComponent';

export default {
  title: 'Tech App/ChecklistFormComponent',
  component: ChecklistFormComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    serviceOrderId: { control: 'number' },
    checklistTemplate: { control: 'object' },
    onSubmit: { action: 'checklistSubmitted' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
    isSubmitted: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<typeof ChecklistFormComponent> = (args) => (
  <ChecklistFormComponent {...args} />
);

export const PreRepairChecklist = Template.bind({});
PreRepairChecklist.args = {
  serviceOrderId: 12345,
  checklistTemplate: {
    id: 1,
    name: 'Checklist Pré-Reparo',
    items: [
      { item_name: 'Aparelho liga?' },
      { item_name: 'Tela intacta?' },
      { item_name: 'Touch funcionando?' },
      { item_name: 'Câmera frontal/traseira OK?' },
      { item_name: 'Wi-Fi conecta?' },
      { item_name: 'Carregamento OK?' },
    ],
  },
  onSubmit: (data) => console.log('Checklist submitted:', data),
};

export const PostRepairChecklist = Template.bind({});
PostRepairChecklist.args = {
  serviceOrderId: 12346,
  checklistTemplate: {
    id: 2,
    name: 'Checklist Pós-Reparo',
    items: [
      { item_name: 'Funcionalidade principal OK?' },
      { item_name: 'Estética sem danos?' },
      { item_name: 'Parafusos apertados?' },
      { item_name: 'Teste de bateria OK?' },
      { item_name: 'Limpeza final?' },
    ],
  },
  onSubmit: (data) => console.log('Checklist submitted:', data),
};

export const LoadingState = Template.bind({});
LoadingState.args = {
  ...PreRepairChecklist.args,
  isLoading: true,
};

export const SubmissionSuccess = Template.bind({});
SubmissionSuccess.args = {
  ...PreRepairChecklist.args,
  isSubmitted: true,
};

export const WithError = Template.bind({});
WithError.args = {
  ...PreRepairChecklist.args,
  error: 'Erro ao enviar o checklist. Verifique sua conexão.',
};
