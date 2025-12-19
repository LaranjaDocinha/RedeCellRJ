import type { Meta, StoryObj } from '@storybook/react';
import { SettingControl, StructuredSetting } from '../components/settings/SettingControl';
import { fn } from '@storybook/test';

// Mock child components if they are heavy or complex
jest.mock('../components/settings/ColorPicker', () => ({
    ColorPicker: ({ value }: any) => <div style={{width: 30, height: 30, background: value}}></div>
}));
jest.mock('../components/settings/AvatarUpload', () => ({
    AvatarUpload: () => <div>Avatar Upload Mock</div>
}));

const meta: Meta<typeof SettingControl> = {
  title: 'Components/Settings/SettingControl',
  component: SettingControl,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    onReset: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingControl>;

export const TextSetting: Story = {
  args: {
    setting: {
        key: 'siteName',
        value: 'My Store',
        type: 'text',
        label: 'Site Name',
        description: 'The name of your store displayed in the header.'
    },
    initialValue: 'My Store',
  },
};

export const BooleanSetting: Story = {
    args: {
      setting: {
          key: 'enableNotifications',
          value: 'true',
          type: 'boolean',
          label: 'Enable Notifications',
          description: 'Receive alerts for new orders.'
      },
      initialValue: 'false', // Changed state
    },
  };
