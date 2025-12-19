import type { Meta, StoryObj } from '@storybook/react';
import CartDisplay from '../components/Cart/CartDisplay';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';

// Mocking CartProvider state would require more complex setup or a specific MockCartProvider.
// For now, we wrap it in the real provider. To show items, we'd need to pre-populate or mock the context value directly.
// Since CartProvider usually doesn't take initial state as prop in simple implementations, we'll show empty state primarily
// or assume we can inject state if the context allows.

const meta: Meta<typeof CartDisplay> = {
  title: 'Components/Cart/CartDisplay',
  component: CartDisplay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <AuthProvider>
            <CartProvider>
                <Story />
            </CartProvider>
        </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartDisplay>;

export const Empty: Story = {};

// To truly test "WithItems", we'd need to mock the useCart hook return value.
// Since we can't easily do that without rewriting the component to accept context as prop or using a library,
// we'll stick to the integration test style here.
