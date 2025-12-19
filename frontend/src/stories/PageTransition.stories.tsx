import type { Meta, StoryObj } from '@storybook/react';
import PageTransition from '../components/PageTransition';
import { AnimationPreferenceProvider } from '../contexts/AnimationPreferenceContext';

const meta: Meta<typeof PageTransition> = {
  title: 'Components/Animation/PageTransition',
  component: PageTransition,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AnimationPreferenceProvider>
        <div style={{ border: '1px solid #ccc', height: '200px', overflow: 'hidden' }}>
            <Story />
        </div>
      </AnimationPreferenceProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PageTransition>;

export const Default: Story = {
  args: {
    children: (
        <div style={{ background: '#f0f0f0', height: '100%', padding: '20px' }}>
            <h1>Page Content</h1>
            <p>This content animates in.</p>
        </div>
    ),
  },
};
