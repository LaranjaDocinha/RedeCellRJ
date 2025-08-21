
import React from 'react';
import ProfileSecurityTab from '@components/Profile/ProfileSecurityTab';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Profile/ProfileSecurityTab',
  component: ProfileSecurityTab,
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

const Template = (args) => <ProfileSecurityTab {...args} />;

export const Default = Template.bind({});
Default.args = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    two_factor_enabled: false,
  },
  onProfileUpdate: action('Profile Security Updated'),
};

export const TwoFAEnabled = Template.bind({});
TwoFAEnabled.args = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    two_factor_enabled: true,
  },
  onProfileUpdate: action('Profile Security Updated'),
};
