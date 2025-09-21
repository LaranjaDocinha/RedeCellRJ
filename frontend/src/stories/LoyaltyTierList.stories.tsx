import type { Meta, StoryObj } from '@storybook/react';
import { LoyaltyTierList } from '../components/LoyaltyTierList';

const meta: Meta<typeof LoyaltyTierList> = {
  title: 'Loyalty/LoyaltyTierList',
  component: LoyaltyTierList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tiers: {
      control: 'object',
      description: 'Array of loyalty tier objects',
    },
    onEdit: {
      action: 'edit tier',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete tier',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoyaltyTierList>;

export const Default: Story = {
  args: {
    tiers: [
      { id: 1, name: 'Bronze', min_points: 0, description: 'Entry level', benefits: { discount: '5%' } },
      { id: 2, name: 'Silver', min_points: 100, description: 'Mid level', benefits: { discount: '10%', free_shipping: true } },
      { id: 3, name: 'Gold', min_points: 500, description: 'Top level', benefits: { discount: '15%', free_shipping: true, priority_support: true } },
    ],
    onEdit: (id) => console.log(`Edit tier ${id}`),
    onDelete: (id) => console.log(`Delete tier ${id}`),
  },
};

export const Empty: Story = {
  args: {
    tiers: [],
    onEdit: (id) => console.log(`Edit tier ${id}`),
    onDelete: (id) => console.log(`Delete tier ${id}`),
  },
};
