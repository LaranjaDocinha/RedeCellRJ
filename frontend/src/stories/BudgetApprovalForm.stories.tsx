import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import BudgetApprovalForm from '../components/BudgetApprovalForm';

export default {
  title: 'Customer Portal/BudgetApprovalForm',
  component: BudgetApprovalForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onApprove: { action: 'approved' },
    onReject: { action: 'rejected' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
    isApproved: { control: 'boolean' },
    isRejected: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<typeof BudgetApprovalForm> = (args) => <BudgetApprovalForm {...args} />;

export const Default = Template.bind({});
Default.args = {
  onApprove: (feedback) => console.log('Approved with feedback:', feedback),
  onReject: (feedback) => console.log('Rejected with feedback:', feedback),
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isLoading: true,
};

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  error: 'Não foi possível processar sua solicitação. Tente novamente.',
};

export const AlreadyApproved = Template.bind({});
AlreadyApproved.args = {
  ...Default.args,
  isApproved: true,
  isLoading: false,
};

export const AlreadyRejected = Template.bind({});
AlreadyRejected.args = {
  ...Default.args,
  isRejected: true,
  isLoading: false,
};
