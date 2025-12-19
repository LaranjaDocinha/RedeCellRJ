import type { Meta, StoryObj } from '@storybook/react';
import { Snackbar } from '../components/Snackbar';
import { fn } from '@storybook/test';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Feedback/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

export const Success: Story = {
  args: {
    open: true,
    message: 'Operation completed successfully.',
    severity: 'success',
  },
};

export const Error: Story = {
  args: {
    open: true,
    message: 'An error occurred.',
    severity: 'error',
  },
};
