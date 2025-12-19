import type { Meta, StoryObj } from '@storybook/react';
import Switch from '../components/Switch';
import { fn } from '@storybook/test';

const meta: Meta<typeof Switch> = {
  title: 'Components/Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const On: Story = {
  args: {
    checked: true,
    label: 'Enable Feature',
  },
};

export const Off: Story = {
  args: {
    checked: false,
    label: 'Enable Feature',
  },
};

export const Disabled: Story = {
    args: {
      checked: true,
      label: 'Disabled Switch',
      disabled: true,
    },
  };