import type { Meta, StoryObj } from '@storybook/react';
import { InstallmentCalculator } from '../components/InstallmentCalculator';

const meta = {
  title: 'Components/InstallmentCalculator',
  component: InstallmentCalculator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InstallmentCalculator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: 1500.00,
  },
};