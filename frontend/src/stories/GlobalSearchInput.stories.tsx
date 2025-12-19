import type { Meta, StoryObj } from '@storybook/react';
import GlobalSearchInput from '../components/GlobalSearchInput';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

const mockSuggestions = ['iPhone 13', 'iPhone 14', 'iPad Air'];

const meta: Meta<typeof GlobalSearchInput> = {
  title: 'Components/Navigation/GlobalSearchInput',
  component: GlobalSearchInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSuggestions),
        })
      ) as any;

      return (
        <AuthProvider>
          <NotificationProvider>
            <Story />
          </NotificationProvider>
        </AuthProvider>
      );
    },
  ],
  args: {
    onSearchSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GlobalSearchInput>;

export const Default: Story = {};
