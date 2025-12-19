import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../components/ui/Card';
import React from 'react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: { type: 'select' },
      options: ['none', 'low', 'medium', 'high'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'glass', 'outlined', 'gradient'],
    },
    padding: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#f0f2f5', padding: '40px', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Card Title</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>
          This is a simple card component with Framer Motion animations and styled-components.
        </p>
      </div>
    ),
    elevation: 'medium',
    variant: 'default',
  },
};

export const Glassmorphism: Story = {
  args: {
    ...Default.args,
    variant: 'glass',
  },
  decorators: [
    (Story) => (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '40px', 
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Story />
      </div>
    ),
  ],
};

export const HighElevation: Story = {
  args: {
    ...Default.args,
    elevation: 'high',
  },
};

export const CustomPadding: Story = {
  args: {
    ...Default.args,
    padding: '48px',
  },
};