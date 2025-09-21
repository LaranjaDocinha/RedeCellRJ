import type { Meta, StoryObj } from '@storybook/react';
import { LanguageSelector } from '../components/LanguageSelector';
import i18n from '../i18n'; // Import the i18n instance

const meta: Meta<typeof LanguageSelector> = {
  title: 'Common/LanguageSelector',
  component: LanguageSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // No specific argTypes needed as it uses i18n context
  },
  decorators: [
    (Story) => {
      // Ensure i18n is initialized for Storybook
      if (!i18n.isInitialized) {
        i18n.init();
      }
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof LanguageSelector>;

export const Default: Story = {
  args: {},
};
