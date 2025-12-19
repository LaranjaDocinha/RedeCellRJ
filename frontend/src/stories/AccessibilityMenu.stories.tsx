import type { Meta, StoryObj } from '@storybook/react';
import AccessibilityMenu from '../components/AccessibilityMenu';

const meta: Meta<typeof AccessibilityMenu> = {
  title: 'Components/Utils/AccessibilityMenu',
  component: AccessibilityMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccessibilityMenu>;

export const Default: Story = {};
