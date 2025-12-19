import type { Meta, StoryObj } from '@storybook/react';
import { RecentlyViewed } from '../components/RecentlyViewed';

// Mock hook module
jest.mock('../hooks/useRecentlyViewed', () => ({
  useRecentlyViewed: () => ({
    recentlyViewedItems: (global as any).mockRecentlyViewedItems || []
  })
}));

const meta: Meta<typeof RecentlyViewed> = {
  title: 'Components/Product/RecentlyViewed',
  component: RecentlyViewed,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RecentlyViewed>;

export const Default: Story = {
  decorators: [
    (Story) => {
      (global as any).mockRecentlyViewedItems = [
        { id: 1, name: 'iPhone 13', imageUrl: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Samsung S22', imageUrl: 'https://via.placeholder.com/150' }
      ];
      return <Story />;
    }
  ]
};

export const Empty: Story = {
    decorators: [
        (Story) => {
          (global as any).mockRecentlyViewedItems = [];
          return <Story />;
        }
      ]
};
