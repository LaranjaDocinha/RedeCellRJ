import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '../components/settings/ColorPicker';
import { fn } from '@storybook/test';

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/Settings/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    value: '#ff0000',
  },
};
