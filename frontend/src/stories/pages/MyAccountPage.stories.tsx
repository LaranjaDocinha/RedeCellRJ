import type { Meta, StoryObj } from '@storybook/react';
import MyAccountPage from '../../pages/MyAccountPage';

const meta = {
  title: 'Pages/MyAccountPage',
  component: MyAccountPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyAccountPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
