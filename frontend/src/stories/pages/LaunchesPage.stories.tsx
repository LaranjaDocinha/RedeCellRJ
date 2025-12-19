import type { Meta, StoryObj } from '@storybook/react';
import LaunchesPage from '../../pages/LaunchesPage';

const meta = {
  title: 'Pages/LaunchesPage',
  component: LaunchesPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LaunchesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
