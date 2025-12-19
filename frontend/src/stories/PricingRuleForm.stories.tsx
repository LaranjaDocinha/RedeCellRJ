import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import PricingRuleForm from '../components/PricingRuleForm';

export default {
  title: 'Smart Pricing/PricingRuleForm',
  component: PricingRuleForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    initialData: { control: 'object' },
    onSubmit: { action: 'submitted' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
    isSubmitted: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<typeof PricingRuleForm> = (args) => <PricingRuleForm {...args} />;

export const CreateNewRule = Template.bind({});
CreateNewRule.args = {
  onSubmit: (data) => console.log('New rule submitted:', data),
};

export const EditExistingRule = Template.bind({});
EditExistingRule.args = {
  initialData: {
    id: 1,
    name: 'Desconto por Encalhe',
    condition_type: 'low_turnover',
    condition_value: { days_without_sale: 60 },
    action_type: 'discount_percentage',
    action_value: 15,
    is_active: true,
    priority: 10,
  },
  onSubmit: (data) => console.log('Updated rule submitted:', data),
};

export const Loading = Template.bind({});
Loading.args = {
  ...CreateNewRule.args,
  isLoading: true,
};

export const WithError = Template.bind({});
WithError.args = {
  ...CreateNewRule.args,
  error: 'Erro ao salvar a regra de precificação. Verifique os campos.',
};

export const SubmittedSuccess = Template.bind({});
SubmittedSuccess.args = {
  ...CreateNewRule.args,
  isSubmitted: true,
};
