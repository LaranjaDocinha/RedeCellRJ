import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import PhotoUploadComponent from '../components/PhotoUploadComponent';

export default {
  title: 'Tech App/PhotoUploadComponent',
  component: PhotoUploadComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    serviceOrderId: { control: 'number' },
    onUploadSuccess: { action: 'uploadSuccess' },
    onUploadError: { action: 'uploadError' },
    isLoading: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<typeof PhotoUploadComponent> = (args) => <PhotoUploadComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  serviceOrderId: 12345,
  onUploadSuccess: (url, type) => console.log(`Uploaded: ${url}, Type: ${type}`),
  onUploadError: (error) => console.error('Upload failed:', error),
};

export const LoadingState = Template.bind({});
LoadingState.args = {
  ...Default.args,
  isLoading: true,
};
