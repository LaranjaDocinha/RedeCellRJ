import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ImeiInput, ImeiInputProps } from './ImeiInput';

export default {
  title: 'Components/ImeiInput',
  component: ImeiInput,
} as Meta;

const Template: Story<ImeiInputProps> = (args) => <ImeiInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'IMEI do Aparelho',
};

export const WithValue = Template.bind({});
WithValue.args = {
  label: 'IMEI do Aparelho',
  defaultValue: '123456789012345',
};
