import type { Meta, StoryObj } from '@storybook/react';
import SerialInputModal from '../components/POS/SerialInputModal';
import { fn } from '@storybook/test';

const meta: Meta<typeof SerialInputModal> = {
  title: 'POS/Modals/SerialInputModal',
  component: SerialInputModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SerialInputModal>;

export const Open: Story = {
  args: {
    open: true,
    productName: 'iPhone 13',
    quantity: 2,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    productName: '',
    quantity: 0,
  },
};
