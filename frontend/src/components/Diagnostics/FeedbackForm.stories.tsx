import type { Meta, StoryObj } from '@storybook/react';
import FeedbackForm from './FeedbackForm';
import { TestWrapper } from '../../test-utils/TestWrapper';

const meta = {
  title: 'Diagnostics/FeedbackForm',
  component: FeedbackForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    nodeId: { control: 'text' },
    sessionId: { control: 'text' },
    onFeedbackSubmitted: { action: 'feedbackSubmitted' },
  },
  decorators: [
    (Story) => (
      <TestWrapper>
        <Story />
      </TestWrapper>
    ),
  ],
} satisfies Meta<typeof FeedbackForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodeId: 'solution123',
    sessionId: 'session456',
  },
};
