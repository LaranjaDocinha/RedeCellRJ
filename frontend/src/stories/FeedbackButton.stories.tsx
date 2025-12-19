import type { Meta, StoryObj } from '@storybook/react';
import FeedbackButton from '../components/FeedbackButton';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    primaryVariant: '#3700B3',
  },
  shadows: {
    elevation2: '0 3px 6px rgba(0,0,0,0.16)',
  },
};

const meta: Meta<typeof FeedbackButton> = {
  title: 'Components/UI/FeedbackButton',
  component: FeedbackButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FeedbackButton>;

export const Default: Story = {};
