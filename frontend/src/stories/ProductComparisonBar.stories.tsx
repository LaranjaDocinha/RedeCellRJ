import type { Meta, StoryObj } from '@storybook/react';
import { ProductComparisonBar } from '../components/ProductComparisonBar';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '../contexts/NotificationContext';

const meta: Meta<typeof ProductComparisonBar> = {
  title: 'Components/UI/ProductComparisonBar',
  component: ProductComparisonBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NotificationProvider>
        <MemoryRouter>
            <Story />
        </MemoryRouter>
      </NotificationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductComparisonBar>;

export const Default: Story = {
  decorators: [
    (Story) => {
      localStorage.setItem('productComparison', JSON.stringify([
        { id: 1, name: 'iPhone 13' },
        { id: 2, name: 'Samsung S22' }
      ]));
      return <Story />;
    }
  ]
};

export const Empty: Story = {
    decorators: [
        (Story) => {
          localStorage.setItem('productComparison', '[]');
          return <Story />;
        }
      ]
};