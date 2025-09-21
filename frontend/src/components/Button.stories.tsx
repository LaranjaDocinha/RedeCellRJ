import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

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
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    label: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Contained: Story = {
  args: {
    variant: 'contained',
    label: 'Contained Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Outlined Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    label: 'Text Button',
  },
};

export const SecondaryColor: Story = {
  args: {
    variant: 'contained',
    color: 'secondary',
    label: 'Secondary Color',
  },
};

export const DangerColor: Story = {
  args: {
    variant: 'contained',
    color: 'danger',
    label: 'Danger Color',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'large',
    label: 'Large Button',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'small',
    label: 'Small Button',
  },
};