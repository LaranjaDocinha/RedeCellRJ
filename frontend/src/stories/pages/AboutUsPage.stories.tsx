import type { Meta, StoryObj } from '@storybook/react';
import AboutUsPage from '../../pages/AboutUsPage';

const meta = {
  title: 'Pages/AboutUsPage',
  component: AboutUsPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutUsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
