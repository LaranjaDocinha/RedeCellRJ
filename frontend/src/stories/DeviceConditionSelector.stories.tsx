import React from 'react';
import { Story, Meta } from '@storybook/react';
import { DeviceConditionSelector, DeviceConditionSelectorProps } from './DeviceConditionSelector';

export default {
  title: 'Components/DeviceConditionSelector',
  component: DeviceConditionSelector,
} as Meta;

const Template: Story<DeviceConditionSelectorProps> = (args) => <DeviceConditionSelector {...args} />;

export const Default = Template.bind({});
Default.args = {};
