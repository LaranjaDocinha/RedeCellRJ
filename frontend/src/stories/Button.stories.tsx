import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

// Ícone de exemplo para as stories
const ExampleIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    fill="currentColor"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'info', 'warning'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    onClick: { action: 'clicked' },
    startIcon: { control: 'boolean' },
    endIcon: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'contained',
    color: 'secondary',
    label: 'Button',
  },
};

export const Error: Story = {
  args: {
    variant: 'contained',
    color: 'error',
    label: 'Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'contained',
    color: 'success',
    label: 'Button',
  },
};

export const Info: Story = {
  args: {
    variant: 'contained',
    color: 'info',
    label: 'Button',
  },
};

export const Warning: Story = {
  args: {
    variant: 'contained',
    color: 'warning',
    label: 'Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    color: 'primary',
    label: 'Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    color: 'primary',
    label: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
};

export const WithStartIcon: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Button',
    startIcon: ExampleIcon,
  },
};

export const WithEndIcon: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Button',
    endIcon: ExampleIcon,
  },
};

export const WithBothIcons: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Button',
    startIcon: ExampleIcon,
    endIcon: ExampleIcon,
  },
};

export const LoadingState: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Processando...',
    loading: true,
  },
};

export const FullWidthButton: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    label: 'Disabled Button',
    disabled: true,
  },
};
