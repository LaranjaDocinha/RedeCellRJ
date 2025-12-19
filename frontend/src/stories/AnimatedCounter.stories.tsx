import type { Meta, StoryObj } from '@storybook/react';
import AnimatedCounter from '../components/AnimatedCounter';

const meta: Meta<typeof AnimatedCounter> = {
  title: 'Components/AnimatedCounter',
  component: AnimatedCounter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnimatedCounter>;

export const Default: Story = {
  args: {
    value: 1250.50,
  },
};

export const Percentage: Story = {
  args: {
    value: 85.5,
    prefix: '',
    decimals: 1,
  },
};

export const LargeNumber: Story = {
  args: {
    value: 1000000,
    prefix: 'Users: ',
    decimals: 0,
  },
};
