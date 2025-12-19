import type { Meta, StoryObj } from '@storybook/react';
import { ReviewForm } from '../components/ReviewForm';

const meta = {
  title: 'Components/ReviewForm',
  component: ReviewForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReviewForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};