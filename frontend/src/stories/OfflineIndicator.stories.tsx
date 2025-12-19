import type { Meta, StoryObj } from '@storybook/react';
import OfflineIndicator from '../components/OfflineIndicator';

// Mock Dexie hook
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: any) => {
      // Trying to simulate return based on global var for story control
      // In a real environment we might use a context or more sophisticated mock
      return (global as any).mockPendingCount || 0;
  },
}));

const meta: Meta<typeof OfflineIndicator> = {
  title: 'Components/Utils/OfflineIndicator',
  component: OfflineIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OfflineIndicator>;

export const OnlineSynced: Story = {
    // Should render nothing
};

export const Offline: Story = {
  decorators: [
    (Story) => {
        // Simulate offline
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
        return <Story />;
    }
  ]
};

export const OfflineWithPending: Story = {
    decorators: [
      (Story) => {
          Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
          (global as any).mockPendingCount = 5;
          return <Story />;
      }
    ]
  };

export const OnlineSyncing: Story = {
    decorators: [
      (Story) => {
          Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
          (global as any).mockPendingCount = 3; 
          // Note: component logic might auto-hide if not isSyncing state is true, 
          // but logic says: if isOnline && (pendingCount > 0) -> Show syncing spinner
          return <Story />;
      }
    ]
  };
