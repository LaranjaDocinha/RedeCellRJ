import type { Meta, StoryObj } from '@storybook/react';
import { FavoriteButton } from '../components/FavoriteButton';

const meta = {
  title: 'Components/FavoriteButton',
  component: FavoriteButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isFavorited: { control: 'boolean' },
    onToggle: { action: 'toggled' },
  }
} satisfies Meta<typeof FavoriteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isFavorited: false,
  },
};

export const Favorited: Story = {
    args: {
      isFavorited: true,
    },
  };