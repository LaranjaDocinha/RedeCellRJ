import type { Meta, StoryObj } from '@storybook/react';
import { AvatarUpload } from '../components/settings/AvatarUpload';
import { fn } from '@storybook/test';

const meta: Meta<typeof AvatarUpload> = {
  title: 'Components/Settings/AvatarUpload',
  component: AvatarUpload,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AvatarUpload>;

export const Default: Story = {
  args: {
    value: '',
  },
};

export const WithImage: Story = {
  args: {
    value: 'https://via.placeholder.com/150',
  },
};
