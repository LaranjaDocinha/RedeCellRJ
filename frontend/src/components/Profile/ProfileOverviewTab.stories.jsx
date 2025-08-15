
import React from 'react';
import ProfileOverviewTab from './ProfileOverviewTab';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Profile/ProfileOverviewTab',
  component: ProfileOverviewTab,
  argTypes: {
    user: {
      control: {
        type: 'object',
      },
    },
    onProfileUpdate: {
      action: 'profile updated',
    },
  },
};

const Template = (args) => <ProfileOverviewTab {...args} />;

export const Default = Template.bind({});
Default.args = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone_number: '11987654321',
    job_title: 'Software Engineer',
    bio: 'Passionate about building great software and clean code.',
  },
  onProfileUpdate: action('Profile Overview Updated'),
};

export const EmptyUser = Template.bind({});
EmptyUser.args = {
  user: null,
  onProfileUpdate: action('Profile Overview Updated'),
};
