import type { Meta, StoryObj } from '@storybook/react';
import ErrorBoundary from '../components/ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/Utils/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const ComponentThatThrows = () => {
  throw new Error('This is a test error!');
};

export const Default: Story = {
  args: {
    children: <div>Componente Seguro</div>,
  },
};

export const WithError: Story = {
  args: {
    children: <ComponentThatThrows />,
  },
};
