import type { Meta, StoryObj } from '@storybook/react';
import GuidedTour from '../components/GuidedTour';
import { AuthProvider } from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof GuidedTour> = {
  title: 'Components/Utils/GuidedTour',
  component: GuidedTour,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
            <div style={{ padding: 20 }}>
                <h1 id="tour-step-1">Welcome</h1>
                <p>This is a test page.</p>
                <button id="tour-step-2">Click Me</button>
                <Story />
            </div>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GuidedTour>;

export const Default: Story = {
  args: {
    tourKey: 'testTour',
    steps: [
      {
        element: '#tour-step-1',
        intro: 'This is the title.',
      },
      {
        element: '#tour-step-2',
        intro: 'This is a button.',
      },
    ],
  },
  play: async () => {
      // Mock localStorage to ensure tour runs
      localStorage.removeItem('testTour');
  }
};
