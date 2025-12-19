import type { Meta, StoryObj } from '@storybook/react';
import DashboardWidget from '../components/Dashboard/DashboardWidget';
import { Typography } from '@mui/material';

const meta: Meta<typeof DashboardWidget> = {
  title: 'Dashboard/Wrappers/DashboardWidget',
  component: DashboardWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardWidget>;

export const Default: Story = {
  args: {
    id: 'widget-1',
    title: 'Sales Overview',
    children: <Typography>Content of the widget goes here.</Typography>,
    isSortable: false,
  },
};

export const Sortable: Story = {
  args: {
    id: 'widget-2',
    title: 'Sortable Widget',
    children: <Typography>Try dragging this (needs DndContext wrapper in real usage).</Typography>,
    isSortable: true,
  },
};
