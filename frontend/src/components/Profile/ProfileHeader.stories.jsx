
import React from 'react';
import ProfileHeader from './ProfileHeader';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Profile/ProfileHeader',
  component: ProfileHeader,
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

const Template = (args) => <ProfileHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    job_title: 'Software Engineer',
    phone_number: '123-456-7890',
    bio: 'Passionate about building great software.',
    avatar_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=JD',
    two_factor_enabled: false,
  },
  onProfileUpdate: action('Profile Updated'),
};

export const NoAvatar = Template.bind({});
NoAvatar.args = {
  ...Default.args,
  user: {
    ...Default.args.user,
    avatar_url: null,
  },
};

export const WithLongName = Template.bind({});
WithLongName.args = {
  ...Default.args,
  user: {
    ...Default.args.user,
    name: 'Very Long Name For A User Profile',
  },
};
