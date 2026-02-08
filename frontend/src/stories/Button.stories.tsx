import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { FaSave, FaTrash } from 'react-icons/fa';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'info', 'warning'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'contained',
    color: 'secondary',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined',
    variant: 'outlined',
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const WithStartIcon: Story = {
  args: {
    children: 'Save',
    startIcon: <FaSave />,
    color: 'success',
  },
};

export const WithEndIcon: Story = {
  args: {
    children: 'Delete',
    endIcon: <FaTrash />,
    color: 'error',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};
