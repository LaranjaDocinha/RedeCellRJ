import type { Meta, StoryObj } from '@storybook/react';
import UserDashboardPage from '../../pages/UserDashboardPage';

const meta = {
  title: 'Pages/UserDashboardPage',
  component: UserDashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserDashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
