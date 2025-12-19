import type { Meta, StoryObj } from '@storybook/react';
import ManageWidgetsModal from '../components/Dashboard/ManageWidgetsModal';
import { fn } from '@storybook/test';

const meta: Meta<typeof ManageWidgetsModal> = {
  title: 'Dashboard/Modals/ManageWidgetsModal',
  component: ManageWidgetsModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onSave: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ManageWidgetsModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    widgets: [
      { id: '1', title: 'Total Sales', visible: true },
      { id: '2', title: 'Recent Orders', visible: false },
      { id: '3', title: 'Top Products', visible: true },
    ],
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    widgets: [],
  },
};
