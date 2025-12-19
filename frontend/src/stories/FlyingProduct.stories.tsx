import type { Meta, StoryObj } from '@storybook/react';
import { FlyingProduct } from '../components/FlyingProduct';
import { CartAnimationContext } from '../contexts/CartAnimationContext';

// Mock context value
const mockAnimationState = {
  animating: true,
  imageUrl: 'https://via.placeholder.com/150',
  startRect: { top: 100, left: 100, width: 50, height: 50 } as DOMRect,
};

const meta: Meta<typeof FlyingProduct> = {
  title: 'Components/Animation/FlyingProduct',
  component: FlyingProduct,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CartAnimationContext.Provider value={{ 
          animationState: mockAnimationState, 
          startAnimation: () => {}, 
          endAnimation: () => {} 
      }}>
        <div style={{ height: '500px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 400, left: 400, width: 50, height: 50, border: '1px dashed red' }}>Target</div>
            <Story />
        </div>
      </CartAnimationContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FlyingProduct>;

export const Default: Story = {
  args: {
    targetRect: { top: 400, left: 400, width: 50, height: 50 } as DOMRect,
  },
};
