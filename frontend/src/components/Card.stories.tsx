import type { Meta, StoryObj } from '@storybook/react-webpack5';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'This is a default card.',
  },
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Custom Card Title</h3>
        <p>This card contains custom content and styling.</p>
        <button
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-small)',
          }}
        >
          Click Me
        </button>
      </div>
    ),
  },
};
