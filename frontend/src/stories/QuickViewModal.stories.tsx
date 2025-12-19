import type { Meta, StoryObj } from '@storybook/react';
import { QuickViewModal } from '../components/QuickViewModal';
import { fn } from '@storybook/test';

// Mock hook module if needed, but since we can't easily, we'll assume the component handles undefined hook nicely OR we rely on args.
// Actually, `useProduct` is likely imported. We can't mock imports easily here.
// But we can check if `useProduct` uses `react-query` or context.
// If it uses `react-query`, we can mock the query client response.

// Assuming `useProduct` uses React Query or similar context.
// Let's create a mock context or just try to render.
// The component calls `useProduct(productId)`.
// We can try to mock the module `../hooks/useProduct` via `jest.mock` in `setupTests` or similar, but here in storybook file it's tricky.
// Standard Storybook approach for hooks is often to provide a decorator that mocks the context the hook relies on.
// If the hook is self-contained (fetching inside), we mock `fetch`.

const mockProduct = {
  id: 1,
  name: 'iPhone 13 128GB',
  price: 4500.00,
  description: 'O iPhone 13 traz um sistema de câmera dupla avançado...',
  variations: [
    { id: 101, color: 'Midnight', price: 4500.00, stock_quantity: 20, image_url: 'https://via.placeholder.com/300/000000' },
  ],
};

const meta: Meta<typeof QuickViewModal> = {
  title: 'Components/Modals/QuickViewModal',
  component: QuickViewModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
  // To verify: Does `useProduct` use `fetch`? If so, this mock works.
  decorators: [
    (Story) => {
        // Mock fetch if the hook uses it directly
        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockProduct),
            })
          ) as any;
        return <Story />;
    }
  ]
};

export default meta;
type Story = StoryObj<typeof QuickViewModal>;

export const Open: Story = {
  args: {
    open: true,
    productId: '1',
  },
};

export const Closed: Story = {
  args: {
    open: false,
    productId: null,
  },
};
