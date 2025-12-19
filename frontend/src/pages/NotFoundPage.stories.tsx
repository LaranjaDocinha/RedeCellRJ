import type { Meta, StoryObj } from '@storybook/react';
import NotFoundPage from './NotFoundPage';
import { BrowserRouter } from 'react-router-dom'; // Necessário para Link

const meta: Meta<typeof NotFoundPage> = {
  title: 'Pages/NotFoundPage',
  component: NotFoundPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};