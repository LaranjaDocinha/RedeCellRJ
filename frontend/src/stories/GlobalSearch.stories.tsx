import type { Meta, StoryObj } from '@storybook/react';
import GlobalSearch from '../components/GlobalSearch/GlobalSearch';
import { MemoryRouter } from 'react-router-dom';
import { AnimationPreferenceProvider } from '../contexts/AnimationPreferenceContext';

const mockResults = {
  products: [
    { id: '1', name: 'iPhone 13', imageUrl: 'https://via.placeholder.com/32' },
    { id: '2', name: 'Samsung S22' },
  ],
  customers: [
    { id: '101', name: 'João Silva' },
  ],
};

const meta: Meta<typeof GlobalSearch> = {
  title: 'Components/Navigation/GlobalSearch',
  component: GlobalSearch,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      global.fetch = jest.fn((url) => {
        if (url.toString().includes('search?q=')) {
           return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResults),
          });
        }
        return Promise.resolve({ ok: false });
      }) as any;

      return (
        <MemoryRouter>
          <AnimationPreferenceProvider>
            <Story />
          </AnimationPreferenceProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof GlobalSearch>;

export const Open: Story = {
  args: {
    $isOpen: true,
    onClose: () => {},
  },
};
