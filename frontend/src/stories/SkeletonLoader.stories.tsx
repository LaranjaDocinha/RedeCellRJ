import type { Meta, StoryObj } from '@storybook/react';
import SkeletonLoader from '../components/SkeletonLoader';
import { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        surfaceVariant: '#E0E0E0',
    },
    borderRadius: {
        medium: '4px',
        full: '9999px',
    }
};

const meta: Meta<typeof SkeletonLoader> = {
  title: 'Components/UI/SkeletonLoader',
  component: SkeletonLoader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <ThemeProvider theme={theme}>
            <Story />
        </ThemeProvider>
    )
]
};

export default meta;
type Story = StoryObj<typeof SkeletonLoader>;

export const Rect: Story = {
  args: {
    variant: 'rect',
    width: '100%',
    height: '200px',
  },
};

export const Text: Story = {
    args: {
      variant: 'text',
      width: '80%',
      height: '20px',
    },
  };

export const Circle: Story = {
    args: {
      variant: 'circle',
      width: '50px',
      height: '50px',
    },
  };
