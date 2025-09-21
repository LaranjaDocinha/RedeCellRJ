import type { Meta, StoryObj } from '@storybook/react';
import { ImageUpload } from '../components/ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Common/ImageUpload',
  component: ImageUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onImageUpload: {
      action: 'image uploaded',
      description: 'Callback when an image is successfully uploaded',
    },
    currentImageUrl: {
      control: 'text',
      description: 'URL of the currently displayed image',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageUpload>;

export const Default: Story = {
  args: {
    onImageUpload: (url) => console.log('Uploaded URL:', url),
  },
};

export const WithExistingImage: Story = {
  args: {
    onImageUpload: (url) => console.log('Uploaded URL:', url),
    currentImageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Existing+Image',
  },
};
