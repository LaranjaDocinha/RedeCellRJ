import type { Meta, StoryObj } from '@storybook/react';
import DealsPage from '../../pages/DealsPage';

const meta = {
  title: 'Pages/DealsPage',
  component: DealsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DealsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
