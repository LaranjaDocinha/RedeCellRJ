import type { Meta, StoryObj } from '@storybook/react';
import SupportPage from '../../pages/SupportPage';

const meta = {
  title: 'Pages/SupportPage',
  component: SupportPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
