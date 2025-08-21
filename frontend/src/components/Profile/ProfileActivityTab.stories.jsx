
import React from 'react';
import ProfileActivityTab from '@components/Profile/ProfileActivityTab';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Profile/ProfileActivityTab',
  component: ProfileActivityTab,
  argTypes: {
    userId: {
      control: {
        type: 'number',
      },
    },
  },
};

const Template = (args) => <ProfileActivityTab {...args} />;

export const Default = Template.bind({});
Default.args = {
  userId: 1, // Assuming a user with ID 1 exists for fetching logs
};

export const NoUser = Template.bind({});
NoUser.args = {
  userId: null,
};
