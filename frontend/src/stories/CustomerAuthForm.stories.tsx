import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import CustomerAuthForm from '../components/CustomerAuthForm';

export default {
  title: 'Customer Portal/CustomerAuthForm',
  component: CustomerAuthForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
  },
} as Meta;

const Template: StoryFn<typeof CustomerAuthForm> = (args) => <CustomerAuthForm {...args} />;

export const Default = Template.bind({});
Default.args = {
  onSubmit: (osId, identity) => console.log('OS ID:', osId, 'Identity:', identity),
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  isLoading: true,
};

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  error: 'OS ID ou CPF/Telefone incorretos. Tente novamente.',
};
